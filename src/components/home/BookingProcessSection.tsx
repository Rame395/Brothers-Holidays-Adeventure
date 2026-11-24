"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Compass,
  FileText,
  Footprints,
  Headphones,
  Lock,
  Mountain,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface BookingStep {
  step: string;
  waypoint: string;
  altitude: string;
  title: string;
  description: string;
  badge: string;
  icon: typeof Compass;
  triggerPct: number;
}

const BOOKING_STEPS: BookingStep[] = [
  {
    step: "01",
    waypoint: "Stage 01 • Route Scouting",
    altitude: "1,350m",
    title: "Select Your Himalayan Route",
    description:
      "Explore our signature trekking circuits, high-altitude alpine passes, and wilderness expeditions. Whether you target iconic high passes or serene foothill trails, find the journey tailored to your endurance and ambition.",
    badge: "Signature Circuits & Custom Departures",
    icon: Compass,
    triggerPct: 0.12,
  },
  {
    step: "02",
    waypoint: "Stage 02 • Itinerary Fine-Tuning",
    altitude: "2,860m",
    title: "Tailor With Our Kathmandu Sherpas",
    description:
      "Collaborate directly with our Thamel expedition leaders. We customize your acclimatization pacing, adapt daily hiking profiles, and answer all equipment questions with genuine on-the-ground expertise.",
    badge: "1-on-1 Guide Advice • Transparent Pricing",
    icon: FileText,
    triggerPct: 0.38,
  },
  {
    step: "03",
    waypoint: "Stage 03 • Logistics & Permitting",
    altitude: "4,200m",
    title: "Lock Flights, Permits & Guide Team",
    description:
      "Secure your departure dates with an upfront 20% flexible deposit. We promptly book your domestic STOL flights (Lukla or Pokhara), issue national park permits, and dedicate your certified lead mountain guide.",
    badge: "Free Rescheduling • 100% Protected Deposit",
    icon: CalendarCheck,
    triggerPct: 0.62,
  },
  {
    step: "04",
    waypoint: "Stage 04 • High Ascent Begins",
    altitude: "5,364m",
    title: "Airport Welcome & Trailhead Launch",
    description:
      "Touch down in Nepal to a private airport greeting, transfer to Thamel, in-person gear audit, and medical oxygen briefing before flying into the mountains to begin your unforgettable trek.",
    badge: "Airport Pickups • Full Expedition Support",
    icon: Footprints,
    triggerPct: 0.84,
  },
];

