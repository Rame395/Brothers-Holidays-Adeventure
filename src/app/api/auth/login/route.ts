import { NextResponse } from "next/server";
import { AuthActorType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { detectAndAlertNewDevice, logAuthEvent } from "@/lib/auth/audit";
import {
  hashPassword,
  verifyDummyPassword,
  verifyPassword,
} from "@/lib/auth/crypto";
import {
  applyProgressiveDelay,
  checkRateLimit,
  clearRateLimit,
  LOCKOUT_DURATION_MS,
  MAX_FAILED_LOGINS,
} from "@/lib/auth/rate-limit";
import {
  getClientIp,
  getUserAgent,
  verifyCsrf,
  verifyTurnstile,
} from "@/lib/auth/request";
import { createCustomerSession } from "@/lib/auth/session";
import { customerLoginSchema, sanitizeRedirectPath } from "@/lib/auth/validation";

const GENERIC_LOGIN_ERROR = "Invalid email or password";

export async function POST(request: Request) {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  const csrf = await verifyCsrf(request);
  if (!csrf.ok) {
    return NextResponse.json({ ok: false, error: csrf.error }, { status: 403 });
  }

  const rlKey = `customer_login_ip:${ipAddress}`;
  const rl = await checkRateLimit(rlKey, 20, 15 * 60 * 1000, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: "Too many sign-in attempts. Please wait a few minutes and try again.",
      },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      turnstileToken?: string;
      next?: string;
    };
    const parsed = customerLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: GENERIC_LOGIN_ERROR },
        { status: 401 }
      );
    }

    const { email, password, turnstileToken } = parsed.data;
    const turnstileOk = await verifyTurnstile(turnstileToken, ipAddress);
    if (!turnstileOk) {
      return NextResponse.json(
        { ok: false, error: "Security verification failed. Please try again." },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        passwordHash: true,
        emailVerifiedAt: true,
        isActive: true,
        deletedAt: true,
        mfaEnabled: true,
        failedLoginAttempts: true,
        lockedUntil: true,
      },
    });

    if (
      !customer ||
      customer.deletedAt ||
      !customer.isActive ||
      !customer.passwordHash ||
      !customer.emailVerifiedAt
    ) {
      await verifyDummyPassword(password);
      await logAuthEvent({
        actorType: AuthActorType.CUSTOMER,
        customerId: customer?.id ?? null,
        email,
        action: "LOGIN_FAILED",
        success: false,
        ipAddress,
        userAgent,
        metadata: {
          reason: !customer
            ? "not_found"
            : !customer.passwordHash
            ? "no_password"
            : !customer.emailVerifiedAt
            ? "unverified"
            : "inactive",
        },
      });
      return NextResponse.json(
        { ok: false, error: GENERIC_LOGIN_ERROR },
        { status: 401 }
      );
    }

    const now = new Date();
    if (customer.lockedUntil && customer.lockedUntil > now) {
      await verifyDummyPassword(password);
      await applyProgressiveDelay(MAX_FAILED_LOGINS);
      await logAuthEvent({
        actorType: AuthActorType.CUSTOMER,
        customerId: customer.id,
        email: customer.email,
        action: "LOGIN_LOCKED",
        success: false,
        ipAddress,
        userAgent,
      });
      return NextResponse.json(
        { ok: false, error: GENERIC_LOGIN_ERROR },
        { status: 401 }
      );
    }

    const { valid, needsRehash } = await verifyPassword(
      password,
      customer.passwordHash
    );
    if (!valid) {
      const nextFailures = customer.failedLoginAttempts + 1;
      const shouldLock = nextFailures >= MAX_FAILED_LOGINS;
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          failedLoginAttempts: nextFailures,
          lockedUntil: shouldLock
            ? new Date(Date.now() + LOCKOUT_DURATION_MS)
            : null,
        },
      });
      await applyProgressiveDelay(nextFailures);
      await logAuthEvent({
        actorType: AuthActorType.CUSTOMER,
        customerId: customer.id,
        email: customer.email,
        action: shouldLock ? "ACCOUNT_LOCKED" : "LOGIN_FAILED",
        success: false,
        ipAddress,
        userAgent,
        metadata: { attempts: nextFailures },
      });
      return NextResponse.json(
        { ok: false, error: GENERIC_LOGIN_ERROR },
        { status: 401 }
      );
    }

    const upgradedHash = needsRehash ? await hashPassword(password) : undefined;
    const requiresMfa = customer.mfaEnabled;

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        ...(upgradedHash ? { passwordHash: upgradedHash } : {}),
        ...(!requiresMfa ? { lastLoginAt: now } : {}),
      },
    });

    await clearRateLimit(rlKey);

    await createCustomerSession({
      customerId: customer.id,
      mfaVerified: !requiresMfa,
      ipAddress,
      userAgent,
    });

    if (requiresMfa) {
      await logAuthEvent({
        actorType: AuthActorType.CUSTOMER,
        customerId: customer.id,
        email: customer.email,
        action: "LOGIN_PASSWORD_OK_PENDING_MFA",
        success: true,
        ipAddress,
        userAgent,
      });

      return NextResponse.json({
        ok: true,
        nextStep: "mfa_verify",
      });
    }

    await detectAndAlertNewDevice({
      actorType: "CUSTOMER",
      userId: customer.id,
      email: customer.email,
      name: customer.fullName,
      ipAddress,
      userAgent,
    });

    await logAuthEvent({
      actorType: AuthActorType.CUSTOMER,
      customerId: customer.id,
      email: customer.email,
      action: "LOGIN_SUCCESS",
      success: true,
      ipAddress,
      userAgent,
    });

    const redirectTo = sanitizeRedirectPath(
      body.next,
      ["/account", "/destinations", "/treks"],
      "/account"
    );

    return NextResponse.json({
      ok: true,
      nextStep: "done",
      redirectTo,
    });
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to sign in right now" },
      { status: 500 }
    );
  }
}
