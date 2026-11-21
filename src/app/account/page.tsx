import type { Metadata } from "next";
import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { requireCustomer } from "@/lib/auth/guards";
import { listCustomerSessions } from "@/lib/auth/session";
import AccountPortalClient from "@/components/account/AccountPortalClient";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

async function AccountGate() {
  const auth = await requireCustomer();

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

  return (
    <AccountPortalClient
      initialCustomer={{
        id: auth.customer.id,
        fullName: auth.customer.fullName,
        email: auth.customer.email,
        phone: auth.customer.phone,
        whatsapp: auth.customer.whatsapp,
        country: auth.customer.country,
        nationality: auth.customer.nationality,
        mfaEnabled: auth.customer.mfaEnabled,
        hasPassword: auth.customer.hasPassword,
        lastLoginAt: auth.customer.lastLoginAt
          ? auth.customer.lastLoginAt.toISOString()
          : null,
        createdAt: auth.customer.createdAt.toISOString(),
      }}
      initialBookings={bookings.map((b) => ({
        ...b,
        departureDate: b.departureDate ? b.departureDate.toISOString() : null,
        createdAt: b.createdAt.toISOString(),
      }))}
      initialInquiries={inquiries.map((inq) => ({
        ...inq,
        preferredDate: inq.preferredDate
          ? inq.preferredDate.toISOString()
          : null,
        createdAt: inq.createdAt.toISOString(),
      }))}
      initialSessions={sessions.map((s) => ({
        id: s.id,
        deviceLabel: s.deviceLabel,
        ipAddress: s.ipAddress,
        mfaVerified: s.mfaVerified,
        lastActivityAt: s.lastActivityAt.toISOString(),
        createdAt: s.createdAt.toISOString(),
        expiresAt: s.expiresAt.toISOString(),
        isCurrent: s.isCurrent,
      }))}
    />
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-5rem)] bg-[#061116] flex items-center justify-center font-mono text-xs text-white/60">
          Loading traveler account...
        </div>
      }
    >
      <AccountGate />
    </Suspense>
  );
}
