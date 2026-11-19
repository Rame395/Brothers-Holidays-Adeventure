"use client";

import { useEffect, useRef, useState } from "react";

interface Waypoint {
  id: string;
  name: string;
  alt: number;
  altStr: string;
  x: number;
  y: number;
  color: string;
  type: "transect" | "icefall" | "camp";
  progressAt: number;
}

const WAYPOINTS: Waypoint[] = [
  {
    id: "lukla",
    name: "LUKLA",
    alt: 2860,
    altStr: "(2,860M)",
    x: 50,
    y: 133,
    color: "#008ab5",
    type: "transect",
    progressAt: 0.0,
  },
  {
    id: "mid-1",
    name: "WAYPOINT",
    alt: 3120,
    altStr: "(3,120M)",
    x: 175,
    y: 116.7,
    color: "#008ab5",
    type: "transect",
    progressAt: 0.14,
  },
  {
    id: "namche",
    name: "NAMCHE",
    alt: 3440,
    altStr: "(3,440M)",
    x: 290,
    y: 97.1,
    color: "#111d1f",
    type: "camp",
    progressAt: 0.28,
  },
  {
    id: "chola",
    name: "CHO LA PASS",
    alt: 5420,
    altStr: "(5,420M)",
    x: 490,
    y: 71,
    color: "#b58133",
    type: "icefall",
    progressAt: 0.49,
  },
  {
    id: "gokyo",
    name: "GOKYO RI",
    alt: 5357,
    altStr: "(5,357M)",
    x: 665,
    y: 64.4,
    color: "#008ab5",
    type: "transect",
    progressAt: 0.68,
  },
  {
    id: "kalapatthar",
    name: "KALA PATTHAR",
    alt: 5644,
    altStr: "(5,644M)",
    x: 865,
    y: 61.2,
    color: "#b58133",
    type: "icefall",
    progressAt: 0.88,
  },
];

// SVG path scaled for viewBox="0 0 1000 170"
const PATH_D =
  "M 50 133 C 130 126.5, 210 113.4, 290 97.1 C 380 82.7, 440 72.3, 490 71 C 535 69.7, 565 90.5, 595 108.8 C 630 128.4, 665 90.5, 715 22 C 735 8.9, 755 31.8, 775 87.3 C 792 133, 805 148, 818 142.8 C 832 136.2, 852 90.5, 875 48.1 C 885 28.5, 895 20, 910 22 C 925 24, 942 57.9, 960 93.8";

