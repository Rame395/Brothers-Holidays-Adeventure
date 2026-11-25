import { cacheLife, cacheTag } from "next/cache";
import prisma from "@/lib/prisma";
import {
  parseCustomSections,
  parsePriceTiers,
  parseServiceGroups,
} from "@/lib/weather-locations";
import type {
  ArchiveEntryDTO,
  DestinationTaxonomyDTO,
  ExpeditionObjectiveDTO,
  JournalPostDTO,
  NavTripDTO,
  PageSeoDTO,
  SiteSettingDTO,
  TrekRouteDTO,
  TripDTO,
} from "@/lib/types";

const DEFAULT_SITE_SETTINGS: SiteSettingDTO = {
  id: "default",
  siteName: "BROTHERS Holidays Adventure",
  tagline: "Himalayan Field Journal & Premium Expeditions",
  contactEmail: "info@brothersholidays.com",
  contactPhone: "+977-1-4700000",
  whatsappNumber: "+9779800000000",
  officeAddress: "Thamel, Kathmandu 44600, Nepal",
  registrationNo: "Govt. Regd. 58177/068/069 · TAAN · NMA · NTB",
  defaultCurrency: "USD",
  usdExchangeRate: 135.0,
  announcementBanner: null,
  announcementActive: false,
  instagramUrl: null,
  facebookUrl: null,
  youtubeUrl: null,
  tripadvisorUrl: null,
  gaMeasurementId: null,
  gtmContainerId: null,
  googleSiteVerification: null,
  bingSiteVerification: null,
  facebookPixelId: null,
  defaultMetaTitle:
    "Nepal Trekking & Himalayan Expeditions | Everest, Annapurna & Manaslu — BROTHERS Holidays Adventure",
  defaultMetaDescription:
    "Licensed Kathmandu Sherpa guides leading Everest Base Camp, Annapurna Circuit, Manaslu, Langtang, Tibet & Bhutan treks. Transparent pricing, acclimatization-first itineraries, and 24/7 mountain safety.",
  defaultOgImage: "/images/trips/hero-ama-dablam.jpg",
};

type PrismaTripFull = NonNullable<
  Awaited<ReturnType<typeof queryTripFullBySlug>>
>;

