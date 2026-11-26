"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  Globe,
  Loader2,
  Plus,
  Search,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { authFetch } from "@/lib/auth/client";
import { HERO_IMAGE_PRESETS } from "@/lib/admin-presets";
import type { PageSeoDTO, SiteSettingDTO } from "@/lib/types";
import AdminShell, { type AdminIdentityDTO } from "./AdminShell";

type SeoTab = "global" | "pages";

const CORE_ROUTES: { routePath: string; label: string }[] = [
  { routePath: "/", label: "Homepage" },
  { routePath: "/destinations", label: "Destinations Directory" },
  { routePath: "/treks", label: "Trekking Routes" },
  { routePath: "/expeditions", label: "High-Altitude Expeditions" },
  { routePath: "/journal", label: "Alpine Field Journal" },
  { routePath: "/about", label: "About Us" },
  { routePath: "/process", label: "Planning Process" },
  { routePath: "/archive", label: "Expedition Archive" },
  { routePath: "/contact", label: "Contact & Custom Inquiry" },
];

const INPUT_CLS =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] placeholder:text-slate-400 focus:border-[#3f6e15] focus:outline-none focus:ring-2 focus:ring-[#3f6e15]/15";

const LABEL_CLS =
  "block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5";

function LengthBadge({
  length,
  idealMin,
  idealMax,
}: {
  length: number;
  idealMin: number;
  idealMax: number;
}) {
  const good = length >= idealMin && length <= idealMax;
  const over = length > idealMax;
  return (
    <span
      className={`rounded-full border px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums ${
        good
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : over
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-amber-200 bg-amber-50 text-amber-800"
      }`}
    >
      {length} / {idealMax} chars
    </span>
  );
}

function makeEmptyPageSeo(
  routePath: string,
  pageLabel: string,
  settings: SiteSettingDTO
): PageSeoDTO {
  return {
    routePath,
    pageLabel,
    metaTitle: settings.defaultMetaTitle,
    metaDescription: settings.defaultMetaDescription,
    metaKeywords: ["Nepal trekking", "Himalayan expeditions", settings.siteName],
    ogTitle: "",
    ogDescription: "",
    ogImage: settings.defaultOgImage,
    canonicalUrl: "",
    noIndex: false,
    structuredDataJson: null,
  };
}

export default function AdminSeoClient({
  admin,
  permissions,
  initialSettings,
  initialPageSeos,
  siteUrl,
}: {
  admin: AdminIdentityDTO;
  permissions: readonly string[];
  initialSettings: SiteSettingDTO;
  initialPageSeos: PageSeoDTO[];
  siteUrl: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<SeoTab>("global");
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  // Global Site SEO & Analytics state (Company & Social live in /admin/company)
  const [settings, setSettings] = useState({
    defaultMetaTitle: initialSettings.defaultMetaTitle,
    defaultMetaDescription: initialSettings.defaultMetaDescription,
    defaultOgImage: initialSettings.defaultOgImage,
    googleSiteVerification: initialSettings.googleSiteVerification ?? "",
    bingSiteVerification: initialSettings.bingSiteVerification ?? "",
    gaMeasurementId: initialSettings.gaMeasurementId ?? "",
    gtmContainerId: initialSettings.gtmContainerId ?? "",
    facebookPixelId: initialSettings.facebookPixelId ?? "",
  });

  // Per-Page SEO state
  const [pageSeoList, setPageSeoList] = useState<PageSeoDTO[]>(initialPageSeos);
  const [selectedRoute, setSelectedRoute] = useState<string>("/");
  const [customRouteDraft, setCustomRouteDraft] = useState("");
  const [pageForm, setPageForm] = useState<PageSeoDTO>(() => {
    const found = initialPageSeos.find((p) => p.routePath === "/");
    return found ?? makeEmptyPageSeo("/", "Homepage", initialSettings);
  });
  const [keywordsDraft, setKeywordsDraft] = useState<string>(() => {
    const found = initialPageSeos.find((p) => p.routePath === "/");
    return (found?.metaKeywords ?? []).join(", ");
  });

  function selectRoute(routePath: string, labelHint?: string) {
    setSelectedRoute(routePath);
    setStatusMsg(null);
    const existing = pageSeoList.find((p) => p.routePath === routePath);
    const knownLabel =
      labelHint ||
      CORE_ROUTES.find((r) => r.routePath === routePath)?.label ||
      existing?.pageLabel ||
      routePath;

    const nextForm =
      existing ?? makeEmptyPageSeo(routePath, knownLabel, initialSettings);
    setPageForm({
      ...nextForm,
      ogTitle: nextForm.ogTitle ?? "",
      ogDescription: nextForm.ogDescription ?? "",
      ogImage: nextForm.ogImage ?? "",
      canonicalUrl: nextForm.canonicalUrl ?? "",
    });
    setKeywordsDraft((nextForm.metaKeywords ?? []).join(", "));
  }

  function addOrOpenCustomRoute() {
    const raw = customRouteDraft.trim();
    if (!raw) return;
    const normalized = raw.startsWith("/") ? raw : `/${raw}`;
    selectRoute(normalized, normalized);
    setCustomRouteDraft("");
  }

  async function saveGlobalSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await authFetch("/api/admin/seo", {
        method: "PATCH",
        body: JSON.stringify({
          type: "settings",
          ...settings,
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatusMsg({
          type: "err",
          text: json.error || "Unable to save global SEO settings.",
        });
        return;
      }
      setStatusMsg({
        type: "ok",
        text: "Saved Global SEO metadata, search verification & analytics settings.",
      });
      router.refresh();
    } catch {
      setStatusMsg({ type: "err", text: "Network error saving settings." });
    } finally {
      setSaving(false);
    }
  }

  async function savePageSeo(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    const parsedKeywords = keywordsDraft
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await authFetch("/api/admin/seo", {
        method: "PATCH",
        body: JSON.stringify({
          type: "pageSeo",
          routePath: pageForm.routePath,
          pageLabel: pageForm.pageLabel,
          metaTitle: pageForm.metaTitle,
          metaDescription: pageForm.metaDescription,
          metaKeywords: parsedKeywords,
          ogTitle: pageForm.ogTitle || null,
          ogDescription: pageForm.ogDescription || null,
          ogImage: pageForm.ogImage || null,
          canonicalUrl: pageForm.canonicalUrl || null,
          noIndex: pageForm.noIndex,
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        pageSeo?: PageSeoDTO;
      };
      if (!res.ok || !json.ok || !json.pageSeo) {
        setStatusMsg({
          type: "err",
          text: json.error || "Unable to save page SEO override.",
        });
        return;
      }

      const saved = json.pageSeo;
      setPageSeoList((prev) => {
        const exists = prev.some((p) => p.routePath === saved.routePath);
        return exists
          ? prev.map((p) => (p.routePath === saved.routePath ? saved : p))
          : [...prev, saved];
      });
      setStatusMsg({
        type: "ok",
        text: `Updated metadata override for "${saved.routePath}".`,
      });
      router.refresh();
    } catch {
      setStatusMsg({ type: "err", text: "Network error saving page SEO." });
    } finally {
      setSaving(false);
    }
  }

  const extraSavedRoutes = pageSeoList.filter(
    (p) => !CORE_ROUTES.some((c) => c.routePath === p.routePath)
  );

  return (
    <AdminShell
      admin={admin}
      permissions={permissions}
      title="SEO & Search Command Center"
      subtitle="Control Google Search titles, Search Console verification, GA4 analytics, Organization Knowledge Panel links, and per-page metadata."
      actions={
        <Link
          href="/sitemap.xml"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#3f6e15] hover:border-[#3f6e15] transition-colors"
        >
          <span>View Sitemap.xml</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      }
    >
      {/* 2-Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={() => {
            setTab("global");
            setStatusMsg(null);
          }}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${
            tab === "global"
              ? "bg-[#3f6e15] text-white shadow-xs"
              : "border border-slate-200 bg-white text-[#57534d] hover:border-[#3f6e15] hover:text-[#3f6e15]"
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Global SEO, Verification &amp; Analytics</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab("pages");
            setStatusMsg(null);
          }}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${
            tab === "pages"
              ? "bg-[#3f6e15] text-white shadow-xs"
              : "border border-slate-200 bg-white text-[#57534d] hover:border-[#3f6e15] hover:text-[#3f6e15]"
          }`}
        >
          <Search className="h-4 w-4" />
          <span>Per-Page Meta Overrides</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
              tab === "pages"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {pageSeoList.length}
          </span>
        </button>
      </div>

      {statusMsg && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm flex items-center justify-between gap-3 ${
            statusMsg.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <span>{statusMsg.text}</span>
          <button
            type="button"
            onClick={() => setStatusMsg(null)}
            className="text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* TAB 1: GLOBAL SEO & VERIFICATION */}
      {tab === "global" && (
        <form onSubmit={saveGlobalSettings} className="space-y-6">
          {/* Live Google Search Snippet Preview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f05e25] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Live Google Search Preview (Default Site Snippet)
              </p>
              <LengthBadge
                length={settings.defaultMetaTitle.length}
                idealMin={45}
                idealMax={65}
              />
            </div>
            <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-4 max-w-2xl space-y-1">
              <p className="text-xs text-slate-600 truncate">{siteUrl}</p>
              <p className="text-lg font-medium text-[#1a0dab] leading-snug">
                {settings.defaultMetaTitle || initialSettings.siteName}
              </p>
              <p className="text-sm text-[#4d5156] leading-relaxed line-clamp-2">
                {settings.defaultMetaDescription}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Default Metadata */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h2 className="font-heading font-bold text-xl text-[#1c1917] border-b border-slate-100 pb-3">
                Default Global Search Meta
              </h2>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Default Meta Title *
                  </label>
                  <LengthBadge
                    length={settings.defaultMetaTitle.length}
                    idealMin={45}
                    idealMax={65}
                  />
                </div>
                <input
                  type="text"
                  required
                  value={settings.defaultMetaTitle}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      defaultMetaTitle: e.target.value,
                    }))
                  }
                  className={INPUT_CLS}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Default Meta Description *
                  </label>
                  <LengthBadge
                    length={settings.defaultMetaDescription.length}
                    idealMin={110}
                    idealMax={160}
                  />
                </div>
                <textarea
                  rows={3}
                  required
                  value={settings.defaultMetaDescription}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      defaultMetaDescription: e.target.value,
                    }))
                  }
                  className={INPUT_CLS}
                />
              </div>

              <div>
                <label className={LABEL_CLS}>Default OpenGraph Image</label>
                <input
                  type="text"
                  required
                  value={settings.defaultOgImage}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      defaultOgImage: e.target.value,
                    }))
                  }
                  className={`${INPUT_CLS} font-mono text-xs`}
                />
                <select
                  aria-label="Choose OG image preset"
                  value={
                    HERO_IMAGE_PRESETS.some(
                      (p) => p.url === settings.defaultOgImage
                    )
                      ? settings.defaultOgImage
                      : ""
                  }
                  onChange={(e) => {
                    if (e.target.value) {
                      setSettings((p) => ({
                        ...p,
                        defaultOgImage: e.target.value,
                      }));
                    }
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-3 py-2 text-xs text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                >
                  <option value="">Choose image preset...</option>
                  {HERO_IMAGE_PRESETS.map((p) => (
                    <option key={p.url} value={p.url}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            {/* Search Console & Analytics */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h2 className="font-heading font-bold text-xl text-[#1c1917] border-b border-slate-100 pb-3">
                Google Verification &amp; Analytics
              </h2>

              <div>
                <label className={LABEL_CLS}>
                  Google Search Console Verification Token
                </label>
                <input
                  type="text"
                  placeholder="google-site-verification meta content code"
                  value={settings.googleSiteVerification}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      googleSiteVerification: e.target.value,
                    }))
                  }
                  className={`${INPUT_CLS} font-mono text-xs`}
                />
              </div>

              <div>
                <label className={LABEL_CLS}>Bing Webmaster Verification</label>
                <input
                  type="text"
                  placeholder="msvalidate.01 token"
                  value={settings.bingSiteVerification}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      bingSiteVerification: e.target.value,
                    }))
                  }
                  className={`${INPUT_CLS} font-mono text-xs`}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLS}>GA4 Measurement ID</label>
                  <input
                    type="text"
                    placeholder="G-XXXXXXXXXX"
                    value={settings.gaMeasurementId}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        gaMeasurementId: e.target.value,
                      }))
                    }
                    className={`${INPUT_CLS} font-mono text-xs`}
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>GTM Container ID</label>
                  <input
                    type="text"
                    placeholder="GTM-XXXXXXX"
                    value={settings.gtmContainerId}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        gtmContainerId: e.target.value,
                      }))
                    }
                    className={`${INPUT_CLS} font-mono text-xs`}
                  />
                </div>
              </div>

              <div>
                <label className={LABEL_CLS}>Meta / Facebook Pixel ID</label>
                <input
                  type="text"
                  placeholder="Optional numeric pixel ID"
                  value={settings.facebookPixelId}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      facebookPixelId: e.target.value,
                    }))
                  }
                  className={`${INPUT_CLS} font-mono text-xs`}
                />
              </div>
            </section>
          </div>

          {/* Synced Organization & Social Identity Summary (single source in /admin/company) */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-[#f05e25]" />
                <div>
                  <h2 className="font-heading font-bold text-xl text-[#1c1917]">
                    Synced Organization Schema &amp; Social Profiles
                  </h2>
                  <p className="text-xs text-[#57534d]">
                    Managed in one place under Company &amp; Social so contact info
                    and social links stay consistent everywhere.
                  </p>
                </div>
              </div>

              <Link
                href="/admin/company"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#3f6e15]/30 bg-[#3f6e15]/5 hover:bg-[#3f6e15] hover:text-white px-4 py-2 text-xs font-semibold text-[#3f6e15] transition-colors"
              >
                <span>Edit in Company &amp; Social</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
              <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Agency Name
                </span>
                <span className="mt-0.5 block font-semibold text-[#1c1917] truncate">
                  {initialSettings.siteName}
                </span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Contact Email
                </span>
                <span className="mt-0.5 block font-semibold text-[#1c1917] truncate">
                  {initialSettings.contactEmail}
                </span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Phone / WhatsApp
                </span>
                <span className="mt-0.5 block font-semibold text-[#1c1917] truncate">
                  {initialSettings.contactPhone}
                </span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Office Address
                </span>
                <span className="mt-0.5 block font-semibold text-[#1c1917] truncate">
                  {initialSettings.officeAddress}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="font-semibold text-[#57534d] mr-1">
                Active Schema Channels:
              </span>
              {[
                { label: "Facebook", ok: Boolean(initialSettings.facebookUrl) },
                { label: "Instagram", ok: Boolean(initialSettings.instagramUrl) },
                { label: "TikTok", ok: Boolean(initialSettings.tiktokUrl) },
                { label: "WhatsApp", ok: Boolean(initialSettings.whatsappNumber) },
                { label: "YouTube", ok: Boolean(initialSettings.youtubeUrl) },
                { label: "TripAdvisor", ok: Boolean(initialSettings.tripadvisorUrl) },
              ].map((ch) => (
                <span
                  key={ch.label}
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                    ch.ok
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-400"
                  }`}
                >
                  {ch.label}
                </span>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#f05e25] hover:bg-[#d94e18] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 cursor-pointer shadow-xs"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <span>{saving ? "Saving..." : "Save Global SEO Settings"}</span>
              </button>
            </div>
          </section>
        </form>
      )}

      {/* TAB 2: PER-PAGE META OVERRIDES */}
      {tab === "pages" && (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Route Selector Sidebar */}
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 self-start">
            <div>
              <h2 className="font-heading font-bold text-lg text-[#1c1917]">
                Select Route
              </h2>
              <p className="text-xs text-[#57534d]">
                Customize titles, keywords &amp; canonicals per page.
              </p>
            </div>

            <div className="space-y-1.5">
              {CORE_ROUTES.map((r) => {
                const isSelected = selectedRoute === r.routePath;
                const hasCustom = pageSeoList.some(
                  (p) => p.routePath === r.routePath
                );
                return (
                  <button
                    key={r.routePath}
                    type="button"
                    onClick={() => selectRoute(r.routePath, r.label)}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#3f6e15] text-white font-semibold"
                        : "border border-slate-200 bg-[#f8fafc] text-[#1c1917] hover:border-[#3f6e15]"
                    }`}
                  >
                    <span className="truncate">{r.label}</span>
                    <span
                      className={`font-mono text-[10px] shrink-0 ${
                        isSelected
                          ? "text-[#7dd3fc]"
                          : hasCustom
                          ? "text-emerald-700"
                          : "text-slate-400"
                      }`}
                    >
                      {r.routePath}
                    </span>
                  </button>
                );
              })}

              {extraSavedRoutes.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Custom Routes
                  </p>
                  {extraSavedRoutes.map((r) => {
                    const isSelected = selectedRoute === r.routePath;
                    return (
                      <button
                        key={r.routePath}
                        type="button"
                        onClick={() => selectRoute(r.routePath, r.pageLabel)}
                        className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium cursor-pointer ${
                          isSelected
                            ? "bg-[#3f6e15] text-white font-semibold"
                            : "border border-slate-200 bg-[#f8fafc] text-[#1c1917] hover:border-[#3f6e15]"
                        }`}
                      >
                        <span className="truncate font-mono">{r.routePath}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Or Any Route Path
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={customRouteDraft}
                  onChange={(e) => setCustomRouteDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addOrOpenCustomRoute();
                    }
                  }}
                  placeholder="/destinations/region/..."
                  className="flex-1 min-w-0 rounded-xl border border-slate-300 bg-white px-2.5 py-2 font-mono text-xs text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addOrOpenCustomRoute}
                  className="rounded-xl bg-[#3f6e15] hover:bg-[#315710] px-3 py-2 text-white cursor-pointer"
                  aria-label="Open route"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>

          {/* Route Meta Form */}
          <form
            onSubmit={savePageSeo}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-semibold text-[#3f6e15]">
                  {pageForm.routePath}
                </span>
                <h2 className="font-heading font-bold text-2xl text-[#1c1917]">
                  {pageForm.pageLabel}
                </h2>
              </div>
              <Link
                href={pageForm.routePath}
                target="_blank"
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-[#f8fafc] px-3 py-1.5 text-xs font-semibold text-[#3f6e15] hover:border-[#3f6e15]"
              >
                <span>Open Page</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* SERP Preview */}
            <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-4 space-y-1">
              <p className="text-xs text-slate-600 truncate">
                {`${siteUrl}${pageForm.routePath === "/" ? "" : pageForm.routePath}`}
              </p>
              <p className="text-base sm:text-lg font-medium text-[#1a0dab] leading-snug">
                {pageForm.metaTitle}
              </p>
              <p className="text-xs sm:text-sm text-[#4d5156] leading-relaxed line-clamp-2">
                {pageForm.metaDescription}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Meta Title *
                </label>
                <LengthBadge
                  length={pageForm.metaTitle.length}
                  idealMin={45}
                  idealMax={65}
                />
              </div>
              <input
                type="text"
                required
                value={pageForm.metaTitle}
                onChange={(e) =>
                  setPageForm((p) => ({ ...p, metaTitle: e.target.value }))
                }
                className={INPUT_CLS}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Meta Description *
                </label>
                <LengthBadge
                  length={pageForm.metaDescription.length}
                  idealMin={110}
                  idealMax={160}
                />
              </div>
              <textarea
                rows={3}
                required
                value={pageForm.metaDescription}
                onChange={(e) =>
                  setPageForm((p) => ({
                    ...p,
                    metaDescription: e.target.value,
                  }))
                }
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className={LABEL_CLS}>
                Target Keywords (Comma-Separated)
              </label>
              <input
                type="text"
                value={keywordsDraft}
                onChange={(e) => setKeywordsDraft(e.target.value)}
                placeholder="Everest Base Camp Trek, Nepal Trekking, Sherpa Guides"
                className={INPUT_CLS}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLS}>OG Share Image URL</label>
                <input
                  type="text"
                  value={pageForm.ogImage ?? ""}
                  onChange={(e) =>
                    setPageForm((p) => ({ ...p, ogImage: e.target.value }))
                  }
                  placeholder="/images/trips/everest.jpg"
                  className={`${INPUT_CLS} font-mono text-xs`}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>
                  Canonical URL Override (Optional)
                </label>
                <input
                  type="text"
                  value={pageForm.canonicalUrl ?? ""}
                  onChange={(e) =>
                    setPageForm((p) => ({ ...p, canonicalUrl: e.target.value }))
                  }
                  placeholder="Leave blank to auto-generate canonical"
                  className={`${INPUT_CLS} font-mono text-xs`}
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-[#f8fafc] p-3.5 text-sm font-medium text-[#1c1917] cursor-pointer">
              <input
                type="checkbox"
                checked={pageForm.noIndex}
                onChange={(e) =>
                  setPageForm((p) => ({ ...p, noIndex: e.target.checked }))
                }
                className="h-4 w-4 accent-[#f05e25]"
              />
              <span>
                Hide this page from Google search results (`noindex, nofollow`)
              </span>
            </label>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#f05e25] hover:bg-[#d94e18] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 cursor-pointer shadow-xs"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <span>{saving ? "Saving..." : "Save Page SEO"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminShell>
  );
}
