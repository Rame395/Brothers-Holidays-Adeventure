import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";
import prisma from "@/lib/prisma";
import { absoluteUrl, getSiteUrl } from "@/lib/seo";

async function getSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("hours");
  cacheTag("trips", "treks", "journal", "seo");

  const base = getSiteUrl();
  const [trips, trekRoutes, posts] = await Promise.all([
    prisma.trip.findMany({
      where: { isPublished: true },
      select: { slug: true, image: true, updatedAt: true },
    }),
    prisma.trekRoute.findMany({
      where: { isPublished: true },
      select: { slug: true, image: true, updatedAt: true },
    }),
    prisma.journalPost.findMany({
      where: { isPublished: true },
      select: { slug: true, image: true, updatedAt: true },
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

  const tripRoutes: MetadataRoute.Sitemap = trips.map((trip) => ({
    url: `${base}/destinations/${trip.slug}`,
    lastModified: trip.updatedAt,
    changeFrequency: "weekly",
    priority: 0.9,
    images: trip.image ? [absoluteUrl(trip.image)] : undefined,
  }));

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

  return [...staticRoutes, ...tripRoutes, ...routePages, ...journalRoutes];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getSitemapEntries();
}
