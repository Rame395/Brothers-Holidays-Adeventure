import { NextResponse } from "next/server";
import { AuthActorType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { logAuthEvent } from "@/lib/auth/audit";
import { verifyPassword } from "@/lib/auth/crypto";
import { sendSecurityAlertEmail } from "@/lib/auth/email";
import { requireCustomerApi } from "@/lib/auth/guards";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp, getUserAgent } from "@/lib/auth/request";

export async function POST(request: Request) {
  const auth = await requireCustomerApi(request);
  if (!auth.ok) return auth.response;

  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  const rl = await checkRateLimit(
    `cust_mfa_disable:${auth.customer.id}`,
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
    const body = (await request.json().catch(() => ({}))) as {
      password?: string;
    };

    const row = await prisma.customer.findUnique({
      where: { id: auth.customer.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        passwordHash: true,
        mfaEnabled: true,
      },
    });

    if (!row || !row.mfaEnabled) {
      return NextResponse.json(
        { ok: false, error: "Two-factor authentication is not enabled" },
        { status: 400 }
      );
    }

    if (row.passwordHash) {
      if (!body.password) {
        return NextResponse.json(
          {
            ok: false,
            error: "Enter your passphrase to disable two-factor authentication",
          },
          { status: 400 }
        );
      }
      const check = await verifyPassword(body.password, row.passwordHash);
      if (!check.valid) {
        return NextResponse.json(
          { ok: false, error: "Passphrase is incorrect" },
          { status: 400 }
        );
      }
    }

    await prisma.$transaction([
      prisma.customer.update({
        where: { id: row.id },
        data: {
          mfaEnabled: false,
          mfaSecretEncrypted: null,
          mfaVerifiedAt: null,
        },
      }),
      prisma.mfaBackupCode.deleteMany({
        where: { actorType: AuthActorType.CUSTOMER, customerId: row.id },
      }),
    ]);

    await logAuthEvent({
      actorType: AuthActorType.CUSTOMER,
      customerId: row.id,
      email: row.email,
      action: "MFA_DISABLED",
      success: true,
      ipAddress,
      userAgent,
    });

    await sendSecurityAlertEmail({
      to: row.email,
      name: row.fullName,
      eventTitle: "Two-Factor Authentication Disabled",
      details:
        "TOTP authenticator MFA has been removed from your account.",
    });

    return NextResponse.json({
      ok: true,
      message: "Two-factor authentication has been disabled.",
    });
  } catch (err) {
    console.error("POST /api/auth/mfa/disable error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to disable two-factor authentication" },
      { status: 500 }
    );
  }
}
