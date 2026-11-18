"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { TREKS, Trek } from "@/data/treks";
import AnimatedElevationGraph from "@/components/AnimatedElevationGraph";

type FilterType = "all" | "under4000" | "highpass" | "spring" | "autumn";
type SortMode = "highest" | "duration" | "name";

export default function TreksDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all");
  const [sortMode, setSortMode] = useState<SortMode>("highest");
  const [comparedTrekIds, setComparedTrekIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Filter & Sort logic
  const filteredAndSortedTreks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = TREKS.filter((trek) => {
      const matchesQuery =
        !query ||
        trek.name.toLowerCase().includes(query) ||
        trek.range.toLowerCase().includes(query) ||
        trek.region.toLowerCase().includes(query) ||
        trek.district.toLowerCase().includes(query);

      let matchesFilter = true;
      if (currentFilter === "under4000") {
        matchesFilter = trek.highestPoint < 4000;
      } else if (currentFilter === "highpass") {
        matchesFilter = trek.highestPoint >= 5000;
      } else if (currentFilter === "spring") {
        matchesFilter = trek.season.includes("spring");
      } else if (currentFilter === "autumn") {
        matchesFilter = trek.season.includes("autumn");
      }

      return matchesQuery && matchesFilter;
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === "highest") {
        return b.highestPoint - a.highestPoint;
      }
      if (sortMode === "duration") {
        return a.duration - b.duration;
      }
      if (sortMode === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [searchQuery, currentFilter, sortMode]);

  const toggleCompare = (id: string) => {
    setComparedTrekIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const resetAllFilters = () => {
    setSearchQuery("");
    setCurrentFilter("all");
    setSortMode("highest");
  };

  const comparedTreks = TREKS.filter((t) => comparedTrekIds.includes(t.id));

  return (
    <div className="flex flex-col w-full">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-margin pt-10 pb-20 space-y-10">
        {/* Section 1: Page Header & Field Overview */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-tertiary"></span>
              <span className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant font-semibold">
                BROTHERS Field Directory
              </span>
              <span className="text-outline-variant">/</span>
              <span className="font-label-sm text-label-sm text-primary font-medium tracking-wider">
                Himalayan System · 2026/27
              </span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight leading-none">
              All Treks
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant pt-1 leading-relaxed">
              Browse and filter available treks by duration, difficulty, and
              altitude. Verified waypoint manifests, seasonal permit advisories,
              and technical pass conditions across eight Himalayan sub-ranges.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/route/khumbu-glacier-traverse"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-lg text-label-lg transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">
                alt_route
              </span>
              <span>Open Route Finder</span>
            </Link>
          </div>
        </header>

        {/* Section 2: Search Bar & Primary Region Bar */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 border border-outline-variant/30">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
                search
              </span>
              <input
                className="w-full bg-surface rounded-full pl-12 pr-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:bg-surface-container-low transition-colors border border-outline-variant/20"
                id="searchInput"
                placeholder="Search peaks, valleys, high passes, or regions..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    close
                  </span>
                </button>
              )}
            </div>

            {/* Region Selector Chip */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                className="inline-flex items-center justify-between gap-3 px-5 py-3 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high font-label-lg text-label-lg transition-colors"
                type="button"
                onClick={() => setCurrentFilter("all")}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    travel_explore
                  </span>
                  <span>All Trails &amp; Regions</span>
                </span>
                <span className="w-5 h-5 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm flex items-center justify-center">
                  {TREKS.length}
                </span>
              </button>
            </div>
          </div>

          {/* Filter Chips Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div
              className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 text-nowrap no-scrollbar"
              id="filterPills"
            >
              {[
                { label: "All Treks", filter: "all" },
                { label: "Under 4,000 m", filter: "under4000" },
                { label: "High Passes (>5,000m)", filter: "highpass" },
                { label: "Spring Departures", filter: "spring" },
                { label: "Autumn Departures", filter: "autumn" },
              ].map((pill) => (
                <button
                  key={pill.filter}
                  onClick={() => setCurrentFilter(pill.filter as FilterType)}
                  className={`px-4 py-2 rounded-full font-label-md text-label-md uppercase tracking-wider transition-all ${
                    currentFilter === pill.filter
                      ? "bg-primary-container text-on-primary shadow-sm"
                      : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                  }`}
                  type="button"
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Trailing Sort */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
                Order:
              </span>
              <div className="relative inline-block">
                <select
                  className="appearance-none bg-surface rounded-full pl-3.5 pr-8 py-1.5 font-label-lg text-label-lg text-primary font-medium focus:outline-none cursor-pointer border border-outline-variant/30"
                  id="sortControl"
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                >
                  <option value="highest">Sort by Highest Point</option>
                  <option value="duration">Sort by Duration</option>
                  <option value="name">Sort Alphabetically</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-primary text-[16px]">
                  expand_more
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: List Sub-toolbar & Active Manifest Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span
                className="font-headline-sm text-headline-sm text-on-surface font-normal"
                id="trekCounter"
              >
                {filteredAndSortedTreks.length}{" "}
                {filteredAndSortedTreks.length === 1
                  ? "route available"
                  : "routes available"}
              </span>
            </div>
            <span className="text-outline-variant hidden sm:inline">·</span>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
              <span>All Difficulties</span>
              <span>·</span>
              <span>All Altitudes</span>
              <span>·</span>
              <span>Any Season</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-on-surface-variant">
            <button
              onClick={() => setShowCompareModal(true)}
              className="inline-flex items-center gap-1.5 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">
                compare_arrows
              </span>
              <span>Compare ({comparedTrekIds.length})</span>
            </button>
            <span className="text-outline-variant">·</span>
            <button
              className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary hover:underline transition-all cursor-pointer"
              id="resetBtn"
              type="button"
              onClick={resetAllFilters}
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Section 4: Structured Alpine Catalog Table */}
        <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm border border-outline-variant/30">
          <div className="w-full overflow-x-auto">
            <table
              className="w-full text-left border-collapse min-w-[760px]"
              id="treksTable"
            >
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/20">
                  <th
                    className="py-4 pl-8 pr-4 font-label-md text-label-md uppercase tracking-wider"
                    scope="col"
                  >
                    Route &amp; Range
                  </th>
                  <th
                    className="py-4 px-4 font-label-md text-label-md uppercase tracking-wider"
                    scope="col"
                  >
                    Difficulty
                  </th>
                  <th
                    className="py-4 px-4 font-label-md text-label-md uppercase tracking-wider"
                    scope="col"
                  >
                    Duration
                  </th>
                  <th
                    className="py-4 px-4 font-label-md text-label-md uppercase tracking-wider"
                    scope="col"
                  >
                    Highest Point
                  </th>
                  <th
                    className="py-4 px-4 font-label-md text-label-md uppercase tracking-wider"
                    scope="col"
                  >
                    Tariff (Rs.)
                  </th>
                  <th
                    className="py-4 px-4 font-label-md text-label-md uppercase tracking-wider hidden lg:table-cell"
                    scope="col"
                  >
                    Elevation Profile
                  </th>
                  <th
                    className="py-4 pl-4 pr-8 font-label-md text-label-md uppercase tracking-wider text-right"
                    scope="col"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="text-on-surface divide-y divide-outline-variant/15">
                {filteredAndSortedTreks.length > 0 ? (
                  filteredAndSortedTreks.map((trek) => {
                    const isCompared = comparedTrekIds.includes(trek.id);
                    return (
                      <tr
                        key={trek.id}
                        className="trek-row group hover:bg-surface-container/60 transition-colors"
                      >
                        <td className="py-5 pl-8 pr-4 align-middle">
                          <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0">
                              terrain
                            </span>
                            <div className="flex flex-col">
                              <Link
                                href={`/route/${trek.slug}`}
                                className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors"
                              >
                                {trek.name}
                              </Link>
                              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-0.5">
                                {trek.range} · {trek.district}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-5 px-4 align-middle">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md text-label-md uppercase tracking-wider font-semibold ${
                              trek.difficulty === "Moderate"
                                ? "bg-secondary-container text-on-secondary-container"
                                : trek.difficulty === "Strenuous"
                                ? "bg-surface-container text-tertiary"
                                : "bg-error-container text-on-error-container"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                trek.difficulty === "Moderate"
                                  ? "bg-primary"
                                  : trek.difficulty === "Strenuous"
                                  ? "bg-tertiary"
                                  : "bg-error"
                              }`}
                            ></span>
                            {trek.difficulty}
                          </span>
                        </td>

                        <td className="py-5 px-4 align-middle">
                          <div className="flex flex-col">
                            <span className="font-display-md text-[20px] leading-snug font-normal text-on-surface">
                              {trek.duration} days
                            </span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                              {trek.startPoint}
                            </span>
                          </div>
                        </td>

                        <td className="py-5 px-4 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-display-md text-[20px] leading-none text-on-surface font-normal">
                              {trek.highestPoint.toLocaleString()} m
                            </span>
                            <span className="font-label-sm text-label-sm text-tertiary">
                              {trek.highestPointName}
                            </span>
                          </div>
                        </td>

                        <td className="py-5 px-4 align-middle">
                          <span className="font-headline-sm text-base text-primary font-serif font-medium">
                            Rs. {(trek.priceFrom * 100).toLocaleString()}
                          </span>
                        </td>

                        <td className="py-5 px-4 align-middle hidden lg:table-cell">
                          <div className="w-36">
                            <AnimatedElevationGraph
                              svgPath={trek.elevationPoints.svgPath}
                              peakCoords={trek.elevationPoints.peakCoords}
                              strokeColor="#006b78"
                              fillColor="rgba(0, 107, 120, 0.15)"
                              height="h-7"
                            />
                          </div>
                        </td>

                        <td className="py-5 pl-4 pr-8 align-middle text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => toggleCompare(trek.id)}
                              title={
                                isCompared
                                  ? "Remove from comparison"
                                  : "Add to comparison"
                              }
                              className={`p-1.5 rounded-full transition-colors ${
                                isCompared
                                  ? "bg-primary text-on-primary"
                                  : "text-on-surface-variant hover:bg-surface-container"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {isCompared ? "check" : "add"}
                              </span>
                            </button>
                            <Link
                              className="inline-flex items-center gap-1 text-primary group-hover:text-primary-container font-label-lg text-label-lg transition-transform group-hover:translate-x-0.5"
                              href={`/route/${trek.slug}`}
                            >
                              <span>Inspect</span>
                              <span className="material-symbols-outlined text-[16px]">
                                arrow_forward
                              </span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl mb-2">
                        search_off
                      </span>
                      <p className="font-headline-sm">No matching routes found</p>
                      <p className="text-body-sm mt-1">
                        Try clearing or modifying your filter parameters.
                      </p>
                      <button
                        onClick={resetAllFilters}
                        className="mt-4 px-5 py-2 rounded-full bg-primary-container text-on-primary font-label-md text-label-md uppercase tracking-wider"
                      >
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footnote / Manifest Summary Ribbon */}
          <div className="bg-surface-container-low px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-on-surface-variant border-t border-outline-variant/20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-label-sm text-label-sm uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span>TIMS Registered</span>
              </div>
              <div className="flex items-center gap-1.5 font-label-sm text-label-sm uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                <span>Restricted Permits Included</span>
              </div>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant/80">
              Field telemetry updated weekly by BROTHERS Base Logistics (Namche &amp;
              Pokhara stations).
            </p>
          </div>
        </div>

        {/* Section 5: Editorial Spotlight Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-surface-container rounded-2xl p-6 space-y-3 shadow-sm border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                Seasonal Window
              </span>
              <span className="material-symbols-outlined text-primary text-[20px]">
                calendar_month
              </span>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Autumn 2026 Influx
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              High passes over 5,000m remain stable through early December. Larkya
              La and Renjo La permit quotas are currently at 65% capacity.
            </p>
          </div>

          <div className="bg-surface-container rounded-2xl p-6 space-y-3 shadow-sm border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary font-semibold">
                Acclimatization Rules
              </span>
              <span className="material-symbols-outlined text-tertiary text-[20px]">
                ecg_heart
              </span>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Staged Sleep Ascent
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Our standard itineraries enforce conservative sleeping altitude
              increases (&lt;450m per day above 3,200m) with dedicated rest stops.
            </p>
          </div>

          <div className="bg-surface-container rounded-2xl p-6 space-y-3 shadow-sm border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                Gear Logistics
              </span>
              <span className="material-symbols-outlined text-primary text-[20px]">
                backpack
              </span>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Porter Ratios &amp; Porter Safety
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Full adherence to the International Porter Protection Group (IPPG)
              guidelines: maximum 25kg load limits and dedicated high-altitude
              medical kits.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Drawer / Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <div className="space-y-1">
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Route Comparison
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Comparing {comparedTreks.length} selected Himalayan routes
                </p>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            {comparedTreks.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant space-y-3">
                <span className="material-symbols-outlined text-4xl">
                  compare_arrows
                </span>
                <p className="font-headline-sm">No routes selected for comparison</p>
                <p className="text-body-sm">
                  Click the (+) button next to any route to add it to your
                  comparison list.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {comparedTreks.map((trek) => (
                  <div
                    key={trek.id}
                    className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm uppercase tracking-wider text-primary font-semibold">
                          {trek.region}
                        </span>
                        <button
                          onClick={() => toggleCompare(trek.id)}
                          className="text-on-surface-variant hover:text-error"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            delete
                          </span>
                        </button>
                      </div>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface mt-1">
                        {trek.name}
                      </h4>
                      <div className="pt-3 space-y-2 text-body-sm text-on-surface-variant">
                        <div className="flex justify-between">
                          <span>Max Altitude:</span>
                          <strong className="text-on-surface">
                            {trek.highestPoint.toLocaleString()} m ({trek.highestPointName})
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <strong className="text-on-surface">{trek.duration} Days</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Difficulty:</span>
                          <strong className="text-on-surface">{trek.difficulty}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Tariff:</span>
                          <strong className="text-primary font-serif">
                            From Rs. {(trek.priceFrom * 100).toLocaleString()}
                          </strong>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/route/${trek.slug}`}
                      className="w-full text-center py-2.5 rounded-full bg-primary-container text-on-primary font-label-md text-label-md uppercase tracking-wider hover:bg-primary transition-colors block"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
