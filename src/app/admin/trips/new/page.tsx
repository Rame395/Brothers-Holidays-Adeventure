import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { hasAdminPermission, requireAdmin } from "@/lib/auth/guards";
import AdminTripEditorClient from "@/components/admin/AdminTripEditorClient";

async function AdminNewTripGate() {
  const auth = await requireAdmin({ permission: "trips:write" });
  const canWrite = hasAdminPermission(auth.admin.role, "trips:write");

  const [countries, categories, regions] = await Promise.all([
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
    <AdminTripEditorClient
      admin={{
        id: auth.admin.id,
        email: auth.admin.email,
        name: auth.admin.name,
        role: auth.admin.role,
      }}
      permissions={auth.permissions}
      canWrite={canWrite}
      mode="create"
      initialTrip={null}
      countries={countries}
      categories={categories}
      regions={regions}
    />
  );
}

export default function AdminNewTripPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-sans text-sm font-medium text-[#3f6e15]">
          Loading expedition builder...
        </div>
      }
    >
      <AdminNewTripGate />
    </Suspense>
  );
}
