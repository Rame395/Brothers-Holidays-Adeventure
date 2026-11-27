"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BedDouble,
  Check,
  Clock,
  Gauge,
  MapPin,
  Mountain,
  Plus,
  RotateCcw,
  Scale,
  Search,
  Sparkles,
  Sun,
  Users,
  Utensils,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatPriceUsd, nprToUsd } from "@/lib/booking";
import {
  addCompareTripSlug,
  clearCompareTripSlugs,
  MAX_COMPARE_TRIPS,
  removeCompareTripSlug,
  useCompareTripSlugs,
} from "@/lib/trip-client-store";
import type { ComparableTripDTO } from "@/lib/types";
import { formatSeasonRange } from "@/lib/weather-locations";

interface TripCompareModalProps {
  open: boolean;
  onClose: () => void;
  currentTripSlug: string;
  catalog: ComparableTripDTO[];
}

function getDifficultyLevel(difficulty: string): {
  bars: number;
  barClass: string;
  pillClass: string;
} {
  const d = difficulty.trim().toLowerCase();
  if (d.includes("easy")) {
    return {
      bars: 1,
      barClass: "bg-emerald-500",
      pillClass: "border-emerald-200 bg-emerald-50 text-emerald-800",
    };
  }
  if (d.includes("moderate")) {
    return {
      bars: 2,
      barClass: "bg-[#3f6e15]",
      pillClass: "border-[#3f6e15]/25 bg-[#3f6e15]/10 text-[#3f6e15]",
    };
  }
  if (d.includes("strenuous") || d.includes("extreme")) {
    return {
      bars: 4,
      barClass: "bg-[#f05e25]",
      pillClass: "border-[#f05e25]/30 bg-[#f05e25]/10 text-[#c2410c]",
    };
  }
  return {
    bars: 3,
    barClass: "bg-amber-500",
    pillClass: "border-amber-200 bg-amber-50 text-amber-800",
  };
}

