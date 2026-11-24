"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RegionCard {
  id: string;
  name: string;
  description: string;
  image: string;
  href: string;
  trekCount?: number;
}

const REGION_CARDS: RegionCard[] = [
  {
    id: "everest",
    name: "Everest Region Trek",
    description: "Explore trekking routes across Everest Region Trek.",
    image: "/images/trips/everest.jpg",
    href: "/destinations?country=nepal&region=everest",
    trekCount: 8,
  },
  {
    id: "annapurna",
    name: "Annapurna Region Trek",
    description: "Explore trekking routes across Annapurna Region Trek.",
    image: "/images/trips/annapurna.jpg",
    href: "/destinations?country=nepal&region=annapurna",
    trekCount: 9,
  },
  {
    id: "kanchenjunga",
    name: "Kanchenjunga Region Trek",
    description: "Explore trekking routes across Kanchenjunga Region Trek.",
    image: "/images/trips/kanchenjunga.jpg",
    href: "/destinations?country=nepal&region=kanchenjunga",
    trekCount: 3,
  },
  {
    id: "langtang",
    name: "Langtang Region Trek",
    description: "Explore trekking routes across Langtang Region Trek.",
    image: "/images/trips/langtang.jpg",
    href: "/destinations?country=nepal&region=langtang",
    trekCount: 5,
  },
  {
    id: "manaslu",
    name: "Manaslu Region Trek",
    description: "Explore trekking routes across Manaslu Region Trek.",
    image: "/images/trips/manaslu.jpg",
    href: "/destinations?country=nepal&region=manaslu",
    trekCount: 4,
  },
  {
    id: "mustang",
    name: "Mustang Region Trek",
    description: "Explore trekking routes across Mustang Region Trek.",
    image: "/images/trips/mustang.jpg",
    href: "/destinations?country=nepal&region=mustang",
    trekCount: 4,
  },
];

export default function TrekkingRegions() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

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

  const scrollByCard = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = (el.clientWidth > 768 ? 400 : 320) * (direction === "left" ? -1 : 1);
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <section className="relative w-full py-20 sm:py-28 lg:py-32 bg-white text-[#1c1917] overflow-hidden content-auto">
      {/* SECTION HEADER (MATCHING THE REFERENCE) */}
      <div className="text-center max-w-4xl mx-auto px-6 mb-12 sm:mb-16 space-y-4">
        <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[2.8vw] text-[#104b87] tracking-tight leading-tight">
          Trekking Regions
        </h2>

        <p className="font-sans text-stone-600 text-sm sm:text-base md:text-lg lg:text-[1.1vw] lg:leading-[1.7vw] max-w-3xl mx-auto leading-relaxed">
          Explore legendary trails and diverse landscapes across Nepal&apos;s most iconic
          trekking regions, guided by seasoned Himalayan experts.
        </p>
      </div>

      {/* HORIZONTAL CAROUSEL CONTAINER */}
      <div className="relative w-full max-w-[1520px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Floating Left Scroll Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByCard("left")}
            aria-label="Previous trekking regions"
            className="absolute left-6 lg:left-14 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/95 text-stone-900 shadow-xl border border-slate-200/80 flex items-center justify-center hover:bg-[#104b87] hover:text-white transition-all cursor-pointer"
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
            className="absolute right-6 lg:right-14 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/95 text-stone-900 shadow-xl border border-slate-200/80 flex items-center justify-center hover:bg-[#104b87] hover:text-white transition-all cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 stroke-[2]" />
          </button>
        )}

        {/* Scroll Track */}
        <div
          ref={scrollRef}
          className="flex gap-6 sm:gap-7 overflow-x-auto scrollbar-none snap-x snap-mandatory py-4 px-2 sm:px-4 scroll-smooth"
        >
          {REGION_CARDS.map((region) => (
            <Link
              key={region.id}
              href={region.href}
              className="group relative w-[290px] sm:w-[340px] md:w-[370px] lg:w-[390px] h-[480px] sm:h-[540px] shrink-0 rounded-[28px] overflow-hidden shadow-[0_12px_32px_-8px_rgba(15,23,42,0.18)] hover:shadow-[0_20px_48px_-10px_rgba(16,75,135,0.3)] transition-all duration-500 snap-center select-none"
            >
              {/* Background Full Photo */}
              <Image
                src={region.image}
                alt={region.name}
                fill
                sizes="(max-width: 768px) 300px, 400px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Bottom Contrast Gradient Mask */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/45 to-transparent pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 35%, rgba(0,0,0,0.2) 65%, transparent 100%)",
                }}
              />

              {/* Card Foreground Content */}
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col items-center text-center">
                <h3 className="font-heading font-bold text-2xl sm:text-3xl text-white tracking-wide leading-tight drop-shadow-md">
                  {region.name}
                </h3>

                <p className="font-sans text-xs sm:text-sm text-white/85 mt-2.5 leading-relaxed max-w-[270px]">
                  {region.description}
                </p>

                {/* Learn More Action Button */}
                <div className="mt-5">
                  <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-white/60 bg-black/50 text-white font-heading font-semibold text-xs uppercase tracking-widest group-hover:bg-white group-hover:text-black group-hover:border-white transition-all duration-300 shadow-md">
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
                  ? "w-8 bg-[#104b87]"
                  : "w-2 bg-slate-200 hover:bg-slate-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
