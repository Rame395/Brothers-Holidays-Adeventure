"use client";

import { useId, useMemo, useState } from "react";

export interface ProfilePoint {
  label: string;
  altitude: number;
  sub?: string;
}

interface Props {
  points: ProfilePoint[];
  className?: string;
  height?: number;
  showLabels?: boolean;
  interactive?: boolean;
  animateKey?: string;
}

const W = 1000;

export function ElevationProfile({
  points,
  className = "",
  height = 240,
  showLabels = false,
  interactive = true,
}: Props) {
  const gid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const H = height;
  const padTop = showLabels ? 52 : 24;
  const padBottom = showLabels ? 34 : 12;

  const { coords, line, area, max } = useMemo(() => {
    const alts = points.map((p) => p.altitude);
    const min = Math.min(...alts);
    const max = Math.max(...alts);
    const span = Math.max(max - min, 1);
    const n = points.length;
    const coords = points.map((p, i) => ({
      x: n === 1 ? W / 2 : (i / (n - 1)) * W,
      y: padTop + (1 - (p.altitude - min) / span) * (H - padTop - padBottom),
    }));
    const first = coords[0] ?? { x: 0, y: H };
    let line = `M ${first.x} ${first.y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p1 = coords[i]!;
      const p2 = coords[i + 1]!;
      const p0 = coords[i - 1] ?? p1;
      const p3 = coords[i + 2] ?? p2;
      const t = 0.18;
      line += ` C ${p1.x + (p2.x - p0.x) * t} ${p1.y + (p2.y - p0.y) * t}, ${
        p2.x - (p3.x - p1.x) * t
      } ${p2.y - (p3.y - p1.y) * t}, ${p2.x} ${p2.y}`;
    }
    const area = `${line} L ${W} ${H} L 0 ${H} Z`;
    return { coords, line, area, min, max };
  }, [points, H, padTop, padBottom]);

  const peakIndex = points.findIndex((p) => p.altitude === max);

  return (
    <div className={`relative w-full ${className}`}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
        style={{ height }}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          if (!interactive) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * W;
          let best = 0;
          coords.forEach((c, i) => {
            if (Math.abs(c.x - x) < Math.abs(coords[best]!.x - x)) best = i;
          });
          setHover(best);
        }}
      >
        <defs>
          <linearGradient id={`fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#008ab5" stopOpacity="0.24" />
            <stop offset="75%" stopColor="#00515b" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#00515b" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`stroke-${gid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#008ab5" />
            <stop offset="50%" stopColor="#b58133" />
            <stop offset="100%" stopColor="#00515b" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1="0"
            x2={W}
            y1={padTop + f * (H - padTop - padBottom)}
            y2={padTop + f * (H - padTop - padBottom)}
            stroke="#d8e5e7"
            strokeDasharray="4 6"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <path d={area} fill={`url(#fill-${gid})`} />
        <path
          d={line}
          fill="none"
          stroke={`url(#stroke-${gid})`}
          strokeWidth="2.8"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {hover !== null && coords[hover] && (
          <line
            x1={coords[hover]!.x}
            x2={coords[hover]!.x}
            y1={0}
            y2={H}
            stroke="#00515b"
            strokeOpacity="0.35"
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {coords.map((c, i) => {
        const isPeak = i === peakIndex;
        const show = showLabels || isPeak || hover === i;
        return (
          <div
            key={i}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-200"
            style={{ left: `${(c.x / W) * 100}%`, top: c.y }}
          >
            <span
              className={`block rounded-full border-2 border-white transition-transform ${
                isPeak
                  ? "h-3.5 w-3.5 bg-[#b58133] shadow-[0_0_12px_rgba(181,129,51,0.7)]"
                  : hover === i
                  ? "h-3 w-3 scale-125 bg-[#00515b]"
                  : "h-2.5 w-2.5 bg-[#008ab5]"
              }`}
            />
            {show && (
              <div
                className={`absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border px-2.5 py-1 text-center shadow-md ${
                  isPeak || hover === i
                    ? "border-[#00515b]/20 bg-[#071318] text-white z-20"
                    : "border-[#d8e5e7] bg-white text-[#111d1f] z-10"
                }`}
              >
                {points[i]!.sub && (
                  <div className="font-mono text-[9px] uppercase tracking-widest text-[#e8b765]">
                    {points[i]!.sub}
                  </div>
                )}
                <div className="font-mono text-[11px] font-semibold">
                  {points[i]!.altitude.toLocaleString("en-US")} m
                </div>
                <div className="max-w-[140px] truncate text-[10px] opacity-80">
                  {points[i]!.label}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
