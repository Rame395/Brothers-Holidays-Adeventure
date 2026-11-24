"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";

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

  const [inView, setInView] = useState(true);
  const [scene, setScene] = useState(false);
  const [videoAllowed, setVideoAllowed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    heroState.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let idleHandle: number | null = null;
    let timerHandle: ReturnType<typeof setTimeout> | null = null;

    const checkViewport = () => {
      const isDesktop =
        window.innerWidth >= 1024 &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const webglAvailable = isDesktop && hasWebGL();
      setScene(webglAvailable);
      // Avoid running a 13.7 MB HD video underneath the active 3D WebGL scene; fall back to video only if WebGL is unavailable
      setVideoAllowed(isDesktop && !webglAvailable);
    };

    const winWithIdle = window as Window & {
      requestIdleCallback?: (
        cb: () => void,
        opts?: { timeout: number }
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof winWithIdle.requestIdleCallback === "function") {
      idleHandle = winWithIdle.requestIdleCallback(checkViewport, {
        timeout: 650,
      });
    } else {
      timerHandle = globalThis.setTimeout(checkViewport, 350);
    }

    const el = sectionRef.current;
    if (!el) return;

    let raf = 0;
    let running = false;
    let isDesktop = window.innerWidth >= 1024;
    let lastWidth = window.innerWidth;
    let cachedTotal = 0;
    const sm = { x: 0, y: 0, p: 0 };
    let lastDrawnP = -1;

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

      el.style.setProperty("--p", sm.p.toFixed(4));
      el.style.setProperty("--mx", sm.x.toFixed(4));
      el.style.setProperty("--my", sm.y.toFixed(4));

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
      isDesktop = window.innerWidth >= 1024;
      if (isDesktop) {
        cachedTotal = Math.max(0, el.offsetHeight - window.innerHeight);
        const top = -el.getBoundingClientRect().top;
        heroState.progress = Math.min(
          1,
          Math.max(0, cachedTotal > 0 ? top / cachedTotal : 0)
        );
        wake();
      } else {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
        running = false;
        sm.x = 0;
        sm.y = 0;
        sm.p = 0;
        lastDrawnP = -1;
        heroState.mouseX = 0;
        heroState.mouseY = 0;
        heroState.progress = 0;
        el.style.setProperty("--p", "0");
        el.style.setProperty("--mx", "0");
        el.style.setProperty("--my", "0");
      }
    };

    const onScroll = () => {
      if (!isDesktop) return;
      const top = -el.getBoundingClientRect().top;
      heroState.progress = Math.min(
        1,
        Math.max(0, cachedTotal > 0 ? top / cachedTotal : 0)
      );
      wake();
    };

    const onMove = (e: PointerEvent) => {
      if (!isDesktop || e.pointerType === "touch") return;
      heroState.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      heroState.mouseY = -((e.clientY / window.innerHeight) * 2 - 1);
      wake();
    };

    const onResize = () => {
      const widthChanged = window.innerWidth !== lastWidth;
      lastWidth = window.innerWidth;
      // Ignore mobile browser URL-bar show/hide height-only resizes mid-scroll
      if (!widthChanged && !isDesktop) return;
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
        if (visible && isDesktop) wake();
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
      if (
        idleHandle !== null &&
        typeof winWithIdle.cancelIdleCallback === "function"
      ) {
        winWithIdle.cancelIdleCallback(idleHandle);
      }
      if (timerHandle !== null) globalThis.clearTimeout(timerHandle);
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
      className="relative h-svh lg:h-[135vh] bg-[#081318] text-white"
      style={{
        "--p": 0,
        "--mx": 0,
        "--my": 0,
      } as CSSProperties}
    >
      <div
        id="top"
        className="relative lg:sticky lg:top-0 h-svh w-full overflow-hidden"
      >
        {/* 1 — Crisp High-Priority Himalayan Poster + Deferred Desktop Aerial Footage */}
        <div
          className="absolute inset-0 lg:will-change-transform"
          style={{
            transform:
              "translate3d(calc(var(--mx) * -14px), calc(var(--my) * 10px), 0) scale(calc(1.06 + var(--p) * 0.35))",
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

        {/* Clean gradient darkening + subtle bottom-left scrim so headline stays razor-crisp over bright valley mist */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#081318]/70 via-[#081318]/15 to-[#081318]/85"
          style={{ opacity: "calc(0.85 + var(--p) * 0.15)" }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 55% at 22% 72%, rgba(8, 19, 24, 0.72), transparent 72%)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#081318]/95 via-[#081318]/55 to-transparent lg:hidden" />

        {/* 3 — Live 3D Himalayan Range & Cloud Sea (pauses when scrolled out of view) */}
        {scene && (
          <div
            data-scene
            className="scene-layer pointer-events-none absolute inset-0"
          >
            <HeroScene active={inView} />
          </div>
        )}

        {/* Legibility Vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 48%, rgba(8, 19, 24, 0.58) 100%)",
          }}
        />

        {/* Localized Dark Scrim Above 3D Scene for Left Editorial Text Contrast */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[5]"
          style={{
            background:
              "radial-gradient(ellipse 58% 52% at 20% 74%, rgba(10, 15, 20, 0.62) 0%, rgba(10, 15, 20, 0.28) 52%, transparent 78%)",
          }}
        />

        {/* 4 — Foreground Editorial Interface */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end px-6 sm:px-8 md:px-12 pb-[108px] sm:pb-28 lg:pb-[14vh]">
          <div
            className="pointer-events-auto mx-auto w-full max-w-[1440px]"
            style={{
              transform:
                "translate3d(calc(var(--mx) * 5px), calc(var(--p) * -20vh), 0)",
              opacity: "calc(1 - var(--p) * 3)",
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
                <a
                  href="#enquiry"
                  className="group inline-flex h-11 sm:h-12 w-full sm:w-auto items-center justify-center gap-1.5 sm:gap-2.5 bg-[#c89b4b] hover:bg-[#e5b96b] px-3 sm:px-7 text-[10.5px] sm:text-xs font-semibold uppercase tracking-[0.12em] sm:tracking-[0.18em] text-[#081318] transition-colors cursor-pointer rounded-[6px] shadow-lg whitespace-nowrap"
                >
                  <span>Plan a Trek</span>
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
                </a>
                <Link
                  href="/destinations"
                  className="group inline-flex h-11 sm:h-12 w-full sm:w-auto items-center justify-center gap-1.5 sm:gap-2 rounded-[6px] border border-white/35 bg-[#081318]/45 backdrop-blur-md px-3 sm:px-6 text-[10.5px] sm:text-xs font-medium uppercase tracking-[0.12em] sm:tracking-[0.18em] text-white shadow-md transition-colors hover:border-[#e5b96b] hover:bg-[#081318]/65 hover:text-[#e5b96b] cursor-pointer whitespace-nowrap"
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
          className="pointer-events-none absolute inset-0 z-10 hidden lg:flex flex-col items-center justify-center px-6 text-center select-none"
          style={{
            opacity: "min(1, max(0, calc((var(--p) - 0.22) * 3.5)))",
            transform: "scale(calc(0.92 + var(--p) * 0.16))",
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
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-6 pb-7 sm:pb-6 md:px-12"
          style={{ opacity: "calc(1 - var(--p) * 1.45)" }}
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

      {/* Seamless multi-layered Himalayan cloud-mist transition into Trekking Regions */}
      <div
        data-paused={inView ? "false" : "true"}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-px z-20 h-16 sm:h-24 lg:h-64 overflow-hidden"
      >
        {/* Multi-stop vertical atmospheric gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.08) 28%, rgba(255,255,255,0.38) 58%, rgba(255,255,255,0.82) 82%, #ffffff 100%)",
          }}
        />

        {/* Desktop drifting valley cloud ribbon */}
        <div className="hidden lg:flex absolute inset-x-0 bottom-4 h-40 w-[200%] opacity-55 animate-cloud-drift-left">
          <svg
            className="w-1/2 h-full shrink-0"
            viewBox="0 0 1200 240"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="heroExitMist" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.92" />
              </linearGradient>
            </defs>
            <path
              d="M0,125 Q240,45 480,115 T960,95 Q1120,70 1200,110 L1200,240 L0,240 Z"
              fill="url(#heroExitMist)"
            />
          </svg>
          <svg
            className="w-1/2 h-full shrink-0"
            viewBox="0 0 1200 240"
            preserveAspectRatio="none"
          >
            <path
              d="M0,125 Q240,45 480,115 T960,95 Q1120,70 1200,110 L1200,240 L0,240 Z"
              fill="url(#heroExitMist)"
            />
          </svg>
        </div>

        {/* Layered static organic mist ridges anchored to bottom edge */}
        <svg
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 w-full h-14 sm:h-20 lg:h-32"
        >
          <path
            d="M0,78 C240,22 440,120 720,68 C980,20 1210,112 1440,56 L1440,160 L0,160 Z"
            fill="#ffffff"
            fillOpacity="0.2"
          />
          <path
            d="M0,104 C280,58 520,136 820,88 C1080,46 1270,124 1440,86 L1440,160 L0,160 Z"
            fill="#ffffff"
            fillOpacity="0.48"
          />
          <path
            d="M0,128 C340,94 600,148 920,114 C1180,86 1330,138 1440,118 L1440,160 L0,160 Z"
            fill="#ffffff"
            fillOpacity="1"
          />
        </svg>
      </div>
    </section>
  );
}
