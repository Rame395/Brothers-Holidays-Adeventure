"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ExpeditionLoaderProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

/* Ridge profile the climber walks along (viewBox 0 0 600 150). */
const RIDGE =
  "M 0 138 C 40 134 70 128 100 120 C 135 111 150 98 185 94 C 220 90 240 104 270 98 C 305 91 320 70 355 62 C 385 55 400 64 425 52 C 450 40 465 22 490 14";
const RIDGE_DESCENT = "M 490 14 C 515 26 540 52 565 70 C 580 80 590 86 600 90";
const SUMMIT = { x: 490, y: 14 };

const STAGES = [
  { at: 0, name: "Kathmandu", alt: 1400 },
  { at: 30, name: "Namche Bazaar", alt: 3440 },
  { at: 60, name: "Gorak Shep", alt: 5164 },
  { at: 85, name: "South Col", alt: 7906 },
  { at: 99, name: "Summit", alt: 8848 },
];

const DURATION = 3200;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export default function ExpeditionLoader({ onComplete, forceShow }: ExpeditionLoaderProps) {
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0); // 0..100 float
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(560);
  const [pos, setPos] = useState({ x: 0, y: 138 });
  const dismissed = useRef(false);

  const dismiss = useCallback(() => {
    if (dismissed.current) return;
    dismissed.current = true;
    setFading(true);
    window.setTimeout(() => {
      setVisible(false);
      onCompleteRef.current?.();
    }, 900);
  }, []);

  // Lock scroll while visible
  useEffect(() => {
    if (!visible) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [visible]);

  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      if (len > 0) setPathLength(len);
    }
  }, []);

  // Progress loop
  useEffect(() => {
    if (!visible || dismissed.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? 1200 : DURATION;
    let ready = document.readyState === "complete";
    const onLoad = () => (ready = true);
    window.addEventListener("load", onLoad);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismiss();
    window.addEventListener("keydown", onKey);

    const start = performance.now();
    let raf = 0;
    let finished = false;
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      setProgress(easeInOut(t) * 100);
      if (t >= 1 && (ready || elapsed > duration + 1500)) {
        if (!finished) {
          finished = true;
          window.setTimeout(dismiss, 650); // brief pause at the summit
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
      window.removeEventListener("keydown", onKey);
    };
  }, [visible, dismiss]);

  // Climber position along the ridge
  useEffect(() => {
    if (!pathRef.current) return;
    const p = pathRef.current.getPointAtLength((progress / 100) * pathLength);
    setPos({ x: p.x, y: p.y });
  }, [progress, pathLength]);

  if (!visible) return null;

  const pct = Math.round(progress);
  const summited = pct >= 100;
  const stage = [...STAGES].reverse().find((s) => pct >= s.at) ?? STAGES[0];
  const altitude = Math.round(1400 + (8848 - 1400) * (progress / 100));

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Loading BROTHERS Holidays Adventure, ${pct} percent`}
      onClick={dismiss}
      className={`bl-root fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-[#070b12] select-none transition-all duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <style>{`
        @keyframes bl-kenburns { from { transform: scale(1.08) translate3d(0,0,0); } to { transform: scale(1.0) translate3d(0,-1%,0); } }
        @keyframes bl-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes bl-mist { 0%,100% { transform: translateX(-3%); } 50% { transform: translateX(3%); } }
        @keyframes bl-step-a { 0%,100% { transform: rotate(-20deg); } 50% { transform: rotate(18deg); } }
        @keyframes bl-step-b { 0%,100% { transform: rotate(18deg); } 50% { transform: rotate(-20deg); } }
        @keyframes bl-pole { 0%,100% { transform: rotate(-10deg); } 50% { transform: rotate(14deg); } }
        @keyframes bl-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-0.8px); } }
        @keyframes bl-flag { 0%,100% { transform: skewY(-5deg) scaleX(1); } 50% { transform: skewY(4deg) scaleX(0.92); } }
        @keyframes bl-pulse { 0%,100% { opacity: .35; r: 6; } 50% { opacity: 0; r: 14; } }
        .bl-bg { animation: bl-kenburns 6s cubic-bezier(.2,.6,.2,1) forwards; }
        .bl-rise { opacity: 0; animation: bl-rise 1s cubic-bezier(.2,.7,.2,1) forwards; }
        .bl-mist { animation: bl-mist 18s ease-in-out infinite; }
        .bl-walking .bl-leg-a { animation: bl-step-a .62s ease-in-out infinite; }
        .bl-walking .bl-leg-b { animation: bl-step-b .62s ease-in-out infinite; }
        .bl-walking .bl-pole  { animation: bl-pole  .62s ease-in-out infinite; }
        .bl-walking .bl-body  { animation: bl-bob   .31s ease-in-out infinite; }
        .bl-leg-a, .bl-leg-b, .bl-pole { transform-box: view-box; }
        .bl-flag { transform-box: fill-box; transform-origin: left center; animation: bl-flag 1.8s ease-in-out infinite; }
        .bl-pulse { animation: bl-pulse 2.4s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .bl-bg, .bl-mist, .bl-walking *, .bl-flag, .bl-pulse { animation: none !important; }
          .bl-rise { opacity: 1; animation: none; }
        }
      `}</style>

      {/* Photographic backdrop */}
      <div
        className="bl-bg absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/cta-himalaya-bg.jpg')" }}
        aria-hidden
      />
      {/* Legibility overlays */}
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            "linear-gradient(180deg, rgba(7,11,18,0.78) 0%, rgba(7,11,18,0.55) 38%, rgba(7,11,18,0.72) 70%, rgba(7,11,18,0.96) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        aria-hidden
        style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 0%, rgba(7,11,18,0.55) 75%)" }}
      />
      <div
        className="bl-mist absolute inset-x-[-10%] bottom-0 h-[45%] opacity-60"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse at 30% 100%, rgba(200,214,230,0.14), transparent 60%), radial-gradient(ellipse at 75% 90%, rgba(200,214,230,0.10), transparent 55%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-[640px] flex-col items-center px-6 text-center">
        {/* Logo */}
        <div className="bl-rise" style={{ animationDelay: "0.1s" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/brothers_logo_navbar.png"
            alt="BROTHERS Holidays Adventure"
            className="h-20 w-auto object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)] sm:h-24 md:h-28"
            draggable={false}
          />
        </div>

        <div className="bl-rise mt-5 flex items-center gap-4" style={{ animationDelay: "0.3s" }}>
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#c9a46a]/70 sm:w-14" />
          <span className="text-[10px] font-medium uppercase tracking-[0.42em] text-white/70 sm:text-[11px]">
            Explore · Trek · Discover
          </span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#c9a46a]/70 sm:w-14" />
        </div>

        {/* Ridge + climber */}
        <div className="bl-rise mt-12 w-full sm:mt-14" style={{ animationDelay: "0.5s" }}>
          <svg viewBox="-10 -30 620 180" className="w-full overflow-visible" aria-hidden>
            <defs>
              <linearGradient id="bl-trail" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#c9a46a" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#e9cf9b" />
              </linearGradient>
            </defs>

            {/* Full ridge (unwalked) */}
            <path d={RIDGE} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="2 5" strokeLinecap="round" />
            <path d={RIDGE_DESCENT} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="2 5" strokeLinecap="round" />

            {/* Walked trail */}
            <path
              ref={pathRef}
              d={RIDGE}
              fill="none"
              stroke="url(#bl-trail)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={pathLength}
              strokeDashoffset={pathLength * (1 - progress / 100)}
            />

            {/* Camp markers */}
            {[
              { x: 100, y: 120, at: 18 },
              { x: 270, y: 98, at: 50 },
              { x: 425, y: 52, at: 82 },
            ].map((c) => (
              <circle
                key={c.x}
                cx={c.x}
                cy={c.y}
                r="2"
                fill={progress >= c.at ? "#e9cf9b" : "#070b12"}
                stroke={progress >= c.at ? "#e9cf9b" : "rgba(255,255,255,0.35)"}
                strokeWidth="1"
                style={{ transition: "fill .4s, stroke .4s" }}
              />
            ))}

            {/* Summit flag */}
            <g transform={`translate(${SUMMIT.x}, ${SUMMIT.y})`}>
              <circle className={summited ? "bl-pulse" : ""} r="6" fill="none" stroke="#e9cf9b" strokeWidth="1" opacity="0" />
              <line x1="0" y1="0" x2="0" y2="-26" stroke="rgba(255,255,255,0.85)" strokeWidth="1" />
              <path className="bl-flag" d="M 0 -26 L 15 -21.5 L 0 -17 Z" fill="#c9a46a" />
            </g>

            {/* Climber (≈24 units tall, feet at origin) */}
            <g transform={`translate(${pos.x}, ${pos.y})`} className={summited ? "" : "bl-walking"}>
              <g className="bl-body" fill="#f4efe6">
                {/* back leg */}
                <g className="bl-leg-b" style={{ transformOrigin: "0px -10px" }}>
                  <path d="M -1.2 -10.5 L -3 -5 L -4 0" stroke="#d9d2c4" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>
                {/* backpack */}
                <rect x="-6.2" y="-20.5" width="4.6" height="8.5" rx="1.6" fill="#c9a46a" />
                {/* torso, leaning into the slope */}
                <path d="M -2.4 -20 C -0.6 -21 1.8 -20 2 -17.5 L 1.2 -10.5 L -2 -10.5 Z" />
                {/* head */}
                <circle cx="1.6" cy="-23.2" r="2.3" />
                {/* front leg */}
                <g className="bl-leg-a" style={{ transformOrigin: "0px -10px" }}>
                  <path d="M 0.4 -10.5 L 2.6 -5.2 L 2.4 0" stroke="#f4efe6" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>
                {/* arm + trekking pole */}
                <g className="bl-pole" style={{ transformOrigin: "0.8px -18px" }}>
                  <path d="M 0.8 -18 L 3.6 -13.2" stroke="#f4efe6" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                  <line x1="3.6" y1="-13.4" x2="6.4" y2="0.5" stroke="#e9cf9b" strokeWidth="0.8" strokeLinecap="round" />
                </g>
              </g>
            </g>
          </svg>
        </div>

        {/* Progress */}
        <div className="bl-rise mt-8 w-full max-w-[420px]" style={{ animationDelay: "0.7s" }}>
          <div className="flex items-end justify-between">
            <span className="font-serif text-[15px] italic text-white/85 sm:text-base">
              {summited ? "Summit reached" : "Preparing your expedition"}
            </span>
            <span className="font-mono text-xs tabular-nums tracking-wider text-[#e9cf9b]">
              {String(pct).padStart(2, "0")}%
            </span>
          </div>
          <div className="relative mt-3 h-px w-full bg-white/15">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#c9a46a]/50 to-[#e9cf9b]"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f4efe6] shadow-[0_0_10px_rgba(233,207,155,0.9)]"
              style={{ left: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.28em] text-white/45">
            <span>{stage.name}</span>
            <span className="tabular-nums">{altitude.toLocaleString()} m</span>
          </div>
        </div>
      </div>

      {/* Skip hint */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          dismiss();
        }}
        className="absolute bottom-6 right-6 z-10 text-[10px] uppercase tracking-[0.3em] text-white/35 transition-colors hover:text-white/80 sm:bottom-8 sm:right-10"
      >
        Skip
      </button>
    </div>
  );
}
