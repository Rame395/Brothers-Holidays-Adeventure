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
import type { TrekRouteDTO } from "@/lib/types";
import { ScrollReveal } from "./motion/ScrollReveal";

function getCircularOffset(index: number, activeIndex: number, total: number): number {
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

export default function MirrorHighRoutes({ treks }: { treks: TrekRouteDTO[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPausedByUser, setIsPausedByUser] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const touchStartXRef = useRef<number | null>(null);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const safeActiveIndex =
    treks.length > 0 ? ((activeIndex % treks.length) + treks.length) % treks.length : 0;

  const goPrev = useCallback(() => {
    if (treks.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + treks.length) % treks.length);
  }, [treks.length]);

  const goNext = useCallback(() => {
    if (treks.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % treks.length);
  }, [treks.length]);

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
    if (reducedMotion || isPausedByUser || !isVisible || treks.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % treks.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [reducedMotion, isPausedByUser, isVisible, treks.length]);

  if (treks.length === 0) return null;

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
          Handpicked high-altitude traverses across Nepal with proven acclimatization
          schedules and transparent USD tariffs.
        </p>
      </ScrollReveal>

      {/* Smooth 3-Slot Daylight Coverflow Stage */}
      <ScrollReveal direction="scale" delay={120} className="w-full">
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
        {treks.length > 1 && (
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

        {treks.map((trek, idx) => {
          const offset = getCircularOffset(idx, safeActiveIndex, treks.length);
          const absOffset = Math.abs(offset);
          if (absOffset > 1) return null;

          const isCenter = offset === 0;

          const slotTransform =
            offset === 0
              ? "translate3d(0, 0, 0) scale(1)"
              : `translate3d(${offset * 88}%, 14px, 0) scale(0.86)`;

          const slotOpacity = offset === 0 ? 1 : 0.78;
          const slotZIndex = offset === 0 ? 30 : 20;

          return (
            <article
              key={trek.id}
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
                  aria-label={`Focus ${trek.name}`}
                  className="absolute inset-0 z-20 cursor-pointer rounded-[26px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f05e25]"
                />
              )}

              <div>
                {/* Top Rounded Photo Panel */}
                <div className="relative h-[235px] sm:h-[285px] lg:h-[315px] w-full overflow-hidden rounded-[20px] bg-stone-900">
                  <Image
                    src={trek.image}
                    alt={trek.name}
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
                      From ${trek.priceFrom.toLocaleString("en-US")}
                    </span>
                  </div>

                  {/* Top-right dynamic status badge */}
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0f3426]/85 backdrop-blur-sm border border-emerald-400/25 px-3 py-1 text-[11px] font-medium text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{trek.statusBadge}</span>
                    </span>
                  </div>

                  {/* Lower-left overlay region & title */}
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85 truncate">
                      {trek.region}
                    </p>
                    <h3 className="font-heading font-bold text-xl sm:text-[22px] text-white leading-snug tracking-wide drop-shadow-sm line-clamp-2 mt-0.5">
                      {trek.name}
                    </h3>
                  </div>
                </div>

                {/* Middle Body */}
                <div className="px-2 sm:px-3 pt-4 pb-3 space-y-3.5">
                  <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed line-clamp-2 min-h-[2.4rem]">
                    {trek.description}
                  </p>

                  {/* 3-Column Dynamic Spec Grid */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 border-t border-stone-100">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                        <Calendar className="w-3.5 h-3.5 text-[#f05e25] shrink-0" />
                        <span className="truncate">Duration</span>
                      </div>
                      <p className="mt-0.5 text-xs sm:text-[13px] font-semibold text-[#1c1917] tabular-nums truncate">
                        {trek.duration} Days
                      </p>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                        <Mountain className="w-3.5 h-3.5 text-[#f05e25] shrink-0" />
                        <span className="truncate">Altitude</span>
                      </div>
                      <p className="mt-0.5 text-xs sm:text-[13px] font-semibold text-[#1c1917] tabular-nums truncate">
                        {trek.highestPoint.toLocaleString("en-US")} m
                      </p>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                        <Gauge className="w-3.5 h-3.5 text-[#f05e25] shrink-0" />
                        <span className="truncate">Difficulty</span>
                      </div>
                      <p className="mt-0.5 text-xs sm:text-[13px] font-semibold text-[#1c1917] truncate">
                        {trek.difficulty}
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
                      href={`/route/${trek.slug}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full border border-stone-300 bg-white hover:border-[#f05e25] hover:text-[#f05e25] px-3 sm:px-4 py-2.5 text-xs font-semibold text-[#1c1917] transition-all"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#f05e25]" />
                    </Link>
                    <Link
                      href={`/route/${trek.slug}#pricing`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#f05e25] hover:bg-[#d94e18] px-3 sm:px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-sm shadow-[#f05e25]/30"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
        {treks.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2" role="tablist" aria-label="Select route card">
            {treks.map((trek, idx) => {
              const active = idx === safeActiveIndex;
              return (
                <button
                  key={trek.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Show ${trek.name}`}
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
            Route {safeActiveIndex + 1} of {treks.length}
          </p>
          <Link
            href="/treks"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#3f6e15] hover:text-[#f05e25] transition-colors"
          >
            <span>Explore all {treks.length} routes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
