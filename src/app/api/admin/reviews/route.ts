import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/guards";
import { revalidateReviews } from "@/lib/admin-cache";
import {
  createReviewSchema,
  parseReviewDateInput,
  serializeReviewRow,
} from "@/lib/review-utils";

export async function GET(request: Request) {
  const auth = await requireAdminApi(request, { permission: "trips:read" });
  if (!auth.ok) return auth.response;

  try {
    const rows = await prisma.tripReview.findMany({
      include: {
        trip: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    return NextResponse.json({
      ok: true,
      reviews: rows.map(serializeReviewRow),
    });
  } catch (err) {
    console.error("GET /api/admin/reviews failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not load reviews." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi(request, { permission: "trips:write" });
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message || "Invalid review payload.",
        },
        { status: 400 }
      );
    }

    const d = parsed.data;
    let resolvedTripId: string | null = null;
    let resolvedTripName: string | null = d.tripName ?? null;

    if (d.tripId) {
      const trip = await prisma.trip.findUnique({
        where: { id: d.tripId },
        select: { id: true, name: true },
      });
      if (!trip) {
        return NextResponse.json(
          { ok: false, error: "Selected trip was not found." },
          { status: 400 }
        );
      }
      resolvedTripId = trip.id;
      if (!resolvedTripName) {
        resolvedTripName = trip.name;
      }
    }

    const created = await prisma.tripReview.create({
      data: {
        authorName: d.authorName,
        authorCountry: d.authorCountry ?? null,
        avatarUrl: d.avatarUrl ?? null,
        rating: d.rating,
        title: d.title ?? null,
        comment: d.comment,
        tripId: resolvedTripId,
        tripName: resolvedTripName,
        tripDate: parseReviewDateInput(d.tripDate),
        verified: d.verified,
        isPublished: d.isPublished,
        showOnHome: d.showOnHome,
      },
      include: {
        trip: { select: { id: true, name: true, slug: true } },
      },
    });

    revalidateReviews();

    return NextResponse.json(
      { ok: true, review: serializeReviewRow(created) },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/admin/reviews failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not create review." },
      { status: 500 }
    );
  }
}
