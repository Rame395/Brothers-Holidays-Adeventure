"use client";

import Image from "next/image";
import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

interface Waypoint {
  id: string;
  name: string;
  alt: number;
  x: number;
  y: number;
  color: string;
  progressAt: number;
}

const WAYPOINTS: Waypoint[] = [
  { id: "lukla", name: "LUKLA", alt: 2860, x: 50, y: 133, color: "#104b87", progressAt: 0.0 },
  { id: "mid-1", name: "WAYPOINT", alt: 3120, x: 175, y: 116.7, color: "#104b87", progressAt: 0.14 },
  { id: "namche", name: "NAMCHE", alt: 3440, x: 290, y: 97.1, color: "#1c1917", progressAt: 0.28 },
  { id: "chola", name: "CHO LA PASS", alt: 5420, x: 490, y: 71, color: "#f05e25", progressAt: 0.49 },
  { id: "gokyo", name: "GOKYO RI", alt: 5357, x: 665, y: 64.4, color: "#104b87", progressAt: 0.68 },
  { id: "kalapatthar", name: "KALA PATTHAR", alt: 5644, x: 865, y: 61.2, color: "#f05e25", progressAt: 0.88 },
];

const PATH_D =
  "M 50 133 C 130 126.5, 210 113.4, 290 97.1 C 380 82.7, 440 72.3, 490 71 C 535 69.7, 565 90.5, 595 108.8 C 630 128.4, 665 90.5, 715 22 C 735 8.9, 755 31.8, 775 87.3 C 792 133, 805 148, 818 142.8 C 832 136.2, 852 90.5, 875 48.1 C 885 28.5, 895 20, 910 22 C 925 24, 942 57.9, 960 93.8";

