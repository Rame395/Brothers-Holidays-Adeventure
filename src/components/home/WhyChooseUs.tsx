"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

interface Pillar {
  title: string;
  description: string;
  renderIcon: (className: string) => ReactNode;
}

function SherpaPeaksIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3 19.5 9.2 8.2l3.8 6 2.8-4.2L21 19.5H3Z"
        fill="#3f6e15"
        fillOpacity="0.1"
        stroke="#1c1917"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m7.1 12.2 2.1 1.2 2.1-1.3"
        stroke="#3f6e15"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 8.2V4.5m0 0 3.2 1.2L9.2 7"
        stroke="#f05e25"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlpineSafetyIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 3 4.8 6.3v5.4c0 4.6 3.1 8.5 7.2 9.5 4.1-1 7.2-4.9 7.2-9.5V6.3L12 3Z"
        fill="#f05e25"
        fillOpacity="0.09"
        stroke="#1c1917"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.8 12.2h2.1l1.3-2.6 1.7 5 1.4-2.4h2.1"
        stroke="#f05e25"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VillageCareIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3.5 19.5h17"
        stroke="#1c1917"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <path
        d="M5.5 19.5v-5.5l4-3.2 4 3.2v5.5"
        fill="#3f6e15"
        fillOpacity="0.1"
        stroke="#1c1917"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 19.5v-2.8"
        stroke="#3f6e15"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <path
        d="M17.2 19.5v-7.2m0 0-2.6 3.5h5.2l-2.6-3.5Zm0-4.2-2.1 2.8h4.2l-2.1-2.8Z"
        stroke="#3f6e15"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrailMapIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3.5 6.5 9 4l6 2.5 5.5-2.5v13.5L15 20l-6-2.5L3.5 20V6.5Z"
        fill="#1c1917"
        fillOpacity="0.05"
        stroke="#1c1917"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 4v13.5M15 6.5V20"
        stroke="#1c1917"
        strokeWidth={1.4}
        strokeOpacity="0.35"
      />
      <path
        d="M6.8 14.5c1.8-2.8 3.5-4.5 5.6-3.2 1.8 1.1 3.3-.4 4.8-2.6"
        stroke="#f05e25"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <circle cx="17.2" cy="8.7" r="1.4" fill="#3f6e15" />
    </svg>
  );
}

function DirectLedgerIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6 3.8h12v16.4l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3V3.8Z"
        fill="#d97706"
        fillOpacity="0.08"
        stroke="#1c1917"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 8.5h6M9 12h4.2"
        stroke="#1c1917"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <path
        d="m9.2 15.6 1.5 1.4 3.5-3.4"
        stroke="#3f6e15"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SummitLeadIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="8.5"
        fill="#3f6e15"
        fillOpacity="0.08"
        stroke="#1c1917"
        strokeWidth={1.6}
      />
      <path
        d="M12 3.5v1.6M12 18.9v1.6M3.5 12h1.6M18.9 12h1.6"
        stroke="#1c1917"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <path
        d="m15 9-1.9 4.5L8.6 15l1.9-4.5L15 9Z"
        fill="#f05e25"
        fillOpacity="0.2"
        stroke="#f05e25"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

const PILLARS: Pillar[] = [
  {
    title: "Local Sherpa Expertise",
    description:
      "Born and raised across Nepal's mountain valleys, our licensed Sherpa guides know every trail rhythm, weather shift, and hidden viewpoint firsthand.",
    renderIcon: (cls) => <SherpaPeaksIcon className={cls} />,
  },
  {
    title: "Safety-First Approach",
    description:
      "Structured acclimatisation days, calibrated pulse oximeters, satellite weather checks, and Kathmandu rescue coordination keep every trekker protected.",
    renderIcon: (cls) => <AlpineSafetyIcon className={cls} />,
  },
  {
    title: "Responsible Himalayan Travel",
    description:
      "Small group footprints, fair porter welfare, and family-run mountain teahouses ensure your journey directly supports highland communities.",
    renderIcon: (cls) => <VillageCareIcon className={cls} />,
  },
  {
    title: "Personalized Itineraries",
    description:
      "No rigid cookie-cutter schedules—we adapt daily walking distances, rest days, and route extensions around your pace and travel window.",
    renderIcon: (cls) => <TrailMapIcon className={cls} />,
  },
  {
    title: "Transparent Direct Pricing",
    description:
      "Book directly with our Thamel operations desk with a clear upfront USD breakdown for permits, flights, and lodges—zero hidden fees or surprises.",
    renderIcon: (cls) => <DirectLedgerIcon className={cls} />,
  },
  {
    title: "Seasoned Mountain Leadership",
    description:
      "Led by veteran Nepalese trek and expedition leaders with thousands of safe high-pass crossings across Everest, Annapurna, Manaslu, and Langtang.",
    renderIcon: (cls) => <SummitLeadIcon className={cls} />,
  },
];

