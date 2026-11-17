"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { TREKS } from "@/data/treks";
import AnimatedElevationGraph from "./AnimatedElevationGraph";

export default function MirrorHighRoutes() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const touchStartX = useRef<number | null>(null);

  const total = TREKS.length;

  const nextRoute = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const prevRoute = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  // Swaps slightly faster: 3.0s interval
  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 3000);
    return () => clearInterval(timer);
  }, [isAutoPlay, total]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 40) prevRoute();
    if (deltaX < -40) nextRoute();
    touchStartX.current = null;
  };

  return (
    <section className="relative w-full pt-8 pb-12 lg:pt-10 lg:pb-16 bg-gradient-to-b from-[#003840] via-[#00515b] to-[#003840] text-white overflow-hidden border-b border-[#006b78]/40 shadow-inner">
      {/* Top Visual Connector Bridge from Topographic Survey Profile */}
      <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-[#f8fafb]/15 to-transparent pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-margin flex flex-col items-start mb-2 z-10">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[#89d6e2]/80 mb-2">
          <span className="h-5 w-px bg-gradient-to-b from-[#f8fafb] to-[#89d6e2] inline-block" />
          <span>CONNECTED ROUTE TRANSECT · SECTOR ARCHIVE</span>
        </div>
      </div>

      {/* Background Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[420px] bg-[radial-gradient(ellipse_at_center,rgba(137,214,226,0.16),transparent_70%)] pointer-events-none"></div>

      {/* Header & Controls */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-margin mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#89d6e2] font-mono text-[10px] uppercase tracking-widest mb-2 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c88a3e] animate-ping"></span>
            <span>SEASONAL FIELD LEDGER · 3D MIRROR DECK</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-light text-white tracking-tight drop-shadow-sm">
            Selected High Routes
          </h2>
          <p className="text-xs text-white/75 font-mono tracking-wider mt-0.5">
            Displaying {currentIndex + 1} of {total} Himalayan Expeditions · Pricing in Nepalese Rupees (Rs.)
          </p>
        </div>

        {/* Carousel & Autoplay Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isAutoPlay
                ? "bg-[#89d6e2]/20 border-[#89d6e2] text-[#89d6e2]"
                : "bg-white/10 border-white/20 text-white/60 hover:text-white"
            }`}
            title="Toggle Automatic Orbit"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAutoPlay ? "bg-[#89d6e2] animate-pulse" : "bg-white/40"
              }`}
            ></span>
            <span>{isAutoPlay ? "AUTO-SWAP ON" : "PAUSED"}</span>
          </button>

          <div className="flex gap-1.5">
            <button
              onClick={prevRoute}
              aria-label="Previous High Route"
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all shadow-md cursor-pointer border border-white/20 hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
            </button>
            <button
              onClick={nextRoute}
              aria-label="Next High Route"
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all shadow-md cursor-pointer border border-white/20 hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3D Mirror Screen Stage (Compact) */}
      <div
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-margin min-h-[430px] sm:min-h-[450px] flex items-center justify-center perspective-[1200px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full flex items-center justify-center py-2">
          {TREKS.map((trek, idx) => {
            let diff = idx - currentIndex;
            if (diff > total / 2) diff -= total;
            if (diff < -total / 2) diff += total;

            const isCenter = diff === 0;
            const isLeft = diff === -1 || (currentIndex === 0 && idx === total - 1);
            const isRight = diff === 1 || (currentIndex === total - 1 && idx === 0);
            const isVisible = Math.abs(diff) <= 2;

            if (!isVisible) return null;

            const translateX = diff * 280;
            const translateZ = isCenter ? 50 : -120;
            const rotateY = diff * -16;
            const scale = isCenter ? 1.0 : 0.84;
            const opacity = isCenter ? 1 : Math.abs(diff) === 1 ? 0.68 : 0.28;
            const zIndex = 30 - Math.abs(diff) * 10;

            return (
              <div
                key={trek.id}
                onClick={() => {
                  if (isLeft) prevRoute();
                  if (isRight) nextRoute();
                }}
                className={`absolute w-[290px] sm:w-[360px] transition-all duration-500 ease-out cursor-pointer select-none ${
                  isCenter ? "cursor-default" : "hover:opacity-95"
                }`}
                style={{
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity,
                  zIndex,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Main Card with Compact Styling */}
                <article
                  className={`rounded-xl overflow-hidden backdrop-blur-xl transition-all duration-500 border ${
                    isCenter
                      ? "bg-[#0b242a]/95 border-[#89d6e2] shadow-[0_16px_40px_rgba(0,0,0,0.45)] ring-1 ring-[#89d6e2]/40"
                      : "bg-[#0b242a]/75 border-white/20 shadow-lg"
                  }`}
                >
                  {/* Photo Header */}
                  <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={trek.image}
                      alt={trek.name}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b242a] via-transparent to-black/30"></div>

                    {/* Status Badge */}
                    <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[#89d6e2] font-mono text-[9px] tracking-widest uppercase border border-white/20">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          trek.statusColor === "tertiary"
                            ? "bg-[#c88a3e]"
                            : "bg-[#89d6e2]"
                        }`}
                      ></span>
                      {trek.statusBadge}
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-white font-mono text-[10px] border border-white/10">
                      {trek.duration} Days · 100+ km
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 space-y-2.5 text-left">
                    <div className="flex items-center justify-between text-[11px] font-mono tracking-widest uppercase text-white/75">
                      <span>{trek.region}</span>
                      <span className="text-[#89d6e2] font-serif text-base font-normal">
                        {trek.highestPoint.toLocaleString()} m
                      </span>
                    </div>

                    <h3 className="font-serif text-lg sm:text-xl text-white font-normal line-clamp-1">
                      {trek.name}
                    </h3>

                    <p className="text-xs text-white/80 font-light leading-relaxed line-clamp-2">
                      {trek.description}
                    </p>

                    {/* Animated Topographic Elevation Path */}
                    <div className="pt-1.5 border-t border-white/15">
                      <AnimatedElevationGraph
                        svgPath={trek.elevationPoints.svgPath}
                        peakCoords={trek.elevationPoints.peakCoords}
                        startLabel={trek.elevationPoints.start}
                        midLabel={`Apex: ${trek.highestPointName}`}
                        peakLabel={trek.elevationPoints.peak}
                        strokeColor="#89d6e2"
                        fillColor="rgba(137, 214, 226, 0.25)"
                        height="h-8"
                      />
                    </div>

                    {/* Card Footer in Rupees */}
                    <div className="pt-2.5 flex items-center justify-between border-t border-white/15">
                      <div>
                        <span className="text-[9px] font-mono uppercase tracking-widest text-white/60 block">
                          Fixed Tariff
                        </span>
                        <span className="text-sm sm:text-base font-serif text-[#c88a3e] font-medium">
                          From Rs. {(trek.priceFrom * 100).toLocaleString()}
                        </span>
                      </div>

                      <Link
                        href={`/route/${trek.slug}`}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#89d6e2] hover:bg-white text-slate-950 text-[11px] font-mono font-semibold uppercase tracking-wider transition-colors shadow-md"
                      >
                        <span>Logbook</span>
                        <span className="material-symbols-outlined text-[13px]">
                          arrow_forward
                        </span>
                      </Link>
                    </div>
                  </div>
                </article>

                {/* Mirror Screen Reflection Effect Underneath */}
                {isCenter && (
                  <div
                    className="w-full h-12 rounded-xl overflow-hidden mt-1.5 pointer-events-none opacity-20 filter blur-[1px] scale-y-[-1] transition-opacity duration-500"
                    style={{
                      maskImage:
                        "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)",
                      WebkitMaskImage:
                        "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)",
                    }}
                  >
                    <div className="h-full w-full bg-gradient-to-t from-transparent via-[#89d6e2]/40 to-transparent"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Route Quick-Select Orbit Dock */}
      <div className="relative max-w-4xl mx-auto px-6 mt-4 z-10">
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {TREKS.map((t, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={t.id}
                onClick={() => setCurrentIndex(idx)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#89d6e2] text-slate-950 font-bold shadow-[0_0_12px_rgba(137,214,226,0.6)] scale-105"
                    : "bg-white/10 hover:bg-white/20 text-white/75 hover:text-white border border-white/20"
                }`}
              >
                <span>{idx + 1}. </span>
                <span className="hidden sm:inline">{t.name.split(" ")[0]}</span>
                <span className="sm:hidden">{t.highestPoint}m</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