export default function BookingProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [beaconPos, setBeaconPos] = useState({ x: 460, y: 110 });
  const [pathTotalLen, setPathTotalLen] = useState(860);

  useEffect(() => {
    const section = sectionRef.current;
    const path = pathRef.current;
    if (!section) return;

    if (path) {
      try {
        const len = path.getTotalLength();
        if (len > 0) {
          setPathTotalLen(len);
          path.style.strokeDasharray = `${len}`;
          path.style.strokeDashoffset = `${len}`;
        }
      } catch {}
    }

    let ticking = false;
    let isVisible = false;

    const onScroll = () => {
      if (!isVisible || ticking) return;

      window.requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const windowH = window.innerHeight;

        // Start animation when section is in upper-mid viewport
        const startOffset = windowH * 0.75;
        const endOffset = windowH * 0.2;
        const totalDistance = rect.height + startOffset - endOffset;
        const currentDistance = startOffset - rect.top;
        const rawProgress = currentDistance / totalDistance;
        const p = Math.max(0, Math.min(1, rawProgress));

        setScrollProgress(p);

        // 1. Animate SVG Trail Draw along the mountain path
        if (path) {
          const total = pathTotalLen || 860;
          const offset = total * (1 - p);
          path.style.strokeDashoffset = `${offset.toFixed(1)}`;

          // 3. Move illuminated trekker beacon along the drawn curve
          try {
            const currentLen = total * p;
            const pt = path.getPointAtLength(currentLen);
            setBeaconPos({ x: pt.x, y: pt.y });
          } catch {}
        }

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
  }, [pathTotalLen]);

  // Current active altitude & stage based on scroll progress
  const activeStage =
    scrollProgress < 0.25
      ? {
          title: "Route Scouting",
          alt: "1,350m",
          step: "01",
        }
      : scrollProgress < 0.5
      ? {
          title: "Itinerary Fine-Tuning",
          alt: "2,860m",
          step: "02",
        }
      : scrollProgress < 0.75
      ? {
          title: "Logistics & Permitting",
          alt: "4,200m",
          step: "03",
        }
      : {
          title: "High Ascent Begins",
          alt: "5,364m",
          step: "04",
        };

  return (
    <section
      ref={sectionRef}
      id="booking-process"
      className="w-full relative py-20 sm:py-28 lg:py-36 bg-[#f8fafc] text-[#1c1917] border-t border-stone-200/90 overflow-hidden content-auto"
    >
      {/* Subtle topographic contour pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(#1c1917 1px, transparent 1px), radial-gradient(#f05e25 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          backgroundPosition: "0 0, 18px 18px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 space-y-16 sm:space-y-20">
        {/* SECTION HEADER WITH REAL-TIME EXPEDITION TELEMETRY */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center justify-center gap-2.5 mb-1 px-4 py-1.5 rounded-full bg-white/90 border border-stone-200/90 shadow-2xs backdrop-blur-md">
            <span className="w-6 h-[2px] bg-[#f05e25]" />
            <span className="text-[11px] font-bold tracking-[0.24em] text-[#1c1917] uppercase">
              How Expedition Planning Works
            </span>
            <span className="w-6 h-[2px] bg-[#f05e25]" />
          </div>

          <h2 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1c1917] uppercase tracking-tight leading-tight drop-shadow-xs">
            Your Path From Dream To Trailhead
          </h2>

          <p className="font-sans text-[#1c1917]/85 font-medium text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            From your initial route inquiry to stepping onto the high ridges of
            Nepal, our in-house Sherpa team coordinates every flight, permit,
            and safety measure with total transparency.
          </p>

          {/* DYNAMIC SCROLL TELEMETRY PILL */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/95 border border-stone-200 shadow-xs backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-xs font-heading font-bold uppercase tracking-wider text-[#f05e25]">
                <Mountain className="w-3.5 h-3.5" />
                <span>Ascent Progress:</span>
              </div>
              <div className="w-24 sm:w-32 h-1.5 rounded-full bg-stone-200 overflow-hidden">
                <div
                  className="h-full bg-[#f05e25] rounded-full transition-all duration-100 ease-out"
                  style={{ width: `${Math.round(scrollProgress * 100)}%` }}
                />
              </div>
              <div className="flex items-center gap-1 text-xs font-sans font-bold text-[#1c1917] tabular-nums">
                <span>{activeStage.alt}</span>
                <span className="text-stone-400 font-normal">
                  ({Math.round(scrollProgress * 100)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* STAGGERED MOUNTAIN TRAIL PROCESS WITH REAL-TIME SCROLL DRAW */}
        <div className="relative max-w-6xl mx-auto">
          {/* DESKTOP WINDING TRAIL SVG PATH (Scroll-animated) */}
          <svg
            aria-hidden="true"
            className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 1000 820"
            fill="none"
            preserveAspectRatio="none"
          >
            {/* Guide trail path (Muted alpine switchback) */}
            <path
              d="M 460 110 C 580 130, 470 270, 540 280 C 620 310, 380 470, 460 500 C 540 530, 460 670, 540 680"
              stroke="#e2e8f0"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Inactive trail dashed markers */}
            <path
              d="M 460 110 C 580 130, 470 270, 540 280 C 620 310, 380 470, 460 500 C 540 530, 460 670, 540 680"
              stroke="#cbd5e1"
              strokeWidth="2.5"
              strokeDasharray="6 8"
              strokeLinecap="round"
            />

            {/* DYNAMIC SCROLL-DRAWN TRAIL PATH (Draws in real-time as you scroll) */}
            <path
              ref={pathRef}
              d="M 460 110 C 580 130, 470 270, 540 280 C 620 310, 380 470, 460 500 C 540 530, 460 670, 540 680"
              stroke="#f05e25"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-75 ease-out"
            />

            {/* Static Waypoint Nodes */}
            <circle
              cx="460"
              cy="110"
              r="6"
              fill={scrollProgress >= 0.12 ? "#f05e25" : "#cbd5e1"}
              className="transition-colors duration-300"
            />
            <circle
              cx="540"
              cy="280"
              r="6"
              fill={scrollProgress >= 0.38 ? "#f05e25" : "#cbd5e1"}
              className="transition-colors duration-300"
            />
            <circle
              cx="460"
              cy="500"
              r="6"
              fill={scrollProgress >= 0.62 ? "#f05e25" : "#cbd5e1"}
              className="transition-colors duration-300"
            />
            <circle
              cx="540"
              cy="680"
              r="6"
              fill={scrollProgress >= 0.84 ? "#f05e25" : "#cbd5e1"}
              className="transition-colors duration-300"
            />

            {/* ILLUMINATED MOVING TREKKER BEACON */}
            {scrollProgress > 0.02 && scrollProgress < 0.98 && (
              <g
                transform={`translate(${beaconPos.x}, ${beaconPos.y})`}
                className="transition-transform duration-75 ease-out"
              >
                <circle r="12" fill="#f05e25" fillOpacity="0.25">
                  <animate
                    attributeName="r"
                    values="10;18;10"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.5;0.1;0.5"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="5.5" fill="#f05e25" stroke="#ffffff" strokeWidth="2" />
              </g>
            )}
          </svg>

          {/* MOBILE CONTINUOUS TRAIL LINE WITH SCROLL FILL */}
          <div
            aria-hidden="true"
            className="lg:hidden absolute left-6 sm:left-8 top-8 bottom-8 w-[2px] bg-stone-200 z-0"
          >
            <div
              className="w-full bg-[#f05e25] transition-all duration-100 ease-out"
              style={{ height: `${Math.round(scrollProgress * 100)}%` }}
            />
          </div>

          {/* 4 STAGGERED STEP CARDS (With Progressive Scroll Activation) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-x-20 lg:gap-y-12 relative z-10">
            {BOOKING_STEPS.map((item, index) => {
              const Icon = item.icon;
              const isEven = index % 2 === 1;
              const isPassed = scrollProgress >= item.triggerPct;

              return (
                <div
                  key={item.step}
                  className={`relative group ${
                    isEven ? "lg:translate-y-14" : ""
                  }`}
                >
                  {/* Card Container */}
                  <div
                    className={`relative rounded-2xl bg-white/95 backdrop-blur-md p-6 sm:p-8 border transition-all duration-300 flex flex-col justify-between h-full pl-14 sm:pl-16 lg:pl-8 ${
                      isPassed
                        ? "border-[#f05e25]/50 shadow-[0_12px_32px_rgba(240,94,37,0.12)] -translate-y-1"
                        : "border-stone-200/90 shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-stone-300"
                    }`}
                  >
                    {/* Mobile waypoint marker */}
                    <div
                      className={`lg:hidden absolute -left-6 sm:-left-8 top-7 w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm ring-4 ring-[#f8fafc] transition-all duration-300 ${
                        isPassed
                          ? "bg-[#f05e25] text-white scale-110"
                          : "bg-stone-300 text-stone-700"
                      }`}
                    >
                      {index + 1}
                    </div>

                    <div>
                      {/* Top Bar: Icon, Altitude waypoint & Large Step Number */}
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-xs shrink-0 ${
                              isPassed
                                ? "bg-[#f05e25] text-white shadow-md shadow-[#f05e25]/25 scale-105"
                                : "bg-stone-100 text-[#1c1917] group-hover:bg-[#f05e25] group-hover:text-white"
                            }`}
                          >
                            <Icon className="w-5 h-5 stroke-[2] transition-transform duration-300 group-hover:scale-110" />
                          </div>
                          <div>
                            <span
                              className={`block text-[11px] font-bold tracking-widest uppercase transition-colors duration-300 ${
                                isPassed ? "text-[#f05e25]" : "text-stone-400"
                              }`}
                            >
                              {item.altitude}
                            </span>
                            <span className="block text-xs font-semibold text-[#1c1917]">
                              {item.waypoint}
                            </span>
                          </div>
                        </div>

                        {/* Large prominent step number (top-right like reference) */}
                        <span
                          className={`font-heading font-black text-4xl sm:text-5xl transition-colors duration-300 tabular-nums select-none leading-none ${
                            isPassed
                              ? "text-[#f05e25]/40 scale-105"
                              : "text-stone-200 group-hover:text-[#f05e25]/30"
                          }`}
                        >
                          {item.step}
                        </span>
                      </div>

                      {/* Title: Deep Charcoal / Black - strictly no blue */}
                      <h3
                        className={`font-heading font-bold text-xl sm:text-2xl transition-colors uppercase tracking-tight ${
                          isPassed ? "text-[#1c1917]" : "text-[#1c1917]"
                        }`}
                      >
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p className="font-sans text-sm sm:text-base text-[#57534d] leading-relaxed mt-2.5">
                        {item.description}
                      </p>
                    </div>

                    {/* Bottom Feature Badge */}
                    <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1c1917] tracking-wide">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isPassed ? "text-[#f05e25]" : "text-stone-400"
                          }`}
                        />
                        <span>{item.badge}</span>
                      </span>

                      <span
                        className={`h-[2px] transition-all duration-300 rounded-full ${
                          isPassed
                            ? "w-10 bg-[#f05e25]"
                            : "w-5 bg-stone-200 group-hover:bg-[#f05e25] group-hover:w-8"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TRUST BANNER & DIRECT JUMP TO ENQUIRY FORM BELOW */}
        <div className="relative rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200/90 p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Trust points */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full lg:w-auto">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold text-[#1c1917]">
                Licensed TAAN &amp; NMA
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <CalendarCheck className="w-5 h-5 text-[#f05e25] shrink-0" />
              <span className="text-xs font-semibold text-[#1c1917]">
                Free Date Rescheduling
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-[#f05e25] shrink-0" />
              <span className="text-xs font-semibold text-[#1c1917]">
                100% Protected Deposit
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <Headphones className="w-5 h-5 text-[#1c1917] shrink-0" />
              <span className="text-xs font-semibold text-[#1c1917]">
                24/7 Kathmandu Desk
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
            <Link
              href="/contact"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#f05e25] hover:bg-[#ff7a45] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Planning Your Trek</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/destinations"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-stone-300 hover:border-[#1c1917] text-[#1c1917] hover:bg-stone-50 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <span>Explore All Routes</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
