"use client";

import { useEffect, useRef } from "react";

export default function FooterAlpineParallax({
  containerRef,
}: {
  containerRef?: React.RefObject<HTMLElement | null>;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const peaksRef = useRef<HTMLDivElement>(null);
  const treesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      if (peaksRef.current) {
        peaksRef.current.style.transform = "translate3d(0, 0px, 0) scale(1)";
      }
      if (treesRef.current) {
        treesRef.current.style.transform = "translate3d(0, 0px, 0) scale(1)";
      }
      return;
    }

    let rafId = 0;

    const applyParallax = () => {
      rafId = 0;
      const container =
        rootRef.current?.parentElement ?? containerRef?.current ?? null;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const viewportH = window.innerHeight || 900;
      const totalTravel = Math.max(rect.height, 260);
      const raw = (viewportH - rect.top) / totalTravel;
      const progress = Math.min(Math.max(raw, 0), 1);
      const inv = 1 - progress;

      if (peaksRef.current) {
        const peaksX = (-inv * 18).toFixed(1);
        const peaksY = (inv * 115).toFixed(1);
        const peaksScale = (1 + inv * 0.14).toFixed(4);
        peaksRef.current.style.transform = `translate3d(${peaksX}px, ${peaksY}px, 0) scale(${peaksScale})`;
      }

      if (treesRef.current) {
        const treesX = (inv * 24).toFixed(1);
        const treesY = (inv * 195).toFixed(1);
        const treesScale = (1 + inv * 0.08).toFixed(4);
        treesRef.current.style.transform = `translate3d(${treesX}px, ${treesY}px, 0) scale(${treesScale})`;
      }
    };

    const scheduleUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(applyParallax);
    };

    applyParallax();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [containerRef]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {/* Distant Himalayan Peaks Layer */}
      <div
        ref={peaksRef}
        className="absolute inset-x-0 bottom-4 sm:bottom-6 h-[88%] flex items-end justify-center will-change-transform transition-transform duration-150 ease-out"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/footer-himalaya-peaks.jpg"
          alt=""
          className="w-full max-w-[1760px] h-full object-cover object-bottom mix-blend-multiply opacity-[0.52]"
        />
      </div>

      {/* Foreground Frosted Alpine Pine Treeline Layer */}
      <div
        ref={treesRef}
        className="absolute inset-x-0 -bottom-2 h-[64%] flex items-end justify-center will-change-transform transition-transform duration-150 ease-out"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/footer-alpine-pines.jpg"
          alt=""
          className="w-full max-w-[1760px] h-full object-cover object-bottom mix-blend-multiply opacity-[0.58]"
        />
      </div>

      {/* Readability Veil Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.92) 22%, rgba(255,255,255,0.62) 52%, rgba(255,255,255,0.16) 80%, rgba(255,255,255,0.06) 100%)",
        }}
      />
    </div>
  );
}
