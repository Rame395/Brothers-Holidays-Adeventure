import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/guards";
import { revalidatePublicCatalog } from "@/lib/admin-cache";

async function findAvailableCopySlug(baseSlug: string): Promise<string> {
  const firstCandidate = `${baseSlug}-copy`.slice(0, 96);
  const existingFirst = await prisma.trip.findUnique({
    where: { slug: firstCandidate },
    select: { id: true },
  });
  if (!existingFirst) return firstCandidate;

  for (let i = 2; i <= 50; i += 1) {
    const suffix = `-copy-${i}`;
    const candidate = `${baseSlug.slice(0, 96 - suffix.length)}${suffix}`;
    const clash = await prisma.trip.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!clash) return candidate;
  }

  return `${baseSlug.slice(0, 80)}-${Date.now().toString(36)}`;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi(request, { permission: "trips:write" });
  if (!auth.ok) return auth.response;

  try {
    const { id } = await context.params;
    const existing = await prisma.trip.findUnique({
      where: { id },
      include: {
        itinerary: { orderBy: { dayOrder: "asc" } },
        faqs: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Trip not found" },
        { status: 404 }
      );
    }

    const nextSlug = await findAvailableCopySlug(existing.slug);
    const nextName = `${existing.name} (Copy)`;

    const created = await prisma.trip.create({
      data: {
        slug: nextSlug,
        name: nextName,
        country: existing.country,
        categories: existing.categories,
        region: existing.region,
        area: existing.area,
        image: existing.image,
        gallery: existing.gallery,
        mapImage: existing.mapImage,
        videoUrl: existing.videoUrl,
        days: existing.days,
        maxAltitude: existing.maxAltitude,
        difficulty: existing.difficulty,
        price: existing.price,
        priceUsd: existing.priceUsd,
        groupMax: existing.groupMax,
        seasonMonths: existing.seasonMonths,
        startPoint: existing.startPoint,
        endPoint: existing.endPoint,
        tagline: existing.tagline,
        overview: existing.overview,
        itineraryIntro: existing.itineraryIntro,
        highlights: existing.highlights,
        includes: existing.includes,
        excludes: existing.excludes,
        gearList: existing.gearList,
        accommodationSummary: existing.accommodationSummary,
        mealsSummary: existing.mealsSummary,
        transportSummary: existing.transportSummary,
        weatherLocation: existing.weatherLocation,
        weatherLat: existing.weatherLat,
        weatherLon: existing.weatherLon,
        customSections: existing.customSections ?? [],
        includeGroups: existing.includeGroups ?? [],
        excludeGroups: existing.excludeGroups ?? [],
        priceTiers: existing.priceTiers ?? [],
        badge: existing.badge,
        isPublished: false,
        isFeatured: false,
        featuredOrder: 0,
        metaTitle: existing.metaTitle
          ? `${existing.metaTitle} (Copy)`.slice(0, 160)
          : `${nextName} | BROTHERS Holidays Adventure`.slice(0, 160),
        metaDescription: existing.metaDescription,
        ogImage: existing.image,
        itinerary:
          existing.itinerary.length > 0
            ? {
                create: existing.itinerary.map((day, idx) => ({
                  dayOrder: idx + 1,
                  dayLabel: day.dayLabel,
                  title: day.title,
                  altitude: day.altitude,
                  note: day.note,
                  meals: day.meals,
                  accommodation: day.accommodation,
                  distanceKm: day.distanceKm,
                  durationHrs: day.durationHrs,
                  transport: day.transport,
                  image: day.image,
                  guideLabel: day.guideLabel,
                  guideUrl: day.guideUrl,
                })),
              }
            : undefined,
        faqs:
          existing.faqs.length > 0
            ? {
                create: existing.faqs.map((faq, idx) => ({
                  question: faq.question,
                  answer: faq.answer,
                  sortOrder: idx + 1,
                })),
              }
            : undefined,
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

    revalidatePublicCatalog();
    return NextResponse.json({ ok: true, trip: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/trips/[id]/duplicate error:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to duplicate trip right now" },
      { status: 500 }
    );
  }
}
