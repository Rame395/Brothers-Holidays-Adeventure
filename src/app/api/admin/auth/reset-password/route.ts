import { NextResponse } from "next/server";
import { AuthActorType, TokenPurpose } from "@prisma/client";
import prisma from "@/lib/prisma";
import { logAuthEvent } from "@/lib/auth/audit";
import { clearAdminSessionCookie } from "@/lib/auth/cookies";
import {
  checkBreachedPassword,
  hashPassword,
  sha256Hex,
} from "@/lib/auth/crypto";
import { sendSecurityAlertEmail } from "@/lib/auth/email";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp, getUserAgent, verifyCsrf } from "@/lib/auth/request";
import { passwordResetSchema } from "@/lib/auth/validation";

export async function POST(request: Request) {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  const csrf = await verifyCsrf(request);
  if (!csrf.ok) {
    return NextResponse.json({ ok: false, error: csrf.error }, { status: 403 });
  }

  const rl = await checkRateLimit(
    `admin_reset_ip:${ipAddress}`,
    10,
    15 * 60 * 1000,
    15 * 60 * 1000
  );
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many reset attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const body = await request.json();
    const parsed = passwordResetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message || "Invalid reset payload",
        },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;
    const pwned = await checkBreachedPassword(password);
    if (pwned.breached) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This passphrase has appeared in a public data breach. Please choose a unique passphrase.",
        },
        { status: 400 }
      );
    }

    const tokenHash = sha256Hex(token);
    const now = new Date();
    const record = await prisma.verificationToken.findUnique({
      where: { tokenHash },
      include: {
        adminUser: {
          select: { id: true, email: true, name: true, isActive: true },
        },
      },
    });

    if (
      !record ||
      record.purpose !== TokenPurpose.PASSWORD_RESET ||
      record.actorType !== AuthActorType.ADMIN ||
      record.usedAt ||
      record.expiresAt <= now ||
      !record.adminUser ||
      !record.adminUser.isActive
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "This reset link is invalid or has expired.",
        },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const admin = record.adminUser;

    const consumed = await prisma.$transaction(async (tx) => {
      const claim = await tx.verificationToken.updateMany({
        where: { id: record.id, usedAt: null },
        data: { usedAt: now },
      });
      if (claim.count !== 1) return false;

      await tx.adminUser.update({
        where: { id: admin.id },
        data: {
          passwordHash,
          passwordChangedAt: now,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });

      await tx.adminSession.updateMany({
        where: { adminUserId: admin.id, revokedAt: null },
        data: { revokedAt: now },
      });

      return true;
    });

    if (!consumed) {
      return NextResponse.json(
        { ok: false, error: "This reset link has already been used." },
        { status: 400 }
      );
    }

    await clearAdminSessionCookie();

    await logAuthEvent({
      actorType: AuthActorType.ADMIN,
      adminUserId: admin.id,
      email: admin.email,
      action: "PASSWORD_RESET_COMPLETED",
      success: true,
      ipAddress,
      userAgent,
    });

    await sendSecurityAlertEmail({
      to: admin.email,
      name: admin.name,
      eventTitle: "Administrator Passphrase Changed",
      details:
        "Your administrator passphrase was reset and all active sessions have been signed out.",
    });

    return NextResponse.json({
      ok: true,
      message: "Passphrase updated. Please sign in with your new credentials.",
    });
  } catch (err) {
    console.error("POST /api/admin/auth/reset-password error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to reset passphrase right now" },
      { status: 500 }
    );
  }
}
