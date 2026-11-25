"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Edit3,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import AdminShell, { type AdminIdentityDTO } from "@/components/admin/AdminShell";
import GoogleDocsEditor from "@/components/admin/GoogleDocsEditor";
import RegionSeoScoreMeter from "@/components/admin/RegionSeoScoreMeter";
import { HERO_IMAGE_PRESETS } from "@/lib/admin-presets";
import { authFetch } from "@/lib/auth/client";
import { analyzeRegionSeo } from "@/lib/seo-score";

export interface AdminTravelGuideDTO {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  location: string;
  heroImage: string;
  content: string;
  focusKeyword: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GuideFormState {
  title: string;
  slug: string;
  subtitle: string;
  location: string;
  heroImage: string;
  content: string;
  focusKeyword: string;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
}

const EMPTY_FORM: GuideFormState = {
  title: "",
  slug: "",
  subtitle: "",
  location: "Nepal",
  heroImage: "/images/trips/kathmandu.jpg",
  content: "",
  focusKeyword: "",
  metaTitle: "",
  metaDescription: "",
  isPublished: true,
};

function quickSlugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

export default function AdminGuidesClient({
  admin,
  permissions,
  canWrite,
  initialGuides,
}: {
  admin: AdminIdentityDTO;
  permissions: readonly string[];
  canWrite: boolean;
  initialGuides: AdminTravelGuideDTO[];
}) {
  const [guides, setGuides] = useState<AdminTravelGuideDTO[]>(initialGuides);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [form, setForm] = useState<GuideFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const effectiveSlug = useMemo(
    () => (form.slug.trim() ? quickSlugify(form.slug) : quickSlugify(form.title)),
    [form.slug, form.title]
  );

  const startNew = () => {
    setEditingId(null);
    setSlugManuallyEdited(false);
    setForm(EMPTY_FORM);
    setStatusMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startEdit = (g: AdminTravelGuideDTO) => {
    setEditingId(g.id);
    setSlugManuallyEdited(true);
    setForm({
      title: g.title,
      slug: g.slug,
      subtitle: g.subtitle,
      location: g.location,
      heroImage: g.heroImage,
      content: g.content,
      focusKeyword: g.focusKeyword ?? "",
      metaTitle: g.metaTitle ?? "",
      metaDescription: g.metaDescription ?? "",
      isPublished: g.isPublished,
    });
    setStatusMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite || saving) return;

    setSaving(true);
    setStatusMsg(null);

    try {
      const payload = {
        title: form.title.trim(),
        slug: effectiveSlug || undefined,
        subtitle: form.subtitle.trim(),
        location: form.location.trim() || "Nepal",
        heroImage: form.heroImage.trim() || "/images/trips/kathmandu.jpg",
        content: form.content,
        focusKeyword: form.focusKeyword.trim() || null,
        metaTitle: form.metaTitle.trim() || null,
        metaDescription: form.metaDescription.trim() || null,
        isPublished: form.isPublished,
      };

      const url = editingId
        ? `/api/admin/guides/${editingId}`
        : "/api/admin/guides";
      const method = editingId ? "PATCH" : "POST";

      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        guide?: AdminTravelGuideDTO;
      };

      if (!res.ok || !json.ok || !json.guide) {
        setStatusMsg({
          type: "err",
          text: json.error || "Could not save travel guide.",
        });
        return;
      }

      const savedGuide = json.guide;
      setGuides((prev) => {
        if (editingId) {
          return prev.map((item) => (item.id === editingId ? savedGuide : item));
        }
        return [savedGuide, ...prev];
      });

      setEditingId(savedGuide.id);
      setSlugManuallyEdited(true);
      setForm({
        title: savedGuide.title,
        slug: savedGuide.slug,
        subtitle: savedGuide.subtitle,
        location: savedGuide.location,
        heroImage: savedGuide.heroImage,
        content: savedGuide.content,
        focusKeyword: savedGuide.focusKeyword ?? "",
        metaTitle: savedGuide.metaTitle ?? "",
        metaDescription: savedGuide.metaDescription ?? "",
        isPublished: savedGuide.isPublished,
      });

      setStatusMsg({
        type: "ok",
        text: editingId
          ? `Updated "${savedGuide.title}" and revalidated /guides/${savedGuide.slug}.`
          : `Created "${savedGuide.title}" at /guides/${savedGuide.slug}.`,
      });
    } catch {
      setStatusMsg({
        type: "err",
        text: "Network error while saving travel guide.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (guide: AdminTravelGuideDTO) => {
    if (!canWrite || deletingId) return;
    const confirmed = window.confirm(
      `Delete travel guide "${guide.title}"? Itinerary days pointing to /guides/${guide.slug} will no longer resolve.`
    );
    if (!confirmed) return;

    setDeletingId(guide.id);
    setStatusMsg(null);

    try {
      const res = await authFetch(`/api/admin/guides/${guide.id}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatusMsg({
          type: "err",
          text: json.error || "Could not delete travel guide.",
        });
        return;
      }

      setGuides((prev) => prev.filter((item) => item.id !== guide.id));
      if (editingId === guide.id) {
        startNew();
      }
      setStatusMsg({
        type: "ok",
        text: `Deleted "${guide.title}".`,
      });
    } catch {
      setStatusMsg({
        type: "err",
        text: "Network error while deleting travel guide.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminShell
      admin={admin}
      permissions={permissions}
      title="Travel Guides & Destination Wikis"
      subtitle="Write SEO-optimized stop guides (Kathmandu, Namche Bazaar, Lukla, etc.) and attach them to itinerary days."
      actions={
        editingId ? (
          <button
            type="button"
            onClick={startNew}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#3f6e15] hover:bg-[#315710] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Guide</span>
          </button>
        ) : null
      }
    >
      <div className="space-y-8">
        {statusMsg && (
          <div
            className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
              statusMsg.type === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{statusMsg.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMsg(null)}
              className="rounded-lg p-1 hover:bg-black/5 cursor-pointer"
              aria-label="Dismiss status message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Guide Editor Form + Live SEO Meter */}
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#3f6e15]/10 text-[#3f6e15]">
                <BookOpen className="h-4.5 w-4.5" />
              </span>
              <div>
                <h2 className="font-heading text-xl font-bold text-[#1c1917]">
                  {editingId ? "Edit Travel Guide" : "Create New Travel Guide"}
                </h2>
                <p className="text-xs text-[#57534d]">
                  Live preview:{" "}
                  <span className="font-mono text-[#3f6e15]">
                    /guides/{effectiveSlug || "your-guide-slug"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {editingId && effectiveSlug && (
                <Link
                  href={`/guides/${effectiveSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-[#f8fafc] hover:border-[#3f6e15] hover:text-[#3f6e15] px-3.5 py-2 text-xs font-semibold text-[#1c1917] transition-colors"
                >
                  <span>Preview Live</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              )}

              {canWrite && (
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#f05e25] hover:bg-[#d94e18] disabled:opacity-60 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>
                    {saving
                      ? "Saving..."
                      : editingId
                      ? "Save Changes"
                      : "Publish Guide"}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* 2-Column Metadata + Live SEO Score Meter */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1.5">
                    Guide Title (Shown as Pill Label &amp; Page H1) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!canWrite}
                    value={form.title}
                    onChange={(e) => {
                      const nextTitle = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        title: nextTitle,
                        slug: slugManuallyEdited
                          ? prev.slug
                          : quickSlugify(nextTitle),
                      }));
                    }}
                    placeholder="e.g. Kathmandu, Nepal: Complete Travel Guide to Attractions, Culture & Things to Do"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    disabled={!canWrite}
                    value={form.slug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setForm((prev) => ({ ...prev, slug: e.target.value }));
                    }}
                    placeholder="kathmandu-nepal-travel-guide"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1.5">
                    Location / Stop Name
                  </label>
                  <input
                    type="text"
                    disabled={!canWrite}
                    value={form.location}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, location: e.target.value }))
                    }
                    placeholder="Kathmandu, Nepal"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1.5">
                  Short Subtitle / Lead Summary
                </label>
                <input
                  type="text"
                  disabled={!canWrite}
                  value={form.subtitle}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, subtitle: e.target.value }))
                  }
                  placeholder="Ancient stupas, mountain gear prep, heritage squares, and pre-trek rituals in Nepal's capital."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1.5">
                    Hero Image Path / URL
                  </label>
                  <input
                    type="text"
                    disabled={!canWrite}
                    value={form.heroImage}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        heroImage: e.target.value,
                      }))
                    }
                    placeholder="/images/trips/kathmandu.jpg"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1.5">
                    Choose Preset Cover Photo
                  </label>
                  <select
                    disabled={!canWrite}
                    value={
                      HERO_IMAGE_PRESETS.some((p) => p.url === form.heroImage)
                        ? form.heroImage
                        : ""
                    }
                    onChange={(e) => {
                      if (e.target.value) {
                        setForm((prev) => ({
                          ...prev,
                          heroImage: e.target.value,
                        }));
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                  >
                    <option value="">Custom path / URL...</option>
                    {HERO_IMAGE_PRESETS.map((preset) => (
                      <option key={preset.url} value={preset.url}>
                        {preset.label} ({preset.url})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SEO Metadata Panel */}
              <div className="rounded-2xl border border-[#f05e25]/25 bg-[#fffaf7] p-4 space-y-3.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f05e25]">
                  Guide SEO Metadata
                </p>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1">
                    Focus Keyword
                  </label>
                  <input
                    type="text"
                    disabled={!canWrite}
                    value={form.focusKeyword}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        focusKeyword: e.target.value,
                      }))
                    }
                    placeholder="e.g. Kathmandu travel guide"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#57534d]">
                      Meta Title (45–65 chars)
                    </label>
                    <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                      {form.metaTitle.trim().length} / 65
                    </span>
                  </div>
                  <input
                    type="text"
                    disabled={!canWrite}
                    value={form.metaTitle}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        metaTitle: e.target.value,
                      }))
                    }
                    placeholder="Kathmandu Travel Guide: Top Things to Do Before Your Trek"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#57534d]">
                      Meta Description (120–165 chars)
                    </label>
                    <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                      {form.metaDescription.trim().length} / 165
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    disabled={!canWrite}
                    value={form.metaDescription}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        metaDescription: e.target.value,
                      }))
                    }
                    placeholder="Explore Kathmandu's UNESCO temples, Thamel gear shops, local cuisine, and acclimatization tips before heading to Everest or Annapurna."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2.5 text-sm font-medium text-[#1c1917] cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!canWrite}
                  checked={form.isPublished}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      isPublished: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-[#3f6e15] focus:ring-[#3f6e15]"
                />
                <span>Published &amp; available to attach in itinerary days</span>
              </label>
            </div>

            <div className="lg:col-span-5">
              <RegionSeoScoreMeter
                name={form.title || "Travel Guide"}
                slug={effectiveSlug || "travel-guide"}
                focusKeyword={form.focusKeyword}
                metaTitle={form.metaTitle}
                metaDescription={form.metaDescription}
                seoContent={form.content}
                urlPrefix="/guides/"
              />
            </div>
          </div>

          {/* Full-Width Google Docs Rich Content Editor */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#3f6e15]">
                Guide Article Body (Google Docs Editor)
              </label>
              <span className="text-xs text-[#57534d]">
                Supports headings, rich formatting, tables, images, and links
              </span>
            </div>

            <GoogleDocsEditor
              value={form.content}
              disabled={!canWrite}
              onChange={(html) =>
                setForm((prev) => ({ ...prev, content: html }))
              }
              placeholder="Write your complete stop guide here (attractions, altitude tips, culture, food, gear checklists)..."
            />
          </div>
        </form>

        {/* Saved Travel Guides Directory */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-heading text-xl font-bold text-[#1c1917]">
                Published &amp; Draft Travel Guides ({guides.length})
              </h2>
              <p className="text-xs text-[#57534d]">
                Attach any guide below directly to itinerary days in Trips &amp;
                Packages.
              </p>
            </div>
          </div>

          {guides.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-[#f8fafc] p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-[#1c1917]">
                No travel guides created yet
              </p>
              <p className="text-xs text-[#57534d]">
                Create your first guide above (e.g. &ldquo;Kathmandu, Nepal:
                Complete Travel Guide&rdquo;) to start linking rich SEO stop
                guides inside trip itineraries.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guides.map((g) => {
                const seo = analyzeRegionSeo({
                  name: g.title,
                  slug: g.slug,
                  focusKeyword: g.focusKeyword ?? "",
                  metaTitle: g.metaTitle ?? "",
                  metaDescription: g.metaDescription ?? "",
                  htmlContent: g.content,
                });

                const scoreTone =
                  seo.score >= 80
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : seo.score >= 60
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-orange-50 text-[#d94e18] border-orange-200";

                return (
                  <div
                    key={g.id}
                    className={`rounded-xl border p-4 transition-all flex flex-col justify-between gap-4 ${
                      editingId === g.id
                        ? "border-[#3f6e15] bg-[#3f6e15]/[0.03] ring-1 ring-[#3f6e15]/20"
                        : "border-slate-200 bg-[#f8fafc]/60 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={g.heroImage || "/images/trips/kathmandu.jpg"}
                        alt={g.title}
                        className="h-16 w-20 shrink-0 rounded-lg object-cover border border-slate-200"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                              g.isPublished
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-slate-100 text-slate-600"
                            }`}
                          >
                            {g.isPublished ? "Published" : "Draft"}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold tabular-nums ${scoreTone}`}
                          >
                            SEO {seo.score}/100
                          </span>
                          <span className="text-[11px] font-medium text-[#57534d]">
                            · {g.location}
                          </span>
                        </div>
                        <h3 className="font-heading text-base font-bold text-[#1c1917] leading-snug line-clamp-2">
                          {g.title}
                        </h3>
                        <p className="text-[11px] font-mono text-[#3f6e15] truncate">
                          /guides/{g.slug}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200/70">
                      <Link
                        href={`/guides/${g.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#3f6e15] hover:underline"
                      >
                        <span>View Live</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>

                      {canWrite && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(g)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:border-[#3f6e15] hover:text-[#3f6e15] px-2.5 py-1.5 text-xs font-semibold text-[#1c1917] transition-colors cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === g.id}
                            onClick={() => handleDelete(g)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50/70 hover:bg-rose-600 hover:text-white px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>
                              {deletingId === g.id ? "..." : "Delete"}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
