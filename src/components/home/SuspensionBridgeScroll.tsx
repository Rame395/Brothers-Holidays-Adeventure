"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export default function SuspensionBridgeScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgImgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bgImg = bgImgRef.current;
    const text = textRef.current;
    if (!section || !bgImg) return;

    let ticking = false;
    let isVisible = false;

    const onScroll = () => {
      if (!isVisible || ticking) return;

      window.requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const windowH = window.innerHeight;

        // Progress 0 (entering from bottom) to 1 (leaving from top)
        const total = windowH + rect.height;
        const current = windowH - rect.top;
        const p = Math.min(1, Math.max(0, current / total));

        // Smooth subtle parallax and scale
        const scale = 1.03 + p * 0.08;
        const translateY = (p - 0.5) * 80;
        bgImg.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;

        // Subtle text parallax
        if (text) {
          const textShift = (p - 0.5) * -35;
          text.style.transform = `translate3d(0, ${textShift.toFixed(1)}px, 0)`;
        }

        ticking = false;
      });

      ticking = true;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? false;
        if (isVisible) onScroll();
      },
      { threshold: 0.05 }
    );

    observer.observe(section);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="the-crossing"
      className="relative w-full overflow-hidden bg-white text-white h-[52vw] min-h-[460px] max-h-[720px] flex items-center justify-center content-auto select-none"
    >
      {/* ────────── BACKGROUND PARALLAX IMAGE ────────── */}
      <div
        ref={bgImgRef}
        aria-hidden="true"
        className="absolute -top-[15%] left-0 w-full h-[130%] z-0 pointer-events-none will-change-transform"
      >
        <Image
          src="/images/himalaya-suspension-bridge-trekkers.jpg"
          alt="Trekkers crossing high Himalayan suspension bridge with snow-capped peaks"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority={false}
        />

        {/* Soft cinematic vignette to enhance text contrast and focus on mountains */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/45" />
      </div>

      {/* ────────── SEAMLESS TOP & BOTTOM WHITE FOG MASKS ────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 inset-x-0 h-24 sm:h-36 z-10"
        style={{
          background:
            "linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,0.75) 30%, rgba(255,255,255,0.2) 70%, transparent 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 inset-x-0 h-28 sm:h-44 z-10"
        style={{
          background:
            "linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0.85) 35%, rgba(255,255,255,0.25) 75%, transparent 100%)",
        }}
      />

      {/* ────────── CENTERED EDITORIAL HEADLINE ────────── */}
      <div
        ref={textRef}
        className="relative z-20 max-w-5xl mx-auto px-6 text-center space-y-3.5 will-change-transform"
      >
        <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl text-white font-extrabold uppercase tracking-wider leading-tight drop-shadow-[0_4px_28px_rgba(0,0,0,0.85)]">
          “WELCOMES YOU TO THE MOUNTAINS”
        </h2>

        <p className="font-sans text-xs sm:text-sm lg:text-base text-white/95 font-medium tracking-wide max-w-xl mx-auto leading-relaxed drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
          Where the valley falls away, and the true Himalayan trail begins.
        </p>
      </div>
    </section>
  );
}
