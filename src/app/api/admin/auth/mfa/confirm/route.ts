import { NextResponse } from "next/server";
import { AuthActorType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { logAuthEvent } from "@/lib/auth/audit";
import { decryptSecret } from "@/lib/auth/crypto";
import { sendSecurityAlertEmail } from "@/lib/auth/email";
import { requireAdminApi } from "@/lib/auth/guards";
import { applyProgressiveDelay, checkRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp, getUserAgent } from "@/lib/auth/request";
import { issueAdminTrustedDevice, rotateAdminSession } from "@/lib/auth/session";
import { replaceBackupCodes, verifyTotpToken } from "@/lib/auth/totp";
import { totpCodeSchema } from "@/lib/auth/validation";

export async function POST(request: Request) {
  const auth = await requireAdminApi(request, { allowPendingMfa: true });
  if (!auth.ok) return auth.response;

  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  const rl = await checkRateLimit(
    `admin_mfa_confirm:${ipAddress}:${auth.admin.id}`,
    10,
    15 * 60 * 1000
  );
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const body = await request.json();
    const parsed = totpCodeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message || "Invalid verification code",
        },
        { status: 400 }
      );
    }

    const adminRow = await prisma.adminUser.findUnique({
      where: { id: auth.admin.id },
      select: {
        id: true,
        email: true,
        name: true,
        mfaEnabled: true,
        mfaSecretEncrypted: true,
        passwordChangedAt: true,
      },
    });

    if (!adminRow || !adminRow.mfaSecretEncrypted) {
      return NextResponse.json(
        { ok: false, error: "Please generate a QR setup code first" },
        { status: 400 }
      );
    }

    if (adminRow.mfaEnabled) {
      return NextResponse.json(
        { ok: false, error: "MFA is already enabled" },
        { status: 400 }
      );
    }

    const secretBase32 = decryptSecret(adminRow.mfaSecretEncrypted);
    const valid = verifyTotpToken(secretBase32, parsed.data.code);

    if (!valid) {
      await applyProgressiveDelay(2);
      await logAuthEvent({
        actorType: AuthActorType.ADMIN,
        adminUserId: auth.admin.id,
        email: auth.admin.email,
        action: "MFA_CONFIRM_FAILED",
        success: false,
        ipAddress,
        userAgent,
      });
      return NextResponse.json(
        { ok: false, error: "Invalid 6-digit authenticator code" },
        { status: 400 }
      );
    }

    const now = new Date();
    await prisma.adminUser.update({
      where: { id: adminRow.id },
      data: {
        mfaEnabled: true,
        mfaVerifiedAt: now,
        lastLoginAt: now,
      },
    });

    const backupCodes = await replaceBackupCodes("ADMIN", adminRow.id);

    await rotateAdminSession({
      oldSessionId: auth.sessionId,
      adminUserId: adminRow.id,
      mfaVerified: true,
      ipAddress,
      userAgent,
    });

    await issueAdminTrustedDevice({
      adminUserId: adminRow.id,
      passwordChangedAt: adminRow.passwordChangedAt,
      mfaVerifiedAt: now,
    });

    await logAuthEvent({
      actorType: AuthActorType.ADMIN,
      adminUserId: adminRow.id,
      email: adminRow.email,
      action: "MFA_ENABLED",
      success: true,
      ipAddress,
      userAgent,
    });

    await logAuthEvent({
      actorType: AuthActorType.ADMIN,
      adminUserId: adminRow.id,
      email: adminRow.email,
      action: "LOGIN_SUCCESS",
      success: true,
      ipAddress,
      userAgent,
    });

    await sendSecurityAlertEmail({
      to: adminRow.email,
      name: adminRow.name,
      eventTitle: "Admin Two-Factor Authentication Enabled",
      details:
        "Authenticator app MFA and 10 one-time backup codes are now active on your administrator account.",
    });

    return NextResponse.json({
      ok: true,
      backupCodes,
      redirectTo: "/admin",
    });
  } catch (err) {
    console.error("POST /api/admin/auth/mfa/confirm error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to verify MFA code right now" },
      { status: 500 }
    );
  }
}
