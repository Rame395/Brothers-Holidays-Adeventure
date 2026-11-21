import { NextResponse } from "next/server";
import { AuthActorType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { detectAndAlertNewDevice, logAuthEvent } from "@/lib/auth/audit";
import { decryptSecret } from "@/lib/auth/crypto";
import { requireCustomerApi } from "@/lib/auth/guards";
import {
  applyProgressiveDelay,
  checkRateLimit,
  clearRateLimit,
} from "@/lib/auth/rate-limit";
import { getClientIp, getUserAgent } from "@/lib/auth/request";
import { rotateCustomerSession } from "@/lib/auth/session";
import { verifyAndConsumeBackupCode, verifyTotpToken } from "@/lib/auth/totp";
import { mfaVerifySchema, sanitizeRedirectPath } from "@/lib/auth/validation";

export async function POST(request: Request) {
  const auth = await requireCustomerApi(request, { allowPendingMfa: true });
  if (!auth.ok) return auth.response;

  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  const rlKey = `cust_mfa_verify:${ipAddress}:${auth.customer.id}`;
  const rl = await checkRateLimit(rlKey, 10, 15 * 60 * 1000, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please wait and try again." },
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

    if (!row || !row.mfaEnabled || !row.mfaSecretEncrypted) {
      return NextResponse.json(
        { ok: false, error: "MFA is not active on this account" },
        { status: 400 }
      );
    }

    const cleanCode = parsed.data.code.replace(/\s+/g, "");
    const shouldTryBackup =
      parsed.data.useBackupCode || !/^\d{6}$/.test(cleanCode);

    let verified = false;
    let methodUsed: "totp" | "backup_code" = "totp";

    if (!shouldTryBackup) {
      const secretBase32 = decryptSecret(row.mfaSecretEncrypted);
      verified = verifyTotpToken(secretBase32, cleanCode);
    } else {
      methodUsed = "backup_code";
      verified = await verifyAndConsumeBackupCode(
        "CUSTOMER",
        row.id,
        parsed.data.code
      );
    }

    if (!verified) {
      await applyProgressiveDelay(2);
      await logAuthEvent({
        actorType: AuthActorType.CUSTOMER,
        customerId: row.id,
        email: row.email,
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

    await prisma.customer.update({
      where: { id: row.id },
      data: { lastLoginAt: new Date() },
    });

    await rotateCustomerSession({
      oldSessionId: auth.sessionId,
      customerId: row.id,
      mfaVerified: true,
      ipAddress,
      userAgent,
    });

    await detectAndAlertNewDevice({
      actorType: "CUSTOMER",
      userId: row.id,
      email: row.email,
      name: row.fullName,
      ipAddress,
      userAgent,
    });

    await logAuthEvent({
      actorType: AuthActorType.CUSTOMER,
      customerId: row.id,
      email: row.email,
      action: "LOGIN_SUCCESS",
      success: true,
      ipAddress,
      userAgent,
      metadata: { methodUsed },
    });

    const redirectTo = sanitizeRedirectPath(
      body.next,
      ["/account", "/destinations", "/treks"],
      "/account"
    );

    return NextResponse.json({
      ok: true,
      redirectTo,
      usedBackupCode: methodUsed === "backup_code",
    });
  } catch (err) {
    console.error("POST /api/auth/mfa/verify error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to verify MFA code right now" },
      { status: 500 }
    );
  }
}
