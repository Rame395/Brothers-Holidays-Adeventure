import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { hasAdminPermission, requireAdmin } from "@/lib/auth/guards";
import AdminGuidesClient, {
  type AdminTravelGuideDTO,
} from "@/components/admin/AdminGuidesClient";

async function AdminGuidesGate() {
  const auth = await requireAdmin({ permission: "trips:read" });
  const canWrite = hasAdminPermission(auth.admin.role, "trips:write");

  const rows = await prisma.travelGuide.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const guides: AdminTravelGuideDTO[] = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    subtitle: r.subtitle,
    location: r.location,
    heroImage: r.heroImage,
    content: r.content,
    focusKeyword: r.focusKeyword,
    metaTitle: r.metaTitle,
    metaDescription: r.metaDescription,
    isPublished: r.isPublished,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return (
    <AdminGuidesClient
      admin={{
        id: auth.admin.id,
        email: auth.admin.email,
        name: auth.admin.name,
        role: auth.admin.role,
      }}
      permissions={auth.permissions}
      canWrite={canWrite}
      initialGuides={guides}
    />
  );
}

export default function AdminGuidesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-sans text-sm font-medium text-[#3f6e15]">
          Loading Travel Guides...
        </div>
      }
    >
      <AdminGuidesGate />
    </Suspense>
  );
}
