"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

/**
 * 1.5-second smooth page-transition overlay.
 * Runs on every client-side page switch between routes.
 */
export default function RouteLoadingIndicator() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const previousPathname = useRef(pathname);
  const rafRef = useRef(0);
  const startTimeRef = useRef(0);

  const startTransit = useCallback(() => {
    setActive(true);
    setProgress(0);
    setPhase("enter");

    const start = performance.now();
    startTimeRef.current = start;
    const duration = 500; // 0.5 seconds as requested between pages

    const tick = () => {
      const elapsed = performance.now() - start;
      const t = Math.min(elapsed / duration, 1);
      // Smooth S-curve easing
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setProgress(Math.round(eased * 100));

      if (t >= 1) {
        setPhase("exit");
        setTimeout(() => {
          setActive(false);
          setProgress(0);
          setPhase("enter");
        }, 220);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

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
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname, startTransit]);

  // Keep track of pathname updates
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
    }
  }, [pathname]);

  if (!active) return null;

  return (
    <>
      <style>{`
        @keyframes rt-enter { from { opacity: 0; } to { opacity: 1; } }
        @keyframes rt-exit  { from { opacity: 1; } to { opacity: 0; } }
      `}</style>
      <div
        className="fixed inset-0 z-[10000] pointer-events-none select-none"
        style={{
          animation:
            phase === "exit"
              ? "rt-exit 220ms ease-out forwards"
              : "rt-enter 140ms ease-out forwards",
        }}
      >
        {/* Soft luxury dark veil */}
        <div className="absolute inset-0 bg-[#070b12]/75 backdrop-blur-[3px]" />

        {/* Top luminous gold progress line */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#c9a46a] via-[#e9cf9b] to-[#c9a46a] shadow-[0_0_12px_rgba(201,164,106,0.85)] transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Center: Elegant Compass Rose & Telemetry */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3.5 text-center px-4">
            {/* Spinning Gold Compass Ring */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                className="animate-spin"
                style={{ animationDuration: "3s" }}
              >
                <circle
                  cx="24"
                  cy="24"
                  r="21"
                  fill="none"
                  stroke="rgba(201,164,106,0.25)"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="15"
                  fill="none"
                  stroke="rgba(233,207,155,0.4)"
                  strokeWidth="0.8"
                />
                <polygon
                  points="24,6 27,24 24,42 21,24"
                  fill="rgba(201,164,106,0.7)"
                />
                <circle cx="24" cy="24" r="3" fill="#e9cf9b" />
              </svg>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono tracking-[0.3em] uppercase text-[#e9cf9b]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a46a] animate-pulse" />
              <span>ROUTING EXPEDITION · {progress}%</span>
            </div>

            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
              Brothers Holidays Adventure
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
