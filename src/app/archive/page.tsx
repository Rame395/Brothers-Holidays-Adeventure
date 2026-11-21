import type { Metadata } from "next";
import { ArchiveClient } from "@/components/archive/ArchiveClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { getArchiveEntries } from "@/lib/data";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/archive");
}

export default async function ArchivePage() {
  const entries = await getArchiveEntries();

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Expedition Archive", path: "/archive" },
        ])}
      />
      <ArchiveClient initialEntries={entries} />
    </>
  );
}