export default function TopographicSurveyProfile({ active }: { active?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const clipRectRef = useRef<SVGRectElement>(null);
  const tracerRef = useRef<SVGGElement>(null);
  const altTextRef = useRef<HTMLSpanElement>(null);
  const stageTextRef = useRef<HTMLSpanElement>(null);
  const waypointRefs = useRef<(SVGGElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const hasAnimatedRef = useRef(false);

  const applyFrameState = useCallback((easedP: number) => {
    if (pathRef.current) {
      pathRef.current.style.strokeDashoffset = String(1200 * (1 - easedP));
    }
    if (clipRectRef.current) {
      clipRectRef.current.setAttribute("width", String(1000 * easedP));
    }

    if (tracerRef.current && pathRef.current) {
      if (easedP > 0.01 && easedP < 0.995) {
        try {
          const totalLen = pathRef.current.getTotalLength();
          const pt = pathRef.current.getPointAtLength(totalLen * easedP);
          tracerRef.current.setAttribute("transform", `translate(${pt.x}, ${pt.y})`);
          tracerRef.current.setAttribute("opacity", "1");
        } catch {
          tracerRef.current.setAttribute("opacity", "0");
        }
      } else {
        tracerRef.current.setAttribute("opacity", "0");
      }
    }

    WAYPOINTS.forEach((wp, idx) => {
      const el = waypointRefs.current[idx];
      if (!el) return;
      el.setAttribute("opacity", easedP >= wp.progressAt ? "1" : "0.28");
    });

    if (altTextRef.current && stageTextRef.current) {
      if (easedP < 0.28) {
        const t = easedP / 0.28;
        altTextRef.current.textContent = `${Math.round(
          2860 + (3440 - 2860) * t
        ).toLocaleString("en-US")} m`;
        stageTextRef.current.textContent = "Lukla to Namche Bazaar";
      } else if (easedP < 0.49) {
        const t = (easedP - 0.28) / (0.49 - 0.28);
        altTextRef.current.textContent = `${Math.round(
          3440 + (5420 - 3440) * t
        ).toLocaleString("en-US")} m`;
        stageTextRef.current.textContent = "Approach to Cho La Pass";
      } else if (easedP < 0.68) {
        const t = (easedP - 0.49) / (0.68 - 0.49);
        const alt =
          t < 0.4
            ? 5420 - 680 * (t / 0.4)
            : 4740 + (5357 - 4740) * ((t - 0.4) / 0.6);
        altTextRef.current.textContent = `${Math.round(alt).toLocaleString("en-US")} m`;
        stageTextRef.current.textContent = "Gokyo Lakes & Gokyo Ri";
      } else if (easedP < 0.88) {
        const t = (easedP - 0.68) / (0.88 - 0.68);
        const alt =
          t < 0.45
            ? 5357 - 650 * (t / 0.45)
            : 4707 + (5644 - 4707) * ((t - 0.45) / 0.55);
        altTextRef.current.textContent = `${Math.round(alt).toLocaleString("en-US")} m`;
        stageTextRef.current.textContent = "Gorak Shep to Kala Patthar";
      } else {
        altTextRef.current.textContent = "5,644 m";
        stageTextRef.current.textContent = "Full Traverse Complete";
      }
    }
  }, []);

  const startAnimation = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      applyFrameState(1);
      return;
    }

    applyFrameState(0);
    let startTime: number | null = null;
    const duration = 2000;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const rawP = Math.min(1, elapsed / duration);
      const easedP = 1 - Math.pow(1 - rawP, 2.4);

      applyFrameState(easedP);

      if (rawP < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = 0;
      }
    };

    rafRef.current = requestAnimationFrame(step);
  }, [applyFrameState]);

  useEffect(() => {
    if (active && !hasAnimatedRef.current) {
      hasAnimatedRef.current = true;
      startAnimation();
    }
  }, [active, startAnimation]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          startAnimation();
        }
      },
      { threshold: 0.2 }
    );

    io.observe(el);
    return () => {
      io.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [startAnimation]);

  return (
    <div
      id="topographic-survey"
      ref={containerRef}
      className="w-full text-[#1c1917] flex flex-col justify-center"
    >
      {/* Top Header & Route Readout */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f05e25]">
            Khumbu High-Pass Route · Sagarmatha
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#1c1917] tracking-tight font-normal mt-1">
            Everest Base Camp &amp; Cho La Traverse
          </h2>
          <p className="text-xs sm:text-sm text-[#57534d] mt-1">
            Daily acclimatization profile from Lukla airstrip across Cho La Pass to Kala Patthar.
          </p>
        </div>

        {/* Clean Route Elevation Readout */}
        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-x-4 gap-y-2 bg-white px-3.5 sm:px-4 py-2.5 rounded-xl border border-slate-200 text-xs shadow-xs tabular-nums">
          <div>
            <span className="text-[#57534d] mr-1.5 font-medium">Stage:</span>
            <span ref={stageTextRef} className="font-semibold text-[#104b87]">
              Lukla to Namche Bazaar
            </span>
          </div>
          <div className="sm:pl-3 sm:border-l sm:border-slate-200">
            <span className="text-[#57534d] mr-1.5">Altitude:</span>
            <span ref={altTextRef} className="font-bold text-[#f05e25]">
              2,860 m
            </span>
          </div>
          <button
            type="button"
            onClick={startAnimation}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#104b87] hover:text-[#f05e25] cursor-pointer px-2 py-1 -mr-1 rounded-md hover:bg-[#f8fafc]"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Replay</span>
          </button>
        </div>
      </div>

      {/* Main Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5 items-stretch">
        {/* LEFT COLUMN: Grounded Expedition Camp Photo */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs group">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#071526]">
            <Image
              src="/images/home-camp.jpg"
              alt="High camp beneath Mount Everest and the Khumbu Icefall at dusk"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-medium">
              <span className="bg-[#071526]/85 text-white px-3 py-1 rounded-md border border-white/15 tabular-nums">
                Base Camp · 5,364 m
              </span>
              <span className="bg-[#f05e25] text-white px-2.5 py-0.5 rounded-md font-semibold text-[10px] uppercase tracking-wider">
                Khumbu
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-[#071526]/90 via-[#071526]/45 to-transparent text-white text-xs flex justify-between items-end gap-2">
              <div>
                <p className="text-white/70 text-[10px] uppercase tracking-wider">
                  Camp Location
                </p>
                <p className="font-medium text-white">Khumbu Glacier Moraine</p>
              </div>
              <div className="text-right text-white/80 font-mono text-[11px] tabular-nums shrink-0">
                27°59′N · 86°51′E
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#f8fafc] text-xs text-[#57534d] space-y-2.5 border-t border-slate-200">
            <p className="leading-relaxed">
              <strong className="text-[#1c1917] font-semibold">
                Acclimatization Plan:
              </strong>{" "}
              Two rest days built in at Namche Bazaar and Dingboche before
              crossing Cho La Pass (5,420 m) toward the Gokyo lakes valley.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px] text-[#57534d] tabular-nums">
              <div>
                Night low:{" "}
                <span className="text-[#1c1917] font-semibold">-14°C avg</span>
              </div>
              <div>
                Base Camp:{" "}
                <span className="text-[#1c1917] font-semibold">5,364 m</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Elevation Profile Card */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="text-xs font-medium text-[#1c1917]">
              <span>Route Profile: </span>
              <span className="text-[#104b87] font-semibold">
                Lukla to Kala Patthar
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#57534d]">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 bg-[#104b87] rounded-full inline-block" />
                <span>Main Trail</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 bg-[#f05e25] rounded-full inline-block" />
                <span>High Pass / Apex</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1c1917] inline-block" />
                <span>Camp</span>
              </div>
            </div>
          </div>

          <div className="relative w-full my-auto aspect-[1000/170] min-h-[145px]">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 1000 170"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="transectStrokeStone" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#104b87" />
                  <stop offset="38%" stopColor="#104b87" />
                  <stop offset="46%" stopColor="#f05e25" />
                  <stop offset="56%" stopColor="#f05e25" />
                  <stop offset="62%" stopColor="#104b87" />
                  <stop offset="82%" stopColor="#104b87" />
                  <stop offset="88%" stopColor="#f05e25" />
                  <stop offset="100%" stopColor="#f05e25" />
                </linearGradient>

                <linearGradient id="transectAreaStone" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#104b87" stopOpacity="0.14" />
                  <stop offset="80%" stopColor="#104b87" stopOpacity="0.02" />
                  <stop offset="100%" stopColor="#104b87" stopOpacity="0" />
                </linearGradient>
              </defs>

              <line x1="30" y1="38" x2="970" y2="38" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="30" y1="71" x2="970" y2="71" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="30" y1="104" x2="970" y2="104" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="30" y1="136" x2="970" y2="136" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />

              <clipPath id="transectClipStone">
                <rect ref={clipRectRef} x="0" y="0" width="0" height="170" />
              </clipPath>

              <path
                d={`${PATH_D} L 960 160 L 50 160 Z`}
                fill="url(#transectAreaStone)"
                clipPath="url(#transectClipStone)"
              />

              <path
                ref={pathRef}
                d={PATH_D}
                fill="none"
                stroke="url(#transectStrokeStone)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1200"
                strokeDashoffset="1200"
              />

              {WAYPOINTS.map((wp, idx) => (
                <g
                  key={wp.id}
                  ref={(el) => {
                    waypointRefs.current[idx] = el;
                  }}
                  opacity="0.28"
                >
                  <circle
                    cx={wp.x}
                    cy={wp.y}
                    r="4"
                    fill={wp.color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                </g>
              ))}

              <g ref={tracerRef} transform="translate(50, 133)" opacity="0">
                <circle r="5" fill="#f05e25" opacity="0.45" />
                <circle r="3" fill="#ffffff" stroke="#104b87" strokeWidth="1.5" />
              </g>
            </svg>
          </div>

          {/* X-Axis Waypoints */}
          <div className="hidden sm:block relative w-full mt-2 h-6 border-t border-slate-200 pt-2 text-[10px] tracking-wide text-[#57534d] uppercase tabular-nums">
            <div className="absolute left-1 whitespace-nowrap">
              <span className="font-semibold text-[#1c1917]">Lukla</span>{" "}
              <span className="text-slate-500">2,860m</span>
            </div>
            <div className="absolute left-[27%] -translate-x-1/2 whitespace-nowrap">
              <span className="font-semibold text-[#1c1917]">Namche</span>{" "}
              <span className="text-slate-500">3,440m</span>
            </div>
            <div className="absolute left-[48%] -translate-x-1/2 whitespace-nowrap">
              <span className="font-semibold text-[#f05e25]">Cho La</span>{" "}
              <span className="text-slate-500">5,420m</span>
            </div>
            <div className="absolute left-[71%] -translate-x-1/2 whitespace-nowrap">
              <span className="font-semibold text-[#104b87]">Gokyo Ri</span>{" "}
              <span className="text-slate-500">5,357m</span>
            </div>
            <div className="absolute right-1 whitespace-nowrap">
              <span className="font-semibold text-[#f05e25]">Kala Patthar</span>{" "}
              <span className="text-slate-500">5,644m</span>
            </div>
          </div>

          {/* Mobile X-Axis Waypoints (overlap-free) */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2.5 border-t border-slate-200 text-[10px] tracking-wide uppercase tabular-nums sm:hidden">
            <span className="rounded-md bg-[#f8fafc] px-2 py-0.5 text-[#1c1917] font-semibold">
              Lukla <span className="font-normal text-slate-500">2,860m</span>
            </span>
            <span className="rounded-md bg-[#f8fafc] px-2 py-0.5 text-[#1c1917] font-semibold">
              Namche <span className="font-normal text-slate-500">3,440m</span>
            </span>
            <span className="rounded-md bg-[#f8fafc] px-2 py-0.5 text-[#f05e25] font-semibold">
              Cho La <span className="font-normal text-slate-500">5,420m</span>
            </span>
            <span className="rounded-md bg-[#f8fafc] px-2 py-0.5 text-[#104b87] font-semibold">
              Gokyo Ri <span className="font-normal text-slate-500">5,357m</span>
            </span>
            <span className="rounded-md bg-[#f8fafc] px-2 py-0.5 text-[#f05e25] font-semibold">
              Kala Patthar <span className="font-normal text-slate-500">5,644m</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 mt-3 border-t border-slate-200 text-center tabular-nums">
            <div className="p-2 rounded-lg bg-[#f8fafc]">
              <p className="text-[#57534d] text-[10px] uppercase tracking-wider">
                Distance
              </p>
              <p className="font-semibold text-[#1c1917] text-sm mt-0.5">
                68.4 km
              </p>
            </div>
            <div className="p-2 rounded-lg bg-[#f8fafc]">
              <p className="text-[#57534d] text-[10px] uppercase tracking-wider">
                Elevation Gain
              </p>
              <p className="font-semibold text-[#104b87] text-sm mt-0.5">
                +3,820 m
              </p>
            </div>
            <div className="p-2 rounded-lg bg-[#f8fafc]">
              <p className="text-[#57534d] text-[10px] uppercase tracking-wider">
                Highest Pass
              </p>
              <p className="font-semibold text-[#f05e25] text-sm mt-0.5">
                5,420 m
              </p>
            </div>
            <div className="p-2 rounded-lg bg-[#f8fafc]">
              <p className="text-[#57534d] text-[10px] uppercase tracking-wider">
                Viewpoint
              </p>
              <p className="font-semibold text-[#1c1917] text-sm mt-0.5">
                5,644 m
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
