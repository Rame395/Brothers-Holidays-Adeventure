"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Copy,
  Edit3,
  Globe2,
  Layers,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { authFetch } from "@/lib/auth/client";
import { formatPriceUsd } from "@/lib/booking";
import AdminShell, { type AdminIdentityDTO } from "./AdminShell";

export interface AdminTripRowDTO {
  id: string;
  slug: string;
  name: string;
  country: string;
  categories: string[];
  region: string | null;
  area: string;
  image: string;
  days: number;
  maxAltitude: number;
  difficulty: string;
  price: number;
  groupMax: number;
  isPublished: boolean;
  isFeatured: boolean;
  featuredOrder: number;
  updatedAt: string;
  _count: {
    itinerary: number;
    departures: number;
    bookings: number;
    faqs?: number;
    reviews?: number;
  };
}

interface CountryOption {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
}

interface CategoryOption {
  id: string;
  slug: string;
  name: string;
  groupByRegion: boolean;
  isActive: boolean;
}

interface RegionOption {
  id: string;
  slug: string;
  name: string;
  countrySlug: string;
  isActive: boolean;
}

export default function AdminTripsClient({
  admin,
  permissions,
  canWrite,
  initialTrips,
  countries,
  categories,
  regions,
}: {
  admin: AdminIdentityDTO;
  permissions: readonly string[];
  canWrite: boolean;
  initialTrips: AdminTripRowDTO[];
  countries: CountryOption[];
  categories: CategoryOption[];
  regions: RegionOption[];
}) {
  const router = useRouter();
  const [trips, setTrips] = useState(initialTrips);
  const [q, setQ] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">(
    "all"
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{
    type: "ok" | "err";
    text: string;
    editId?: string;
  } | null>(null);

  const filteredTrips = useMemo(() => {
    const query = q.trim().toLowerCase();
    return trips.filter((t) => {
      if (countryFilter !== "all" && t.country !== countryFilter) return false;
      if (categoryFilter !== "all" && !t.categories.includes(categoryFilter)) {
        return false;
      }
      if (statusFilter === "published" && !t.isPublished) return false;
      if (statusFilter === "draft" && t.isPublished) return false;
      if (
        query &&
        !`${t.name} ${t.slug} ${t.area} ${t.country}`.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [trips, q, countryFilter, categoryFilter, statusFilter]);

  const countryNameMap = useMemo(
    () => new Map(countries.map((c) => [c.slug, c.name])),
    [countries]
  );
  const categoryNameMap = useMemo(
    () => new Map(categories.map((c) => [c.slug, c.name])),
    [categories]
  );
  const regionNameMap = useMemo(
    () => new Map(regions.map((r) => [r.slug, r.name])),
    [regions]
  );

  async function reloadTrips() {
    const res = await authFetch("/api/admin/trips", { cache: "no-store" });
    const json = (await res.json()) as {
      ok: boolean;
      trips?: AdminTripRowDTO[];
    };
    if (res.ok && json.ok && json.trips) {
      setTrips(json.trips);
    }
    router.refresh();
  }

  async function handleQuickPatch(
    id: string,
    patch: { isPublished?: boolean; isFeatured?: boolean }
  ) {
    if (!canWrite) return;
    setBusyId(id);
    setStatusMsg(null);
    try {
      const res = await authFetch(`/api/admin/trips/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatusMsg({
          type: "err",
          text: json.error || "Unable to update trip flags.",
        });
        return;
      }
      await reloadTrips();
    } catch {
      setStatusMsg({ type: "err", text: "Network error updating trip." });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDuplicateTrip(id: string, name: string) {
    if (!canWrite) return;
    setBusyId(id);
    setStatusMsg(null);
    try {
      const res = await authFetch(`/api/admin/trips/${id}/duplicate`, {
        method: "POST",
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        trip?: { id: string; name: string };
      };
      if (!res.ok || !json.ok || !json.trip) {
        setStatusMsg({
          type: "err",
          text: json.error || `Unable to duplicate "${name}".`,
        });
        return;
      }
      await reloadTrips();
      setStatusMsg({
        type: "ok",
        text: `Created draft copy "${json.trip.name}".`,
        editId: json.trip.id,
      });
    } catch {
      setStatusMsg({ type: "err", text: "Network error duplicating trip." });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteTrip(id: string, name: string) {
    if (!canWrite) return;
    if (!window.confirm(`Delete "${name}" permanently?`)) return;
    setBusyId(id);
    setStatusMsg(null);
    try {
      const res = await authFetch(`/api/admin/trips/${id}`, {
        method: "DELETE",
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatusMsg({
          type: "err",
          text: json.error || "Unable to delete trip.",
        });
        return;
      }
      await reloadTrips();
      setStatusMsg({ type: "ok", text: `Deleted "${name}".` });
    } catch {
      setStatusMsg({ type: "err", text: "Network error deleting trip." });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminShell
      admin={admin}
      permissions={permissions}
      title="Trips & Packages"
      subtitle="Publish expeditions, manage photos & route maps, edit itineraries, inclusions, fixed dates, FAQs, and guest reviews."
      actions={
        <>
          <Link
            href="/admin/taxonomy"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#1c1917] hover:border-[#3f6e15] hover:text-[#3f6e15] transition-colors"
          >
            <Globe2 className="h-4 w-4 text-[#3f6e15]" />
            <span>Countries &amp; Regions</span>
          </Link>
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#1c1917] hover:border-[#3f6e15] hover:text-[#3f6e15] transition-colors"
          >
            <Layers className="h-4 w-4 text-[#3f6e15]" />
            <span>Categories</span>
          </Link>
          {canWrite && (
            <Link
              href="/admin/trips/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#f05e25] hover:bg-[#d94e18] px-4 py-2 text-sm font-semibold text-white transition-colors shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>New Trip</span>
            </Link>
          )}
        </>
      }
    >
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <label className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search trip name, slug, or area..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-[#1c1917] placeholder:text-slate-400 focus:border-[#3f6e15] focus:outline-none focus:ring-2 focus:ring-[#3f6e15]/15"
          />
        </label>

        <select
          aria-label="Filter by country"
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
        >
          <option value="all">All Countries ({trips.length})</option>
          {countries.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | "published" | "draft")
          }
          className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published Only</option>
          <option value="draft">Drafts Only</option>
        </select>
      </div>

      {statusMsg && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm flex items-center justify-between gap-3 ${
            statusMsg.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <span>{statusMsg.text}</span>
            {statusMsg.editId && (
              <Link
                href={`/admin/trips/${statusMsg.editId}`}
                className="font-semibold text-[#3f6e15] underline hover:text-[#f05e25]"
              >
                Edit Copy →
              </Link>
            )}
          </div>
          <button
            type="button"
            onClick={() => setStatusMsg(null)}
            className="text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Trips Table */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="pb-3 pr-4">Trip</th>
                <th className="pb-3 pr-4">Country / Region</th>
                <th className="pb-3 pr-4">Categories</th>
                <th className="pb-3 pr-4">Specs &amp; Content</th>
                <th className="pb-3 pr-4">Tariff</th>
                <th className="pb-3 pr-4">Visibility</th>
                <th className="pb-3 pr-4">Featured</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTrips.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={t.image}
                        alt={t.name}
                        className="h-11 w-16 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/admin/trips/${t.id}`}
                          className="font-semibold text-[#1c1917] hover:text-[#3f6e15] truncate max-w-[230px] block"
                        >
                          {t.name}
                        </Link>
                        <Link
                          href={`/destinations/${t.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 font-mono text-xs text-[#3f6e15] hover:underline"
                        >
                          <span>/{t.slug}</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4">
                    <p className="text-[#1c1917] font-medium">
                      {countryNameMap.get(t.country) ?? t.country}
                    </p>
                    <p className="text-xs text-[#57534d]">
                      {t.region
                        ? regionNameMap.get(t.region) ?? t.region
                        : t.area}
                    </p>
                  </td>
                  <td className="py-3.5 pr-4">
                    <div className="flex flex-wrap gap-1.5 max-w-[210px]">
                      {t.categories.length > 0 ? (
                        t.categories.map((catSlug) => (
                          <span
                            key={catSlug}
                            className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-[#3f6e15] whitespace-nowrap"
                          >
                            {categoryNameMap.get(catSlug) ?? catSlug}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          None
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-xs text-[#1c1917] tabular-nums whitespace-nowrap">
                    <span className="font-semibold">
                      {t.days}d · {t.maxAltitude.toLocaleString("en-US")}m
                    </span>
                    <span className="block text-xs text-[#57534d] mt-0.5">
                      {t._count.itinerary} days · {t._count.faqs ?? 0} FAQs ·{" "}
                      {t._count.reviews ?? 0} reviews
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 font-semibold text-[#3f6e15] tabular-nums whitespace-nowrap">
                    {formatPriceUsd(t.price)}
                  </td>
                  <td className="py-3.5 pr-4">
                    <button
                      type="button"
                      disabled={!canWrite || busyId === t.id}
                      onClick={() =>
                        handleQuickPatch(t.id, { isPublished: !t.isPublished })
                      }
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold cursor-pointer disabled:opacity-60 ${
                        t.isPublished
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-100 text-slate-600"
                      }`}
                    >
                      {t.isPublished ? "PUBLISHED" : "DRAFT"}
                    </button>
                  </td>
                  <td className="py-3.5 pr-4">
                    <button
                      type="button"
                      disabled={!canWrite || busyId === t.id}
                      onClick={() =>
                        handleQuickPatch(t.id, { isFeatured: !t.isFeatured })
                      }
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold cursor-pointer disabled:opacity-60 ${
                        t.isFeatured
                          ? "border-orange-200 bg-orange-50 text-[#d94e18]"
                          : "border-slate-200 bg-slate-50 text-slate-500"
                      }`}
                    >
                      <Star className="h-3 w-3" />
                      <span>{t.isFeatured ? "FEATURED" : "Standard"}</span>
                    </button>
                  </td>
                  <td className="py-3.5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        href={`/admin/trips/${t.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-[#1c1917] hover:border-[#3f6e15] hover:text-[#3f6e15]"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>{canWrite ? "Edit" : "View"}</span>
                      </Link>
                      {canWrite && (
                        <>
                          <button
                            type="button"
                            disabled={busyId === t.id}
                            onClick={() => void handleDuplicateTrip(t.id, t.name)}
                            title="Duplicate trip as draft"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-[#3f6e15] hover:border-[#3f6e15] cursor-pointer disabled:opacity-50"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={busyId === t.id}
                            onClick={() => void handleDeleteTrip(t.id, t.name)}
                            title="Delete trip"
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTrips.length === 0 && (
            <p className="py-12 text-center text-sm text-[#57534d]">
              No trips match the active search or filters.
            </p>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
