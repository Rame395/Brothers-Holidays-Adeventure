"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-[1400ms] ease-[cubic-bezier(0.2,0.7,0.1,1)] ${
        shown
          ? "translate-y-0 opacity-100 blur-0"
          : "translate-y-10 opacity-0 blur-[6px]"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* 1 — Arrival out of the cloud bank */
export function Arrival() {
  return (
    <section className="relative bg-[#f4f2ee] overflow-hidden text-[#111d1f]">
      <div className="relative h-[90vh] min-h-[560px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/home-bridge.jpg"
          alt="Trekkers crossing a prayer-flag suspension bridge above a misty Himalayan gorge"
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1088}
        />
        <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-[#f4f2ee] via-[#f4f2ee]/75 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#003840] via-[#003840]/60 to-transparent" />
        <div className="relative flex h-full items-start justify-center px-6 pt-[14vh] z-10">
          <Reveal>
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.5em] text-[#334144]">
              KHARKA
            </p>
            <h2 className="mt-4 text-center font-display text-5xl font-light italic text-[#111d1f] md:text-8xl">
              welcomes you to the mountains
            </h2>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
