"use client";

import { useEffect, useRef, useState } from "react";

interface ExpeditionLoaderProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

const MILESTONES = [
  { alt: 1400, name: "Kathmandu Valley", label: "BASE HQ", stage: "HQ SENSORS ONLINE" },
  { alt: 3440, name: "Namche Bazaar", label: "KHUMBU", stage: "WAYPOINT CALIBRATED" },
  { alt: 5416, name: "Thorong La", label: "HIGH PASS", stage: "BAROMETRIC LOCK" },
  { alt: 8848, name: "Sagarmatha Summit", label: "APEX 8,848M", stage: "EXPEDITION READY" },
];

export default function ExpeditionLoader({ onComplete }: ExpeditionLoaderProps) {
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; });
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [altitude, setAltitude] = useState(1400);
  const [telemetryText, setTelemetryText] = useState("INITIALIZING HIGH-ALTITUDE TELEMETRY...");
  const [activeMilestone, setActiveMilestone] = useState(0);

  const dismissLoader = () => {
    setFading(true);
    onCompleteRef.current?.(); // hero intro starts while the loader fades out
    setTimeout(() => setVisible(false), 700);
  };

  useEffect(() => {
    const duration = 2500; // 2.5s duration as requested
    const startTime = performance.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismissLoader();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const timer = setInterval(() => {
      const now = performance.now();
      const elapsed = now - startTime;
      const rawProgress = Math.min((elapsed / duration) * 100, 100);

      setProgress(Math.round(rawProgress));

      // Ease-out altitude climb from 1,400m to 8,848m
      const pNorm = rawProgress / 100;
      const currentAlt = Math.round(1400 + (8848 - 1400) * Math.pow(pNorm, 1.45));
      setAltitude(currentAlt);

      // Determine active milestone
      if (currentAlt >= 8848 || rawProgress >= 90) {
        setActiveMilestone(3);
        setTelemetryText("APEX LINK LOCKED · SAGARMATHA 8,848M");
      } else if (currentAlt >= 5416 || rawProgress >= 60) {
        setActiveMilestone(2);
        setTelemetryText("CALIBRATING HIGH PASS ARRAYS · THORONG LA 5,416M");
      } else if (currentAlt >= 3440 || rawProgress >= 30) {
        setActiveMilestone(1);
        setTelemetryText("LOCKING KHUMBU WAYPOINT · NAMCHE BAZAAR 3,440M");
      } else {
        setActiveMilestone(0);
        setTelemetryText("TRANSMITTING KATHMANDU HQ MANIFEST · 1,400M");
      }

      if (rawProgress >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          dismissLoader();
        }, 350);
      }
    }, 25);

    return () => {
      clearInterval(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#050c0e] text-white flex flex-col justify-between p-6 sm:p-12 transition-all duration-700 select-none overflow-hidden ${
        fading
          ? "opacity-0 scale-[1.03] filter blur-sm pointer-events-none"
          : "opacity-100 scale-100 filter blur-0"
      }`}
    >
      {/* Background Topographic Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(0,107,120,0.35),transparent_65%)] pointer-events-none"></div>

      {/* Top Header Bar */}
      <div className="relative w-full max-w-6xl mx-auto flex items-center justify-between text-xs font-mono tracking-widest text-[#89d6e2]/80 uppercase">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="Kharka"
            className="h-9 w-auto object-contain rounded shadow-sm"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-white tracking-widest text-xs">KHARKA · EST. 1984</span>
            <span className="text-white/60 text-[10px] hidden sm:inline">HIMALAYAN FIELD JOURNAL</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-5 text-white/50 text-[11px]">
          <span>GPS 27.7149° N · 85.3123° E</span>
          <span>·</span>
          <span>IFMGA PROTOCOL</span>
          <span>·</span>
          <span className="text-[#89d6e2]">TELEMETRY ACTIVE</span>
        </div>

        <button
          onClick={dismissLoader}
          className="px-3 py-1 rounded-full border border-white/20 hover:border-white text-white/70 hover:text-white transition-all text-[11px] font-mono cursor-pointer"
        >
          SKIP [ESC]
        </button>
      </div>

      {/* Centerpiece: Dynamic Contour, Milestones & Big Digital Altimeter */}
      <div className="relative my-auto w-full max-w-3xl mx-auto flex flex-col items-center text-center py-4">
        {/* Animated Mountain Ridge Contour with Waypoint Summits */}
        <div className="relative w-full h-36 sm:h-48 mb-4 flex items-center justify-center">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 500 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Grid Line Guides */}
            <line x1="0" y1="130" x2="500" y2="130" stroke="#00515b" strokeWidth="1" strokeDasharray="3 3" className="opacity-40" />
            <line x1="0" y1="90" x2="500" y2="90" stroke="#00515b" strokeWidth="1" strokeDasharray="3 3" className="opacity-30" />
            <line x1="0" y1="50" x2="500" y2="50" stroke="#00515b" strokeWidth="1" strokeDasharray="3 3" className="opacity-20" />

            {/* Distant Mountain Shimmer Outline */}
            <path
              d="M0 135 L60 100 L120 115 L200 65 L270 95 L350 40 L420 80 L500 135"
              stroke="#006b78"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="opacity-40"
            />

            {/* Main Animated Ridge Line */}
            <path
              d="M0 135 L80 95 L140 105 L220 48 L270 70 L340 18 L420 65 L500 135"
              stroke="url(#ridgeGradNew)"
              strokeWidth="3"
              strokeLinecap="round"
              className="anim-draw-ridge"
            />

            {/* Milestone Waypoint Dots on the Curve */}
            {/* 1. Kathmandu: ~x=80, y=95 */}
            <circle cx="80" cy="95" r={activeMilestone >= 0 ? "5" : "3"} className={activeMilestone >= 0 ? "fill-[#89d6e2]" : "fill-white/30"} />
            {/* 2. Namche: ~x=220, y=48 */}
            <circle cx="220" cy="48" r={activeMilestone >= 1 ? "5" : "3"} className={activeMilestone >= 1 ? "fill-[#89d6e2]" : "fill-white/30"} />
            {/* 3. Thorong La: ~x=270, y=70 */}
            <circle cx="270" cy="70" r={activeMilestone >= 2 ? "5" : "3"} className={activeMilestone >= 2 ? "fill-[#c88a3e]" : "fill-white/30"} />
            {/* 4. Sagarmatha: ~x=340, y=18 */}
            <circle cx="340" cy="18" r={activeMilestone >= 3 ? "6" : "3"} className={activeMilestone >= 3 ? "fill-[#ffd5a9] anim-beacon" : "fill-white/30"} />

            {activeMilestone >= 3 && (
              <circle cx="340" cy="18" r="14" className="stroke-[#c88a3e] stroke-1 anim-radar-wave" />
            )}

            <defs>
              <linearGradient id="ridgeGradNew" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#006b78" />
                <stop offset="35%" stopColor="#89d6e2" />
                <stop offset="65%" stopColor="#c88a3e" />
                <stop offset="100%" stopColor="#ffd5a9" />
              </linearGradient>
            </defs>
          </svg>

          {/* Central Digital Altimeter Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-[#89d6e2]/80 mb-1">
              ASCENT TELEMETRY GAUGE
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-7xl font-serif font-light tracking-tight text-white drop-shadow-[0_0_25px_rgba(137,214,226,0.4)]">
                {altitude.toLocaleString()}
              </span>
              <span className="text-2xl sm:text-3xl font-serif italic text-[#c88a3e]">
                m
              </span>
            </div>
          </div>
        </div>

        {/* Milestone Indicator Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-6">
          {MILESTONES.map((m, idx) => {
            const isPassed = activeMilestone >= idx;
            return (
              <div
                key={m.name}
                className={`p-3 rounded-lg border transition-all duration-300 text-left ${
                  isPassed
                    ? "bg-[#00515b]/25 border-[#89d6e2]/50 shadow-[0_0_12px_rgba(0,107,120,0.3)]"
                    : "bg-white/[0.03] border-white/10 opacity-50"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className={isPassed ? "text-[#c88a3e] font-semibold" : "text-white/40"}>
                    {m.label}
                  </span>
                  <span className={isPassed ? "text-[#89d6e2]" : "text-white/40"}>
                    {m.alt.toLocaleString()}m
                  </span>
                </div>
                <p className="text-xs font-serif text-white truncate">{m.name}</p>
              </div>
            );
          })}
        </div>

        {/* Status Line */}
        <p className="text-sm sm:text-base font-serif text-white/90 italic tracking-wide">
          &ldquo;High summer pastures and silent ridges.&rdquo;
        </p>
      </div>

      {/* Bottom Progress Bar & Telemetry Status */}
      <div className="relative w-full max-w-3xl mx-auto space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2.5 text-[#89d6e2]">
            <span className="w-2 h-2 rounded-full bg-[#006b78] animate-ping"></span>
            <span className="font-medium tracking-wider">{telemetryText}</span>
          </div>
          <span className="text-[#c88a3e] font-bold text-sm tracking-wider">{progress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#006b78] via-[#89d6e2] to-[#c88a3e] rounded-full transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent anim-stat-shimmer pointer-events-none"></div>
        </div>

        {/* Footnote */}
        <div className="flex justify-between items-center text-[10px] font-mono text-white/45 pt-1">
          <span>SATELLITE BEACON: 28.5355° N · 83.8780° E</span>
          <span>100% TIMS &amp; PARK PERMITS VERIFIED</span>
        </div>
      </div>
    </div>
  );
}
