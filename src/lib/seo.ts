import type { Metadata } from "next";
import { getPageSeo, getSiteSettings } from "@/lib/data";
import type {
  JournalPostDTO,
  SiteSettingDTO,
  TrekRouteDTO,
  TripDTO,
  TripFaqDTO,
} from "@/lib/types";

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL || "https://brothersholidays.com";
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  if (!path) return getSiteUrl();
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${clean}`;
}

export interface PageSeoFallback {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

function formatNextTitle(title: string, siteName: string): Metadata["title"] {
  if (
    /brothers\s+holidays/i.test(title) ||
    title.toLowerCase().includes(siteName.toLowerCase())
  ) {
    return { absolute: title };
  }
  return title;
}

export async function buildPageMetadata(
  routePath: string,
  fallback?: PageSeoFallback
): Promise<Metadata> {
  const [seo, settings] = await Promise.all([
    getPageSeo(routePath),
    getSiteSettings(),
  ]);

  const title =
    seo?.metaTitle ||
    fallback?.title ||
    settings.defaultMetaTitle ||
    settings.siteName;
  const description =
    seo?.metaDescription ||
    fallback?.description ||
    settings.defaultMetaDescription;
  const keywords =
    seo?.metaKeywords?.length
      ? seo.metaKeywords
      : fallback?.keywords || [
          "Himalayan trekking",
          "Nepal expeditions",
          "BROTHERS Holidays Adventure",
        ];
  const ogImage = absoluteUrl(
    seo?.ogImage || fallback?.ogImage || settings.defaultOgImage
  );
  const canonical = seo?.canonicalUrl || absoluteUrl(routePath);

  return {
    title: formatNextTitle(title, settings.siteName),
    description,
    keywords,
    alternates: {
      canonical,
    },
    robots: seo?.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: settings.siteName,
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      url: canonical,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      images: [ogImage],
    },
  };
}

export function buildTripMetadata(
  trip: TripDTO,
  settings: SiteSettingDTO
): Metadata {
  const title =
    trip.metaTitle ||
    `${trip.name} (${trip.days} ${trip.days === 1 ? "Day" : "Days"}) | ${settings.siteName}`;
  const description =
    trip.metaDescription ||
    `${trip.tagline} Max altitude ${trip.maxAltitude.toLocaleString("en-US")}m. ${trip.overview}`.slice(
      0,
      160
    );
  const canonical =
    trip.canonicalUrl || absoluteUrl(`/destinations/${trip.slug}`);
  const ogImage = absoluteUrl(trip.ogImage || trip.image);

  return {
    title: formatNextTitle(title, settings.siteName),
    description,
    keywords: trip.metaKeywords?.length
      ? trip.metaKeywords
      : [
          trip.name,
          trip.area,
          `${trip.country} trekking`,
          settings.siteName,
        ],
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: settings.siteName,
      title,
      description,
      url: canonical,
      images: [
        {
          url: ogImage,
          width: 1600,
          height: 1008,
          alt: trip.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function buildTrekRouteMetadata(
  trek: TrekRouteDTO,
  settings: SiteSettingDTO
): Metadata {
  const title =
    trek.metaTitle ||
    `${trek.name} (${trek.duration} Days) | Route Survey — ${settings.siteName}`;
  const description = trek.metaDescription || trek.description;
  const canonical = absoluteUrl(`/route/${trek.slug}`);
  const ogImage = absoluteUrl(trek.image || settings.defaultOgImage);

  return {
    title: formatNextTitle(title, settings.siteName),
    description,
    keywords: [
      trek.name,
      trek.range,
      trek.region,
      trek.highestPointName,
      "Nepal trekking route",
    ],
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: settings.siteName,
      title,
      description,
      url: canonical,
      images: [{ url: ogImage, alt: trek.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function buildJournalMetadata(
  post: JournalPostDTO,
  settings: SiteSettingDTO
): Metadata {
  const title =
    post.metaTitle || `${post.title} | Alpine Field Journal — ${settings.siteName}`;
  const description = post.metaDescription || post.excerpt;
  const canonical = post.canonicalUrl || absoluteUrl(`/journal/${post.slug}`);
  const ogImage = absoluteUrl(post.ogImage || post.image);

  return {
    title: formatNextTitle(title, settings.siteName),
    description,
    keywords: post.metaKeywords?.length
      ? post.metaKeywords
      : [post.title, post.category, ...post.tags],
    alternates: { canonical },
    openGraph: {
      type: "article",
      siteName: settings.siteName,
      title,
      description,
      url: canonical,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.authorName],
      images: [{ url: ogImage, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function buildOrganizationJsonLd(settings: SiteSettingDTO) {
  const sameAs = [
    settings.instagramUrl,
    settings.facebookUrl,
    settings.youtubeUrl,
    settings.tripadvisorUrl,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": ["TravelAgency", "LocalBusiness"],
    name: settings.siteName,
    description: settings.defaultMetaDescription,
    url: getSiteUrl(),
    logo: absoluteUrl("/images/brothers_holidays_adventure_logo_8k.png"),
    image: absoluteUrl(settings.defaultOgImage),
    telephone: settings.contactPhone,
    email: settings.contactEmail,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.officeAddress,
      addressLocality: "Kathmandu",
      addressRegion: "Bagmati",
      postalCode: "44600",
      addressCountry: "NP",
    },
    priceRange: "$$$",
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function buildWebSiteJsonLd(settings: SiteSettingDTO) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.siteName,
    url: getSiteUrl(),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getSiteUrl()}/destinations?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildTouristTripJsonLd(
  trip: TripDTO,
  settings: SiteSettingDTO
) {
  const reviewCount = trip.reviews.length;
  const avgRating =
    reviewCount > 0
      ? Number(
          (
            trip.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
          ).toFixed(1)
        )
      : null;

  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: trip.name,
    description: trip.overview,
    url: absoluteUrl(`/destinations/${trip.slug}`),
    image: [trip.image, ...trip.gallery].map((img) => absoluteUrl(img)),
    touristType: trip.categories,
    provider: {
      "@type": "TravelAgency",
      name: settings.siteName,
      url: getSiteUrl(),
    },
    itinerary: {
      "@type": "ItemList",
      numberOfItems: trip.itinerary.length,
      itemListElement: trip.itinerary.map((day, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: `Day ${day.day}: ${day.title} (${day.altitude}m)`,
        ...(day.note ? { description: day.note } : {}),
      })),
    },
    offers: {
      "@type": "Offer",
      price: trip.price,
      priceCurrency: settings.defaultCurrency || "NPR",
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`/destinations/${trip.slug}#book`),
    },
    ...(avgRating !== null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating,
            reviewCount,
          },
        }
      : {}),
  };
}

export function buildFaqJsonLd(faqs: TripFaqDTO[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export function buildArticleJsonLd(
  post: JournalPostDTO,
  settings: SiteSettingDTO
) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: absoluteUrl(post.image),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: absoluteUrl(`/journal/${post.slug}`),
    author: {
      "@type": "Person",
      name: post.authorName,
      jobTitle: post.authorRole,
    },
    publisher: {
      "@type": "Organization",
      name: settings.siteName,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/images/brothers_holidays_adventure_logo_8k.png"),
      },
    },
  };
}
