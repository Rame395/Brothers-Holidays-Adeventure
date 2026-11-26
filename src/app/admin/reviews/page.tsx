import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { serializeReviewRow } from "@/lib/review-utils";
import AdminReviewsClient from "@/components/admin/AdminReviewsClient";

async function AdminReviewsGate() {
  const auth = await requireAdmin({ permission: "trips:read" });
  const canWrite = auth.permissions.includes("trips:write");

  const [reviewRows, trips] = await Promise.all([
    prisma.tripReview.findMany({
      include: {
        trip: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ createdAt: "desc" }],
    }),
    prisma.trip.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <AdminReviewsClient
      admin={{
        id: auth.admin.id,
        email: auth.admin.email,
        name: auth.admin.name,
        role: auth.admin.role,
      }}
      permissions={auth.permissions}
      initialReviews={reviewRows.map(serializeReviewRow)}
      trips={trips}
      canWrite={canWrite}
    />
  );
}

export default function AdminReviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-sans text-sm font-medium text-[#3f6e15]">
          Loading Client Reviews...
        </div>
      }
    >
      <AdminReviewsGate />
    </Suspense>
  );
}
