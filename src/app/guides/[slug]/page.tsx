import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react";
import { TripCard } from "@/components/destinations/TripCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublishedTrips, getSiteSettings } from "@/lib/data";
import { sanitizeRichHtml } from "@/lib/html-sanitize";
import prisma from "@/lib/prisma";
import { absoluteUrl, buildBreadcrumbJsonLd } from "@/lib/seo";
import { matchTravelGuideForDayTitle } from "@/lib/travel-guides";

export const instant = false;

function estimateReadingMinutes(html: string): number {
  const plain = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = plain ? plain.split(" ").length : 0;
  return Math.max(2, Math.round(words / 200));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [guide, settings] = await Promise.all([
    prisma.travelGuide.findUnique({ where: { slug } }),
    getSiteSettings(),
  ]);

  if (!guide || !guide.isPublished) {
    return {
      title: "Travel Guide Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = guide.metaTitle?.trim() || guide.title;
  const description =
    guide.metaDescription?.trim() ||
    guide.subtitle?.trim() ||
    `Explore ${guide.location} travel tips, attractions, altitude advice, and trek routes with ${settings.siteName}.`;
  const canonical = absoluteUrl(`/guides/${guide.slug}`);
  const ogImage = absoluteUrl(guide.heroImage || settings.defaultOgImage);

  return {
    title,
    description,
    keywords: guide.focusKeyword
      ? [guide.focusKeyword, guide.location, settings.siteName]
      : [guide.title, guide.location, settings.siteName],
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      publishedTime: guide.createdAt.toISOString(),
      modifiedTime: guide.updatedAt.toISOString(),
      images: [{ url: ogImage, width: 1200, height: 630, alt: guide.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function TravelGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;

  const [guide, allTrips, settings] = await Promise.all([
    prisma.travelGuide.findUnique({ where: { slug } }),
    getPublishedTrips(),
    getSiteSettings(),
  ]);

  if (!guide || !guide.isPublished) {
    notFound();
  }

  const safeHtml = sanitizeRichHtml(guide.content);
  const readMins = estimateReadingMinutes(safeHtml);
  const guidePath = `/guides/${guide.slug}`;

  const matchingTrips = allTrips.filter((t) =>
    t.itinerary.some(
      (day) =>
        day.guideUrl?.trim() === guidePath ||
        matchTravelGuideForDayTitle(day.title, [guide]) !== null
    )
  );
  const relatedTrips =
    matchingTrips.length > 0 ? matchingTrips.slice(0, 3) : allTrips.slice(0, 3);

  const articleJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.metaTitle?.trim() || guide.title,
    description: guide.metaDescription?.trim() || guide.subtitle || guide.title,
    image: absoluteUrl(guide.heroImage),
    datePublished: guide.createdAt.toISOString(),
    dateModified: guide.updatedAt.toISOString(),
    mainEntityOfPage: absoluteUrl(guidePath),
    author: {
      "@type": "Organization",
      name: settings.siteName,
    },
    publisher: {
      "@type": "Organization",
      name: settings.siteName,
    },
  };

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Travel Guides", path: "/guides" },
          { name: guide.title, path: guidePath },
        ])}
      />
      <JsonLd data={articleJsonLd} />

      <div className="min-h-screen bg-[#faf9f7] text-[#1c1917]">
        <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-6 pb-16 space-y-8">
          {/* Breadcrumb + Back Link */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-[#57534d]">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2">
              <Link href="/" className="hover:text-[#3f6e15] transition-colors">
                Home
              </Link>
              <span className="text-stone-300">/</span>
              <Link
                href="/guides"
                className="hover:text-[#3f6e15] transition-colors"
              >
                Travel Guides
              </Link>
              <span className="text-stone-300">/</span>
              <span className="text-[#3f6e15] font-semibold truncate max-w-[240px] sm:max-w-md">
                {guide.location}
              </span>
            </nav>

            <Link
              href="/destinations"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3f6e15] hover:text-[#f05e25] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Browse All Treks</span>
            </Link>
          </div>

          {/* Guide Header */}
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3f6e15]/10 border border-[#3f6e15]/20 px-3 py-1 text-[#3f6e15]">
                <MapPin className="h-3.5 w-3.5 text-[#f05e25]" />
                <span>{guide.location}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-stone-200 px-3 py-1 text-[#57534d]">
                <Clock className="h-3.5 w-3.5 text-[#3f6e15]" />
                <span>{readMins} min read</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-stone-200 px-3 py-1 text-[#57534d]">
                <Calendar className="h-3.5 w-3.5 text-[#3f6e15]" />
                <span>
                  Updated{" "}
                  {guide.updatedAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#1c1917] leading-[1.1] tracking-tight">
              {guide.title}
            </h1>

            {guide.subtitle && (
              <p className="text-base sm:text-lg text-[#57534d] leading-relaxed">
                {guide.subtitle}
              </p>
            )}
          </header>

          {/* Hero Photograph */}
          {guide.heroImage && (
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={guide.heroImage}
                alt={guide.title}
                className="w-full max-h-[420px] object-cover"
              />
            </div>
          )}

          {/* Sanitized Rich Guide Content */}
          <div className="rounded-2xl border border-stone-200/85 bg-white p-6 sm:p-10 shadow-[0_2px_16px_-4px_rgba(28,25,23,0.06)]">
            {safeHtml ? (
              <div
                className="region-seo-prose"
                dangerouslySetInnerHTML={{ __html: safeHtml }}
              />
            ) : (
              <p className="text-sm text-[#57534d]">
                Our editorial team is finalizing detailed trail notes for{" "}
                {guide.location}. Contact our Kathmandu leads for customized
                trip planning.
              </p>
            )}
          </div>
        </article>

        {/* Related Trips Visiting This Stop */}
        {relatedTrips.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 border-t border-stone-200">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f05e25]">
                  Guided Departures
                </p>
                <h2 className="mt-1 font-heading text-2xl sm:text-3xl font-bold text-[#3f6e15] tracking-tight">
                  {matchingTrips.length > 0
                    ? `Explore Treks Visiting ${guide.location}`
                    : "Explore Popular Himalayan Journeys"}
                </h2>
              </div>

              <Link
                href="/destinations"
                className="text-xs sm:text-sm font-semibold text-[#3f6e15] hover:text-[#f05e25] transition-colors"
              >
                View All Trips ↗
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedTrips.map((trip, i) => (
                <TripCard key={trip.slug} trip={trip} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
