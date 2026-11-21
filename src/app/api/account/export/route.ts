import { NextResponse } from "next/server";
import { AuthActorType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { logAuthEvent } from "@/lib/auth/audit";
import { requireCustomerApi } from "@/lib/auth/guards";
import { getClientIp, getUserAgent } from "@/lib/auth/request";

export async function GET(request: Request) {
  const auth = await requireCustomerApi(request);
  if (!auth.ok) return auth.response;

  const [profile, bookings, inquiries, auditLogs] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: auth.customer.id },
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
        source: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.booking.findMany({
      where: { customerId: auth.customer.id },
      orderBy: { createdAt: "desc" },
      select: {
        reference: true,
        tripName: true,
        tripSlug: true,
        departureDate: true,
        travellers: true,
        pricePerPerson: true,
        totalAmount: true,
        currency: true,
        status: true,
        paymentStatus: true,
        specialNotes: true,
        createdAt: true,
      },
    }),
    prisma.inquiry.findMany({
      where: { customerId: auth.customer.id },
      orderBy: { createdAt: "desc" },
      select: {
        reference: true,
        type: true,
        status: true,
        interest: true,
        routeName: true,
        preferredDate: true,
        groupSize: true,
        budget: true,
        message: true,
        createdAt: true,
      },
    }),
    prisma.authAuditLog.findMany({
      where: { customerId: auth.customer.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        action: true,
        success: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
      },
    }),
  ]);

  await logAuthEvent({
    actorType: AuthActorType.CUSTOMER,
    customerId: auth.customer.id,
    email: auth.customer.email,
    action: "ACCOUNT_EXPORTED",
    success: true,
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });

  const payload = {
    exportedAt: new Date().toISOString(),
    provider: "BROTHERS Holidays Adventure",
    profile,
    bookings,
    inquiries,
    securityActivity: auditLogs,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="brothers-holidays-account-data.json"',
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
