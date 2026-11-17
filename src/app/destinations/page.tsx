"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Compass, ArrowUpRight } from "lucide-react";
import { useMemo, useState, Suspense } from "react";
import { TripCard } from "@/components/destinations/TripCard";
import {
  CATEGORIES,
  COUNTRIES,
  REGIONS,
  TRIPS,
  images,
  tripsByRegion,
  type Category,
  type Country,
  type Region,
} from "@/data/trips";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
        active
          ? "bg-[#00515b] text-white font-semibold shadow-sm"
          : "text-[#3f484a] hover:bg-[#e3f0f3] hover:text-[#003840]"
      }`}
    >
      {children}
    </button>
  );
}

function DestinationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [showAtlasIndex, setShowAtlasIndex] = useState(false);

  const rawCountry = searchParams.get("country");
  const rawCategory = searchParams.get("category");
  const rawRegion = searchParams.get("region");

  const country = COUNTRIES.some((c) => c.id === rawCountry)
    ? (rawCountry as Country)
    : undefined;
  const category = CATEGORIES.some((c) => c.id === rawCategory)
    ? (rawCategory as Category)
    : undefined;
  const region = REGIONS.some((r) => r.id === rawRegion)
    ? (rawRegion as Region)
    : undefined;

  const setFilter = (patch: {
    country?: Country | undefined;
    category?: Category | undefined;
    region?: Region | undefined;
  }) => {
    const next = new URLSearchParams(searchParams.toString());
    const merged = {
      country: "country" in patch ? patch.country : country,
      category: "category" in patch ? patch.category : category,
      region: "region" in patch ? patch.region : region,
    };
    if (merged.country) next.set("country", merged.country);
    else next.delete("country");
    if (merged.category) next.set("category", merged.category);
    else next.delete("category");
    if (merged.region) next.set("region", merged.region);
    else next.delete("region");

    const qs = next.toString();
    router.replace(qs ? `/destinations?${qs}` : "/destinations", {
      scroll: false,
    });
  };

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return TRIPS.filter(
      (t) =>
        (!country || t.country === country) &&
        (!category || t.categories.includes(category)) &&
        (!region || t.region === region) &&
        (!query ||
          `${t.name} ${t.area} ${t.tagline}`.toLowerCase().includes(query))
    );
  }, [country, category, region, q]);

  const heroImg =
    (region && REGIONS.find((r) => r.id === region)?.image) ||
    (category && CATEGORIES.find((c) => c.id === category)?.image) ||
    (country && COUNTRIES.find((c) => c.id === country)?.image) ||
    images.everest;

  const title =
    (region && REGIONS.find((r) => r.id === region)?.label) ||
    (category && CATEGORIES.find((c) => c.id === category)?.label) ||
    (country && COUNTRIES.find((c) => c.id === country)?.label) ||
    "All Destinations & Trips";

  return (
    <div className="min-h-screen bg-[#f8fafb] text-[#111d1f]">
      {/* Hero Banner */}
      <section className="relative flex min-h-[46vh] items-end overflow-hidden bg-[#071318]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={heroImg}
          src={heroImg}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover opacity-80 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050c0e] via-[#050c0e]/55 to-[#050c0e]/25" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-10 pt-24 lg:px-8">
          <nav className="font-mono text-xs uppercase tracking-[0.22em] flex items-center gap-2 text-white/65">
            <Link href="/" className="hover:text-[#e8b765] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#e8b765]">Destinations</span>
          </nav>

          <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white font-light tracking-tight">
                {title}
              </h1>
              <p className="mt-2 font-mono text-xs sm:text-sm text-[#89d6e2]">
                Displaying {results.length} of {TRIPS.length} Himalayan journeys
                · Pricing in Nepalese Rupees (Rs.)
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAtlasIndex((v) => !v)}
              className="self-start md:self-end inline-flex items-center gap-2 rounded-full border border-[#e8b765]/70 bg-[#071318]/80 px-4 py-2 font-mono text-xs uppercase tracking-widest text-[#e8b765] backdrop-blur-md hover:bg-[#e8b765] hover:text-[#050c0e] transition-colors cursor-pointer"
            >
              <Compass className="h-4 w-4" />
              <span>
                {showAtlasIndex
                  ? "Hide Regional Directory"
                  : "Trekking Routes Directory"}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Collapsible Full Regional Trekking Directory (Everest, Annapurna, Langtang, Restricted) */}
      {showAtlasIndex && (
        <section className="border-b border-[#d8e5e7] bg-white py-8 shadow-inner">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mb-5 flex items-center justify-between border-b border-[#e8f0f3] pb-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#b58133] font-semibold">
                  Complete Regional Index
                </p>
                <h2 className="font-serif text-2xl text-[#111d1f]">
                  Trekking Routes in Nepal
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFilter({
                    country: "nepal",
                    category: "trekking",
                    region: undefined,
                  });
                }}
                className="inline-flex items-center gap-1 font-mono text-xs font-semibold uppercase tracking-wider text-[#00515b] hover:underline cursor-pointer"
              >
                View all trekking routes <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {REGIONS.map((reg) => (
                <div
                  key={reg.id}
                  className="rounded-xl border border-[#e2edf0] bg-[#f8fafb] p-4"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#00515b] font-bold mb-3 pb-2 border-b border-[#d8e5e7]">
                    {reg.label}
                  </p>
                  <ul className="space-y-2">
                    {tripsByRegion(reg.id).map((t) => (
                      <li key={t.slug}>
                        <Link
                          href={`/destinations/${t.slug}`}
                          className="flex items-center justify-between text-xs text-[#3f484a] hover:text-[#b58133] font-medium transition-colors py-0.5"
                        >
                          <span>{t.name}</span>
                          <span className="font-mono text-[10px] text-[#6f797b]">
                            {t.days}d
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sticky Filter & Search Bar */}
      <section className="sticky top-16 z-30 border-b border-[#d8e5e7] bg-white/95 backdrop-blur-xl shadow-sm">
        <div className="mx-auto max-w-7xl space-y-3 px-5 py-4 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            {/* Country Filter Pills */}
            <div className="flex gap-1 overflow-x-auto rounded-full border border-[#d8e5e7] bg-[#f8fafb] p-1">
              <Chip
                active={!country}
                onClick={() => setFilter({ country: undefined })}
              >
                All countries
              </Chip>
              {COUNTRIES.map((c) => (
                <Chip
                  key={c.id}
                  active={country === c.id}
                  onClick={() =>
                    setFilter({
                      country: c.id,
                      region: c.id === "nepal" ? region : undefined,
                    })
                  }
                >
                  {c.label}
                </Chip>
              ))}
            </div>

            {/* Search Input */}
            <label className="relative ml-auto flex min-w-[220px] flex-1 items-center sm:flex-none">
              <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#6f797b]" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search a trek, peak or region…"
                className="w-full rounded-full border border-[#bec8cb] bg-[#f8fafb] py-2 pl-9 pr-4 text-xs text-[#111d1f] placeholder:text-[#6f797b] focus:border-[#00515b] focus:bg-white focus:outline-none sm:w-72"
              />
            </label>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <Chip
              active={!category}
              onClick={() =>
                setFilter({ category: undefined, region: undefined })
              }
            >
              All types
            </Chip>
            {CATEGORIES.map((c) => (
              <Chip
                key={c.id}
                active={category === c.id}
                onClick={() =>
                  setFilter({
                    category: c.id,
                    region: c.id === "trekking" ? region : undefined,
                  })
                }
              >
                {c.label}
              </Chip>
            ))}
          </div>

          {/* Region Filter Pills when Trekking in Nepal is active or unfiltered */}
          {(!category || category === "trekking") &&
            country !== "tibet" &&
            country !== "bhutan" && (
              <div className="flex gap-1.5 overflow-x-auto border-t border-[#e8f0f3] pt-2.5">
                <Chip
                  active={!region}
                  onClick={() => setFilter({ region: undefined })}
                >
                  All regions
                </Chip>
                {REGIONS.map((r) => (
                  <Chip
                    key={r.id}
                    active={region === r.id}
                    onClick={() =>
                      setFilter({ category: "trekking", region: r.id })
                    }
                  >
                    {r.label}
                  </Chip>
                ))}
              </div>
            )}
        </div>
      </section>

      {/* Trips Grid */}
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((t, i) => (
            <TripCard key={t.slug} trip={t} index={i} />
          ))}
        </div>

        {results.length === 0 && (
          <div className="py-24 text-center">
            <p className="font-serif text-3xl text-[#111d1f]">
              No routes match those filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setQ("");
                router.replace("/destinations");
              }}
              className="mt-4 rounded-full bg-[#00515b] px-5 py-2 text-xs font-mono uppercase tracking-wider font-semibold text-white hover:bg-[#003840] cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default function DestinationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafb] flex items-center justify-center font-mono text-sm text-[#00515b]">
          Loading Himalayan Destinations…
        </div>
      }
    >
      <DestinationsContent />
    </Suspense>
  );
}
