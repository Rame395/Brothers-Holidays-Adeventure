import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TaxonomyLandingView } from "@/components/destinations/TaxonomyLandingView";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getCountryBySlug,
  getDestinationTaxonomy,
  getPublishedTripsByFilter,
  getSiteSettings,
} from "@/lib/data";
import {
  absoluteUrl,
  buildBreadcrumbJsonLd,
  buildCollectionItemListJsonLd,
} from "@/lib/seo";

export async function generateStaticParams() {
  try {
    const taxonomy = await getDestinationTaxonomy();
    if (taxonomy.countries.length === 0) return [{ slug: "__placeholder__" }];
    return taxonomy.countries.map((c) => ({ slug: c.slug }));
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
  const [country, settings] = await Promise.all([
    getCountryBySlug(slug),
    getSiteSettings(),
  ]);

  if (!country) {
    return {
      title: "Destination Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = `${country.name} Trekking & Adventure Tours | ${settings.siteName}`;
  const description =
    country.blurb?.trim() ||
    `Explore guided Himalayan trekking routes, cultural tours, and mountain expeditions across ${country.name} with licensed local guides.`;
  const canonical = absoluteUrl(`/destinations/country/${country.slug}`);
  const ogImage = absoluteUrl(country.heroImage || settings.defaultOgImage);

  return {
    title: { absolute: title },
    description,
    keywords: [
      `${country.name} trekking`,
      `${country.name} tours`,
      `${country.name} expeditions`,
      settings.siteName,
    ],
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: settings.siteName,
      title,
      description,
      url: canonical,
      images: [{ url: ogImage, alt: country.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

async function CountryLandingContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [country, trips, taxonomy] = await Promise.all([
    getCountryBySlug(slug),
    getPublishedTripsByFilter({ country: slug }),
    getDestinationTaxonomy(),
  ]);

  if (!country) {
    notFound();
  }

  const countryRegions = taxonomy.regions.filter(
    (r) => r.countrySlug === country.slug
  );
  const siblings =
    countryRegions.length > 0
      ? countryRegions.map((r) => ({
          label: r.name,
          href: `/destinations/region/${r.slug}`,
        }))
      : taxonomy.countries.map((c) => ({
          label: c.name,
          href: `/destinations/country/${c.slug}`,
          active: c.slug === country.slug,
        }));

  const description =
    country.blurb?.trim() ||
    `Guided trekking routes, alpine passes, and cultural journeys across ${country.name}, curated by our Kathmandu operations team.`;

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Destinations", path: "/destinations" },
          { name: country.name, path: `/destinations/country/${country.slug}` },
        ])}
      />
      <JsonLd
        data={buildCollectionItemListJsonLd({
          name: `${country.name} Trekking & Adventure Routes`,
          description,
          path: `/destinations/country/${country.slug}`,
          trips,
        })}
      />
      <TaxonomyLandingView
        eyebrow="Himalayan Country Guide"
        title={`${country.name} Expeditions & Treks`}
        description={description}
        heroImage={country.heroImage}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Destinations", href: "/destinations" },
          { label: country.name },
        ]}
        trips={trips}
        siblingTitle={
          countryRegions.length > 0
            ? `Explore Regions in ${country.name}`
            : "Other Destination Countries"
        }
        siblings={siblings}
      />
    </>
  );
}

export default function CountryLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-mono text-sm text-[#104b87]">
          Loading Country Expeditions…
        </div>
      }
    >
      <CountryLandingContent params={params} />
    </Suspense>
  );
}
