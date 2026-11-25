"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

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

interface RegionCard {
  id: string;
  name: string;
  meta: string;
  description: string;
  image: string;
  href: string;
  trekCount?: number;
}

const REGION_CARDS: RegionCard[] = [
  {
    id: "everest",
    name: "Everest Region Trek",
    meta: "Up to 5,545 m · 12–18 Days",
    description:
      "Walk iconic Sherpa trails through Namche Bazaar and Tengboche to Kala Patthar and Everest Base Camp.",
    image: "/images/trips/everest.jpg",
    href: "/destinations?country=nepal&region=everest",
    trekCount: 8,
  },
  {
    id: "annapurna",
    name: "Annapurna Region Trek",
    meta: "Up to 5,416 m · 7–16 Days",
    description:
      "Cross dramatic Thorong La pass, lush rhododendron valleys, and glacial amphitheaters beneath Annapurna I.",
    image: "/images/trips/annapurna.jpg",
    href: "/destinations?country=nepal&region=annapurna",
    trekCount: 9,
  },
  {
    id: "kanchenjunga",
    name: "Kanchenjunga Region Trek",
    meta: "Up to 5,143 m · 18–22 Days",
    description:
      "Venture into Nepal's remote eastern wilderness to the North and South Base Camps of the world's third-highest peak.",
    image: "/images/trips/kanchenjunga.jpg",
    href: "/destinations?country=nepal&region=kanchenjunga",
    trekCount: 3,
  },
  {
    id: "langtang",
    name: "Langtang Region Trek",
    meta: "Up to 4,984 m · 7–12 Days",
    description:
      "Discover alpine yak pastures, sacred Gosainkunda lakes, and Tamang heritage valleys just north of Kathmandu.",
    image: "/images/trips/langtang.jpg",
    href: "/destinations?country=nepal&region=langtang",
    trekCount: 5,
  },
  {
    id: "manaslu",
    name: "Manaslu Region Trek",
    meta: "Up to 5,106 m · 14–16 Days",
    description:
      "Circle the eighth-highest peak via ancient Tibetan border villages and the exhilarating 5,106 m Larkya La pass.",
    image: "/images/trips/manaslu.jpg",
    href: "/destinations?country=nepal&region=manaslu",
    trekCount: 4,
  },
  {
    id: "mustang",
    name: "Mustang Region Trek",
    meta: "Up to 4,200 m · 10–14 Days",
    description:
      "Step into the rain-shadowed Forbidden Kingdom of Lo Manthang, red-ochre canyons, and centuries-old sky caves.",
    image: "/images/trips/mustang.jpg",
    href: "/destinations?country=nepal&region=mustang",
    trekCount: 4,
  },
];

