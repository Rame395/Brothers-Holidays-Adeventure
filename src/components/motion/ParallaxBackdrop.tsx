"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

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

export interface ParallaxBackdropProps {
  imageSrc: string;
  imageAlt?: string;
  objectPosition?: string;
  imageClassName?: string;
  speed?: number;
  kenBurns?: boolean;
}

export function ParallaxBackdrop({
  imageSrc,
  imageAlt = "",
  objectPosition = "object-center",
  imageClassName = "",
  speed = 115,
  kenBurns = true,
}: ParallaxBackdropProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    if (reducedMotion) {
      wrapper.style.transform = "";
      return;
    }

    let inView = false;
    let rafId = 0;
    let cachedParentTop = 0;
    let cachedParentHeight = 0;
    let cachedWinH = window.innerHeight;
    let lastWidth = window.innerWidth;

    const measure = () => {
      const parent = wrapper.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      cachedParentTop = rect.top + window.scrollY;
      cachedParentHeight = parent.offsetHeight;
      cachedWinH = window.innerHeight;
    };

    const updateParallax = () => {
      const top = cachedParentTop - window.scrollY;
      const bottom = top + cachedParentHeight;
      if (bottom < -120 || top > cachedWinH + 120) return;

      const progress = (cachedWinH - top) / (cachedWinH + cachedParentHeight);
      const clamped = Math.max(0, Math.min(1, progress));
      const shift = (clamped - 0.5) * 2 * speed;
      wrapper.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (!inView || rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        updateParallax();
      });
    };

    const onResize = () => {
      const widthChanged = window.innerWidth !== lastWidth;
      lastWidth = window.innerWidth;
      if (!widthChanged && window.innerWidth < 1024) return;
      measure();
      if (inView) updateParallax();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? false;
        setIsVisible(inView);
        if (inView) {
          measure();
          updateParallax();
        }
      },
      { rootMargin: "120px 0px 120px 0px", threshold: 0 }
    );

    measure();
    observer.observe(wrapper);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    updateParallax();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [reducedMotion, speed]);

  return (
    <div
      ref={wrapperRef}
      data-paused={isVisible && !reducedMotion ? "false" : "true"}
      aria-hidden="true"
      className="absolute left-0 -top-[22%] h-[144%] w-full z-0 pointer-events-none overflow-hidden md:will-change-transform"
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        sizes="100vw"
        className={`object-cover ${objectPosition} ${
          kenBurns && !reducedMotion ? "animate-ken-burns" : ""
        } ${imageClassName}`.trim()}
      />
    </div>
  );
}
