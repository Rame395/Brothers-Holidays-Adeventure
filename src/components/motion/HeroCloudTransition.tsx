"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function HeroCloudTransition() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftBankRef = useRef<HTMLDivElement | null>(null);
  const rightBankRef = useRef<HTMLDivElement | null>(null);
  const centerVeilRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resetTransforms = () => {
      if (leftBankRef.current) leftBankRef.current.style.transform = "";
      if (rightBankRef.current) rightBankRef.current.style.transform = "";
      if (centerVeilRef.current) {
        centerVeilRef.current.style.transform = "";
        centerVeilRef.current.style.opacity = "";
      }
    };

    if (reducedMotion) {
      resetTransforms();
      return;
    }

    let inView = false;
    let rafId = 0;
    let cachedTop = 0;
    let cachedHeight = 0;
    let cachedWinH = window.innerHeight;
    let lastWidth = window.innerWidth;

    const measure = () => {
      const rect = container.getBoundingClientRect();
      cachedTop = rect.top + window.scrollY;
      cachedHeight = container.offsetHeight;
      cachedWinH = window.innerHeight;
    };

    const updateClouds = () => {
      const top = cachedTop - window.scrollY;
      const bottom = top + cachedHeight;
      if (bottom < -100 || top > cachedWinH + 100) return;

      const raw = (cachedWinH - top) / (cachedWinH + cachedHeight);
      const p = Math.max(0, Math.min(1, raw));
      const spread = lastWidth >= 768 ? 90 : 42;
      const yShift = (0.5 - p) * 24;
      const scale = 1 + p * 0.08;

      if (leftBankRef.current) {
        leftBankRef.current.style.transform = `translate3d(${(-p * spread).toFixed(2)}px, ${yShift.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      }
      if (rightBankRef.current) {
        rightBankRef.current.style.transform = `translate3d(${(p * spread).toFixed(2)}px, ${yShift.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      }
      if (centerVeilRef.current) {
        centerVeilRef.current.style.transform = `translate3d(0, ${((0.5 - p) * -30).toFixed(2)}px, 0)`;
        centerVeilRef.current.style.opacity = Math.max(0.35, 1 - p * 0.55).toFixed(3);
      }
    };

    const onScroll = () => {
      if (!inView || rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        updateClouds();
      });
    };

    const onResize = () => {
      const widthChanged = window.innerWidth !== lastWidth;
      lastWidth = window.innerWidth;
      if (!widthChanged && window.innerWidth < 1024) return;
      measure();
      if (inView) updateClouds();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? false;
        setIsVisible(inView);
        if (inView) {
          measure();
          updateClouds();
        }
      },
      { rootMargin: "120px 0px 120px 0px", threshold: 0 }
    );

    measure();
    observer.observe(container);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    updateClouds();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      data-paused={isVisible && !reducedMotion ? "false" : "true"}
      aria-hidden="true"
      className="relative z-30 -mt-28 sm:-mt-40 lg:-mt-56 h-40 sm:h-52 lg:h-72 w-full overflow-hidden pointer-events-none select-none"
    >
      {/* Layer 1: Atmospheric mist backdrop gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(237,242,247,0.35) 38%, rgba(237,242,247,0.88) 76%, #edf2f7 100%)",
        }}
      />

      {/* Layer 2: Far drifting cloud veil ribbon (desktop/tablet) */}
      <div className="hidden md:flex absolute inset-x-0 top-4 sm:top-6 h-28 sm:h-40 lg:h-52 w-[200%] opacity-70 animate-cloud-drift-left">
        <div
          className="w-1/2 h-full shrink-0"
          style={{
            backgroundImage: [
              "radial-gradient(ellipse 26% 68% at 14% 72%, rgba(255,255,255,0.82) 0%, rgba(232,242,252,0.42) 48%, transparent 76%)",
              "radial-gradient(ellipse 30% 74% at 38% 66%, rgba(255,255,255,0.86) 0%, rgba(226,238,250,0.45) 50%, transparent 78%)",
              "radial-gradient(ellipse 28% 66% at 64% 74%, rgba(255,255,255,0.8) 0%, rgba(232,242,252,0.4) 48%, transparent 76%)",
              "radial-gradient(ellipse 26% 72% at 88% 68%, rgba(255,255,255,0.84) 0%, rgba(226,238,250,0.42) 50%, transparent 76%)",
            ].join(","),
          }}
        />
        <div
          className="w-1/2 h-full shrink-0"
          style={{
            backgroundImage: [
              "radial-gradient(ellipse 26% 68% at 14% 72%, rgba(255,255,255,0.82) 0%, rgba(232,242,252,0.42) 48%, transparent 76%)",
              "radial-gradient(ellipse 30% 74% at 38% 66%, rgba(255,255,255,0.86) 0%, rgba(226,238,250,0.45) 50%, transparent 78%)",
              "radial-gradient(ellipse 28% 66% at 64% 74%, rgba(255,255,255,0.8) 0%, rgba(232,242,252,0.4) 48%, transparent 76%)",
              "radial-gradient(ellipse 26% 72% at 88% 68%, rgba(255,255,255,0.84) 0%, rgba(226,238,250,0.42) 50%, transparent 76%)",
            ].join(","),
          }}
        />
      </div>

      {/* Layer 3a: Center billowing mist veil */}
      <div
        ref={centerVeilRef}
        className="absolute inset-x-0 bottom-4 sm:bottom-6 h-32 sm:h-44 lg:h-56 md:will-change-transform"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse 36% 70% at 50% 62%, rgba(255,255,255,0.92) 0%, rgba(241,245,249,0.62) 48%, transparent 78%)",
            "radial-gradient(ellipse 26% 62% at 36% 74%, rgba(255,255,255,0.85) 0%, rgba(241,245,249,0.5) 50%, transparent 78%)",
            "radial-gradient(ellipse 26% 62% at 64% 74%, rgba(255,255,255,0.85) 0%, rgba(241,245,249,0.5) 50%, transparent 78%)",
          ].join(","),
        }}
      />

      {/* Layer 3b: Left parting volumetric cumulus cloud bank */}
      <div
        ref={leftBankRef}
        className="absolute inset-y-0 -left-[10%] w-[68%] md:will-change-transform"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse 26% 46% at 28% 72%, rgba(255,255,255,0.96) 0%, rgba(241,245,249,0.75) 45%, transparent 75%)",
            "radial-gradient(ellipse 23% 44% at 41% 69%, rgba(255,255,255,0.96) 0%, rgba(241,245,249,0.72) 46%, transparent 76%)",
            "radial-gradient(ellipse 22% 41% at 56% 70%, rgba(255,255,255,0.94) 0%, rgba(241,245,249,0.7) 44%, transparent 74%)",
            "radial-gradient(ellipse 21% 37% at 73% 73%, rgba(255,255,255,0.9) 0%, rgba(241,245,249,0.62) 46%, transparent 75%)",
            "radial-gradient(ellipse 19% 34% at 27% 49%, rgba(255,255,255,0.88) 0%, rgba(237,242,247,0.48) 46%, transparent 74%)",
            "radial-gradient(ellipse 18% 32% at 46% 54%, rgba(255,255,255,0.84) 0%, rgba(237,242,247,0.44) 48%, transparent 74%)",
          ].join(","),
        }}
      />

      {/* Layer 3c: Right parting volumetric cumulus cloud bank */}
      <div
        ref={rightBankRef}
        className="absolute inset-y-0 -right-[10%] w-[68%] md:will-change-transform"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse 26% 46% at 72% 72%, rgba(255,255,255,0.96) 0%, rgba(241,245,249,0.75) 45%, transparent 75%)",
            "radial-gradient(ellipse 23% 44% at 59% 69%, rgba(255,255,255,0.96) 0%, rgba(241,245,249,0.72) 46%, transparent 76%)",
            "radial-gradient(ellipse 22% 41% at 44% 70%, rgba(255,255,255,0.94) 0%, rgba(241,245,249,0.7) 44%, transparent 74%)",
            "radial-gradient(ellipse 21% 37% at 27% 73%, rgba(255,255,255,0.9) 0%, rgba(241,245,249,0.62) 46%, transparent 75%)",
            "radial-gradient(ellipse 19% 34% at 73% 49%, rgba(255,255,255,0.88) 0%, rgba(237,242,247,0.48) 46%, transparent 74%)",
            "radial-gradient(ellipse 18% 32% at 54% 54%, rgba(255,255,255,0.84) 0%, rgba(237,242,247,0.44) 48%, transparent 74%)",
          ].join(","),
        }}
      />

      {/* Layer 4: Foreground drifting low mist + seamless #edf2f7 floor (desktop/tablet) */}
      <div className="hidden md:flex absolute inset-x-0 bottom-0 h-20 sm:h-28 lg:h-36 w-[200%] opacity-80 animate-cloud-drift-right">
        <div
          className="w-1/2 h-full shrink-0"
          style={{
            backgroundImage: [
              "radial-gradient(ellipse 30% 70% at 20% 80%, rgba(255,255,255,0.92) 0%, rgba(237,242,247,0.6) 50%, transparent 78%)",
              "radial-gradient(ellipse 32% 75% at 52% 76%, rgba(255,255,255,0.94) 0%, rgba(237,242,247,0.65) 52%, transparent 80%)",
              "radial-gradient(ellipse 28% 72% at 82% 82%, rgba(255,255,255,0.9) 0%, rgba(237,242,247,0.58) 50%, transparent 78%)",
            ].join(","),
          }}
        />
        <div
          className="w-1/2 h-full shrink-0"
          style={{
            backgroundImage: [
              "radial-gradient(ellipse 30% 70% at 20% 80%, rgba(255,255,255,0.92) 0%, rgba(237,242,247,0.6) 50%, transparent 78%)",
              "radial-gradient(ellipse 32% 75% at 52% 76%, rgba(255,255,255,0.94) 0%, rgba(237,242,247,0.65) 52%, transparent 80%)",
              "radial-gradient(ellipse 28% 72% at 82% 82%, rgba(255,255,255,0.9) 0%, rgba(237,242,247,0.58) 50%, transparent 78%)",
            ].join(","),
          }}
        />
      </div>

      {/* Seamless floor blend into MirrorHighRoutes (#edf2f7) */}
      <div
        className="absolute inset-x-0 bottom-0 h-14 sm:h-20 lg:h-24"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(237,242,247,0.72) 52%, #edf2f7 100%)",
        }}
      />
    </div>
  );
}
