import type { Metadata } from "next";
import { ExpeditionsClient } from "@/components/expeditions/ExpeditionsClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { getExpeditionObjectives } from "@/lib/data";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/expeditions");
}

export default async function ExpeditionsPage() {
  const objectives = await getExpeditionObjectives();

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Expeditions", path: "/expeditions" },
        ])}
      />
      <ExpeditionsClient objectives={objectives} />
    </>
  );
}
