"use client";

import Image from "next/image";
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

export function AboutHeroParallax({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const ridgeRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    const container = containerRef.current;
    const bg = bgRef.current;
    const ridge = ridgeRef.current;
    const content = contentRef.current;
    if (!container || !bg || !ridge || !content) return;

    if (reducedMotion) {
      bg.style.transform = "";
      ridge.style.transform = "";
      content.style.transform = "";
      return;
    }

    let inView = true;
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

    const updateParallax = () => {
      const top = cachedTop - window.scrollY;
      const bottom = top + cachedHeight;
      if (bottom < -120 || top > cachedWinH + 120) return;

      const progress = (cachedWinH - top) / (cachedWinH + cachedHeight);
      const clamped = Math.max(0, Math.min(1, progress));

      const bgShift = (clamped - 0.5) * 90;
      const ridgeShift = (clamped - 0.5) * 45;
      const contentShift = (clamped - 0.5) * -28;

      bg.style.transform = `translate3d(0, ${bgShift.toFixed(2)}px, 0)`;
      ridge.style.transform = `translate3d(0, ${ridgeShift.toFixed(2)}px, 0)`;
      content.style.transform = `translate3d(0, ${contentShift.toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (!inView || rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        updateParallax();
      });
    };

    const onResize = () => {
      const widthChanged = window.innerWidth !== lastWidth;
      lastWidth = window.innerWidth;
      if (!widthChanged && window.innerWidth < 1024) return;
      measure();
      if (inView) updateParallax();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? false;
        setIsVisible(inView);
        if (inView) {
          measure();
          updateParallax();
        }
      },
      { rootMargin: "120px 0px 120px 0px", threshold: 0 }
    );

    measure();
    observer.observe(container);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    updateParallax();

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
      className="relative w-full min-h-[78vh] sm:min-h-[84vh] flex items-center overflow-hidden bg-[#071116]"
    >
      {/* Layer 1: Distant Mountain Photography with Ken Burns + Slow Parallax */}
      <div
        ref={bgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-[15%] h-[130%] z-0 md:will-change-transform"
      >
        <Image
          src="/images/about-hero-himalaya.jpg"
          alt="Snow-capped Himalayan peaks rising above morning clouds in Nepal"
          fill
          priority
          sizes="100vw"
          className={`object-cover object-center ${
            !reducedMotion ? "md:animate-ken-burns" : ""
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071116]/60 via-[#071116]/35 to-transparent" />
      </div>

      {/* Layer 2: Mid-ground Mountain Ridge Silhouette */}
      <div
        ref={ridgeRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-12 sm:bottom-16 z-[1] will-change-transform text-white/25"
      >
        <svg
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
          className="h-24 sm:h-40 w-full"
          fill="currentColor"
        >
          <path d="M0 220 L140 135 L270 175 L440 70 L590 145 L770 40 L940 130 L1110 75 L1275 140 L1440 80 L1440 220 Z" />
        </svg>
      </div>

      {/* Layer 3: Soft White Bottom Gradient Blend into Who We Are */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-32 sm:h-44 bg-gradient-to-t from-white via-white/80 to-transparent"
      />

      {/* Layer 4: Foreground Typography & CTAs */}
      <div
        ref={contentRef}
        className="relative z-10 w-full will-change-transform"
      >
        {children}
      </div>
    </div>
  );
}
