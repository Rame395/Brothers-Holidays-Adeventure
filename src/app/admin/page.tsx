import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { hasAdminPermission, requireAdmin } from "@/lib/auth/guards";
import AdminOverviewClient from "@/components/admin/AdminOverviewClient";

async function AdminOverviewGate() {
  const auth = await requireAdmin();
  const canReadBookings = hasAdminPermission(auth.admin.role, "bookings:read");
  const canReadCrm = hasAdminPermission(auth.admin.role, "crm:read");

  const [
    countriesActive,
    countriesTotal,
    categoriesActive,
    categoriesTotal,
    regionsActive,
    regionsTotal,
    tripsPublished,
    tripsTotal,
    bookingsPending,
    bookingsTotal,
    inquiriesNew,
    inquiriesTotal,
    subscribersActive,
    recentBookings,
    recentInquiries,
  ] = await Promise.all([
    prisma.destinationCountry.count({ where: { isActive: true } }),
    prisma.destinationCountry.count(),
    prisma.tripCategory.count({ where: { isActive: true } }),
    prisma.tripCategory.count(),
    prisma.destinationRegion.count({ where: { isActive: true } }),
    prisma.destinationRegion.count(),
    prisma.trip.count({ where: { isPublished: true } }),
    prisma.trip.count(),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count(),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.inquiry.count(),
    prisma.newsletterSubscriber.count({ where: { status: "ACTIVE" } }),
    canReadBookings
      ? prisma.booking.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            reference: true,
            tripName: true,
            customerName: true,
            travellers: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        })
      : Promise.resolve([]),
    canReadCrm
      ? prisma.inquiry.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            reference: true,
            fullName: true,
            interest: true,
            type: true,
            status: true,
            priority: true,
            createdAt: true,
          },
        })
      : Promise.resolve([]),
  ]);

  return (
    <AdminOverviewClient
      admin={{
        id: auth.admin.id,
        email: auth.admin.email,
        name: auth.admin.name,
        role: auth.admin.role,
      }}
      permissions={auth.permissions}
      stats={{
        countriesActive,
        countriesTotal,
        categoriesActive,
        categoriesTotal,
        regionsActive,
        regionsTotal,
        tripsPublished,
        tripsTotal,
        bookingsPending,
        bookingsTotal,
        inquiriesNew,
        inquiriesTotal,
        subscribersActive,
      }}
      recentBookings={recentBookings.map((b) => ({
        ...b,
        createdAt: b.createdAt.toISOString(),
      }))}
      recentInquiries={recentInquiries.map((inq) => ({
        ...inq,
        createdAt: inq.createdAt.toISOString(),
      }))}
    />
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-sans text-sm font-medium text-[#104b87]">
          Loading Command Portal...
        </div>
      }
    >
      <AdminOverviewGate />
    </Suspense>
  );
}
