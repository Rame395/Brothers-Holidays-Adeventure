"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { altitudeFor, heroState } from "./heroStore";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function Hero() {

  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const altRef = useRef<HTMLSpanElement>(null);
  const meterRef = useRef<HTMLSpanElement>(null);

  const bgWrapRef = useRef<HTMLDivElement>(null);
  const topScrimRef = useRef<HTMLDivElement>(null);
  const bottomScrimRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const telemetryRef = useRef<HTMLDivElement>(null);

  const [inView, setInView] = useState(true);
  const [scene, setScene] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [videoAllowed, setVideoAllowed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const handleSceneReady = useCallback(() => setSceneReady(true), []);

  useEffect(() => {
    heroState.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const checkViewport = () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const isDesktop = window.innerWidth >= 1024;
      setIsCompact(window.innerWidth < 768);
      const webglAvailable = !reduced && hasWebGL();
      setScene(webglAvailable);
      // Avoid running a 13.7 MB HD video underneath the active 3D WebGL scene; fall back to video only if WebGL is unavailable
      setVideoAllowed(isDesktop && !reduced && !webglAvailable);
    };

    checkViewport();

    const el = sectionRef.current;
    if (!el) return;

    let raf = 0;
    let running = false;
    let lastWidth = window.innerWidth;
    let cachedTotal = 0;
    let cachedOffsetTop = 0;
    let isCompactViewport = window.innerWidth < 768;
    const sm = { x: 0, y: 0, p: 0 };
    let lastDrawnP = -1;

    const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

    const applyVisuals = (mx: number, my: number, p: number) => {
      if (bgWrapRef.current && !isCompactViewport) {
        bgWrapRef.current.style.transform = `translate3d(${(mx * -14).toFixed(2)}px, ${(my * 10).toFixed(2)}px, 0) scale(${(1.06 + p * 0.35).toFixed(4)})`;
      }
      if (topScrimRef.current) {
        topScrimRef.current.style.opacity = clamp01(0.85 + p * 0.15).toFixed(4);
      }
      if (bottomScrimRef.current) {
        bottomScrimRef.current.style.opacity = clamp01(1 - p * 1.45).toFixed(4);
      }
      if (heroTextRef.current) {
        heroTextRef.current.style.transform = `translate3d(${(mx * 5).toFixed(2)}px, ${(p * -20).toFixed(3)}vh, 0)`;
        heroTextRef.current.style.opacity = clamp01(1 - p * 3).toFixed(4);
      }
      if (brandRef.current) {
        brandRef.current.style.opacity = clamp01((p - 0.22) * 3.5).toFixed(4);
        brandRef.current.style.transform = `scale(${(0.92 + p * 0.16).toFixed(4)})`;
      }
      if (telemetryRef.current) {
        telemetryRef.current.style.opacity = clamp01(1 - p * 1.45).toFixed(4);
      }
    };

    const tick = () => {
      if (!heroState.inView) {
        running = false;
        raf = 0;
        return;
      }

      const dmx = heroState.mouseX - sm.x;
      const dmy = heroState.mouseY - sm.y;
      const dp = heroState.progress - sm.p;

      sm.x += dmx * 0.08;
      sm.y += dmy * 0.08;
      sm.p += dp * 0.16;

      applyVisuals(sm.x, sm.y, sm.p);

      if (Math.abs(sm.p - lastDrawnP) > 0.0005) {
        lastDrawnP = sm.p;
        if (altRef.current) {
          altRef.current.textContent = altitudeFor(sm.p).toLocaleString("en-US");
        }
        if (meterRef.current) {
          meterRef.current.style.transform = `scaleX(${0.08 + sm.p * 0.92})`;
        }
      }

      const settled =
        Math.abs(dmx) < 0.0003 &&
        Math.abs(dmy) < 0.0003 &&
        Math.abs(dp) < 0.0002;

      if (settled) {
        running = false;
        raf = 0;
        return;
      }

      raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!running && heroState.inView) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    const syncMetrics = () => {
      isCompactViewport = window.innerWidth < 768;
      cachedTotal = Math.max(0, el.offsetHeight - window.innerHeight);
      cachedOffsetTop = el.offsetTop;
      const top = window.scrollY - cachedOffsetTop;
      heroState.progress = Math.min(
        1,
        Math.max(0, cachedTotal > 0 ? top / cachedTotal : 0)
      );
      applyVisuals(sm.x, sm.y, sm.p);
      wake();
    };

    const onScroll = () => {
      const top = window.scrollY - cachedOffsetTop;
      heroState.progress = Math.min(
        1,
        Math.max(0, cachedTotal > 0 ? top / cachedTotal : 0)
      );
      wake();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      heroState.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      heroState.mouseY = -((e.clientY / window.innerHeight) * 2 - 1);
      wake();
    };

    const onResize = () => {
      const widthChanged = window.innerWidth !== lastWidth;
      lastWidth = window.innerWidth;
      // Ignore mobile browser URL-bar show/hide height-only resizes mid-scroll
      if (!widthChanged && window.innerWidth < 1024) return;
      syncMetrics();
      if (widthChanged) {
        checkViewport();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        heroState.inView = visible;
        setInView(visible);
        if (visible) wake();
      },
      { rootMargin: "0px" }
    );
    observer.observe(el);

    syncMetrics();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !videoAllowed) return;
    if (inView) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [inView, videoAllowed]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative h-[135svh] lg:h-[135vh] bg-[#081318] text-white"
    >
      <div
        id="top"
        className="sticky top-0 h-svh w-full overflow-hidden"
      >
        {/* 1 — Crisp High-Priority Himalayan Mountains Behind Transparent 3D Scene */}
        <div
          ref={bgWrapRef}
          className="absolute inset-0 lg:will-change-transform"
          style={{
            transform: "translate3d(0px, 0px, 0) scale(1.06)",
          }}
        >
          <Image
            src="/images/himalaya-poster.jpg"
            alt="High Himalayan peaks under early light in Nepal"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {videoAllowed && (
            <video
              ref={videoRef}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                videoReady ? "opacity-100" : "opacity-0"
              }`}
              src="/videos/himalaya-flight.mp4"
              preload="none"
              autoPlay
              muted
              loop
              playsInline
              onCanPlay={() => setVideoReady(true)}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Consolidated background gradient + bottom-left scrim behind 3D scene */}
        <div
          ref={topScrimRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: 0.85,
            backgroundImage:
              "radial-gradient(ellipse 60% 55% at 22% 72%, rgba(8, 19, 24, 0.72), transparent 72%), linear-gradient(to bottom, rgba(8, 19, 24, 0.7), rgba(8, 19, 24, 0.15) 50%, rgba(8, 19, 24, 0.85))",
          }}
        />

        {/* 3 — Live 3D Himalayan Range & Cloud Sea (pauses when scrolled out of view) */}
        {scene && (
          <div
            data-scene
            className={`pointer-events-none absolute inset-0 transition-opacity duration-200 ${
              sceneReady ? "opacity-100" : "opacity-0"
            }`}
          >
            <HeroScene
              active={inView}
              compact={isCompact}
              onReady={handleSceneReady}
            />
          </div>
        )}

        {/* Consolidated Legibility Vignette + Localized Editorial Scrim Above 3D Scene */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[5]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 62% 56% at 20% 74%, rgba(8, 15, 24, 0.72) 0%, rgba(8, 15, 24, 0.34) 52%, transparent 78%), radial-gradient(ellipse at center, transparent 48%, rgba(8, 19, 24, 0.58) 100%)",
          }}
        />
        <div
          ref={bottomScrimRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 z-[5] bg-gradient-to-t from-[#081318]/65 via-[#081318]/25 to-transparent"
          style={{ opacity: 1 }}
        />

        {/* 4 — Foreground Editorial Interface */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end px-6 sm:px-8 md:px-12 pb-[108px] sm:pb-28 lg:pb-[14vh]">
          <div
            ref={heroTextRef}
            className="pointer-events-auto mx-auto w-full max-w-[1440px] will-change-transform"
            style={{
              transform: "translate3d(0px, 0vh, 0)",
              opacity: 1,
            }}
          >
            <div className="max-w-3xl">
              <p
                className="animate-rise mb-3 sm:mb-4 flex items-center gap-2.5 sm:gap-3 font-sans text-[11px] sm:text-xs font-semibold uppercase tracking-[0.26em] sm:tracking-[0.3em] text-[#f3ca7e] drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
                style={{ animationDelay: "0.08s" }}
              >
                <span className="h-[1.5px] w-7 sm:w-9 shrink-0 bg-[#e5b96b]" />
                <span>Kathmandu-Based Mountain Outfitters</span>
              </p>

              {/* Single semantic H1 per page for strong SEO & crisp hierarchy */}
              <h1
                className="animate-rise font-serif text-[clamp(2rem,7.8vw,3.4rem)] sm:text-5xl lg:text-[60px] font-bold uppercase leading-[1.06] tracking-[0.02em] text-white [text-shadow:0_4px_28px_rgba(0,0,0,0.8)]"
                style={{ animationDelay: "0.14s" }}
              >
                Walk the high passes of
                <br />
                <span className="text-[#f05e25]">the Himalayas.</span>
              </h1>

              <div
                className="animate-rise mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-5 max-w-md sm:max-w-none"
                style={{ animationDelay: "0.2s" }}
              >
                <Link
                  href="/contact"
                  className="group inline-flex h-11 sm:h-12 w-full sm:w-auto items-center justify-center gap-1.5 sm:gap-2.5 bg-[#c89b4b] hover:bg-[#e5b96b] px-3 sm:px-7 text-[10.5px] sm:text-xs font-semibold uppercase tracking-[0.12em] sm:tracking-[0.18em] text-[#081318] transition-colors cursor-pointer rounded-[6px] shadow-lg whitespace-nowrap"
                >
                  <span>Plan a Trek</span>
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/destinations"
                  className="group inline-flex h-11 sm:h-12 w-full sm:w-auto items-center justify-center gap-1.5 sm:gap-2 rounded-[6px] border border-white/35 bg-[#081318]/72 lg:bg-[#081318]/45 lg:backdrop-blur-md px-3 sm:px-6 text-[10.5px] sm:text-xs font-medium uppercase tracking-[0.12em] sm:tracking-[0.18em] text-white shadow-md transition-colors hover:border-[#e5b96b] hover:bg-[#081318]/65 hover:text-[#e5b96b] cursor-pointer whitespace-nowrap"
                >
                  <span>Browse Routes</span>
                  <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mid-flight scroll brand showcase (replaces "Above the treeline...") */}
        <div
          ref={brandRef}
          className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center select-none will-change-transform"
          style={{
            opacity: 0,
            transform: "scale(0.92)",
          }}
        >
          <div className="relative mb-3 h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32 drop-shadow-[0_12px_40px_rgba(0,0,0,0.85)]">
            <Image
              src="/images/brothers_holidays_adventure_logo_8k.png"
              alt="Brothers Holidays Adventure Logo"
              fill
              sizes="(max-width: 768px) 112px, 128px"
              className="object-contain"
            />
          </div>
          <h2
            className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-[0.12em] text-white"
            style={{
              textShadow: "0 8px 32px rgba(0,0,0,0.9), 0 2px 10px rgba(0,0,0,0.95)",
            }}
          >
            Brothers Holidays Adventure
          </h2>
          <div className="mt-2.5 flex items-center gap-3">
            <span className="h-px w-5 sm:w-16 shrink-0 bg-gradient-to-r from-transparent to-[#7dd3fc]" />
            <p className="text-[10px] sm:text-sm font-sans uppercase tracking-[0.18em] sm:tracking-[0.3em] text-[#7dd3fc] font-medium drop-shadow-md">
              Himalayan Expeditions & High Passes · Nepal
            </p>
            <span className="h-px w-5 sm:w-16 shrink-0 bg-gradient-to-l from-transparent to-[#7dd3fc]" />
          </div>
        </div>

        {/* Bottom altitude & coordinates telemetry bar */}
        <div
          ref={telemetryRef}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-6 pb-7 sm:pb-6 md:px-12"
          style={{ opacity: 1 }}
        >
          <div className="mx-auto grid max-w-[1440px] grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-white/15 pt-3.5 text-[10px] uppercase tracking-[0.2em] text-white/70">
            <div className="hidden md:block" aria-hidden="true" />

            <div className="flex items-center justify-center gap-4 sm:gap-5 tabular-nums">
              <span>Elevation</span>
              <span className="relative block h-px w-24 sm:w-36 bg-white/20">
                <span
                  ref={meterRef}
                  className="absolute inset-0 origin-left bg-[#f05e25]"
                  style={{ transform: "scaleX(0.08)" }}
                />
              </span>
              <span className="font-serif text-base normal-case tracking-normal text-white">
                <span ref={altRef}>4,410</span> m
              </span>
            </div>

            <div className="hidden md:flex flex-col items-end text-right tabular-nums text-[10px] pr-16 lg:pr-20">
              <span className="block text-white/80">27°59′N · 86°55′E</span>
              <span className="mt-0.5 block text-white/50">
                Prime Seasons · Mar–May · Sep–Nov
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Soft bottom atmospheric fade into HeroCloudTransition */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-px z-20 h-20 sm:h-28 lg:h-36"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(237,242,247,0.28) 60%, rgba(237,242,247,0.65) 100%)",
        }}
      />
    </section>
  );
}
