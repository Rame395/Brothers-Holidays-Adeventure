"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Compass,
  ArrowUpRight,
  X,
  RotateCcw,
  MapPin,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";
import { TripCard } from "@/components/destinations/TripCard";
import type { DestinationTaxonomyDTO, TripDTO } from "@/lib/types";

function FilterChip({
  active,
  onClick,
  children,
  count,
  variant = "type",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
  variant?: "type" | "region";
}) {
  const baseClass =
    "group inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-sans font-medium transition-all duration-150 cursor-pointer";

  const stateClass =
    variant === "region"
      ? active
        ? "bg-[#f05e25]/10 text-[#c2410c] border border-[#f05e25]/35 font-semibold"
        : "bg-white text-stone-600 border border-stone-200/80 hover:border-stone-300 hover:bg-stone-50 hover:text-[#1c1917]"
      : active
      ? "bg-[#1c1917] text-white border border-[#1c1917] shadow-xs"
      : "bg-stone-100/80 text-stone-700 border border-transparent hover:bg-white hover:border-stone-300/90 hover:text-[#1c1917] hover:shadow-2xs";

  const countClass =
    variant === "region"
      ? active
        ? "text-[#f05e25] font-semibold tabular-nums text-[11px]"
        : "text-stone-400 group-hover:text-stone-600 tabular-nums text-[11px]"
      : active
      ? "text-[#ff8a50] font-semibold tabular-nums text-[11px]"
      : "text-stone-400 group-hover:text-stone-600 tabular-nums text-[11px]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClass} ${stateClass}`}
    >
      {variant === "region" && active && (
        <span className="h-1.5 w-1.5 rounded-full bg-[#f05e25] shrink-0" />
      )}
      <span>{children}</span>
      {typeof count === "number" && <span className={countClass}>{count}</span>}
    </button>
  );
}

