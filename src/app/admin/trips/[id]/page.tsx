import { Suspense } from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  parseCustomSections,
  parsePriceTiers,
  parseServiceGroups,
} from "@/lib/weather-locations";
import { hasAdminPermission, requireAdmin } from "@/lib/auth/guards";
import AdminTripEditorClient, {
  type AdminTripEditorDTO,
} from "@/components/admin/AdminTripEditorClient";

async function AdminEditTripGate({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const auth = await requireAdmin({ permission: "trips:read" });
  const canWrite = hasAdminPermission(auth.admin.role, "trips:write");
  const [{ id }, resolvedSearch] = await Promise.all([params, searchParams]);
  const justCreated = resolvedSearch?.saved === "1";

  const [trip, countries, categories, regions] = await Promise.all([
    prisma.trip.findUnique({
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
      },
    }),
    prisma.destinationCountry.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, slug: true, name: true, isActive: true },
    }),
    prisma.tripCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        groupByRegion: true,
        isActive: true,
      },
    }),
    prisma.destinationRegion.findMany({
      orderBy: [{ countrySlug: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        countrySlug: true,
        isActive: true,
      },
    }),
  ]);

  if (!trip) {
    notFound();
  }

  const serializedTrip: AdminTripEditorDTO = {
    id: trip.id,
    slug: trip.slug,
    name: trip.name,
    country: trip.country,
    categories: trip.categories,
    region: trip.region,
    area: trip.area,
    image: trip.image,
    gallery: trip.gallery,
    mapImage: trip.mapImage,
    videoUrl: trip.videoUrl,
    days: trip.days,
    maxAltitude: trip.maxAltitude,
    difficulty: trip.difficulty,
    price: trip.price,
    priceUsd: trip.priceUsd,
    groupMax: trip.groupMax,
    seasonMonths: trip.seasonMonths,
    startPoint: trip.startPoint,
    endPoint: trip.endPoint,
    tagline: trip.tagline,
    overview: trip.overview,
    itineraryIntro: trip.itineraryIntro,
    highlights: trip.highlights,
    includes: trip.includes,
    excludes: trip.excludes,
    gearList: trip.gearList,
    accommodationSummary: trip.accommodationSummary,
    mealsSummary: trip.mealsSummary,
    transportSummary: trip.transportSummary,
    weatherLocation: trip.weatherLocation,
    weatherLat: trip.weatherLat,
    weatherLon: trip.weatherLon,
    customSections: parseCustomSections(trip.customSections),
    includeGroups: parseServiceGroups(trip.includeGroups),
    excludeGroups: parseServiceGroups(trip.excludeGroups),
    priceTiers: parsePriceTiers(trip.priceTiers),
    badge: trip.badge,
    isPublished: trip.isPublished,
    isFeatured: trip.isFeatured,
    featuredOrder: trip.featuredOrder,
    metaTitle: trip.metaTitle,
    metaDescription: trip.metaDescription,
    itinerary: trip.itinerary.map((d) => ({
      id: d.id,
      dayLabel: d.dayLabel,
      title: d.title,
      altitude: d.altitude,
      note: d.note,
      meals: d.meals,
      accommodation: d.accommodation,
      distanceKm: d.distanceKm,
      durationHrs: d.durationHrs,
      transport: d.transport,
      image: d.image,
      guideLabel: d.guideLabel,
      guideUrl: d.guideUrl,
    })),
    departures: trip.departures.map((dep) => ({
      id: dep.id,
      startDate: dep.startDate.toISOString(),
      endDate: dep.endDate ? dep.endDate.toISOString() : null,
      priceOverride: dep.priceOverride,
      seatsTotal: dep.seatsTotal,
      seatsBooked: dep.seatsBooked,
      status: dep.status,
      notes: dep.notes,
      bookingCount: dep._count.bookings,
    })),
    faqs: trip.faqs.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
    })),
    reviews: trip.reviews.map((r) => ({
      id: r.id,
      authorName: r.authorName,
      authorCountry: r.authorCountry,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      tripDate: r.tripDate ? r.tripDate.toISOString() : null,
      verified: r.verified,
      isPublished: r.isPublished,
    })),
  };

  return (
    <AdminTripEditorClient
      admin={{
        id: auth.admin.id,
        email: auth.admin.email,
        name: auth.admin.name,
        role: auth.admin.role,
      }}
      permissions={auth.permissions}
      canWrite={canWrite}
      mode="edit"
      justCreated={justCreated}
      initialTrip={serializedTrip}
      countries={countries}
      categories={categories}
      regions={regions}
    />
  );
}

export default function AdminEditTripPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-sans text-sm font-medium text-[#3f6e15]">
          Loading expedition editor...
        </div>
      }
    >
      <AdminEditTripGate params={params} searchParams={searchParams} />
    </Suspense>
  );
}
