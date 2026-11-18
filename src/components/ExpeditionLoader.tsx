"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";

interface ExpeditionLoaderProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

const WAYPOINTS = [
  { pct: 0, alt: 1400, name: "Kathmandu Base HQ", stage: "EXPEDITION INITIALIZED" },
  { pct: 30, alt: 3440, name: "Namche Bazaar Ridge", stage: "ACCLIMATIZATION LOCKED" },
  { pct: 65, alt: 5416, name: "Thorong La High Pass", stage: "GLACIAL RIDGE ASCENT" },
  { pct: 95, alt: 8848, name: "Sagarmatha Summit", stage: "SUMMIT CONQUERED" },
];

export default function ExpeditionLoader({ onComplete, forceShow }: ExpeditionLoaderProps) {
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [altitude, setAltitude] = useState(1400);
  const [activeStage, setActiveStage] = useState("EXPEDITION INITIALIZING...");
  const [isSummited, setIsSummited] = useState(false);

  const pathRef = useRef<SVGPathElement>(null);
  const [climberPos, setClimberPos] = useState({ x: 140, y: 370, angle: -15 });
  const [pathLength, setPathLength] = useState(720);

  // Check session storage on mount so internal transitions aren't blocked,
  // while allowing initial visit, hard reload, or ?loader=1
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const isForced = forceShow || urlParams.get("loader") === "1" || urlParams.get("brand") !== null;
      const seen = sessionStorage.getItem("brothers_expedition_loader_seen");

      if (seen && !isForced) {
        setVisible(false);
        onCompleteRef.current?.();
      }
    }
  }, [forceShow]);

  // Measure SVG trail length
  useEffect(() => {
    if (pathRef.current) {
      try {
        const len = pathRef.current.getTotalLength();
        if (len > 0) setPathLength(len);
      } catch {
        // Fallback length
      }
    }
  }, []);

  // Update climber position & angle as progress moves along the trail
  useEffect(() => {
    if (!pathRef.current || pathLength <= 0) return;
    try {
      const currentLen = (progress / 100) * pathLength;
      const pt = pathRef.current.getPointAtLength(currentLen);
      const lookAhead = Math.min(pathLength, currentLen + 4);
      const nextPt = pathRef.current.getPointAtLength(lookAhead);
      const angle = Math.atan2(nextPt.y - pt.y, nextPt.x - pt.x) * (180 / Math.PI);

      setClimberPos({
        x: pt.x,
        y: pt.y,
        angle: Math.max(-42, Math.min(10, angle)),
      });
    } catch {
      // Fallback
    }

    if (progress >= 96) {
      setIsSummited(true);
    }
  }, [progress, pathLength]);

  const dismissLoader = () => {
    setFading(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("brothers_expedition_loader_seen", "true");
    }
    setTimeout(() => {
      setVisible(false);
      onCompleteRef.current?.();
    }, 750);
  };

  // Main Loading Progression & Lifecycle
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismissLoader();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const minDuration = 2800; // 2.8s smooth climb
    const startTime = performance.now();
    let isReady = false;

    // Check document readiness
    if (typeof document !== "undefined") {
      if (document.readyState === "complete") {
        isReady = true;
      } else {
        const handleLoad = () => {
          isReady = true;
        };
        window.addEventListener("load", handleLoad);
      }
    }

    let frameId: number;

    const animate = () => {
      const now = performance.now();
      const elapsed = now - startTime;
      const timeProgress = Math.min(elapsed / minDuration, 1);

      // Natural ease-out curve for climbing deceleration near summit
      const eased = Math.pow(timeProgress, 0.88) * 100;
      const currentPct = Math.min(Math.round(eased), 100);

      setProgress(currentPct);

      // Interpolate Altitude
      const currentAlt = Math.round(1400 + (8848 - 1400) * Math.pow(timeProgress, 1.2));
      setAltitude(currentAlt);

      // Update Waypoints
      if (currentPct >= 95) {
        setActiveStage("SAGARMATHA SUMMIT 8,848M CONQUERED");
      } else if (currentPct >= 65) {
        setActiveStage("HIGH PASS BAROMETRIC LOCK · THORONG LA");
      } else if (currentPct >= 30) {
        setActiveStage("WAYPOINT REACHED · NAMCHE BAZAAR 3,440M");
      } else {
        setActiveStage("ASCENDING TRAIL · BASE LOGISTICS ONLINE");
      }

      if (timeProgress >= 1 && (isReady || elapsed > 3600)) {
        // Hold briefly at summit to show celebration flare and flag
        setTimeout(() => {
          dismissLoader();
        }, 350);
      } else {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(frameId);
    };
  }, [visible]);

  // Floating embers / light particles
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${15 + (i * 4.8) % 70}%`,
        bottom: `${20 + (i * 7.3) % 60}%`,
        delay: `${(i * 0.35) % 3.5}s`,
        duration: `${3 + (i * 0.4) % 3}s`,
        size: `${2 + (i % 3)}px`,
      })),
    []
  );

  if (!visible) return null;

  return (
    <div
      onClick={dismissLoader}
      role="dialog"
      aria-label="Loading BROTHERS Holidays Adventure"
      className={`fixed inset-0 z-[99999] bg-[#020e0c] flex flex-col items-center justify-between overflow-hidden select-none cursor-pointer transition-opacity duration-700 ease-out ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* ──────────────────────────────────────────────────────────
          1. CINEMATIC HIMALAYAN EMERALD BACKGROUND
          ────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          backgroundImage: "url('/images/himalayan-sunrise-4096x2048.webp')",
          filter: "brightness(0.68) saturate(1.15) hue-rotate(-12deg)",
          transform: `scale(${1 + (progress / 100) * 0.03})`,
        }}
      />

      {/* Deep Forest-Green & Emerald Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020e0c]/92 via-[#041d17]/65 to-[#020e0c]/95 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-[ellipse_at_75%_35%] from-transparent via-[#020e0c]/40 to-[#020e0c]/85 pointer-events-none" />

      {/* Atmospheric Drifting Mountain Mist */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_60%,rgba(15,93,70,0.35),transparent_70%)] animate-loader-mist pointer-events-none" />

      {/* Golden Sunrise Glow on Eastern Horizon */}
      <div className="absolute -right-20 top-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(232,183,101,0.25)_0%,rgba(90,140,35,0.15)_45%,transparent_70%)] pointer-events-none blur-3xl" />

      {/* Topographic Contour Lines in Corners */}
      <div className="absolute top-0 left-0 w-80 h-64 pointer-events-none opacity-20 select-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 500 350" fill="none">
          <path d="M -40,30 Q 90,20 160,70 T 280,160 T 380,290" stroke="#7ce63a" strokeWidth="1.2" opacity="0.6" />
          <path d="M -40,80 Q 110,60 190,120 T 320,220 T 430,350" stroke="#7ce63a" strokeWidth="1.2" opacity="0.45" />
          <path d="M -40,140 Q 130,110 230,170 T 360,280 T 470,400" stroke="#7ce63a" strokeWidth="1.2" opacity="0.3" />
        </svg>
      </div>

      {/* Floating Golden Embers & Alpine Light Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-[#7ce63a] shadow-[0_0_8px_#7ce63a]"
            style={{
              left: p.left,
              bottom: p.bottom,
              width: p.size,
              height: p.size,
              animation: `loader-ember-drift ${p.duration} ease-in-out infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* ──────────────────────────────────────────────────────────
          2. TOP HEADER — OFFICIAL BRAND LOGO & TAGLINE
          ────────────────────────────────────────────────────────── */}
      <header className="relative z-20 pt-8 sm:pt-10 flex flex-col items-center justify-center text-center px-4">
        {/* Official BROTHERS Holidays Adventure Emblem */}
        <div className="relative group transition-transform duration-500 hover:scale-105">
          {/* Subtle backglow behind the logo */}
          <div className="absolute inset-0 bg-[#5a8c23]/25 rounded-full blur-2xl transform scale-110 pointer-events-none" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/brothers_logo_navbar.png"
            alt="BROTHERS Holidays Adventure"
            className="relative h-14 sm:h-16 md:h-20 w-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.85)]"
          />
        </div>

        {/* Sub-Brand Manifesto */}
        <div className="flex items-center justify-center gap-3 mt-2 sm:mt-2.5">
          <span className="w-6 sm:w-12 h-px bg-gradient-to-r from-transparent to-[#7ce63a]/80" />
          <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.32em] uppercase text-[#7ce63a] font-semibold drop-shadow-sm whitespace-nowrap">
            EXPLORE • TREK • DISCOVER
          </span>
          <span className="w-6 sm:w-12 h-px bg-gradient-to-l from-transparent to-[#7ce63a]/80" />
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────
          3. CENTRAL MOUNTAIN ASCENT STAGE — THE CLIMB
          Real SVG path, climbing silhouette, trail glow & summit flag
          ────────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-4xl px-4 flex-1 flex items-center justify-center py-2">
        <div className="relative w-full aspect-[2.35/1] max-h-[380px]">
          <svg
            viewBox="0 0 1000 420"
            className="w-full h-full overflow-visible drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
          >
            <defs>
              {/* Headlamp light cone gradient */}
              <linearGradient id="headlamp-beam" x1="0%" y1="0%" x2="100%" y2="80%">
                <stop offset="0%" stopColor="#fff8e7" stopOpacity="0.85" />
                <stop offset="60%" stopColor="#7ce63a" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#7ce63a" stopOpacity="0" />
              </linearGradient>

              {/* Glowing trail gradient */}
              <linearGradient id="trail-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2e7d32" />
                <stop offset="50%" stopColor="#55c024" />
                <stop offset="85%" stopColor="#7ce63a" />
                <stop offset="100%" stopColor="#e8b765" />
              </linearGradient>

              {/* Mountain ridge fill gradient */}
              <linearGradient id="ridge-gradient" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#082921" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#041813" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#020e0c" stopOpacity="1" />
              </linearGradient>

              {/* Distant peaks gradient */}
              <linearGradient id="distant-peaks-grad" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#0f4538" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#051c16" stopOpacity="0.75" />
              </linearGradient>
            </defs>

            {/* Distant Mountain Silhouettes & Snowcaps */}
            <g className="opacity-60">
              {/* Distant Ama Dablam shape on left */}
              <polygon
                points="80,380 240,160 310,240 400,180 500,320 180,410"
                fill="url(#distant-peaks-grad)"
              />
              {/* Snowcap on left peak */}
              <polygon points="240,160 215,195 240,185 265,195" fill="#eafaf1" opacity="0.8" />
              <polygon points="400,180 380,205 400,198 420,205" fill="#eafaf1" opacity="0.7" />

              {/* Distant High Apex behind the summit */}
              <polygon points="560,320 680,140 760,220 840,340" fill="url(#distant-peaks-grad)" />
              <polygon points="680,140 660,170 680,162 700,170" fill="#eafaf1" opacity="0.85" />
            </g>

            {/* Foreground Mountain Ridge Sloping up to Summit */}
            <path
              d="M 0,420 L 60,390 L 140,370 C 230,350 270,320 360,300 C 450,280 480,230 570,200 C 660,170 710,130 780,105 L 830,130 L 910,240 L 980,360 L 1000,420 Z"
              fill="url(#ridge-gradient)"
              stroke="#5a8c23"
              strokeWidth="1.2"
              strokeOpacity="0.35"
            />

            {/* Ridge Rock Facets & Crags for Texture */}
            <g opacity="0.4" stroke="#7ce63a" strokeWidth="0.8">
              <path d="M 230,350 L 250,380 M 360,300 L 380,340 M 480,230 L 510,270 M 660,170 L 690,210" />
            </g>

            {/* ── THE TRAIL ── */}
            {/* Ambient Background Dashed Trail */}
            <path
              d="M 140,370 C 230,350 270,320 360,300 C 450,280 480,230 570,200 C 660,170 710,130 780,105"
              fill="none"
              stroke="#5a8c23"
              strokeWidth="2.5"
              strokeDasharray="4 6"
              strokeOpacity="0.4"
            />

            {/* Active Progressively Glowing Trail */}
            <path
              ref={pathRef}
              d="M 140,370 C 230,350 270,320 360,300 C 450,280 480,230 570,200 C 660,170 710,130 780,105"
              fill="none"
              stroke="url(#trail-gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={pathLength}
              strokeDashoffset={pathLength * (1 - progress / 100)}
              style={{
                filter: "drop-shadow(0 0 8px rgba(124, 230, 58, 0.85))",
                transition: "stroke-dashoffset 0.1s linear",
              }}
            />

            {/* Waypoint Markers on Trail */}
            {/* 1. Base Camp (1,400m) */}
            <circle cx="140" cy="370" r="4.5" fill="#7ce63a" opacity="0.9" />
            <circle cx="140" cy="370" r="8" fill="none" stroke="#7ce63a" strokeWidth="1" opacity="0.4" />

            {/* 2. Namche Pass (3,440m) */}
            <circle cx="360" cy="300" r="3.5" fill={progress >= 30 ? "#7ce63a" : "#0f4538"} />

            {/* 3. High Camp (5,416m) */}
            <circle cx="570" cy="200" r="3.5" fill={progress >= 65 ? "#7ce63a" : "#0f4538"} />

            {/* ── THE SUMMIT PINNACLE (780, 105) ── */}
            {/* Flagpole */}
            <line x1="780" y1="105" x2="780" y2="52" stroke="#e8b765" strokeWidth="2" strokeLinecap="round" />

            {/* Waving Expedition Flag */}
            <g
              className="animate-summit-flag"
              style={{ transformOrigin: "780px 62px" }}
            >
              <polygon
                points="780,56 824,68 780,80"
                fill="#55c024"
                stroke="#a3e635"
                strokeWidth="1"
                style={{
                  filter: "drop-shadow(0 0 8px rgba(85, 192, 36, 0.7))",
                }}
              />
              {/* Flag compass emblem */}
              <circle cx="794" cy="68" r="3" fill="#ffffff" />
            </g>

            {/* Glowing Golden Summit Flare Beacon */}
            <g
              transform="translate(780, 52)"
              className={isSummited ? "animate-summit-star" : "opacity-40"}
            >
              <circle cx="0" cy="0" r={isSummited ? "6" : "3.5"} fill="#e8b765" />
              <circle
                cx="0"
                cy="0"
                r={isSummited ? "18" : "8"}
                fill="none"
                stroke="#7ce63a"
                strokeWidth="1.5"
                opacity={isSummited ? 0.9 : 0.3}
              />
            </g>

            {/* ── REALISTIC ANIMATED MOUNTAINEER SILHOUETTE ── */}
            <g
              transform={`translate(${climberPos.x}, ${climberPos.y}) rotate(${climberPos.angle})`}
              className="transition-transform duration-75"
            >
              <g className={!isSummited ? "animate-climber-bob" : ""}>
                {/* Forward Headlamp Light Cone */}
                <polygon
                  points="12,-20 65,-36 70,-4 14,-16"
                  fill="url(#headlamp-beam)"
                  opacity={isSummited ? 0.3 : 0.75}
                  className="pointer-events-none"
                />

                {/* Back Trekking Pole (planted into rock) */}
                <g
                  className={!isSummited ? "animate-climber-pole-back" : ""}
                  style={{ transformOrigin: "2px -12px" }}
                >
                  <line
                    x1="2"
                    y1="-12"
                    x2={isSummited ? "-8" : "-12"}
                    y2={isSummited ? "8" : "12"}
                    stroke="#e8b765"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <circle cx="2" cy="-12" r="1.5" fill="#333" />
                  <line x1="-14" y1="9" x2="-10" y2="10" stroke="#7ce63a" strokeWidth="1.2" />
                </g>

                {/* Back Leg (stride cycle) */}
                <g
                  className={!isSummited ? "animate-climber-leg-back" : ""}
                  style={{ transformOrigin: "0px 0px" }}
                >
                  <line x1="0" y1="0" x2="-6" y2="10" stroke="#041a15" strokeWidth="4.5" strokeLinecap="round" />
                  <line x1="-6" y1="10" x2="-10" y2="19" stroke="#041a15" strokeWidth="4" strokeLinecap="round" />
                  <ellipse cx="-11" cy="19" rx="3.5" ry="2" fill="#020e0c" />
                </g>

                {/* Expedition Backpack with green sleeping roll */}
                <rect
                  x="-15"
                  y="-22"
                  width="12"
                  height="18"
                  rx="3.5"
                  fill="#052820"
                  stroke="#7ce63a"
                  strokeWidth="0.8"
                />
                <rect
                  x="-14"
                  y="-27"
                  width="10"
                  height="5.5"
                  rx="2"
                  fill="#5a8c23"
                  stroke="#a3e635"
                  strokeWidth="0.6"
                />

                {/* Torso leaning forward into steep slope */}
                <path
                  d="M -5,-22 C 2,-23 7,-18 7,-10 C 7,-3 4,0 0,0 C -4,0 -6,-10 -6,-20 Z"
                  fill="#041a15"
                  stroke="#5a8c23"
                  strokeWidth="0.6"
                />

                {/* Hooded Head & Beanie */}
                <circle cx="8" cy="-24" r="5" fill="#041a15" />
                {/* Headlamp */}
                <rect x="11" y="-26" width="3.5" height="3.5" rx="1" fill="#e8b765" />

                {/* Front Leg (stepping uphill) */}
                <g
                  className={!isSummited ? "animate-climber-leg-front" : ""}
                  style={{ transformOrigin: "2px 0px" }}
                >
                  <line x1="2" y1="0" x2="8" y2="9" stroke="#041a15" strokeWidth="4.5" strokeLinecap="round" />
                  <line x1="8" y1="9" x2="6" y2="19" stroke="#041a15" strokeWidth="4" strokeLinecap="round" />
                  <ellipse cx="6" cy="19" rx="3.5" ry="2" fill="#020e0c" />
                </g>

                {/* Front Arm & Trekking Pole */}
                <g
                  className={!isSummited ? "animate-climber-pole-front" : ""}
                  style={{ transformOrigin: "3px -14px" }}
                >
                  <line
                    x1="3"
                    y1="-14"
                    x2={isSummited ? "14" : "11"}
                    y2={isSummited ? "-28" : "-4"}
                    stroke="#041a15"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1={isSummited ? "14" : "11"}
                    y1={isSummited ? "-28" : "-4"}
                    x2={isSummited ? "16" : "18"}
                    y2={isSummited ? "-38" : "16"}
                    stroke="#e8b765"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <circle cx={isSummited ? "14" : "11"} cy={isSummited ? "-28" : "-4"} r="1.5" fill="#333" />
                  <line
                    x1={isSummited ? "14" : "16"}
                    y1={isSummited ? "-36" : "13"}
                    x2={isSummited ? "18" : "20"}
                    y2={isSummited ? "-36" : "13"}
                    stroke="#7ce63a"
                    strokeWidth="1.2"
                  />
                </g>
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          4. BOTTOM LOADING CONTROLS & PROGRESS BAR
          Lime-green fill, percentage, altitude, and status
          ────────────────────────────────────────────────────────── */}
      <footer className="relative z-20 pb-8 sm:pb-12 w-full max-w-lg px-6 flex flex-col items-center text-center">
        {/* Main Status Text */}
        <p className="font-serif italic text-base sm:text-lg text-white font-light tracking-wide drop-shadow-sm mb-5 sm:mb-6">
          Loading Your Next Adventure...
        </p>

        {/* Progress Bar Container with Integrated Mountain Marker */}
        <div className="relative w-full mb-3 mt-1">
          {/* Track */}
          <div className="w-full h-3 sm:h-3.5 rounded-full bg-[#031812]/90 border border-[#5a8c23]/40 p-0.5 backdrop-blur-md overflow-hidden shadow-inner">
            {/* Glowing Lime-Green Progress Fill */}
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2e7d32] via-[#55c024] to-[#8ee032] shadow-[0_0_16px_rgba(85,192,36,0.9)] transition-all duration-100 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Leading edge radiant beacon */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
            </div>
          </div>

          {/* Mini Mountain Icon traversing with progress */}
          <div
            className="absolute -top-5 transition-all duration-100 ease-out pointer-events-none -translate-x-1/2"
            style={{ left: `${Math.max(5, Math.min(95, progress))}%` }}
          >
            <svg className="w-4 h-4 text-[#7ce63a] drop-shadow-[0_0_6px_#7ce63a]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L2 21h20L12 3zm0 4.5l5.5 10.5h-11L12 7.5z" />
            </svg>
          </div>
        </div>

        {/* Telemetry Numbers: Percentage & Altitude */}
        <div className="w-full flex items-center justify-between text-xs font-mono text-[#aab9c0] px-1">
          <div className="inline-flex items-center gap-1.5 text-[#7ce63a] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7ce63a] animate-pulse" />
            <span>ALT {altitude.toLocaleString()} M</span>
          </div>

          <div className="text-white/80 font-bold text-sm tracking-wider">
            {progress}%
          </div>
        </div>

        {/* Waypoint Stage Description */}
        <div className="mt-2 text-[10px] font-mono tracking-widest text-[#7ce63a]/80 uppercase">
          {activeStage}
        </div>

        {/* Subtle keyboard hint */}
        <span className="mt-3 text-[10px] text-white/35 font-light tracking-wider hover:text-white/60 transition-colors">
          Press ESC or Click Anywhere to Enter
        </span>
      </footer>
    </div>
  );
}
