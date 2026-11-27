import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/guards";
import { revalidateReviews } from "@/lib/admin-cache";
import {
  parseReviewDateInput,
  patchReviewSchema,
  serializeReviewRow,
} from "@/lib/review-utils";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi(request, { permission: "trips:write" });
  if (!auth.ok) return auth.response;

  try {
    const { id } = await context.params;
    const existing = await prisma.tripReview.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Review not found." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = patchReviewSchema.safeParse(body);
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
    let nextTripId = existing.tripId;
    let nextTripName = d.tripName !== undefined ? d.tripName : existing.tripName;

    if (d.tripId !== undefined) {
      if (d.tripId === null) {
        nextTripId = null;
      } else {
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
        nextTripId = trip.id;
        if (d.tripName === undefined && !nextTripName) {
          nextTripName = trip.name;
        }
      }
    }

    const updated = await prisma.tripReview.update({
      where: { id },
      data: {
        ...(d.authorName !== undefined ? { authorName: d.authorName } : {}),
        ...(d.authorCountry !== undefined
          ? { authorCountry: d.authorCountry }
          : {}),
        ...(d.avatarUrl !== undefined ? { avatarUrl: d.avatarUrl } : {}),
        ...(d.rating !== undefined ? { rating: d.rating } : {}),
        ...(d.title !== undefined ? { title: d.title } : {}),
        ...(d.comment !== undefined ? { comment: d.comment } : {}),
        ...(d.source !== undefined ? { source: d.source } : {}),
        ...(d.tripId !== undefined ? { tripId: nextTripId } : {}),
        ...(nextTripName !== existing.tripName
          ? { tripName: nextTripName }
          : {}),
        ...(d.tripDate !== undefined
          ? { tripDate: parseReviewDateInput(d.tripDate) }
          : {}),
        ...(d.verified !== undefined ? { verified: d.verified } : {}),
        ...(d.isPublished !== undefined ? { isPublished: d.isPublished } : {}),
        ...(d.showOnHome !== undefined ? { showOnHome: d.showOnHome } : {}),
      },
      include: {
        trip: { select: { id: true, name: true, slug: true } },
      },
    });

    revalidateReviews();

    return NextResponse.json({
      ok: true,
      review: serializeReviewRow(updated),
    });
  } catch (err) {
    console.error("PATCH /api/admin/reviews/[id] failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not update review." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi(request, { permission: "trips:write" });
  if (!auth.ok) return auth.response;

  try {
    const { id } = await context.params;
    const existing = await prisma.tripReview.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Review not found." },
        { status: 404 }
      );
    }

    await prisma.tripReview.delete({ where: { id } });
    revalidateReviews();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/reviews/[id] failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not delete review." },
      { status: 500 }
    );
  }
}
