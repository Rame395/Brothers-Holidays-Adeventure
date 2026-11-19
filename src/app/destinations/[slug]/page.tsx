import Link from "next/link";
import { TRIPS, getTrip } from "@/data/trips";
import { TripDetailView } from "@/components/destinations/TripDetailView";

export function generateStaticParams() {
  return TRIPS.map((trip) => ({
    slug: trip.slug,
  }));
}

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trip = getTrip(slug);

  if (!trip) {
    return (
      <div className="min-h-[70vh] bg-[#f8fafb] flex flex-col items-center justify-center px-5 text-center">
        <h1 className="font-serif text-4xl sm:text-5xl text-[#111d1f]">
          Route Not Found
        </h1>
        <p className="mt-3 text-sm text-[#55606a]">
          That Himalayan journey could not be located in our expedition ledger.
        </p>
        <Link
          href="/destinations"
          className="mt-6 rounded-full bg-[#00515b] px-6 py-2.5 font-mono text-xs uppercase tracking-widest font-semibold text-white hover:bg-[#003840]"
        >
          Browse All Destinations
        </Link>
      </div>
    );
  }

  return <TripDetailView trip={trip} />;
}
