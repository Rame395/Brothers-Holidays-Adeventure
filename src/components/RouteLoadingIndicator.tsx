"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

/**
 * Sleek page-transition overlay.
 * - First website load: handled by ExpeditionLoader (cinematic).
 * - Navigating between pages: a quick, elegant mountain-ridge wipe
 *   that feels fast but smooth — ~600ms with a ridge silhouette.
 */
export default function RouteLoadingIndicator() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const previousPathname = useRef(pathname);
  const rafRef = useRef(0);
  const dismissed = useRef(false);

  const startTransit = useCallback(() => {
    dismissed.current = false;
    setActive(true);
    setProgress(0);
    setPhase("enter");

    const start = performance.now();
    const duration = 500; // fast but not jarring

    const tick = () => {
      const elapsed = performance.now() - start;
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased * 100);

      if (t >= 1) {
        setPhase("exit");
        setTimeout(() => {
          setActive(false);
          setProgress(0);
          setPhase("enter");
        }, 200);
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

  // Complete when pathname changes
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      if (active && !dismissed.current) {
        dismissed.current = true;
        setProgress(100);
        setPhase("exit");
        cancelAnimationFrame(rafRef.current);
        setTimeout(() => {
          setActive(false);
          setProgress(0);
          setPhase("enter");
        }, 180);
      }
    }
  }, [pathname, active]);

  if (!active) return null;

  return (
    <>
      <style>{`
        @keyframes rt-enter { from { opacity:0; } to { opacity:1; } }
        @keyframes rt-exit  { from { opacity:1; } to { opacity:0; } }
      `}</style>
      <div
        className="fixed inset-0 z-[10000] pointer-events-none select-none"
        style={{
          animation: phase === "exit"
            ? "rt-exit 200ms ease-out forwards"
            : "rt-enter 120ms ease-out forwards",
        }}
      >
        {/* Soft overlay */}
        <div className="absolute inset-0 bg-[#070b12]/60 backdrop-blur-[2px]" />

        {/* Top progress line — thin gold */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#c9a46a] to-[#e9cf9b] transition-[width] duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Center: Minimal loading indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            {/* Small animated compass needle */}
            <svg width="32" height="32" viewBox="0 0 32 32" className="animate-spin" style={{ animationDuration: "1.6s" }}>
              <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <path d="M 16 4 L 18 16 L 16 28 L 14 16 Z" fill="rgba(201,164,106,0.7)" />
              <circle cx="16" cy="16" r="2" fill="#e9cf9b" />
            </svg>
            <span className="text-[11px] font-medium uppercase tracking-[0.35em] text-white/70">
              Loading
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
