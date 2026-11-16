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
    <section className="relative w-full py-20 lg:py-28 bg-gradient-to-b from-[#003840] via-[#00515b] to-[#003840] text-white overflow-hidden border-y border-[#006b78]/40 shadow-inner">
      {/* Background Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(137,214,226,0.18),transparent_70%)] pointer-events-none"></div>

      {/* Header & Controls */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-margin mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 z-10">
        <div>
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#89d6e2] font-mono text-xs uppercase tracking-widest mb-3 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#c88a3e] animate-ping"></span>
            <span>SEASONAL FIELD LEDGER · 3D MIRROR DECK</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-light text-white tracking-tight drop-shadow-sm">
            Selected High Routes
          </h2>
          <p className="text-xs sm:text-sm text-white/75 font-mono tracking-wider mt-1">
            Displaying {currentIndex + 1} of {total} Himalayan Expeditions · Pricing in Nepalese Rupees (Rs.)
          </p>
        </div>

        {/* Carousel & Autoplay Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-widest border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
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

          <div className="flex gap-2">
            <button
              onClick={prevRoute}
              aria-label="Previous High Route"
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all shadow-md cursor-pointer border border-white/20 hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">
                arrow_back
              </span>
            </button>
            <button
              onClick={nextRoute}
              aria-label="Next High Route"
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all shadow-md cursor-pointer border border-white/20 hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3D Mirror Screen Stage */}
      <div
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-margin min-h-[580px] flex items-center justify-center perspective-[1200px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full flex items-center justify-center py-6">
          {TREKS.map((trek, idx) => {
            let diff = idx - currentIndex;
            if (diff > total / 2) diff -= total;
            if (diff < -total / 2) diff += total;

            const isCenter = diff === 0;
            const isLeft = diff === -1 || (currentIndex === 0 && idx === total - 1);
            const isRight = diff === 1 || (currentIndex === total - 1 && idx === 0);
            const isVisible = Math.abs(diff) <= 2;

            if (!isVisible) return null;

            const translateX = diff * 320;
            const translateZ = isCenter ? 60 : -140;
            const rotateY = diff * -18;
            const scale = isCenter ? 1.03 : 0.85;
            const opacity = isCenter ? 1 : Math.abs(diff) === 1 ? 0.7 : 0.3;
            const zIndex = 30 - Math.abs(diff) * 10;

            return (
              <div
                key={trek.id}
                onClick={() => {
                  if (isLeft) prevRoute();
                  if (isRight) nextRoute();
                }}
                className={`absolute w-[320px] sm:w-[420px] transition-all duration-500 ease-out cursor-pointer select-none ${
                  isCenter ? "cursor-default" : "hover:opacity-95"
                }`}
                style={{
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity,
                  zIndex,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Main Card with Rich Professional Styling */}
                <article
                  className={`rounded-2xl overflow-hidden backdrop-blur-xl transition-all duration-500 border ${
                    isCenter
                      ? "bg-[#0b242a]/95 border-[#89d6e2] shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-2 ring-[#89d6e2]/40"
                      : "bg-[#0b242a]/75 border-white/20 shadow-xl"
                  }`}
                >
                  {/* Photo Header */}
                  <div className="relative h-56 w-full overflow-hidden bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={trek.image}
                      alt={trek.name}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b242a] via-transparent to-black/30"></div>

                    {/* Status Badge */}
                    <div className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#89d6e2] font-mono text-[10px] tracking-widest uppercase border border-white/20">
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
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white font-mono text-[11px] border border-white/10">
                      {trek.duration} Days · 100+ km
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-4 text-left">
                    <div className="flex items-center justify-between text-xs font-mono tracking-widest uppercase text-white/75">
                      <span>{trek.region}</span>
                      <span className="text-[#89d6e2] font-serif text-lg font-normal">
                        {trek.highestPoint.toLocaleString()} m
                      </span>
                    </div>

                    <h3 className="font-serif text-xl sm:text-2xl text-white font-normal line-clamp-1">
                      {trek.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed line-clamp-2">
                      {trek.description}
                    </p>

                    {/* Animated Topographic Elevation Path */}
                    <div className="pt-2 border-t border-white/15">
                      <AnimatedElevationGraph
                        svgPath={trek.elevationPoints.svgPath}
                        peakCoords={trek.elevationPoints.peakCoords}
                        startLabel={trek.elevationPoints.start}
                        midLabel={`Apex: ${trek.highestPointName}`}
                        peakLabel={trek.elevationPoints.peak}
                        strokeColor="#89d6e2"
                        fillColor="rgba(137, 214, 226, 0.25)"
                      />
                    </div>

                    {/* Card Footer in Rupees */}
                    <div className="pt-3 flex items-center justify-between border-t border-white/15">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-white/60 block">
                          Fixed Tariff
                        </span>
                        <span className="text-base sm:text-lg font-serif text-[#c88a3e] font-medium">
                          From Rs. {(trek.priceFrom * 100).toLocaleString()}
                        </span>
                      </div>

                      <Link
                        href={`/route/${trek.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#89d6e2] hover:bg-white text-slate-950 text-xs font-mono font-semibold uppercase tracking-wider transition-colors shadow-md"
                      >
                        <span>Logbook</span>
                        <span className="material-symbols-outlined text-[14px]">
                          arrow_forward
                        </span>
                      </Link>
                    </div>
                  </div>
                </article>

                {/* Mirror Screen Reflection Effect Underneath */}
                {isCenter && (
                  <div
                    className="w-full h-28 rounded-2xl overflow-hidden mt-2 pointer-events-none opacity-25 filter blur-[1px] scale-y-[-1] transition-opacity duration-500"
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
      <div className="relative max-w-4xl mx-auto px-6 mt-12 z-10">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {TREKS.map((t, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={t.id}
                onClick={() => setCurrentIndex(idx)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-mono tracking-wider transition-all cursor-pointer ${
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
