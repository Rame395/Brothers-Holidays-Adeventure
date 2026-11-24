"use client";

import { useEffect, useRef } from "react";

export function AboutHeroParallax({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

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

          if (rect.bottom > 0 && rect.top < windowH) {
            const progress = (windowH - rect.top) / (windowH + rect.height);
            // Background moves slower (anchored feel)
            const bgShift = (progress - 0.5) * 120;
            bg.style.transform = `translate3d(0, ${bgShift.toFixed(2)}px, 0)`;

            // Foreground text moves faster upwards
            if (content) {
              const contentShift = (progress - 0.5) * -70;
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

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
      {/* Parallax background */}
      <div
        ref={bgRef}
        aria-hidden="true"
        className="absolute -top-[20%] left-0 w-full h-[140%] bg-cover bg-center opacity-35 pointer-events-none will-change-transform"
        style={{ backgroundImage: "url('/images/why-us-mountain.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#071116]/75 via-[#071116]/85 to-[#071116] pointer-events-none" />

      {/* Faster-scrolling content */}
      <div ref={contentRef} className="relative z-10 will-change-transform">
        {children}
      </div>
    </div>
  );
}
