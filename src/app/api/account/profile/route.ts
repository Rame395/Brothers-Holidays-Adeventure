import { NextResponse } from "next/server";
import { AuthActorType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { logAuthEvent } from "@/lib/auth/audit";
import { requireCustomerApi } from "@/lib/auth/guards";
import { getClientIp, getUserAgent } from "@/lib/auth/request";
import { profileUpdateSchema } from "@/lib/auth/validation";

export async function PATCH(request: Request) {
  const auth = await requireCustomerApi(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message || "Invalid profile update",
        },
        { status: 400 }
      );
    }

    const updated = await prisma.customer.update({
      where: { id: auth.customer.id },
      data: {
        fullName: parsed.data.fullName,
        phone: parsed.data.phone || null,
        whatsapp: parsed.data.whatsapp || null,
        country: parsed.data.country || null,
        nationality: parsed.data.nationality || null,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        whatsapp: true,
        country: true,
        nationality: true,
        emailVerifiedAt: true,
        mfaEnabled: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    await logAuthEvent({
      actorType: AuthActorType.CUSTOMER,
      customerId: auth.customer.id,
      email: auth.customer.email,
      action: "PROFILE_UPDATED",
      success: true,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json({
      ok: true,
      customer: {
        ...updated,
        hasPassword: auth.customer.hasPassword,
      },
    });
  } catch (err) {
    console.error("PATCH /api/account/profile error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to update profile right now" },
      { status: 500 }
    );
  }
}
