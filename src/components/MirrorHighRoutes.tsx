"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Clock, Mountain } from "lucide-react";
import type { TrekRouteDTO } from "@/lib/types";
import AnimatedElevationGraph from "./AnimatedElevationGraph";

export default function MirrorHighRoutes({ treks }: { treks: TrekRouteDTO[] }) {
  const [selectedRegion, setSelectedRegion] = useState<string>("All");

  const regions = useMemo(() => {
    const set = new Set<string>();
    for (const t of treks) {
      if (t.region) set.add(t.region);
    }
    return ["All", ...Array.from(set)];
  }, [treks]);

  const filtered = useMemo(() => {
    const list =
      selectedRegion === "All"
        ? treks
        : treks.filter((t) => t.region === selectedRegion);
    return list.slice(0, 6);
  }, [treks, selectedRegion]);

  if (treks.length === 0) return null;

  return (
    <section className="relative w-full py-16 lg:py-24 bg-[#0b181f] text-white border-y border-white/10 content-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-10">
        {/* Section Header + Region Filter Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-2 max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e5b96b]">
              Regional Trail Guide
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight">
              Selected High Routes
            </h2>
            <p className="text-sm text-white/70 leading-relaxed">
              Proven high-altitude corridors across Nepal with elevation gradients,
              permit requirements, and straightforward local tariffs.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar sm:flex-wrap sm:overflow-visible sm:pb-0">
            {regions.map((region) => {
              const active = selectedRegion === region;
              return (
                <button
                  key={region}
                  type="button"
                  onClick={() => setSelectedRegion(region)}
                  className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? "bg-[#c89b4b] text-[#081318] font-semibold"
                      : "border border-white/15 bg-white/[0.04] text-white/75 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  {region}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clean 3-Column Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((trek) => (
            <article
              key={trek.id}
              className="group rounded-2xl overflow-hidden border border-white/12 bg-[#0e2029] flex flex-col justify-between transition-colors hover:border-[#c89b4b]/60"
            >
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#081318]">
                  <Image
                    src={trek.image}
                    alt={trek.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e2029] via-transparent to-black/25" />

                  <div className="absolute top-3 left-3">
                    <span className="rounded-md bg-[#081318]/85 border border-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#e5b96b]">
                      {trek.statusBadge}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white/90 tabular-nums">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#e5b96b]" />
                      {trek.duration} Days
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Mountain className="w-3.5 h-3.5 text-[#e5b96b]" />
                      {trek.highestPoint.toLocaleString("en-US")} m
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e5b96b]">
                    {trek.region} · {trek.difficulty}
                  </p>
                  <h3 className="font-serif text-xl text-white font-normal leading-snug">
                    {trek.name}
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed line-clamp-2">
                    {trek.description}
                  </p>

                  <div className="pt-2 border-t border-white/10">
                    <AnimatedElevationGraph
                      svgPath={trek.elevationPoints.svgPath}
                      peakCoords={trek.elevationPoints.peakCoords}
                      startLabel={trek.elevationPoints.start}
                      midLabel={trek.highestPointName}
                      peakLabel={trek.elevationPoints.peak}
                      strokeColor="#e5b96b"
                      fillColor="rgba(229, 185, 107, 0.14)"
                      height="h-9"
                    />
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-white/10 bg-[#0b181f]/60 flex items-center justify-between tabular-nums">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-white/50">
                    From / person
                  </span>
                  <span className="font-serif text-base font-medium text-[#e5b96b]">
                    NPR {(trek.priceFrom * 100).toLocaleString("en-US")}
                  </span>
                </div>

                <Link
                  href={`/route/${trek.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#c89b4b] hover:bg-[#e5b96b] px-3.5 py-2 text-xs font-semibold text-[#081318] transition-colors"
                >
                  <span>Logbook</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Directory CTA Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/10">
          <p className="text-xs text-white/65 tabular-nums">
            Showing {filtered.length} of {treks.length} mapped Himalayan routes.
          </p>
          <Link
            href="/treks"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#e5b96b] hover:text-white transition-colors"
          >
            <span>View all {treks.length} routes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