export default function TopographicSurveyProfile({ active }: { active?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [progress, setProgress] = useState(0);
  const [tracerCoords, setTracerCoords] = useState<{ x: number; y: number }>({ x: 50, y: 133 });
  const [currentAlt, setCurrentAlt] = useState(2860);
  const [currentSector, setCurrentSector] = useState("LUKLA DEPARTURE TRANSECT");
  const hasAnimated = useRef(false);

  const startAnimation = () => {
    setProgress(0);
    let animRaf = 0;
    let startTime: number | null = null;
    const duration = 2400; // 2.4s automated survey animation

    const runAnimation = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const rawP = Math.min(1, elapsed / duration);
      const easedP = 1 - Math.pow(1 - rawP, 2.6);

      setProgress(easedP);

      if (pathRef.current) {
        try {
          const totalLen = pathRef.current.getTotalLength();
          const pt = pathRef.current.getPointAtLength(totalLen * easedP);
          setTracerCoords({ x: pt.x, y: pt.y });
        } catch {}
      }

      // Live altitude calculation
      if (easedP < 0.28) {
        const t = easedP / 0.28;
        setCurrentAlt(Math.round(2860 + (3440 - 2860) * t));
        setCurrentSector("LUKLA — NAMCHE ASCENT TRANSECT");
      } else if (easedP < 0.49) {
        const t = (easedP - 0.28) / (0.49 - 0.28);
        setCurrentAlt(Math.round(3440 + (5420 - 3440) * t));
        setCurrentSector("ICEFALL SECTOR · CHO LA PASS");
      } else if (easedP < 0.68) {
        const t = (easedP - 0.49) / (0.68 - 0.49);
        const alt = t < 0.4 ? 5420 - 680 * (t / 0.4) : 4740 + (5357 - 4740) * ((t - 0.4) / 0.6);
        setCurrentAlt(Math.round(alt));
        setCurrentSector("GOKYO RI TRANSECT (5,357M)");
      } else if (easedP < 0.88) {
        const t = (easedP - 0.68) / (0.88 - 0.68);
        const alt = t < 0.45 ? 5357 - 650 * (t / 0.45) : 4707 + (5644 - 4707) * ((t - 0.45) / 0.55);
        setCurrentAlt(Math.round(alt));
        setCurrentSector("KALA PATTHAR APEX (5,644M)");
      } else {
        setCurrentAlt(5644);
        setCurrentSector("SURVEY COMPLETE · ROUTE VERIFIED");
      }

      if (rawP < 1) {
        animRaf = requestAnimationFrame(runAnimation);
      }
    };

    animRaf = requestAnimationFrame(runAnimation);
    return () => cancelAnimationFrame(animRaf);
  };

  useEffect(() => {
    if (active && !hasAnimated.current) {
      hasAnimated.current = true;
      const cleanup = startAnimation();
      return cleanup;
    }
  }, [active]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cleanupFn: (() => void) | undefined;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cleanupFn = startAnimation();
        } else {
          setProgress(0);
          hasAnimated.current = false;
        }
      },
      { threshold: 0.15 }
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cleanupFn?.();
    };
  }, []);

  const replay = () => {
    startAnimation();
  };

  return (
    <div
      id="topographic-survey"
      ref={containerRef}
      className="w-full text-[#111d1f] flex flex-col justify-center"
    >
      {/* Top Header & Overview Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-[#e2ebee]">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[#b58133] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b58133] animate-pulse"></span>
            EXPEDITION DOSSIER · SECTOR TRANSECT 04
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#111d1f] tracking-tight font-normal mt-0.5">
            Topographic Survey Profile
          </h2>
          <p className="text-xs text-[#55606a] mt-0.5">
            Khumbu to Gokyo Ri Traverse Gradient · High-altitude terrain mapping across Sagarmatha.
          </p>
        </div>

        {/* Live Radar Telemetry Banner */}
        <div className="flex items-center gap-4 bg-[#eaf2f5] px-3.5 py-2 rounded-lg border border-[#d2e4e8] text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008ab5] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#008ab5]"></span>
            </span>
            <span className="text-[#3f484a]">RADAR:</span>
            <span className="font-semibold text-[#00515b]">{currentSector}</span>
          </div>
          <div className="pl-3 border-l border-[#becfd4]">
            <span className="text-[#6f797b]">ELEVATION: </span>
            <span className="font-bold text-[#b58133] text-sm">
              {currentAlt.toLocaleString("en-US")} m
            </span>
          </div>
          <button
            onClick={replay}
            className="text-[10px] uppercase tracking-wider text-[#008ab5] hover:text-[#00515b] underline font-semibold cursor-pointer pl-1"
          >
            Re-scan
          </button>
        </div>
      </div>

      {/* Main Dual Grid: Image Panel (Left) + Topographic Elevation Profile (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4 items-stretch">
        
        {/* LEFT COLUMN: Authentic Himalayan Expedition Imagery */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white rounded-xl border border-[#d8e5e7] overflow-hidden shadow-sm group">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#111d1f]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/home-camp.jpg"
              alt="Everest Base Camp tents glowing beneath the Khumbu Icefall under alpenglow"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            {/* Top gradient badge */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider">
              <span className="bg-[#071318]/80 text-white backdrop-blur-md px-2.5 py-1 rounded border border-white/15">
                ● Base Camp II · 5,364 m
              </span>
              <span className="bg-[#b58133] text-white px-2 py-0.5 rounded font-semibold text-[9px]">
                High Camp
              </span>
            </div>

            {/* Bottom photo overlay */}
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#071318]/90 via-[#071318]/50 to-transparent text-white text-[10px] font-mono flex justify-between items-end">
              <div>
                <p className="text-white/70 text-[9px] uppercase tracking-widest">Location Sector</p>
                <p className="font-sans font-medium text-xs text-white">Khumbu Glacier Icefall</p>
              </div>
              <div className="text-right text-white/80">
                <span>27°59′N · 86°51′E</span>
              </div>
            </div>
          </div>

          {/* Expedition Context Note */}
          <div className="p-3.5 bg-[#fcfdfe] text-[11px] text-[#4a5558] space-y-2 border-t border-[#edf2f4]">
            <p className="leading-relaxed">
              <strong className="text-[#111d1f] font-semibold">Active Waypoint Station:</strong> Acclimatization base established on the lateral moraine beneath Everest and Nuptse. Essential barometric staging before crossing Cho La Pass (5,420 m) into the Gokyo lake valley.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#edf2f4] text-[10px] font-mono text-[#6f797b]">
              <div>TEMP: <span className="text-[#111d1f] font-medium">-14°C NIGHT LAPSE</span></div>
              <div>BAROMETRIC: <span className="text-[#111d1f] font-medium">524 HPA (52% O₂)</span></div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Topographic Survey Curve Card */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-white rounded-xl border border-[#d8e5e7] p-4 sm:p-5 shadow-sm">
          {/* Card Sub-header & Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#edf2f4]">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#111d1f] font-medium">
              <span>Transect Profile: </span>
              <span className="text-[#008ab5] font-semibold">Lukla to Kala Patthar</span>
            </div>

            {/* Exact Legend matching reference */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] font-mono tracking-wider text-[#3f484a] uppercase">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 bg-[#008ab5] rounded-full inline-block"></span>
                <span>ROUTE TRANSECT</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 bg-[#b58133] rounded-full inline-block"></span>
                <span>ICEFALL SECTOR</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#111d1f] inline-block"></span>
                <span>HIGH CAMP</span>
              </div>
            </div>
          </div>

          {/* SVG Topographic Canvas */}
          <div className="relative w-full my-auto aspect-[1000/170] min-h-[140px]">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 1000 170"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="transectStrokeGradientRich" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#008ab5" />
                  <stop offset="38%" stopColor="#008ab5" />
                  <stop offset="46%" stopColor="#b58133" />
                  <stop offset="54%" stopColor="#b58133" />
                  <stop offset="60%" stopColor="#007e94" />
                  <stop offset="72%" stopColor="#008ab5" />
                  <stop offset="81%" stopColor="#007e94" />
                  <stop offset="86%" stopColor="#b58133" />
                  <stop offset="100%" stopColor="#b58133" />
                </linearGradient>

                <linearGradient id="transectAreaGradientRich" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#008ab5" stopOpacity="0.14" />
                  <stop offset="75%" stopColor="#008ab5" stopOpacity="0.03" />
                  <stop offset="100%" stopColor="#008ab5" stopOpacity="0" />
                </linearGradient>

                <filter id="beaconGlowRich" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Dashed Grid Lines with Altitude Tags */}
              <line x1="30" y1="38" x2="970" y2="38" stroke="#e0edf2" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="30" y1="71" x2="970" y2="71" stroke="#e0edf2" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="30" y1="104" x2="970" y2="104" stroke="#e0edf2" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="30" y1="136" x2="970" y2="136" stroke="#e0edf2" strokeWidth="1" strokeDasharray="3 3" />

              {/* Area fill */}
              <clipPath id="transectClipRich">
                <rect x="0" y="0" width={1000 * progress} height="170" />
              </clipPath>

              <path
                d={`${PATH_D} L 960 160 L 50 160 Z`}
                fill="url(#transectAreaGradientRich)"
                clipPath="url(#transectClipRich)"
              />

              {/* Main Animated Route Line */}
              <path
                ref={pathRef}
                d={PATH_D}
                fill="none"
                stroke="url(#transectStrokeGradientRich)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1200"
                strokeDashoffset={1200 * (1 - progress)}
                className="transition-[stroke-dashoffset] duration-75"
              />

              {/* Waypoint Markers */}
              {WAYPOINTS.map((wp) => {
                const isPassed = progress >= wp.progressAt;
                return (
                  <g
                    key={wp.id}
                    className="transition-all duration-500 ease-out"
                    style={{
                      opacity: isPassed ? 1 : 0.25,
                      transform: isPassed ? "scale(1)" : "scale(0.8)",
                      transformOrigin: `${wp.x}px ${wp.y}px`,
                    }}
                  >
                    {isPassed && (
                      <circle
                        cx={wp.x}
                        cy={wp.y}
                        r="7"
                        fill="none"
                        stroke={wp.color}
                        strokeWidth="1"
                        opacity="0.35"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={wp.x}
                      cy={wp.y}
                      r="3.5"
                      fill={wp.color}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })}

              {/* Automated Moving Beacon Point */}
              {progress > 0 && progress < 1 && (
                <g transform={`translate(${tracerCoords.x}, ${tracerCoords.y})`} filter="url(#beaconGlowRich)">
                  <circle r="9" fill="#008ab5" opacity="0.3" className="animate-ping" />
                  <circle r="5.5" fill="#b58133" opacity="0.6" />
                  <circle r="2.8" fill="#ffffff" stroke="#00515b" strokeWidth="1" />
                </g>
              )}
            </svg>
          </div>

          {/* X-Axis Labels positioned precisely under waypoints */}
          <div className="relative w-full mt-2 h-6 border-t border-[#e8f0f3] pt-2 text-[9px] sm:text-[10px] font-mono tracking-wider text-[#3f484a] uppercase">
            <div className="absolute left-1 whitespace-nowrap">
              <span className="font-semibold text-[#111d1f]">LUKLA</span>{" "}
              <span className="text-[#6f797b]">(2,860M)</span>
            </div>

            <div className="absolute left-[27%] -translate-x-1/2 text-center whitespace-nowrap">
              <span className="font-semibold text-[#111d1f]">NAMCHE</span>{" "}
              <span className="text-[#6f797b]">(3,440M)</span>
            </div>

            <div className="absolute left-[47%] -translate-x-1/2 text-center whitespace-nowrap">
              <span className="font-semibold text-[#b58133]">CHO LA PASS</span>{" "}
              <span className="text-[#6f797b]">(5,420M)</span>
            </div>

            <div className="absolute left-[70%] -translate-x-1/2 text-center whitespace-nowrap">
              <span className="font-semibold text-[#008ab5]">GOKYO RI</span>{" "}
              <span className="text-[#6f797b]">(5,357M)</span>
            </div>

            <div className="absolute right-1 text-right whitespace-nowrap">
              <span className="font-semibold text-[#b58133]">KALA PATTHAR</span>{" "}
              <span className="text-[#6f797b]">(5,644M)</span>
            </div>
          </div>

          {/* 4 Technical Survey Metrics along the bottom */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 border-t border-[#edf2f4] text-center text-[10px] font-mono">
            <div className="p-1.5 rounded bg-[#f5f9fa]">
              <p className="text-[#6f797b] text-[9px]">TOTAL TRANSECT</p>
              <p className="font-bold text-[#111d1f] text-xs">68.4 KM</p>
            </div>
            <div className="p-1.5 rounded bg-[#f5f9fa]">
              <p className="text-[#6f797b] text-[9px]">CUMULATIVE GAIN</p>
              <p className="font-bold text-[#008ab5] text-xs">+3,820 M</p>
            </div>
            <div className="p-1.5 rounded bg-[#f5f9fa]">
              <p className="text-[#6f797b] text-[9px]">CRITICAL PASS</p>
              <p className="font-bold text-[#b58133] text-xs">5,420 M</p>
            </div>
            <div className="p-1.5 rounded bg-[#f5f9fa]">
              <p className="text-[#6f797b] text-[9px]">SUMMIT APEX</p>
              <p className="font-bold text-[#111d1f] text-xs">5,644 M</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
