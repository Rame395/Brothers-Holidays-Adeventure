import { NextResponse } from "next/server";
import { AuthActorType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { detectAndAlertNewDevice, logAuthEvent } from "@/lib/auth/audit";
import { decryptSecret } from "@/lib/auth/crypto";
import { requireAdminApi } from "@/lib/auth/guards";
import {
  applyProgressiveDelay,
  checkRateLimit,
  clearRateLimit,
} from "@/lib/auth/rate-limit";
import { getClientIp, getUserAgent } from "@/lib/auth/request";
import { issueAdminTrustedDevice, rotateAdminSession } from "@/lib/auth/session";
import { verifyAndConsumeAdminEmailOtp } from "@/lib/auth/admin-email-otp";
import { verifyAndConsumeBackupCode, verifyTotpToken } from "@/lib/auth/totp";
import { mfaVerifySchema, sanitizeRedirectPath } from "@/lib/auth/validation";

export async function POST(request: Request) {
  const auth = await requireAdminApi(request, { allowPendingMfa: true });
  if (!auth.ok) return auth.response;

  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  const rlKey = `admin_mfa_verify:${ipAddress}:${auth.admin.id}`;
  const rl = await checkRateLimit(rlKey, 10, 15 * 60 * 1000, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: "Too many MFA attempts. Please wait a few minutes and try again.",
      },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const body = (await request.json()) as {
      code?: string;
      useBackupCode?: boolean;
      next?: string;
    };
    const parsed = mfaVerifySchema.safeParse(body);
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
        mfaVerifiedAt: true,
      },
    });

    if (!adminRow) {
      return NextResponse.json(
        { ok: false, error: "Invalid verification code" },
        { status: 401 }
      );
    }

    const cleanCode = parsed.data.code.replace(/\s+/g, "");
    let verified = false;
    let methodUsed: "email_otp" | "totp" | "backup_code" = "email_otp";

    if (!parsed.data.useBackupCode) {
      verified = await verifyAndConsumeAdminEmailOtp(adminRow.id, cleanCode);
    }

    if (!verified && adminRow.mfaEnabled && adminRow.mfaSecretEncrypted) {
      const shouldTryBackup =
        parsed.data.useBackupCode || !/^\d{6}$/.test(cleanCode);

      if (!shouldTryBackup) {
        methodUsed = "totp";
        const secretBase32 = decryptSecret(adminRow.mfaSecretEncrypted);
        verified = verifyTotpToken(secretBase32, cleanCode);
      } else {
        methodUsed = "backup_code";
        verified = await verifyAndConsumeBackupCode(
          "ADMIN",
          adminRow.id,
          parsed.data.code
        );
      }
    }

    if (!verified) {
      await applyProgressiveDelay(2);
      await logAuthEvent({
        actorType: AuthActorType.ADMIN,
        adminUserId: adminRow.id,
        email: adminRow.email,
        action: "MFA_VERIFY_FAILED",
        success: false,
        ipAddress,
        userAgent,
        metadata: { methodUsed },
      });
      return NextResponse.json(
        { ok: false, error: "Invalid verification code" },
        { status: 401 }
      );
    }

    await clearRateLimit(rlKey);

    await prisma.adminUser.update({
      where: { id: adminRow.id },
      data: { lastLoginAt: new Date() },
    });

    await rotateAdminSession({
      oldSessionId: auth.sessionId,
      adminUserId: adminRow.id,
      mfaVerified: true,
      ipAddress,
      userAgent,
    });

    if (parsed.data.rememberDevice) {
      await issueAdminTrustedDevice({
        adminUserId: adminRow.id,
        passwordChangedAt: adminRow.passwordChangedAt,
        mfaVerifiedAt: adminRow.mfaVerifiedAt,
      });
    }

    await detectAndAlertNewDevice({
      actorType: "ADMIN",
      userId: adminRow.id,
      email: adminRow.email,
      name: adminRow.name,
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
      metadata: { methodUsed, rememberDevice: parsed.data.rememberDevice },
    });

    const redirectTo = sanitizeRedirectPath(
      body.next,
      ["/admin"],
      "/admin"
    );

    return NextResponse.json({
      ok: true,
      redirectTo,
      usedBackupCode: methodUsed === "backup_code",
    });
  } catch (err) {
    console.error("POST /api/admin/auth/mfa/verify error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to verify MFA code right now" },
      { status: 500 }
    );
  }
}