async function queryTripFullBySlug(slug: string) {
  return prisma.trip.findFirst({
    where: { slug, isPublished: true },
    include: {
      itinerary: { orderBy: { dayOrder: "asc" } },
      departures: {
        where: { status: { not: "CANCELLED" } },
        orderBy: { startDate: "asc" },
      },
      faqs: { orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

function serializeTrip(t: PrismaTripFull): TripDTO {
  return {
    id: t.id,
    slug: t.slug,
    name: t.name,
    country: t.country,
    categories: t.categories,
    region: t.region,
    area: t.area,
    image: t.image,
    gallery: t.gallery,
    mapImage: t.mapImage,
    videoUrl: t.videoUrl,
    days: t.days,
    maxAltitude: t.maxAltitude,
    difficulty: t.difficulty,
    price: t.price,
    priceUsd: t.priceUsd,
    groupMax: t.groupMax,
    seasonMonths: t.seasonMonths,
    start: t.startPoint,
    end: t.endPoint,
    tagline: t.tagline,
    overview: t.overview,
    itineraryIntro: t.itineraryIntro,
    highlights: t.highlights,
    includes: t.includes,
    excludes: t.excludes,
    gearList: t.gearList,
    accommodationSummary: t.accommodationSummary,
    mealsSummary: t.mealsSummary,
    transportSummary: t.transportSummary,
    weatherLocation: t.weatherLocation,
    weatherLat: t.weatherLat,
    weatherLon: t.weatherLon,
    customSections: parseCustomSections(t.customSections),
    includeGroups: parseServiceGroups(t.includeGroups),
    excludeGroups: parseServiceGroups(t.excludeGroups),
    priceTiers: parsePriceTiers(t.priceTiers),
    badge: t.badge,
    isPublished: t.isPublished,
    isFeatured: t.isFeatured,
    featuredOrder: t.featuredOrder,
    metaTitle: t.metaTitle,
    metaDescription: t.metaDescription,
    metaKeywords: t.metaKeywords,
    focusKeyword: t.focusKeyword,
    ogImage: t.ogImage,
    canonicalUrl: t.canonicalUrl,
    updatedAt: t.updatedAt.toISOString(),
    itinerary: t.itinerary.map((d) => ({
      id: d.id,
      dayOrder: d.dayOrder,
      day: d.dayLabel,
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
    departures: t.departures.map((dep) => ({
      id: dep.id,
      startDate: dep.startDate.toISOString(),
      endDate: dep.endDate ? dep.endDate.toISOString() : null,
      priceOverride: dep.priceOverride,
      seatsTotal: dep.seatsTotal,
      seatsBooked: dep.seatsBooked,
      status: dep.status,
      notes: dep.notes,
    })),
    faqs: t.faqs.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      sortOrder: f.sortOrder,
    })),
    reviews: t.reviews.map((r) => ({
      id: r.id,
      authorName: r.authorName,
      authorCountry: r.authorCountry,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      tripDate: r.tripDate ? r.tripDate.toISOString() : null,
      verified: r.verified,
    })),
  };
}

export async function getSiteSettings(): Promise<SiteSettingDTO> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");

  const row = await prisma.siteSetting.findUnique({
    where: { id: "default" },
  });

  if (!row) return DEFAULT_SITE_SETTINGS;

  return {
    id: row.id,
    siteName: row.siteName,
    tagline: row.tagline,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    whatsappNumber: row.whatsappNumber,
    officeAddress: row.officeAddress,
    registrationNo: row.registrationNo,
    defaultCurrency: row.defaultCurrency,
    usdExchangeRate: row.usdExchangeRate,
    announcementBanner: row.announcementBanner,
    announcementActive: row.announcementActive,
    instagramUrl: row.instagramUrl,
    facebookUrl: row.facebookUrl,
    youtubeUrl: row.youtubeUrl,
    tripadvisorUrl: row.tripadvisorUrl,
    gaMeasurementId: row.gaMeasurementId,
    gtmContainerId: row.gtmContainerId,
    googleSiteVerification: row.googleSiteVerification,
    bingSiteVerification: row.bingSiteVerification,
    facebookPixelId: row.facebookPixelId,
    defaultMetaTitle: row.defaultMetaTitle,
    defaultMetaDescription: row.defaultMetaDescription,
    defaultOgImage: row.defaultOgImage,
  };
}

export async function getPageSeo(routePath: string): Promise<PageSeoDTO | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("seo", `seo-${routePath}`);

  const row = await prisma.pageSeo.findUnique({
    where: { routePath },
  });

  if (!row) return null;

  return {
    routePath: row.routePath,
    pageLabel: row.pageLabel,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    metaKeywords: row.metaKeywords,
    ogTitle: row.ogTitle,
    ogDescription: row.ogDescription,
    ogImage: row.ogImage,
    canonicalUrl: row.canonicalUrl,
    noIndex: row.noIndex,
    structuredDataJson: row.structuredDataJson,
  };
}

export async function getDestinationTaxonomy(): Promise<DestinationTaxonomyDTO> {
  "use cache";
  cacheLife("hours");
  cacheTag("taxonomy", "trips");

  const [countries, categories, regions] = await Promise.all([
    prisma.destinationCountry.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        blurb: true,
        heroImage: true,
        sortOrder: true,
        isActive: true,
      },
    }),
    prisma.tripCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        blurb: true,
        heroImage: true,
        groupByRegion: true,
        sortOrder: true,
        isActive: true,
      },
    }),
    prisma.destinationRegion.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        countryId: true,
        countrySlug: true,
        blurb: true,
        heroImage: true,
        seoContent: true,
        metaTitle: true,
        metaDescription: true,
        focusKeyword: true,
        sortOrder: true,
        isActive: true,
      },
    }),
  ]);

  return { countries, categories, regions };
}

