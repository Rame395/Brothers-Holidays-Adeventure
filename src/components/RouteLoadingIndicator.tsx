"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const RIDGE =
  "M 0 138 C 40 134 70 128 100 120 C 135 111 150 98 185 94 C 220 90 240 104 270 98 C 305 91 320 70 355 62 C 385 55 400 64 425 52 C 450 40 465 22 490 14";
const RIDGE_DESCENT = "M 490 14 C 515 26 540 52 565 70 C 580 80 590 86 600 90";
const SUMMIT = { x: 490, y: 14 };

const STAGES = [
  { at: 0, name: "Kathmandu" },
  { at: 30, name: "Namche Bazaar" },
  { at: 60, name: "Gorak Shep" },
  { at: 85, name: "South Col" },
  { at: 99, name: "Summit" },
];

const DURATION = 750;

/**
 * Smooth Himalayan mountain-climber page-transition overlay.
 * Runs on every client-side route switch between pages.
 */
export default function RouteLoadingIndicator() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"enter" | "exit">("enter");
  const [pathLength, setPathLength] = useState(560);
  const [pos, setPos] = useState({ x: 0, y: 138 });

  const pathRef = useRef<SVGPathElement>(null);
  const rafRef = useRef(0);
  const exitTimerRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (exitTimerRef.current) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = 0;
    }
  }, []);

  const startTransit = useCallback(() => {
    clearTimers();

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reducedMotion ? 260 : DURATION;

    setActive(true);
    setProgress(0);
    setPos({ x: 0, y: 138 });
    setPhase("enter");

    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased =
        t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const pctFloat = eased * 100;

      setProgress(pctFloat);

      const pathEl = pathRef.current;
      if (pathEl) {
        const len = pathEl.getTotalLength();
        if (len > 0) {
          setPathLength(len);
          const pt = pathEl.getPointAtLength(eased * len);
          setPos({ x: pt.x, y: pt.y });
        }
      }

      if (t >= 1) {
        setPhase("exit");
        exitTimerRef.current = window.setTimeout(() => {
          setActive(false);
          setProgress(0);
          setPos({ x: 0, y: 138 });
          setPhase("enter");
          exitTimerRef.current = 0;
        }, 240);
      } else {
        rafRef.current = window.requestAnimationFrame(tick);
      }
    };

    rafRef.current = window.requestAnimationFrame(tick);
  }, [clearTimers]);

  // Listen for internal link clicks
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest("a");
      if (!target) return;
      if (
        target.hasAttribute("data-launch-reload") ||
        target.closest("[data-launch-reload]")
      ) {
        return;
      }
      const href = target.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("//") &&
        !href.startsWith("/#") &&
        !target.getAttribute("download") &&
        target.getAttribute("target") !== "_blank" &&
        href !== pathname
      ) {
        startTransit();
      }
    };
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [pathname, startTransit]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  if (!active) return null;

  const pct = Math.round(progress);
  const summited = pct >= 100;
  const stage = [...STAGES].reverse().find((s) => pct >= s.at) ?? STAGES[0];
  const altitude = Math.round(1400 + (8848 - 1400) * (progress / 100));

  return (
    <>
      <style>{`
        @keyframes rt-enter { from { opacity: 0; } to { opacity: 1; } }
        @keyframes rt-exit  { from { opacity: 1; } to { opacity: 0; } }
        @keyframes rt-step-a { 0%,100% { transform: rotate(-20deg); } 50% { transform: rotate(18deg); } }
        @keyframes rt-step-b { 0%,100% { transform: rotate(18deg); } 50% { transform: rotate(-20deg); } }
        @keyframes rt-pole { 0%,100% { transform: rotate(-10deg); } 50% { transform: rotate(14deg); } }
        @keyframes rt-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-0.8px); } }
        @keyframes rt-flag { 0%,100% { transform: skewY(-5deg) scaleX(1); } 50% { transform: skewY(4deg) scaleX(0.92); } }
        @keyframes rt-pulse { 0%,100% { opacity: .4; r: 6; } 50% { opacity: 0; r: 14; } }
        .rt-walking .rt-leg-a { animation: rt-step-a .48s ease-in-out infinite; }
        .rt-walking .rt-leg-b { animation: rt-step-b .48s ease-in-out infinite; }
        .rt-walking .rt-pole  { animation: rt-pole  .48s ease-in-out infinite; }
        .rt-walking .rt-body  { animation: rt-bob   .24s ease-in-out infinite; }
        .rt-leg-a, .rt-leg-b, .rt-pole { transform-box: view-box; }
        .rt-flag { transform-box: fill-box; transform-origin: left center; animation: rt-flag 1.6s ease-in-out infinite; }
        .rt-pulse { animation: rt-pulse 1.8s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .rt-walking *, .rt-flag, .rt-pulse { animation: none !important; }
        }
      `}</style>
      <div
        role="status"
        aria-live="polite"
        aria-label={`Navigating, ${pct} percent`}
        className="fixed inset-0 z-[10000] pointer-events-none select-none flex items-center justify-center overflow-hidden"
        style={{
          animation:
            phase === "exit"
              ? "rt-exit 240ms ease-out forwards"
              : "rt-enter 140ms ease-out forwards",
        }}
      >
        {/* Opaque solid dark background so page content stays hidden during transition */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#070b12]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 45%, rgba(201,164,106,0.08) 0%, rgba(7,11,18,0.65) 75%)",
          }}
        />

        {/* Top luminous gold progress hairline */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#c9a46a] via-[#e9cf9b] to-[#c9a46a] shadow-[0_0_12px_rgba(201,164,106,0.85)] transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Center Ridge & Mountain Climber */}
        <div className="relative z-10 flex w-full max-w-[600px] flex-col items-center px-6 text-center">
          <div className="flex items-center gap-4">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#c9a46a]/70 sm:w-14" />
            <span className="text-[10px] font-medium uppercase tracking-[0.42em] text-white/75 sm:text-[11px]">
              Explore · Trek · Discover
            </span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#c9a46a]/70 sm:w-14" />
          </div>

          <div className="mt-8 w-full sm:mt-10">
            <svg
              viewBox="-10 -30 620 180"
              className="w-full overflow-visible"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="rt-trail" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#c9a46a" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#e9cf9b" />
                </linearGradient>
              </defs>

              {/* Full ridge (unwalked) */}
              <path
                d={RIDGE}
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1"
                strokeDasharray="2 5"
                strokeLinecap="round"
              />
              <path
                d={RIDGE_DESCENT}
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
                strokeDasharray="2 5"
                strokeLinecap="round"
              />

              {/* Walked trail */}
              <path
                ref={pathRef}
                d={RIDGE}
                fill="none"
                stroke="url(#rt-trail)"
                strokeWidth="1.6"
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
                  r="2.2"
                  fill={progress >= c.at ? "#e9cf9b" : "#070b12"}
                  stroke={
                    progress >= c.at ? "#e9cf9b" : "rgba(255,255,255,0.35)"
                  }
                  strokeWidth="1"
                />
              ))}

              {/* Summit flag */}
              <g transform={`translate(${SUMMIT.x}, ${SUMMIT.y})`}>
                <circle
                  className={summited ? "rt-pulse" : ""}
                  r="6"
                  fill="none"
                  stroke="#e9cf9b"
                  strokeWidth="1"
                  opacity="0"
                />
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="-26"
                  stroke="rgba(255,255,255,0.85)"
                  strokeWidth="1"
                />
                <path
                  className="rt-flag"
                  d="M 0 -26 L 15 -21.5 L 0 -17 Z"
                  fill="#c9a46a"
                />
              </g>

              {/* Climber */}
              <g
                transform={`translate(${pos.x}, ${pos.y})`}
                className={summited ? "" : "rt-walking"}
              >
                <g className="rt-body" fill="#f4efe6">
                  {/* back leg */}
                  <g className="rt-leg-b" style={{ transformOrigin: "0px -10px" }}>
                    <path
                      d="M -1.2 -10.5 L -3 -5 L -4 0"
                      stroke="#d9d2c4"
                      strokeWidth="2.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </g>
                  {/* backpack */}
                  <rect
                    x="-6.2"
                    y="-20.5"
                    width="4.6"
                    height="8.5"
                    rx="1.6"
                    fill="#c9a46a"
                  />
                  {/* torso */}
                  <path d="M -2.4 -20 C -0.6 -21 1.8 -20 2 -17.5 L 1.2 -10.5 L -2 -10.5 Z" />
                  {/* head */}
                  <circle cx="1.6" cy="-23.2" r="2.3" />
                  {/* front leg */}
                  <g className="rt-leg-a" style={{ transformOrigin: "0px -10px" }}>
                    <path
                      d="M 0.4 -10.5 L 2.6 -5.2 L 2.4 0"
                      stroke="#f4efe6"
                      strokeWidth="2.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </g>
                  {/* arm + trekking pole */}
                  <g className="rt-pole" style={{ transformOrigin: "0.8px -18px" }}>
                    <path
                      d="M 0.8 -18 L 3.6 -13.2"
                      stroke="#f4efe6"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <line
                      x1="3.6"
                      y1="-13.4"
                      x2="6.4"
                      y2="0.5"
                      stroke="#e9cf9b"
                      strokeWidth="0.8"
                      strokeLinecap="round"
                    />
                  </g>
                </g>
              </g>
            </svg>
          </div>

          {/* Progress Telemetry */}
          <div className="mt-6 w-full max-w-[420px]">
            <div className="flex items-end justify-between">
              <span className="font-serif text-[15px] italic text-white/85 sm:text-base">
                {summited ? "Summit reached" : "Ascending to route"}
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
            <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.28em] text-white/50">
              <span>{stage.name}</span>
              <span className="tabular-nums">{altitude.toLocaleString()} m</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
