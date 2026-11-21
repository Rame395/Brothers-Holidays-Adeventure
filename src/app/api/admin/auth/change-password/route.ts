import { NextResponse } from "next/server";
import { AuthActorType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { logAuthEvent } from "@/lib/auth/audit";
import {
  checkBreachedPassword,
  hashPassword,
  verifyPassword,
} from "@/lib/auth/crypto";
import { sendSecurityAlertEmail } from "@/lib/auth/email";
import { requireAdminApi } from "@/lib/auth/guards";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp, getUserAgent } from "@/lib/auth/request";
import {
  revokeAllAdminSessions,
  rotateAdminSession,
} from "@/lib/auth/session";
import { changePasswordSchema } from "@/lib/auth/validation";

export async function POST(request: Request) {
  const auth = await requireAdminApi(request);
  if (!auth.ok) return auth.response;

  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  const rl = await checkRateLimit(
    `admin_chpwd:${auth.admin.id}`,
    8,
    15 * 60 * 1000
  );
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message || "Invalid password input",
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { ok: false, error: "New passphrase must differ from your current password" },
        { status: 400 }
      );
    }

    const adminRow = await prisma.adminUser.findUnique({
      where: { id: auth.admin.id },
      select: { id: true, email: true, name: true, passwordHash: true },
    });
    if (!adminRow) {
      return NextResponse.json(
        { ok: false, error: "Account not found" },
        { status: 404 }
      );
    }

    const currentCheck = await verifyPassword(
      currentPassword,
      adminRow.passwordHash
    );
    if (!currentCheck.valid) {
      await logAuthEvent({
        actorType: AuthActorType.ADMIN,
        adminUserId: adminRow.id,
        email: adminRow.email,
        action: "PASSWORD_CHANGE_FAILED",
        success: false,
        ipAddress,
        userAgent,
      });
      return NextResponse.json(
        { ok: false, error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const pwned = await checkBreachedPassword(newPassword);
    if (pwned.breached) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This passphrase has appeared in a known data breach. Please choose a stronger unique passphrase.",
        },
        { status: 400 }
      );
    }

    const newHash = await hashPassword(newPassword);
    const now = new Date();

    await prisma.adminUser.update({
      where: { id: adminRow.id },
      data: {
        passwordHash: newHash,
        passwordChangedAt: now,
      },
    });

    await revokeAllAdminSessions(adminRow.id, auth.sessionId);
    await rotateAdminSession({
      oldSessionId: auth.sessionId,
      adminUserId: adminRow.id,
      mfaVerified: auth.mfaVerified,
      ipAddress,
      userAgent,
    });

    await logAuthEvent({
      actorType: AuthActorType.ADMIN,
      adminUserId: adminRow.id,
      email: adminRow.email,
      action: "PASSWORD_CHANGED",
      success: true,
      ipAddress,
      userAgent,
    });

    await sendSecurityAlertEmail({
      to: adminRow.email,
      name: adminRow.name,
      eventTitle: "Administrator Passphrase Updated",
      details:
        "Your passphrase was changed. All other active administrator sessions were revoked.",
    });

    return NextResponse.json({
      ok: true,
      message: "Passphrase updated and other sessions revoked.",
    });
  } catch (err) {
    console.error("POST /api/admin/auth/change-password error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to update passphrase right now" },
      { status: 500 }
    );
  }
}
