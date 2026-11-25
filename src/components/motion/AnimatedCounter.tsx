"use client";

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

export interface AnimatedCounterProps {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  useGrouping?: boolean;
}

export function AnimatedCounter({
  target,
  prefix = "",
  suffix = "",
  duration = 1600,
  useGrouping = true,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const hasAnimatedRef = useRef(false);
  const [displayValue, setDisplayValue] = useState<number>(target);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    if (reducedMotion || hasAnimatedRef.current) return;
    const el = ref.current;
    if (!el) return;

    let rafId = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            observer.unobserve(el);

            const startTime = performance.now();
            setDisplayValue(0);

            const tick = (now: number) => {
              const elapsed = now - startTime;
              const progress = Math.min(1, elapsed / duration);
              const eased = 1 - Math.pow(1 - progress, 3);
              setDisplayValue(Math.round(eased * target));

              if (progress < 1) {
                rafId = window.requestAnimationFrame(tick);
              } else {
                setDisplayValue(target);
              }
            };

            rafId = window.requestAnimationFrame(tick);
            break;
          }
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [duration, reducedMotion, target]);

  const formatted = useGrouping
    ? displayValue.toLocaleString("en-US")
    : String(displayValue);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
