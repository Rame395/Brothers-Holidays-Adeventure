import { NextResponse } from "next/server";
import { AuthActorType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { logAuthEvent } from "@/lib/auth/audit";
import { clearCustomerSessionCookie } from "@/lib/auth/cookies";
import { verifyPassword } from "@/lib/auth/crypto";
import { requireCustomerApi } from "@/lib/auth/guards";
import { getClientIp, getUserAgent } from "@/lib/auth/request";
import { deleteAccountSchema } from "@/lib/auth/validation";

export async function POST(request: Request) {
  const auth = await requireCustomerApi(request);
  if (!auth.ok) return auth.response;

  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const body = await request.json();
    const parsed = deleteAccountSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message || "Invalid confirmation request",
        },
        { status: 400 }
      );
    }

    if (parsed.data.confirmationText !== "DELETE") {
      return NextResponse.json(
        { ok: false, error: 'Please type "DELETE" to confirm account deletion' },
        { status: 400 }
      );
    }

    const row = await prisma.customer.findUnique({
      where: { id: auth.customer.id },
      select: { id: true, email: true, passwordHash: true, deletedAt: true },
    });

    if (!row || row.deletedAt) {
      return NextResponse.json(
        { ok: false, error: "Account not found" },
        { status: 404 }
      );
    }

    if (row.passwordHash) {
      if (!parsed.data.password) {
        return NextResponse.json(
          { ok: false, error: "Please enter your passphrase to delete your account" },
          { status: 400 }
        );
      }
      const valid = await verifyPassword(parsed.data.password, row.passwordHash);
      if (!valid.valid) {
        return NextResponse.json(
          { ok: false, error: "Passphrase is incorrect" },
          { status: 401 }
        );
      }
    }

    const now = new Date();
    const originalEmail = row.email;

    await prisma.$transaction([
      prisma.customerSession.updateMany({
        where: { customerId: row.id, revokedAt: null },
        data: { revokedAt: now },
      }),
      prisma.verificationToken.deleteMany({
        where: { customerId: row.id },
      }),
      prisma.mfaBackupCode.deleteMany({
        where: { actorType: AuthActorType.CUSTOMER, customerId: row.id },
      }),
      prisma.oAuthAccount.deleteMany({
        where: { customerId: row.id },
      }),
      prisma.customer.update({
        where: { id: row.id },
        data: {
          fullName: "Deleted Traveler",
          email: `deleted+${row.id}@deleted.local`,
          passwordHash: null,
          phone: null,
          whatsapp: null,
          country: null,
          nationality: null,
          notes: null,
          mfaEnabled: false,
          mfaSecretEncrypted: null,
          mfaVerifiedAt: null,
          emailVerifiedAt: null,
          isActive: false,
          deletedAt: now,
        },
      }),
    ]);

    await clearCustomerSessionCookie();

    await logAuthEvent({
      actorType: AuthActorType.CUSTOMER,
      customerId: row.id,
      email: originalEmail,
      action: "ACCOUNT_DELETED",
      success: true,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      ok: true,
      message: "Your account has been permanently deleted and anonymized.",
    });
  } catch (err) {
    console.error("POST /api/account/delete error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to delete account right now" },
      { status: 500 }
    );
  }
}
