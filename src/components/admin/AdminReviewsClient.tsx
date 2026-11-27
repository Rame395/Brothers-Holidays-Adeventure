"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Check,
  Edit3,
  Eye,
  EyeOff,
  Home,
  Loader2,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import AdminShell, { type AdminIdentityDTO } from "@/components/admin/AdminShell";
import { authFetch } from "@/lib/auth/client";
import {
  formatReviewDateUTC,
  getReviewerInitials,
} from "@/lib/review-utils";
import type { ReviewSource, TripReviewDTO } from "@/lib/types";

const SOURCE_LABELS: Record<ReviewSource, string> = {
  google: "Google",
  tripadvisor: "TripAdvisor",
  website: "Website",
};

export interface ReviewTripOption {
  id: string;
  name: string;
  slug: string;
}

interface ReviewFormState {
  authorName: string;
  authorCountry: string;
  avatarUrl: string;
  rating: number;
  title: string;
  comment: string;
  source: ReviewSource;
  tripId: string;
  tripName: string;
  tripDate: string;
  verified: boolean;
  isPublished: boolean;
  showOnHome: boolean;
}

const EMPTY_FORM: ReviewFormState = {
  authorName: "",
  authorCountry: "",
  avatarUrl: "",
  rating: 5,
  title: "",
  comment: "",
  source: "google",
  tripId: "",
  tripName: "",
  tripDate: "",
  verified: true,
  isPublished: true,
  showOnHome: true,
};

function AvatarBadge({
  name,
  avatarUrl,
  size = "md",
}: {
  name: string;
  avatarUrl?: string | null;
  size?: "md" | "lg";
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = getReviewerInitials(name);
  const dim = size === "lg" ? "h-16 w-16 text-lg" : "h-11 w-11 text-xs";

  if (avatarUrl && !imgFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name || "Reviewer avatar"}
        onError={() => setImgFailed(true)}
        className={`${dim} rounded-full object-cover border border-stone-200 shrink-0 bg-stone-100`}
      />
    );
  }

  return (
    <div
      aria-label={`${name || "Reviewer"} initials ${initials}`}
      className={`${dim} rounded-full shrink-0 flex items-center justify-center bg-[#3f6e15]/12 text-[#3f6e15] border border-[#3f6e15]/25 font-heading font-bold tracking-wide select-none`}
    >
      {initials}
    </div>
  );
}

