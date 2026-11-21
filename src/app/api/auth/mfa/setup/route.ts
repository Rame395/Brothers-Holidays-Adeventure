import { NextResponse } from "next/server";
import { AuthActorType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { logAuthEvent } from "@/lib/auth/audit";
import { encryptSecret } from "@/lib/auth/crypto";
import { requireCustomerApi } from "@/lib/auth/guards";
import { getClientIp, getUserAgent } from "@/lib/auth/request";
import { createTotpSetup } from "@/lib/auth/totp";

export async function POST(request: Request) {
  const auth = await requireCustomerApi(request);
  if (!auth.ok) return auth.response;

  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  if (auth.customer.mfaEnabled) {
    return NextResponse.json(
      { ok: false, error: "Two-factor authentication is already enabled" },
      { status: 400 }
    );
  }

  try {
    const setup = await createTotpSetup(auth.customer.email, "Traveler");
    const encrypted = encryptSecret(setup.secretBase32);

    await prisma.customer.update({
      where: { id: auth.customer.id },
      data: {
        mfaSecretEncrypted: encrypted,
        mfaEnabled: false,
      },
    });

    await logAuthEvent({
      actorType: AuthActorType.CUSTOMER,
      customerId: auth.customer.id,
      email: auth.customer.email,
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
    console.error("POST /api/auth/mfa/setup error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to initialize MFA setup" },
      { status: 500 }
    );
  }
}
