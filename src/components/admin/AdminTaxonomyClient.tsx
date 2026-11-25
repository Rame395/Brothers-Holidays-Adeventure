"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  Edit3,
  Globe2,
  Layers,
  MapPin,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { authFetch } from "@/lib/auth/client";
import { HERO_IMAGE_PRESETS, slugifyClient } from "@/lib/admin-presets";
import { analyzeRegionSeo } from "@/lib/seo-score";
import type {
  AdminCategoryWithCounts,
  AdminCountryWithCounts,
  AdminRegionWithCounts,
} from "@/lib/admin-taxonomy";
import AdminShell, { type AdminIdentityDTO } from "./AdminShell";
import GoogleDocsEditor from "./GoogleDocsEditor";
import RegionSeoScoreMeter from "./RegionSeoScoreMeter";

export type TabKey = "countries" | "categories" | "regions";

interface TaxonomyFormState {
  id: string | null;
  name: string;
  slug: string;
  blurb: string;
  heroImage: string;
  seoContent: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  sortOrder: string;
  isActive: boolean;
  groupByRegion: boolean;
  countryId: string;
}

function makeEmptyForm(defaultCountryId: string): TaxonomyFormState {
  return {
    id: null,
    name: "",
    slug: "",
    blurb: "",
    heroImage: "/images/trips/everest.jpg",
    seoContent: "",
    metaTitle: "",
    metaDescription: "",
    focusKeyword: "",
    sortOrder: "0",
    isActive: true,
    groupByRegion: false,
    countryId: defaultCountryId,
  };
}

