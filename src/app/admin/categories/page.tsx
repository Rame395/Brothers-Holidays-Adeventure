import { Suspense } from "react";
import { requireAdmin, hasAdminPermission } from "@/lib/auth/guards";
import { getAdminTaxonomyWithCounts } from "@/lib/admin-taxonomy";
import AdminTaxonomyClient from "@/components/admin/AdminTaxonomyClient";

async function AdminCategoriesGate() {
  const auth = await requireAdmin({ permission: "trips:read" });
  const data = await getAdminTaxonomyWithCounts();
  const canWrite = hasAdminPermission(auth.admin.role, "trips:write");

  return (
    <AdminTaxonomyClient
      admin={{
        id: auth.admin.id,
        email: auth.admin.email,
        name: auth.admin.name,
        role: auth.admin.role,
      }}
      permissions={auth.permissions}
      canWrite={canWrite}
      initialCountries={data.countries}
      initialCategories={data.categories}
      initialRegions={data.regions}
      initialTab="categories"
    />
  );
}

export default function AdminCategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-sans text-sm font-medium text-[#3f6e15]">
          Loading trip categories...
        </div>
      }
    >
      <AdminCategoriesGate />
    </Suspense>
  );
}
