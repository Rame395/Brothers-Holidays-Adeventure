import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";
import prisma from "@/lib/prisma";
import { absoluteUrl, getSiteUrl } from "@/lib/seo";

async function getSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("hours");
  cacheTag("trips", "treks", "journal", "taxonomy", "seo");

  const base = getSiteUrl();
  const [countries, regions, categories, trips, trekRoutes, posts, guides] =
    await Promise.all([
      prisma.destinationCountry.findMany({
        where: { isActive: true },
        select: { slug: true, heroImage: true, updatedAt: true },
      }),
      prisma.destinationRegion.findMany({
        where: { isActive: true },
        select: { slug: true, heroImage: true, updatedAt: true },
      }),
      prisma.tripCategory.findMany({
        where: { isActive: true },
        select: { slug: true, heroImage: true, updatedAt: true },
      }),
      prisma.trip.findMany({
        where: { isPublished: true },
        select: {
          slug: true,
          image: true,
          gallery: true,
          mapImage: true,
          updatedAt: true,
        },
      }),
      prisma.trekRoute.findMany({
        where: { isPublished: true },
        select: { slug: true, image: true, updatedAt: true },
      }),
      prisma.journalPost.findMany({
        where: { isPublished: true },
        select: { slug: true, image: true, updatedAt: true },
      }),
      prisma.travelGuide.findMany({
        where: { isPublished: true },
        select: { slug: true, heroImage: true, updatedAt: true },
      }),
    ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/destinations`, changeFrequency: "weekly", priority: 0.95 },
    { url: `${base}/treks`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/expeditions`, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/journal`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/process`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/archive`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.75 },
  ];

  const countryRoutes: MetadataRoute.Sitemap = countries.map((c) => ({
    url: `${base}/destinations/country/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.9,
    images: c.heroImage ? [absoluteUrl(c.heroImage)] : undefined,
  }));

  const regionRoutes: MetadataRoute.Sitemap = regions.map((r) => ({
    url: `${base}/destinations/region/${r.slug}`,
    lastModified: r.updatedAt,
    changeFrequency: "weekly",
    priority: 0.9,
    images: r.heroImage ? [absoluteUrl(r.heroImage)] : undefined,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${base}/destinations/category/${cat.slug}`,
    lastModified: cat.updatedAt,
    changeFrequency: "weekly",
    priority: 0.85,
    images: cat.heroImage ? [absoluteUrl(cat.heroImage)] : undefined,
  }));

  const tripRoutes: MetadataRoute.Sitemap = trips.map((trip) => {
    const imgs = Array.from(
      new Set(
        [
          trip.image,
          ...(trip.gallery ?? []),
          ...(trip.mapImage ? [trip.mapImage] : []),
        ].filter(Boolean)
      )
    ).map((img) => absoluteUrl(img));

    return {
      url: `${base}/destinations/${trip.slug}`,
      lastModified: trip.updatedAt,
      changeFrequency: "weekly",
      priority: 0.9,
      images: imgs.length > 0 ? imgs : undefined,
    };
  });

  const routePages: MetadataRoute.Sitemap = trekRoutes.map((trek) => ({
    url: `${base}/route/${trek.slug}`,
    lastModified: trek.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
    images: trek.image ? [absoluteUrl(trek.image)] : undefined,
  }));

  const journalRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/journal/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
    images: post.image ? [absoluteUrl(post.image)] : undefined,
  }));

  const guideRoutes: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: `${base}/guides/${guide.slug}`,
    lastModified: guide.updatedAt,
    changeFrequency: "monthly",
    priority: 0.85,
    images: guide.heroImage ? [absoluteUrl(guide.heroImage)] : undefined,
  }));

  return [
    ...staticRoutes,
    ...countryRoutes,
    ...regionRoutes,
    ...categoryRoutes,
    ...tripRoutes,
    ...routePages,
    ...journalRoutes,
    { url: `${base}/guides`, changeFrequency: "weekly", priority: 0.8 },
    ...guideRoutes,
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getSitemapEntries();
}