export async function getPublishedTrips(): Promise<TripDTO[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("trips", "taxonomy");

  const rows = await prisma.trip.findMany({
    where: { isPublished: true },
    orderBy: [{ isFeatured: "desc" }, { featuredOrder: "asc" }, { name: "asc" }],
    include: {
      itinerary: { orderBy: { dayOrder: "asc" } },
      departures: {
        where: { status: { not: "CANCELLED" } },
        orderBy: { startDate: "asc" },
      },
      faqs: { orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return rows.map(serializeTrip);
}

export async function getCountryBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("taxonomy", `country-${slug}`);

  return prisma.destinationCountry.findFirst({
    where: { slug, isActive: true },
  });
}

export async function getRegionBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("taxonomy", `region-${slug}`);

  return prisma.destinationRegion.findFirst({
    where: { slug, isActive: true },
    include: {
      country: {
        select: { slug: true, name: true },
      },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("taxonomy", `category-${slug}`);

  return prisma.tripCategory.findFirst({
    where: { slug, isActive: true },
  });
}

export async function getPublishedTripsByFilter(filter: {
  country?: string;
  region?: string;
  category?: string;
}): Promise<TripDTO[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("trips", "taxonomy");

  const rows = await prisma.trip.findMany({
    where: {
      isPublished: true,
      ...(filter.country ? { country: filter.country } : {}),
      ...(filter.region ? { region: filter.region } : {}),
      ...(filter.category ? { categories: { has: filter.category } } : {}),
    },
    orderBy: [{ isFeatured: "desc" }, { featuredOrder: "asc" }, { name: "asc" }],
    include: {
      itinerary: { orderBy: { dayOrder: "asc" } },
      departures: {
        where: { status: { not: "CANCELLED" } },
        orderBy: { startDate: "asc" },
      },
      faqs: { orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return rows.map(serializeTrip);
}

export async function getNavTrips(): Promise<NavTripDTO[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("trips", "taxonomy");

  return prisma.trip.findMany({
    where: { isPublished: true },
    orderBy: [{ isFeatured: "desc" }, { featuredOrder: "asc" }, { name: "asc" }],
    select: {
      slug: true,
      name: true,
      country: true,
      categories: true,
      region: true,
      area: true,
      image: true,
      days: true,
      maxAltitude: true,
      price: true,
    },
  });
}

export async function getFeaturedTrips(): Promise<TripDTO[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("trips");

  const rows = await prisma.trip.findMany({
    where: { isPublished: true, isFeatured: true },
    orderBy: [{ featuredOrder: "asc" }, { name: "asc" }],
    include: {
      itinerary: { orderBy: { dayOrder: "asc" } },
      departures: {
        where: { status: { not: "CANCELLED" } },
        orderBy: { startDate: "asc" },
      },
      faqs: { orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return rows.map(serializeTrip);
}

export async function getAllTripSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("trips");

  const rows = await prisma.trip.findMany({
    where: { isPublished: true },
    select: { slug: true },
    orderBy: { slug: "asc" },
  });

  return rows.map((r) => r.slug);
}

export async function getTripBySlug(slug: string): Promise<TripDTO | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("trips", `trip-${slug}`);

  const row = await queryTripFullBySlug(slug);
  if (!row) return null;
  return serializeTrip(row);
}

export async function getRelatedTrips(
  slug: string,
  region: string | null | undefined,
  categories: string[],
  limit = 3
): Promise<TripDTO[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("trips");

  const orFilters: Array<Record<string, unknown>> = [];
  if (region) orFilters.push({ region });
  if (categories.length > 0) orFilters.push({ categories: { hasSome: categories } });

  const rows = await prisma.trip.findMany({
    where: {
      isPublished: true,
      slug: { not: slug },
      ...(orFilters.length > 0 ? { OR: orFilters } : {}),
    },
    take: limit,
    orderBy: [{ isFeatured: "desc" }, { featuredOrder: "asc" }],
    include: {
      itinerary: { orderBy: { dayOrder: "asc" } },
      departures: {
        where: { status: { not: "CANCELLED" } },
        orderBy: { startDate: "asc" },
      },
      faqs: { orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return rows.map(serializeTrip);
}

export async function getPublishedTrekRoutes(): Promise<TrekRouteDTO[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("treks");

  const rows = await prisma.trekRoute.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { highestPoint: "desc" }],
  });

  return rows.map((r) => ({
    id: r.code,
    code: r.code,
    slug: r.slug,
    name: r.name,
    range: r.range,
    region: r.region,
    district: r.district,
    difficulty: r.difficulty,
    duration: r.duration,
    startPoint: r.startPoint,
    highestPoint: r.highestPoint,
    highestPointName: r.highestPointName,
    priceFrom: r.priceFrom,
    season: r.season,
    seasonLabel: r.seasonLabel,
    statusBadge: r.statusBadge,
    statusColor: r.statusColor,
    description: r.description,
    image: r.image,
    elevationPoints: {
      start: r.elevationStart,
      mid: r.elevationMid,
      peak: r.elevationPeak,
      svgPath: r.svgPath,
      peakCoords: { x: r.peakX, y: r.peakY },
    },
    linkedTripSlug: r.linkedTripSlug,
    metaTitle: r.metaTitle,
    metaDescription: r.metaDescription,
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function getTrekRouteBySlug(
  slug: string
): Promise<TrekRouteDTO | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("treks", `trek-${slug}`);

  const r = await prisma.trekRoute.findFirst({
    where: { slug, isPublished: true },
  });

  if (!r) return null;

  return {
    id: r.code,
    code: r.code,
    slug: r.slug,
    name: r.name,
    range: r.range,
    region: r.region,
    district: r.district,
    difficulty: r.difficulty,
    duration: r.duration,
    startPoint: r.startPoint,
    highestPoint: r.highestPoint,
    highestPointName: r.highestPointName,
    priceFrom: r.priceFrom,
    season: r.season,
    seasonLabel: r.seasonLabel,
    statusBadge: r.statusBadge,
    statusColor: r.statusColor,
    description: r.description,
    image: r.image,
    elevationPoints: {
      start: r.elevationStart,
      mid: r.elevationMid,
      peak: r.elevationPeak,
      svgPath: r.svgPath,
      peakCoords: { x: r.peakX, y: r.peakY },
    },
    linkedTripSlug: r.linkedTripSlug,
    metaTitle: r.metaTitle,
    metaDescription: r.metaDescription,
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function getExpeditionObjectives(): Promise<
  ExpeditionObjectiveDTO[]
> {
  "use cache";
  cacheLife("hours");
  cacheTag("expeditions");

  const rows = await prisma.expeditionObjective.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { elevation: "desc" }],
  });

  return rows.map((o) => ({
    id: o.slug,
    slug: o.slug,
    name: o.name,
    region: o.region,
    permit: o.permit,
    band: o.band,
    bandType: o.bandType,
    elevation: o.elevation,
    elevationFt: o.elevationFt,
    season: o.season,
    seasonSub: o.seasonSub,
    route: o.route,
    specs: o.specs,
    guideRatio: o.guideRatio,
    guideSpecs: o.guideSpecs,
    image: o.image,
    icon: o.icon,
  }));
}

export async function getPublishedJournalPosts(): Promise<JournalPostDTO[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("journal");

  const rows = await prisma.journalPost.findMany({
    where: { isPublished: true },
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
  });

  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    dispatchNo: p.dispatchNo,
    title: p.title,
    subtitle: p.subtitle,
    excerpt: p.excerpt,
    description: p.excerpt,
    content: p.content,
    image: p.image,
    authorName: p.authorName,
    authorRole: p.authorRole,
    category: p.category,
    tags: p.tags,
    badge: p.badge,
    badgeType: p.badgeType,
    rating: p.rating,
    ratingCount: p.ratingCount,
    duration: p.duration,
    metricLabel: p.metricLabel,
    metricValue: p.metricValue,
    tariff: p.tariff,
    logisticsBadge: p.logisticsBadge,
    telemetryWarning: p.telemetryWarning,
    telemetryIcon: p.telemetryIcon,
    telemetryColor: p.telemetryColor,
    mirrored: p.mirrored,
    readingTimeMin: p.readingTimeMin,
    isFeatured: p.isFeatured,
    publishedAt: p.publishedAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    metaKeywords: p.metaKeywords,
    ogImage: p.ogImage,
    canonicalUrl: p.canonicalUrl,
  }));
}

export async function getJournalPostBySlug(
  slug: string
): Promise<JournalPostDTO | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("journal", `journal-${slug}`);

  const p = await prisma.journalPost.findFirst({
    where: { slug, isPublished: true },
  });

  if (!p) return null;

  return {
    id: p.id,
    slug: p.slug,
    dispatchNo: p.dispatchNo,
    title: p.title,
    subtitle: p.subtitle,
    excerpt: p.excerpt,
    description: p.excerpt,
    content: p.content,
    image: p.image,
    authorName: p.authorName,
    authorRole: p.authorRole,
    category: p.category,
    tags: p.tags,
    badge: p.badge,
    badgeType: p.badgeType,
    rating: p.rating,
    ratingCount: p.ratingCount,
    duration: p.duration,
    metricLabel: p.metricLabel,
    metricValue: p.metricValue,
    tariff: p.tariff,
    logisticsBadge: p.logisticsBadge,
    telemetryWarning: p.telemetryWarning,
    telemetryIcon: p.telemetryIcon,
    telemetryColor: p.telemetryColor,
    mirrored: p.mirrored,
    readingTimeMin: p.readingTimeMin,
    isFeatured: p.isFeatured,
    publishedAt: p.publishedAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    metaKeywords: p.metaKeywords,
    ogImage: p.ogImage,
    canonicalUrl: p.canonicalUrl,
  };
}

export async function getArchiveEntries(): Promise<ArchiveEntryDTO[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("archive");

  const rows = await prisma.archiveEntry.findMany({
    where: { isPublished: true },
    orderBy: { year: "asc" },
  });

  return rows.map((e) => ({
    id: e.slug,
    slug: e.slug,
    year: e.year,
    decade: e.decade,
    name: e.name,
    region: e.region,
    subRegion: e.subRegion,
    passDetail: e.passDetail,
    status: e.status,
    altitude: e.altitude,
    altitudeFt: e.altitudeFt,
    icon: e.icon,
    summary: e.summary,
  }));
}
