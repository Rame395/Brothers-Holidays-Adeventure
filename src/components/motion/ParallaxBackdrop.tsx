"use client";

import Image from "next/image";
import { useEffect, useRef, useSyncExternalStore } from "react";

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

    let isVisible = false;
    let rafId = 0;

    const updateParallax = () => {
      const parent = wrapper.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const windowH = window.innerHeight;
      if (rect.bottom < -120 || rect.top > windowH + 120) return;

      const progress = (windowH - rect.top) / (windowH + rect.height);
      const clamped = Math.max(0, Math.min(1, progress));
      const shift = (clamped - 0.5) * 2 * speed;
      wrapper.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (!isVisible || rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        updateParallax();
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? false;
        if (isVisible) {
          updateParallax();
        }
      },
      { rootMargin: "120px 0px 120px 0px", threshold: 0 }
    );

    observer.observe(wrapper);
    window.addEventListener("scroll", onScroll, { passive: true });
    updateParallax();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [reducedMotion, speed]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="absolute left-0 -top-[22%] h-[144%] w-full z-0 pointer-events-none overflow-hidden will-change-transform"
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
