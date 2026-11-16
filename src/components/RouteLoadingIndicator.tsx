"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export default function RouteLoadingIndicator() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const previousPathname = useRef(pathname);

  // Trigger 1.0-second transit effect on route click
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Handle internal relative links leading to a different path
      if (
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

    document.addEventListener("click", handleAnchorClick, true);
    return () => document.removeEventListener("click", handleAnchorClick, true);
  }, [pathname]);

  const startTransit = () => {
    setActive(true);
    setProgress(0);
    const transitDuration = 1000; // Exactly 1.0 second duration
    const start = performance.now();

    const interval = setInterval(() => {
      const elapsed = performance.now() - start;
      const pct = Math.min((elapsed / transitDuration) * 100, 100);
      setProgress(Math.round(pct));

      if (elapsed >= transitDuration) {
        clearInterval(interval);
        setTimeout(() => {
          setActive(false);
          setProgress(0);
        }, 150);
      }
    }, 20);
  };

  // When pathname updates, finish progress
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
    }
  }, [pathname]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-[#071317]/85 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none transition-opacity duration-200 select-none">
      {/* Top Laser Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#006b78] via-[#89d6e2] to-[#c88a3e] shadow-[0_0_12px_rgba(137,214,226,0.9)] transition-all duration-75 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Central Rotating Compass & Gyro-Scope HUD (Distinct from landing page) */}
      <div className="relative flex flex-col items-center justify-center p-8 text-center max-w-sm">
        {/* Radar Ring and Reticle */}
        <div className="relative w-28 h-28 flex items-center justify-center mb-6">
          {/* Outer rotating ring with ticks */}
          <div className="absolute inset-0 rounded-full border border-dashed border-[#89d6e2]/40 animate-[spin_4s_linear_infinite]"></div>
          {/* Inner pulsating ring */}
          <div className="absolute inset-2 rounded-full border border-[#006b78] animate-ping opacity-25"></div>
          {/* Compass Rose Ring */}
          <div className="absolute inset-4 rounded-full border border-[#89d6e2]/60 flex items-center justify-center">
            {/* Crosshairs */}
            <div className="absolute h-full w-px bg-[#89d6e2]/30"></div>
            <div className="absolute w-full h-px bg-[#89d6e2]/30"></div>
          </div>
          {/* Center Beacon */}
          <div className="w-3 h-3 rounded-full bg-[#c88a3e] shadow-[0_0_10px_#c88a3e]"></div>

          {/* Compass Headings */}
          <span className="absolute top-0 text-[9px] font-mono font-bold text-[#89d6e2]">N</span>
          <span className="absolute bottom-0 text-[9px] font-mono font-bold text-white/50">S</span>
          <span className="absolute left-1 text-[9px] font-mono font-bold text-white/50">W</span>
          <span className="absolute right-1 text-[9px] font-mono font-bold text-white/50">E</span>
        </div>

        {/* Status Line */}
        <div className="flex items-center gap-2 mb-2 text-[#89d6e2] text-xs font-mono tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c88a3e] animate-ping"></span>
          <span>WAYPOINT TRANSIT</span>
          <span className="text-white/40">·</span>
          <span>{progress}%</span>
        </div>

        <p className="text-sm font-serif italic text-white/90 mb-3">
          Routing topographic tiles &amp; field ledger...
        </p>

        {/* Mini 1.0s Timer Bar */}
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#89d6e2] rounded-full transition-all duration-75"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-2">
          LAT 27.7149° N · LON 85.3123° E
        </span>
      </div>
    </div>
  );
}
