import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TaxonomyLandingView } from "@/components/destinations/TaxonomyLandingView";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getDestinationTaxonomy,
  getPublishedTripsByFilter,
  getRegionBySlug,
  getSiteSettings,
} from "@/lib/data";
import {
  absoluteUrl,
  buildBreadcrumbJsonLd,
  buildCollectionItemListJsonLd,
} from "@/lib/seo";

export async function generateStaticParams() {
  const taxonomy = await getDestinationTaxonomy();
  return taxonomy.regions.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [region, settings] = await Promise.all([
    getRegionBySlug(slug),
    getSiteSettings(),
  ]);

  if (!region) {
    return {
      title: "Region Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = `${region.name} Treks & Guided Routes in ${region.country.name} | ${settings.siteName}`;
  const description =
    region.blurb?.trim() ||
    `Discover acclimatization-first trekking itineraries, altitudes, permits, and Sherpa-guided departures across ${region.name}, ${region.country.name}.`;
  const canonical = absoluteUrl(`/destinations/region/${region.slug}`);
  const ogImage = absoluteUrl(region.heroImage || settings.defaultOgImage);

  return {
    title: { absolute: title },
    description,
    keywords: [
      `${region.name} trek`,
      `${region.name} trekking`,
      `${region.country.name} trekking`,
      settings.siteName,
    ],
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: settings.siteName,
      title,
      description,
      url: canonical,
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

async function RegionLandingContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [region, trips, taxonomy] = await Promise.all([
    getRegionBySlug(slug),
    getPublishedTripsByFilter({ region: slug }),
    getDestinationTaxonomy(),
  ]);

  if (!region) {
    notFound();
  }

  const siblings = taxonomy.regions
    .filter((r) => r.countrySlug === region.country.slug)
    .map((r) => ({
      label: r.name,
      href: `/destinations/region/${r.slug}`,
      active: r.slug === region.slug,
    }));

  const description =
    region.blurb?.trim() ||
    `Explore guided treks, high passes, and teahouse itineraries across ${region.name} in ${region.country.name}, led by seasoned Sherpa professionals.`;

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Destinations", path: "/destinations" },
          {
            name: region.country.name,
            path: `/destinations/country/${region.country.slug}`,
          },
          { name: region.name, path: `/destinations/region/${region.slug}` },
        ])}
      />
      <JsonLd
        data={buildCollectionItemListJsonLd({
          name: `${region.name} Treks & Routes`,
          description,
          path: `/destinations/region/${region.slug}`,
          trips,
        })}
      />
      <TaxonomyLandingView
        eyebrow={`${region.country.name} · Trekking Region`}
        title={region.name}
        description={description}
        heroImage={region.heroImage}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Destinations", href: "/destinations" },
          {
            label: region.country.name,
            href: `/destinations/country/${region.country.slug}`,
          },
          { label: region.name },
        ]}
        trips={trips}
        siblingTitle={`Trekking Regions in ${region.country.name}`}
        siblings={siblings}
      />
    </>
  );
}

export default function RegionLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-mono text-sm text-[#104b87]">
          Loading Regional Routes…
        </div>
      }
    >
      <RegionLandingContent params={params} />
    </Suspense>
  );
}
