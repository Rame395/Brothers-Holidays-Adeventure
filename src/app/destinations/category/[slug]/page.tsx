import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TaxonomyLandingView } from "@/components/destinations/TaxonomyLandingView";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getCategoryBySlug,
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
    if (taxonomy.categories.length === 0) return [{ slug: "__placeholder__" }];
    return taxonomy.categories.map((c) => ({ slug: c.slug }));
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
  const [category, settings] = await Promise.all([
    getCategoryBySlug(slug),
    getSiteSettings(),
  ]);

  if (!category) {
    return {
      title: "Category Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = `${category.name} in Nepal & the Himalayas | ${settings.siteName}`;
  const description =
    category.blurb?.trim() ||
    `Compare curated ${category.name} packages across Nepal, Tibet, and Bhutan with certified local guides and transparent all-inclusive pricing.`;
  const canonical = absoluteUrl(`/destinations/category/${category.slug}`);
  const ogImage = absoluteUrl(category.heroImage || settings.defaultOgImage);

  return {
    title: { absolute: title },
    description,
    keywords: [
      `${category.name} Nepal`,
      `${category.name} Himalayas`,
      "Nepal adventure",
      settings.siteName,
    ],
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: settings.siteName,
      title,
      description,
      url: canonical,
      images: [{ url: ogImage, alt: category.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

async function CategoryLandingContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, trips, taxonomy] = await Promise.all([
    getCategoryBySlug(slug),
    getPublishedTripsByFilter({ category: slug }),
    getDestinationTaxonomy(),
  ]);

  if (!category) {
    notFound();
  }

  const siblings = taxonomy.categories.map((cat) => ({
    label: cat.name,
    href: `/destinations/category/${cat.slug}`,
    active: cat.slug === category.slug,
  }));

  const description =
    category.blurb?.trim() ||
    `Explore curated ${category.name} itineraries across the Himalayas, built for proper acclimatization, local immersion, and reliable field logistics.`;

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Destinations", path: "/destinations" },
          {
            name: category.name,
            path: `/destinations/category/${category.slug}`,
          },
        ])}
      />
      <JsonLd
        data={buildCollectionItemListJsonLd({
          name: `${category.name} Packages`,
          description,
          path: `/destinations/category/${category.slug}`,
          trips,
        })}
      />
      <TaxonomyLandingView
        eyebrow="Expedition Style"
        title={category.name}
        description={description}
        heroImage={category.heroImage}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Destinations", href: "/destinations" },
          { label: category.name },
        ]}
        trips={trips}
        siblingTitle="Browse Expedition Categories"
        siblings={siblings}
      />
    </>
  );
}

export default function CategoryLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-mono text-sm text-[#104b87]">
          Loading Category Packages…
        </div>
      }
    >
      <CategoryLandingContent params={params} />
    </Suspense>
  );
}
