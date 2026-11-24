"use client";

import { useEffect, useRef } from "react";

export function AboutHeroParallax({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = container.getBoundingClientRect();
          const windowH = window.innerHeight;

          if (rect.bottom > 0 && rect.top < windowH) {
            const progress = (windowH - rect.top) / (windowH + rect.height);
            const contentShift = (progress - 0.5) * -50;
            content.style.transform = `translate3d(0, ${contentShift.toFixed(2)}px, 0)`;
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
    <div ref={containerRef} className="relative w-full overflow-hidden bg-[#071116]">
      <div ref={contentRef} className="relative z-10 will-change-transform">
        {children}
      </div>
    </div>
  );
}
