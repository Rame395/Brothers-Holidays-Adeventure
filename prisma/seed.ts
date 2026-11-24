import { PrismaClient, AdminRole, DepartureStatus } from "@prisma/client";
import { hash as argon2Hash } from "@node-rs/argon2";
import { CATEGORIES, COUNTRIES, REGIONS, TRIPS } from "../src/data/trips";
import { TREKS } from "../src/data/treks";
import { EXPEDITION_OBJECTIVES } from "../src/data/expeditions";
import { JOURNAL_STORIES } from "../src/data/journal";
import { ARCHIVE_ENTRIES } from "../src/data/archive";
import { upcomingDepartures } from "../src/lib/booking";

const prisma = new PrismaClient();

const FEATURED_SLUGS = [
  "everest-base-camp-trek",
  "annapurna-base-camp-trek",
  "manaslu-circuit-trek",
  "langtang-valley-trek",
  "mardi-himal-trek",
  "upper-mustang-trek",
];

function buildTripMetaTitle(name: string, days: number, country: string): string {
  const countryCap = country.charAt(0).toUpperCase() + country.slice(1);
  return `${name} (${days} ${days === 1 ? "Day" : "Days"}) | ${countryCap} — BROTHERS Holidays Adventure`;
}

function buildTripMetaDescription(tagline: string, overview: string, maxAltitude: number): string {
  const base = `${tagline} Max altitude ${maxAltitude.toLocaleString("en-US")}m. ${overview}`;
  return base.length > 158 ? `${base.slice(0, 155).trimEnd()}...` : base;
}

function buildTripKeywords(
  name: string,
  area: string,
  country: string,
  categories: string[],
  region?: string
): string[] {
  const kws = new Set<string>([
    name,
    `${name} itinerary`,
    `${name} cost`,
    area,
    `${country} trekking`,
    "BROTHERS Holidays Adventure",
    ...categories,
  ]);
  if (region) kws.add(`${region} region trek`);
  return Array.from(kws);
}