export function TripCompareModal({
  open,
  onClose,
  currentTripSlug,
  catalog,
}: TripCompareModalProps) {
  const compareSlugs = useCompareTripSlugs();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobilePickerOpen, setMobilePickerOpen] = useState(false);
  const [mobilePair, setMobilePair] = useState<[number, number]>([0, 1]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const catalogBySlug = useMemo(
    () => new Map(catalog.map((t) => [t.slug, t])),
    [catalog]
  );

  const selectedTrips = useMemo(() => {
    const out: ComparableTripDTO[] = [];
    for (const slug of compareSlugs) {
      const found = catalogBySlug.get(slug);
      if (found) out.push(found);
    }
    if (
      out.length === 0 &&
      currentTripSlug &&
      catalogBySlug.has(currentTripSlug)
    ) {
      out.push(catalogBySlug.get(currentTripSlug)!);
    }
    return out;
  }, [compareSlugs, catalogBySlug, currentTripSlug]);

  const availableToAdd = useMemo(() => {
    const selectedSet = new Set(selectedTrips.map((t) => t.slug));
    const q = searchQuery.trim().toLowerCase();
    return catalog
      .filter((t) => !selectedSet.has(t.slug))
      .filter((t) => {
        if (!q) return true;
        return (
          t.name.toLowerCase().includes(q) ||
          t.area.toLowerCase().includes(q) ||
          (t.region ?? "").toLowerCase().includes(q) ||
          t.difficulty.toLowerCase().includes(q)
        );
      });
  }, [catalog, selectedTrips, searchQuery]);

  const metrics = useMemo(() => {
    if (selectedTrips.length === 0) {
      return {
        lowestUsd: 0,
        highestAltitude: 1,
        shortestDays: 0,
      };
    }
    const usdPrices = selectedTrips.map((t) => nprToUsd(t.price, t.priceUsd));
    const altitudes = selectedTrips.map((t) => t.maxAltitude);
    const daysList = selectedTrips.map((t) => t.days);
    return {
      lowestUsd: Math.min(...usdPrices),
      highestAltitude: Math.max(1, ...altitudes),
      shortestDays: Math.min(...daysList),
    };
  }, [selectedTrips]);

  if (!open) return null;

  const canAddSlot = selectedTrips.length < MAX_COMPARE_TRIPS;
  const showWinnerBadges = selectedTrips.length >= 2;

  // Safely derive the 2 trips shown side-by-side on mobile
  const safeLeftIdx =
    selectedTrips.length > 0
      ? Math.min(mobilePair[0], selectedTrips.length - 1)
      : 0;
  let safeRightIdx =
    selectedTrips.length > 1
      ? Math.min(mobilePair[1], selectedTrips.length - 1)
      : -1;
  if (selectedTrips.length > 1 && safeRightIdx === safeLeftIdx) {
    safeRightIdx = safeLeftIdx === 0 ? 1 : 0;
  }
  const mobileLeftTrip = selectedTrips[safeLeftIdx] ?? null;
  const mobileRightTrip =
    safeRightIdx >= 0 ? selectedTrips[safeRightIdx] ?? null : null;
  const mobileVisiblePair = [mobileLeftTrip, mobileRightTrip];
  const showMobilePicker = selectedTrips.length < 2 || mobilePickerOpen;

  return (
    <div
      className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-trips-title"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[94dvh] sm:max-h-[92vh] w-full max-w-[1220px] flex-col overflow-hidden rounded-t-[20px] sm:rounded-[20px] border border-stone-200/90 bg-white shadow-[0_28px_80px_-20px_rgba(15,23,42,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Strip */}
        <div
          aria-hidden="true"
          className="h-[3px] w-full bg-gradient-to-r from-[#3f6e15] via-[#f05e25] to-[#ff8a50]"
        />

        {/* Editorial Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 bg-[#faf8f4] px-4 py-3.5 sm:px-7 sm:py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-[12px] bg-[#3f6e15] text-white shadow-xs">
              <Scale className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="compare-trips-title"
                  className="font-heading text-lg sm:text-2xl font-bold text-[#1c1917] tracking-tight"
                >
                  Compare Expeditions
                </h2>
                <span className="rounded-full border border-[#3f6e15]/25 bg-[#3f6e15]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#3f6e15] tabular-nums">
                  {selectedTrips.length} of {MAX_COMPARE_TRIPS}
                </span>
              </div>
              <p className="hidden sm:block mt-0.5 text-xs text-[#57534d]">
                Evaluate daily duration, summit altitude, trail difficulty, season windows, and all-inclusive tariffs side by side.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedTrips.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  clearCompareTripSlugs();
                  addCompareTripSlug(currentTripSlug);
                  setMobilePickerOpen(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#57534d] hover:border-stone-300 hover:text-[#1c1917] transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close comparison modal"
              className="grid h-9 w-9 place-items-center rounded-full border border-stone-200 bg-white text-[#1c1917] hover:bg-[#f05e25] hover:border-[#f05e25] hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Interactive Comparison Canvas */}
        <div className="flex-1 overflow-auto bg-white p-3.5 sm:p-6">
          {/* ============================================================== */}
          {/* MOBILE SIDE-BY-SIDE COMPARE VIEW (< md)                         */}
          {/* ============================================================== */}
          <div className="md:hidden space-y-4 pb-2">
            {/* Manage & Switch Trips when > 2 selected */}
            {selectedTrips.length > 2 && (
              <div className="rounded-[14px] border border-stone-200 bg-[#faf9f6] p-3 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#57534d]">
                    Switch Pair to Compare
                  </span>
                  <span className="text-[11px] text-[#57534d]">
                    {selectedTrips.length} saved
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    aria-label="Left comparison trip"
                    value={safeLeftIdx}
                    onChange={(e) =>
                      setMobilePair([Number(e.target.value), safeRightIdx])
                    }
                    className="w-full rounded-[10px] border border-stone-200 bg-white px-2.5 py-2 text-xs font-semibold text-[#1c1917] truncate"
                  >
                    {selectedTrips.map((t, idx) => (
                      <option key={`ml-${t.slug}`} value={idx}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Right comparison trip"
                    value={safeRightIdx}
                    onChange={(e) =>
                      setMobilePair([safeLeftIdx, Number(e.target.value)])
                    }
                    className="w-full rounded-[10px] border border-stone-200 bg-white px-2.5 py-2 text-xs font-semibold text-[#1c1917] truncate"
                  >
                    {selectedTrips.map((t, idx) => (
                      <option key={`mr-${t.slug}`} value={idx}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Mobile Quick-Add / Search Trek Panel */}
            {showMobilePicker && canAddSlot && (
              <div className="rounded-[16px] border border-[#3f6e15]/25 bg-[#faf9f6] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-[#1c1917]">
                      {selectedTrips.length < 2
                        ? "Pick a 2nd Expedition to Compare"
                        : "Add Another Expedition"}
                    </p>
                    <p className="text-[11px] text-[#57534d]">
                      Tap any route below for instant side-by-side comparison
                    </p>
                  </div>
                  {selectedTrips.length >= 2 && (
                    <button
                      type="button"
                      onClick={() => setMobilePickerOpen(false)}
                      className="grid h-7 w-7 place-items-center rounded-full border border-stone-200 bg-white text-[#57534d]"
                      aria-label="Close trek picker"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search treks or regions..."
                    aria-label="Search trips to add on mobile"
                    className="w-full rounded-[10px] border border-stone-200 bg-white pl-8.5 pr-8 py-2 text-xs text-[#1c1917] placeholder:text-stone-400 focus:border-[#3f6e15] focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear mobile search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="max-h-44 space-y-1.5 overflow-y-auto pr-0.5">
                  {availableToAdd.length === 0 ? (
                    <p className="py-4 text-center text-xs text-[#57534d]">
                      No matching routes found.
                    </p>
                  ) : (
                    availableToAdd.map((cand) => (
                      <button
                        key={`madd-${cand.slug}`}
                        type="button"
                        onClick={() => {
                          addCompareTripSlug(cand.slug);
                          setSearchQuery("");
                          setMobilePickerOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-[10px] border border-stone-200 bg-white p-2 text-left active:scale-[0.99]"
                      >
                        <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded-[8px] bg-stone-200">
                          <Image
                            src={cand.image}
                            alt={cand.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-[#1c1917]">
                            {cand.name}
                          </p>
                          <p className="truncate text-[11px] text-[#57534d] tabular-nums">
                            {cand.days}d ·{" "}
                            {cand.maxAltitude > 0
                              ? `${cand.maxAltitude.toLocaleString("en-US")}m`
                              : cand.area}{" "}
                            · {formatPriceUsd(cand.price, cand.priceUsd)}
                          </p>
                        </div>
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#3f6e15]/10 text-[#3f6e15]">
                          <Plus className="h-4 w-4" />
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Mobile 50/50 Trip Header Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              {mobileVisiblePair.map((item, slotIdx) => {
                if (!item) {
                  return (
                    <button
                      key="mobile-empty-slot"
                      type="button"
                      onClick={() => setMobilePickerOpen(true)}
                      className="flex min-h-[175px] flex-col items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-stone-300 bg-[#faf9f6] p-3 text-center"
                    >
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-[#3f6e15]/10 text-[#3f6e15]">
                        <Plus className="h-4.5 w-4.5" />
                      </span>
                      <span className="text-xs font-bold text-[#1c1917]">
                        Select 2nd Route
                      </span>
                      <span className="text-[11px] text-[#57534d]">
                        Pick from list above
                      </span>
                    </button>
                  );
                }

                const isCurrent = item.slug === currentTripSlug;
                const itemUsd = nprToUsd(item.price, item.priceUsd);
                const isBestValue =
                  showWinnerBadges && itemUsd === metrics.lowestUsd;

                return (
                  <div
                    key={`mcard-${item.slug}-${slotIdx}`}
                    className="relative overflow-hidden rounded-[14px] border border-stone-200/90 bg-white shadow-xs"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-900">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="50vw"
                        className="object-cover"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/15" />

                      <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                        {isCurrent && (
                          <span className="rounded-full bg-[#3f6e15] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                            Current
                          </span>
                        )}
                        {isBestValue && (
                          <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                            Best Value
                          </span>
                        )}
                      </div>

                      {selectedTrips.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCompareTripSlug(item.slug)}
                          aria-label={`Remove ${item.name}`}
                          className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/65 text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}

                      <span className="absolute inset-x-2 bottom-1.5 truncate text-[10px] font-medium text-white/95">
                        {item.area}
                      </span>
                    </div>

                    <div className="p-2.5 space-y-1">
                      <h3 className="font-heading text-[13px] font-bold text-[#1c1917] leading-snug line-clamp-2 min-h-[34px]">
                        {item.name}
                      </h3>
                      <p className="text-sm font-bold text-[#3f6e15] tabular-nums">
                        {formatPriceUsd(item.price, item.priceUsd)}
                        <span className="text-[10px] font-normal text-[#57534d]">
                          {" "}
                          / guest
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Metric Blocks (clean 2-col comparisons) */}
            {mobileLeftTrip && (
              <div className="space-y-2">
                {/* Duration & Altitude */}
                <div className="rounded-[12px] border border-stone-200/80 bg-[#faf9f6] p-3 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#57534d] flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-[#3f6e15]" />
                    <span>Duration</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    {mobileVisiblePair.map((item, i) =>
                      item ? (
                        <div key={`mdays-${i}`} className="font-semibold text-[#1c1917] tabular-nums">
                          {item.days} {item.days === 1 ? "Day" : "Days"}
                          {showWinnerBadges && item.days === metrics.shortestDays && (
                            <span className="ml-1.5 rounded-full bg-[#3f6e15]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#3f6e15]">
                              Shortest
                            </span>
                          )}
                        </div>
                      ) : (
                        <div key={`mdays-empty-${i}`} className="text-stone-400">—</div>
                      )
                    )}
                  </div>
                </div>

                <div className="rounded-[12px] border border-stone-200/80 bg-white p-3 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#57534d] flex items-center gap-1.5">
                    <Mountain className="h-3 w-3 text-[#f05e25]" />
                    <span>Max Altitude</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    {mobileVisiblePair.map((item, i) => {
                      if (!item) {
                        return (
                          <div key={`malt-empty-${i}`} className="text-stone-400">
                            —
                          </div>
                        );
                      }
                      const isPeak =
                        showWinnerBadges &&
                        item.maxAltitude > 0 &&
                        item.maxAltitude === metrics.highestAltitude;
                      const barPct =
                        item.maxAltitude > 0
                          ? Math.max(
                              14,
                              Math.round(
                                (item.maxAltitude / metrics.highestAltitude) * 100
                              )
                            )
                          : 8;
                      return (
                        <div key={`malt-${i}`} className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-[#1c1917] tabular-nums">
                              {item.maxAltitude > 0
                                ? `${item.maxAltitude.toLocaleString("en-US")} m`
                                : "Lowland"}
                            </span>
                            {isPeak && (
                              <span className="rounded-full bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-800">
                                Highest
                              </span>
                            )}
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
                            <div
                              style={{ width: `${barPct}%` }}
                              className={`h-full rounded-full ${
                                isPeak ? "bg-[#f05e25]" : "bg-[#3f6e15]"
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="rounded-[12px] border border-stone-200/80 bg-[#faf9f6] p-3 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#57534d] flex items-center gap-1.5">
                    <Gauge className="h-3 w-3 text-[#3f6e15]" />
                    <span>Difficulty</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {mobileVisiblePair.map((item, i) => {
                      if (!item) {
                        return (
                          <div key={`mdiff-empty-${i}`} className="text-xs text-stone-400">
                            —
                          </div>
                        );
                      }
                      const grade = getDifficultyLevel(item.difficulty);
                      return (
                        <div key={`mdiff-${i}`} className="space-y-1.5">
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${grade.pillClass}`}
                          >
                            {item.difficulty}
                          </span>
                          <div className="flex items-center gap-1" aria-hidden="true">
                            {[1, 2, 3, 4].map((step) => (
                              <span
                                key={step}
                                className={`h-1.5 flex-1 rounded-full ${
                                  step <= grade.bars
                                    ? grade.barClass
                                    : "bg-stone-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Best Seasons & Group Size */}
                <div className="rounded-[12px] border border-stone-200/80 bg-white p-3 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#57534d] flex items-center gap-1.5">
                    <Sun className="h-3 w-3 text-amber-600" />
                    <span>Best Seasons &amp; Group Cap</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2.5 text-[11px] text-[#292524]">
                    {mobileVisiblePair.map((item, i) =>
                      item ? (
                        <div key={`mseas-${i}`} className="space-y-0.5">
                          <p className="font-semibold">
                            {formatSeasonRange(item.seasonMonths)}
                          </p>
                          <p className="text-[#57534d]">
                            Up to {item.groupMax} guests
                          </p>
                        </div>
                      ) : (
                        <div key={`mseas-empty-${i}`} className="text-stone-400">
                          —
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Route & Stay */}
                <div className="rounded-[12px] border border-stone-200/80 bg-[#faf9f6] p-3 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#57534d] flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-[#f05e25]" />
                    <span>Route &amp; Accommodation</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2.5 text-[11px] text-[#292524]">
                    {mobileVisiblePair.map((item, i) =>
                      item ? (
                        <div key={`mroute-${i}`} className="space-y-0.5">
                          <p className="font-semibold">
                            {item.start.trim().toLowerCase() ===
                            item.end.trim().toLowerCase()
                              ? `Round trip (${item.start})`
                              : `${item.start} -> ${item.end}`}
                          </p>
                          <p className="text-[#57534d] line-clamp-2">
                            {item.accommodationSummary?.trim() ||
                              "Hotel & Mountain Lodges"}
                          </p>
                        </div>
                      ) : (
                        <div key={`mroute-empty-${i}`} className="text-stone-400">
                          —
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Top Highlights */}
                <div className="rounded-[12px] border border-stone-200/80 bg-white p-3 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#57534d] flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-[#f05e25]" />
                    <span>Highlights</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2.5 text-[11px] text-[#44403c]">
                    {mobileVisiblePair.map((item, i) =>
                      item && item.highlights.length > 0 ? (
                        <ul key={`mhl-${i}`} className="space-y-1">
                          {item.highlights.slice(0, 2).map((h, hIdx) => (
                            <li key={hIdx} className="flex items-start gap-1">
                              <Check className="mt-0.5 h-3 w-3 shrink-0 text-[#3f6e15]" />
                              <span className="line-clamp-2 leading-snug">
                                {h}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div key={`mhl-empty-${i}`} className="text-stone-400">
                          —
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Mobile Bottom CTAs */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {mobileVisiblePair.map((item, i) =>
                    item ? (
                      item.slug === currentTripSlug ? (
                        <button
                          key={`mcta-${i}`}
                          type="button"
                          onClick={onClose}
                          className="w-full rounded-[10px] border border-stone-300 bg-stone-100 px-3 py-2 text-xs font-semibold text-[#1c1917]"
                        >
                          Viewing Now
                        </button>
                      ) : (
                        <Link
                          key={`mcta-${i}`}
                          href={`/destinations/${item.slug}`}
                          onClick={onClose}
                          className="inline-flex w-full items-center justify-center gap-1 rounded-[10px] bg-[#3f6e15] px-3 py-2 text-xs font-semibold text-white"
                        >
                          <span>View Trip</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      )
                    ) : (
                      <div key={`mcta-empty-${i}`} />
                    )
                  )}
                </div>

                {selectedTrips.length >= 2 && canAddSlot && !mobilePickerOpen && (
                  <button
                    type="button"
                    onClick={() => setMobilePickerOpen(true)}
                    className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-full border border-[#3f6e15]/30 bg-[#faf9f6] py-2.5 text-xs font-semibold text-[#3f6e15]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>
                      Add Another Expedition ({MAX_COMPARE_TRIPS - selectedTrips.length} left)
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* DESKTOP MULTI-COLUMN COMPARE TABLE (md+) — UNCHANGED           */}
          {/* ============================================================== */}
          <div className="hidden md:block min-w-max">
            <table className="w-full border-separate border-spacing-x-3 border-spacing-y-0 text-left">
              <thead>
                <tr>
                  {/* Sticky Spec Header Cell */}
                  <th className="sticky left-0 z-20 w-[145px] sm:w-[175px] bg-white align-bottom pb-4 pr-2">
                    <div className="rounded-[12px] border border-stone-200/80 bg-[#faf9f6] p-3.5 space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#f05e25]">
                        Comparison Guide
                      </p>
                      <p className="text-xs font-semibold text-[#1c1917] leading-snug">
                        {selectedTrips.length < 2
                          ? "Pick another trek on the right to compare metrics"
                          : "Comparing top route logistics & tariffs"}
                      </p>
                    </div>
                  </th>

                  {/* Selected Trip Cards */}
                  {selectedTrips.map((item) => {
                    const isCurrent = item.slug === currentTripSlug;
                    const itemUsd = nprToUsd(item.price, item.priceUsd);
                    const isBestValue =
                      showWinnerBadges && itemUsd === metrics.lowestUsd;
                    return (
                      <th
                        key={item.slug}
                        className="w-[245px] sm:w-[265px] align-top pb-4"
                      >
                        <div className="group relative overflow-hidden rounded-[16px] border border-stone-200/90 bg-white shadow-xs hover:border-[#3f6e15]/40 transition-colors">
                          <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="280px"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/15" />

                            <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
                              {isCurrent && (
                                <span className="rounded-full bg-[#3f6e15] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                                  Current
                                </span>
                              )}
                              {isBestValue && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                                  <Sparkles className="h-2.5 w-2.5" />
                                  Best Value
                                </span>
                              )}
                            </div>

                            {selectedTrips.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeCompareTripSlug(item.slug)}
                                aria-label={`Remove ${item.name} from comparison`}
                                className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white backdrop-blur-xs hover:bg-rose-600 transition-colors cursor-pointer"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}

                            <div className="absolute inset-x-3 bottom-2.5 flex items-end justify-between gap-2 text-white">
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white/90 truncate">
                                <MapPin className="h-3 w-3 text-[#ff8a50] shrink-0" />
                                <span className="truncate">{item.area}</span>
                              </span>
                            </div>
                          </div>

                          <div className="p-3.5 space-y-1.5">
                            <h3 className="font-heading text-[15px] font-bold text-[#1c1917] leading-snug line-clamp-2 min-h-[40px]">
                              {item.name}
                            </h3>
                            <div className="flex items-baseline justify-between pt-1 border-t border-stone-100">
                              <span className="text-[11px] font-medium text-[#57534d]">
                                From
                              </span>
                              <span className="text-base font-bold text-[#3f6e15] tabular-nums">
                                {formatPriceUsd(item.price, item.priceUsd)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </th>
                    );
                  })}

                  {/* Interactive Quick-Add Column Slot */}
                  {canAddSlot && (
                    <th className="w-[260px] sm:w-[285px] align-top pb-4 font-normal">
                      <div className="flex h-full min-h-[240px] flex-col rounded-[16px] border-2 border-dashed border-stone-300 bg-[#faf9f6] p-3.5">
                        <div className="flex items-center justify-between gap-2 pb-2">
                          <span className="text-xs font-bold text-[#1c1917]">
                            + Add Expedition
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#57534d]">
                            {MAX_COMPARE_TRIPS - selectedTrips.length} left
                          </span>
                        </div>

                        <div className="relative mb-2.5">
                          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search treks or regions..."
                            aria-label="Search trips to add to comparison"
                            className="w-full rounded-[10px] border border-stone-200 bg-white pl-8 pr-7 py-1.5 text-xs text-[#1c1917] placeholder:text-stone-400 focus:border-[#3f6e15] focus:outline-none"
                          />
                          {searchQuery && (
                            <button
                              type="button"
                              onClick={() => setSearchQuery("")}
                              aria-label="Clear search"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>

                        <div className="max-h-[152px] flex-1 space-y-1.5 overflow-y-auto pr-0.5">
                          {availableToAdd.length === 0 ? (
                            <p className="py-6 text-center text-[11px] text-[#57534d]">
                              No matching routes found.
                            </p>
                          ) : (
                            availableToAdd.map((cand) => (
                              <button
                                key={cand.slug}
                                type="button"
                                onClick={() => {
                                  addCompareTripSlug(cand.slug);
                                  setSearchQuery("");
                                }}
                                className="flex w-full items-center gap-2.5 rounded-[10px] border border-stone-200/80 bg-white p-1.5 text-left hover:border-[#3f6e15] hover:bg-[#3f6e15]/[0.03] transition-colors cursor-pointer group"
                              >
                                <div className="relative h-9 w-11 shrink-0 overflow-hidden rounded-[7px] bg-stone-200">
                                  <Image
                                    src={cand.image}
                                    alt={cand.name}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-semibold text-[#1c1917] group-hover:text-[#3f6e15]">
                                    {cand.name}
                                  </p>
                                  <p className="truncate text-[10px] text-[#57534d] tabular-nums">
                                    {cand.days}d ·{" "}
                                    {cand.maxAltitude > 0
                                      ? `${cand.maxAltitude.toLocaleString("en-US")}m`
                                      : cand.area}{" "}
                                    · {formatPriceUsd(cand.price, cand.priceUsd)}
                                  </p>
                                </div>
                                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-stone-100 text-[#3f6e15] group-hover:bg-[#3f6e15] group-hover:text-white transition-colors">
                                  <Plus className="h-3.5 w-3.5" />
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="text-sm">
                {/* 1. Tariff / Price */}
                <tr className="bg-[#faf9f6]">
                  <td className="sticky left-0 z-10 bg-[#faf9f6] border-t border-stone-200/70 px-3 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#57534d] align-middle rounded-l-[10px]">
                    <span className="inline-flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5 text-[#3f6e15]" />
                      <span>Tariff (USD)</span>
                    </span>
                  </td>
                  {selectedTrips.map((item) => {
                    const usd = nprToUsd(item.price, item.priceUsd);
                    const isLowest =
                      showWinnerBadges && usd === metrics.lowestUsd;
                    return (
                      <td
                        key={`price-${item.slug}`}
                        className="border-t border-stone-200/70 px-3.5 py-3.5 align-middle"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-bold text-[#1c1917] tabular-nums">
                            {formatPriceUsd(item.price, item.priceUsd)}
                          </span>
                          <span className="text-[11px] text-[#57534d]">
                            / guest
                          </span>
                          {isLowest && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              Lowest
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  {canAddSlot && (
                    <td
                      rowSpan={10}
                      className="border-t border-stone-200/70 px-3 py-4 align-top"
                    >
                      <div className="rounded-[12px] border border-stone-200/70 bg-[#faf9f6] p-4 text-center space-y-2">
                        <Scale className="mx-auto h-5 w-5 text-stone-400" />
                        <p className="text-xs font-semibold text-[#1c1917]">
                          Pick a route above to add another column
                        </p>
                        <p className="text-[11px] text-[#57534d] leading-relaxed">
                          Compare up to {MAX_COMPARE_TRIPS} Himalayan treks or tours side by side.
                        </p>
                      </div>
                    </td>
                  )}
                </tr>

                {/* 2. Duration */}
                <tr className="bg-white">
                  <td className="sticky left-0 z-10 bg-white border-t border-stone-200/70 px-3 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#57534d] align-middle">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#3f6e15]" />
                      <span>Duration</span>
                    </span>
                  </td>
                  {selectedTrips.map((item) => {
                    const isShortest =
                      showWinnerBadges && item.days === metrics.shortestDays;
                    return (
                      <td
                        key={`days-${item.slug}`}
                        className="border-t border-stone-200/70 px-3.5 py-3.5 align-middle"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#1c1917] tabular-nums">
                            {item.days} {item.days === 1 ? "Day" : "Days"}
                          </span>
                          {isShortest && (
                            <span className="rounded-full bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] font-semibold text-[#3f6e15]">
                              Shortest
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* 3. Max Altitude + Visual Elevation Bar */}
                <tr className="bg-[#faf9f6]">
                  <td className="sticky left-0 z-10 bg-[#faf9f6] border-t border-stone-200/70 px-3 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#57534d] align-middle rounded-l-[10px]">
                    <span className="inline-flex items-center gap-1.5">
                      <Mountain className="h-3.5 w-3.5 text-[#f05e25]" />
                      <span>Max Altitude</span>
                    </span>
                  </td>
                  {selectedTrips.map((item) => {
                    const isPeak =
                      showWinnerBadges &&
                      item.maxAltitude > 0 &&
                      item.maxAltitude === metrics.highestAltitude;
                    const barPct =
                      item.maxAltitude > 0
                        ? Math.max(
                            14,
                            Math.round(
                              (item.maxAltitude / metrics.highestAltitude) * 100
                            )
                          )
                        : 8;
                    return (
                      <td
                        key={`alt-${item.slug}`}
                        className="border-t border-stone-200/70 px-3.5 py-3.5 align-middle"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-[#1c1917] tabular-nums">
                              {item.maxAltitude > 0
                                ? `${item.maxAltitude.toLocaleString("en-US")} m`
                                : "Lowland"}
                            </span>
                            {isPeak && (
                              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                                Highest
                              </span>
                            )}
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
                            <div
                              style={{ width: `${barPct}%` }}
                              className={`h-full rounded-full transition-all duration-500 ${
                                isPeak ? "bg-[#f05e25]" : "bg-[#3f6e15]"
                              }`}
                            />
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* 4. Difficulty + 4-Segment Grade Meter */}
                <tr className="bg-white">
                  <td className="sticky left-0 z-10 bg-white border-t border-stone-200/70 px-3 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#57534d] align-middle">
                    <span className="inline-flex items-center gap-1.5">
                      <Gauge className="h-3.5 w-3.5 text-[#3f6e15]" />
                      <span>Difficulty</span>
                    </span>
                  </td>
                  {selectedTrips.map((item) => {
                    const grade = getDifficultyLevel(item.difficulty);
                    return (
                      <td
                        key={`diff-${item.slug}`}
                        className="border-t border-stone-200/70 px-3.5 py-3.5 align-middle"
                      >
                        <div className="space-y-1.5">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${grade.pillClass}`}
                          >
                            {item.difficulty}
                          </span>
                          <div
                            className="flex items-center gap-1"
                            aria-hidden="true"
                          >
                            {[1, 2, 3, 4].map((step) => (
                              <span
                                key={step}
                                className={`h-1.5 flex-1 rounded-full ${
                                  step <= grade.bars
                                    ? grade.barClass
                                    : "bg-stone-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* 5. Best Seasons */}
                <tr className="bg-[#faf9f6]">
                  <td className="sticky left-0 z-10 bg-[#faf9f6] border-t border-stone-200/70 px-3 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#57534d] align-middle rounded-l-[10px]">
                    <span className="inline-flex items-center gap-1.5">
                      <Sun className="h-3.5 w-3.5 text-amber-600" />
                      <span>Best Seasons</span>
                    </span>
                  </td>
                  {selectedTrips.map((item) => (
                    <td
                      key={`season-${item.slug}`}
                      className="border-t border-stone-200/70 px-3.5 py-3.5 text-xs sm:text-[13px] font-medium text-[#292524] align-middle"
                    >
                      {formatSeasonRange(item.seasonMonths)}
                    </td>
                  ))}
                </tr>

                {/* 6. Group Size */}
                <tr className="bg-white">
                  <td className="sticky left-0 z-10 bg-white border-t border-stone-200/70 px-3 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#57534d] align-middle">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-[#3f6e15]" />
                      <span>Group Cap</span>
                    </span>
                  </td>
                  {selectedTrips.map((item) => (
                    <td
                      key={`group-${item.slug}`}
                      className="border-t border-stone-200/70 px-3.5 py-3.5 text-xs sm:text-[13px] text-[#292524] align-middle"
                    >
                      Up to {item.groupMax} travellers
                    </td>
                  ))}
                </tr>

                {/* 7. Route */}
                <tr className="bg-[#faf9f6]">
                  <td className="sticky left-0 z-10 bg-[#faf9f6] border-t border-stone-200/70 px-3 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#57534d] align-middle rounded-l-[10px]">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#f05e25]" />
                      <span>Start &amp; End</span>
                    </span>
                  </td>
                  {selectedTrips.map((item) => (
                    <td
                      key={`route-${item.slug}`}
                      className="border-t border-stone-200/70 px-3.5 py-3.5 text-xs sm:text-[13px] text-[#292524] align-middle"
                    >
                      {item.start.trim().toLowerCase() ===
                      item.end.trim().toLowerCase()
                        ? `Round trip (${item.start})`
                        : `${item.start} -> ${item.end}`}
                    </td>
                  ))}
                </tr>

                {/* 8. Accommodation & Meals */}
                <tr className="bg-white">
                  <td className="sticky left-0 z-10 bg-white border-t border-stone-200/70 px-3 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#57534d] align-top">
                    <span className="inline-flex items-center gap-1.5">
                      <BedDouble className="h-3.5 w-3.5 text-[#3f6e15]" />
                      <span>Lodging &amp; Meals</span>
                    </span>
                  </td>
                  {selectedTrips.map((item) => (
                    <td
                      key={`lodge-${item.slug}`}
                      className="border-t border-stone-200/70 px-3.5 py-3.5 text-xs text-[#44403c] align-top space-y-1.5"
                    >
                      <p className="flex items-start gap-1.5">
                        <BedDouble className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
                        <span>
                          {item.accommodationSummary?.trim() ||
                            "Hotel & Mountain Lodges"}
                        </span>
                      </p>
                      <p className="flex items-start gap-1.5">
                        <Utensils className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
                        <span>
                          {item.mealsSummary?.trim() ||
                            (item.days > 1
                              ? "Breakfast, Lunch & Dinner"
                              : "Meals as per itinerary")}
                        </span>
                      </p>
                    </td>
                  ))}
                </tr>

                {/* 9. Highlights */}
                <tr className="bg-[#faf9f6]">
                  <td className="sticky left-0 z-10 bg-[#faf9f6] border-t border-stone-200/70 px-3 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#57534d] align-top rounded-l-[10px]">
                    <span className="inline-flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#f05e25]" />
                      <span>Highlights</span>
                    </span>
                  </td>
                  {selectedTrips.map((item) => (
                    <td
                      key={`hl-${item.slug}`}
                      className="border-t border-stone-200/70 px-3.5 py-3.5 align-top"
                    >
                      {item.highlights.length > 0 ? (
                        <ul className="space-y-1.5 text-xs text-[#44403c]">
                          {item.highlights.slice(0, 3).map((h, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3f6e15]" />
                              <span className="line-clamp-2 leading-relaxed">
                                {h}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xs text-stone-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 10. Action CTA Row */}
                <tr className="bg-white">
                  <td className="sticky left-0 z-10 bg-white border-t border-stone-200 px-3 pt-4 pb-1" />
                  {selectedTrips.map((item) => (
                    <td
                      key={`cta-${item.slug}`}
                      className="border-t border-stone-200 px-3.5 pt-4 pb-1"
                    >
                      {item.slug === currentTripSlug ? (
                        <button
                          type="button"
                          onClick={onClose}
                          className="w-full rounded-[10px] border border-stone-300 bg-stone-100 px-3.5 py-2.5 text-xs font-semibold text-[#1c1917] hover:bg-stone-200 transition-colors cursor-pointer"
                        >
                          Currently Viewing
                        </button>
                      ) : (
                        <Link
                          href={`/destinations/${item.slug}`}
                          onClick={onClose}
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-[#3f6e15] px-3.5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#315710] transition-colors"
                        >
                          <span>View Full Itinerary</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
