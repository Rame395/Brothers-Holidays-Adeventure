"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Compass, Eye, Mountain } from "lucide-react";

export default function SuspensionBridgeScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgImgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const bgImg = bgImgRef.current;
    const text = textRef.current;
    if (!section || !bgImg) return;

    let ticking = false;
    let isVisible = false;

    const onScroll = () => {
      if (!isVisible || ticking) return;

      window.requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const windowH = window.innerHeight;

        // Progress from 0 (section top enters bottom of screen) to 1 (section bottom leaves top of screen)
        const total = windowH + rect.height;
        const current = windowH - rect.top;
        const p = Math.min(1, Math.max(0, current / total));

        // 1. Kinetic Zoom + Vertical Parallax on the suspension bridge photograph
        const scale = 1.02 + p * 0.12; // zooms from 1.02 to 1.14
        const translateY = (p - 0.5) * 110; // smooth vertical parallax travel
        const translateX = (p - 0.5) * -28; // subtle horizontal pan tracking the bridge span
        bgImg.style.transform = `translate3d(${translateX.toFixed(1)}px, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;

        // 2. Foreground editorial parallax (scrolls slightly faster for 3D depth)
        if (text) {
          const textShift = (p - 0.5) * -45;
          text.style.transform = `translate3d(0, ${textShift.toFixed(1)}px, 0)`;
        }

        // 3. Update telemetry progress line
        if (progressLineRef.current) {
          progressLineRef.current.style.transform = `scaleX(${p.toFixed(3)})`;
        }

        setScrollPct(Math.round(p * 100));
        ticking = false;
      });

      ticking = true;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? false;
        if (isVisible) {
          onScroll();
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(section);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="the-crossing"
      className="relative w-full overflow-hidden bg-[#071118] text-white h-[85vh] min-h-[580px] max-h-[820px] flex items-center justify-center content-auto select-none"
    >
      {/* ────────── BACKGROUND PARALLAX & ZOOM IMAGE LAYER ────────── */}
      <div
        ref={bgImgRef}
        aria-hidden="true"
        className="absolute -top-[20%] left-[-5%] w-[110%] h-[140%] z-0 pointer-events-none will-change-transform"
      >
        <Image
          src="/images/suspension-bridge-2k.jpg"
          alt="Himalayan Suspension Bridge Crossing over Dudh Koshi Gorge with Trekkers"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority={false}
        />

        {/* Soft atmospheric tonal overlay for text readability without washing out gorge drama */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#071118]/85 via-[#071118]/35 to-[#071118]/80" />
        <div className="absolute inset-0 bg-radial-[ellipse_at_center] from-transparent via-[#071118]/25 to-[#071118]/70" />
      </div>

      {/* ────────── SEAMLESS TOP & BOTTOM SECTION MASKS ────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 inset-x-0 h-24 sm:h-32 z-10"
        style={{
          background:
            "linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,0.7) 35%, transparent 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 inset-x-0 h-28 sm:h-40 z-10"
        style={{
          background:
            "linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0.85) 35%, rgba(255,255,255,0.3) 70%, transparent 100%)",
        }}
      />

      {/* ────────── FOREGROUND CONTENT (PARALLAX ELEVATION) ────────── */}
      <div
        ref={textRef}
        className="relative z-20 max-w-5xl mx-auto px-6 text-center space-y-5 will-change-transform"
      >
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/20 bg-black/40 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7dd3fc] shadow-lg">
          <Compass className="w-3.5 h-3.5 text-[#f05e25]" />
          <span>27°46′N · 86°43′E · Dudh Koshi Gorge</span>
        </div>

        {/* Cinematic Headline */}
        <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-bold tracking-tight leading-[1.1] drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)] max-w-4xl mx-auto">
          “Where the valley falls away, and the true trail begins.”
        </h2>

        {/* Narrative Description */}
        <p className="font-sans text-xs sm:text-base text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
          Suspended 80 meters above the roaring glacial river, crossing the iconic
          Himalayan suspension bridge is the unforgettable threshold where every great
          expedition into the high peaks starts.
        </p>

        {/* Telemetry Stats Strip */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-white/95">
          <div className="px-4 py-2 rounded-xl bg-black/45 border border-white/15 shadow-md flex items-center gap-2.5 text-xs sm:text-sm">
            <Mountain className="w-4 h-4 text-[#f05e25]" />
            <span className="font-bold text-white">2,840 m</span>
            <span className="text-white/60 text-[11px]">Bridge Elevation</span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-black/45 border border-white/15 shadow-md flex items-center gap-2.5 text-xs sm:text-sm">
            <span className="w-2 h-2 rounded-full bg-[#7dd3fc]" />
            <span className="font-bold text-white">140 m</span>
            <span className="text-white/60 text-[11px]">Canyon Span</span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-black/45 border border-white/15 shadow-md flex items-center gap-2.5 text-xs sm:text-sm">
            <Eye className="w-4 h-4 text-[#f05e25]" />
            <span className="font-bold text-white">80 m</span>
            <span className="text-white/60 text-[11px]">River Drop</span>
          </div>
        </div>

        {/* Animated Walk Progress Telemetry Bar */}
        <div className="pt-2 max-w-xs mx-auto">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-white/70 mb-1.5 tabular-nums">
            <span>Trail Crossing</span>
            <span>{scrollPct}% traversed</span>
          </div>
          <div className="relative h-1 w-full bg-white/20 rounded-full overflow-hidden">
            <div
              ref={progressLineRef}
              className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-[#f05e25] to-[#7dd3fc] origin-left rounded-full will-change-transform"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
