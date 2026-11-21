import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireCustomerApi } from "@/lib/auth/guards";
import { listCustomerSessions } from "@/lib/auth/session";

export async function GET(request: Request) {
  const auth = await requireCustomerApi(request);
  if (!auth.ok) return auth.response;

  const [bookings, inquiries, sessions] = await Promise.all([
    prisma.booking.findMany({
      where: { customerId: auth.customer.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        reference: true,
        tripSlug: true,
        tripName: true,
        departureDate: true,
        isCustomDate: true,
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
        id: true,
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
    listCustomerSessions(auth.customer.id, auth.sessionId),
  ]);

  return NextResponse.json({
    ok: true,
    customer: auth.customer,
    bookings,
    inquiries,
    sessions,
  });
}