export default function AdminReviewsClient({
  admin,
  permissions,
  initialReviews,
  trips,
  canWrite,
}: {
  admin: AdminIdentityDTO;
  permissions: readonly string[];
  initialReviews: TripReviewDTO[];
  trips: ReviewTripOption[];
  canWrite: boolean;
}) {
  const [reviews, setReviews] = useState<TripReviewDTO[]>(initialReviews);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ReviewFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "home" | "published" | "hidden">("all");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = reviews.length;
    const published = reviews.filter((r) => r.isPublished !== false).length;
    const onHome = reviews.filter(
      (r) => r.isPublished !== false && r.showOnHome !== false
    ).length;
    const avg =
      total > 0
        ? (
            reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / total
          ).toFixed(1)
        : "5.0";
    return { total, published, onHome, avg };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter((r) => {
      if (filterTab === "home" && (r.isPublished === false || r.showOnHome === false)) {
        return false;
      }
      if (filterTab === "published" && r.isPublished === false) return false;
      if (filterTab === "hidden" && r.isPublished !== false) return false;

      if (!q) return true;
      return (
        r.authorName.toLowerCase().includes(q) ||
        (r.authorCountry ?? "").toLowerCase().includes(q) ||
        (r.tripName ?? "").toLowerCase().includes(q) ||
        (r.title ?? "").toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q)
      );
    });
  }, [reviews, search, filterTab]);

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  function startEdit(review: TripReviewDTO) {
    setEditingId(review.id);
    setForm({
      authorName: review.authorName,
      authorCountry: review.authorCountry ?? "",
      avatarUrl: review.avatarUrl ?? "",
      rating: review.rating || 5,
      title: review.title ?? "",
      comment: review.comment,
      source: review.source ?? "website",
      tripId: review.tripId ?? "",
      tripName: review.tripName ?? "",
      tripDate: review.tripDate ? review.tripDate.slice(0, 10) : "",
      verified: review.verified ?? true,
      isPublished: review.isPublished ?? true,
      showOnHome: review.showOnHome ?? true,
    });
    setError(null);
    setNotice(null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !canWrite) return;

    setUploadingAvatar(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "reviews");
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
        setError(json.error || "Could not upload profile photo.");
        return;
      }
      setForm((prev) => ({ ...prev, avatarUrl: json.url || "" }));
    } catch {
      setError("Network error uploading profile photo.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canWrite) return;

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const payload = {
        authorName: form.authorName.trim(),
        authorCountry: form.authorCountry.trim() || null,
        avatarUrl: form.avatarUrl.trim() || null,
        rating: form.rating,
        title: form.title.trim() || null,
        comment: form.comment.trim(),
        source: form.source,
        tripId: form.tripId || null,
        tripName: form.tripName.trim() || null,
        tripDate: form.tripDate.trim() || null,
        verified: form.verified,
        isPublished: form.isPublished,
        showOnHome: form.showOnHome,
      };

      const url = editingId
        ? `/api/admin/reviews/${editingId}`
        : "/api/admin/reviews";
      const method = editingId ? "PATCH" : "POST";

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        review?: TripReviewDTO;
        error?: string;
      };

      if (!res.ok || !json.ok || !json.review) {
        setError(json.error || "Failed to save review.");
        return;
      }

      const saved = json.review;
      if (editingId) {
        setReviews((prev) =>
          prev.map((item) => (item.id === editingId ? saved : item))
        );
        setNotice(`Updated review by ${saved.authorName}.`);
      } else {
        setReviews((prev) => [saved, ...prev]);
        setNotice(`Added review by ${saved.authorName}.`);
      }
      resetForm();
    } catch {
      setError("Network error saving review.");
    } finally {
      setSaving(false);
    }
  }

  async function handleQuickToggle(
    review: TripReviewDTO,
    field: "isPublished" | "showOnHome"
  ) {
    if (!canWrite) return;
    setBusyId(review.id);
    setError(null);
    setNotice(null);

    const nextValue =
      field === "isPublished"
        ? !(review.isPublished !== false)
        : !(review.showOnHome !== false);

    try {
      const res = await authFetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        body: JSON.stringify({ [field]: nextValue }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        review?: TripReviewDTO;
        error?: string;
      };
      if (!res.ok || !json.ok || !json.review) {
        setError(json.error || "Failed to update review visibility.");
        return;
      }
      setReviews((prev) =>
        prev.map((item) => (item.id === review.id ? json.review! : item))
      );
    } catch {
      setError("Network error updating review.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!canWrite) return;
    setBusyId(id);
    setError(null);
    setNotice(null);

    try {
      const res = await authFetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error || "Could not delete review.");
        return;
      }
      setReviews((prev) => prev.filter((r) => r.id !== id));
      if (editingId === id) {
        resetForm();
      }
      setConfirmDeleteId(null);
      setNotice("Review deleted.");
    } catch {
      setError("Network error deleting review.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminShell
      admin={admin}
      permissions={permissions}
      title="Client Reviews"
      subtitle="Add and manage authentic traveller reviews displayed below Booking Process on the homepage and on linked trip pages."
    >
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-[14px] border border-stone-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">
            Total Reviews
          </div>
          <div className="mt-1 font-heading text-2xl font-bold text-[#1c1917]">
            {stats.total}
          </div>
        </div>
        <div className="rounded-[14px] border border-stone-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">
            Published
          </div>
          <div className="mt-1 font-heading text-2xl font-bold text-[#3f6e15]">
            {stats.published}
          </div>
        </div>
        <div className="rounded-[14px] border border-stone-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">
            On Homepage
          </div>
          <div className="mt-1 font-heading text-2xl font-bold text-[#f05e25]">
            {stats.onHome}
          </div>
        </div>
        <div className="rounded-[14px] border border-stone-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">
            Average Rating
          </div>
          <div className="mt-1 flex items-center gap-1.5 font-heading text-2xl font-bold text-[#1c1917]">
            <span>{stats.avg}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
        </div>
      </div>

      {(error || notice) && (
        <div
          className={`mb-6 rounded-[12px] border px-4 py-3 text-sm flex items-center justify-between gap-3 ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          <span>{error || notice}</span>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setNotice(null);
            }}
            className="text-current opacity-70 hover:opacity-100"
            aria-label="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Create / Edit Review Form */}
        <section className="lg:col-span-5 rounded-[16px] border border-stone-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div>
              <h2 className="font-heading text-lg font-bold text-[#1c1917]">
                {editingId ? "Edit Client Review" : "Add Client Review"}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Profile photo is optional; initials render automatically when blank.
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 rounded-[10px] border border-stone-200 px-2.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Avatar Preview + Optional Upload */}
            <div className="rounded-[12px] border border-stone-200 bg-[#faf9f7] p-4">
              <div className="flex items-center gap-4">
                <AvatarBadge
                  key={form.avatarUrl || "initials-only"}
                  name={form.authorName}
                  avatarUrl={form.avatarUrl || null}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold uppercase tracking-[0.1em] text-stone-600">
                    Reviewer Avatar (Optional)
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                    Without a photo, shows first &amp; last initials:{" "}
                    <span className="font-bold text-[#3f6e15]">
                      {getReviewerInitials(form.authorName || "Sarah Miller")}
                    </span>
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 rounded-[10px] border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:border-[#3f6e15] hover:text-[#3f6e15] cursor-pointer transition">
                      {uploadingAvatar ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleAvatarUpload}
                        disabled={!canWrite || uploadingAvatar}
                        className="sr-only"
                      />
                    </label>
                    {form.avatarUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, avatarUrl: "" }))
                        }
                        className="inline-flex items-center gap-1 rounded-[10px] border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:text-red-600 hover:border-red-200"
                      >
                        <X className="w-3.5 h-3.5" />
                        Use Initials
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <input
                type="text"
                value={form.avatarUrl}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, avatarUrl: e.target.value }))
                }
                disabled={!canWrite}
                placeholder="Or paste photo URL (leave blank for initials)"
                className="mt-3 w-full rounded-[10px] border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#3f6e15]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Reviewer Name <span className="text-[#f05e25]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.authorName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, authorName: e.target.value }))
                  }
                  disabled={!canWrite}
                  placeholder="e.g. Sarah Miller"
                  className="w-full rounded-[10px] border border-stone-200 px-3 py-2 text-sm text-[#1c1917] focus:outline-none focus:border-[#3f6e15]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={form.authorCountry}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      authorCountry: e.target.value,
                    }))
                  }
                  disabled={!canWrite}
                  placeholder="e.g. Australia"
                  className="w-full rounded-[10px] border border-stone-200 px-3 py-2 text-sm text-[#1c1917] focus:outline-none focus:border-[#3f6e15]"
                />
              </div>
            </div>

            {/* Star Rating + Source + Trip Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Source
                </label>
                <select
                  value={form.source}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      source: e.target.value as ReviewSource,
                    }))
                  }
                  disabled={!canWrite}
                  className="w-full rounded-[10px] border border-stone-200 bg-white px-3 py-2 text-sm text-[#1c1917] focus:outline-none focus:border-[#3f6e15]"
                >
                  <option value="google">Google Review</option>
                  <option value="tripadvisor">TripAdvisor</option>
                  <option value="website">Direct Website</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-1 rounded-[10px] border border-stone-200 px-3 py-2 bg-white">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      disabled={!canWrite}
                      onClick={() =>
                        setForm((prev) => ({ ...prev, rating: star }))
                      }
                      aria-label={`Set rating to ${star} stars`}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= form.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-stone-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-auto text-xs font-bold text-stone-600">
                    {form.rating}/5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Trek Date
                </label>
                <input
                  type="date"
                  value={form.tripDate}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, tripDate: e.target.value }))
                  }
                  disabled={!canWrite}
                  className="w-full rounded-[10px] border border-stone-200 px-3 py-2 text-sm text-[#1c1917] focus:outline-none focus:border-[#3f6e15]"
                />
              </div>
            </div>

            {/* Linked Trip & Custom Trip Label */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Link to Trip (Optional)
                </label>
                <select
                  value={form.tripId}
                  onChange={(e) => {
                    const id = e.target.value;
                    const match = trips.find((t) => t.id === id);
                    setForm((prev) => ({
                      ...prev,
                      tripId: id,
                      tripName: match ? match.name : prev.tripName,
                    }));
                  }}
                  disabled={!canWrite}
                  className="w-full rounded-[10px] border border-stone-200 bg-white px-3 py-2 text-sm text-[#1c1917] focus:outline-none focus:border-[#3f6e15]"
                >
                  <option value="">Custom / Standalone Review</option>
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Trip Display Label
                </label>
                <input
                  type="text"
                  value={form.tripName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, tripName: e.target.value }))
                  }
                  disabled={!canWrite}
                  placeholder="e.g. Annapurna Base Camp"
                  className="w-full rounded-[10px] border border-stone-200 px-3 py-2 text-sm text-[#1c1917] focus:outline-none focus:border-[#3f6e15]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Review Headline (Optional)
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                disabled={!canWrite}
                placeholder="e.g. Thoughtful acclimatisation and local care"
                className="w-full rounded-[10px] border border-stone-200 px-3 py-2 text-sm text-[#1c1917] focus:outline-none focus:border-[#3f6e15]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-700">
                  Review Quote <span className="text-[#f05e25]">*</span>
                </label>
                <span className="text-[11px] text-stone-400">
                  {form.comment.length} / 1400
                </span>
              </div>
              <textarea
                required
                rows={4}
                maxLength={1400}
                value={form.comment}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, comment: e.target.value }))
                }
                disabled={!canWrite}
                placeholder="Write the traveller's authentic experience..."
                className="w-full rounded-[10px] border border-stone-200 px-3 py-2 text-sm leading-relaxed text-[#1c1917] focus:outline-none focus:border-[#3f6e15]"
              />
            </div>

            {/* Visibility Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <label className="flex items-center gap-2 rounded-[10px] border border-stone-200 px-3 py-2 text-xs font-medium text-stone-700 cursor-pointer hover:bg-stone-50">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      isPublished: e.target.checked,
                    }))
                  }
                  disabled={!canWrite}
                  className="accent-[#3f6e15]"
                />
                Published
              </label>

              <label className="flex items-center gap-2 rounded-[10px] border border-stone-200 px-3 py-2 text-xs font-medium text-stone-700 cursor-pointer hover:bg-stone-50">
                <input
                  type="checkbox"
                  checked={form.showOnHome}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      showOnHome: e.target.checked,
                    }))
                  }
                  disabled={!canWrite}
                  className="accent-[#f05e25]"
                />
                Homepage
              </label>

              <label className="flex items-center gap-2 rounded-[10px] border border-stone-200 px-3 py-2 text-xs font-medium text-stone-700 cursor-pointer hover:bg-stone-50">
                <input
                  type="checkbox"
                  checked={form.verified}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, verified: e.target.checked }))
                  }
                  disabled={!canWrite}
                  className="accent-[#3f6e15]"
                />
                Verified
              </label>
            </div>

            <button
              type="submit"
              disabled={!canWrite || saving || uploadingAvatar}
              className="w-full inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#3f6e15] px-4 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-[#325910] disabled:opacity-50 transition"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editingId ? (
                <Check className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {saving
                ? "Saving Review..."
                : editingId
                  ? "Save Changes"
                  : "Add Client Review"}
            </button>
          </form>
        </section>

        {/* Right: Existing Reviews Directory */}
        <section className="lg:col-span-7 rounded-[16px] border border-stone-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by reviewer, country, trip, or text..."
                className="w-full rounded-[10px] border border-stone-200 pl-9 pr-3 py-2 text-sm text-[#1c1917] placeholder:text-stone-400 focus:outline-none focus:border-[#3f6e15]"
              />
            </div>

            <div className="flex items-center gap-1 rounded-[10px] bg-stone-100 p-1 text-xs font-semibold">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "home", label: "Homepage" },
                  { id: "published", label: "Published" },
                  { id: "hidden", label: "Hidden" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterTab(tab.id)}
                  className={`rounded-[8px] px-2.5 py-1.5 transition ${
                    filterTab === tab.id
                      ? "bg-white text-[#1c1917] shadow-xs"
                      : "text-stone-600 hover:text-[#1c1917]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {filteredReviews.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-stone-200 py-12 text-center text-sm text-stone-500">
                No reviews match the current filter.
              </div>
            ) : (
              filteredReviews.map((review) => {
                const isPublished = review.isPublished !== false;
                const onHome = review.showOnHome !== false;
                const dateLabel = formatReviewDateUTC(review.tripDate);
                const busy = busyId === review.id;

                return (
                  <article
                    key={review.id}
                    className={`rounded-[14px] border p-4 sm:p-5 transition ${
                      editingId === review.id
                        ? "border-[#3f6e15] bg-[#3f6e15]/[0.03]"
                        : "border-stone-200 bg-white hover:border-stone-300"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <AvatarBadge
                          key={review.avatarUrl || review.authorName}
                          name={review.authorName}
                          avatarUrl={review.avatarUrl}
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-heading font-bold text-sm text-[#1c1917]">
                              {review.authorName}
                            </h3>
                            {review.authorCountry && (
                              <span className="text-xs text-stone-500">
                                · {review.authorCountry}
                              </span>
                            )}
                            {review.verified && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#3f6e15]/10 px-2 py-0.5 text-[10px] font-bold text-[#3f6e15]">
                                <BadgeCheck className="w-3 h-3" />
                                Verified
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                                review.source === "google"
                                  ? "border-blue-200 bg-blue-50 text-blue-700"
                                  : review.source === "tripadvisor"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-stone-200 bg-stone-50 text-stone-700"
                              }`}
                            >
                              {SOURCE_LABELS[review.source ?? "website"]}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= review.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-stone-300"
                                  }`}
                                />
                              ))}
                            </div>
                            {dateLabel && (
                              <span className="text-[11px] font-semibold tracking-wider text-stone-400">
                                {dateLabel}
                              </span>
                            )}
                            {review.tripName && (
                              <span className="rounded-full bg-[#faf9f7] border border-stone-200 px-2.5 py-0.5 text-[11px] font-semibold text-[#3f6e15]">
                                {review.tripName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Action Controls */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          disabled={!canWrite || busy}
                          onClick={() => handleQuickToggle(review, "showOnHome")}
                          title="Toggle Homepage visibility"
                          className={`inline-flex items-center gap-1 rounded-[8px] border px-2 py-1 text-[11px] font-semibold transition ${
                            onHome
                              ? "border-[#f05e25]/35 bg-[#f05e25]/10 text-[#f05e25]"
                              : "border-stone-200 bg-white text-stone-500 hover:text-stone-800"
                          }`}
                        >
                          <Home className="w-3 h-3" />
                          {onHome ? "Homepage" : "Off Home"}
                        </button>

                        <button
                          type="button"
                          disabled={!canWrite || busy}
                          onClick={() => handleQuickToggle(review, "isPublished")}
                          title="Toggle published status"
                          className={`inline-flex items-center gap-1 rounded-[8px] border px-2 py-1 text-[11px] font-semibold transition ${
                            isPublished
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-stone-200 bg-stone-100 text-stone-500"
                          }`}
                        >
                          {isPublished ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                          {isPublished ? "Published" : "Hidden"}
                        </button>

                        <button
                          type="button"
                          onClick={() => startEdit(review)}
                          disabled={!canWrite}
                          className="inline-flex items-center gap-1 rounded-[8px] border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:border-[#3f6e15] hover:text-[#3f6e15]"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>

                        {confirmDeleteId === review.id ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleDelete(review.id)}
                              className="rounded-[8px] bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-700"
                            >
                              {busy ? "..." : "Confirm"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="rounded-[8px] border border-stone-200 px-2 py-1 text-[11px] font-semibold text-stone-600 hover:bg-stone-50"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={!canWrite || busy}
                            onClick={() => setConfirmDeleteId(review.id)}
                            aria-label={`Delete review by ${review.authorName}`}
                            className="inline-flex items-center justify-center rounded-[8px] border border-stone-200 bg-white p-1.5 text-stone-500 hover:border-red-200 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {review.title && (
                      <div className="mt-3 font-heading font-bold text-sm text-[#1c1917]">
                        {review.title}
                      </div>
                    )}
                    <p className="mt-1.5 text-sm leading-relaxed text-[#44403c]">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
