import "server-only";
import prisma from "@/lib/prisma";

export interface AdminCountryWithCounts {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  heroImage: string;
  sortOrder: number;
  isActive: boolean;
  tripCount: number;
  regionCount: number;
}

export interface AdminCategoryWithCounts {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  heroImage: string;
  groupByRegion: boolean;
  sortOrder: number;
  isActive: boolean;
  tripCount: number;
}

export interface AdminRegionWithCounts {
  id: string;
  slug: string;
  name: string;
  countryId: string;
  countrySlug: string;
  countryName: string;
  blurb: string;
  heroImage: string;
  sortOrder: number;
  isActive: boolean;
  tripCount: number;
}

export async function getAdminTaxonomyWithCounts(): Promise<{
  countries: AdminCountryWithCounts[];
  categories: AdminCategoryWithCounts[];
  regions: AdminRegionWithCounts[];
}> {
  const [countries, categories, regions, trips] = await Promise.all([
    prisma.destinationCountry.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { regions: true } } },
    }),
    prisma.tripCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.destinationRegion.findMany({
      orderBy: [{ countrySlug: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      include: { country: { select: { name: true } } },
    }),
    prisma.trip.findMany({
      select: { country: true, categories: true, region: true },
    }),
  ]);

  const countryTripCounts = new Map<string, number>();
  const categoryTripCounts = new Map<string, number>();
  const regionTripCounts = new Map<string, number>();

  for (const trip of trips) {
    countryTripCounts.set(
      trip.country,
      (countryTripCounts.get(trip.country) ?? 0) + 1
    );
    for (const cat of trip.categories) {
      categoryTripCounts.set(cat, (categoryTripCounts.get(cat) ?? 0) + 1);
    }
    if (trip.region) {
      regionTripCounts.set(
        trip.region,
        (regionTripCounts.get(trip.region) ?? 0) + 1
      );
    }
  }

  return {
    countries: countries.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      blurb: c.blurb,
      heroImage: c.heroImage,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      tripCount: countryTripCounts.get(c.slug) ?? 0,
      regionCount: c._count.regions,
    })),
    categories: categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      blurb: cat.blurb,
      heroImage: cat.heroImage,
      groupByRegion: cat.groupByRegion,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
      tripCount: categoryTripCounts.get(cat.slug) ?? 0,
    })),
    regions: regions.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      countryId: r.countryId,
      countrySlug: r.countrySlug,
      countryName: r.country.name,
      blurb: r.blurb,
      heroImage: r.heroImage,
      sortOrder: r.sortOrder,
      isActive: r.isActive,
      tripCount: regionTripCounts.get(r.slug) ?? 0,
    })),
  };
}
