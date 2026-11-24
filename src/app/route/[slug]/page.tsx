import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getPublishedTrekRoutes,
  getSiteSettings,
  getTrekRouteBySlug,
} from "@/lib/data";
import { buildBreadcrumbJsonLd, buildTrekRouteMetadata } from "@/lib/seo";
import RouteDetailsClient from "./RouteDetailsClient";

export async function generateStaticParams() {
  try {
    const treks = await getPublishedTrekRoutes();
    if (treks.length === 0) return [{ slug: "__placeholder__" }];
    return treks.map((trek) => ({
      slug: trek.slug,
    }));
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
  const [trek, settings] = await Promise.all([
    getTrekRouteBySlug(slug),
    getSiteSettings(),
  ]);

  if (!trek) {
    return {
      title: "Route Dossier Not Found",
      robots: { index: false, follow: false },
    };
  }

  return buildTrekRouteMetadata(trek, settings);
}

async function RouteDetailContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trek = await getTrekRouteBySlug(slug);

  if (!trek) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-4xl text-on-surface">
          Route Dossier Not Found
        </h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          This technical route specification could not be found in our survey
          archive.
        </p>
        <Link
          href="/treks"
          className="mt-6 rounded-full bg-primary-container px-6 py-2.5 font-label-md uppercase tracking-wider text-on-primary"
        >
          Browse All Treks
        </Link>
      </div>
    );
  }

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Treks Directory", path: "/treks" },
          { name: trek.name, path: `/route/${trek.slug}` },
        ])}
      />
      <RouteDetailsClient trek={trek} />
    </>
  );
}

export default function RouteDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="font-headline-sm text-primary">
            Loading Expedition Dossier...
          </p>
        </div>
      }
    >
      <RouteDetailContent params={params} />
    </Suspense>
  );
}
