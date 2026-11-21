import { NextResponse } from "next/server";
import { AuthActorType, TokenPurpose } from "@prisma/client";
import prisma from "@/lib/prisma";
import { logAuthEvent } from "@/lib/auth/audit";
import {
  checkBreachedPassword,
  generateSecureToken,
  hashPassword,
  sha256Hex,
} from "@/lib/auth/crypto";
import { sendSecurityAlertEmail, sendVerificationEmail } from "@/lib/auth/email";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import {
  getClientIp,
  getUserAgent,
  verifyCsrf,
  verifyTurnstile,
} from "@/lib/auth/request";
import { customerSignupSchema } from "@/lib/auth/validation";

const GENERIC_SIGNUP_MESSAGE =
  "Verification link sent. Please check your inbox (and spam folder) to activate your account.";

export async function POST(request: Request) {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  const csrf = await verifyCsrf(request);
  if (!csrf.ok) {
    return NextResponse.json({ ok: false, error: csrf.error }, { status: 403 });
  }

  const rl = await checkRateLimit(
    `customer_signup_ip:${ipAddress}`,
    10,
    60 * 60 * 1000,
    30 * 60 * 1000
  );
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many signup attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const body = await request.json();
    const parsed = customerSignupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message || "Invalid signup details",
        },
        { status: 400 }
      );
    }

    const { fullName, email, password, phone, country, turnstileToken } =
      parsed.data;

    const turnstileOk = await verifyTurnstile(turnstileToken, ipAddress);
    if (!turnstileOk) {
      return NextResponse.json(
        { ok: false, error: "Security check failed. Please try again." },
        { status: 400 }
      );
    }

    const pwned = await checkBreachedPassword(password);
    if (pwned.breached) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This passphrase has appeared in a known data breach. Please choose a different passphrase.",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.customer.findUnique({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        passwordHash: true,
        emailVerifiedAt: true,
        deletedAt: true,
      },
    });

    // If an active, already-verified account owns this email, do NOT overwrite or leak status.
    if (
      existing &&
      !existing.deletedAt &&
      existing.passwordHash &&
      existing.emailVerifiedAt
    ) {
      await logAuthEvent({
        actorType: AuthActorType.CUSTOMER,
        customerId: existing.id,
        email: existing.email,
        action: "SIGNUP_DUPLICATE_ATTEMPT",
        success: false,
        ipAddress,
        userAgent,
      });

      await sendSecurityAlertEmail({
        to: existing.email,
        name: existing.fullName,
        eventTitle: "Sign-up attempt using your email address",
        details:
          "Someone attempted to register a new account with your email. Your existing account remains protected. If this was you, sign in or use password reset.",
      });

      return NextResponse.json({
        ok: true,
        message: GENERIC_SIGNUP_MESSAGE,
      });
    }

    // Store pending credentials in VerificationToken until mailbox ownership is verified
    // (protects pre-existing guest booking records from hijacking before verification).
    const pendingPasswordHash = await hashPassword(password);
    const rawToken = generateSecureToken(32);
    const tokenHash = sha256Hex(rawToken);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);

    await prisma.$transaction([
      prisma.verificationToken.updateMany({
        where: {
          email,
          actorType: AuthActorType.CUSTOMER,
          purpose: TokenPurpose.EMAIL_VERIFY,
          usedAt: null,
        },
        data: { usedAt: now },
      }),
      prisma.verificationToken.create({
        data: {
          tokenHash,
          purpose: TokenPurpose.EMAIL_VERIFY,
          actorType: AuthActorType.CUSTOMER,
          email,
          customerId: existing && !existing.deletedAt ? existing.id : null,
          pendingPasswordHash,
          pendingFullName: fullName,
          pendingPhone: phone || null,
          pendingCountry: country || null,
          expiresAt,
        },
      }),
    ]);

    await sendVerificationEmail({
      to: email,
      fullName,
      rawToken,
    });

    await logAuthEvent({
      actorType: AuthActorType.CUSTOMER,
      customerId: existing && !existing.deletedAt ? existing.id : null,
      email,
      action: "SIGNUP_VERIFICATION_SENT",
      success: true,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      ok: true,
      message: GENERIC_SIGNUP_MESSAGE,
    });
  } catch (err) {
    console.error("POST /api/auth/signup error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to create account right now" },
      { status: 500 }
    );
  }
}
