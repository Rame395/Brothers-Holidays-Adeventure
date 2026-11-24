import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/guards";
import { revalidatePublicCatalog, slugify } from "@/lib/admin-cache";
import { tripPatchSchema } from "@/lib/admin-trip-schemas";

class DepartureConflictError extends Error {}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi(request, { permission: "trips:read" });
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      itinerary: { orderBy: { dayOrder: "asc" } },
      departures: {
        orderBy: { startDate: "asc" },
        include: {
          _count: { select: { bookings: true } },
        },
      },
      faqs: { orderBy: { sortOrder: "asc" } },
      reviews: { orderBy: { createdAt: "desc" } },
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
  });

  if (!trip) {
    return NextResponse.json(
      { ok: false, error: "Trip not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, trip });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi(request, { permission: "trips:write" });
  if (!auth.ok) return auth.response;

  try {
    const { id } = await context.params;
    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Trip not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = tripPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message || "Invalid trip update payload",
        },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const nextSlug = d.slug !== undefined ? slugify(d.slug) : existing.slug;
    if (!nextSlug) {
      return NextResponse.json(
        { ok: false, error: "Trip slug cannot be empty" },
        { status: 400 }
      );
    }

    if (nextSlug !== existing.slug) {
      const conflict = await prisma.trip.findUnique({
        where: { slug: nextSlug },
        select: { id: true },
      });
      if (conflict) {
        return NextResponse.json(
          { ok: false, error: `Another trip already uses slug "${nextSlug}".` },
          { status: 409 }
        );
      }
    }

    const targetCountry = d.country ?? existing.country;
    if (d.country !== undefined) {
      const countryExists = await prisma.destinationCountry.findUnique({
        where: { slug: targetCountry },
        select: { id: true },
      });
      if (!countryExists) {
        return NextResponse.json(
          { ok: false, error: `Unknown country "${targetCountry}".` },
          { status: 400 }
        );
      }
    }

    const targetRegion =
      d.region !== undefined ? d.region?.trim() || null : existing.region;
    if (targetRegion) {
      const regionRow = await prisma.destinationRegion.findUnique({
        where: { slug: targetRegion },
        select: { countrySlug: true },
      });
      if (!regionRow) {
        return NextResponse.json(
          { ok: false, error: `Unknown region "${targetRegion}".` },
          { status: 400 }
        );
      }
      if (regionRow.countrySlug !== targetCountry) {
        return NextResponse.json(
          {
            ok: false,
            error: `Region "${targetRegion}" belongs to country "${regionRow.countrySlug}", not "${targetCountry}".`,
          },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.update({
        where: { id },
        data: {
          ...(d.name !== undefined ? { name: d.name } : {}),
          ...(d.slug !== undefined ? { slug: nextSlug } : {}),
          ...(d.country !== undefined ? { country: d.country } : {}),
          ...(d.categories !== undefined
            ? { categories: Array.from(new Set(d.categories)) }
            : {}),
          ...(d.region !== undefined ? { region: targetRegion } : {}),
          ...(d.area !== undefined ? { area: d.area } : {}),
          ...(d.image !== undefined ? { image: d.image } : {}),
          ...(d.gallery !== undefined ? { gallery: d.gallery } : {}),
          ...(d.mapImage !== undefined ? { mapImage: d.mapImage || null } : {}),
          ...(d.videoUrl !== undefined ? { videoUrl: d.videoUrl || null } : {}),
          ...(d.days !== undefined ? { days: d.days } : {}),
          ...(d.maxAltitude !== undefined ? { maxAltitude: d.maxAltitude } : {}),
          ...(d.difficulty !== undefined ? { difficulty: d.difficulty } : {}),
          ...(d.price !== undefined ? { price: d.price } : {}),
          ...(d.priceUsd !== undefined ? { priceUsd: d.priceUsd ?? null } : {}),
          ...(d.groupMax !== undefined ? { groupMax: d.groupMax } : {}),
          ...(d.seasonMonths !== undefined ? { seasonMonths: d.seasonMonths } : {}),
          ...(d.startPoint !== undefined ? { startPoint: d.startPoint } : {}),
          ...(d.endPoint !== undefined ? { endPoint: d.endPoint } : {}),
          ...(d.tagline !== undefined ? { tagline: d.tagline } : {}),
          ...(d.overview !== undefined ? { overview: d.overview } : {}),
          ...(d.itineraryIntro !== undefined
            ? { itineraryIntro: d.itineraryIntro || null }
            : {}),
          ...(d.highlights !== undefined ? { highlights: d.highlights } : {}),
          ...(d.includes !== undefined ? { includes: d.includes } : {}),
          ...(d.excludes !== undefined ? { excludes: d.excludes } : {}),
          ...(d.gearList !== undefined ? { gearList: d.gearList } : {}),
          ...(d.accommodationSummary !== undefined
            ? { accommodationSummary: d.accommodationSummary || null }
            : {}),
          ...(d.mealsSummary !== undefined
            ? { mealsSummary: d.mealsSummary || null }
            : {}),
          ...(d.transportSummary !== undefined
            ? { transportSummary: d.transportSummary || null }
            : {}),
          ...(d.weatherLocation !== undefined
            ? { weatherLocation: d.weatherLocation || null }
            : {}),
          ...(d.weatherLat !== undefined
            ? { weatherLat: d.weatherLat ?? null }
            : {}),
          ...(d.weatherLon !== undefined
            ? { weatherLon: d.weatherLon ?? null }
            : {}),
          ...(d.customSections !== undefined
            ? { customSections: d.customSections }
            : {}),
          ...(d.includeGroups !== undefined
            ? { includeGroups: d.includeGroups }
            : {}),
          ...(d.excludeGroups !== undefined
            ? { excludeGroups: d.excludeGroups }
            : {}),
          ...(d.priceTiers !== undefined ? { priceTiers: d.priceTiers } : {}),
          ...(d.badge !== undefined ? { badge: d.badge || null } : {}),
          ...(d.isPublished !== undefined ? { isPublished: d.isPublished } : {}),
          ...(d.isFeatured !== undefined ? { isFeatured: d.isFeatured } : {}),
          ...(d.featuredOrder !== undefined ? { featuredOrder: d.featuredOrder } : {}),
          ...(d.metaTitle !== undefined ? { metaTitle: d.metaTitle || null } : {}),
          ...(d.metaDescription !== undefined
            ? { metaDescription: d.metaDescription || null }
            : {}),
          ...(d.image !== undefined ? { ogImage: d.image } : {}),
        },
        include: {
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
      });

      if (d.itinerary !== undefined) {
        await tx.tripItineraryDay.deleteMany({ where: { tripId: id } });
        if (d.itinerary.length > 0) {
          await tx.tripItineraryDay.createMany({
            data: d.itinerary.map((day, idx) => ({
              tripId: id,
              dayOrder: idx + 1,
              dayLabel: day.dayLabel,
              title: day.title,
              altitude: day.altitude,
              note: day.note || null,
              meals: day.meals || null,
              accommodation: day.accommodation || null,
              distanceKm: day.distanceKm ?? null,
              durationHrs: day.durationHrs || null,
              transport: day.transport || null,
              image: day.image || null,
              guideLabel: day.guideLabel || null,
              guideUrl: day.guideUrl || null,
            })),
          });
        }
      }

      if (d.faqs !== undefined) {
        await tx.tripFaq.deleteMany({ where: { tripId: id } });
        if (d.faqs.length > 0) {
          await tx.tripFaq.createMany({
            data: d.faqs.map((f, idx) => ({
              tripId: id,
              question: f.question,
              answer: f.answer,
              sortOrder: idx + 1,
            })),
          });
        }
      }

      if (d.reviews !== undefined) {
        await tx.tripReview.deleteMany({ where: { tripId: id } });
        if (d.reviews.length > 0) {
          await tx.tripReview.createMany({
            data: d.reviews.map((r) => ({
              tripId: id,
              authorName: r.authorName,
              authorCountry: r.authorCountry || null,
              rating: r.rating,
              title: r.title || null,
              comment: r.comment,
              tripDate: r.tripDate ? new Date(r.tripDate) : null,
              verified: r.verified,
              isPublished: r.isPublished,
            })),
          });
        }
      }

      if (d.departures !== undefined) {
        const existingDepartures = await tx.tripDeparture.findMany({
          where: { tripId: id },
          include: { _count: { select: { bookings: true } } },
        });
        const existingMap = new Map(existingDepartures.map((dep) => [dep.id, dep]));
        const submittedIds = new Set(
          d.departures.map((dep) => dep.id).filter((depId): depId is string => Boolean(depId))
        );

        const toDeleteIds: string[] = [];
        for (const existingDep of existingDepartures) {
          if (!submittedIds.has(existingDep.id)) {
            if (existingDep._count.bookings > 0) {
              throw new DepartureConflictError(
                "Cannot delete a departure date that already has bookings. Mark it as CANCELLED instead."
              );
            }
            toDeleteIds.push(existingDep.id);
          }
        }

        if (toDeleteIds.length > 0) {
          await tx.tripDeparture.deleteMany({
            where: { id: { in: toDeleteIds }, tripId: id },
          });
        }

        for (const dep of d.departures) {
          const depData = {
            startDate: new Date(dep.startDate),
            endDate: dep.endDate ? new Date(dep.endDate) : null,
            priceOverride: dep.priceOverride ?? null,
            seatsTotal: dep.seatsTotal,
            seatsBooked: dep.seatsBooked,
            status: dep.status,
            notes: dep.notes || null,
          };

          if (dep.id && existingMap.has(dep.id)) {
            await tx.tripDeparture.update({
              where: { id: dep.id },
              data: depData,
            });
          } else {
            await tx.tripDeparture.create({
              data: {
                tripId: id,
                ...depData,
              },
            });
          }
        }
      }

      return trip;
    });

    revalidatePublicCatalog([
      `/destinations/${existing.slug}`,
      `/destinations/${updated.slug}`,
    ]);
    return NextResponse.json({ ok: true, trip: updated });
  } catch (err) {
    if (err instanceof DepartureConflictError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: 409 }
      );
    }
    console.error("PATCH /api/admin/trips/[id] error:", err);
    const errMsg = err instanceof Error ? err.message : "";
    if (errMsg.includes("Unknown argument")) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Prisma schema updated — please restart your dev server (Ctrl+C then npm run dev) and save again.",
        },
        { status: 500 }
      );
    }
    const devDetail =
      process.env.NODE_ENV !== "production" && errMsg
        ? `: ${errMsg.split(/\r?\n/)[0]}`
        : "";
    return NextResponse.json(
      { ok: false, error: `Unable to update trip${devDetail}` },
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
    const existing = await prisma.trip.findUnique({
      where: { id },
      include: { _count: { select: { bookings: true } } },
    });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Trip not found" },
        { status: 404 }
      );
    }

    if (existing._count.bookings > 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Cannot delete a trip with existing bookings. Unpublish it instead.",
        },
        { status: 409 }
      );
    }

    await prisma.trip.delete({ where: { id } });
    revalidatePublicCatalog([`/destinations/${existing.slug}`]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/trips/[id] error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to delete trip" },
      { status: 500 }
    );
  }
}
