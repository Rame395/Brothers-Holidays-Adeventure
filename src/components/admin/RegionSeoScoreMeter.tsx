"use client";

import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Globe, Search, XCircle } from "lucide-react";
import { analyzeRegionSeo } from "@/lib/seo-score";

export default function RegionSeoScoreMeter({
  name,
  slug,
  focusKeyword,
  metaTitle,
  metaDescription,
  seoContent,
  urlPrefix = "/destinations/region/",
}: {
  name: string;
  slug: string;
  focusKeyword: string;
  metaTitle: string;
  metaDescription: string;
  seoContent: string;
  urlPrefix?: string;
}) {
  const analysis = useMemo(
    () =>
      analyzeRegionSeo({
        name: name || "Region Name",
        slug: slug || "region-slug",
        focusKeyword,
        metaTitle,
        metaDescription,
        htmlContent: seoContent,
      }),
    [name, slug, focusKeyword, metaTitle, metaDescription, seoContent]
  );

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - analysis.score / 100);

  const tone =
    analysis.score >= 80
      ? {
          stroke: "#059669",
          badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        }
      : analysis.score >= 60
      ? {
          stroke: "#d97706",
          badge: "bg-amber-50 text-amber-800 border-amber-200",
        }
      : analysis.score >= 35
      ? {
          stroke: "#f05e25",
          badge: "bg-orange-50 text-[#d94e18] border-orange-200",
        }
      : {
          stroke: "#e11d48",
          badge: "bg-rose-50 text-rose-700 border-rose-200",
        };

  const previewTitle =
    metaTitle.trim() ||
    `${name || "Region"} Treks & Guided Routes | BROTHERS Holidays Adventure`;
  const previewDesc =
    metaDescription.trim() ||
    "Add a Meta Description to control how this region guide appears in Google search results.";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
      {/* Header + Gauge */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r={radius}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="8"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                fill="none"
                stroke={tone.stroke}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading text-2xl font-bold text-[#1c1917] tabular-nums leading-none">
                {analysis.score}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                / 100
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3f6e15]">
              Live SEO Score Meter
            </p>
            <span
              className={`inline-block rounded-full border px-3 py-0.5 text-xs font-bold ${tone.badge}`}
            >
              {analysis.grade}
            </span>
            <p className="text-xs text-[#57534d]">
              Updates live as you edit title, keyword, and Docs content.
            </p>
          </div>
        </div>
      </div>

      {/* Quick KPI Strip */}
      <div className="grid grid-cols-4 gap-2 text-center tabular-nums">
        <div className="rounded-xl bg-[#f8fafc] border border-slate-200/80 p-2">
          <div className="font-heading text-base font-bold text-[#1c1917]">
            {analysis.wordCount}
          </div>
          <div className="text-[10px] font-semibold uppercase text-slate-500">
            Words
          </div>
        </div>
        <div className="rounded-xl bg-[#f8fafc] border border-slate-200/80 p-2">
          <div className="font-heading text-base font-bold text-[#1c1917]">
            {analysis.headingCount}
          </div>
          <div className="text-[10px] font-semibold uppercase text-slate-500">
            H2/H3
          </div>
        </div>
        <div className="rounded-xl bg-[#f8fafc] border border-slate-200/80 p-2">
          <div className="font-heading text-base font-bold text-[#1c1917]">
            {analysis.keywordDensity}%
          </div>
          <div className="text-[10px] font-semibold uppercase text-slate-500">
            Density
          </div>
        </div>
        <div className="rounded-xl bg-[#f8fafc] border border-slate-200/80 p-2">
          <div className="font-heading text-base font-bold text-[#1c1917]">
            {analysis.linkCount + analysis.imageCount}
          </div>
          <div className="text-[10px] font-semibold uppercase text-slate-500">
            Media/Links
          </div>
        </div>
      </div>

      {/* Google SERP Preview */}
      <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-3.5 space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          <Search className="h-3 w-3 text-[#f05e25]" />
          <span>Google Search Preview</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 truncate">
          <Globe className="h-3 w-3 shrink-0" />
          <span className="truncate">
            brothersholidays.com{urlPrefix}{slug || "slug"}
          </span>
        </div>
        <p className="text-sm font-semibold text-[#1a0dab] line-clamp-1">
          {previewTitle}
        </p>
        <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
          {previewDesc}
        </p>
      </div>

      {/* Actionable Checklist */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
          SEO Optimization Checklist (10 checks)
        </p>
        <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
          {analysis.checks.map((c) => (
            <div
              key={c.id}
              className="flex items-start justify-between gap-2.5 rounded-xl border border-slate-100 bg-[#f8fafc]/70 px-3 py-2 text-xs"
            >
              <div className="flex items-start gap-2 min-w-0">
                {c.status === "pass" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : c.status === "warn" ? (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-[#1c1917]">{c.label}</p>
                  <p className="text-[11px] text-[#57534d] leading-snug">
                    {c.hint}
                  </p>
                </div>
              </div>
              <span className="shrink-0 font-mono text-[11px] font-semibold text-slate-500 tabular-nums">
                {c.points}/{c.maxPoints}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
