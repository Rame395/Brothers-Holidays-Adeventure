"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { altitudeFor, heroState } from "./heroStore";
import TopographicSurveyProfile from "@/components/home/TopographicSurveyProfile";

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
  const altRef = useRef<HTMLSpanElement>(null);
  const meterRef = useRef<HTMLSpanElement>(null);
  const surveyLayerRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState(false);
  const [surveyActive, setSurveyActive] = useState(false);

  useEffect(() => {
    heroState.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setScene(hasWebGL());
    const el = sectionRef.current;
    if (!el) return;

    let raf = 0;
    const sm = { x: 0, y: 0 };
    let last = -1;

    const onScroll = () => {
      const total = el.offsetHeight - window.innerHeight;
      const top = -el.getBoundingClientRect().top;
      heroState.progress = Math.min(1, Math.max(0, total > 0 ? top / total : 0));
    };
    const onMove = (e: PointerEvent) => {
      heroState.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      heroState.mouseY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const tick = () => {
      sm.x += (heroState.mouseX - sm.x) * 0.06;
      sm.y += (heroState.mouseY - sm.y) * 0.06;
      const p = heroState.progress;
      el.style.setProperty("--p", p.toFixed(4));
      el.style.setProperty("--mx", sm.x.toFixed(4));
      el.style.setProperty("--my", sm.y.toFixed(4));
      if (Math.abs(p - last) > 0.0005) {
        last = p;
        if (altRef.current)
          altRef.current.textContent = altitudeFor(p).toLocaleString("en-US");
        if (meterRef.current)
          meterRef.current.style.transform = `scaleX(${0.08 + p * 0.92})`;
      }

      if (p > 0.54) {
        setSurveyActive(true);
        if (surveyLayerRef.current) surveyLayerRef.current.style.pointerEvents = "auto";
      } else {
        if (surveyLayerRef.current) surveyLayerRef.current.style.pointerEvents = "none";
      }

      raf = requestAnimationFrame(tick);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative h-[185vh] bg-[#050c0e] text-white"
      style={{ "--p": 0, "--mx": 0, "--my": 0 } as CSSProperties}
    >
      <div id="top" className="sticky top-0 h-svh w-full overflow-hidden">
        {/* 1 — Photoreal Himalayan Flight Footage */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform:
              "translate3d(calc(var(--mx) * -18px), calc(var(--my) * 12px), 0) scale(calc(1.08 + var(--p) * 0.45))",
            filter: "blur(calc(var(--p) * 4px)) saturate(1.06) contrast(1.04)",
          }}
        >
          <video
            className="h-full w-full object-cover"
            src="/videos/himalaya-flight.mp4"
            poster="/images/himalaya-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          />
        </div>

        {/* Atmospheric grade over footage */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050c0e]/70 via-[#050c0e]/5 to-transparent" />
        <div
          className="animate-sun pointer-events-none absolute -left-[10%] -top-[20%] h-[80vh] w-[70vw] rounded-full mix-blend-screen"
          style={{
            background:
              "radial-gradient(closest-side, rgba(232, 183, 101, 0.45), transparent)",
          }}
        />

        {/* 2 — Giant wordmark, sitting *behind* the 3D ridges */}
        <div
          className="pointer-events-none absolute inset-x-0 top-[16vh] flex justify-center md:top-[11vh]"
          style={{
            transform:
              "translate3d(calc(var(--mx) * -8px), calc(var(--p) * -14vh), 0) scale(calc(1 + var(--p) * 0.5))",
            opacity: "calc(1 - var(--p) * 3.2)",
          }}
        >
          <h1
            className="animate-rise select-none font-display text-[18vw] font-light leading-none tracking-[0.04em] md:tracking-[0.06em] text-white/90 md:text-[17vw]"
            style={{
              animationDelay: "0.05s",
              textShadow: "0 20px 80px rgba(0, 0, 0, 0.6)",
            }}
          >
            KHARKA
          </h1>
        </div>

        {/* 3 — Live 3D ridges, clouds, ice crystals */}
        {scene && (
          <div
            data-scene
            className="scene-layer pointer-events-none absolute inset-0"
          >
            <HeroScene />
          </div>
        )}

        {/* Lens + Vignette + Grain */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050c0e]/85 via-[#050c0e]/10 to-transparent" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 45%, rgba(5, 12, 14, 0.6) 100%)",
          }}
        />
        <div className="grain pointer-events-none absolute -inset-[10%] opacity-[0.07] mix-blend-overlay" />

        {/* 4 — Foreground interface */}
        <div
          className="absolute inset-x-0 bottom-[14vh] z-10 px-6 md:bottom-[15vh] md:px-12"
          style={{
            transform:
              "translate3d(calc(var(--mx) * 6px), calc(var(--p) * -22vh), 0)",
            opacity: "calc(1 - var(--p) * 3)",
          }}
        >
          <div className="mx-auto flex max-w-[1600px] flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p
                className="animate-rise mb-6 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.4em] text-[#e8b765]"
                style={{ animationDelay: "0.1s" }}
              >
                <span className="h-px w-10 bg-[#e8b765]" /> Private Himalayan
                Expeditions
              </p>
              <h2
                className="animate-rise font-display text-5xl font-light leading-[0.95] text-white md:text-6xl xl:text-7xl"
                style={{ animationDelay: "0.15s" }}
              >
                Rise <em className="text-gold-gradient font-normal">above</em>
                <br />
                the world.
              </h2>
              <p
                className="animate-rise mt-6 max-w-md text-sm leading-relaxed text-white/75 md:text-base font-light"
                style={{ animationDelay: "0.2s" }}
              >
                Sherpa-led ascents and high-pasture journeys for a few travellers
                at a time — crafted for those who seek the summit, and the
                silence.
              </p>
              <div
                className="animate-rise mt-9 flex flex-wrap items-center gap-6"
                style={{ animationDelay: "0.25s" }}
              >
                <a
                  href="#enquiry"
                  className="group inline-flex items-center gap-4 bg-gold-gradient px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#050c0e] shadow-[0_20px_50px_-20px_rgba(232,183,101,0.6)] transition-transform duration-500 hover:-translate-y-0.5 cursor-pointer rounded-sm"
                >
                  Begin your expedition
                  <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 text-[#050c0e]" />
                </a>
                <Link
                  href="/treks"
                  className="group inline-flex items-center gap-2 border-b border-white/40 pb-1 text-[11px] font-medium uppercase tracking-[0.3em] text-white transition-colors hover:border-[#e8b765] hover:text-[#e8b765] cursor-pointer"
                >
                  View the routes <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Floating expedition card */}
            <div
              className="animate-rise hidden lg:block"
              style={{
                animationDelay: "0.3s",
                transform:
                  "translate3d(calc(var(--mx) * -14px), calc(var(--my) * 8px), 0)",
              }}
            >
              <div className="glass animate-drift-float w-80 p-6 rounded-md border border-white/15">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/60">
                  <span>Featured ascent</span>
                  <span className="flex items-center gap-2 text-[#e8b765]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e8b765]" />{" "}
                    Spring
                  </span>
                </div>
                <p className="mt-5 font-display text-3xl font-light text-white">
                  Ama Dablam
                </p>
                <p className="mt-1 text-xs tracking-wide text-white/60">
                  Khumbu, Nepal · Southwest Ridge
                </p>
                <div className="my-5 h-px bg-gradient-to-r from-[#e8b765]/70 to-transparent" />
                <dl className="grid grid-cols-3 gap-3 text-white">
                  <div>
                    <dt className="text-[9px] uppercase tracking-[0.25em] text-white/50">
                      Summit
                    </dt>
                    <dd className="mt-1 font-display text-xl text-white">6,812 m</dd>
                  </div>
                  <div>
                    <dt className="text-[9px] uppercase tracking-[0.25em] text-white/50">
                      Days
                    </dt>
                    <dd className="mt-1 font-display text-xl text-white">28</dd>
                  </div>
                  <div>
                    <dt className="text-[9px] uppercase tracking-[0.25em] text-white/50">
                      Group
                    </dt>
                    <dd className="mt-1 font-display text-xl text-white">≤ 6</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Mid-flight phrase: on second scroll */}
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6 text-center"
          style={{
            opacity:
              "min(calc((var(--p) - 0.2) * 7), calc((0.68 - var(--p)) * 7))",
          }}
        >
          <p
            className="font-display text-4xl font-light italic text-white md:text-7xl"
            style={{
              transform: "scale(calc(0.9 + var(--p) * 0.25))",
              letterSpacing: "calc(0.01em + var(--p) * 0.06em)",
              textShadow: "0 10px 40px rgba(0,0,0,0.8)",
            }}
          >
            Welcome to the mountains
          </p>
        </div>

        {/* Bottom instrument bar */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 px-6 pb-7 md:px-12"
          style={{ opacity: "calc(1 - var(--p) * 2.5)" }}
        >
          <div className="mx-auto flex max-w-[1600px] items-end justify-between gap-6 border-t border-white/15 pt-5 text-[10px] uppercase tracking-[0.3em] text-white/60">
            <div className="flex items-center gap-4">
              <span className="relative block h-10 w-px overflow-hidden bg-white/20">
                <span className="animate-scroll-line absolute inset-0 bg-[#e8b765]" />
              </span>
              Scroll to ascend
            </div>
            <div className="hidden items-center gap-5 md:flex">
              <span>Altitude</span>
              <span className="relative block h-px w-40 bg-white/20">
                <span
                  ref={meterRef}
                  className="absolute inset-0 origin-left bg-[#e8b765]"
                  style={{ transform: "scaleX(0.08)" }}
                />
              </span>
              <span className="font-display text-base normal-case tracking-normal text-white">
                <span ref={altRef}>4,410</span> m
              </span>
            </div>
            <div className="text-right">
              <span className="block text-white/70">27°59′N · 86°55′E</span>
              <span className="mt-1 hidden text-white/40 sm:block">
                Seasons · Mar–May · Sep–Nov
              </span>
            </div>
          </div>
        </div>

        {/* 5 — The White Section: Topographic Survey Profile filling the white section immediately following 'Welcome to the mountains' */}
        <div
          ref={surveyLayerRef}
          className="absolute inset-0 z-20 bg-[#f8fafb] flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 pt-20 pb-8 transition-opacity duration-300"
          style={{
            opacity: "calc((var(--p) - 0.54) * 3.5)",
            pointerEvents: "none",
          }}
        >
          <div className="w-full max-w-6xl xl:max-w-7xl">
            <TopographicSurveyProfile active={surveyActive} />
          </div>
          {/* Bottom visual bridge connecting into Selected High Routes */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-[#003840]/20" />
        </div>
      </div>
    </section>
  );
}
