import { NextResponse } from "next/server";
import { AuthActorType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { logAuthEvent } from "@/lib/auth/audit";
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
import { createAdminSession, hasValidAdminTrustedDevice } from "@/lib/auth/session";
import { adminLoginSchema } from "@/lib/auth/validation";

const GENERIC_LOGIN_ERROR = "Invalid email or password";

export async function POST(request: Request) {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  const csrf = await verifyCsrf(request);
  if (!csrf.ok) {
    return NextResponse.json({ ok: false, error: csrf.error }, { status: 403 });
  }

  const ipLimit = await checkRateLimit(
    `admin_login_ip:${ipAddress}`,
    15,
    15 * 60 * 1000,
    15 * 60 * 1000
  );
  if (!ipLimit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: "Too many sign-in attempts. Please wait a few minutes and try again.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(ipLimit.retryAfterSec) },
      }
    );
  }

  try {
    const body = await request.json();
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: GENERIC_LOGIN_ERROR },
        { status: 401 }
      );
    }

    const { email, password, turnstileToken } = parsed.data;

    const turnstileValid = await verifyTurnstile(turnstileToken, ipAddress);
    if (!turnstileValid) {
      return NextResponse.json(
        { ok: false, error: "Security verification failed. Please try again." },
        { status: 400 }
      );
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        role: true,
        isActive: true,
        mfaEnabled: true,
        mfaRequired: true,
        passwordChangedAt: true,
        mfaVerifiedAt: true,
        failedLoginAttempts: true,
        lockedUntil: true,
      },
    });

    if (!admin || !admin.isActive) {
      await verifyDummyPassword(password);
      await logAuthEvent({
        actorType: AuthActorType.ADMIN,
        email,
        action: "LOGIN_FAILED",
        success: false,
        ipAddress,
        userAgent,
        metadata: { reason: "unknown_or_inactive" },
      });
      return NextResponse.json(
        { ok: false, error: GENERIC_LOGIN_ERROR },
        { status: 401 }
      );
    }

    const now = new Date();
    if (admin.lockedUntil && admin.lockedUntil > now) {
      await verifyDummyPassword(password);
      await applyProgressiveDelay(MAX_FAILED_LOGINS);
      await logAuthEvent({
        actorType: AuthActorType.ADMIN,
        adminUserId: admin.id,
        email: admin.email,
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
      admin.passwordHash
    );
    if (!valid) {
      const nextFailures = admin.failedLoginAttempts + 1;
      const shouldLock = nextFailures >= MAX_FAILED_LOGINS;
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          failedLoginAttempts: nextFailures,
          lockedUntil: shouldLock
            ? new Date(Date.now() + LOCKOUT_DURATION_MS)
            : null,
        },
      });
      await applyProgressiveDelay(nextFailures);
      await logAuthEvent({
        actorType: AuthActorType.ADMIN,
        adminUserId: admin.id,
        email: admin.email,
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
    const mustEnrollMfa = !admin.mfaEnabled && admin.mfaRequired;
    const trustedDevice = admin.mfaEnabled
      ? await hasValidAdminTrustedDevice({
          adminUserId: admin.id,
          passwordChangedAt: admin.passwordChangedAt,
          mfaVerifiedAt: admin.mfaVerifiedAt,
        })
      : false;
    const mfaSatisfied =
      (!admin.mfaEnabled && !admin.mfaRequired) ||
      (admin.mfaEnabled && trustedDevice);
    const nextStep = mustEnrollMfa
      ? "mfa_setup"
      : mfaSatisfied
      ? "done"
      : "mfa_verify";

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        ...(upgradedHash ? { passwordHash: upgradedHash } : {}),
        ...(mfaSatisfied ? { lastLoginAt: now } : {}),
      },
    });

    await clearRateLimit(`admin_login_ip:${ipAddress}`);

    await createAdminSession({
      adminUserId: admin.id,
      mfaVerified: mfaSatisfied,
      ipAddress,
      userAgent,
    });

    await logAuthEvent({
      actorType: AuthActorType.ADMIN,
      adminUserId: admin.id,
      email: admin.email,
      action: mfaSatisfied ? "LOGIN_SUCCESS" : "LOGIN_PASSWORD_OK_PENDING_MFA",
      success: true,
      ipAddress,
      userAgent,
      metadata: {
        upgradedHash: Boolean(upgradedHash),
        trustedDevice,
        nextStep,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        nextStep,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/admin/auth/login error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to process sign-in right now" },
      { status: 500 }
    );
  }
}
