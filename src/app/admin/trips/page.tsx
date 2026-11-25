import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { hasAdminPermission, requireAdmin } from "@/lib/auth/guards";
import AdminTripsClient from "@/components/admin/AdminTripsClient";

async function AdminTripsGate() {
  const auth = await requireAdmin({ permission: "trips:read" });
  const canWrite = hasAdminPermission(auth.admin.role, "trips:write");

  const [trips, countries, categories, regions] = await Promise.all([
    prisma.trip.findMany({
      orderBy: [
        { isFeatured: "desc" },
        { featuredOrder: "asc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        slug: true,
        name: true,
        country: true,
        categories: true,
        region: true,
        area: true,
        image: true,
        days: true,
        maxAltitude: true,
        difficulty: true,
        price: true,
        groupMax: true,
        isPublished: true,
        isFeatured: true,
        featuredOrder: true,
        updatedAt: true,
        _count: {
          select: {
            itinerary: true,
            departures: true,
            bookings: true,
            faqs: true,
            reviews: true,
          },
        },
      },
    }),
    prisma.destinationCountry.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, slug: true, name: true, isActive: true },
    }),
    prisma.tripCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        groupByRegion: true,
        isActive: true,
      },
    }),
    prisma.destinationRegion.findMany({
      orderBy: [{ countrySlug: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        countrySlug: true,
        isActive: true,
      },
    }),
  ]);

  return (
    <AdminTripsClient
      admin={{
        id: auth.admin.id,
        email: auth.admin.email,
        name: auth.admin.name,
        role: auth.admin.role,
      }}
      permissions={auth.permissions}
      canWrite={canWrite}
      initialTrips={trips.map((t) => ({
        ...t,
        updatedAt: t.updatedAt.toISOString(),
      }))}
      countries={countries}
      categories={categories}
      regions={regions}
    />
  );
}

export default function AdminTripsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-sans text-sm font-medium text-[#3f6e15]">
          Loading trips catalog...
        </div>
      }
    >
      <AdminTripsGate />
    </Suspense>
  );
}
