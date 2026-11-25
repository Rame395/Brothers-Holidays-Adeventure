import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { DestinationsCatalogClient } from "@/components/destinations/DestinationsCatalogClient";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getDestinationTaxonomy,
  getPublishedTrips,
  getSiteSettings,
} from "@/lib/data";
import {
  absoluteUrl,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
} from "@/lib/seo";

export const instant = false;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const rawRegion = sp.region;
  const regionSlug = Array.isArray(rawRegion) ? rawRegion[0] : rawRegion;

  if (regionSlug) {
    const [taxonomy, settings] = await Promise.all([
      getDestinationTaxonomy(),
      getSiteSettings(),
    ]);
    const region = taxonomy.regions.find((r) => r.slug === regionSlug);
    if (region) {
      const title =
        region.metaTitle?.trim() ||
        `${region.name} Treks & Guided Routes | ${settings.siteName}`;
      const description =
        region.metaDescription?.trim() ||
        region.blurb?.trim() ||
        settings.defaultMetaDescription;
      const focusKw = region.focusKeyword?.trim();
      const ogImage = absoluteUrl(region.heroImage || settings.defaultOgImage);

      return {
        title: { absolute: title },
        description,
        keywords: [
          ...(focusKw ? [focusKw] : []),
          `${region.name} trek`,
          `${region.name} trekking`,
          settings.siteName,
        ],
        openGraph: {
          type: "website",
          siteName: settings.siteName,
          title,
          description,
          images: [{ url: ogImage, alt: region.name }],
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          images: [ogImage],
        },
      };
    }
  }

  return buildPageMetadata("/destinations");
}

export default async function DestinationsPage() {
  await connection();
  const [trips, taxonomy] = await Promise.all([
    getPublishedTrips(),
    getDestinationTaxonomy(),
  ]);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Destinations", path: "/destinations" },
        ])}
      />
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-mono text-sm text-[#3f6e15]">
            Loading Himalayan Destinations…
          </div>
        }
      >
        <DestinationsCatalogClient trips={trips} taxonomy={taxonomy} />
      </Suspense>
    </>
  );
}
