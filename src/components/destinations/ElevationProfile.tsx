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
  const padTop = 76;
  const padBottom = showLabels ? 34 : 18;

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

  const selectNearestPoint = (clientX: number, rect: DOMRect) => {
    if (!interactive || coords.length === 0) return;
    const x = ((clientX - rect.left) / rect.width) * W;
    let best = 0;
    coords.forEach((c, i) => {
      if (Math.abs(c.x - x) < Math.abs(coords[best]!.x - x)) best = i;
    });
    setHover(best);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible touch-pan-y"
        style={{ height }}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) =>
          selectNearestPoint(e.clientX, e.currentTarget.getBoundingClientRect())
        }
        onPointerMove={(e) =>
          selectNearestPoint(e.clientX, e.currentTarget.getBoundingClientRect())
        }
        onClick={(e) =>
          selectNearestPoint(e.clientX, e.currentTarget.getBoundingClientRect())
        }
      >
        <defs>
          <linearGradient id={`fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#558b1f" stopOpacity="0.22" />
            <stop offset="65%" stopColor="#f05e25" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#3f6e15" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`stroke-${gid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#558b1f" />
            <stop offset="52%" stopColor="#f05e25" />
            <stop offset="100%" stopColor="#3f6e15" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1="0"
            x2={W}
            y1={padTop + f * (H - padTop - padBottom)}
            y2={padTop + f * (H - padTop - padBottom)}
            stroke="#e2e8f0"
            strokeDasharray="4 6"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <path d={area} fill={`url(#fill-${gid})`} />
        <path
          d={line}
          fill="none"
          stroke={`url(#stroke-${gid})`}
          strokeWidth="3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {hover !== null && coords[hover] && (
          <line
            x1={coords[hover]!.x}
            x2={coords[hover]!.x}
            y1={0}
            y2={H}
            stroke="#3f6e15"
            strokeOpacity="0.32"
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {coords.map((c, i) => {
        const isPeak = i === peakIndex;
        const isHovered = hover === i;
        const hidePeakForAdjacentHover =
          isPeak &&
          hover !== null &&
          hover !== peakIndex &&
          Math.abs(hover - peakIndex) <= 1;
        const show =
          (showLabels || isPeak || isHovered) && !hidePeakForAdjacentHover;
        const isDarkTooltip = isPeak || isHovered;
        const xPct = (c.x / W) * 100;
        const alignClass =
          xPct < 14
            ? "left-0 translate-x-0"
            : xPct > 86
            ? "right-0 left-auto translate-x-0"
            : "left-1/2 -translate-x-1/2";

        return (
          <div
            key={i}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-200"
            style={{ left: `${xPct}%`, top: c.y }}
          >
            <span
              className={`block rounded-full border-2 border-white transition-transform ${
                isPeak
                  ? "h-4 w-4 bg-[#f05e25] shadow-[0_0_12px_rgba(240,94,37,0.65)]"
                  : isHovered
                  ? "h-3.5 w-3.5 scale-110 bg-[#3f6e15] shadow-sm"
                  : "h-2.5 w-2.5 bg-[#558b1f]"
              }`}
            />
            {show && (
              <div
                className={`absolute bottom-full mb-2.5 ${alignClass} whitespace-nowrap text-center transition-all ${
                  isDarkTooltip
                    ? "z-20 rounded-xl border border-white/15 bg-[#0f172a]/95 backdrop-blur-md px-3 py-2 text-white shadow-xl"
                    : "z-10 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[#1c1917] shadow-md"
                }`}
              >
                {(points[i]!.sub || isPeak) && (
                  <div
                    className={`font-mono text-[9px] font-bold uppercase tracking-widest ${
                      isDarkTooltip ? "text-[#ff8a50]" : "text-[#f05e25]"
                    }`}
                  >
                    {isPeak ? "PEAK · " : ""}
                    {points[i]!.sub}
                  </div>
                )}
                <div
                  className={`text-xs font-bold tabular-nums ${
                    isDarkTooltip ? "text-white" : "text-[#1c1917]"
                  }`}
                >
                  {points[i]!.altitude.toLocaleString("en-US")} m
                </div>
                <div
                  className={`max-w-[170px] truncate text-[11px] ${
                    isDarkTooltip ? "text-slate-300" : "text-[#57534d]"
                  }`}
                >
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