const PAGE_SEO_DEFAULTS = [
  {
    routePath: "/",
    pageLabel: "Homepage",
    metaTitle: "BROTHERS Holidays Adventure — Himalayan Field Journal & Premium Expeditions",
    metaDescription:
      "An alpine editorial journal and luxury trekking outfitter in Kathmandu, Nepal. Explore Everest, Annapurna, Manaslu, Langtang, Tibet, and Bhutan with certified Sherpa leads.",
    metaKeywords: [
      "Himalayan trekking",
      "Nepal expeditions",
      "Everest Base Camp Trek",
      "Manaslu Circuit",
      "BROTHERS Holidays Adventure",
    ],
    ogImage: "/images/trips/hero-ama-dablam.jpg",
  },
  {
    routePath: "/destinations",
    pageLabel: "All Destinations",
    metaTitle: "Himalayan Destinations & Trekking Packages | Nepal, Tibet & Bhutan",
    metaDescription:
      "Browse 39 curated Himalayan trekking routes, peak climbing expeditions, helicopter tours, wildlife safaris, and cultural journeys across Nepal, Tibet, and Bhutan.",
    metaKeywords: [
      "Nepal trekking packages",
      "Himalayan destinations",
      "Tibet tours",
      "Bhutan trekking",
      "Peak climbing Nepal",
    ],
    ogImage: "/images/trips/everest.jpg",
  },
  {
    routePath: "/treks",
    pageLabel: "Live Trek Directory",
    metaTitle: "High-Altitude Trek Directory & Elevation Profiles | Nepal",
    metaDescription:
      "Compare Himalayan trekking routes with interactive elevation profiles, permit classifications, seasonal weather windows, and technical grades.",
    metaKeywords: [
      "Nepal trek directory",
      "Himalayan elevation profiles",
      "Restricted area trekking Nepal",
      "Three Passes trek",
    ],
    ogImage: "/images/trips/gokyo.jpg",
  },
  {
    routePath: "/expeditions",
    pageLabel: "Mountaineering Expeditions",
    metaTitle: "6,000m, 7,000m & 8,000m Mountaineering Expeditions | Nepal",
    metaDescription:
      "Technical Himalayan climbing objectives categorized by physiological altitude band—Manaslu, Ama Dablam, Baruntse, Mera Peak, Island Peak, and Lobuche East.",
    metaKeywords: [
      "Nepal mountaineering expeditions",
      "Ama Dablam expedition",
      "Island Peak climbing",
      "Manaslu 8163m",
    ],
    ogImage: "/images/trips/peak.jpg",
  },
  {
    routePath: "/journal",
    pageLabel: "Alpine Field Journal",
    metaTitle: "Alpine Field Journal & Himalayan Expedition Notes",
    metaDescription:
      "Unfiltered field dispatches, Khumbu Icefall logistics, high-altitude medical treatises, and seasonal pass conditions written by veteran Sherpa guides.",
    metaKeywords: [
      "Himalayan field journal",
      "Nepal trekking blog",
      "Khumbu Icefall logistics",
      "High altitude acclimatization guide",
    ],
    ogImage: "/images/trips/langtang.jpg",
  },
  {
    routePath: "/about",
    pageLabel: "About Us",
    metaTitle: "About BROTHERS Holidays Adventure — Kathmandu Mountain Guides",
    metaDescription:
      "Founded in Thamel, Kathmandu by Himalayan mountain guides. Certified by NTB, TAAN, and NMA with strict 1:6 guide ratios and ethical Sherpa crew standards.",
    metaKeywords: [
      "BROTHERS Holidays Adventure",
      "Kathmandu trekking agency",
      "Certified Sherpa guides",
      "TAAN registered Nepal trekking",
    ],
    ogImage: "/images/cta-himalaya-bg.jpg",
  },
  {
    routePath: "/process",
    pageLabel: "Our Expedition Process",
    metaTitle: "Our 5-Stage Expedition Methodology & Safety Protocol",
    metaDescription:
      "How BROTHERS Holidays Adventure plans permits, acclimatization schedules, pulse-oximetry monitoring, satellite communications, and helicopter rescue underwriting.",
    metaKeywords: [
      "Himalayan trekking safety",
      "Nepal trekking permits process",
      "High altitude rescue protocol",
    ],
    ogImage: "/images/home-camp.jpg",
  },
  {
    routePath: "/archive",
    pageLabel: "Expedition Archive",
    metaTitle: "40-Year Himalayan Expedition Ledger (1984–2024)",
    metaDescription:
      "Historical archive of documented Himalayan crossings, glacial surveys, and restricted-zone reconnaissance across Nepal from the 1980s to the present.",
    metaKeywords: [
      "Himalayan expedition archive",
      "Nepal mountaineering history",
      "Rolwaling Tashi Lapcha",
    ],
    ogImage: "/images/trips/manaslu.jpg",
  },
  {
    routePath: "/contact",
    pageLabel: "Contact & Liaison Bureau",
    metaTitle: "Contact Kathmandu Headquarters | Custom Trek Consultation",
    metaDescription:
      "Speak directly with our Kathmandu expedition planners for custom itineraries, restricted area permits, private guiding, and real-time trail conditions.",
    metaKeywords: [
      "Contact BROTHERS Holidays Adventure",
      "Kathmandu trekking office",
      "Custom Nepal trek quote",
    ],
    ogImage: "/images/trips/kathmandu.jpg",
  },
];

