"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Mountain,
} from "lucide-react";
import { formatPriceUsd } from "@/lib/booking";
import type { TripDTO } from "@/lib/types";
import { ScrollReveal } from "./motion/ScrollReveal";

function getCircularOffset(
  index: number,
  activeIndex: number,
  total: number
): number {
  if (total <= 1) return 0;
  let diff = index - activeIndex;
  const half = total / 2;
  if (diff > half) diff -= total;
  if (diff < -half) diff += total;
  return diff;
}

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export default function MirrorHighRoutes({
  trips,
  totalCount,
}: {
  trips: TripDTO[];
  totalCount?: number;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPausedByUser, setIsPausedByUser] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [mobileActiveIndex, setMobileActiveIndex] = useState<number>(0);
  const [mobileCanLeft, setMobileCanLeft] = useState<boolean>(false);
  const [mobileCanRight, setMobileCanRight] = useState<boolean>(trips.length > 1);
  const [mobilePaused, setMobilePaused] = useState<boolean>(false);
  const touchStartXRef = useRef<number | null>(null);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const safeActiveIndex =
    trips.length > 0
      ? ((activeIndex % trips.length) + trips.length) % trips.length
      : 0;

  const goPrev = useCallback(() => {
    if (trips.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + trips.length) % trips.length);
  }, [trips.length]);

  const goNext = useCallback(() => {
    if (trips.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % trips.length);
  }, [trips.length]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry?.isIntersecting ?? false);
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || isPausedByUser || !isVisible || trips.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % trips.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [reducedMotion, isPausedByUser, isVisible, trips.length]);

  const checkMobileScroll = useCallback(() => {
    const el = mobileScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setMobileCanLeft(scrollLeft > 20);
    setMobileCanRight(scrollLeft < scrollWidth - clientWidth - 20);
    const firstCard = el.firstElementChild as HTMLElement | null;
    const step = firstCard ? firstCard.offsetWidth + 20 : 310;
    const index = Math.round(scrollLeft / Math.max(step, 1));
    setMobileActiveIndex(
      Math.min(Math.max(index, 0), Math.max(trips.length - 1, 0))
    );
  }, [trips.length]);

  useEffect(() => {
    const el = mobileScrollRef.current;
    if (!el) return;
    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        checkMobileScroll();
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const initRaf = requestAnimationFrame(checkMobileScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(initRaf);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [checkMobileScroll]);

  useEffect(() => {
    if (!isVisible || mobilePaused || reducedMotion || trips.length <= 1) {
      return;
    }
    const timer = window.setInterval(() => {
      const el = mobileScrollRef.current;
      if (!el || el.clientWidth === 0) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      if (el.scrollLeft >= maxScroll - 30) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const firstCard = el.firstElementChild as HTMLElement | null;
        const step = firstCard ? firstCard.offsetWidth + 20 : 310;
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 3800);
    return () => window.clearInterval(timer);
  }, [isVisible, mobilePaused, reducedMotion, trips.length]);

  const scrollMobileBy = (direction: "left" | "right") => {
    const el = mobileScrollRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement | null;
    const step = (firstCard ? firstCard.offsetWidth + 20 : 310) * (direction === "left" ? -1 : 1);
    el.scrollBy({ left: step, behavior: "smooth" });
  };

  const scrollMobileTo = (idx: number) => {
    const el = mobileScrollRef.current;
    if (!el) return;
    const target = el.children.item(idx) as HTMLElement | null;
    if (!target) return;
    el.scrollTo({ left: target.offsetLeft - 8, behavior: "smooth" });
  };

  if (trips.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="relative w-full pt-4 sm:pt-8 lg:pt-10 pb-14 sm:pb-20 lg:pb-28 bg-[#edf2f7] text-[#1c1917] overflow-hidden"
    >
      {/* Soft bottom white mist transition fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-px inset-x-0 h-16 z-10"
        style={{
          background:
            "linear-gradient(to top, #ffffff 0%, rgba(237,242,247,0) 100%)",
        }}
      />

      {/* Centered Editorial Header */}
      <ScrollReveal className="relative z-20 max-w-2xl mx-auto px-5 sm:px-6 text-center mb-6 sm:mb-10 lg:mb-12 space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#3f6e15]">
          Regional Trail Guide
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#1c1917] tracking-wide uppercase leading-tight">
          Selected High Routes
        </h2>
        <p className="text-sm sm:text-[15px] text-[#57534d] leading-relaxed">
          Handpicked high-altitude traverses across Nepal with proven
          acclimatization schedules and transparent USD tariffs.
        </p>
      </ScrollReveal>

      {/* Mobile TrekkingRegions-Style Poster Carousel (< md) */}
      <div
        className="md:hidden relative w-full px-4 z-20"
        onMouseEnter={() => setMobilePaused(true)}
        onMouseLeave={() => setMobilePaused(false)}
        onTouchStart={() => setMobilePaused(true)}
        onTouchEnd={() => setMobilePaused(false)}
      >
        {mobileCanLeft && (
          <button
            type="button"
            onClick={() => scrollMobileBy("left")}
            aria-label="Previous route"
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/95 text-stone-900 shadow-xl border border-slate-200/80 flex items-center justify-center hover:bg-[#f05e25] hover:text-white hover:border-[#f05e25] transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2]" />
          </button>
        )}

        {mobileCanRight && (
          <button
            type="button"
            onClick={() => scrollMobileBy("right")}
            aria-label="Next route"
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/95 text-stone-900 shadow-xl border border-slate-200/80 flex items-center justify-center hover:bg-[#f05e25] hover:text-white hover:border-[#f05e25] transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 stroke-[2]" />
          </button>
        )}

        <div
          ref={mobileScrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-4 px-2 scroll-smooth"
        >
          {trips.map((trip) => {
            const statusLabel = trip.badge || "Open Trail";
            const isRestricted =
              statusLabel.toLowerCase().includes("restrict") ||
              trip.region === "restricted";
            const regionLabel = trip.area || trip.region || trip.country;
            const tripSummary = trip.tagline || trip.overview;
            const tripHref = `/destinations/${trip.slug}`;
            const bookHref = `/destinations/${trip.slug}#booking`;

            return (
              <article
                key={`mobile-${trip.id}`}
                className="group relative w-[290px] sm:w-[330px] h-[480px] shrink-0 rounded-[28px] overflow-hidden shadow-[0_12px_32px_-8px_rgba(15,23,42,0.18)] snap-center select-none"
              >
                <Image
                  src={trip.image}
                  alt={trip.name}
                  fill
                  sizes="330px"
                  unoptimized={trip.image.startsWith("/api/uploads/")}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                />

                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-black/20 pointer-events-none"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.74) 45%, rgba(0,0,0,0.22) 74%, transparent 100%)",
                  }}
                />

                {/* Top Price & Trail Status */}
                <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-2">
                  <span className="inline-block rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 text-[11px] font-semibold text-[#1c1917] tabular-nums shadow-xs">
                    From {formatPriceUsd(trip.price, trip.priceUsd)}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/45 backdrop-blur-sm border border-white/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/95">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isRestricted ? "bg-amber-400" : "bg-emerald-400"
                      }`}
                    />
                    <span>{statusLabel}</span>
                  </span>
                </div>

                {/* Centered Poster Content Matching TrekkingRegions */}
                <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-center text-center">
                  <span className="inline-block rounded-full bg-white/15 backdrop-blur-sm border border-white/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/95 mb-2.5">
                    {trip.days} {trip.days === 1 ? "Day" : "Days"} ·{" "}
                    {trip.maxAltitude.toLocaleString("en-US")} m ·{" "}
                    {trip.difficulty}
                  </span>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 mb-1">
                    {regionLabel}
                  </p>

                  <h3 className="font-heading font-bold text-2xl text-white tracking-wide leading-tight drop-shadow-md line-clamp-2">
                    {trip.name}
                  </h3>

                  <span className="w-8 h-[2px] bg-[#f05e25] my-3 rounded-full" />

                  <p className="font-sans text-xs text-white/95 leading-relaxed max-w-[250px] line-clamp-2">
                    {tripSummary}
                  </p>

                  <div className="mt-4 flex items-center justify-center gap-2.5 w-full">
                    <Link
                      href={tripHref}
                      className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-full border border-white/60 bg-white/15 backdrop-blur-sm text-white font-heading font-semibold text-[11px] uppercase tracking-wider hover:bg-white hover:text-[#1c1917] transition-all"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={bookHref}
                      className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-full bg-[#f05e25] hover:bg-[#d94e18] text-white font-heading font-semibold text-[11px] uppercase tracking-wider shadow-md shadow-[#f05e25]/35 transition-all"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Mobile Pagination Indicator Dots Matching TrekkingRegions */}
        {trips.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {trips.map((trip, idx) => (
              <button
                key={`mob-dot-${trip.id}`}
                type="button"
                aria-label={`Scroll to ${trip.name}`}
                onClick={() => scrollMobileTo(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  mobileActiveIndex === idx
                    ? "w-8 bg-[#f05e25]"
                    : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Smooth 3-Slot Daylight Coverflow Stage (Tablet & Desktop >= md) */}
      <ScrollReveal direction="scale" delay={120} className="hidden md:block w-full">
        <div
          role="region"
          aria-label="High altitude trekking route spotlight"
          tabIndex={0}
          onMouseEnter={() => setIsPausedByUser(true)}
          onMouseLeave={() => setIsPausedByUser(false)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              goPrev();
            } else if (e.key === "ArrowRight") {
              e.preventDefault();
              goNext();
            }
          }}
          onTouchStart={(e) => {
            touchStartXRef.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            if (touchStartXRef.current === null) return;
            const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
            const deltaX = endX - touchStartXRef.current;
            touchStartXRef.current = null;
            if (Math.abs(deltaX) < 45) return;
            if (deltaX > 0) {
              goPrev();
            } else {
              goNext();
            }
          }}
          className="relative mx-auto w-full h-[530px] sm:h-[615px] lg:h-[655px] flex items-center justify-center select-none focus:outline-none"
        >
          {/* Side Scroll Controls */}
          {trips.length > 1 && (
            <div className="pointer-events-none absolute inset-0 mx-auto w-full max-w-[1360px] z-40">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous route"
                className="pointer-events-auto absolute left-2 sm:left-5 lg:left-8 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200/90 shadow-lg flex items-center justify-center text-[#1c1917] hover:bg-[#f05e25] hover:text-white hover:border-[#f05e25] active:scale-95 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next route"
                className="pointer-events-auto absolute right-2 sm:right-5 lg:right-8 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200/90 shadow-lg flex items-center justify-center text-[#1c1917] hover:bg-[#f05e25] hover:text-white hover:border-[#f05e25] active:scale-95 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}

          {/* Soft horizontal mist vignettes matching stage background */}
          <div
            aria-hidden="true"
            className="pointer-events-none hidden lg:block absolute inset-y-0 left-0 w-24 xl:w-36 z-30 bg-gradient-to-r from-[#edf2f7] to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none hidden lg:block absolute inset-y-0 right-0 w-24 xl:w-36 z-30 bg-gradient-to-l from-[#edf2f7] to-transparent"
          />

          {trips.map((trip, idx) => {
            const offset = getCircularOffset(idx, safeActiveIndex, trips.length);
            const absOffset = Math.abs(offset);
            if (absOffset > 1) return null;

            const isCenter = offset === 0;
            const slotTransform =
              offset === 0
                ? "translate3d(0, 0, 0) scale(1)"
                : `translate3d(${offset * 88}%, 14px, 0) scale(0.86)`;

            const slotOpacity = offset === 0 ? 1 : 0.78;
            const slotZIndex = offset === 0 ? 30 : 20;

            const statusLabel =
              trip.badge?.trim() ||
              (trip.region === "restricted" ? "Restricted Area" : "Open Trail");
            const isRestricted =
              statusLabel.toLowerCase().includes("restrict") ||
              trip.region === "restricted";
            const regionLabel = trip.area || trip.region || trip.country;
            const tripSummary = trip.tagline || trip.overview;
            const tripHref = `/destinations/${trip.slug}`;
            const bookHref = `/destinations/${trip.slug}#booking`;

            const photoPanel = (
              <div className="relative h-[235px] sm:h-[285px] lg:h-[315px] w-full overflow-hidden rounded-[20px] bg-stone-900">
                <Image
                  src={trip.image}
                  alt={trip.name}
                  fill
                  sizes="(max-width: 640px) 340px, (max-width: 1024px) 400px, 440px"
                  className={`object-cover transition-transform duration-700 ${
                    isCenter ? "group-hover:scale-105" : ""
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

                {/* Top-left dynamic price badge */}
                <div className="absolute top-3 left-3">
                  <span className="inline-block rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 text-[11px] font-semibold text-[#1c1917] tabular-nums shadow-xs">
                    From {formatPriceUsd(trip.price, trip.priceUsd)}
                  </span>
                </div>

                {/* Top-right dynamic status badge */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0f3426]/85 backdrop-blur-sm border border-emerald-400/25 px-3 py-1 text-[11px] font-medium text-white">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isRestricted ? "bg-amber-400" : "bg-emerald-400"
                      }`}
                    />
                    <span>{statusLabel}</span>
                  </span>
                </div>

                {/* Lower-left overlay region & title */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85 truncate">
                    {regionLabel}
                  </p>
                  <h3 className="font-heading font-bold text-xl sm:text-[22px] text-white leading-snug tracking-wide drop-shadow-sm line-clamp-2 mt-0.5">
                    {trip.name}
                  </h3>
                </div>
              </div>
            );

            return (
              <article
                key={trip.id}
                style={{
                  transform: slotTransform,
                  opacity: slotOpacity,
                  zIndex: slotZIndex,
                }}
                className={`group absolute flex w-[80vw] max-w-[330px] sm:max-w-none sm:w-[420px] lg:w-[460px] min-h-[470px] sm:min-h-[545px] lg:min-h-[585px] rounded-[26px] p-2.5 sm:p-3 overflow-hidden flex-col justify-between transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
                  isCenter
                    ? "bg-white border border-stone-200/90 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.18)]"
                    : "bg-[#f8fafc] border border-stone-200/80 shadow-md hover:border-stone-300"
                }`}
              >
                {!isCenter && (
                  <button
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Focus ${trip.name}`}
                    className="absolute inset-0 z-20 cursor-pointer rounded-[26px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f05e25]"
                  />
                )}

                <div>
                  {isCenter ? (
                    <Link href={tripHref} className="block">
                      {photoPanel}
                    </Link>
                  ) : (
                    photoPanel
                  )}

                  {/* Middle Body */}
                  <div className="px-2 sm:px-3 pt-4 pb-3 space-y-3.5">
                    <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed line-clamp-2 min-h-[2.4rem]">
                      {tripSummary}
                    </p>

                    {/* 3-Column Dynamic Spec Grid */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 border-t border-stone-100">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                          <Calendar className="w-3.5 h-3.5 text-[#f05e25] shrink-0" />
                          <span className="truncate">Duration</span>
                        </div>
                        <p className="mt-0.5 text-xs sm:text-[13px] font-semibold text-[#1c1917] tabular-nums truncate">
                          {trip.days} {trip.days === 1 ? "Day" : "Days"}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                          <Mountain className="w-3.5 h-3.5 text-[#f05e25] shrink-0" />
                          <span className="truncate">Altitude</span>
                        </div>
                        <p className="mt-0.5 text-xs sm:text-[13px] font-semibold text-[#1c1917] tabular-nums truncate">
                          {trip.maxAltitude.toLocaleString("en-US")} m
                        </p>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                          <Gauge className="w-3.5 h-3.5 text-[#f05e25] shrink-0" />
                          <span className="truncate">Difficulty</span>
                        </div>
                        <p className="mt-0.5 text-xs sm:text-[13px] font-semibold text-[#1c1917] truncate">
                          {trip.difficulty}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Dual CTA Row */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 px-2 sm:px-3 pt-1 pb-1.5">
                  {isCenter ? (
                    <>
                      <Link
                        href={tripHref}
                        className="group/btn inline-flex items-center justify-center gap-1.5 rounded-full border border-stone-300 bg-white hover:border-[#3f6e15] hover:text-[#3f6e15] px-3 sm:px-4 py-2.5 text-xs font-semibold text-[#1c1917] transition-all"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#f05e25] transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                      </Link>
                      <Link
                        href={bookHref}
                        className="group/btn inline-flex items-center justify-center gap-1.5 rounded-full bg-[#f05e25] hover:bg-[#d94e18] px-3 sm:px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-sm shadow-[#f05e25]/30"
                      >
                        <span>Book Now</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex items-center justify-center gap-1.5 rounded-full border border-stone-200 bg-white/70 px-3 sm:px-4 py-2.5 text-xs font-semibold text-stone-500">
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-stone-200/80 px-3 sm:px-4 py-2.5 text-xs font-semibold text-stone-600">
                        <span>Book Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </ScrollReveal>

      {/* Symmetrical Controls & Balanced Directory Strip */}
      <div className="relative z-20 max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 mt-5 sm:mt-8">
        {trips.length > 1 && (
          <div
            className="hidden md:flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
            role="tablist"
            aria-label="Select route card"
          >
            {trips.map((trip, idx) => {
              const active = idx === safeActiveIndex;
              return (
                <button
                  key={trip.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Show ${trip.name}`}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    active
                      ? "w-6 bg-[#f05e25]"
                      : "w-1.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              );
            })}
          </div>
        )}

        <div className="mt-8 pt-5 border-t border-slate-300/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 tabular-nums">
            <span className="md:hidden">
              Route {mobileActiveIndex + 1} of {trips.length}
            </span>
            <span className="hidden md:inline">
              Route {safeActiveIndex + 1} of {trips.length}
            </span>
          </p>
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#3f6e15] hover:text-[#f05e25] transition-colors"
          >
            <span>Explore all {totalCount ?? trips.length} trips</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
