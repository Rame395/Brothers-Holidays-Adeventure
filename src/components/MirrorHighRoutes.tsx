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
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import type { TrekRouteDTO } from "@/lib/types";
import AnimatedElevationGraph from "./AnimatedElevationGraph";

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
  const [autoPlay, setAutoPlay] = useState<boolean>(true);
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

  const effectiveAutoPlay = autoPlay && !reducedMotion;

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
    if (!effectiveAutoPlay || isPausedByUser || !isVisible || treks.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % treks.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [effectiveAutoPlay, isPausedByUser, isVisible, treks.length]);

  if (treks.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 lg:py-28 bg-[#edf2f7] text-[#1c1917] overflow-hidden content-auto"
    >
      {/* Soft top & bottom white mist transition fades */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-px inset-x-0 h-16 z-10"
        style={{
          background:
            "linear-gradient(to bottom, #ffffff 0%, rgba(237,242,247,0) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-px inset-x-0 h-16 z-10"
        style={{
          background:
            "linear-gradient(to top, #ffffff 0%, rgba(237,242,247,0) 100%)",
        }}
      />

      {/* Centered Editorial Header */}
      <div className="relative z-20 max-w-2xl mx-auto px-6 text-center mb-10 lg:mb-12 space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#104b87]">
          Regional Trail Guide
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#1c1917] tracking-wide uppercase leading-tight">
          Selected High Routes
        </h2>
        <p className="text-sm sm:text-[15px] text-[#57534d] leading-relaxed">
          Handpicked high-altitude traverses across Nepal with proven acclimatization
          schedules and transparent NPR tariffs.
        </p>
      </div>

      {/* Smooth 3-Slot Daylight Coverflow Stage */}
      <div
        role="region"
        aria-label="High altitude trekking route spotlight"
        tabIndex={0}
        onMouseEnter={() => setIsPausedByUser(true)}
        onMouseLeave={() => setIsPausedByUser(false)}
        onFocusCapture={() => setIsPausedByUser(true)}
        onBlurCapture={() => setIsPausedByUser(false)}
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
        className="relative mx-auto w-full h-[560px] sm:h-[600px] lg:h-[630px] flex items-center justify-center select-none focus:outline-none"
      >
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
          const visibilityClass =
            absOffset === 0 ? "flex" : "hidden sm:flex";

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
              className={`group absolute w-[330px] sm:w-[430px] lg:w-[470px] rounded-3xl overflow-hidden flex-col justify-between transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${visibilityClass} ${
                isCenter
                  ? "bg-white border border-slate-200/90 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.18)]"
                  : "bg-[#f8fafc] border border-slate-200/80 shadow-md hover:border-slate-300"
              }`}
            >
              {!isCenter && (
                <button
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Focus ${trek.name}`}
                  className="absolute inset-0 z-20 cursor-pointer rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#104b87]"
                />
              )}

              <div>
                {/* Top Card Photography */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                  <Image
                    src={trek.image}
                    alt={trek.name}
                    fill
                    sizes="(max-width: 640px) 330px, (max-width: 1024px) 430px, 470px"
                    className={`object-cover transition-transform duration-700 ${
                      isCenter ? "group-hover:scale-105" : ""
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                  <div className="absolute top-3.5 left-3.5">
                    <span className="inline-block rounded-full bg-white/95 border border-white/60 shadow-xs px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#104b87]">
                      {trek.statusBadge}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3.5">
                    <span className="inline-block rounded-full bg-black/75 border border-white/15 px-3 py-1 text-[11px] text-white/95 tabular-nums">
                      {trek.duration} Days · {trek.highestPoint.toLocaleString("en-US")} m
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-semibold uppercase tracking-[0.16em] text-[#104b87] truncate">
                      {trek.region}
                    </span>
                    <span className="text-slate-500 shrink-0">{trek.difficulty}</span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-[22px] text-[#1c1917] font-semibold tracking-wide leading-snug line-clamp-1">
                    {trek.name}
                  </h3>

                  <p className="text-xs sm:text-[13px] text-[#57534d] leading-relaxed line-clamp-2 min-h-[2.4rem]">
                    {trek.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100">
                    <AnimatedElevationGraph
                      svgPath={trek.elevationPoints.svgPath}
                      peakCoords={trek.elevationPoints.peakCoords}
                      startLabel={trek.elevationPoints.start}
                      peakLabel={trek.elevationPoints.peak}
                      strokeColor="#104b87"
                      fillColor="rgba(16, 75, 135, 0.12)"
                      peakStrokeColor="#ffffff"
                      labelClassName="text-slate-500"
                      height="h-8"
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-4 border-t border-slate-100 bg-[#f8fafc] flex items-center justify-between tabular-nums">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-slate-500">
                    From / person
                  </span>
                  <span className="font-serif text-lg font-medium text-[#1c1917]">
                    NPR {(trek.priceFrom * 100).toLocaleString("en-US")}
                  </span>
                </div>

                {isCenter ? (
                  <Link
                    href={`/route/${trek.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#104b87] hover:bg-[#0a355f] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs"
                  >
                    <span>Logbook</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/80 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <span>Logbook</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Symmetrical Controls & Balanced Directory Strip */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-10 mt-8">
        {treks.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous route"
              className="w-9 h-9 rounded-full bg-white border border-slate-200/90 shadow-xs hover:border-[#104b87] hover:text-[#104b87] flex items-center justify-center text-[#1c1917] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2" role="tablist" aria-label="Select route card">
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
                        ? "w-6 bg-[#104b87]"
                        : "w-1.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next route"
              className="w-9 h-9 rounded-full bg-white border border-slate-200/90 shadow-xs hover:border-[#104b87] hover:text-[#104b87] flex items-center justify-center text-[#1c1917] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setAutoPlay((v) => !v)}
              aria-pressed={effectiveAutoPlay}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-white border border-slate-200/90 shadow-xs hover:border-[#104b87]/40 px-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1c1917] transition-colors cursor-pointer"
            >
              {effectiveAutoPlay ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#104b87]" />
                  <Pause className="w-3.5 h-3.5 text-[#104b87]" />
                  <span>Auto-Play</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[#57534d]">Paused</span>
                </>
              )}
            </button>
          </div>
        )}

        <div className="mt-8 pt-5 border-t border-slate-300/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 tabular-nums">
            Route {safeActiveIndex + 1} of {treks.length}
          </p>
          <Link
            href="/treks"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#104b87] hover:text-[#f05e25] transition-colors"
          >
            <span>Explore all {treks.length} routes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
