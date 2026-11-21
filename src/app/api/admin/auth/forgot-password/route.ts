import { NextResponse } from "next/server";
import { AuthActorType, TokenPurpose } from "@prisma/client";
import prisma from "@/lib/prisma";
import { logAuthEvent } from "@/lib/auth/audit";
import { generateSecureToken, sha256Hex } from "@/lib/auth/crypto";
import { sendPasswordResetEmail } from "@/lib/auth/email";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import {
  getClientIp,
  getUserAgent,
  verifyCsrf,
  verifyTurnstile,
} from "@/lib/auth/request";
import { forgotPasswordSchema } from "@/lib/auth/validation";

const GENERIC_MESSAGE =
  "If an active administrator account matches that email, password reset instructions have been sent.";

export async function POST(request: Request) {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  const csrf = await verifyCsrf(request);
  if (!csrf.ok) {
    return NextResponse.json({ ok: false, error: csrf.error }, { status: 403 });
  }

  const rl = await checkRateLimit(
    `admin_forgot_ip:${ipAddress}`,
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
        { ok: false, error: "Security verification failed. Please try again." },
        { status: 400 }
      );
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, email: true, name: true, isActive: true },
    });

    if (admin && admin.isActive) {
      const rawToken = generateSecureToken(32);
      const tokenHash = sha256Hex(rawToken);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);

      await prisma.$transaction([
        prisma.verificationToken.updateMany({
          where: {
            adminUserId: admin.id,
            actorType: AuthActorType.ADMIN,
            purpose: TokenPurpose.PASSWORD_RESET,
            usedAt: null,
          },
          data: { usedAt: now },
        }),
        prisma.verificationToken.create({
          data: {
            tokenHash,
            purpose: TokenPurpose.PASSWORD_RESET,
            actorType: AuthActorType.ADMIN,
            email: admin.email,
            adminUserId: admin.id,
            expiresAt,
          },
        }),
      ]);

      await sendPasswordResetEmail({
        to: admin.email,
        name: admin.name,
        rawToken,
        portal: "admin",
      });

      await logAuthEvent({
        actorType: AuthActorType.ADMIN,
        adminUserId: admin.id,
        email: admin.email,
        action: "PASSWORD_RESET_REQUESTED",
        success: true,
        ipAddress,
        userAgent,
      });
    } else {
      await logAuthEvent({
        actorType: AuthActorType.ADMIN,
        email: parsed.data.email,
        action: "PASSWORD_RESET_UNKNOWN_EMAIL",
        success: false,
        ipAddress,
        userAgent,
      });
    }

    return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
  } catch (err) {
    console.error("POST /api/admin/auth/forgot-password error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to process password reset request" },
      { status: 500 }
    );
  }
}
