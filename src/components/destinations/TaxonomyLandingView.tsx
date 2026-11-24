import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Compass, MapPin, Mountain } from "lucide-react";
import { TripCard } from "@/components/destinations/TripCard";
import type { TripDTO } from "@/lib/types";

export interface TaxonomySiblingLink {
  label: string;
  href: string;
  active?: boolean;
}

export interface TaxonomyBreadcrumb {
  label: string;
  href?: string;
}

export function TaxonomyLandingView({
  eyebrow,
  title,
  description,
  heroImage,
  breadcrumbs,
  trips,
  siblingTitle,
  siblings,
}: {
  eyebrow: string;
  title: string;
  description: string;
  heroImage: string;
  breadcrumbs: TaxonomyBreadcrumb[];
  trips: TripDTO[];
  siblingTitle: string;
  siblings: TaxonomySiblingLink[];
}) {
  const maxAlt =
    trips.length > 0 ? Math.max(...trips.map((t) => t.maxAltitude)) : 0;
  const minDays =
    trips.length > 0 ? Math.min(...trips.map((t) => t.days)) : 0;
  const maxDays =
    trips.length > 0 ? Math.max(...trips.map((t) => t.days)) : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1c1917]">
      {/* Alpine Hero Banner */}
      <section className="relative overflow-hidden bg-[#071526] pt-28 pb-16 sm:pt-36 sm:pb-20 text-white">
        <Image
          src={heroImage || "/images/trips/everest.jpg"}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-50"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(7,21,38,0.96) 0%, rgba(7,21,38,0.68) 55%, rgba(7,21,38,0.45) 100%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8 space-y-6">
          <nav
            aria-label="Breadcrumb"
            className="font-heading text-xs uppercase tracking-[0.2em] font-semibold flex flex-wrap items-center gap-2 text-white/75"
          >
            {breadcrumbs.map((bc, idx) => (
              <span key={`${bc.label}-${idx}`} className="inline-flex items-center gap-2">
                {idx > 0 && <span className="text-white/35">/</span>}
                {bc.href ? (
                  <Link
                    href={bc.href}
                    className="hover:text-[#ff8a50] transition-colors"
                  >
                    {bc.label}
                  </Link>
                ) : (
                  <span className="text-[#7dd3fc] font-semibold">
                    {bc.label}
                  </span>
                )}
              </span>
            ))}
          </nav>

          <div className="max-w-3xl space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-sm px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#ff8a50]">
              <MapPin className="h-3.5 w-3.5" />
              <span>{eyebrow}</span>
            </p>

            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.05]">
              {title}
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-white/85 leading-relaxed">
              {description}
            </p>
          </div>

          <dl className="flex flex-wrap gap-3 pt-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm px-4 py-2.5 text-xs sm:text-sm">
              <Compass className="h-4 w-4 text-[#ff8a50]" />
              <dt className="text-white/70">Routes:</dt>
              <dd className="font-semibold text-white tabular-nums">
                {trips.length} Guided{" "}
                {trips.length === 1 ? "Itinerary" : "Itineraries"}
              </dd>
            </div>

            {trips.length > 0 && (
              <>
                <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm px-4 py-2.5 text-xs sm:text-sm">
                  <Mountain className="h-4 w-4 text-[#7dd3fc]" />
                  <dt className="text-white/70">Apex:</dt>
                  <dd className="font-semibold text-white tabular-nums">
                    {maxAlt.toLocaleString("en-US")} m
                  </dd>
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm px-4 py-2.5 text-xs sm:text-sm">
                  <Clock className="h-4 w-4 text-[#ff8a50]" />
                  <dt className="text-white/70">Duration:</dt>
                  <dd className="font-semibold text-white tabular-nums">
                    {minDays === maxDays
                      ? `${minDays} days`
                      : `${minDays}–${maxDays} days`}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 space-y-10">
        {/* Internal Linking Sibling Chips */}
        {siblings.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#104b87]">
              {siblingTitle}
            </p>
            <div className="flex flex-wrap gap-2">
              {siblings.map((sib) => (
                <Link
                  key={sib.href}
                  href={sib.href}
                  className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                    sib.active
                      ? "bg-[#104b87] text-white font-semibold shadow-xs"
                      : "border border-slate-200 bg-[#f8fafc] text-[#57534d] hover:border-[#104b87] hover:text-[#104b87]"
                  }`}
                >
                  {sib.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Trips Grid */}
        {trips.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip, i) => (
              <TripCard key={trip.slug} trip={trip} index={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-4">
            <h2 className="font-heading font-bold text-2xl text-[#1c1917]">
              Bespoke {title} Departures Available
            </h2>
            <p className="text-sm text-[#57534d] max-w-xl mx-auto">
              Our Thamel logistics desk organizes custom guided departures across this corridor year-round. Explore all open routes or request a tailored itinerary.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/destinations"
                className="rounded-full border border-slate-200 bg-[#f8fafc] px-5 py-2.5 text-sm font-semibold text-[#104b87] hover:border-[#104b87]"
              >
                Browse All Destinations
              </Link>
              <Link
                href="/contact"
                className="rounded-full bg-[#f05e25] hover:bg-[#d94e18] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Request Custom Route
              </Link>
            </div>
          </div>
        )}

        {/* Custom Route Callout */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f05e25]">
              Thamel Operations Desk · Direct Planning
            </p>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#1c1917]">
              Need a Custom Paced Itinerary in {title}?
            </h2>
            <p className="text-sm text-[#57534d] leading-relaxed">
              Every trek is led by licensed Nepali mountain guides with flexible acclimatization days, permit handling, and private departures built around your dates.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#104b87] hover:bg-[#0a355f] px-6 py-3 text-sm font-semibold text-white shrink-0 transition-colors"
          >
            <span>Plan Custom Expedition</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
