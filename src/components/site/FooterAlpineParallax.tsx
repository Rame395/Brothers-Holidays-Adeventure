"use client";

import { useEffect, useRef } from "react";

export default function FooterAlpineParallax({
  containerRef,
}: {
  containerRef?: React.RefObject<HTMLElement | null>;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const skylineRef = useRef<HTMLDivElement>(null);
  const scrollMistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const observer = new IntersectionObserver(
      ([entry]) => {
        root.setAttribute(
          "data-paused",
          entry?.isIntersecting && !prefersReduced ? "false" : "true"
        );
      },
      { threshold: 0.02 }
    );
    observer.observe(root);

    if (prefersReduced) {
      if (skylineRef.current) {
        skylineRef.current.style.transform = "translate3d(0, 0px, 0) scale(1)";
      }
      if (scrollMistRef.current) {
        scrollMistRef.current.style.transform = "translate3d(0px, 0, 0)";
      }
      return () => observer.disconnect();
    }

    let rafId = 0;

    const applyParallax = () => {
      rafId = 0;
      const container =
        rootRef.current?.parentElement ?? containerRef?.current ?? null;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const viewportH = window.innerHeight || 900;
      const totalTravel = Math.max(rect.height * 0.72, 260);
      const raw = (viewportH - rect.top) / totalTravel;
      const progress = Math.min(Math.max(raw, 0), 1);
      const inv = 1 - progress;

      if (skylineRef.current) {
        const y = (inv * 52).toFixed(1);
        const scale = (1 + inv * 0.08).toFixed(4);
        skylineRef.current.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
      }

      if (scrollMistRef.current) {
        const mistX = (inv * -48).toFixed(1);
        scrollMistRef.current.style.transform = `translate3d(${mistX}px, 0, 0)`;
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
      observer.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [containerRef]);

  return (
    <div
      ref={rootRef}
      data-paused="false"
      aria-hidden="true"
      className="relative w-full h-44 sm:h-60 lg:h-72 overflow-hidden bg-white select-none pointer-events-none"
    >
      {/* Main Panoramic Himalayan Trekkers Skyline (Scroll Parallax + Subtle Breathe) */}
      <div
        ref={skylineRef}
        className="absolute inset-0 will-change-transform transition-transform duration-150 ease-out"
      >
        <div className="w-full h-full animate-mountain-breathe">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/footer-trekkers-skyline.jpg"
            alt=""
            className="w-full h-full object-cover object-bottom"
          />
        </div>
      </div>

      {/* Live Drifting High-Altitude Cloud Ribbon 1 (Over Sky & Peaks) */}
      <div className="absolute inset-x-0 top-0 h-32 sm:h-40 w-[200%] flex opacity-70 animate-cloud-drift-left">
        <svg
          className="w-1/2 h-full shrink-0"
          viewBox="0 0 1200 180"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="footerCloudL" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,110 Q180,45 380,95 T780,82 Q1000,48 1200,98 L1200,180 L0,180 Z"
            fill="url(#footerCloudL)"
          />
        </svg>
        <svg
          className="w-1/2 h-full shrink-0"
          viewBox="0 0 1200 180"
          preserveAspectRatio="none"
        >
          <path
            d="M0,110 Q180,45 380,95 T780,82 Q1000,48 1200,98 L1200,180 L0,180 Z"
            fill="url(#footerCloudL)"
          />
        </svg>
      </div>

      {/* Counter-Drifting Valley Mist Veil (Scroll-Reactive + Continuous Drift) */}
      <div
        ref={scrollMistRef}
        className="absolute inset-x-0 bottom-8 sm:bottom-12 h-24 sm:h-32 will-change-transform transition-transform duration-150 ease-out"
      >
        <div className="w-[200%] h-full flex opacity-55 animate-cloud-drift-right">
          <svg
            className="w-1/2 h-full shrink-0"
            viewBox="0 0 1200 140"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="footerMistR" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="55%" stopColor="#eef3fa" stopOpacity="0.52" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,80 Q240,28 520,76 T1040,58 Q1140,42 1200,72 L1200,140 L0,140 Z"
              fill="url(#footerMistR)"
            />
          </svg>
          <svg
            className="w-1/2 h-full shrink-0"
            viewBox="0 0 1200 140"
            preserveAspectRatio="none"
          >
            <path
              d="M0,80 Q240,28 520,76 T1040,58 Q1140,42 1200,72 L1200,140 L0,140 Z"
              fill="url(#footerMistR)"
            />
          </svg>
        </div>
      </div>

      {/* Subtle Ambient Mist Glow Above Peaks */}
      <div
        className="absolute inset-x-0 top-0 h-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,0) 100%)",
        }}
      />

      {/* Seamless Bottom Blend Into Deep Midnight Slate-Navy Footer (#142136) */}
      <div
        className="absolute inset-x-0 bottom-0 h-20 sm:h-28 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, #142136 0%, #142136 22%, rgba(20,33,54,0.85) 48%, rgba(20,33,54,0) 100%)",
        }}
      />
    </div>
  );
}
