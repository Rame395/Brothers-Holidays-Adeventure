"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  DollarSign,
  Globe,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

interface Pillar {
  icon: typeof Users;
  title: string;
  description: string;
}

const PILLARS: Pillar[] = [
  {
    icon: Users,
    title: "Local Sherpa Expertise",
    description:
      "Born and raised in the Himalayas. Our Sherpa guides know every trail, every peak, every hidden gem.",
  },
  {
    icon: Shield,
    title: "Safety First Approach",
    description:
      "Certified guides, backup systems, emergency protocols. We prepare for everything so you can focus on the journey.",
  },
  {
    icon: Sparkles,
    title: "Personalized Trips",
    description:
      "No cookie-cutter itineraries. Every expedition is tailored to your pace, goals, and experience level.",
  },
  {
    icon: Globe,
    title: "Cultural Experience",
    description:
      "Authentic village stays, monastery visits, local cuisine. Experience the real Himalayan culture, not tourist traps.",
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description:
      "No hidden fees, no surprises. Clear breakdown of costs upfront. What you see is what you pay.",
  },
  {
    icon: Shield,
    title: "Leadership",
    description:
      "You are led by some of the most respected and accomplished mountaineers in the world.",
  },
];

export default function WhyChooseUs() {
  const containerRef = useRef<HTMLElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. SILKY-SMOOTH PARALLAX SCROLL: Text scrolls faster than background mountain image
  useEffect(() => {
    const container = containerRef.current;
    const bg = bgRef.current;
    const content = contentRef.current;
    if (!container || !bg) return;

    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = container.getBoundingClientRect();
          const windowH = window.innerHeight;

          // Only calculate when near or within viewport
          if (rect.bottom > -150 && rect.top < windowH + 150) {
            // Normalized progress from 0 (section enters viewport) to 1 (section leaves viewport)
            const progress = (windowH - rect.top) / (windowH + rect.height);

            // Background mountain travels slowly in scroll direction (anchored slow-parallax feel)
            const bgShift = (progress - 0.5) * 150;
            bg.style.transform = `translate3d(0, ${bgShift.toFixed(2)}px, 0)`;

            // Foreground text moves faster upwards, creating the fast-scroll speed contrast
            if (content) {
              const contentShift = (progress - 0.5) * -90;
              content.style.transform = `translate3d(0, ${contentShift.toFixed(2)}px, 0)`;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // 2. High-performance, lightweight snow/mist particle system (0% CPU when offscreen)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId = 0;
    let isVisible = false;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Pre-render a single 16x16 glowing snow sprite once (avoids per-frame ctx.shadowBlur Gaussian cost)
    const flakeCanvas = document.createElement("canvas");
    flakeCanvas.width = 16;
    flakeCanvas.height = 16;
    const fCtx = flakeCanvas.getContext("2d");
    if (fCtx) {
      const grad = fCtx.createRadialGradient(8, 8, 0.5, 8, 8, 8);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.45, "rgba(255, 255, 255, 0.7)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
      fCtx.fillStyle = grad;
      fCtx.fillRect(0, 0, 16, 16);
    }

    // 38 high-altitude snow & mist crystal particles
    const particleCount = 38;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 0.9,
      speedY: Math.random() * 1.0 + 0.8,
      speedX: Math.random() * 0.8 - 0.4,
      opacity: Math.random() * 0.55 + 0.3,
      swayOffset: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.03 + 0.015,
    }));

    let tick = 0;
    let lastTime = 0;
    const render = (now: number) => {
      if (!isVisible) return;
      if (lastTime !== 0 && now - lastTime < 33) {
        animId = requestAnimationFrame(render);
        return;
      }
      const dtFactor = lastTime === 0 ? 1 : Math.min((now - lastTime) / 16.67, 3);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      tick += dtFactor;
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.y += p.speedY * dtFactor;
        p.x += (p.speedX + Math.sin(tick * p.swaySpeed + p.swayOffset) * 0.35) * dtFactor;

        // Wrap around boundaries smoothly
        if (p.y > height + 5) {
          p.y = -5;
          p.x = Math.random() * width;
        }
        if (p.x < -5) p.x = width + 5;
        if (p.x > width + 5) p.x = -5;

        // Draw pre-rendered soft glowing mist flake sprite
        const drawSize = p.radius * 4.5;
        ctx.globalAlpha = p.opacity;
        ctx.drawImage(
          flakeCanvas,
          p.x - drawSize * 0.5,
          p.y - drawSize * 0.5,
          drawSize,
          drawSize
        );
      }
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(render);
    };

    // Observer to pause canvas & CSS animations when scrolled away
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry?.isIntersecting ?? false;
        bgRef.current?.setAttribute("data-paused", isVisible ? "false" : "true");
        if (isVisible) {
          lastTime = 0;
          cancelAnimationFrame(animId);
          animId = requestAnimationFrame(render);
        } else {
          cancelAnimationFrame(animId);
        }
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      id="why-choose-us"
      className="relative w-full overflow-hidden py-24 sm:py-32 lg:py-40 bg-white text-[#1c1917]"
    >
      {/* ────────── PARALLAX BACKGROUND LAYER (Oversized for smooth travel) ────────── */}
      <div
        ref={bgRef}
        data-paused="true"
        aria-hidden="true"
        className="absolute -top-[20%] left-0 w-full h-[140%] z-0 pointer-events-none overflow-hidden will-change-transform"
      >
        {/* User's uploaded mountain photo */}
        <div className="absolute inset-0 w-full h-full animate-mountain-breathe">
          <Image
            src="/images/why-us-mountain.jpg"
            alt="Majestic Himalayan snow peaks of Everest and Nuptse"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority={false}
          />
        </div>

        {/* Soft atmospheric white wash so mountain detail breathes while keeping text 100% readable */}
        <div className="absolute inset-0 bg-white/60 sm:bg-white/55" />

        {/* DRIFTING CLOUD LAYER 1: Deep slow horizontal drift across the peaks */}
        <div className="absolute inset-x-0 top-1/4 h-64 sm:h-80 w-[200%] flex opacity-50 animate-cloud-drift-left">
          <svg
            className="w-1/2 h-full shrink-0"
            viewBox="0 0 1200 320"
            preserveAspectRatio="none"
          >
            <path
              d="M0,180 Q250,90 500,160 T1000,140 Q1150,110 1200,150 L1200,320 L0,320 Z"
              fill="url(#cloudGrad1)"
            />
            <defs>
              <linearGradient id="cloudGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>
          <svg
            className="w-1/2 h-full shrink-0"
            viewBox="0 0 1200 320"
            preserveAspectRatio="none"
          >
            <path
              d="M0,180 Q250,90 500,160 T1000,140 Q1150,110 1200,150 L1200,320 L0,320 Z"
              fill="url(#cloudGrad1b)"
            />
            <defs>
              <linearGradient id="cloudGrad1b" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* DRIFTING CLOUD LAYER 2: Foreground counter-drift across lower mountain face */}
        <div className="absolute inset-x-0 bottom-0 h-72 sm:h-96 w-[200%] flex opacity-65 animate-cloud-drift-right">
          <svg
            className="w-1/2 h-full shrink-0"
            viewBox="0 0 1200 360"
            preserveAspectRatio="none"
          >
            <path
              d="M0,160 Q300,60 620,140 T1100,110 Q1180,80 1200,120 L1200,360 L0,360 Z"
              fill="url(#cloudGrad2)"
            />
            <defs>
              <linearGradient id="cloudGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="40%" stopColor="#ffffff" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
              </linearGradient>
            </defs>
          </svg>
          <svg
            className="w-1/2 h-full shrink-0"
            viewBox="0 0 1200 360"
            preserveAspectRatio="none"
          >
            <path
              d="M0,160 Q300,60 620,140 T1100,110 Q1180,80 1200,120 L1200,360 L0,360 Z"
              fill="url(#cloudGrad2b)"
            />
            <defs>
              <linearGradient id="cloudGrad2b" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="40%" stopColor="#ffffff" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* LIVE HIGH-ALTITUDE SNOW / MIST PARTICLE CANVAS */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />
      </div>

      {/* PINNED GRADIENT MASKS (Stay at fixed section edges for seamless transition) */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 w-full h-[32%] pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,0.96) 30%, rgba(255,255,255,0.6) 65%, transparent 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-full h-[32%] pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0.96) 35%, rgba(255,255,255,0.55) 70%, transparent 100%)",
        }}
      />

      {/* ────────── FOREGROUND CONTENT (PARALLAX TEXT SCROLLING FASTER THAN BG) ────────── */}
      <div
        ref={contentRef}
        className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 will-change-transform"
      >
        {/* SECTION HEADER (BLACK/CHARCOAL TYPOGRAPHY — NO BLUE AS REQUESTED) */}
        <div className="text-center max-w-4xl mx-auto mb-14 sm:mb-16 lg:mb-20 space-y-3">
          <div className="inline-flex items-center justify-center gap-2.5 mb-1">
            <span className="w-6 h-[2px] bg-[#f05e25]" />
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#57534d] uppercase">
              The Brothers Difference
            </span>
            <span className="w-6 h-[2px] bg-[#f05e25]" />
          </div>

          <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-[#1c1917] tracking-tight leading-tight uppercase">
            Why Choose Us
          </h2>

          <p className="font-sans text-[#57534d] text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Built on deep Sherpa heritage, uncompromising safety standards, and
            personalized care to deliver an unforgettable journey in the Himalayas.
          </p>
        </div>

        {/* 6-PILLAR FROSTED GLASS CARDS (CLEAN LIGHT CANVAS, BLACK TITLES, BALANCED STONE BODY) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="group relative rounded-[20px] bg-white/92 hover:bg-white p-6 sm:p-8 border border-white/80 hover:border-stone-200/90 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_32px_-8px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
              >
                {/* Refined squircle badge with dark icon and orange hover */}
                <div className="w-14 h-14 rounded-2xl bg-stone-100/90 text-[#1c1917] group-hover:bg-[#f05e25] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs mb-5">
                  <Icon className="w-6 h-6 stroke-[2] transition-transform duration-300 group-hover:scale-110" />
                </div>

                {/* Pillar Title in crisp dark typography */}
                <h3 className="font-heading font-bold text-base sm:text-lg text-[#1c1917] uppercase tracking-[0.12em] group-hover:text-[#f05e25] transition-colors duration-200">
                  {pillar.title}
                </h3>

                {/* Subtle accent line under title */}
                <span className="w-6 group-hover:w-10 h-[2px] bg-[#f05e25]/30 group-hover:bg-[#f05e25] transition-all duration-300 my-3 rounded-full" />

                {/* Pillar Description in balanced, readable stone-600 */}
                <p className="font-sans text-[#57534d] leading-relaxed text-xs sm:text-sm max-w-xs mt-1">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