export default function TrekkingRegions() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 20);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);

    // Approximate active card index
    const cardWidth = 380;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(index, 0), REGION_CARDS.length - 1));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        checkScroll();
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    checkScroll();
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [checkScroll]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry?.isIntersecting ?? false);
      },
      { threshold: 0.1 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || isPaused || reducedMotion) return;

    const timer = window.setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;

      if (el.scrollLeft >= maxScroll - 30) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const cardStep = el.clientWidth > 768 ? 400 : 314;
        el.scrollBy({ left: cardStep, behavior: "smooth" });
      }
    }, 3500);

    return () => window.clearInterval(timer);
  }, [isVisible, isPaused, reducedMotion]);

  const scrollByCard = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = (el.clientWidth > 768 ? 400 : 320) * (direction === "left" ? -1 : 1);
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full pt-12 pb-20 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-32 bg-white text-[#1c1917] overflow-hidden"
    >
      {/* SECTION HEADER (MATCHING THE REFERENCE) */}
      <ScrollReveal className="text-center max-w-4xl mx-auto px-6 mb-12 sm:mb-16 space-y-4">
        <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[2.8vw] text-[#1c1917] tracking-tight leading-tight">
          Trekking Regions
        </h2>

        <p className="font-sans text-stone-600 text-sm sm:text-base md:text-lg lg:text-[1.1vw] lg:leading-[1.7vw] max-w-3xl mx-auto leading-relaxed">
          Explore legendary trails and diverse landscapes across Nepal&apos;s most iconic
          trekking regions, guided by seasoned Himalayan experts.
        </p>
      </ScrollReveal>

      {/* HORIZONTAL CAROUSEL CONTAINER */}
      <div
        className="relative w-full max-w-[1520px] mx-auto px-4 sm:px-8 lg:px-12"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Floating Left Scroll Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByCard("left")}
            aria-label="Previous trekking regions"
            className="absolute left-6 lg:left-14 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/95 text-stone-900 shadow-xl border border-slate-200/80 flex items-center justify-center hover:bg-[#f05e25] hover:text-white hover:border-[#f05e25] transition-all cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2]" />
          </button>
        )}

        {/* Floating Right Scroll Button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByCard("right")}
            aria-label="Next trekking regions"
            className="absolute right-6 lg:right-14 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/95 text-stone-900 shadow-xl border border-slate-200/80 flex items-center justify-center hover:bg-[#f05e25] hover:text-white hover:border-[#f05e25] transition-all cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 stroke-[2]" />
          </button>
        )}

        {/* Scroll Track */}
        <div
          ref={scrollRef}
          className="flex gap-6 sm:gap-7 overflow-x-auto scrollbar-none snap-x snap-mandatory py-6 px-2 sm:px-4 scroll-smooth"
        >
          {REGION_CARDS.map((region) => (
            <Link
              key={region.id}
              href={region.href}
              className="group relative w-[290px] sm:w-[340px] md:w-[370px] lg:w-[390px] h-[480px] sm:h-[540px] shrink-0 rounded-[28px] overflow-hidden shadow-[0_12px_32px_-8px_rgba(15,23,42,0.18)] hover:shadow-[0_28px_56px_-12px_rgba(15,23,42,0.38)] hover:-translate-y-2.5 transition-all duration-500 snap-center select-none"
            >
              {/* Background Full Photo with Bold Hover Zoom */}
              <Image
                src={region.image}
                alt={region.name}
                fill
                sizes="(max-width: 768px) 300px, 400px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.12]"
              />

              {/* Deepening Dark Overlay on Hover */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors duration-500 pointer-events-none"
              />

              {/* High-Contrast Bottom Scrim */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.72) 42%, rgba(0,0,0,0.22) 72%, transparent 100%)",
                }}
              />

              {/* Top-left Route Count Pill */}
              {region.trekCount && (
                <div className="absolute top-5 left-5 z-10">
                  <span className="inline-block rounded-full bg-black/45 backdrop-blur-sm border border-white/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/95 group-hover:bg-[#f05e25] group-hover:border-[#f05e25] transition-colors duration-300">
                    {region.trekCount} Routes
                  </span>
                </div>
              )}

              {/* Card Foreground Content — Rich Visible Copy & Tactile Hover Lift */}
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col items-center text-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1">
                <span className="inline-block rounded-full bg-white/15 backdrop-blur-sm border border-white/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/95 mb-3">
                  {region.meta}
                </span>

                <h3 className="font-heading font-bold text-2xl sm:text-3xl text-white tracking-wide leading-tight drop-shadow-md">
                  {region.name}
                </h3>

                <span className="w-8 group-hover:w-16 h-[2px] bg-[#f05e25] transition-all duration-500 my-3 rounded-full" />

                <p className="font-sans text-xs sm:text-sm text-white/95 leading-relaxed max-w-[300px] drop-shadow-xs">
                  {region.description}
                </p>

                {/* Learn More Action Button */}
                <div className="mt-5">
                  <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-white/60 bg-white/15 backdrop-blur-sm text-white font-heading font-semibold text-xs uppercase tracking-widest group-hover:bg-[#f05e25] group-hover:text-white group-hover:border-[#f05e25] group-hover:shadow-lg group-hover:shadow-[#f05e25]/35 transition-all duration-300 shadow-md">
                    <span>Learn More</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Carousel Pagination Indicator Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {REGION_CARDS.map((r, idx) => (
            <button
              key={r.id}
              type="button"
              aria-label={`Scroll to ${r.name}`}
              onClick={() => {
                const el = scrollRef.current;
                if (!el) return;
                const cardWidth = el.clientWidth > 768 ? 400 : 320;
                el.scrollTo({ left: idx * cardWidth, behavior: "smooth" });
              }}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === idx
                  ? "w-8 bg-[#f05e25]"
                  : "w-2 bg-slate-200 hover:bg-slate-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
