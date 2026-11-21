import type { Metadata } from "next";
import { ContactClient } from "@/components/contact/ContactClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteSettings } from "@/lib/data";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/contact");
}

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact Us", path: "/contact" },
        ])}
      />
      <ContactClient settings={settings} />
    </>
  );
}
