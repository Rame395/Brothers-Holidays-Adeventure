import { NextResponse } from "next/server";
import { AuthActorType, TokenPurpose } from "@prisma/client";
import prisma from "@/lib/prisma";
import { logAuthEvent } from "@/lib/auth/audit";
import { generateSecureToken, sha256Hex } from "@/lib/auth/crypto";
import { sendVerificationEmail } from "@/lib/auth/email";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import {
  getClientIp,
  getUserAgent,
  verifyCsrf,
  verifyTurnstile,
} from "@/lib/auth/request";
import { forgotPasswordSchema } from "@/lib/auth/validation";

const GENERIC_RESEND_MESSAGE =
  "If a pending registration matches that email, a fresh verification link has been sent.";

export async function POST(request: Request) {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  const csrf = await verifyCsrf(request);
  if (!csrf.ok) {
    return NextResponse.json({ ok: false, error: csrf.error }, { status: 403 });
  }

  const rl = await checkRateLimit(
    `resend_verify_ip:${ipAddress}`,
    5,
    15 * 60 * 1000,
    15 * 60 * 1000
  );
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "Invalid email" },
        { status: 400 }
      );
    }

    const turnstileOk = await verifyTurnstile(
      parsed.data.turnstileToken,
      ipAddress
    );
    if (!turnstileOk) {
      return NextResponse.json(
        { ok: false, error: "Security check failed. Please try again." },
        { status: 400 }
      );
    }

    const email = parsed.data.email;
    const latestPending = await prisma.verificationToken.findFirst({
      where: {
        email,
        actorType: AuthActorType.CUSTOMER,
        purpose: TokenPurpose.EMAIL_VERIFY,
        pendingPasswordHash: { not: null },
      },
      orderBy: { createdAt: "desc" },
    });

    const existingVerified = await prisma.customer.findUnique({
      where: { email },
      select: { emailVerifiedAt: true, passwordHash: true, deletedAt: true },
    });

    if (
      latestPending &&
      latestPending.pendingPasswordHash &&
      !(
        existingVerified &&
        !existingVerified.deletedAt &&
        existingVerified.passwordHash &&
        existingVerified.emailVerifiedAt
      )
    ) {
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
            customerId: latestPending.customerId,
            pendingPasswordHash: latestPending.pendingPasswordHash,
            pendingFullName: latestPending.pendingFullName,
            pendingPhone: latestPending.pendingPhone,
            pendingCountry: latestPending.pendingCountry,
            expiresAt,
          },
        }),
      ]);

      await sendVerificationEmail({
        to: email,
        fullName: latestPending.pendingFullName || "Traveler",
        rawToken,
      });

      await logAuthEvent({
        actorType: AuthActorType.CUSTOMER,
        customerId: latestPending.customerId,
        email,
        action: "EMAIL_VERIFICATION_RESENT",
        success: true,
        ipAddress,
        userAgent,
      });
    }

    return NextResponse.json({
      ok: true,
      message: GENERIC_RESEND_MESSAGE,
    });
  } catch (err) {
    console.error("POST /api/auth/resend-verification error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to resend verification link" },
      { status: 500 }
    );
  }
}
