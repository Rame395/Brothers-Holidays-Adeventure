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

export interface ImageMaskRevealProps {
  src: string;
  alt: string;
  className?: string;
  aspectClassName?: string;
  sizes?: string;
  delay?: number;
  softBottomFade?: "white" | "alabaster" | "none";
  caption?: string;
  priority?: boolean;
  rounded?: boolean;
}

export function ImageMaskReveal({
  src,
  alt,
  className = "",
  aspectClassName = "aspect-[16/10]",
  sizes = "(max-width: 1024px) 100vw, 60vw",
  delay = 0,
  softBottomFade = "none",
  caption,
  priority = false,
  rounded = true,
}: ImageMaskRevealProps) {
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
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion, revealed]);

  const isVisible = reducedMotion || revealed;
  const radius = rounded ? "20px" : "0px";

  return (
    <figure className={`group ${className}`.trim()}>
      <div
        ref={ref}
        className={`relative w-full overflow-hidden ${aspectClassName} ${
          rounded ? "rounded-[20px]" : ""
        } bg-stone-100`}
        style={
          reducedMotion
            ? undefined
            : {
                clipPath: isVisible
                  ? `inset(0% 0% 0% 0% round ${radius})`
                  : `inset(14% 0% 0% 0% round ${radius})`,
                opacity: isVisible ? 1 : 0.2,
                transitionProperty: "clip-path, opacity",
                transitionDuration: "1150ms",
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                transitionDelay: `${delay}ms`,
                willChange: isVisible ? "auto" : "clip-path, opacity",
              }
        }
      >
        <div
          className="relative h-full w-full"
          style={
            reducedMotion
              ? undefined
              : {
                  transform: isVisible ? "scale(1)" : "scale(1.08)",
                  transitionProperty: "transform",
                  transitionDuration: "1350ms",
                  transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  transitionDelay: `${delay}ms`,
                  willChange: isVisible ? "auto" : "transform",
                }
          }
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
          />
        </div>

        {softBottomFade === "white" && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 sm:h-32 bg-gradient-to-t from-white via-white/70 to-transparent"
          />
        )}

        {softBottomFade === "alabaster" && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 sm:h-32 bg-gradient-to-t from-[#faf9f7] via-[#faf9f7]/70 to-transparent"
          />
        )}
      </div>

      {caption && (
        <figcaption className="mt-3 flex items-center gap-2 text-xs font-medium tracking-wide text-[#57534d]">
          <span className="inline-block h-px w-5 bg-[#3f6e15]/50" />
          <span>{caption}</span>
        </figcaption>
      )}
    </figure>
  );
}
