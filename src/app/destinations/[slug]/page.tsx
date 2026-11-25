import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { TripDetailView } from "@/components/destinations/TripDetailView";
import { JsonLd } from "@/components/seo/JsonLd";
import prisma from "@/lib/prisma";
import {
  getAllTripSlugs,
  getRelatedTrips,
  getSiteSettings,
  getTripBySlug,
} from "@/lib/data";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildTouristTripJsonLd,
  buildTripMetadata,
} from "@/lib/seo";

export async function generateStaticParams() {
  try {
    const slugs = await getAllTripSlugs();
    if (slugs.length === 0) return [{ slug: "__placeholder__" }];
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [{ slug: "__placeholder__" }];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [trip, settings] = await Promise.all([
    getTripBySlug(slug),
    getSiteSettings(),
  ]);

  if (!trip) {
    return {
      title: "Route Not Found",
      description:
        "That Himalayan journey could not be located in our expedition ledger.",
      robots: { index: false, follow: false },
    };
  }

  return buildTripMetadata(trip, settings);
}

async function DestinationDetailContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [trip, settings] = await Promise.all([
    getTripBySlug(slug),
    getSiteSettings(),
  ]);

  if (!trip) {
    return (
      <div className="min-h-[70vh] bg-[#f8fafc] flex flex-col items-center justify-center px-5 text-center">
        <h1 className="font-serif text-4xl sm:text-5xl text-[#1c1917]">
          Route Not Found
        </h1>
        <p className="mt-3 text-sm text-[#57534d]">
          That Himalayan journey could not be located in our expedition ledger.
        </p>
        <Link
          href="/destinations"
          className="mt-6 rounded-full bg-[#3f6e15] px-6 py-2.5 font-mono text-xs uppercase tracking-widest font-semibold text-white hover:bg-[#315710]"
        >
          Browse All Destinations
        </Link>
      </div>
    );
  }

  const [related, travelGuides] = await Promise.all([
    getRelatedTrips(trip.slug, trip.region, trip.categories, 3),
    prisma.travelGuide.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        title: true,
        location: true,
        focusKeyword: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <>
      <JsonLd data={buildTouristTripJsonLd(trip, settings)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Destinations", path: "/destinations" },
          { name: trip.name, path: `/destinations/${trip.slug}` },
        ])}
      />
      {trip.faqs.length > 0 && <JsonLd data={buildFaqJsonLd(trip.faqs)} />}
      <TripDetailView
        trip={trip}
        related={related}
        whatsappNumber={settings.whatsappNumber}
        travelGuides={travelGuides}
      />
    </>
  );
}

export default function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-mono text-sm text-[#3f6e15]">
          Loading Expedition Dossier…
        </div>
      }
    >
      <DestinationDetailContent params={params} />
    </Suspense>
  );
}