export default function WhyChooseUs() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const watermarkRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      if (watermarkRef.current) {
        watermarkRef.current.style.transform = "translate3d(0, 0px, 0)";
      }
      return;
    }

    let rafId = 0;

    const updateWatermark = () => {
      rafId = 0;
      const section = sectionRef.current;
      const watermark = watermarkRef.current;
      if (!section || !watermark) return;

      const rect = section.getBoundingClientRect();
      const viewportH = window.innerHeight || 900;
      if (rect.bottom < -120 || rect.top > viewportH + 120) return;

      const progress = Math.min(
        Math.max((viewportH - rect.top) / (viewportH + rect.height), 0),
        1
      );
      const shiftY = ((progress - 0.5) * -36).toFixed(2);
      watermark.style.transform = `translate3d(0, ${shiftY}px, 0)`;
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updateWatermark);
    };

    updateWatermark();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="why-choose-us"
      className="relative w-full overflow-hidden bg-white py-20 sm:py-24 lg:py-28 text-[#111827] border-t border-stone-100"
    >
      {/* Subtle Bottom-Left Trekker & Himalayan Ridge Silhouette Background Art */}
      <div
        ref={watermarkRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-5 z-0 select-none will-change-transform transition-transform duration-150 ease-out"
      >
        <svg
          viewBox="0 0 1440 340"
          preserveAspectRatio="xMidYMax slice"
          className="w-full h-[230px] sm:h-[290px] lg:h-[340px]"
        >
          {/* Rolling Himalayan foothill ridge */}
          <path
            d="M0 340 L0 265 C95 220 155 192 225 194 C285 196 340 238 415 262 C495 288 575 282 670 258 C785 228 895 245 1015 256 C1135 268 1275 232 1440 252 L1440 340 Z"
            fill="#f1f0ec"
            opacity="0.88"
          />
          <path
            d="M0 340 L0 296 C150 268 270 278 405 292 C565 308 725 274 915 286 C1105 298 1280 268 1440 288 L1440 340 Z"
            fill="#edf1ea"
            opacity="0.92"
          />

          {/* Subtle alpine grass tufts along ridge shoulder */}
          <path
            d="M368 248 L363 230 M372 248 L374 226 M377 249 L385 233 M382 251 L392 240 M360 247 L352 235"
            stroke="#eceae4"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Standing trekker with backpack & trekking poles on the left ridge */}
          <g fill="#f0efe9" stroke="#f0efe9" opacity="0.95">
            <line
              x1="154"
              y1="145"
              x2="137"
              y2="240"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <line
              x1="216"
              y1="148"
              x2="233"
              y2="240"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="185" cy="84" r="10.5" stroke="none" />
            <path
              d="M170 98 C163 101 160 112 161 132 L164 152 L169 152 L168 198 L175 198 L182 162 L188 162 L195 198 L202 198 L201 150 L206 149 L207 115 C206 102 199 97 189 96 L176 96 Z"
              stroke="none"
            />
            <rect
              x="166"
              y="98"
              width="20"
              height="38"
              rx="6"
              stroke="none"
            />
            <path
              d="M167 107 L154 143 M202 108 L216 146"
              fill="none"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* Centered Header Matching Selected High Routes */}
        <ScrollReveal
          distance={20}
          className="max-w-2xl mx-auto text-center space-y-2.5"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#3f6e15]">
            The Brothers Difference
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#1c1917] tracking-wide uppercase leading-tight">
            Why Brothers Holidays
          </h2>
          <p className="text-sm sm:text-[15px] text-[#57534d] leading-relaxed">
            Built in Kathmandu on local Sherpa leadership, structured
            acclimatisation, and direct transparent pricing.
          </p>
        </ScrollReveal>

        {/* Open 3x2 Horizontal Feature Grid */}
        <div className="mt-12 sm:mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 lg:gap-x-12 gap-y-10 sm:gap-y-12">
          {PILLARS.map((pillar, idx) => (
            <ScrollReveal key={pillar.title} delay={idx * 65} distance={20}>
              <div className="group flex items-start gap-4 sm:gap-5">
                <div className="w-14 h-14 rounded-[12px] bg-white border border-stone-100/90 shadow-[0_10px_28px_-8px_rgba(28,25,23,0.12),0_2px_6px_-1px_rgba(28,25,23,0.05)] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5">
                  {pillar.renderIcon("w-6 h-6")}
                </div>

                <div className="min-w-0">
                  <h3 className="font-sans text-[17px] sm:text-[18px] font-semibold text-[#111827] leading-snug tracking-tight group-hover:text-[#3f6e15] transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 font-sans text-[13.5px] sm:text-[14px] leading-[1.65] text-[#57534d]">
                    {pillar.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
