"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedElevationGraphProps {
  svgPath: string;
  peakCoords?: { x: number; y: number };
  startLabel?: string;
  midLabel?: string;
  peakLabel?: string;
  className?: string;
  strokeColor?: string;
  fillColor?: string;
  viewBox?: string;
  height?: string;
}

export default function AnimatedElevationGraph({
  svgPath,
  peakCoords,
  startLabel,
  midLabel,
  peakLabel,
  className = "",
  strokeColor = "#006b78",
  fillColor = "rgba(0, 107, 120, 0.18)",
  viewBox = "0 0 300 40",
  height = "h-10",
}: AnimatedElevationGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Re-trigger animation whenever seen
          setInView(true);
          setAnimKey((k) => k + 1);
        } else {
          setInView(false);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`w-full overflow-hidden ${className}`}>
      {(startLabel || midLabel || peakLabel) && (
        <div className="flex justify-between text-[10px] font-mono text-on-surface-variant/80 mb-1">
          <span>{startLabel}</span>
          {midLabel && <span>{midLabel}</span>}
          <span>{peakLabel}</span>
        </div>
      )}

      <div className={`relative w-full ${height}`}>
        <svg
          key={animKey}
          className={`w-full h-full overflow-visible transition-opacity duration-700 ${
            inView ? "opacity-100" : "opacity-40"
          }`}
          viewBox={viewBox}
          preserveAspectRatio="none"
        >
          {/* Background Area Fill */}
          <path
            d={`${svgPath} L 300 40 L 0 40 Z`}
            fill={fillColor}
            className={`transition-all duration-1000 ease-out ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          />

          {/* Animated Stroke Line */}
          <path
            d={svgPath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="600"
            strokeDashoffset={inView ? "0" : "600"}
            style={{
              transition: "stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />

          {/* Peak Waypoint Beacon */}
          {peakCoords && (
            <g
              className={`transition-all duration-700 delay-500 ${
                inView ? "opacity-100 scale-100" : "opacity-0 scale-50"
              }`}
              style={{
                transformOrigin: `${peakCoords.x}px ${peakCoords.y}px`,
              }}
            >
              <circle
                cx={peakCoords.x}
                cy={peakCoords.y}
                r="3.5"
                fill="#c88a3e"
                stroke="#ffffff"
                strokeWidth="1.5"
                className="animate-pulse"
              />
              <circle
                cx={peakCoords.x}
                cy={peakCoords.y}
                r="7"
                fill="none"
                stroke="#c88a3e"
                strokeWidth="1"
                className="animate-ping opacity-60"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
