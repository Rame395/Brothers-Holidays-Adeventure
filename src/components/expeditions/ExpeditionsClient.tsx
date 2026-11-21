"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Download,
  Footprints,
  SlidersHorizontal,
  Snowflake,
  Wind,
  X,
} from "lucide-react";
import type { ExpeditionObjectiveDTO } from "@/lib/types";
import { FieldIcon } from "@/components/site/FieldIcon";

export function ExpeditionsClient({
  objectives,
}: {
  objectives: ExpeditionObjectiveDTO[];
}) {
  const [selectedBand, setSelectedBand] = useState<string>("all");
  const [activeObjective, setActiveObjective] =
    useState<ExpeditionObjectiveDTO | null>(null);
  const [curveInView, setCurveInView] = useState(false);
  const curveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = curveRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCurveInView(true);
        } else {
          setCurveInView(false);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const filteredObjectives = objectives.filter((obj) => {
    if (selectedBand === "all") return true;
    if (selectedBand === "8000") return obj.band.includes("8,000");
    if (selectedBand === "7000") return obj.band.includes("7,000");
    return true;
  });

  const findById = (slug: string) =>
    objectives.find((o) => o.id === slug || o.slug === slug) || null;

  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-margin pt-10 pb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Himalayan Registry · Series 2026/27
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Vol. VIII
              </span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight font-normal">
              Expeditions
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Explore peaks and mountaineering objectives grouped by altitude
              band. Categorized strictly by atmospheric physiological
              thresholds, technical rigging demands, and seasonal jet stream
              windows.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-end lg:items-center gap-4">
            <div className="text-left md:text-right">
              <div className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant/70">
                Archive Dispatch
              </div>
              <div className="font-headline-sm text-headline-sm text-on-surface font-normal">
                Series 2026/27 Active
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full font-label-lg text-label-lg transition-all shadow-sm cursor-pointer ${
                  selectedBand !== "all"
                    ? "bg-primary-container text-on-primary"
                    : "bg-surface-container-highest hover:bg-surface-variant text-on-surface"
                }`}
                id="filterBtn"
                type="button"
                onClick={() =>
                  setSelectedBand((prev) => (prev === "all" ? "8000" : "all"))
                }
              >
                <SlidersHorizontal
                  className="h-[18px] w-[18px] shrink-0"
                  aria-hidden="true"
                />
                {selectedBand === "all" ? "Filter 8,000m+" : "Show All Bands"}
              </button>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-container text-on-primary hover:bg-primary transition-colors shadow-sm"
                title="Request Topo Survey Sheets"
              >
                <Download className="h-5 w-5 shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* Altitude Band Visualizer HUD */}
        <div className="w-full bg-surface-container-low rounded-xl p-6 lg:p-8 relative overflow-hidden shadow-sm mb-14 border border-outline-variant/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-tertiary font-semibold">
                Physiological Stratification
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface mt-1">
                Altitude Band Visualizer
              </h2>
            </div>
            <div className="flex items-center gap-4 text-on-surface-variant font-label-sm text-label-sm flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedBand("8000")}
                className="flex items-center gap-1.5 hover:text-on-surface cursor-pointer"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>{" "}
                Death Zone (&gt;7,500m)
              </button>
              <button
                type="button"
                onClick={() => setSelectedBand("7000")}
                className="flex items-center gap-1.5 hover:text-on-surface cursor-pointer"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>{" "}
                High Alpine (6,500m–7,500m)
              </button>
              <button
                type="button"
                onClick={() => setSelectedBand("all")}
                className="flex items-center gap-1.5 hover:text-on-surface cursor-pointer"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>{" "}
                Acclimatization (5,500m–6,500m)
              </button>
            </div>
          </div>

          <div ref={curveRef} className="pt-8 pb-4 w-full overflow-x-auto">
            <div className="min-w-[720px]">
              <svg
                className="w-full h-48 overflow-visible"
                fill="none"
                viewBox="0 0 1000 240"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="highBandGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#006b78" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#006b78" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <line
                  stroke="#6f797b"
                  strokeDasharray="4 4"
                  strokeOpacity="0.25"
                  x1="0"
                  x2="1000"
                  y1="40"
                  y2="40"
                />
                <text
                  className="fill-tertiary text-[11px] font-mono tracking-widest uppercase font-semibold"
                  x="12"
                  y="32"
                >
                  8,000m Band · Extreme Hypoxia / Supplemental O₂ Mandatory
                </text>
                <line
                  stroke="#6f797b"
                  strokeDasharray="4 4"
                  strokeOpacity="0.2"
                  x1="0"
                  x2="1000"
                  y1="110"
                  y2="110"
                />
                <text
                  className="fill-primary text-[11px] font-mono tracking-widest uppercase font-semibold"
                  x="12"
                  y="102"
                >
                  7,000m Band · Fixed Line Traversals / Stage 3 Camp Rotations
                </text>
                <line
                  stroke="#6f797b"
                  strokeDasharray="4 4"
                  strokeOpacity="0.2"
                  x1="0"
                  x2="1000"
                  y1="180"
                  y2="180"
                />
                <text
                  className="fill-secondary text-[11px] font-mono tracking-widest uppercase font-semibold"
                  x="12"
                  y="172"
                >
                  6,000m Band · Trekking Summits &amp; Glaciated Pyramid Ridges
                </text>

                <path
                  d="M0,230 L110,210 L190,175 L280,140 L370,165 L460,95 L550,22 L630,85 L720,135 L810,105 L900,160 L1000,210"
                  stroke="#006b78"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  strokeDasharray="2000"
                  strokeDashoffset={curveInView ? "0" : "2000"}
                  style={{
                    transition:
                      "stroke-dashoffset 1.8s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
                <path
                  d="M0,230 L110,210 L190,175 L280,140 L370,165 L460,95 L550,22 L630,85 L720,135 L810,105 L900,160 L1000,210 L1000,240 L0,240 Z"
                  fill="url(#highBandGrad)"
                  className={`transition-opacity duration-1000 ${
                    curveInView ? "opacity-100" : "opacity-30"
                  }`}
                />

                <g
                  className="cursor-pointer group"
                  onClick={() => setActiveObjective(findById("manaslu"))}
                >
                  <circle
                    className="fill-tertiary-container stroke-surface stroke-2 hover:scale-125 transition-transform"
                    cx="550"
                    cy="22"
                    r="5"
                  />
                  <circle
                    className="stroke-tertiary-container/40 stroke-1 animate-ping"
                    cx="550"
                    cy="22"
                    r="11"
                  />
                  <text
                    className="fill-on-surface font-serif text-[12px] font-semibold"
                    textAnchor="middle"
                    x="550"
                    y="12"
                  >
                    Manaslu 8,163m
                  </text>
                </g>

                <g
                  className="cursor-pointer group"
                  onClick={() => setActiveObjective(findById("baruntse"))}
                >
                  <circle
                    className="fill-primary stroke-surface stroke-2 hover:scale-125 transition-transform"
                    cx="460"
                    cy="95"
                    r="4.5"
                  />
                  <text
                    className="fill-on-surface font-serif text-[11px]"
                    textAnchor="middle"
                    x="460"
                    y="85"
                  >
                    Baruntse 7,129m
                  </text>
                </g>

                <g
                  className="cursor-pointer group"
                  onClick={() => setActiveObjective(findById("ama-dablam"))}
                >
                  <circle
                    className="fill-primary stroke-surface stroke-2 hover:scale-125 transition-transform"
                    cx="630"
                    cy="85"
                    r="4.5"
                  />
                  <text
                    className="fill-on-surface font-serif text-[11px]"
                    textAnchor="middle"
                    x="630"
                    y="75"
                  >
                    Ama Dablam 6,812m
                  </text>
                </g>

                <g
                  className="cursor-pointer group"
                  onClick={() => setActiveObjective(findById("mera-peak"))}
                >
                  <circle
                    className="fill-secondary stroke-surface stroke-2 hover:scale-125 transition-transform"
                    cx="720"
                    cy="135"
                    r="4"
                  />
                  <text
                    className="fill-on-surface-variant font-sans text-[10px]"
                    textAnchor="middle"
                    x="720"
                    y="125"
                  >
                    Mera Peak 6,476m
                  </text>
                </g>

                <g
                  className="cursor-pointer group"
                  onClick={() => setActiveObjective(findById("island-peak"))}
                >
                  <circle
                    className="fill-secondary stroke-surface stroke-2 hover:scale-125 transition-transform"
                    cx="280"
                    cy="140"
                    r="4"
                  />
                  <text
                    className="fill-on-surface-variant font-sans text-[10px]"
                    textAnchor="middle"
                    x="280"
                    y="130"
                  >
                    Island Peak 6,189m
                  </text>
                </g>

                <g
                  className="cursor-pointer group"
                  onClick={() => setActiveObjective(findById("lobuche-east"))}
                >
                  <circle
                    className="fill-secondary stroke-surface stroke-2 hover:scale-125 transition-transform"
                    cx="900"
                    cy="160"
                    r="4"
                  />
                  <text
                    className="fill-on-surface-variant font-sans text-[10px]"
                    textAnchor="middle"
                    x="900"
                    y="150"
                  >
                    Lobuche 6,119m
                  </text>
                </g>
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            <div
              onClick={() => setSelectedBand("8000")}
              className={`rounded-lg p-4 shadow-sm flex flex-col justify-between cursor-pointer transition-all border ${
                selectedBand === "8000"
                  ? "bg-tertiary-fixed/30 border-tertiary"
                  : "bg-surface-container-lowest border-outline-variant/20 hover:border-outline-variant/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-md text-label-md uppercase tracking-wider text-tertiary font-semibold">
                  Tier I · 8,000m Band
                </span>
                <Wind
                  className="h-[18px] w-[18px] shrink-0 text-tertiary"
                  aria-hidden="true"
                />
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Atmospheric pressure drops below 350 hPa. 1:1 Lead Sherpa ratio,
                bottled Osler flow 2-3 L/min, expedition-class satcom.
              </p>
            </div>

            <div
              onClick={() => setSelectedBand("7000")}
              className={`rounded-lg p-4 shadow-sm flex flex-col justify-between cursor-pointer transition-all border ${
                selectedBand === "7000"
                  ? "bg-primary-fixed/30 border-primary"
                  : "bg-surface-container-lowest border-outline-variant/20 hover:border-outline-variant/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-semibold">
                  Tier II · 7,000m Band
                </span>
                <Snowflake
                  className="h-[18px] w-[18px] shrink-0 text-primary"
                  aria-hidden="true"
                />
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Sustained mixed rock, sheer blue ice flutings, fixed jumar
                anchors. High alpine bivouacs with high technical grade.
              </p>
            </div>

            <div
              onClick={() => setSelectedBand("all")}
              className={`rounded-lg p-4 shadow-sm flex flex-col justify-between cursor-pointer transition-all border ${
                selectedBand === "all"
                  ? "bg-secondary-fixed/30 border-secondary"
                  : "bg-surface-container-lowest border-outline-variant/20 hover:border-outline-variant/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-md text-label-md uppercase tracking-wider text-secondary font-semibold">
                  Tier III · 6,000m Band
                </span>
                <Footprints
                  className="h-[18px] w-[18px] shrink-0 text-secondary"
                  aria-hidden="true"
                />
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Non-supplemental oxygen standard. Focus on steep snow plod,
                crevassed approach traversal, and headwall ridge ascents.
              </p>
            </div>
          </div>
        </div>

        {/* Alpine Objectives Table */}
        <div className="w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">
                Active Himalayan Registry
              </span>
              <h3 className="font-headline-lg text-headline-lg text-on-surface mt-0.5">
                Alpine Objectives
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Showing {filteredObjectives.length} certified route manifests
              </span>
            </div>
          </div>

          <div className="w-full bg-surface-container-lowest rounded-xl shadow-md overflow-hidden border border-outline-variant/30">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[960px]">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider border-b border-outline-variant/20">
                    <th className="py-4 px-6 font-semibold">
                      Objective &amp; Topo Detail
                    </th>
                    <th className="py-4 px-4 font-semibold">Altitude Band</th>
                    <th className="py-4 px-6 font-semibold text-right">
                      Elevation
                    </th>
                    <th className="py-4 px-4 font-semibold">Season</th>
                    <th className="py-4 px-6 font-semibold">
                      Route &amp; Technical Specs
                    </th>
                    <th className="py-4 px-6 font-semibold">Sherpa Guidance</th>
                    <th className="py-4 px-6 font-semibold text-right">
                      Tariff (Rs.)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 font-body-md text-body-md text-on-surface">
                  {filteredObjectives.map((obj) => (
                    <tr
                      key={obj.id}
                      className="hover:bg-surface-container-low/60 transition-colors group cursor-pointer"
                      onClick={() => setActiveObjective(obj)}
                    >
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          {obj.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              className="w-14 h-14 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform"
                              alt={obj.name}
                              src={obj.image}
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                              <FieldIcon
                                name={obj.icon}
                                fallback="landscape"
                                className="h-7 w-7 shrink-0"
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-headline-sm text-headline-sm text-on-surface font-semibold group-hover:text-primary transition-colors">
                              {obj.name}
                            </div>
                            <div className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-2 mt-0.5">
                              <span>{obj.region}</span>
                              <span>·</span>
                              <span
                                className={`font-medium ${
                                  obj.bandType === "death-zone"
                                    ? "text-tertiary"
                                    : "text-primary"
                                }`}
                              >
                                {obj.permit}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-5 px-4 align-middle">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold whitespace-nowrap ${
                            obj.bandType === "death-zone"
                              ? "bg-tertiary-fixed text-on-tertiary-fixed"
                              : "bg-primary-fixed text-on-primary-fixed"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              obj.bandType === "death-zone"
                                ? "bg-tertiary"
                                : "bg-primary"
                            }`}
                          ></span>
                          {obj.band}
                        </span>
                      </td>

                      <td className="py-5 px-6 text-right align-middle">
                        <div className="font-display-md text-display-md text-primary font-normal leading-none">
                          {obj.elevation.toLocaleString()}
                          <span className="text-sm font-sans text-on-surface-variant ml-0.5">
                            m
                          </span>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant/70 block mt-1">
                          {obj.elevationFt}
                        </span>
                      </td>

                      <td className="py-5 px-4 align-middle">
                        <div className="font-label-lg text-label-lg font-medium text-on-surface">
                          {obj.season}
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">
                          {obj.seasonSub}
                        </div>
                      </td>

                      <td className="py-5 px-6 align-middle">
                        <div className="font-body-md text-body-md font-medium text-on-surface">
                          {obj.route}
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                          {obj.specs}
                        </div>
                      </td>

                      <td className="py-5 px-6 align-middle">
                        <div className="flex flex-col">
                          <span className="font-label-lg text-label-lg font-semibold text-primary">
                            {obj.guideRatio}
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            {obj.guideSpecs}
                          </span>
                        </div>
                      </td>

                      <td className="py-5 px-6 text-right align-middle">
                        <div className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                          Rs.{" "}
                          {obj.bandType === "death-zone"
                            ? "18,50,000"
                            : obj.bandType === "high-alpine"
                            ? "7,80,000"
                            : "4,50,000"}
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant/70 block mt-0.5">
                          Per person
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Technical Callout */}
        <div className="mt-14 p-8 rounded-xl bg-surface-container flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm border border-outline-variant/30">
          <div className="space-y-2 max-w-2xl">
            <span className="font-label-md text-label-md uppercase tracking-widest text-primary font-semibold">
              BROTHERS Alpine Field Standard
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Technical Briefing &amp; Equipment Check
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Every expedition team departs strictly after medical pulse oximeter
              calibration at Namche Bazaar (3,440m) or Samagaun (3,530m).
              Personal high-altitude gear rosters are inspected in Kathmandu by
              certified IFMGA Sherpa instructors prior to Lukla/Soti Khola
              deployment.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              className="px-6 py-3 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-colors shadow-sm inline-flex items-center gap-2"
              href="/contact"
            >
              <span>Request Route Dossier</span>
              <ArrowRight
                className="h-[18px] w-[18px] shrink-0"
                aria-hidden="true"
              />
            </Link>
            <Link
              className="px-6 py-3 rounded-full bg-surface-container-lowest text-on-surface font-label-lg text-label-lg hover:bg-surface-variant transition-colors shadow-sm inline-flex items-center gap-2"
              href="/journal"
            >
              <span>Medical Protocols</span>
              <BadgeCheck
                className="h-[18px] w-[18px] shrink-0"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </div>

      {activeObjective && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 relative border border-outline-variant/30">
            <button
              onClick={() => setActiveObjective(null)}
              type="button"
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high"
            >
              <X className="h-5 w-5 shrink-0" aria-hidden="true" />
            </button>

            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">
                Objective Dossier
              </span>
              <h3 className="font-headline-lg text-headline-lg text-on-surface mt-1">
                {activeObjective.name} (
                {activeObjective.elevation.toLocaleString()}m)
              </h3>
              <p className="font-label-sm text-on-surface-variant">
                {activeObjective.region} · {activeObjective.permit}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-2 border-y border-outline-variant/20">
              <div>
                <span className="font-label-sm uppercase text-on-surface-variant block">
                  Route
                </span>
                <strong className="text-on-surface">
                  {activeObjective.route}
                </strong>
              </div>
              <div>
                <span className="font-label-sm uppercase text-on-surface-variant block">
                  Season
                </span>
                <strong className="text-on-surface">
                  {activeObjective.season} ({activeObjective.seasonSub})
                </strong>
              </div>
              <div>
                <span className="font-label-sm uppercase text-on-surface-variant block">
                  Technical Grade
                </span>
                <strong className="text-on-surface">
                  {activeObjective.specs}
                </strong>
              </div>
              <div>
                <span className="font-label-sm uppercase text-on-surface-variant block">
                  Sherpa Ratio
                </span>
                <strong className="text-primary font-semibold">
                  {activeObjective.guideRatio} · {activeObjective.guideSpecs}
                </strong>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/20">
              <span className="font-label-sm uppercase text-on-surface-variant block mb-1">
                Expedition Tariff
              </span>
              <div className="font-display-md text-display-md text-primary font-normal">
                Rs.{" "}
                {activeObjective.bandType === "death-zone"
                  ? "18,50,000"
                  : activeObjective.bandType === "high-alpine"
                  ? "7,80,000"
                  : "4,50,000"}
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                All-inclusive per person · Permits, guides, logistics, medical
              </span>
            </div>

            <div className="flex gap-4 pt-2">
              <Link
                href="/contact"
                className="flex-1 py-3.5 rounded-full bg-primary-container text-on-primary font-label-lg text-center hover:bg-primary transition-colors"
              >
                Inquire for {activeObjective.name}
              </Link>
              <button
                onClick={() => setActiveObjective(null)}
                type="button"
                className="px-6 py-3.5 rounded-full bg-surface-container text-on-surface font-label-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
