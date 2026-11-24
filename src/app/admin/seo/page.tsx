import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { getSiteSettings } from "@/lib/data";
import { getSiteUrl } from "@/lib/seo";
import AdminSeoClient from "@/components/admin/AdminSeoClient";

async function AdminSeoGate() {
  const auth = await requireAdmin({ permission: "seo:write" });
  const [settings, pageSeos] = await Promise.all([
    getSiteSettings(),
    prisma.pageSeo.findMany({ orderBy: { routePath: "asc" } }),
  ]);

  return (
    <AdminSeoClient
      admin={{
        id: auth.admin.id,
        email: auth.admin.email,
        name: auth.admin.name,
        role: auth.admin.role,
      }}
      permissions={auth.permissions}
      initialSettings={settings}
      initialPageSeos={pageSeos}
      siteUrl={getSiteUrl()}
    />
  );
}

export default function AdminSeoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-sans text-sm font-medium text-[#104b87]">
          Loading SEO &amp; Search Command Center...
        </div>
      }
    >
      <AdminSeoGate />
    </Suspense>
  );
}
