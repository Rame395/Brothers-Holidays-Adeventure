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
  strokeColor = "#0f4c54",
  fillColor = "rgba(15, 76, 84, 0.16)",
  viewBox = "0 0 300 40",
  height = "h-10",
}: AnimatedElevationGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (revealed) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [revealed]);

  return (
    <div ref={containerRef} className={`w-full overflow-hidden ${className}`}>
      {(startLabel || midLabel || peakLabel) && (
        <div className="flex justify-between text-[10px] font-mono text-white/65 mb-1 tabular-nums">
          <span>{startLabel}</span>
          {midLabel && <span>{midLabel}</span>}
          <span>{peakLabel}</span>
        </div>
      )}

      <div className={`relative w-full ${height}`}>
        <svg
          className={`w-full h-full overflow-visible transition-opacity duration-500 ${
            revealed ? "opacity-100" : "opacity-45"
          }`}
          viewBox={viewBox}
          preserveAspectRatio="none"
        >
          <path
            d={`${svgPath} L 300 40 L 0 40 Z`}
            fill={fillColor}
            className={`transition-opacity duration-700 ${
              revealed ? "opacity-100" : "opacity-0"
            }`}
          />

          <path
            d={svgPath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="600"
            strokeDashoffset={revealed ? "0" : "600"}
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />

          {peakCoords && (
            <circle
              cx={peakCoords.x}
              cy={peakCoords.y}
              r="3.2"
              fill="#e5b96b"
              stroke="#0b181f"
              strokeWidth="1.4"
              opacity={revealed ? 1 : 0}
              style={{ transition: "opacity 0.5s ease 0.4s" }}
            />
          )}
        </svg>
      </div>
    </div>
  );
}
