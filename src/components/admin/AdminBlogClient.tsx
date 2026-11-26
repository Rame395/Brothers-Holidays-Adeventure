"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { AdminRole } from "@prisma/client";
import {
  ArrowUpRight,
  CheckCircle2,
  Edit3,
  FileText,
  ImageIcon,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import GoogleDocsEditor from "@/components/admin/GoogleDocsEditor";
import RegionSeoScoreMeter from "@/components/admin/RegionSeoScoreMeter";
import { HERO_IMAGE_PRESETS } from "@/lib/admin-presets";
import { authFetch } from "@/lib/auth/client";
import type { AdminPermission } from "@/lib/auth/guards";
import { analyzeRegionSeo } from "@/lib/seo-score";

export interface AdminBlogPostRecord {
  id: string;
  slug: string;
  dispatchNo: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  image: string;
  authorName: string;
  authorRole: string;
  category: string;
  tags: string[];
  badge: string;
  readingTimeMin: number;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt: string;
  updatedAt: string;
  focusKeyword: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[];
  ogImage: string | null;
  canonicalUrl: string | null;
}

interface BlogFormState {
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  tagsText: string;
  authorName: string;
  authorRole: string;
  badge: string;
  dispatchNo: string;
  isPublished: boolean;
  isFeatured: boolean;
  focusKeyword: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywordsText: string;
  ogImage: string;
  canonicalUrl: string;
}

const BLOG_CATEGORIES = [
  "Field Dispatch",
  "Trekking Guide",
  "Gear & Prep",
  "Altitude & Safety",
  "Culture & Heritage",
  "Expedition Report",
];

const EMPTY_FORM: BlogFormState = {
  title: "",
  slug: "",
  subtitle: "",
  excerpt: "",
  content: "",
  image: "",
  category: "Field Dispatch",
  tagsText: "",
  authorName: "Brothers Field Team",
  authorRole: "Senior Alpine Lead",
  badge: "Field Note",
  dispatchNo: "JOURNAL",
  isPublished: true,
  isFeatured: false,
  focusKeyword: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywordsText: "",
  ogImage: "",
  canonicalUrl: "",
};

function quickSlugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function splitCommaList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AdminBlogClient({
  admin,
  permissions,
  initialPosts,
}: {
  admin: { id: string; email: string; name: string; role: AdminRole };
  permissions: readonly AdminPermission[];
  initialPosts: AdminBlogPostRecord[];
}) {
  const canWrite =
    permissions.includes("journal:write") ||
    permissions.includes("trips:write");

  const [posts, setPosts] = useState<AdminBlogPostRecord[]>(initialPosts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogFormState>(EMPTY_FORM);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "drafts"
  >("all");
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const effectiveSlug = useMemo(
    () =>
      form.slug.trim() ? quickSlugify(form.slug) : quickSlugify(form.title),
    [form.slug, form.title]
  );

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      if (statusFilter === "published" && !post.isPublished) return false;
      if (statusFilter === "drafts" && post.isPublished) return false;
      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        (post.focusKeyword ?? "").toLowerCase().includes(q)
      );
    });
  }, [posts, searchQuery, statusFilter]);

  const startNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSlugManuallyEdited(false);
    setStatusMsg(null);
  };

  const startEdit = (post: AdminBlogPostRecord) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      subtitle: post.subtitle,
      excerpt: post.excerpt,
      content: post.content,
      image: post.image ?? "",
      category: post.category,
      tagsText: post.tags.join(", "),
      authorName: post.authorName,
      authorRole: post.authorRole,
      badge: post.badge,
      dispatchNo: post.dispatchNo,
      isPublished: post.isPublished,
      isFeatured: post.isFeatured,
      focusKeyword: post.focusKeyword ?? "",
      metaTitle: post.metaTitle ?? "",
      metaDescription: post.metaDescription ?? "",
      metaKeywordsText: post.metaKeywords.join(", "),
      ogImage: post.ogImage ?? "",
      canonicalUrl: post.canonicalUrl ?? "",
    });
    setSlugManuallyEdited(true);
    setStatusMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCoverUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !canWrite) return;

    setUploadingImage(true);
    setStatusMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "blog");

      const res = await authFetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as {
        ok?: boolean;
        url?: string;
        error?: string;
      };

      if (!res.ok || !json.ok || !json.url) {
        setStatusMsg({
          type: "err",
          text: json.error || "Could not upload main blog image.",
        });
        return;
      }

      setForm((prev) => ({ ...prev, image: json.url || "" }));
      setStatusMsg({
        type: "ok",
        text: "Main cover image uploaded and attached to this article.",
      });
    } catch {
      setStatusMsg({
        type: "err",
        text: "Network error while uploading main cover image.",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;

    if (!form.title.trim()) {
      setStatusMsg({
        type: "err",
        text: "Please enter a blog article title.",
      });
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    const payload = {
      title: form.title.trim(),
      slug: effectiveSlug,
      subtitle: form.subtitle.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content,
      image: form.image.trim(),
      category: form.category.trim() || "Field Dispatch",
      tags: splitCommaList(form.tagsText),
      authorName: form.authorName.trim() || "Brothers Field Team",
      authorRole: form.authorRole.trim() || "Senior Alpine Lead",
      badge: form.badge.trim() || form.category.trim() || "Field Note",
      dispatchNo: form.dispatchNo.trim() || "JOURNAL",
      isPublished: form.isPublished,
      isFeatured: form.isFeatured,
      focusKeyword: form.focusKeyword.trim() || null,
      metaTitle: form.metaTitle.trim() || null,
      metaDescription: form.metaDescription.trim() || null,
      metaKeywords: splitCommaList(form.metaKeywordsText),
      ogImage: form.ogImage.trim() || null,
      canonicalUrl: form.canonicalUrl.trim() || null,
    };

    try {
      const endpoint = editingId
        ? `/api/admin/blog/${editingId}`
        : "/api/admin/blog";
      const method = editingId ? "PATCH" : "POST";

      const res = await authFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        post?: AdminBlogPostRecord;
        error?: string;
      };

      if (!res.ok || !json.ok || !json.post) {
        setStatusMsg({
          type: "err",
          text: json.error || "Could not save blog post.",
        });
        return;
      }

      const savedPost = json.post;
      if (editingId) {
        setPosts((prev) =>
          prev.map((p) => (p.id === savedPost.id ? savedPost : p))
        );
        setStatusMsg({
          type: "ok",
          text: `Saved changes to "${savedPost.title}".`,
        });
      } else {
        setPosts((prev) => [savedPost, ...prev]);
        setEditingId(savedPost.id);
        setSlugManuallyEdited(true);
        setStatusMsg({
          type: "ok",
          text: `Created blog post "${savedPost.title}".`,
        });
      }
    } catch {
      setStatusMsg({
        type: "err",
        text: "Network error while saving blog post.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (post: AdminBlogPostRecord) => {
    if (!canWrite) return;
    if (
      !window.confirm(
        `Delete blog post "${post.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(post.id);
    setStatusMsg(null);
    try {
      const res = await authFetch(`/api/admin/blog/${post.id}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatusMsg({
          type: "err",
          text: json.error || "Could not delete blog post.",
        });
        return;
      }

      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      if (editingId === post.id) {
        startNew();
      }
      setStatusMsg({
        type: "ok",
        text: `Deleted blog post "${post.title}".`,
      });
    } catch {
      setStatusMsg({
        type: "err",
        text: "Network error while deleting blog post.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminShell
      admin={admin}
      permissions={permissions}
      title="Blog & Field Journal"
      subtitle="Write SEO-optimized Himalaya trekking articles in the Google Docs editor with an optional cover photo and live SEO scoring."
      actions={
        editingId ? (
          <button
            type="button"
            onClick={startNew}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#3f6e15] hover:bg-[#315710] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Article</span>
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

        {/* Blog Editor Form + Live SEO Meter */}
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#3f6e15]/10 text-[#3f6e15]">
                <FileText className="h-4.5 w-4.5" />
              </span>
              <div>
                <h2 className="font-heading text-xl font-bold text-[#1c1917]">
                  {editingId ? "Edit Blog Article" : "Write New Blog Article"}
                </h2>
                <p className="text-xs text-[#57534d]">
                  Public URL:{" "}
                  <span className="font-mono text-[#3f6e15]">
                    /journal/{effectiveSlug || "your-article-slug"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {editingId && effectiveSlug && (
                <Link
                  href={`/journal/${effectiveSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-[#f8fafc] hover:border-[#3f6e15] hover:text-[#3f6e15] px-3.5 py-2 text-xs font-semibold text-[#1c1917] transition-colors"
                >
                  <span>View Live Post</span>
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
                      : form.isPublished
                      ? "Publish Article"
                      : "Save Draft"}
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
                    Article Title (Page H1) *
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
                    placeholder="e.g. Best Time to Trek Everest Base Camp in Nepal: Month-by-Month Guide"
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
                    placeholder="best-time-to-trek-everest-base-camp"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1.5">
                    Category
                  </label>
                  <select
                    disabled={!canWrite}
                    value={
                      BLOG_CATEGORIES.includes(form.category)
                        ? form.category
                        : "__custom"
                    }
                    onChange={(e) => {
                      if (e.target.value !== "__custom") {
                        setForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }));
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                  >
                    {BLOG_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    {!BLOG_CATEGORIES.includes(form.category) && (
                      <option value="__custom">{form.category}</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1.5">
                  Subtitle / Deck
                </label>
                <input
                  type="text"
                  disabled={!canWrite}
                  value={form.subtitle}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, subtitle: e.target.value }))
                  }
                  placeholder="Optional concise tagline shown beneath the headline."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1.5">
                  Excerpt / Summary (Auto-generated from article if left blank)
                </label>
                <textarea
                  rows={2}
                  disabled={!canWrite}
                  value={form.excerpt}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, excerpt: e.target.value }))
                  }
                  placeholder="Short editorial preview displayed on the journal listing card..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                />
              </div>

              {/* Optional Main Cover Image Card */}
              <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#1c1917]">
                      Main Cover Image{" "}
                      <span className="ml-1 rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-[#57534d]">
                        Optional
                      </span>
                    </p>
                    <p className="text-xs text-[#57534d] mt-0.5">
                      Upload a featured photo, paste a URL, choose a preset, or
                      leave blank for a clean typographic post.
                    </p>
                  </div>

                  {canWrite && (
                    <div className="flex items-center gap-2">
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={uploadingImage}
                        onClick={() => coverInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:border-[#3f6e15] hover:text-[#3f6e15] px-3 py-1.5 text-xs font-semibold text-[#1c1917] transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>
                          {uploadingImage ? "Uploading..." : "Upload Image"}
                        </span>
                      </button>

                      {form.image.trim() && (
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, image: "" }))
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-600 hover:text-white px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition-colors cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#57534d] mb-1">
                      Image URL or Path
                    </label>
                    <input
                      type="text"
                      disabled={!canWrite}
                      value={form.image}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, image: e.target.value }))
                      }
                      placeholder="Leave blank or paste /api/uploads/blog/..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#57534d] mb-1">
                      Quick Preset Photo
                    </label>
                    <select
                      disabled={!canWrite}
                      value={
                        HERO_IMAGE_PRESETS.some((p) => p.url === form.image)
                          ? form.image
                          : ""
                      }
                      onChange={(e) => {
                        if (e.target.value) {
                          setForm((prev) => ({
                            ...prev,
                            image: e.target.value,
                          }));
                        }
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                    >
                      <option value="">None / Custom URL...</option>
                      {HERO_IMAGE_PRESETS.map((preset) => (
                        <option key={preset.url} value={preset.url}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {form.image.trim() ? (
                  <div className="relative h-44 w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.image.trim()}
                      alt={form.title || "Main blog cover preview"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-slate-300 bg-white/70 px-3.5 py-3 text-xs text-[#57534d]">
                    <ImageIcon className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>
                      No main image selected — post will render cleanly without
                      a cover photo.
                    </span>
                  </div>
                )}
              </div>

              {/* Author, Badge & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    disabled={!canWrite}
                    value={form.authorName}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        authorName: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1">
                    Author Role
                  </label>
                  <input
                    type="text"
                    disabled={!canWrite}
                    value={form.authorRole}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        authorRole: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    disabled={!canWrite}
                    value={form.tagsText}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, tagsText: e.target.value }))
                    }
                    placeholder="Everest, Seasons, Permits"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                  />
                </div>
              </div>

              {/* SEO Metadata Panel */}
              <div className="rounded-2xl border border-[#f05e25]/25 bg-[#fffaf7] p-4 space-y-3.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f05e25]">
                  Blog SEO Optimization &amp; Search Snippet
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                      placeholder="e.g. everest base camp trek season"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1">
                      Meta Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      disabled={!canWrite}
                      value={form.metaKeywordsText}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          metaKeywordsText: e.target.value,
                        }))
                      }
                      placeholder="everest trek, nepal spring trek, khumbu weather"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                    />
                  </div>
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
                    placeholder="Best Time to Trek Everest Base Camp | Complete Season Guide"
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
                    placeholder="Plan your Everest Base Camp trek with exact temperature charts, crowd levels, Lukla flight windows, and packing checklists."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1">
                      Social OG Image Override (Optional)
                    </label>
                    <input
                      type="text"
                      disabled={!canWrite}
                      value={form.ogImage}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          ogImage: e.target.value,
                        }))
                      }
                      placeholder="Defaults to main cover image or site OG"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#57534d] mb-1">
                      Canonical URL Override (Optional)
                    </label>
                    <input
                      type="text"
                      disabled={!canWrite}
                      value={form.canonicalUrl}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          canonicalUrl: e.target.value,
                        }))
                      }
                      placeholder="https://brothersholidays.com/journal/..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-1">
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
                  <span>Published on public Journal</span>
                </label>

                <label className="inline-flex items-center gap-2.5 text-sm font-medium text-[#1c1917] cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canWrite}
                    checked={form.isFeatured}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        isFeatured: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-[#f05e25] focus:ring-[#f05e25]"
                  />
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-[#f05e25]" />
                    Featured Story
                  </span>
                </label>
              </div>
            </div>

            <div className="lg:col-span-5">
              <RegionSeoScoreMeter
                name={form.title || "Blog Article"}
                slug={effectiveSlug || "blog-article"}
                focusKeyword={form.focusKeyword}
                metaTitle={form.metaTitle}
                metaDescription={form.metaDescription}
                seoContent={form.content}
                urlPrefix="/journal/"
              />
            </div>
          </div>

          {/* Full-Width Google Docs Rich Content Editor */}
          <div className="pt-2 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#3f6e15]">
                Article Body (Google Docs Structure)
              </label>
              <span className="text-xs text-[#57534d]">
                Supports headings (H2/H3), rich formatting, tables, inline
                photos, and links
              </span>
            </div>

            <GoogleDocsEditor
              value={form.content}
              disabled={!canWrite}
              onChange={(html) =>
                setForm((prev) => ({ ...prev, content: html }))
              }
              placeholder="Write your full blog post here with H2/H3 headings, numbered lists, altitude tables, and inline images..."
            />
          </div>
        </form>

        {/* Blog Directory */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-heading text-xl font-bold text-[#1c1917]">
                Blog Posts Directory ({posts.length})
              </h2>
              <p className="text-xs text-[#57534d]">
                Monitor live SEO readiness across every published and draft
                article.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, keyword..."
                  className="rounded-full border border-slate-200 bg-[#f8fafc] pl-8 pr-3.5 py-1.5 text-xs text-[#1c1917] focus:border-[#3f6e15] focus:bg-white focus:outline-none w-52"
                />
              </div>

              <div className="inline-flex rounded-full border border-slate-200 bg-[#f8fafc] p-0.5 text-xs">
                {(["all", "published", "drafts"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setStatusFilter(tab)}
                    className={`rounded-full px-3 py-1 font-semibold capitalize transition-colors cursor-pointer ${
                      statusFilter === tab
                        ? "bg-[#3f6e15] text-white"
                        : "text-[#57534d] hover:text-[#1c1917]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-[#f8fafc] p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-[#1c1917]">
                {posts.length === 0
                  ? "No blog articles created yet"
                  : "No matching blog articles found"}
              </p>
              <p className="text-xs text-[#57534d]">
                {posts.length === 0
                  ? "Create your first SEO-optimized article above."
                  : "Try clearing the search query or switching status filter."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPosts.map((post) => {
                const seo = analyzeRegionSeo({
                  name: post.title,
                  slug: post.slug,
                  focusKeyword: post.focusKeyword ?? "",
                  metaTitle: post.metaTitle ?? "",
                  metaDescription: post.metaDescription ?? "",
                  htmlContent: post.content,
                });

                const scoreTone =
                  seo.score >= 80
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : seo.score >= 60
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-orange-50 text-[#d94e18] border-orange-200";

                return (
                  <div
                    key={post.id}
                    className={`rounded-xl border p-4 transition-all flex flex-col justify-between gap-4 ${
                      editingId === post.id
                        ? "border-[#3f6e15] bg-[#3f6e15]/[0.03] ring-1 ring-[#3f6e15]/20"
                        : "border-slate-200 bg-[#f8fafc]/60 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      {post.image.trim() ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={post.image}
                          alt={post.title}
                          className="h-16 w-20 shrink-0 rounded-lg object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="h-16 w-20 shrink-0 rounded-lg border border-slate-200 bg-gradient-to-br from-[#3f6e15]/10 to-slate-100 grid place-items-center text-[#3f6e15]">
                          <FileText className="h-5 w-5" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                              post.isPublished
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-slate-100 text-slate-600"
                            }`}
                          >
                            {post.isPublished ? "Published" : "Draft"}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold tabular-nums ${scoreTone}`}
                          >
                            SEO {seo.score}/100
                          </span>
                          <span className="text-[11px] font-medium text-[#57534d]">
                            · {post.category} · {post.readingTimeMin} min
                          </span>
                        </div>
                        <h3 className="font-heading text-base font-bold text-[#1c1917] leading-snug line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-[11px] font-mono text-[#3f6e15] truncate">
                          /journal/{post.slug}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200/70">
                      <Link
                        href={`/journal/${post.slug}`}
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
                            onClick={() => startEdit(post)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:border-[#3f6e15] hover:text-[#3f6e15] px-2.5 py-1.5 text-xs font-semibold text-[#1c1917] transition-colors cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === post.id}
                            onClick={() => handleDelete(post)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50/70 hover:bg-rose-600 hover:text-white px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>
                              {deletingId === post.id ? "..." : "Delete"}
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
