"use client";

import type { ReactNode } from "react";
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

export interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  duration?: number;
  direction?: "up" | "left" | "right" | "scale";
}

function getHiddenTransform(
  direction: NonNullable<ScrollRevealProps["direction"]>,
  distance: number
): string {
  switch (direction) {
    case "left":
      return `translate3d(-${distance}px, 0, 0) scale(0.97)`;
    case "right":
      return `translate3d(${distance}px, 0, 0) scale(0.97)`;
    case "scale":
      return `translate3d(0, ${Math.round(distance * 0.6)}px, 0) scale(0.92)`;
    case "up":
    default:
      return `translate3d(0, ${distance}px, 0) scale(0.95)`;
  }
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  distance = 52,
  duration = 850,
  direction = "up",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    if (reducedMotion || revealed) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.unobserve(el);
            break;
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion, revealed]);

  const isVisible = reducedMotion || revealed;

  return (
    <div
      ref={ref}
      className={className}
      style={
        reducedMotion
          ? undefined
          : {
              opacity: isVisible ? 1 : 0,
              transform: isVisible
                ? "translate3d(0, 0, 0) scale(1)"
                : getHiddenTransform(direction, distance),
              transitionProperty: "opacity, transform",
              transitionDuration: `${duration}ms`,
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: `${delay}ms`,
              willChange: isVisible ? "auto" : "opacity, transform",
            }
      }
    >
      {children}
    </div>
  );
}
