import { NextResponse } from "next/server";
import { AuthActorType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { logAuthEvent } from "@/lib/auth/audit";
import { encryptSecret } from "@/lib/auth/crypto";
import { requireAdminApi } from "@/lib/auth/guards";
import { getClientIp, getUserAgent } from "@/lib/auth/request";
import { createTotpSetup } from "@/lib/auth/totp";

export async function POST(request: Request) {
  const auth = await requireAdminApi(request, { allowPendingMfa: true });
  if (!auth.ok) return auth.response;

  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  if (auth.admin.mfaEnabled) {
    return NextResponse.json(
      { ok: false, error: "Multi-factor authentication is already enabled" },
      { status: 400 }
    );
  }

  try {
    const setup = await createTotpSetup(auth.admin.email, "Admin");
    const encrypted = encryptSecret(setup.secretBase32);

    await prisma.adminUser.update({
      where: { id: auth.admin.id },
      data: {
        mfaSecretEncrypted: encrypted,
        mfaEnabled: false,
      },
    });

    await logAuthEvent({
      actorType: AuthActorType.ADMIN,
      adminUserId: auth.admin.id,
      email: auth.admin.email,
      action: "MFA_SETUP_INITIATED",
      success: true,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      ok: true,
      qrDataUrl: setup.qrDataUrl,
      manualKey: setup.secretBase32,
    });
  } catch (err) {
    console.error("POST /api/admin/auth/mfa/setup error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to initialize MFA setup" },
      { status: 500 }
    );
  }
}
