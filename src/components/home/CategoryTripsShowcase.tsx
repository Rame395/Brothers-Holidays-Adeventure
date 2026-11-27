"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ArrowLeft, ArrowRight, Heart, Star } from "lucide-react";
import { formatPriceUsd } from "@/lib/booking";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import type { TripCategoryDTO, TripDTO } from "@/lib/types";
import {
  CulturalTourIcon,
  HelicopterIcon,
  TrekkingIcon,
  WildlifeSafariIcon,
} from "./CategoryIcons";

const SAVED_STORAGE_KEY = "bha_saved_trips";
const SAVED_EVENT_NAME = "bha-saved-trips-change";

function subscribeSavedTrips(callback: () => void) {
  window.addEventListener(SAVED_EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(SAVED_EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSavedTripsSnapshot(): string {
  try {
    return window.localStorage.getItem(SAVED_STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function getSavedTripsServerSnapshot(): string {
  return "[]";
}

function toggleSavedTripSlug(slug: string) {
  try {
    const raw = window.localStorage.getItem(SAVED_STORAGE_KEY) ?? "[]";
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
    const next = list.includes(slug)
      ? list.filter((x) => x !== slug)
      : [...list, slug];
    window.localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(SAVED_EVENT_NAME));
  } catch {
    // Ignore storage failures in restricted browsing modes
  }
}

function formatRouteSignature(start: string, end: string): string {
  const s = start.trim();
  const e = end.trim();
  if (!s && !e) return "Nepal Himalaya";
  if (!e || s.toLowerCase() === e.toLowerCase()) {
    return `Round trip · ${s || e}`;
  }
  return `${s} → ${e}`;
}

interface FocusedCategoryTab {
  key: "top-treks" | "nepal-tours" | "helicopter-tours" | "wildlife-safari";
  label: string;
  ctaLabel: string;
  href: string;
  trips: TripDTO[];
  renderIcon: (className: string) => React.ReactNode;
}

export default function CategoryTripsShowcase({
  categories,
  trips,
}: {
  categories: TripCategoryDTO[];
  trips: TripDTO[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [selectedKey, setSelectedKey] = useState<string>("top-treks");
  const [activeCardIdx, setActiveCardIdx] = useState<number>(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const savedJson = useSyncExternalStore(
    subscribeSavedTrips,
    getSavedTripsSnapshot,
    getSavedTripsServerSnapshot
  );

  const savedSlugs = useMemo(() => {
    try {
      const parsed = JSON.parse(savedJson);
      return new Set<string>(
        Array.isArray(parsed)
          ? parsed.filter((x): x is string => typeof x === "string")
          : []
      );
    } catch {
      return new Set<string>();
    }
  }, [savedJson]);

  const availableTabs = useMemo<FocusedCategoryTab[]>(() => {
    const findCategorySlug = (keywords: string[], fallback: string) => {
      const match = categories.find((c) => {
        const hay = `${c.slug} ${c.name}`.toLowerCase();
        return keywords.some((k) => hay.includes(k));
      });
      return match?.slug ?? fallback;
    };

    const markedTopTreks = trips.filter((t) => Boolean(t.isTopTrek));
    const topTrekTrips =
      markedTopTreks.length > 0
        ? markedTopTreks
        : trips.filter(
            (t) =>
              t.isFeatured &&
              t.country === "nepal" &&
              t.categories.includes("trekking")
          );

    const nepalTourTripsAll = trips.filter(
      (t) =>
        t.country === "nepal" &&
        (t.categories.includes("tours") || t.categories.includes("day-tours"))
    );
    const nepalTourTrips =
      nepalTourTripsAll.length > 0
        ? nepalTourTripsAll
        : trips.filter((t) => t.categories.includes("tours"));

    const heliCategorySlug = findCategorySlug(["heli"], "helicopter-tours");
    const helicopterTrips = trips.filter((t) =>
      t.categories.some((c) => c.toLowerCase().includes("heli"))
    );

    const safariCategorySlug = findCategorySlug(
      ["safari", "wildlife"],
      "wildlife-safari"
    );
    const wildlifeTrips = trips.filter((t) =>
      t.categories.some(
        (c) =>
          c.toLowerCase().includes("safari") ||
          c.toLowerCase().includes("wildlife")
      )
    );

    const tabs: FocusedCategoryTab[] = [
      {
        key: "top-treks",
        label: "Top Treks in Nepal",
        ctaLabel: "trekking routes",
        href: `/destinations/category/${findCategorySlug(["trekking"], "trekking")}`,
        trips: topTrekTrips,
        renderIcon: (cls) => <TrekkingIcon className={cls} />,
      },
      {
        key: "nepal-tours",
        label: "Nepal Tours",
        ctaLabel: "Nepal tours",
        href: `/destinations/category/${findCategorySlug(["tours"], "tours")}`,
        trips: nepalTourTrips,
        renderIcon: (cls) => <CulturalTourIcon className={cls} />,
      },
      {
        key: "helicopter-tours",
        label: "Helicopter Tours",
        ctaLabel: "helicopter tours",
        href: `/destinations/category/${heliCategorySlug}`,
        trips: helicopterTrips,
        renderIcon: (cls) => <HelicopterIcon className={cls} />,
      },
      {
        key: "wildlife-safari",
        label: "Wildlife Safari",
        ctaLabel: "wildlife safaris",
        href: `/destinations/category/${safariCategorySlug}`,
        trips: wildlifeTrips,
        renderIcon: (cls) => <WildlifeSafariIcon className={cls} />,
      },
    ];

    return tabs.filter((tab) => tab.trips.length > 0);
  }, [categories, trips]);

  const activeTab = useMemo(() => {
    if (availableTabs.length === 0) return null;
    return (
      availableTabs.find((t) => t.key === selectedKey) ?? availableTabs[0]
    );
  }, [availableTabs, selectedKey]);

  const syncScrollControls = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, scrollWidth, clientWidth } = track;
    setCanPrev(scrollLeft > 12);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 12);
    const firstCard = track.firstElementChild as HTMLElement | null;
    const step = firstCard ? firstCard.offsetWidth + 16 : 320;
    const total = activeTab?.trips.length ?? 0;
    const idx = Math.round(scrollLeft / Math.max(step, 1));
    setActiveCardIdx(Math.min(Math.max(idx, 0), Math.max(total - 1, 0)));
  }, [activeTab]);

  useEffect(() => {
    const raf = window.requestAnimationFrame(syncScrollControls);
    window.addEventListener("resize", syncScrollControls, { passive: true });
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", syncScrollControls);
    };
  }, [syncScrollControls, activeTab]);

  const handleSelectTab = (key: string) => {
    setSelectedKey(key);
    setActiveCardIdx(0);
    const track = trackRef.current;
    if (track) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const scrollByCard = (direction: "prev" | "next") => {
    const track = trackRef.current;
    if (!track) return;
    const firstCard = track.firstElementChild as HTMLElement | null;
    const step = firstCard ? firstCard.offsetWidth + 20 : 340;
    track.scrollBy({
      left: direction === "next" ? step : -step,
      behavior: "smooth",
    });
  };

  const scrollToCard = (idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const target = track.children.item(idx) as HTMLElement | null;
    if (!target) return;
    track.scrollTo({
      left: target.offsetLeft - 24,
      behavior: "smooth",
    });
  };

  if (!activeTab) {
    return null;
  }

  const activeTrips = activeTab.trips;

  return (
    <section
      aria-label="Explore Nepal Adventures"
      className="relative w-full bg-white py-16 sm:py-20 border-b border-[#e7e3dc]"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        {/* Centered Header Matching Selected High Routes Scale */}
        <ScrollReveal
          distance={16}
          className="max-w-2xl mx-auto text-center space-y-2.5 mb-8"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#3f6e15]">
            Signature Collections
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#1c1917] tracking-wide uppercase leading-tight">
            Explore Nepal Adventures
          </h2>
          <p className="text-sm sm:text-[15px] text-[#57534d] leading-relaxed">
            Handpicked Nepal treks, cultural tours, helicopter flights, and
            wildlife safaris led by our Kathmandu team.
          </p>
        </ScrollReveal>

        {/* Responsive Category Tab Bar (2x2 clean grid on mobile, underline tabs on sm+) */}
        <ScrollReveal distance={16} delay={40}>
          <div className="relative mb-6 sm:mb-8">
            <div className="flex items-end justify-between gap-4 sm:border-b sm:border-[#e7e3dc]">
              <div
                role="tablist"
                aria-label="Adventure categories"
                className="flex-1 grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-center sm:gap-8"
              >
                {availableTabs.map((tab) => {
                  const isActive = tab.key === activeTab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => handleSelectTab(tab.key)}
                      className={`group relative flex items-center justify-between sm:justify-center gap-2 rounded-[10px] sm:rounded-none border sm:border-0 px-3 py-2.5 sm:px-1 sm:pb-3 sm:pt-1 text-left sm:text-center text-[13px] sm:text-[15px] font-sans font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3f6e15] cursor-pointer ${
                        isActive
                          ? "border-[#3f6e15] bg-[#3f6e15]/[0.06] sm:bg-transparent text-[#1f1b16]"
                          : "border-[#e7e3dc] bg-[#faf9f6] sm:bg-transparent text-[#5e554a] sm:text-[#7b7266] hover:text-[#1f1b16]"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5 sm:gap-2 min-w-0">
                        {tab.renderIcon(
                          `w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0 transition-colors duration-200 ${
                            isActive
                              ? "text-[#3f6e15]"
                              : "text-[#7b7266] group-hover:text-[#1f1b16]"
                          }`
                        )}
                        <span className="truncate">{tab.label}</span>
                      </span>
                      <span className="text-[11px] sm:text-xs text-[#7b7266] tabular-nums shrink-0">
                        {tab.trips.length}
                      </span>

                      <span
                        aria-hidden="true"
                        className={`hidden sm:block absolute inset-x-0 -bottom-px h-[2px] transition-opacity duration-200 ${
                          isActive ? "bg-[#3f6e15] opacity-100" : "opacity-0"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Desktop Inline Arrow Controls */}
              {activeTrips.length > 1 && (
                <div className="hidden md:flex items-center gap-2 pb-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => scrollByCard("prev")}
                    disabled={!canPrev}
                    aria-label="Previous routes"
                    className="h-9 w-9 rounded-full border border-[#e7e3dc] bg-white text-[#1f1b16] shadow-[0_4px_12px_-6px_rgba(28,25,23,0.18)] flex items-center justify-center transition-all duration-200 hover:border-[#3f6e15] hover:bg-[#3f6e15] hover:text-white active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3f6e15] disabled:opacity-35 disabled:hover:border-[#e7e3dc] disabled:hover:bg-white disabled:hover:text-[#1f1b16] cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 stroke-[1.75]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollByCard("next")}
                    disabled={!canNext}
                    aria-label="Next routes"
                    className="h-9 w-9 rounded-full border border-[#e7e3dc] bg-white text-[#1f1b16] shadow-[0_4px_12px_-6px_rgba(28,25,23,0.18)] flex items-center justify-center transition-all duration-200 hover:border-[#3f6e15] hover:bg-[#3f6e15] hover:text-white active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3f6e15] disabled:opacity-35 disabled:hover:border-[#e7e3dc] disabled:hover:bg-white disabled:hover:text-[#1f1b16] cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4 stroke-[1.75]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Horizontal 4-Card Responsive Carousel */}
        <ScrollReveal distance={20} delay={60}>
          <div
            ref={trackRef}
            onScroll={syncScrollControls}
            className="flex gap-4 sm:gap-6 -mx-6 px-6 sm:mx-0 sm:px-0 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {activeTrips.map((trip) => {
              const isSaved = savedSlugs.has(trip.slug);
              const reviewCount = trip.reviews.length;
              const avgRating =
                reviewCount > 0
                  ? (
                      trip.reviews.reduce((sum, r) => sum + (r.rating || 5), 0) /
                      reviewCount
                    ).toFixed(1)
                  : null;
              const tripHref = `/destinations/${trip.slug}`;
              const routeSummary = formatRouteSignature(trip.start, trip.end);

              return (
                <article
                  key={trip.id}
                  className="group w-[84vw] max-w-[340px] sm:max-w-none sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)] xl:w-[calc((100%-72px)/4)] shrink-0 snap-center sm:snap-start rounded-[14px] border border-[#e7e3dc] bg-white overflow-hidden transition-[border-color,box-shadow] duration-200 hover:border-[#cfc9be] hover:shadow-[0_10px_28px_-12px_rgba(31,27,22,0.12)] flex flex-col"
                >
                  {/* Unobstructed Route Photograph */}
                  <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#f5f3ef]">
                    <Link
                      href={tripHref}
                      aria-label={trip.name}
                      className="block w-full h-full"
                    >
                      <Image
                        src={trip.image}
                        alt={trip.name}
                        fill
                        sizes="(max-width: 640px) 82vw, (max-width: 1024px) 48vw, (max-width: 1280px) 32vw, 24vw"
                        unoptimized={trip.image.startsWith("/api/uploads/")}
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      />
                    </Link>

                    <button
                      type="button"
                      onClick={() => toggleSavedTripSlug(trip.slug)}
                      aria-label={
                        isSaved
                          ? `Remove ${trip.name} from saved trips`
                          : `Save ${trip.name}`
                      }
                      aria-pressed={isSaved}
                      className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/88 backdrop-blur-xs text-[#1f1b16] hover:bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)] flex items-center justify-center transition-[transform,background-color] duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3f6e15] cursor-pointer"
                    >
                      <Heart
                        className={`w-4 h-4 stroke-[1.6] transition-colors duration-150 ${
                          isSaved
                            ? "fill-[#f05e25] text-[#f05e25]"
                            : "text-[#1f1b16]"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Card Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-[#7b7266] tabular-nums">
                        <span className="truncate">
                          {trip.days} {trip.days === 1 ? "day" : "days"}
                          {trip.maxAltitude > 0
                            ? ` · ${trip.maxAltitude.toLocaleString()} m`
                            : ""}
                          {trip.difficulty ? ` · ${trip.difficulty}` : ""}
                        </span>

                        {avgRating && (
                          <span className="inline-flex items-center gap-1 shrink-0 text-[#1f1b16] font-medium">
                            <Star
                              className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                              aria-hidden="true"
                            />
                            <span>{avgRating}</span>
                            <span className="text-[#7b7266]">
                              ({reviewCount})
                            </span>
                          </span>
                        )}
                      </div>

                      <Link
                        href={tripHref}
                        className="mt-2 block font-heading text-[18px] font-medium text-[#1f1b16] leading-snug line-clamp-2 group-hover:text-[#3f6e15] transition-colors duration-200"
                      >
                        {trip.name}
                      </Link>
                    </div>

                    <div className="pt-3 border-t border-[#f0ede7] flex items-baseline justify-between gap-3">
                      <span className="text-xs text-[#5e554a] truncate">
                        {routeSummary}
                      </span>
                      <span className="shrink-0 tabular-nums text-right">
                        <span className="text-[11px] text-[#7b7266]">
                          From{" "}
                        </span>
                        <span className="text-[15px] font-semibold text-[#1f1b16]">
                          {formatPriceUsd(trip.price, trip.priceUsd)}
                        </span>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Mobile Pagination Row + Clean Single-Line Category CTA */}
        <div className="mt-5 sm:mt-6 flex flex-col items-center gap-4">
          {activeTrips.length > 1 && (
            <div className="md:hidden flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => scrollByCard("prev")}
                disabled={!canPrev}
                aria-label="Previous routes"
                className="h-8 w-8 rounded-full border border-[#e7e3dc] bg-white text-[#1f1b16] shadow-[0_4px_12px_-6px_rgba(28,25,23,0.18)] flex items-center justify-center transition-all duration-200 hover:border-[#3f6e15] hover:bg-[#3f6e15] hover:text-white active:scale-95 disabled:opacity-35 disabled:hover:border-[#e7e3dc] disabled:hover:bg-white disabled:hover:text-[#1f1b16] cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              <div className="flex items-center gap-1.5" aria-label="Route pagination">
                {activeTrips.map((trip, idx) => (
                  <button
                    key={`cat-dot-${trip.id}`}
                    type="button"
                    aria-label={`Scroll to ${trip.name}`}
                    onClick={() => scrollToCard(idx)}
                    className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                      activeCardIdx === idx
                        ? "w-6 bg-[#3f6e15]"
                        : "w-2 bg-[#d6d1c7]"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => scrollByCard("next")}
                disabled={!canNext}
                aria-label="Next routes"
                className="h-8 w-8 rounded-full border border-[#e7e3dc] bg-white text-[#1f1b16] shadow-[0_4px_12px_-6px_rgba(28,25,23,0.18)] flex items-center justify-center transition-all duration-200 hover:border-[#3f6e15] hover:bg-[#3f6e15] hover:text-white active:scale-95 disabled:opacity-35 disabled:hover:border-[#e7e3dc] disabled:hover:bg-white disabled:hover:text-[#1f1b16] cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>
            </div>
          )}

          <Link
            href={activeTab.href}
            className="group inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full border border-[#3f6e15]/25 bg-white pl-5 pr-2 py-2 text-[13px] font-semibold text-[#1c1917] shadow-[0_6px_18px_-10px_rgba(28,25,23,0.22)] transition-all duration-200 hover:border-[#3f6e15] hover:bg-[#3f6e15] hover:text-white hover:shadow-[0_12px_26px_-10px_rgba(63,110,21,0.42)] active:scale-[0.98]"
          >
            <span>View all {activeTab.ctaLabel}</span>
            <span className="rounded-full bg-[#3f6e15]/10 px-2 py-0.5 text-[11px] font-bold text-[#3f6e15] tabular-nums transition-colors duration-200 group-hover:bg-white/20 group-hover:text-white">
              {activeTrips.length}
            </span>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#3f6e15]/10 text-[#3f6e15] transition-all duration-200 group-hover:bg-white/20 group-hover:text-white group-hover:translate-x-0.5">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
