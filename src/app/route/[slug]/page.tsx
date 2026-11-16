import { Suspense } from "react";
import { TREKS } from "@/data/treks";
import RouteDetailsClient from "./RouteDetailsClient";

export function generateStaticParams() {
  return TREKS.map((trek) => ({
    slug: trek.slug,
  }));
}

export default async function RouteDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="font-headline-sm text-primary">Loading Expedition Dossier...</p>
        </div>
      }
    >
      <RouteDetailsClient slug={resolvedParams.slug} />
    </Suspense>
  );
}
