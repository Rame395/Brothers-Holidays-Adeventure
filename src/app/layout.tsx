import type { Metadata } from "next";
import { Barlow_Condensed, Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RouteLoadingIndicator from "@/components/RouteLoadingIndicator";
import ExpeditionLoader from "@/components/ExpeditionLoader";
import BackgroundAudio from "@/components/site/BackgroundAudio";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { JsonLd } from "@/components/seo/JsonLd";
import { getNavTrips, getSiteSettings } from "@/lib/data";
import {
  absoluteUrl,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
  getSiteUrl,
} from "@/lib/seo";
import { Suspense } from "react";

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteUrl = getSiteUrl();
  const ogImage = absoluteUrl(settings.defaultOgImage);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings.defaultMetaTitle,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.defaultMetaDescription,
    keywords: [
      "Himalayan trekking",
      "Nepal expeditions",
      "Everest Base Camp Trek",
      "Manaslu Circuit",
      "Langtang Valley",
      "Alpine Field Journal",
      "BROTHERS Holidays Adventure",
    ],
    openGraph: {
      type: "website",
      siteName: settings.siteName,
      title: settings.defaultMetaTitle,
      description: settings.defaultMetaDescription,
      url: siteUrl,
      images: [{ url: ogImage, width: 1200, height: 630, alt: settings.siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.defaultMetaTitle,
      description: settings.defaultMetaDescription,
      images: [ogImage],
    },
    verification: {
      ...(settings.googleSiteVerification
        ? { google: settings.googleSiteVerification }
        : {}),
      ...(settings.bingSiteVerification
        ? { other: { "msvalidate.01": settings.bingSiteVerification } }
        : {}),
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, navTrips] = await Promise.all([
    getSiteSettings(),
    getNavTrips(),
  ]);

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${plusJakarta.variable} ${barlowCondensed.variable} scroll-smooth`}
    >
      <body className="bg-[#f6f4ef] font-sans text-[#141c1f] antialiased selection:bg-[#d8cfc0] selection:text-[#141c1f] min-h-screen flex flex-col">
        <JsonLd data={buildOrganizationJsonLd(settings)} />
        <JsonLd data={buildWebSiteJsonLd(settings)} />
        <Suspense fallback={null}>
          <GoogleAnalytics
            gaMeasurementId={settings.gaMeasurementId}
            gtmContainerId={settings.gtmContainerId}
            facebookPixelId={settings.facebookPixelId}
          />
        </Suspense>
        <Suspense fallback={null}>
          <ExpeditionLoader />
        </Suspense>
        <Suspense fallback={null}>
          <RouteLoadingIndicator />
        </Suspense>
        <Header navTrips={navTrips} />
        <main className="w-full flex-1">{children}</main>
        <Footer settings={settings} />
        <BackgroundAudio />
      </body>
    </html>
  );
}
