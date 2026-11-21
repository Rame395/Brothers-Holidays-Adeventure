import type { Metadata } from "next";
import { JournalClient } from "@/components/journal/JournalClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublishedJournalPosts } from "@/lib/data";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/journal");
}

export default async function JournalPage() {
  const stories = await getPublishedJournalPosts();

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Alpine Field Journal", path: "/journal" },
        ])}
      />
      <JournalClient stories={stories} />
    </>
  );
}
