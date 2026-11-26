import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/guards";
import { getSiteSettings } from "@/lib/data";
import AdminCompanyClient from "@/components/admin/AdminCompanyClient";

async function AdminCompanyGate() {
  const auth = await requireAdmin({ permission: "seo:write" });
  const settings = await getSiteSettings();

  return (
    <AdminCompanyClient
      admin={{
        id: auth.admin.id,
        email: auth.admin.email,
        name: auth.admin.name,
        role: auth.admin.role,
      }}
      permissions={auth.permissions}
      initialSettings={settings}
    />
  );
}

export default function AdminCompanyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-sans text-sm font-medium text-[#3f6e15]">
          Loading Company &amp; Social Settings...
        </div>
      }
    >
      <AdminCompanyGate />
    </Suspense>
  );
}
