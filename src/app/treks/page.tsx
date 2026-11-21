import type { Metadata } from "next";
import { TreksDirectoryClient } from "@/components/treks/TreksDirectoryClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublishedTrekRoutes } from "@/lib/data";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/treks");
}

export default async function TreksDirectoryPage() {
  const treks = await getPublishedTrekRoutes();

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Treks Directory", path: "/treks" },
        ])}
      />
      <TreksDirectoryClient treks={treks} />
    </>
  );
}