export default function AdminTaxonomyClient({
  admin,
  permissions,
  canWrite,
  initialCountries,
  initialCategories,
  initialRegions,
  initialTab = "countries",
}: {
  admin: AdminIdentityDTO;
  permissions: readonly string[];
  canWrite: boolean;
  initialCountries: AdminCountryWithCounts[];
  initialCategories: AdminCategoryWithCounts[];
  initialRegions: AdminRegionWithCounts[];
  initialTab?: TabKey;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [countries, setCountries] = useState(initialCountries);
  const [categories, setCategories] = useState(initialCategories);
  const [regions, setRegions] = useState(initialRegions);

  const [form, setForm] = useState<TaxonomyFormState>(() =>
    makeEmptyForm(initialCountries[0]?.id ?? "")
  );
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  async function reloadTaxonomy() {
    const res = await authFetch("/api/admin/taxonomy", { cache: "no-store" });
    const json = (await res.json()) as {
      ok: boolean;
      countries?: AdminCountryWithCounts[];
      categories?: AdminCategoryWithCounts[];
      regions?: AdminRegionWithCounts[];
    };
    if (res.ok && json.ok) {
      if (json.countries) setCountries(json.countries);
      if (json.categories) setCategories(json.categories);
      if (json.regions) setRegions(json.regions);
    }
    router.refresh();
  }

  function switchTab(nextTab: TabKey) {
    setTab(nextTab);
    setForm(makeEmptyForm(countries[0]?.id ?? ""));
    setSlugTouched(false);
    setStatusMsg(null);
  }

  function resetForm() {
    setForm(makeEmptyForm(countries[0]?.id ?? ""));
    setSlugTouched(false);
  }

  function startEditCountry(c: AdminCountryWithCounts) {
    setTab("countries");
    setForm({
      id: c.id,
      name: c.name,
      slug: c.slug,
      blurb: c.blurb,
      heroImage: c.heroImage,
      seoContent: "",
      metaTitle: "",
      metaDescription: "",
      focusKeyword: "",
      sortOrder: String(c.sortOrder),
      isActive: c.isActive,
      groupByRegion: false,
      countryId: countries[0]?.id ?? "",
    });
    setSlugTouched(true);
    setStatusMsg(null);
  }

  function startEditCategory(cat: AdminCategoryWithCounts) {
    setTab("categories");
    setForm({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      blurb: cat.blurb,
      heroImage: cat.heroImage,
      seoContent: "",
      metaTitle: "",
      metaDescription: "",
      focusKeyword: "",
      sortOrder: String(cat.sortOrder),
      isActive: cat.isActive,
      groupByRegion: cat.groupByRegion,
      countryId: countries[0]?.id ?? "",
    });
    setSlugTouched(true);
    setStatusMsg(null);
  }

  function startEditRegion(r: AdminRegionWithCounts) {
    setTab("regions");
    setForm({
      id: r.id,
      name: r.name,
      slug: r.slug,
      blurb: r.blurb,
      heroImage: r.heroImage,
      seoContent: r.seoContent ?? "",
      metaTitle: r.metaTitle ?? "",
      metaDescription: r.metaDescription ?? "",
      focusKeyword: r.focusKeyword ?? "",
      sortOrder: String(r.sortOrder),
      isActive: r.isActive,
      groupByRegion: false,
      countryId: r.countryId,
    });
    setSlugTouched(true);
    setStatusMsg(null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canWrite) return;
    setSaving(true);
    setStatusMsg(null);

    const isEdit = Boolean(form.id);
    const baseEndpoint =
      tab === "countries"
        ? "/api/admin/taxonomy/countries"
        : tab === "categories"
        ? "/api/admin/taxonomy/categories"
        : "/api/admin/taxonomy/regions";

    const url = isEdit ? `${baseEndpoint}/${form.id}` : baseEndpoint;
    const method = isEdit ? "PATCH" : "POST";

    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugifyClient(form.name),
      blurb: form.blurb.trim(),
      heroImage: form.heroImage.trim() || "/images/trips/everest.jpg",
      sortOrder: Number.parseInt(form.sortOrder || "0", 10) || 0,
      isActive: form.isActive,
    };

    if (tab === "categories") {
      payload.groupByRegion = form.groupByRegion;
    } else if (tab === "regions") {
      payload.countryId = form.countryId;
      payload.seoContent = form.seoContent;
      payload.metaTitle = form.metaTitle.trim() || null;
      payload.metaDescription = form.metaDescription.trim() || null;
      payload.focusKeyword = form.focusKeyword.trim() || null;
    }

    try {
      const res = await authFetch(url, {
        method,
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatusMsg({
          type: "err",
          text: json.error || "Unable to save entry.",
        });
        return;
      }

      await reloadTaxonomy();
      resetForm();
      setStatusMsg({
        type: "ok",
        text: isEdit
          ? "Updated cleanly and refreshed live site menu."
          : "Created and published to the live site menu.",
      });
    } catch {
      setStatusMsg({ type: "err", text: "Network error saving entry." });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(
    entity: TabKey,
    id: string,
    currentActive: boolean
  ) {
    if (!canWrite) return;
    setBusyId(id);
    setStatusMsg(null);
    const endpoint = `/api/admin/taxonomy/${entity}/${id}`;
    try {
      const res = await authFetch(endpoint, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !currentActive }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatusMsg({
          type: "err",
          text: json.error || "Unable to update visibility.",
        });
        return;
      }
      await reloadTaxonomy();
    } catch {
      setStatusMsg({ type: "err", text: "Network error toggling status." });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(entity: TabKey, id: string, label: string) {
    if (!canWrite) return;
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    setBusyId(id);
    setStatusMsg(null);
    const endpoint = `/api/admin/taxonomy/${entity}/${id}`;
    try {
      const res = await authFetch(endpoint, { method: "DELETE" });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatusMsg({
          type: "err",
          text: json.error || "Unable to delete entry.",
        });
        return;
      }
      if (form.id === id) resetForm();
      await reloadTaxonomy();
      setStatusMsg({ type: "ok", text: `Removed "${label}".` });
    } catch {
      setStatusMsg({ type: "err", text: "Network error deleting entry." });
    } finally {
      setBusyId(null);
    }
  }

  const singularLabel =
    tab === "countries" ? "Country" : tab === "categories" ? "Category" : "Region";

  return (
    <AdminShell
      admin={admin}
      permissions={permissions}
      title={
        initialTab === "categories"
          ? "Trip Categories"
          : "Destinations & Taxonomy"
      }
      subtitle={
        initialTab === "categories"
          ? "Create and organize expedition categories (Trekking Routes, Tours, Peak Climbing, etc.) displayed in the live navbar mega-menu."
          : "Control the Countries → Categories → Regions hierarchy powering the live navbar mega-menu and catalog filters."
      }
      actions={
        <Link
          href="/destinations"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#3f6e15] hover:border-[#3f6e15] transition-colors"
        >
          <span>Preview Catalog</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      }
    >
      {/* 3-Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={() => switchTab("countries")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${
            tab === "countries"
              ? "bg-[#3f6e15] text-white shadow-xs"
              : "border border-slate-200 bg-white text-[#57534d] hover:border-[#3f6e15] hover:text-[#3f6e15]"
          }`}
        >
          <Globe2 className="h-4 w-4" />
          <span>Countries</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
              tab === "countries"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {countries.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("categories")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${
            tab === "categories"
              ? "bg-[#3f6e15] text-white shadow-xs"
              : "border border-slate-200 bg-white text-[#57534d] hover:border-[#3f6e15] hover:text-[#3f6e15]"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Categories</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
              tab === "categories"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {categories.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("regions")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${
            tab === "regions"
              ? "bg-[#3f6e15] text-white shadow-xs"
              : "border border-slate-200 bg-white text-[#57534d] hover:border-[#3f6e15] hover:text-[#3f6e15]"
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>Regions</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
              tab === "regions"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {regions.length}
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
            aria-label="Dismiss message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div
        className={
          tab === "regions"
            ? "space-y-6"
            : "grid gap-6 lg:grid-cols-[380px_1fr]"
        }
      >
        {/* Add / Edit Form Panel */}
        <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 self-start">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-heading font-bold text-xl text-[#1c1917]">
              {form.id ? `Edit ${singularLabel}` : `Add ${singularLabel}`}
            </h2>
            {form.id && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-[#3f6e15] hover:underline cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {!canWrite ? (
            <p className="text-sm text-[#57534d] leading-relaxed">
              Your role has read-only access to destinations taxonomy. Contact a Super Admin or Editor to add or modify entries.
            </p>
          ) : tab === "regions" ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] items-start">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                        Parent Country
                      </label>
                      <select
                        required
                        value={form.countryId}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            countryId: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none focus:ring-2 focus:ring-[#3f6e15]/15"
                      >
                        {countries.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.slug})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                        Display Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Annapurna Region"
                        value={form.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          setForm((prev) => ({
                            ...prev,
                            name,
                            slug: slugTouched ? prev.slug : slugifyClient(name),
                          }));
                        }}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] placeholder:text-slate-400 focus:border-[#3f6e15] focus:outline-none focus:ring-2 focus:ring-[#3f6e15]/15"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                        URL / Filter Slug
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="auto-generated-slug"
                        value={form.slug}
                        onChange={(e) => {
                          setSlugTouched(true);
                          setForm((prev) => ({
                            ...prev,
                            slug: slugifyClient(e.target.value),
                          }));
                        }}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-xs text-[#3f6e15] placeholder:text-slate-400 focus:border-[#3f6e15] focus:outline-none focus:ring-2 focus:ring-[#3f6e15]/15"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                        Banner Image Path / URL
                      </label>
                      <input
                        type="text"
                        required
                        value={form.heroImage}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            heroImage: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-xs text-[#1c1917] focus:border-[#3f6e15] focus:outline-none focus:ring-2 focus:ring-[#3f6e15]/15"
                      />
                    </div>
                  </div>

                  <select
                    aria-label="Quick image preset"
                    value={
                      HERO_IMAGE_PRESETS.some((p) => p.url === form.heroImage)
                        ? form.heroImage
                        : ""
                    }
                    onChange={(e) => {
                      if (e.target.value) {
                        setForm((prev) => ({ ...prev, heroImage: e.target.value }));
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-3 py-2 text-xs text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                  >
                    <option value="">Choose local image preset...</option>
                    {HERO_IMAGE_PRESETS.map((preset) => (
                      <option key={preset.url} value={preset.url}>
                        {preset.label} ({preset.url})
                      </option>
                    ))}
                  </select>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Short Banner Blurb
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief editorial line for menus and banners..."
                      value={form.blurb}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, blurb: e.target.value }))
                      }
                      className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] placeholder:text-slate-400 focus:border-[#3f6e15] focus:outline-none focus:ring-2 focus:ring-[#3f6e15]/15"
                    />
                  </div>

                  {/* SEO Meta Fields */}
                  <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-4 space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f05e25]">
                      Region SEO Metadata
                    </p>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Focus Keyword
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Annapurna Region Trekking"
                        value={form.focusKeyword}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            focusKeyword: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-[#1c1917] placeholder:text-slate-400 focus:border-[#f05e25] focus:outline-none focus:ring-2 focus:ring-[#f05e25]/15"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Meta Title (45–65 chars)
                        </label>
                        <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                          {form.metaTitle.trim().length} / 65
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={160}
                        placeholder="e.g. Annapurna Region Trekking Guide: Routes, Permits & Best Seasons"
                        value={form.metaTitle}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            metaTitle: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-[#1c1917] placeholder:text-slate-400 focus:border-[#f05e25] focus:outline-none focus:ring-2 focus:ring-[#f05e25]/15"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Meta Description (120–165 chars)
                        </label>
                        <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                          {form.metaDescription.trim().length} / 165
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        maxLength={320}
                        placeholder="Compelling search result summary highlighting routes, altitudes, acclimatization, and local Sherpa expertise..."
                        value={form.metaDescription}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            metaDescription: e.target.value,
                          }))
                        }
                        className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-[#1c1917] placeholder:text-slate-400 focus:border-[#f05e25] focus:outline-none focus:ring-2 focus:ring-[#f05e25]/15"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={9999}
                        value={form.sortOrder}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            sortOrder: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none focus:ring-2 focus:ring-[#3f6e15]/15"
                      />
                    </div>

                    <label className="flex items-center gap-2 pt-5 text-sm font-medium text-[#1c1917] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            isActive: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 accent-[#3f6e15]"
                      />
                      <span>Active on site</span>
                    </label>
                  </div>
                </div>

                {/* Live SEO Score Meter */}
                <RegionSeoScoreMeter
                  name={form.name}
                  slug={form.slug}
                  focusKeyword={form.focusKeyword}
                  metaTitle={form.metaTitle}
                  metaDescription={form.metaDescription}
                  seoContent={form.seoContent}
                />
              </div>

              {/* Full-Width Google Docs-Style Content Editor */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
                    <span className="h-2 w-2 rounded-full bg-[#f05e25]" />
                    <span>Region Guide Content (Displayed Below Trip Cards)</span>
                  </label>
                  <span className="text-xs text-slate-500">
                    Rich text, headings (H2/H3), links, images &amp; tables
                  </span>
                </div>

                <GoogleDocsEditor
                  value={form.seoContent}
                  onChange={(html) =>
                    setForm((prev) => ({ ...prev, seoContent: html }))
                  }
                  disabled={!canWrite}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                {form.id && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f05e25] hover:bg-[#d94e18] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60 cursor-pointer transition-colors shadow-xs"
                >
                  {form.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  <span>
                    {saving
                      ? "Saving..."
                      : form.id
                      ? "Save Region & SEO Content"
                      : "Create Region"}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    tab === "countries"
                      ? "e.g. India"
                      : tab === "categories"
                      ? "e.g. Cycling & MTB"
                      : "e.g. Ladakh Region"
                  }
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      name,
                      slug: slugTouched ? prev.slug : slugifyClient(name),
                    }));
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] placeholder:text-slate-400 focus:border-[#3f6e15] focus:outline-none focus:ring-2 focus:ring-[#3f6e15]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  URL / Filter Slug
                </label>
                <input
                  type="text"
                  required
                  placeholder="auto-generated-slug"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setForm((prev) => ({
                      ...prev,
                      slug: slugifyClient(e.target.value),
                    }));
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-xs text-[#3f6e15] placeholder:text-slate-400 focus:border-[#3f6e15] focus:outline-none focus:ring-2 focus:ring-[#3f6e15]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Short Blurb
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief editorial line for menus and banners..."
                  value={form.blurb}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, blurb: e.target.value }))
                  }
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] placeholder:text-slate-400 focus:border-[#3f6e15] focus:outline-none focus:ring-2 focus:ring-[#3f6e15]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Banner Image Path / URL
                </label>
                <input
                  type="text"
                  required
                  value={form.heroImage}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, heroImage: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-xs text-[#1c1917] focus:border-[#3f6e15] focus:outline-none focus:ring-2 focus:ring-[#3f6e15]/15"
                />
                <select
                  aria-label="Quick image preset"
                  value={
                    HERO_IMAGE_PRESETS.some((p) => p.url === form.heroImage)
                      ? form.heroImage
                      : ""
                  }
                  onChange={(e) => {
                    if (e.target.value) {
                      setForm((prev) => ({ ...prev, heroImage: e.target.value }));
                    }
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-3 py-2 text-xs text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                >
                  <option value="">Choose local image preset...</option>
                  {HERO_IMAGE_PRESETS.map((preset) => (
                    <option key={preset.url} value={preset.url}>
                      {preset.label} ({preset.url})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={9999}
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, sortOrder: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none focus:ring-2 focus:ring-[#3f6e15]/15"
                  />
                </div>

                <label className="flex items-center gap-2 pt-5 text-sm font-medium text-[#1c1917] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-[#3f6e15]"
                  />
                  <span>Active on site</span>
                </label>
              </div>

              {tab === "categories" && (
                <label className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-[#f8fafc] p-3.5 text-sm text-[#1c1917] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.groupByRegion}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        groupByRegion: e.target.checked,
                      }))
                    }
                    className="mt-1 h-4 w-4 accent-[#3f6e15]"
                  />
                  <span>
                    <strong className="block text-sm font-semibold text-[#1c1917]">
                      Group Mega-Menu by Region
                    </strong>
                    <span className="text-xs text-[#57534d]">
                      Displays regional columns (e.g. Everest Region, Annapurna Region) instead of a flat list.
                    </span>
                  </span>
                </label>
              )}

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f05e25] hover:bg-[#d94e18] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 cursor-pointer transition-colors shadow-xs"
              >
                {form.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>
                  {saving
                    ? "Saving..."
                    : form.id
                    ? `Save ${singularLabel}`
                    : `Create ${singularLabel}`}
                </span>
              </button>
            </form>
          )}
        </section>

        {/* Live Data Table */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h2 className="font-heading font-bold text-xl text-[#1c1917]">
              {tab === "countries"
                ? "Configured Countries"
                : tab === "categories"
                ? "Configured Categories"
                : "Configured Regions"}
            </h2>
            <span className="text-xs font-medium text-[#57534d]">
              Updates sync immediately to public navigation
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4">{singularLabel}</th>
                  <th className="pb-3 pr-4">Slug</th>
                  {tab === "regions" && <th className="pb-3 pr-4">Country</th>}
                  {tab === "regions" && <th className="pb-3 pr-4">SEO Score</th>}
                  {tab === "categories" && <th className="pb-3 pr-4">Layout</th>}
                  <th className="pb-3 pr-4">Order</th>
                  <th className="pb-3 pr-4">Usage</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tab === "countries" &&
                  countries.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={c.heroImage}
                            alt={c.name}
                            className="h-10 w-14 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-[#1c1917]">
                              {c.name}
                            </p>
                            {c.blurb && (
                              <p className="text-xs text-[#57534d] line-clamp-1 max-w-[240px]">
                                {c.blurb}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 font-mono text-xs text-[#3f6e15]">
                        {c.slug}
                      </td>
                      <td className="py-3.5 pr-4 font-medium text-[#57534d] tabular-nums">
                        {c.sortOrder}
                      </td>
                      <td className="py-3.5 pr-4 text-xs font-medium text-[#57534d] tabular-nums whitespace-nowrap">
                        {c.tripCount} trips · {c.regionCount} regions
                      </td>
                      <td className="py-3.5 pr-4">
                        <button
                          type="button"
                          disabled={!canWrite || busyId === c.id}
                          onClick={() =>
                            handleToggleActive("countries", c.id, c.isActive)
                          }
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold cursor-pointer disabled:opacity-60 ${
                            c.isActive
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-100 text-slate-500"
                          }`}
                        >
                          {c.isActive ? "ACTIVE" : "HIDDEN"}
                        </button>
                      </td>
                      <td className="py-3.5 text-right whitespace-nowrap">
                        {canWrite && (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => startEditCountry(c)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-[#1c1917] hover:border-[#3f6e15] hover:text-[#3f6e15] cursor-pointer"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              disabled={busyId === c.id}
                              onClick={() =>
                                handleDelete("countries", c.id, c.name)
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}

                {tab === "categories" &&
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={cat.heroImage}
                            alt={cat.name}
                            className="h-10 w-14 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-[#1c1917]">
                              {cat.name}
                            </p>
                            {cat.blurb && (
                              <p className="text-xs text-[#57534d] line-clamp-1 max-w-[220px]">
                                {cat.blurb}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 font-mono text-xs text-[#3f6e15]">
                        {cat.slug}
                      </td>
                      <td className="py-3.5 pr-4 text-xs font-medium text-[#57534d]">
                        {cat.groupByRegion ? "By Region" : "Grid"}
                      </td>
                      <td className="py-3.5 pr-4 font-medium text-[#57534d] tabular-nums">
                        {cat.sortOrder}
                      </td>
                      <td className="py-3.5 pr-4 text-xs font-medium text-[#57534d] tabular-nums whitespace-nowrap">
                        {cat.tripCount} trips
                      </td>
                      <td className="py-3.5 pr-4">
                        <button
                          type="button"
                          disabled={!canWrite || busyId === cat.id}
                          onClick={() =>
                            handleToggleActive(
                              "categories",
                              cat.id,
                              cat.isActive
                            )
                          }
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold cursor-pointer disabled:opacity-60 ${
                            cat.isActive
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-100 text-slate-500"
                          }`}
                        >
                          {cat.isActive ? "ACTIVE" : "HIDDEN"}
                        </button>
                      </td>
                      <td className="py-3.5 text-right whitespace-nowrap">
                        {canWrite && (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => startEditCategory(cat)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-[#1c1917] hover:border-[#3f6e15] hover:text-[#3f6e15] cursor-pointer"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              disabled={busyId === cat.id}
                              onClick={() =>
                                handleDelete("categories", cat.id, cat.name)
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}

                {tab === "regions" &&
                  regions.map((reg) => {
                    const hasContent = Boolean(reg.seoContent?.trim());
                    const seoAnalysis = hasContent
                      ? analyzeRegionSeo({
                          name: reg.name,
                          slug: reg.slug,
                          focusKeyword: reg.focusKeyword,
                          metaTitle: reg.metaTitle,
                          metaDescription: reg.metaDescription,
                          htmlContent: reg.seoContent,
                        })
                      : null;
                    const scoreColor = !seoAnalysis
                      ? "border-slate-200 bg-slate-100 text-slate-500"
                      : seoAnalysis.score >= 80
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : seoAnalysis.score >= 60
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : seoAnalysis.score >= 35
                      ? "border-orange-200 bg-orange-50 text-[#d94e18]"
                      : "border-rose-200 bg-rose-50 text-rose-700";

                    return (
                    <tr key={reg.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={reg.heroImage}
                            alt={reg.name}
                            className="h-10 w-14 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <p className="font-semibold text-[#1c1917]">
                            {reg.name}
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 font-mono text-xs text-[#3f6e15]">
                        {reg.slug}
                      </td>
                      <td className="py-3.5 pr-4 text-sm text-[#57534d]">
                        {reg.countryName}
                      </td>
                      <td className="py-3.5 pr-4 whitespace-nowrap">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tabular-nums ${scoreColor}`}
                        >
                          {seoAnalysis ? `SEO ${seoAnalysis.score}/100` : "No SEO Content"}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 font-medium text-[#57534d] tabular-nums">
                        {reg.sortOrder}
                      </td>
                      <td className="py-3.5 pr-4 text-xs font-medium text-[#57534d] tabular-nums whitespace-nowrap">
                        {reg.tripCount} trips
                      </td>
                      <td className="py-3.5 pr-4">
                        <button
                          type="button"
                          disabled={!canWrite || busyId === reg.id}
                          onClick={() =>
                            handleToggleActive("regions", reg.id, reg.isActive)
                          }
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold cursor-pointer disabled:opacity-60 ${
                            reg.isActive
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-100 text-slate-500"
                          }`}
                        >
                          {reg.isActive ? "ACTIVE" : "HIDDEN"}
                        </button>
                      </td>
                      <td className="py-3.5 text-right whitespace-nowrap">
                        {canWrite && (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => startEditRegion(reg)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-[#1c1917] hover:border-[#3f6e15] hover:text-[#3f6e15] cursor-pointer"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              disabled={busyId === reg.id}
                              onClick={() =>
                                handleDelete("regions", reg.id, reg.name)
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
