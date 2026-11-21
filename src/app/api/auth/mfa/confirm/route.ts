import { NextResponse } from "next/server";
import { AuthActorType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { logAuthEvent } from "@/lib/auth/audit";
import { decryptSecret } from "@/lib/auth/crypto";
import { sendSecurityAlertEmail } from "@/lib/auth/email";
import { requireCustomerApi } from "@/lib/auth/guards";
import { applyProgressiveDelay, checkRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp, getUserAgent } from "@/lib/auth/request";
import { rotateCustomerSession } from "@/lib/auth/session";
import { replaceBackupCodes, verifyTotpToken } from "@/lib/auth/totp";
import { totpCodeSchema } from "@/lib/auth/validation";

export async function POST(request: Request) {
  const auth = await requireCustomerApi(request);
  if (!auth.ok) return auth.response;

  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  const rl = await checkRateLimit(
    `cust_mfa_confirm:${ipAddress}:${auth.customer.id}`,
    10,
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

    const row = await prisma.customer.findUnique({
      where: { id: auth.customer.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        mfaEnabled: true,
        mfaSecretEncrypted: true,
      },
    });

    if (!row || !row.mfaSecretEncrypted) {
      return NextResponse.json(
        { ok: false, error: "Please generate an authenticator QR code first" },
        { status: 400 }
      );
    }

    if (row.mfaEnabled) {
      return NextResponse.json(
        { ok: false, error: "Two-factor authentication is already enabled" },
        { status: 400 }
      );
    }

    const secretBase32 = decryptSecret(row.mfaSecretEncrypted);
    const valid = verifyTotpToken(secretBase32, parsed.data.code);

    if (!valid) {
      await applyProgressiveDelay(2);
      await logAuthEvent({
        actorType: AuthActorType.CUSTOMER,
        customerId: row.id,
        email: row.email,
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
    await prisma.customer.update({
      where: { id: row.id },
      data: {
        mfaEnabled: true,
        mfaVerifiedAt: now,
      },
    });

    const backupCodes = await replaceBackupCodes("CUSTOMER", row.id);

    await rotateCustomerSession({
      oldSessionId: auth.sessionId,
      customerId: row.id,
      mfaVerified: true,
      ipAddress,
      userAgent,
    });

    await logAuthEvent({
      actorType: AuthActorType.CUSTOMER,
      customerId: row.id,
      email: row.email,
      action: "MFA_ENABLED",
      success: true,
      ipAddress,
      userAgent,
    });

    await sendSecurityAlertEmail({
      to: row.email,
      name: row.fullName,
      eventTitle: "Two-Factor Authentication Enabled",
      details:
        "TOTP authenticator MFA and 10 single-use backup codes are now active on your account.",
    });

    return NextResponse.json({
      ok: true,
      backupCodes,
    });
  } catch (err) {
    console.error("POST /api/auth/mfa/confirm error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to enable two-factor authentication" },
      { status: 500 }
    );
  }
}
