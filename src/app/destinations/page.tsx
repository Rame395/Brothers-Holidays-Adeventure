import type { Metadata } from "next";
import { Suspense } from "react";
import { DestinationsCatalogClient } from "@/components/destinations/DestinationsCatalogClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublishedTrips } from "@/lib/data";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/destinations");
}

export default async function DestinationsPage() {
  const trips = await getPublishedTrips();

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
          <div className="min-h-screen bg-[#f8fafb] flex items-center justify-center font-mono text-sm text-[#00515b]">
            Loading Himalayan Destinations…
          </div>
        }
      >
        <DestinationsCatalogClient trips={trips} />
      </Suspense>
    </>
  );
}