async function main() {
  console.log("Starting idempotent database seed...");

  // 1. Seed Default Super Admin
  const adminPasswordHash = await argon2Hash("Admin@12345", {
    algorithm: 2, // 2 = Argon2id
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
  await prisma.adminUser.upsert({
    where: { email: "admin@brothersholidays.com" },
    update: {
      name: "Super Admin",
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    },
    create: {
      email: "admin@brothersholidays.com",
      name: "Super Admin",
      passwordHash: adminPasswordHash,
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  // 1b. Seed Dynamic Destination Taxonomy (Countries, Categories, Regions)
  const seededCountries = new Map<string, string>();
  for (let i = 0; i < COUNTRIES.length; i++) {
    const c = COUNTRIES[i];
    const row = await prisma.destinationCountry.upsert({
      where: { slug: c.id },
      update: {
        name: c.label,
        blurb: c.blurb,
        heroImage: c.image,
        sortOrder: i + 1,
        isActive: true,
      },
      create: {
        slug: c.id,
        name: c.label,
        blurb: c.blurb,
        heroImage: c.image,
        sortOrder: i + 1,
        isActive: true,
      },
    });
    seededCountries.set(c.id, row.id);
  }

  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    await prisma.tripCategory.upsert({
      where: { slug: cat.id },
      update: {
        name: cat.label,
        blurb: cat.blurb,
        heroImage: cat.image,
        groupByRegion: cat.id === "trekking",
        sortOrder: i + 1,
        isActive: true,
      },
      create: {
        slug: cat.id,
        name: cat.label,
        blurb: cat.blurb,
        heroImage: cat.image,
        groupByRegion: cat.id === "trekking",
        sortOrder: i + 1,
        isActive: true,
      },
    });
  }

  const nepalCountryId = seededCountries.get("nepal");
  if (nepalCountryId) {
    for (let i = 0; i < REGIONS.length; i++) {
      const reg = REGIONS[i];
      await prisma.destinationRegion.upsert({
        where: { slug: reg.id },
        update: {
          name: reg.label,
          countryId: nepalCountryId,
          countrySlug: "nepal",
          heroImage: reg.image,
          sortOrder: i + 1,
          isActive: true,
        },
        create: {
          slug: reg.id,
          name: reg.label,
          countryId: nepalCountryId,
          countrySlug: "nepal",
          heroImage: reg.image,
          sortOrder: i + 1,
          isActive: true,
        },
      });
    }
  }

  // 2. Seed Trips + Itinerary Days + Upcoming Departures
  let totalItineraryDays = 0;
  let totalDeparturesCreated = 0;

  for (const tripData of TRIPS) {
    const featuredIdx = FEATURED_SLUGS.indexOf(tripData.slug);
    const isFeatured = featuredIdx !== -1;
    const featuredOrder = isFeatured ? featuredIdx + 1 : 0;

    const trip = await prisma.trip.upsert({
      where: { slug: tripData.slug },
      update: {
        name: tripData.name,
        country: tripData.country,
        categories: tripData.categories,
        region: tripData.region ?? null,
        area: tripData.area,
        image: tripData.image,
        gallery: tripData.gallery,
        days: tripData.days,
        maxAltitude: tripData.maxAltitude,
        difficulty: tripData.difficulty,
        price: tripData.price,
        groupMax: tripData.groupMax,
        seasonMonths: tripData.seasonMonths,
        startPoint: tripData.start,
        endPoint: tripData.end,
        tagline: tripData.tagline,
        overview: tripData.overview,
        highlights: tripData.highlights,
        includes: tripData.includes,
        excludes: tripData.excludes,
        isFeatured,
        featuredOrder,
      },
      create: {
        slug: tripData.slug,
        name: tripData.name,
        country: tripData.country,
        categories: tripData.categories,
        region: tripData.region ?? null,
        area: tripData.area,
        image: tripData.image,
        gallery: tripData.gallery,
        days: tripData.days,
        maxAltitude: tripData.maxAltitude,
        difficulty: tripData.difficulty,
        price: tripData.price,
        groupMax: tripData.groupMax,
        seasonMonths: tripData.seasonMonths,
        startPoint: tripData.start,
        endPoint: tripData.end,
        tagline: tripData.tagline,
        overview: tripData.overview,
        highlights: tripData.highlights,
        includes: tripData.includes,
        excludes: tripData.excludes,
        isPublished: true,
        isFeatured,
        featuredOrder,
        metaTitle: buildTripMetaTitle(tripData.name, tripData.days, tripData.country),
        metaDescription: buildTripMetaDescription(
          tripData.tagline,
          tripData.overview,
          tripData.maxAltitude
        ),
        metaKeywords: buildTripKeywords(
          tripData.name,
          tripData.area,
          tripData.country,
          tripData.categories,
          tripData.region
        ),
        focusKeyword: tripData.name,
        ogImage: tripData.image,
      },
    });

    // Replace itinerary days atomically so re-running seed never duplicates days
    await prisma.$transaction([
      prisma.tripItineraryDay.deleteMany({
        where: { tripId: trip.id },
      }),
      prisma.tripItineraryDay.createMany({
        data: tripData.itinerary.map((day, idx) => ({
          tripId: trip.id,
          dayOrder: idx + 1,
          dayLabel: day.day,
          title: day.title,
          altitude: day.altitude,
          note: day.note ?? null,
        })),
      }),
    ]);
    totalItineraryDays += tripData.itinerary.length;

    // Only seed departures if none exist for this trip yet
    const existingDepartures = await prisma.tripDeparture.count({
      where: { tripId: trip.id },
    });

    if (existingDepartures === 0) {
      const dates = upcomingDepartures(new Date(), tripData.seasonMonths, 4);
      if (dates.length > 0) {
        await prisma.tripDeparture.createMany({
          data: dates.map((startDate) => {
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + Math.max(tripData.days - 1, 0));
            return {
              tripId: trip.id,
              startDate,
              endDate,
              seatsTotal: tripData.groupMax,
              seatsBooked: 0,
              status: DepartureStatus.OPEN,
            };
          }),
        });
        totalDeparturesCreated += dates.length;
      }
    }
  }

  // 3. Seed TrekRoutes
  for (let i = 0; i < TREKS.length; i++) {
    const t = TREKS[i];
    await prisma.trekRoute.upsert({
      where: { slug: t.slug },
      update: {
        code: t.id,
        name: t.name,
        range: t.range,
        region: t.region,
        district: t.district,
        difficulty: t.difficulty,
        duration: t.duration,
        startPoint: t.startPoint,
        highestPoint: t.highestPoint,
        highestPointName: t.highestPointName,
        priceFrom: t.priceFrom,
        season: t.season,
        seasonLabel: t.seasonLabel,
        statusBadge: t.statusBadge,
        statusColor: t.statusColor,
        description: t.description,
        image: t.image,
        elevationStart: t.elevationPoints.start,
        elevationMid: t.elevationPoints.mid,
        elevationPeak: t.elevationPoints.peak,
        svgPath: t.elevationPoints.svgPath,
        peakX: t.elevationPoints.peakCoords.x,
        peakY: t.elevationPoints.peakCoords.y,
        sortOrder: i + 1,
      },
      create: {
        code: t.id,
        slug: t.slug,
        name: t.name,
        range: t.range,
        region: t.region,
        district: t.district,
        difficulty: t.difficulty,
        duration: t.duration,
        startPoint: t.startPoint,
        highestPoint: t.highestPoint,
        highestPointName: t.highestPointName,
        priceFrom: t.priceFrom,
        season: t.season,
        seasonLabel: t.seasonLabel,
        statusBadge: t.statusBadge,
        statusColor: t.statusColor,
        description: t.description,
        image: t.image,
        elevationStart: t.elevationPoints.start,
        elevationMid: t.elevationPoints.mid,
        elevationPeak: t.elevationPoints.peak,
        svgPath: t.elevationPoints.svgPath,
        peakX: t.elevationPoints.peakCoords.x,
        peakY: t.elevationPoints.peakCoords.y,
        sortOrder: i + 1,
        isPublished: true,
        metaTitle: `${t.name} (${t.duration} Days) | Route Survey — BROTHERS Holidays`,
        metaDescription: t.description,
      },
    });
  }

  // 4. Seed ExpeditionObjectives
  for (let i = 0; i < EXPEDITION_OBJECTIVES.length; i++) {
    const obj = EXPEDITION_OBJECTIVES[i];
    await prisma.expeditionObjective.upsert({
      where: { slug: obj.id },
      update: {
        name: obj.name,
        region: obj.region,
        permit: obj.permit,
        band: obj.band,
        bandType: obj.bandType,
        elevation: obj.elevation,
        elevationFt: obj.elevationFt,
        season: obj.season,
        seasonSub: obj.seasonSub,
        route: obj.route,
        specs: obj.specs,
        guideRatio: obj.guideRatio,
        guideSpecs: obj.guideSpecs,
        image: obj.image ?? null,
        icon: obj.icon ?? null,
        sortOrder: i + 1,
      },
      create: {
        slug: obj.id,
        name: obj.name,
        region: obj.region,
        permit: obj.permit,
        band: obj.band,
        bandType: obj.bandType,
        elevation: obj.elevation,
        elevationFt: obj.elevationFt,
        season: obj.season,
        seasonSub: obj.seasonSub,
        route: obj.route,
        specs: obj.specs,
        guideRatio: obj.guideRatio,
        guideSpecs: obj.guideSpecs,
        image: obj.image ?? null,
        icon: obj.icon ?? null,
        sortOrder: i + 1,
        isPublished: true,
      },
    });
  }

  // 5. Seed JournalPosts
  for (let i = 0; i < JOURNAL_STORIES.length; i++) {
    const story = JOURNAL_STORIES[i];
    const markdownContent = [
      `## ${story.title}`,
      "",
      `*${story.subtitle}*`,
      "",
      story.description,
      "",
      `### Field Logistics & Telemetry`,
      `- **Duration**: ${story.duration}`,
      `- **${story.metricLabel}**: ${story.metricValue}`,
      `- **Estimated Tariff**: ${story.tariff}`,
      `- **Gear & Support**: ${story.logisticsBadge}`,
      story.telemetryWarning ? `- **Field Advisory**: ${story.telemetryWarning}` : null,
    ]
      .filter((line) => line !== null)
      .join("\n");

    await prisma.journalPost.upsert({
      where: { slug: story.slug },
      update: {
        dispatchNo: story.dispatchNo,
        title: story.title,
        subtitle: story.subtitle,
        excerpt: story.description,
        image: story.image,
        badge: story.badge,
        badgeType: story.badgeType,
        rating: story.rating,
        ratingCount: story.ratingCount,
        duration: story.duration,
        metricLabel: story.metricLabel,
        metricValue: story.metricValue,
        tariff: story.tariff,
        logisticsBadge: story.logisticsBadge,
        telemetryWarning: story.telemetryWarning ?? null,
        telemetryIcon: story.telemetryIcon ?? null,
        telemetryColor: story.telemetryColor ?? null,
        mirrored: Boolean(story.mirrored),
      },
      create: {
        slug: story.slug,
        dispatchNo: story.dispatchNo,
        title: story.title,
        subtitle: story.subtitle,
        excerpt: story.description,
        content: markdownContent,
        image: story.image,
        badge: story.badge,
        badgeType: story.badgeType,
        rating: story.rating,
        ratingCount: story.ratingCount,
        duration: story.duration,
        metricLabel: story.metricLabel,
        metricValue: story.metricValue,
        tariff: story.tariff,
        logisticsBadge: story.logisticsBadge,
        telemetryWarning: story.telemetryWarning ?? null,
        telemetryIcon: story.telemetryIcon ?? null,
        telemetryColor: story.telemetryColor ?? null,
        mirrored: Boolean(story.mirrored),
        readingTimeMin: 6,
        isPublished: true,
        isFeatured: i === 0,
        metaTitle: `${story.title} | Alpine Field Journal — BROTHERS Holidays Adventure`,
        metaDescription: story.description,
        metaKeywords: [story.title, story.badge, "Nepal Field Dispatch", "BROTHERS Holidays Adventure"],
        ogImage: story.image,
      },
    });
  }

  // 6. Seed ArchiveEntries
  for (const entry of ARCHIVE_ENTRIES) {
    await prisma.archiveEntry.upsert({
      where: { slug: entry.id },
      update: {
        year: entry.year,
        decade: entry.decade,
        name: entry.name,
        region: entry.region,
        subRegion: entry.subRegion,
        passDetail: entry.passDetail,
        status: entry.status,
        altitude: entry.altitude,
        altitudeFt: entry.altitudeFt,
        icon: entry.icon,
        summary: entry.summary,
      },
      create: {
        slug: entry.id,
        year: entry.year,
        decade: entry.decade,
        name: entry.name,
        region: entry.region,
        subRegion: entry.subRegion,
        passDetail: entry.passDetail,
        status: entry.status,
        altitude: entry.altitude,
        altitudeFt: entry.altitudeFt,
        icon: entry.icon,
        summary: entry.summary,
        isPublished: true,
      },
    });
  }

  // 7. Seed SiteSetting singleton
  await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
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
      announcementActive: false,
      defaultMetaTitle: "BROTHERS Holidays Adventure — Himalayan Field Journal & Premium Expeditions",
      defaultMetaDescription:
        "An alpine editorial journal of routes across Nepal, mapped with absolute elevation, topographic precision, and zero commercial filler.",
      defaultOgImage: "/images/trips/hero-ama-dablam.jpg",
    },
  });

  // 8. Seed PageSeo records
  for (const page of PAGE_SEO_DEFAULTS) {
    await prisma.pageSeo.upsert({
      where: { routePath: page.routePath },
      update: {
        pageLabel: page.pageLabel,
      },
      create: {
        routePath: page.routePath,
        pageLabel: page.pageLabel,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        metaKeywords: page.metaKeywords,
        ogTitle: page.metaTitle,
        ogDescription: page.metaDescription,
        ogImage: page.ogImage,
        noIndex: false,
      },
    });
  }

  const [
    tripsCount,
    countriesCount,
    categoriesCount,
    regionsCount,
    daysCount,
    departuresCount,
    treksCount,
    objectivesCount,
    journalCount,
    archiveCount,
    settingsCount,
    pageSeoCount,
    adminCount,
  ] = await Promise.all([
    prisma.trip.count(),
    prisma.destinationCountry.count(),
    prisma.tripCategory.count(),
    prisma.destinationRegion.count(),
    prisma.tripItineraryDay.count(),
    prisma.tripDeparture.count(),
    prisma.trekRoute.count(),
    prisma.expeditionObjective.count(),
    prisma.journalPost.count(),
    prisma.archiveEntry.count(),
    prisma.siteSetting.count(),
    prisma.pageSeo.count(),
    prisma.adminUser.count(),
  ]);

  console.log("Seed completed successfully:");
  console.log(`- AdminUser: ${adminCount}`);
  console.log(`- DestinationCountry: ${countriesCount}`);
  console.log(`- TripCategory: ${categoriesCount}`);
  console.log(`- DestinationRegion: ${regionsCount}`);
  console.log(`- Trip: ${tripsCount}`);
  console.log(`- TripItineraryDay: ${daysCount} (synced ${totalItineraryDays})`);
  console.log(`- TripDeparture: ${departuresCount} (created ${totalDeparturesCreated} this run)`);
  console.log(`- TrekRoute: ${treksCount}`);
  console.log(`- ExpeditionObjective: ${objectivesCount}`);
  console.log(`- JournalPost: ${journalCount}`);
  console.log(`- ArchiveEntry: ${archiveCount}`);
  console.log(`- SiteSetting: ${settingsCount}`);
  console.log(`- PageSeo: ${pageSeoCount}`);
}

main()
  .catch((err) => {
    console.error("Database seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