export function DestinationsCatalogClient({
  trips,
  taxonomy,
}: {
  trips: TripDTO[];
  taxonomy: DestinationTaxonomyDTO;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(() => searchParams.get("q") || "");
  const [showAtlasIndex, setShowAtlasIndex] = useState(false);

  const { countries, categories, regions } = taxonomy;

  const rawCountry = searchParams.get("country");
  const rawCategory = searchParams.get("category");
  const rawRegion = searchParams.get("region");

  const country =
    rawCountry && countries.some((c) => c.slug === rawCountry)
      ? rawCountry
      : undefined;
  const category =
    rawCategory && categories.some((c) => c.slug === rawCategory)
      ? rawCategory
      : undefined;
  const region =
    rawRegion && regions.some((r) => r.slug === rawRegion)
      ? rawRegion
      : undefined;

  const activeCategoryObj = category
    ? categories.find((c) => c.slug === category)
    : undefined;
  const visibleRegions = country
    ? regions.filter((r) => r.countrySlug === country)
    : regions;

  const setFilter = (patch: {
    country?: string | undefined;
    category?: string | undefined;
    region?: string | undefined;
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

  // Filtered trips matching current selections & query
  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return trips.filter(
      (t) =>
        (!country || t.country === country) &&
        (!category || t.categories.includes(category)) &&
        (!region || t.region === region) &&
        (!query ||
          `${t.name} ${t.area} ${t.tagline}`.toLowerCase().includes(query))
    );
  }, [trips, country, category, region, q]);

  // Trip counts per country
  const countryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of trips) {
      if (t.country) {
        map.set(t.country, (map.get(t.country) ?? 0) + 1);
      }
    }
    return map;
  }, [trips]);

  // Trip counts per category
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of trips) {
      if (!country || t.country === country) {
        for (const cat of t.categories) {
          map.set(cat, (map.get(cat) ?? 0) + 1);
        }
      }
    }
    return map;
  }, [trips, country]);

  // Trip counts per region
  const regionCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of trips) {
      if (
        (!country || t.country === country) &&
        (!category || t.categories.includes(category))
      ) {
        if (t.region) {
          map.set(t.region, (map.get(t.region) ?? 0) + 1);
        }
      }
    }
    return map;
  }, [trips, country, category]);

  const countryFilteredCount = useMemo(() => {
    return trips.filter((t) => !country || t.country === country).length;
  }, [trips, country]);

  const categoryFilteredCount = useMemo(() => {
    return trips.filter(
      (t) =>
        (!country || t.country === country) &&
        (!category || t.categories.includes(category))
    ).length;
  }, [trips, country, category]);

  const heroImg =
    (region && regions.find((r) => r.slug === region)?.heroImage) ||
    (category && categories.find((c) => c.slug === category)?.heroImage) ||
    (country && countries.find((c) => c.slug === country)?.heroImage) ||
    "/images/trips/everest.jpg";

  const title =
    (region && regions.find((r) => r.slug === region)?.name) ||
    (category && categories.find((c) => c.slug === category)?.name) ||
    (country && countries.find((c) => c.slug === country)?.name) ||
    "All Destinations & Trips";

  const activeCountryName = country
    ? countries.find((c) => c.slug === country)?.name ?? country
    : "All Countries";

  const hasActiveFilters = Boolean(country || category || region || q.trim());

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1c1917]">
      {/* Hero Banner */}
      <section className="relative flex min-h-[44vh] items-end overflow-hidden bg-[#071526]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={heroImg}
          src={heroImg}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover opacity-80 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071526] via-[#071526]/60 to-[#071526]/30" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-px inset-x-0 h-10 sm:h-14 z-10"
          style={{
            background:
              "linear-gradient(to top, #f8fafc 0%, rgba(248,250,252,0.5) 45%, transparent 100%)",
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-12 pt-28 lg:px-8">
          <nav className="font-heading text-xs uppercase tracking-[0.22em] font-semibold flex items-center gap-2 text-white/70">
            <Link href="/" className="hover:text-[#ff8a50] transition-colors">
              Home
            </Link>
            <span className="text-white/40">/</span>
            <span className="text-[#ff8a50]">Destinations</span>
          </nav>

          <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <h1 className="font-heading font-black text-4xl sm:text-5xl md:text-6xl text-white uppercase tracking-tight leading-tight">
                {title}
              </h1>
              <p className="mt-2 font-sans text-xs sm:text-sm text-white/80">
                Displaying{" "}
                <strong className="text-white font-semibold">
                  {results.length}
                </strong>{" "}
                of {trips.length} Himalayan journeys · Pricing in US Dollars
                (USD)
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAtlasIndex((v) => !v)}
              className="self-start md:self-end inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-heading font-semibold text-xs uppercase tracking-wider text-white backdrop-blur-md hover:bg-[#f05e25] hover:border-[#f05e25] transition-all cursor-pointer shadow-xs"
            >
              <Compass className="h-4 w-4 text-[#ff8a50]" />
              <span>
                {showAtlasIndex
                  ? "Hide Regional Directory"
                  : "Regional Directory"}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Collapsible Regional Directory */}
      {showAtlasIndex && visibleRegions.length > 0 && (
        <section className="border-b border-stone-200/90 bg-white py-8 shadow-inner">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mb-5 flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <p className="font-heading text-[11px] uppercase tracking-[0.22em] text-[#f05e25] font-bold">
                  Complete Regional Index
                </p>
                <h2 className="font-heading font-bold text-2xl uppercase tracking-tight text-[#1c1917]">
                  Routes across {activeCountryName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFilter({
                    region: undefined,
                  })
                }
                className="inline-flex items-center gap-1 font-heading text-xs font-semibold uppercase tracking-wider text-[#f05e25] hover:underline cursor-pointer"
              >
                <span>View all regions</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleRegions.map((reg) => (
                <div
                  key={reg.slug}
                  className="rounded-xl border border-stone-200 bg-stone-50/70 p-4"
                >
                  <p className="font-heading text-xs uppercase tracking-[0.16em] text-[#1c1917] font-bold mb-3 pb-2 border-b border-stone-200">
                    {reg.name}
                  </p>
                  <ul className="space-y-2">
                    {trips
                      .filter(
                        (t) =>
                          t.region === reg.slug &&
                          (!category || t.categories.includes(category))
                      )
                      .map((t) => (
                        <li key={t.slug}>
                          <Link
                            href={`/destinations/${t.slug}`}
                            className="flex items-center justify-between text-xs text-[#57534d] hover:text-[#f05e25] font-medium transition-colors py-0.5"
                          >
                            <span className="truncate pr-2">{t.name}</span>
                            <span className="font-sans text-[11px] font-semibold text-stone-400 shrink-0 tabular-nums">
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
      <section className="sticky top-16 z-30 border-b border-stone-200/80 bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(28,25,23,0.04)]">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          {/* ROW 1: Architectural Country Tabs & Sleek Search */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-stone-200/75 pt-3 pb-0">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar -mb-px">
              <button
                type="button"
                onClick={() =>
                  setFilter({ country: undefined, region: undefined })
                }
                className={`relative inline-flex items-baseline gap-1.5 whitespace-nowrap pb-3 pt-1 font-heading text-[13px] font-bold uppercase tracking-[0.1em] transition-colors cursor-pointer ${
                  !country
                    ? "text-[#1c1917]"
                    : "text-stone-500 hover:text-[#1c1917]"
                }`}
              >
                <span>All Countries</span>
                <span
                  className={`font-sans text-[11px] tabular-nums ${
                    !country
                      ? "font-semibold text-[#f05e25]"
                      : "font-medium text-stone-400"
                  }`}
                >
                  {trips.length}
                </span>
                {!country && (
                  <span className="absolute inset-x-0 bottom-0 h-[2.5px] rounded-full bg-[#f05e25]" />
                )}
              </button>

              {countries.map((c) => {
                const keepsRegion =
                  region &&
                  regions.some(
                    (r) => r.slug === region && r.countrySlug === c.slug
                  );
                const isActive = country === c.slug;
                const count = countryCounts.get(c.slug) ?? 0;

                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() =>
                      setFilter({
                        country: c.slug,
                        region: keepsRegion ? region : undefined,
                      })
                    }
                    className={`relative inline-flex items-baseline gap-1.5 whitespace-nowrap pb-3 pt-1 font-heading text-[13px] font-bold uppercase tracking-[0.1em] transition-colors cursor-pointer ${
                      isActive
                        ? "text-[#1c1917]"
                        : "text-stone-500 hover:text-[#1c1917]"
                    }`}
                  >
                    <span>{c.name}</span>
                    <span
                      className={`font-sans text-[11px] tabular-nums ${
                        isActive
                          ? "font-semibold text-[#f05e25]"
                          : "font-medium text-stone-400"
                      }`}
                    >
                      {count}
                    </span>
                    {isActive && (
                      <span className="absolute inset-x-0 bottom-0 h-[2.5px] rounded-full bg-[#f05e25]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sleek Search Box */}
            <div className="relative pb-3 md:pb-2.5 w-full md:w-80 lg:w-96 shrink-0">
              <div className="relative flex items-center">
                <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-stone-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search a trek, peak or region…"
                  className="w-full rounded-xl border border-stone-200/90 bg-stone-50/90 hover:bg-stone-100/60 focus:bg-white py-2 pl-9.5 pr-20 text-[13px] font-sans text-[#1c1917] placeholder:text-stone-400 focus:border-[#f05e25] focus:ring-4 focus:ring-[#f05e25]/10 focus:outline-none transition-all"
                />
                {q ? (
                  <button
                    type="button"
                    onClick={() => setQ("")}
                    className="absolute right-2.5 p-1 rounded-lg text-stone-400 hover:text-[#1c1917] hover:bg-stone-200/60 transition-colors cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="pointer-events-none absolute right-3 text-[11px] font-sans font-medium text-stone-400 tabular-nums">
                    {results.length} trips
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ROW 2 & ROW 3: Compact Scannable Types & Regions */}
          <div className="py-3 space-y-2.5">
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 w-20 shrink-0 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#f05e25]" />
                <span>Types</span>
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <FilterChip
                  variant="type"
                  active={!category}
                  onClick={() =>
                    setFilter({ category: undefined, region: undefined })
                  }
                  count={countryFilteredCount}
                >
                  All Types
                </FilterChip>
                {categories.map((c) => (
                  <FilterChip
                    key={c.slug}
                    variant="type"
                    active={category === c.slug}
                    onClick={() =>
                      setFilter({
                        category: c.slug,
                        region: c.groupByRegion ? region : undefined,
                      })
                    }
                    count={categoryCounts.get(c.slug) ?? 0}
                  >
                    {c.name}
                  </FilterChip>
                ))}
              </div>
            </div>

            {visibleRegions.length > 0 &&
              (!category || activeCategoryObj?.groupByRegion) && (
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-flex items-center gap-1.5 w-20 shrink-0 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>Regions</span>
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    <FilterChip
                      variant="region"
                      active={!region}
                      onClick={() => setFilter({ region: undefined })}
                      count={categoryFilteredCount}
                    >
                      All Regions
                    </FilterChip>
                    {visibleRegions.map((r) => (
                      <FilterChip
                        key={r.slug}
                        variant="region"
                        active={region === r.slug}
                        onClick={() => setFilter({ region: r.slug })}
                        count={regionCounts.get(r.slug) ?? 0}
                      >
                        {r.name}
                      </FilterChip>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* ROW 4: Active Filters Strip & Reset */}
          {hasActiveFilters && (
            <div className="py-2.5 border-t border-stone-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-sans font-semibold text-stone-400 uppercase tracking-[0.12em] text-[10px]">
                  Active:
                </span>

                {country && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f05e25]/8 border border-[#f05e25]/25 text-[#1c1917] font-sans font-medium text-xs">
                    <span>
                      {countries.find((c) => c.slug === country)?.name ?? country}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFilter({ country: undefined, region: undefined })
                      }
                      className="text-stone-400 hover:text-[#f05e25] transition-colors cursor-pointer"
                      aria-label="Remove country filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {category && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f05e25]/8 border border-[#f05e25]/25 text-[#1c1917] font-sans font-medium text-xs">
                    <span>
                      {categories.find((c) => c.slug === category)?.name ??
                        category}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFilter({ category: undefined, region: undefined })
                      }
                      className="text-stone-400 hover:text-[#f05e25] transition-colors cursor-pointer"
                      aria-label="Remove category filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {region && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f05e25]/8 border border-[#f05e25]/25 text-[#1c1917] font-sans font-medium text-xs">
                    <span>
                      {regions.find((r) => r.slug === region)?.name ?? region}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFilter({ region: undefined })}
                      className="text-stone-400 hover:text-[#f05e25] transition-colors cursor-pointer"
                      aria-label="Remove region filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {q && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f05e25]/8 border border-[#f05e25]/25 text-[#1c1917] font-sans font-medium text-xs">
                    <span>&ldquo;{q}&rdquo;</span>
                    <button
                      type="button"
                      onClick={() => setQ("")}
                      className="text-stone-400 hover:text-[#f05e25] transition-colors cursor-pointer"
                      aria-label="Remove search query"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setQ("");
                  router.replace("/destinations", { scroll: false });
                }}
                className="inline-flex items-center gap-1.5 text-[#f05e25] hover:text-[#d94e18] font-sans font-semibold text-xs transition-colors cursor-pointer ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset all filters</span>
              </button>
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
          <div className="py-24 text-center max-w-md mx-auto space-y-4">
            <h3 className="font-heading font-bold text-3xl uppercase tracking-tight text-[#1c1917]">
              No routes match those filters
            </h3>
            <p className="font-sans text-sm text-[#57534d] leading-relaxed">
              Try adjusting your search criteria, selecting a different region,
              or resetting your filters to explore all Himalayan expeditions.
            </p>
            <button
              type="button"
              onClick={() => {
                setQ("");
                router.replace("/destinations", { scroll: false });
              }}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#f05e25] px-6 py-3 text-xs font-heading uppercase tracking-wider font-bold text-white hover:bg-[#ff7a45] transition-colors cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear all filters</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
