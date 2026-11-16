"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedStatProps {
  value?: number;
  isString?: string;
  prefix?: string;
  suffix?: string;
  label?: string;
  sublabel?: string;
  duration?: number;
  decimals?: number;
  useGrouping?: boolean;
  barPercent?: number;
  colorScheme?: "primary" | "tertiary" | "white" | "amber";
  size?: "lg" | "md" | "sm";
  className?: string;
}

export default function AnimatedStat({
  value,
  isString,
  prefix = "",
  suffix = "",
  label,
  sublabel,
  duration = 1800,
  decimals = 0,
  useGrouping = true,
  barPercent,
  colorScheme = "primary",
  size = "lg",
  className = "",
}: AnimatedStatProps) {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsAnimating(true);
          setHasAnimated(true);

          if (typeof value === "number") {
            const startTime = performance.now();
            const startVal = 0;
            const endVal = value;

            const update = (now: number) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease-out expo curve for ultra smooth deceleration
              const easeProgress =
                progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
              const current = startVal + (endVal - startVal) * easeProgress;
              setDisplayValue(current);

              if (progress < 1) {
                requestAnimationFrame(update);
              } else {
                setDisplayValue(endVal);
                setIsAnimating(false);
              }
            };
            requestAnimationFrame(update);
          } else {
            // For string stats, show brief telemetry calibration
            const timer = setTimeout(() => setIsAnimating(false), 800);
            return () => clearTimeout(timer);
          }
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  const formattedValue = () => {
    if (isString) return isString;
    if (typeof value !== "number") return "";

    const rounded = Number(displayValue.toFixed(decimals));
    if (useGrouping) {
      return rounded.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }
    return rounded.toString();
  };

  const colorClasses = {
    primary: "text-primary",
    tertiary: "text-tertiary",
    white: "text-surface-container-lowest",
    amber: "text-[#c88a3e]",
  }[colorScheme];

  const sizeClasses = {
    lg: "font-display-md text-display-md",
    md: "font-headline-lg text-headline-lg",
    sm: "font-headline-sm text-headline-sm",
  }[size];

  return (
    <div
      ref={containerRef}
      className={`relative group overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Active telemetry scanning line when animating */}
      {isAnimating && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent pointer-events-none anim-scanline"></div>
      )}

      {/* Header/Status Indicator */}
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
            isAnimating
              ? "bg-amber-400 animate-ping"
              : hasAnimated
              ? "bg-primary"
              : "bg-outline-variant/50"
          }`}
        ></span>
        {isAnimating ? (
          <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500/90 animate-pulse">
            Syncing...
          </span>
        ) : (
          sublabel && (
            <span className="text-[10px] uppercase font-mono tracking-widest text-on-surface-variant/70">
              {sublabel}
            </span>
          )
        )}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline gap-1">
        {prefix && (
          <span className={`${sizeClasses} ${colorClasses} font-normal opacity-90`}>
            {prefix}
          </span>
        )}
        <span
          className={`${sizeClasses} ${colorClasses} font-normal tracking-tight font-serif select-none transition-all duration-300 ${
            isAnimating ? "scale-[1.02] filter drop-shadow-[0_0_8px_rgba(0,107,120,0.35)]" : ""
          }`}
        >
          {formattedValue()}
        </span>
        {suffix && (
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider ml-0.5">
            {suffix}
          </span>
        )}
      </div>

      {/* Label */}
      {label && (
        <p className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant mt-2 font-medium">
          {label}
        </p>
      )}

      {/* Optional Animated Altitude/Progress Bar */}
      {barPercent !== undefined && (
        <div className="mt-3 w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              colorScheme === "tertiary"
                ? "bg-gradient-to-r from-tertiary to-amber-500"
                : "bg-gradient-to-r from-primary to-primary-container"
            }`}
            style={{
              width: hasAnimated ? `${barPercent}%` : "0%",
            }}
          ></div>
        </div>
      )}
    </div>
  );
}
