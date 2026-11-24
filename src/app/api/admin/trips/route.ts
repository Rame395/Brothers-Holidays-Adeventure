import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/guards";
import { revalidatePublicCatalog, slugify } from "@/lib/admin-cache";
import { tripCreateSchema } from "@/lib/admin-trip-schemas";

export async function GET(request: Request) {
  const auth = await requireAdminApi(request, { permission: "trips:read" });
  if (!auth.ok) return auth.response;

  const trips = await prisma.trip.findMany({
    orderBy: [{ isFeatured: "desc" }, { featuredOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      country: true,
      categories: true,
      region: true,
      area: true,
      image: true,
      days: true,
      maxAltitude: true,
      difficulty: true,
      price: true,
      groupMax: true,
      isPublished: true,
      isFeatured: true,
      featuredOrder: true,
      updatedAt: true,
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

  return NextResponse.json({ ok: true, trips });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi(request, { permission: "trips:write" });
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const parsed = tripCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message || "Invalid trip payload",
        },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const normalizedSlug = slugify(d.slug || d.name);
    if (!normalizedSlug) {
      return NextResponse.json(
        { ok: false, error: "Could not derive a valid trip slug." },
        { status: 400 }
      );
    }

    const countryRow = await prisma.destinationCountry.findUnique({
      where: { slug: d.country },
      select: { slug: true },
    });
    if (!countryRow) {
      return NextResponse.json(
        { ok: false, error: `Unknown country "${d.country}". Add it in Taxonomy first.` },
        { status: 400 }
      );
    }

    const cleanRegion = d.region?.trim() || null;
    if (cleanRegion) {
      const regionRow = await prisma.destinationRegion.findUnique({
        where: { slug: cleanRegion },
        select: { slug: true, countrySlug: true },
      });
      if (!regionRow) {
        return NextResponse.json(
          { ok: false, error: `Unknown region "${cleanRegion}". Add it in Taxonomy first.` },
          { status: 400 }
        );
      }
      if (regionRow.countrySlug !== countryRow.slug) {
        return NextResponse.json(
          {
            ok: false,
            error: `Region "${cleanRegion}" belongs to country "${regionRow.countrySlug}", not "${countryRow.slug}".`,
          },
          { status: 400 }
        );
      }
    }

    const existingSlug = await prisma.trip.findUnique({
      where: { slug: normalizedSlug },
      select: { id: true },
    });
    if (existingSlug) {
      return NextResponse.json(
        { ok: false, error: `A trip with slug "${normalizedSlug}" already exists.` },
        { status: 409 }
      );
    }

    const gallery =
      d.gallery.length > 0
        ? Array.from(new Set([d.image, ...d.gallery]))
        : [d.image];
    const seasonMonths =
      d.seasonMonths.length > 0 ? d.seasonMonths : [3, 4, 5, 10, 11];

    const defaultMetaTitle = `${d.name} (${d.days} ${d.days === 1 ? "Day" : "Days"}) | BROTHERS Holidays Adventure`;
    const defaultMetaDescription = `${d.tagline} Max altitude ${d.maxAltitude.toLocaleString("en-US")}m.`.slice(
      0,
      160
    );

    const created = await prisma.trip.create({
      data: {
        slug: normalizedSlug,
        name: d.name,
        country: countryRow.slug,
        categories: Array.from(new Set(d.categories)),
        region: cleanRegion,
        area: d.area,
        image: d.image,
        gallery,
        mapImage: d.mapImage || null,
        videoUrl: d.videoUrl || null,
        days: d.days,
        maxAltitude: d.maxAltitude,
        difficulty: d.difficulty,
        price: d.price,
        priceUsd: d.priceUsd ?? null,
        groupMax: d.groupMax,
        seasonMonths,
        startPoint: d.startPoint,
        endPoint: d.endPoint,
        tagline: d.tagline,
        overview: d.overview,
        itineraryIntro: d.itineraryIntro || null,
        highlights: d.highlights,
        includes: d.includes,
        excludes: d.excludes,
        gearList: d.gearList,
        accommodationSummary: d.accommodationSummary || null,
        mealsSummary: d.mealsSummary || null,
        transportSummary: d.transportSummary || null,
        weatherLocation: d.weatherLocation || null,
        weatherLat: d.weatherLat ?? null,
        weatherLon: d.weatherLon ?? null,
        customSections: d.customSections,
        includeGroups: d.includeGroups,
        excludeGroups: d.excludeGroups,
        priceTiers: d.priceTiers,
        badge: d.badge || null,
        isPublished: d.isPublished,
        isFeatured: d.isFeatured,
        featuredOrder: d.featuredOrder,
        metaTitle: d.metaTitle || defaultMetaTitle,
        metaDescription: d.metaDescription || defaultMetaDescription,
        ogImage: d.image,
        itinerary:
          d.itinerary.length > 0
            ? {
                create: d.itinerary.map((day, idx) => ({
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
              }
            : undefined,
        departures:
          d.departures.length > 0
            ? {
                create: d.departures.map((dep) => ({
                  startDate: new Date(dep.startDate),
                  endDate: dep.endDate ? new Date(dep.endDate) : null,
                  priceOverride: dep.priceOverride ?? null,
                  seatsTotal: dep.seatsTotal,
                  seatsBooked: dep.seatsBooked,
                  status: dep.status,
                  notes: dep.notes || null,
                })),
              }
            : undefined,
        faqs:
          d.faqs.length > 0
            ? {
                create: d.faqs.map((f, idx) => ({
                  question: f.question,
                  answer: f.answer,
                  sortOrder: idx + 1,
                })),
              }
            : undefined,
        reviews:
          d.reviews.length > 0
            ? {
                create: d.reviews.map((r) => ({
                  authorName: r.authorName,
                  authorCountry: r.authorCountry || null,
                  rating: r.rating,
                  title: r.title || null,
                  comment: r.comment,
                  tripDate: r.tripDate ? new Date(r.tripDate) : null,
                  verified: r.verified,
                  isPublished: r.isPublished,
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

    revalidatePublicCatalog([`/destinations/${created.slug}`]);
    return NextResponse.json({ ok: true, trip: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/trips error:", err);
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
      { ok: false, error: `Unable to create trip right now${devDetail}` },
      { status: 500 }
    );
  }
}
