"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowLeftRight,
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  FileText,
  HelpCircle,
  ImagePlus,
  ListChecks,
  Loader2,
  Map as MapIcon,
  MessageSquareQuote,
  Plus,
  Route,
  Save,
  Search,
  ShieldAlert,
  Sparkles,
  Star,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { authFetch } from "@/lib/auth/client";
import type {
  TripCustomSectionDTO,
  TripCustomSectionPlacement,
  TripCustomSectionStyle,
  TripPriceTierDTO,
  TripServiceGroupDTO,
  TripServiceIconKey,
} from "@/lib/types";
import {
  DEFAULT_EXCLUDES_TEMPLATE,
  DEFAULT_EXCLUDE_GROUPS_TEMPLATE,
  DEFAULT_FAQS_TEMPLATE,
  DEFAULT_GEAR_TEMPLATE,
  DEFAULT_INCLUDES_TEMPLATE,
  DEFAULT_INCLUDE_GROUPS_TEMPLATE,
  HERO_IMAGE_PRESETS,
  KNOW_BEFORE_YOU_GO_PRESETS,
  slugifyClient,
} from "@/lib/admin-presets";
import AdminShell, { type AdminIdentityDTO } from "./AdminShell";

export type EditorTabKey =
  | "overview"
  | "media"
  | "itinerary"
  | "includes"
  | "cost"
  | "prep"
  | "faqs"
  | "reviews";

export interface CountryOption {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
}

export interface CategoryOption {
  id: string;
  slug: string;
  name: string;
  groupByRegion: boolean;
  isActive: boolean;
}

export interface RegionOption {
  id: string;
  slug: string;
  name: string;
  countrySlug: string;
  isActive: boolean;
}

export interface AdminItineraryDayDTO {
  id?: string;
  dayLabel: string;
  title: string;
  altitude: number;
  note: string | null;
  meals: string | null;
  accommodation: string | null;
  distanceKm: number | null;
  durationHrs: string | null;
  transport: string | null;
  image: string | null;
  guideLabel: string | null;
  guideUrl: string | null;
}

export interface AdminDepartureDTO {
  id?: string;
  startDate: string;
  endDate: string | null;
  priceOverride: number | null;
  seatsTotal: number;
  seatsBooked: number;
  status: "OPEN" | "LIMITED" | "GUARANTEED" | "SOLD_OUT" | "CANCELLED";
  notes: string | null;
  bookingCount: number;
}

export interface AdminFaqDTO {
  id?: string;
  question: string;
  answer: string;
}

export interface AdminReviewDTO {
  id?: string;
  authorName: string;
  authorCountry: string | null;
  rating: number;
  title: string | null;
  comment: string;
  tripDate: string | null;
  verified: boolean;
  isPublished: boolean;
}

export interface AdminTripEditorDTO {
  id: string;
  slug: string;
  name: string;
  country: string;
  categories: string[];
  region: string | null;
  area: string;
  image: string;
  gallery: string[];
  mapImage: string | null;
  videoUrl: string | null;
  days: number;
  maxAltitude: number;
  difficulty: string;
  price: number;
  priceUsd: number | null;
  groupMax: number;
  seasonMonths: number[];
  startPoint: string;
  endPoint: string;
  tagline: string;
  overview: string;
  itineraryIntro: string | null;
  highlights: string[];
  includes: string[];
  excludes: string[];
  gearList: string[];
  accommodationSummary: string | null;
  mealsSummary: string | null;
  transportSummary: string | null;
  weatherLocation: string | null;
  weatherLat: number | null;
  weatherLon: number | null;
  customSections: TripCustomSectionDTO[];
  includeGroups: TripServiceGroupDTO[];
  excludeGroups: TripServiceGroupDTO[];
  priceTiers: TripPriceTierDTO[];
  badge: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  featuredOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  itinerary: AdminItineraryDayDTO[];
  departures: AdminDepartureDTO[];
  faqs: AdminFaqDTO[];
  reviews: AdminReviewDTO[];
}

interface ItineraryDraft {
  dayLabel: string;
  title: string;
  altitude: string;
  note: string;
  meals: string;
  accommodation: string;
  distanceKm: string;
  durationHrs: string;
  transport: string;
  image: string;
  guideLabel: string;
  guideUrl: string;
}

interface DepartureDraft {
  id?: string;
  startDate: string;
  endDate: string;
  priceOverride: string;
  seatsTotal: string;
  seatsBooked: string;
  status: "OPEN" | "LIMITED" | "GUARANTEED" | "SOLD_OUT" | "CANCELLED";
  notes: string;
  bookingCount: number;
}

interface FaqDraft {
  question: string;
  answer: string;
}

interface ReviewDraft {
  authorName: string;
  authorCountry: string;
  rating: number;
  title: string;
  comment: string;
  tripDate: string;
  verified: boolean;
  isPublished: boolean;
}

interface PriceTierDraft {
  id: string;
  minGroup: string;
  maxGroup: string;
  label: string;
  price: string;
  priceUsd: string;
}

interface TripFormState {
  id: string | null;
  name: string;
  slug: string;
  country: string;
  categories: string[];
  region: string;
  area: string;
  image: string;
  gallery: string[];
  mapImage: string;
  videoUrl: string;
  days: string;
  maxAltitude: string;
  difficulty: string;
  price: string;
  priceUsd: string;
  groupMax: string;
  seasonMonths: number[];
  startPoint: string;
  endPoint: string;
  tagline: string;
  overview: string;
  itineraryIntro: string;
  highlights: string[];
  includes: string[];
  excludes: string[];
  gearList: string[];
  accommodationSummary: string;
  mealsSummary: string;
  transportSummary: string;
  weatherLocation: string;
  weatherLat: string;
  weatherLon: string;
  customSections: TripCustomSectionDTO[];
  includeGroups: TripServiceGroupDTO[];
  excludeGroups: TripServiceGroupDTO[];
  priceTiers: PriceTierDraft[];
  badge: string;
  isPublished: boolean;
  isFeatured: boolean;
  featuredOrder: string;
  metaTitle: string;
  metaDescription: string;
  itinerary: ItineraryDraft[];
  departures: DepartureDraft[];
  faqs: FaqDraft[];
  reviews: ReviewDraft[];
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DIFFICULTIES = [
  "Easy",
  "Moderate",
  "Challenging",
  "Strenuous",
  "Extreme",
];

const DEPARTURE_STATUSES: DepartureDraft["status"][] = [
  "OPEN",
  "LIMITED",
  "GUARANTEED",
  "SOLD_OUT",
  "CANCELLED",
];

const INPUT_CLS =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] placeholder:text-slate-400 focus:border-[#3f6e15] focus:outline-none focus:ring-2 focus:ring-[#3f6e15]/15 disabled:bg-slate-50";

const LABEL_CLS =
  "block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5";

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function buildInitialFormState(
  trip: AdminTripEditorDTO | null | undefined,
  countries: CountryOption[],
  categories: CategoryOption[]
): TripFormState {
  if (!trip) {
    return {
      id: null,
      name: "",
      slug: "",
      country: countries[0]?.slug ?? "nepal",
      categories: categories[0] ? [categories[0].slug] : ["trekking"],
      region: "",
      area: "",
      image: "/images/trips/everest.jpg",
      gallery: ["/images/trips/everest.jpg"],
      mapImage: "",
      videoUrl: "",
      days: "12",
      maxAltitude: "5364",
      difficulty: "Moderate",
      price: "145000",
      priceUsd: "1150",
      groupMax: "10",
      seasonMonths: [3, 4, 5, 10, 11],
      startPoint: "Kathmandu",
      endPoint: "Kathmandu",
      tagline: "",
      overview: "",
      itineraryIntro: "",
      highlights: [],
      includes: [],
      excludes: [],
      gearList: [],
      accommodationSummary: "",
      mealsSummary: "",
      transportSummary: "",
      weatherLocation: "",
      weatherLat: "",
      weatherLon: "",
      customSections: [],
      includeGroups: [],
      excludeGroups: [],
      priceTiers: [],
      badge: "",
      isPublished: false,
      isFeatured: false,
      featuredOrder: "0",
      metaTitle: "",
      metaDescription: "",
      itinerary: [
        {
          dayLabel: "Day 1",
          title: "Arrival in Kathmandu and expedition briefing",
          altitude: "1400",
          note: "",
          meals: "Welcome Dinner",
          accommodation: "Hotel in Kathmandu",
          distanceKm: "",
          durationHrs: "",
          transport: "",
          image: "",
          guideLabel: "",
          guideUrl: "",
        },
      ],
      departures: [],
      faqs: [],
      reviews: [],
    };
  }

  const dedupedGallery = Array.from(
    new Set([trip.image, ...(trip.gallery ?? [])].filter(Boolean))
  );

  return {
    id: trip.id,
    name: trip.name,
    slug: trip.slug,
    country: trip.country,
    categories: trip.categories,
    region: trip.region ?? "",
    area: trip.area,
    image: trip.image,
    gallery: dedupedGallery.length > 0 ? dedupedGallery : [trip.image],
    mapImage: trip.mapImage ?? "",
    videoUrl: trip.videoUrl ?? "",
    days: String(trip.days),
    maxAltitude: String(trip.maxAltitude),
    difficulty: trip.difficulty,
    price: String(trip.price),
    priceUsd:
      trip.priceUsd !== null && trip.priceUsd !== undefined
        ? String(trip.priceUsd)
        : "",
    groupMax: String(trip.groupMax),
    seasonMonths: trip.seasonMonths,
    startPoint: trip.startPoint,
    endPoint: trip.endPoint,
    tagline: trip.tagline,
    overview: trip.overview,
    itineraryIntro: trip.itineraryIntro ?? "",
    highlights: trip.highlights,
    includes: trip.includes,
    excludes: trip.excludes,
    gearList: trip.gearList ?? [],
    accommodationSummary: trip.accommodationSummary ?? "",
    mealsSummary: trip.mealsSummary ?? "",
    transportSummary: trip.transportSummary ?? "",
    weatherLocation: trip.weatherLocation ?? "",
    weatherLat:
      trip.weatherLat !== null && trip.weatherLat !== undefined
        ? String(trip.weatherLat)
        : "",
    weatherLon:
      trip.weatherLon !== null && trip.weatherLon !== undefined
        ? String(trip.weatherLon)
        : "",
    customSections: trip.customSections ?? [],
    includeGroups: trip.includeGroups ?? [],
    excludeGroups: trip.excludeGroups ?? [],
    priceTiers: (trip.priceTiers ?? []).map((t) => ({
      id: t.id,
      minGroup: String(t.minGroup),
      maxGroup: String(t.maxGroup),
      label: t.label ?? "",
      price: String(t.price),
      priceUsd:
        t.priceUsd !== null && t.priceUsd !== undefined ? String(t.priceUsd) : "",
    })),
    badge: trip.badge ?? "",
    isPublished: trip.isPublished,
    isFeatured: trip.isFeatured,
    featuredOrder: String(trip.featuredOrder),
    metaTitle: trip.metaTitle ?? "",
    metaDescription: trip.metaDescription ?? "",
    itinerary: trip.itinerary.map((d) => ({
      dayLabel: d.dayLabel,
      title: d.title,
      altitude: String(d.altitude),
      note: d.note ?? "",
      meals: d.meals ?? "",
      accommodation: d.accommodation ?? "",
      distanceKm:
        d.distanceKm !== null && d.distanceKm !== undefined
          ? String(d.distanceKm)
          : "",
      durationHrs: d.durationHrs ?? "",
      transport: d.transport ?? "",
      image: d.image ?? "",
      guideLabel: d.guideLabel ?? "",
      guideUrl: d.guideUrl ?? "",
    })),
    departures: trip.departures.map((dep) => ({
      id: dep.id,
      startDate: toDateInputValue(dep.startDate),
      endDate: toDateInputValue(dep.endDate),
      priceOverride:
        dep.priceOverride !== null && dep.priceOverride !== undefined
          ? String(dep.priceOverride)
          : "",
      seatsTotal: String(dep.seatsTotal),
      seatsBooked: String(dep.seatsBooked),
      status: dep.status,
      notes: dep.notes ?? "",
      bookingCount: dep.bookingCount ?? 0,
    })),
    faqs: trip.faqs.map((f) => ({
      question: f.question,
      answer: f.answer,
    })),
    reviews: trip.reviews.map((r) => ({
      authorName: r.authorName,
      authorCountry: r.authorCountry ?? "",
      rating: r.rating,
      title: r.title ?? "",
      comment: r.comment,
      tripDate: toDateInputValue(r.tripDate),
      verified: r.verified,
      isPublished: r.isPublished,
    })),
  };
}

function ChecklistBuilder({
  title,
  description,
  items,
  onChange,
  placeholder,
  disabled,
  templateLabel,
  templateItems,
  accentColor = "cobalt",
}: {
  title: string;
  description: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  disabled: boolean;
  templateLabel?: string;
  templateItems?: string[];
  accentColor?: "cobalt" | "emerald" | "rose" | "orange";
}) {
  const [draft, setDraft] = useState("");

  function addItem() {
    const val = draft.trim();
    if (!val) return;
    onChange([...items, val]);
    setDraft("");
  }

  function updateItem(idx: number, nextVal: string) {
    const next = [...items];
    next[idx] = nextVal;
    onChange(next);
  }

  function removeItem(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }

  function moveItem(idx: number, delta: -1 | 1) {
    const target = idx + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [picked] = next.splice(idx, 1);
    next.splice(target, 0, picked);
    onChange(next);
  }

  function loadTemplate() {
    if (!templateItems) return;
    if (items.length === 0) {
      onChange([...templateItems]);
      return;
    }
    const existingSet = new Set(items.map((x) => x.trim().toLowerCase()));
    const additions = templateItems.filter(
      (t) => !existingSet.has(t.trim().toLowerCase())
    );
    onChange([...items, ...additions]);
  }

  const titleColor =
    accentColor === "emerald"
      ? "text-emerald-700"
      : accentColor === "rose"
      ? "text-rose-700"
      : accentColor === "orange"
      ? "text-[#f05e25]"
      : "text-[#3f6e15]";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className={`font-heading font-bold text-xl ${titleColor}`}>
            {title}
          </h3>
          <p className="text-sm text-[#57534d]">{description}</p>
        </div>
        {templateItems && !disabled && (
          <button
            type="button"
            onClick={loadTemplate}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-[#f8fafc] px-3.5 py-2 text-xs font-semibold text-[#3f6e15] hover:border-[#3f6e15] hover:bg-sky-50 cursor-pointer transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#f05e25]" />
            <span>{templateLabel ?? "Load Template"}</span>
          </button>
        )}
      </div>

      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-[#f8fafc] px-3 py-2"
            >
              <span className="font-mono text-xs font-semibold text-slate-400 w-6 text-center shrink-0 tabular-nums">
                {idx + 1}.
              </span>
              <input
                type="text"
                disabled={disabled}
                value={item}
                onChange={(e) => updateItem(idx, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
                className="flex-1 bg-transparent text-sm text-[#1c1917] focus:outline-none disabled:opacity-70"
              />
              {!disabled && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, -1)}
                    aria-label="Move item up"
                    className="rounded p-1 text-slate-400 hover:text-[#3f6e15] disabled:opacity-25 cursor-pointer"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === items.length - 1}
                    onClick={() => moveItem(idx, 1)}
                    aria-label="Move item down"
                    className="rounded p-1 text-slate-400 hover:text-[#3f6e15] disabled:opacity-25 cursor-pointer"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    aria-label="Remove item"
                    className="rounded p-1 text-rose-500 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 bg-[#f8fafc] py-6 text-center text-sm text-[#57534d]">
          No items added yet. Type below or load a starter template.
        </p>
      )}

      {!disabled && (
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem();
              }
            }}
            placeholder={placeholder}
            className={INPUT_CLS}
          />
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#f05e25] hover:bg-[#d94e18] px-4 py-2.5 text-sm font-semibold text-white cursor-pointer transition-colors shrink-0 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
      )}
    </div>
  );
}

const SERVICE_ICON_OPTIONS: { value: TripServiceIconKey; label: string }[] = [
  { value: "accommodation", label: "Accommodation / Hotel" },
  { value: "meals", label: "Meals & Drinks" },
  { value: "transport", label: "Transport & Flights" },
  { value: "guide", label: "Guide & Porters" },
  { value: "equipment", label: "Trek Equipment" },
  { value: "permits", label: "Permits & Travel Docs" },
  { value: "support", label: "24/7 Company Support" },
  { value: "info", label: "General Info" },
];

function ServiceGroupBuilder({
  title,
  description,
  groups,
  onChange,
  disabled,
  templateLabel,
  templateGroups,
  accentColor = "emerald",
}: {
  title: string;
  description: string;
  groups: TripServiceGroupDTO[];
  onChange: (next: TripServiceGroupDTO[]) => void;
  disabled: boolean;
  templateLabel: string;
  templateGroups: TripServiceGroupDTO[];
  accentColor?: "emerald" | "rose";
}) {
  function addGroup() {
    onChange([
      ...groups,
      {
        id: `grp-${Date.now()}-${groups.length + 1}`,
        title: "",
        icon: "info",
        subtitle: null,
        items: [],
      },
    ]);
  }

  function loadTemplate() {
    if (groups.length === 0) {
      onChange(
        templateGroups.map((g, i) => ({
          ...g,
          id: `${g.id}-${Date.now()}-${i}`,
          items: [...g.items],
        }))
      );
      return;
    }
    const existingTitles = new Set(
      groups.map((g) => g.title.trim().toLowerCase())
    );
    const additions = templateGroups
      .filter((g) => !existingTitles.has(g.title.trim().toLowerCase()))
      .map((g, i) => ({
        ...g,
        id: `${g.id}-${Date.now()}-${i}`,
        items: [...g.items],
      }));
    if (additions.length > 0) {
      onChange([...groups, ...additions]);
    }
  }

  function moveGroup(idx: number, delta: -1 | 1) {
    const target = idx + delta;
    if (target < 0 || target >= groups.length) return;
    const next = [...groups];
    const [picked] = next.splice(idx, 1);
    next.splice(target, 0, picked);
    onChange(next);
  }

  const titleColor =
    accentColor === "rose" ? "text-rose-700" : "text-emerald-700";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className={`font-heading font-bold text-xl ${titleColor}`}>
            {title} ({groups.length})
          </h2>
          <p className="text-sm text-[#57534d]">{description}</p>
        </div>

        {!disabled && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadTemplate}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-[#f8fafc] px-3.5 py-2 text-xs font-semibold text-[#3f6e15] hover:border-[#3f6e15] hover:bg-sky-50 cursor-pointer transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#f05e25]" />
              <span>{templateLabel}</span>
            </button>
            <button
              type="button"
              onClick={addGroup}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#3f6e15] hover:bg-[#315710] px-3.5 py-2 text-xs font-semibold text-white cursor-pointer transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Category</span>
            </button>
          </div>
        )}
      </div>

      {groups.length > 0 ? (
        <div className="space-y-4">
          {groups.map((grp, idx) => (
            <div
              key={grp.id}
              className="rounded-xl border border-slate-200 bg-[#f8fafc] p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#3f6e15]">
                  Category #{idx + 1}
                </span>
                {!disabled && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveGroup(idx, -1)}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-[#3f6e15] hover:text-[#3f6e15] disabled:opacity-30 cursor-pointer"
                      aria-label="Move category up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === groups.length - 1}
                      onClick={() => moveGroup(idx, 1)}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-[#3f6e15] hover:text-[#3f6e15] disabled:opacity-30 cursor-pointer"
                      aria-label="Move category down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChange(groups.filter((_, i) => i !== idx))
                      }
                      className="grid h-7 w-7 place-items-center rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 cursor-pointer"
                      aria-label="Remove category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={LABEL_CLS}>Category Heading *</label>
                  <input
                    type="text"
                    disabled={disabled}
                    value={grp.title}
                    onChange={(e) => {
                      const next = [...groups];
                      next[idx] = { ...next[idx], title: e.target.value };
                      onChange(next);
                    }}
                    placeholder="e.g. Accommodations"
                    className={INPUT_CLS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>Icon</label>
                  <select
                    disabled={disabled}
                    value={grp.icon}
                    onChange={(e) => {
                      const next = [...groups];
                      next[idx] = {
                        ...next[idx],
                        icon: e.target.value as TripServiceIconKey,
                      };
                      onChange(next);
                    }}
                    className={INPUT_CLS}
                  >
                    {SERVICE_ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLS}>Optional Subheading</label>
                  <input
                    type="text"
                    disabled={disabled}
                    value={grp.subtitle ?? ""}
                    onChange={(e) => {
                      const next = [...groups];
                      next[idx] = {
                        ...next[idx],
                        subtitle: e.target.value || null,
                      };
                      onChange(next);
                    }}
                    placeholder="e.g. Support from the Company"
                    className={INPUT_CLS}
                  />
                </div>
              </div>

              <div>
                <label className={LABEL_CLS}>
                  Bullet Items (one item per line) *
                </label>
                <textarea
                  rows={4}
                  disabled={disabled}
                  value={grp.items.join("\n")}
                  onChange={(e) => {
                    const next = [...groups];
                    next[idx] = {
                      ...next[idx],
                      items: e.target.value.split("\n"),
                    };
                    onChange(next);
                  }}
                  placeholder={
                    "2 nights hotel accommodation in Kathmandu\nBreakfast, lunch, and dinner during the trek"
                  }
                  className={`${INPUT_CLS} leading-relaxed`}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 bg-[#f8fafc] py-6 text-center text-sm text-[#57534d]">
          No categorized sections added yet. Click &quot;{templateLabel}&quot; or &quot;Add Category&quot;.
        </p>
      )}
    </section>
  );
}

function ImageUploadZone({
  label,
  hint,
  folder,
  multiple = false,
  disabled,
  onUploaded,
}: {
  label: string;
  hint: string;
  folder: "trips" | "maps";
  multiple?: boolean;
  disabled: boolean;
  onUploaded: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function processFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0 || disabled) return;
    const files = multiple ? Array.from(fileList) : [fileList[0]];
    setUploading(true);
    setUploadError(null);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const body = new FormData();
        body.append("file", file);
        body.append("folder", folder);

        const res = await authFetch("/api/admin/upload", {
          method: "POST",
          body,
        });
        const json = (await res.json()) as {
          ok: boolean;
          url?: string;
          error?: string;
        };
        if (!res.ok || !json.ok || !json.url) {
          setUploadError(
            json.error || `Failed to upload "${file.name}". Max 5 MB JPG/PNG/WebP.`
          );
        } else {
          uploadedUrls.push(json.url);
        }
      }
      if (uploadedUrls.length > 0) {
        onUploaded(uploadedUrls);
      }
    } catch {
      setUploadError("Network error while uploading image.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled && !uploading) inputRef.current?.click();
        }}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled && !uploading) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDragging(false);
          void processFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
          disabled
            ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
            : dragging
            ? "border-[#f05e25] bg-orange-50/50 cursor-pointer"
            : "border-slate-300 bg-[#f8fafc] hover:border-[#3f6e15] hover:bg-sky-50/40 cursor-pointer"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled || uploading}
          onChange={(e) => void processFiles(e.target.files)}
          className="hidden"
        />
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-[#f05e25]" />
        ) : (
          <UploadCloud className="h-6 w-6 text-[#3f6e15]" />
        )}
        <p className="mt-2 text-sm font-semibold text-[#1c1917]">
          {uploading ? "Uploading image..." : label}
        </p>
        <p className="mt-1 text-xs text-[#57534d]">{hint}</p>
      </div>

      {uploadError && <p className="text-xs text-rose-600">{uploadError}</p>}
    </div>
  );
}

export default function AdminTripEditorClient({
  admin,
  permissions,
  canWrite,
  mode,
  justCreated = false,
  initialTrip,
  countries,
  categories,
  regions,
}: {
  admin: AdminIdentityDTO;
  permissions: readonly string[];
  canWrite: boolean;
  mode: "create" | "edit";
  justCreated?: boolean;
  initialTrip?: AdminTripEditorDTO | null;
  countries: CountryOption[];
  categories: CategoryOption[];
  regions: RegionOption[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<EditorTabKey>("overview");
  const [categoryList, setCategoryList] =
    useState<CategoryOption[]>(categories);
  const [form, setForm] = useState<TripFormState>(() =>
    buildInitialFormState(initialTrip, countries, categories)
  );
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [geoSearching, setGeoSearching] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [geoResults, setGeoResults] = useState<
    Array<{
      id: number;
      name: string;
      admin1: string | null;
      country: string | null;
      latitude: number;
      longitude: number;
      elevation: number | null;
    }>
  >([]);
  const [statusMsg, setStatusMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(() =>
    justCreated
      ? {
          type: "ok",
          text: "Trip created cleanly. You can now add more photos, fixed dates, FAQs, or click Preview Live.",
        }
      : null
  );
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({
    0: true,
  });

  // Inline Quick Add Category state
  const [quickCatOpen, setQuickCatOpen] = useState(false);
  const [quickCatName, setQuickCatName] = useState("");
  const [quickCatGroupByRegion, setQuickCatGroupByRegion] = useState(false);
  const [quickCatSaving, setQuickCatSaving] = useState(false);
  const [quickCatError, setQuickCatError] = useState<string | null>(null);

  // Manual Gallery URL input state
  const [manualGalleryUrl, setManualGalleryUrl] = useState("");

  // Available Travel Guides for one-click itinerary day attachment
  const [availableGuides, setAvailableGuides] = useState<
    Array<{ id: string; slug: string; title: string; isPublished: boolean }>
  >([]);

  useEffect(() => {
    let mounted = true;
    authFetch("/api/admin/guides")
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (
          json: {
            ok?: boolean;
            guides?: Array<{
              id: string;
              slug: string;
              title: string;
              isPublished: boolean;
            }>;
          } | null
        ) => {
          if (!mounted || !json?.ok || !Array.isArray(json.guides)) return;
          setAvailableGuides(json.guides.filter((g) => g.isPublished));
        }
      )
      .catch(() => {
        // Ignore silent fetch error in optional guide picker
      });
    return () => {
      mounted = false;
    };
  }, []);

  const regionsForFormCountry = useMemo(
    () => regions.filter((r) => r.countrySlug === form.country),
    [regions, form.country]
  );

  const uniqueGalleryPhotos = useMemo(
    () =>
      Array.from(
        new Set(
          [form.image, ...form.gallery].map((u) => u.trim()).filter(Boolean)
        )
      ),
    [form.image, form.gallery]
  );

  async function handleQuickCreateCategory() {
    if (!canWrite) return;
    const trimmed = quickCatName.trim();
    if (trimmed.length < 2) {
      setQuickCatError("Category name must be at least 2 characters.");
      return;
    }
    setQuickCatSaving(true);
    setQuickCatError(null);
    try {
      const res = await authFetch("/api/admin/taxonomy/categories", {
        method: "POST",
        body: JSON.stringify({
          name: trimmed,
          groupByRegion: quickCatGroupByRegion,
          isActive: true,
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        category?: CategoryOption;
      };
      if (!res.ok || !json.ok || !json.category) {
        setQuickCatError(json.error || "Unable to create category.");
        return;
      }
      const created = json.category;
      setCategoryList((prev) => [...prev, created]);
      setForm((prev) => ({
        ...prev,
        categories: prev.categories.includes(created.slug)
          ? prev.categories
          : [...prev.categories, created.slug],
      }));
      setQuickCatName("");
      setQuickCatGroupByRegion(false);
      setQuickCatOpen(false);
      router.refresh();
    } catch {
      setQuickCatError("Network error creating category.");
    } finally {
      setQuickCatSaving(false);
    }
  }

  async function handleSearchWeatherLocation() {
    const term =
      form.weatherLocation.trim() || form.area.trim() || form.name.trim();
    if (term.length < 2) {
      setGeoError("Enter a station name or trip area first.");
      return;
    }
    setGeoSearching(true);
    setGeoError("");
    try {
      const res = await authFetch(
        `/api/weather/geocode?q=${encodeURIComponent(term)}`
      );
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        results?: typeof geoResults;
      };
      if (!res.ok || !json.ok) {
        setGeoError(json.error || "Unable to search locations.");
        setGeoResults([]);
        return;
      }
      const list = json.results ?? [];
      setGeoResults(list);
      if (list.length === 0) {
        setGeoError(`No coordinates found for "${term}". Try a nearby town.`);
      }
    } catch {
      setGeoError("Network error searching locations.");
    } finally {
      setGeoSearching(false);
    }
  }

  function addGalleryPhotos(urls: string[]) {
    setForm((prev) => {
      const merged = Array.from(
        new Set([prev.image, ...prev.gallery, ...urls].filter(Boolean))
      );
      return {
        ...prev,
        gallery: merged,
      };
    });
  }

  function setPhotoAsCover(url: string) {
    setForm((prev) => {
      const rest = prev.gallery.filter((g) => g !== url);
      return {
        ...prev,
        image: url,
        gallery: [url, ...rest],
      };
    });
  }

  function moveGalleryPhoto(idx: number, delta: -1 | 1) {
    const target = idx + delta;
    if (target < 0 || target >= uniqueGalleryPhotos.length) return;
    const next = [...uniqueGalleryPhotos];
    const [picked] = next.splice(idx, 1);
    next.splice(target, 0, picked);
    setForm((prev) => ({
      ...prev,
      image: next[0] || prev.image,
      gallery: next,
    }));
  }

  function removeGalleryPhoto(url: string) {
    setForm((prev) => {
      const next = uniqueGalleryPhotos.filter((g) => g !== url);
      if (next.length === 0) {
        const fallback = "/images/trips/everest.jpg";
        return { ...prev, image: fallback, gallery: [fallback] };
      }
      return {
        ...prev,
        image: prev.image === url ? next[0] : prev.image,
        gallery: next,
      };
    });
  }

  function addItineraryDay() {
    setForm((prev) => {
      const nextIndex = prev.itinerary.length;
      setExpandedDays((exp) => ({ ...exp, [nextIndex]: true }));
      return {
        ...prev,
        itinerary: [
          ...prev.itinerary,
          {
            dayLabel: `Day ${nextIndex + 1}`,
            title: "",
            altitude: "0",
            note: "",
            meals: "Breakfast, Lunch, Dinner",
            accommodation: "Mountain Teahouse",
            distanceKm: "",
            durationHrs: "",
            transport: "",
            image: "",
            guideLabel: "",
            guideUrl: "",
          },
        ],
      };
    });
  }

  function duplicateItineraryDay(idx: number) {
    setForm((prev) => {
      const clone = { ...prev.itinerary[idx] };
      clone.dayLabel = `Day ${prev.itinerary.length + 1}`;
      clone.title = clone.title ? `${clone.title} (Copy)` : "";
      const next = [...prev.itinerary];
      next.splice(idx + 1, 0, clone);
      setExpandedDays((exp) => ({ ...exp, [idx + 1]: true }));
      return { ...prev, itinerary: next };
    });
  }

  function moveItineraryDay(idx: number, delta: -1 | 1) {
    const target = idx + delta;
    if (target < 0 || target >= form.itinerary.length) return;
    setForm((prev) => {
      const next = [...prev.itinerary];
      const [picked] = next.splice(idx, 1);
      next.splice(target, 0, picked);
      return { ...prev, itinerary: next };
    });
  }

  async function saveTrip(publishOverride?: boolean) {
    if (!canWrite) return;
    setStatusMsg(null);

    if (!form.name.trim() || form.name.trim().length < 2) {
      setActiveTab("overview");
      setStatusMsg({ type: "err", text: "Trip title is required (min 2 chars)." });
      return;
    }
    if (!form.area.trim() || form.area.trim().length < 2) {
      setActiveTab("overview");
      setStatusMsg({
        type: "err",
        text: "Area / display region label is required (e.g. Khumbu, Nepal).",
      });
      return;
    }
    if (form.categories.length === 0) {
      setActiveTab("overview");
      setStatusMsg({
        type: "err",
        text: "Select at least one category for this trip.",
      });
      return;
    }
    if (!form.tagline.trim() || form.tagline.trim().length < 2) {
      setActiveTab("overview");
      setStatusMsg({ type: "err", text: "Short tagline is required." });
      return;
    }
    if (!form.overview.trim() || form.overview.trim().length < 10) {
      setActiveTab("overview");
      setStatusMsg({
        type: "err",
        text: "Detailed overview is required (min 10 characters).",
      });
      return;
    }

    const nextPublished =
      publishOverride !== undefined ? publishOverride : form.isPublished;

    setSaving(true);
    const isEdit = mode === "edit" && Boolean(form.id);
    const url = isEdit ? `/api/admin/trips/${form.id}` : "/api/admin/trips";
    const method = isEdit ? "PATCH" : "POST";

    const cleanItinerary = form.itinerary
      .filter((d) => d.dayLabel.trim() && d.title.trim())
      .map((d) => ({
        dayLabel: d.dayLabel.trim(),
        title: d.title.trim(),
        altitude: Number.parseInt(d.altitude || "0", 10) || 0,
        note: d.note.trim() || null,
        meals: d.meals.trim() || null,
        accommodation: d.accommodation.trim() || null,
        distanceKm:
          d.distanceKm.trim() !== "" && !Number.isNaN(Number(d.distanceKm))
            ? Number(d.distanceKm)
            : null,
        durationHrs: d.durationHrs.trim() || null,
        transport: d.transport.trim() || null,
        image: d.image.trim() || null,
        guideLabel: d.guideLabel.trim() || null,
        guideUrl: d.guideUrl.trim() || null,
      }));

    const cleanDepartures = form.departures
      .filter((dep) => dep.startDate.trim() !== "")
      .map((dep) => ({
        id: dep.id ?? null,
        startDate: dep.startDate.trim(),
        endDate: dep.endDate.trim() || null,
        priceOverride:
          dep.priceOverride.trim() !== ""
            ? Number.parseInt(dep.priceOverride, 10)
            : null,
        seatsTotal: Math.max(1, Number.parseInt(dep.seatsTotal || "8", 10) || 8),
        seatsBooked: Math.max(0, Number.parseInt(dep.seatsBooked || "0", 10) || 0),
        status: dep.status,
        notes: dep.notes.trim() || null,
      }));

    const cleanFaqs = form.faqs
      .filter((f) => f.question.trim().length >= 3 && f.answer.trim().length >= 3)
      .map((f) => ({
        question: f.question.trim(),
        answer: f.answer.trim(),
      }));

    const cleanReviews = form.reviews
      .filter(
        (r) => r.authorName.trim().length >= 2 && r.comment.trim().length >= 5
      )
      .map((r) => ({
        authorName: r.authorName.trim(),
        authorCountry: r.authorCountry.trim() || null,
        rating: Math.min(5, Math.max(1, r.rating || 5)),
        title: r.title.trim() || null,
        comment: r.comment.trim(),
        tripDate: r.tripDate.trim() || null,
        verified: r.verified,
        isPublished: r.isPublished,
      }));

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugifyClient(form.name),
      country: form.country,
      categories: form.categories,
      region: form.region.trim() || null,
      area: form.area.trim(),
      image: form.image.trim() || "/images/trips/everest.jpg",
      gallery: uniqueGalleryPhotos,
      mapImage: form.mapImage.trim() || null,
      videoUrl: form.videoUrl.trim() || null,
      days: Math.max(1, Number.parseInt(form.days || "1", 10) || 1),
      maxAltitude: Math.max(0, Number.parseInt(form.maxAltitude || "0", 10) || 0),
      difficulty: form.difficulty,
      price: Math.max(1000, Number.parseInt(form.price || "1000", 10) || 1000),
      priceUsd:
        form.priceUsd.trim() !== ""
          ? Number.parseInt(form.priceUsd, 10)
          : null,
      groupMax: Math.max(1, Number.parseInt(form.groupMax || "8", 10) || 8),
      seasonMonths:
        form.seasonMonths.length > 0 ? form.seasonMonths : [3, 4, 5, 10, 11],
      startPoint: form.startPoint.trim() || "Kathmandu",
      endPoint: form.endPoint.trim() || "Kathmandu",
      tagline: form.tagline.trim(),
      overview: form.overview.trim(),
      itineraryIntro: form.itineraryIntro.trim() || null,
      highlights: form.highlights.map((x) => x.trim()).filter(Boolean),
      includes: form.includes.map((x) => x.trim()).filter(Boolean),
      excludes: form.excludes.map((x) => x.trim()).filter(Boolean),
      gearList: form.gearList.map((x) => x.trim()).filter(Boolean),
      accommodationSummary: form.accommodationSummary.trim() || null,
      mealsSummary: form.mealsSummary.trim() || null,
      transportSummary: form.transportSummary.trim() || null,
      weatherLocation: form.weatherLocation.trim() || null,
      weatherLat:
        form.weatherLat.trim() !== "" && !Number.isNaN(Number(form.weatherLat))
          ? Number(form.weatherLat)
          : null,
      weatherLon:
        form.weatherLon.trim() !== "" && !Number.isNaN(Number(form.weatherLon))
          ? Number(form.weatherLon)
          : null,
      customSections: form.customSections
        .filter((s) => s.title.trim().length >= 2 && s.content.trim().length >= 5)
        .map((s) => ({
          id: s.id,
          title: s.title.trim(),
          content: s.content.trim(),
          style: s.style,
          placement: s.placement,
        })),
      includeGroups: form.includeGroups
        .map((g) => ({
          id: g.id,
          title: g.title.trim(),
          icon: g.icon,
          subtitle: g.subtitle?.trim() || null,
          items: g.items.map((x) => x.trim()).filter(Boolean),
        }))
        .filter((g) => g.title.length >= 2 && g.items.length > 0),
      excludeGroups: form.excludeGroups
        .map((g) => ({
          id: g.id,
          title: g.title.trim(),
          icon: g.icon,
          subtitle: g.subtitle?.trim() || null,
          items: g.items.map((x) => x.trim()).filter(Boolean),
        }))
        .filter((g) => g.title.length >= 2 && g.items.length > 0),
      priceTiers: form.priceTiers
        .filter(
          (t) =>
            t.minGroup.trim() !== "" &&
            t.maxGroup.trim() !== "" &&
            t.price.trim() !== ""
        )
        .map((t) => {
          const minG = Math.max(1, Number.parseInt(t.minGroup || "1", 10) || 1);
          const maxG = Math.max(
            minG,
            Number.parseInt(t.maxGroup || String(minG), 10) || minG
          );
          return {
            id: t.id,
            minGroup: minG,
            maxGroup: maxG,
            label: t.label.trim() || null,
            price: Math.max(
              1000,
              Number.parseInt(t.price || "1000", 10) || 1000
            ),
            priceUsd:
              t.priceUsd.trim() !== ""
                ? Number.parseInt(t.priceUsd, 10)
                : null,
          };
        }),
      badge: form.badge.trim() || null,
      isPublished: nextPublished,
      isFeatured: form.isFeatured,
      featuredOrder: Number.parseInt(form.featuredOrder || "0", 10) || 0,
      metaTitle: form.metaTitle.trim() || null,
      metaDescription: form.metaDescription.trim() || null,
      itinerary: cleanItinerary,
      departures: cleanDepartures,
      faqs: cleanFaqs,
      reviews: cleanReviews,
    };

    try {
      const res = await authFetch(url, {
        method,
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        trip?: { id: string; slug: string };
      };
      if (!res.ok || !json.ok || !json.trip) {
        setStatusMsg({
          type: "err",
          text: json.error || "Unable to save trip.",
        });
        return;
      }

      if (!isEdit) {
        router.push(`/admin/trips/${json.trip.id}?saved=1`);
        router.refresh();
        return;
      }

      setForm((prev) => ({
        ...prev,
        slug: json.trip?.slug ?? prev.slug,
        isPublished: nextPublished,
      }));
      setStatusMsg({
        type: "ok",
        text: nextPublished
          ? `Saved and published "${payload.name}" to the live catalog.`
          : `Saved "${payload.name}" as draft.`,
      });
      router.refresh();
    } catch {
      setStatusMsg({ type: "err", text: "Network error saving trip." });
    } finally {
      setSaving(false);
    }
  }

  const knowBeforeYouGoItems = form.customSections.filter(
    (s) => s.placement === "know_before_you_go"
  );
  const otherCustomSections = form.customSections.filter(
    (s) => s.placement !== "know_before_you_go"
  );

  function addCustomSectionItem(item: Omit<TripCustomSectionDTO, "id">) {
    setForm((prev) => ({
      ...prev,
      customSections: [
        ...prev.customSections,
        {
          id: `sec-${Date.now()}-${prev.customSections.length + 1}`,
          ...item,
        },
      ],
    }));
  }

  function updateCustomSectionById(
    id: string,
    patch: Partial<Omit<TripCustomSectionDTO, "id">>
  ) {
    setForm((prev) => ({
      ...prev,
      customSections: prev.customSections.map((s) =>
        s.id === id ? { ...s, ...patch } : s
      ),
    }));
  }

  function swapCustomSectionIds(idA: string, idB: string) {
    setForm((prev) => {
      const next = [...prev.customSections];
      const idxA = next.findIndex((s) => s.id === idA);
      const idxB = next.findIndex((s) => s.id === idB);
      if (idxA === -1 || idxB === -1) return prev;
      const tmp = next[idxA];
      next[idxA] = next[idxB];
      next[idxB] = tmp;
      return { ...prev, customSections: next };
    });
  }

  function removeCustomSectionById(id: string) {
    setForm((prev) => ({
      ...prev,
      customSections: prev.customSections.filter((s) => s.id !== id),
    }));
  }

  const tabs: {
    key: EditorTabKey;
    label: string;
    badge?: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { key: "overview", label: "Overview", icon: FileText },
    {
      key: "media",
      label: "Photos & Map",
      badge: `${uniqueGalleryPhotos.length}${form.mapImage ? "+Map" : ""}`,
      icon: ImagePlus,
    },
    {
      key: "itinerary",
      label: "Itinerary",
      badge: String(form.itinerary.length),
      icon: Route,
    },
    {
      key: "includes",
      label: "Includes & Excludes",
      badge: `${form.includeGroups.length || form.includes.length}/${
        form.excludeGroups.length || form.excludes.length
      }`,
      icon: ListChecks,
    },
    {
      key: "cost",
      label: "Cost & Departures",
      badge:
        form.priceTiers.length > 0
          ? `${form.priceTiers.length}T/${form.departures.length}`
          : String(form.departures.length),
      icon: Calendar,
    },
    {
      key: "prep",
      label: "Extra Info & Prep",
      badge: String(form.customSections.length + form.gearList.length),
      icon: ShieldAlert,
    },
    {
      key: "faqs",
      label: "FAQs",
      badge: String(form.faqs.length),
      icon: HelpCircle,
    },
    {
      key: "reviews",
      label: "Reviews",
      badge: String(form.reviews.length),
      icon: MessageSquareQuote,
    },
  ];

  return (
    <AdminShell
      admin={admin}
      permissions={permissions}
      title={
        mode === "create"
          ? "Create New Expedition"
          : form.name || "Edit Expedition"
      }
      subtitle="Full expedition builder covering media gallery, route map, rich itinerary, inclusions, fixed dates, preparation checklist, FAQs, and reviews."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/trips"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-[#1c1917] hover:border-[#3f6e15] hover:text-[#3f6e15]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All Trips</span>
          </Link>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
              form.isPublished
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-100 text-slate-600"
            }`}
          >
            {form.isPublished ? "Published" : "Draft"}
          </span>

          {mode === "edit" && form.slug && (
            <Link
              href={`/destinations/${form.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-[#3f6e15] hover:border-[#3f6e15]"
            >
              <span>Preview Live</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}

          {canWrite && (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveTrip(false)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-[#1c1917] hover:border-[#3f6e15] hover:text-[#3f6e15] disabled:opacity-60 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Save Draft</span>
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveTrip(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#f05e25] hover:bg-[#d94e18] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 cursor-pointer shadow-xs"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <span>
                  {saving
                    ? "Saving..."
                    : form.isPublished && mode === "edit"
                    ? "Save Changes"
                    : "Save & Publish"}
                </span>
              </button>
            </>
          )}
        </div>
      }
    >
      {statusMsg && (
        <div
          className={`rounded-[12px] border px-4 py-3 text-sm flex items-center justify-between gap-3 ${
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

      {/* Sticky 8-Tab Bar */}
      <div className="sticky top-0 z-30 -mx-1 bg-[#f8fafc]/95 backdrop-blur-md py-2.5 px-1 border-b border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  active
                    ? "bg-[#3f6e15] text-white font-semibold shadow-xs"
                    : "border border-slate-200 bg-white text-[#57534d] hover:border-[#3f6e15] hover:text-[#3f6e15]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{t.label}</span>
                {t.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Taxonomy & Menu Placement */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3f6e15]">
              1. Menu Placement (Country → Category → Region)
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLS}>Country</label>
                <select
                  disabled={!canWrite}
                  value={form.country}
                  onChange={(e) => {
                    const nextCountry = e.target.value;
                    const regionStillMatches = regions.some(
                      (r) =>
                        r.slug === form.region && r.countrySlug === nextCountry
                    );
                    setForm((prev) => ({
                      ...prev,
                      country: nextCountry,
                      region: regionStillMatches ? prev.region : "",
                    }));
                  }}
                  className={INPUT_CLS}
                >
                  {countries.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name} ({c.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL_CLS}>Region Sub-Group (Optional)</label>
                <select
                  disabled={!canWrite}
                  value={form.region}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, region: e.target.value }))
                  }
                  className={INPUT_CLS}
                >
                  <option value="">None (direct under category)</option>
                  {regionsForFormCountry.map((r) => (
                    <option key={r.id} value={r.slug}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Categories (Select one or more)
                </span>
                {canWrite && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuickCatOpen((v) => !v);
                      setQuickCatError(null);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#f05e25]/40 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-[#f05e25] hover:bg-orange-100 cursor-pointer transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>
                      {quickCatOpen ? "Cancel" : "Quick Add Category"}
                    </span>
                  </button>
                )}
              </div>

              {quickCatOpen && canWrite && (
                <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-3.5 space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <input
                      type="text"
                      value={quickCatName}
                      onChange={(e) => setQuickCatName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void handleQuickCreateCategory();
                        }
                      }}
                      placeholder="e.g. Helicopter Tours"
                      className="flex-1 min-w-[200px] rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-[#1c1917] placeholder:text-slate-400 focus:border-[#3f6e15] focus:outline-none"
                    />
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-[#1c1917] cursor-pointer select-none px-1">
                      <input
                        type="checkbox"
                        checked={quickCatGroupByRegion}
                        onChange={(e) =>
                          setQuickCatGroupByRegion(e.target.checked)
                        }
                        className="h-4 w-4 accent-[#3f6e15]"
                      />
                      <span>Group by Region</span>
                    </label>
                    <button
                      type="button"
                      disabled={quickCatSaving}
                      onClick={() => void handleQuickCreateCategory()}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#f05e25] hover:bg-[#d94e18] px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-60 cursor-pointer transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{quickCatSaving ? "Adding..." : "Add"}</span>
                    </button>
                  </div>
                  {quickCatError && (
                    <p className="text-xs text-rose-600">{quickCatError}</p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {categoryList.map((cat) => {
                  const checked = form.categories.includes(cat.slug);
                  return (
                    <label
                      key={cat.id}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium cursor-pointer transition-colors ${
                        checked
                          ? "border-[#3f6e15] bg-[#3f6e15]/10 text-[#3f6e15] font-semibold"
                          : "border-slate-200 bg-white text-[#57534d] hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        disabled={!canWrite}
                        checked={checked}
                        onChange={(e) => {
                          setForm((prev) => ({
                            ...prev,
                            categories: e.target.checked
                              ? [...prev.categories, cat.slug]
                              : prev.categories.filter((s) => s !== cat.slug),
                          }));
                        }}
                        className="h-4 w-4 accent-[#3f6e15]"
                      />
                      <span>{cat.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Identity & Trail Specifications */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3f6e15]">
              2. Core Specifications
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLS}>Trip Title *</label>
                <input
                  type="text"
                  disabled={!canWrite}
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      name,
                      slug: slugTouched ? prev.slug : slugifyClient(name),
                    }));
                  }}
                  placeholder="e.g. Everest Base Camp Trek"
                  className={INPUT_CLS}
                />
              </div>

              <div>
                <label className={LABEL_CLS}>URL Slug *</label>
                <input
                  type="text"
                  disabled={!canWrite}
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setForm((prev) => ({
                      ...prev,
                      slug: slugifyClient(e.target.value),
                    }));
                  }}
                  placeholder="everest-base-camp-trek"
                  className={`${INPUT_CLS} font-mono text-xs text-[#3f6e15]`}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={LABEL_CLS}>Area Label *</label>
                <input
                  type="text"
                  disabled={!canWrite}
                  value={form.area}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, area: e.target.value }))
                  }
                  placeholder="e.g. Khumbu, Nepal"
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Start Point</label>
                <input
                  type="text"
                  disabled={!canWrite}
                  value={form.startPoint}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, startPoint: e.target.value }))
                  }
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>End Point</label>
                <input
                  type="text"
                  disabled={!canWrite}
                  value={form.endPoint}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, endPoint: e.target.value }))
                  }
                  className={INPUT_CLS}
                />
              </div>
            </div>

            <div className="grid gap-4 grid-cols-2 sm:grid-cols-5">
              <div>
                <label className={LABEL_CLS}>Days</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  disabled={!canWrite}
                  value={form.days}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, days: e.target.value }))
                  }
                  className={`${INPUT_CLS} font-mono`}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Max Altitude (m)</label>
                <input
                  type="number"
                  min={0}
                  max={9000}
                  disabled={!canWrite}
                  value={form.maxAltitude}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      maxAltitude: e.target.value,
                    }))
                  }
                  className={`${INPUT_CLS} font-mono`}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Difficulty</label>
                <select
                  disabled={!canWrite}
                  value={form.difficulty}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, difficulty: e.target.value }))
                  }
                  className={INPUT_CLS}
                >
                  {DIFFICULTIES.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLS}>Max Group Size</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  disabled={!canWrite}
                  value={form.groupMax}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, groupMax: e.target.value }))
                  }
                  className={`${INPUT_CLS} font-mono`}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Ribbon Badge</label>
                <input
                  type="text"
                  disabled={!canWrite}
                  value={form.badge}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, badge: e.target.value }))
                  }
                  placeholder="e.g. Classic"
                  className={INPUT_CLS}
                />
              </div>
            </div>

            <div>
              <span className={LABEL_CLS}>Best Operating Seasons</span>
              <div className="flex flex-wrap gap-1.5">
                {MONTH_LABELS.map((mLabel, i) => {
                  const monthNum = i + 1;
                  const active = form.seasonMonths.includes(monthNum);
                  return (
                    <button
                      key={mLabel}
                      type="button"
                      disabled={!canWrite}
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          seasonMonths: active
                            ? prev.seasonMonths.filter((m) => m !== monthNum)
                            : [...prev.seasonMonths, monthNum].sort(
                                (a, b) => a - b
                              ),
                        }));
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                        active
                          ? "bg-[#3f6e15] text-white"
                          : "border border-slate-200 bg-[#f8fafc] text-[#57534d] hover:border-[#3f6e15]"
                      }`}
                    >
                      {mLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-100">
              <label className="flex items-center gap-2 text-sm font-medium text-[#1c1917] cursor-pointer">
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
                  className="h-4 w-4 accent-[#f05e25]"
                />
                <span>Feature on Homepage</span>
              </label>

              {form.isFeatured && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Featured Order:
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={999}
                    disabled={!canWrite}
                    value={form.featuredOrder}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        featuredOrder: e.target.value,
                      }))
                    }
                    className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-sm text-[#1c1917] focus:border-[#3f6e15] focus:outline-none"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Editorial Copy */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3f6e15]">
              3. Editorial Story &amp; SEO
            </p>

            <div>
              <label className={LABEL_CLS}>Hero Tagline *</label>
              <input
                type="text"
                disabled={!canWrite}
                value={form.tagline}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tagline: e.target.value }))
                }
                placeholder="One crisp line summarizing this expedition..."
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className={LABEL_CLS}>Detailed Overview *</label>
              <textarea
                rows={6}
                disabled={!canWrite}
                value={form.overview}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, overview: e.target.value }))
                }
                placeholder="Describe the terrain, cultural encounters, acclimatization pacing, and panoramic rewards..."
                className={`${INPUT_CLS} leading-relaxed`}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLS}>SEO Meta Title (Optional)</label>
                <input
                  type="text"
                  disabled={!canWrite}
                  value={form.metaTitle}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, metaTitle: e.target.value }))
                  }
                  placeholder="Auto-generated if left blank"
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>
                  SEO Meta Description (Optional)
                </label>
                <input
                  type="text"
                  disabled={!canWrite}
                  value={form.metaDescription}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      metaDescription: e.target.value,
                    }))
                  }
                  placeholder="Auto-generated if left blank"
                  className={INPUT_CLS}
                />
              </div>
            </div>
          </section>

          {/* 4. Trip Facts & Live Mountain Weather */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3f6e15]">
                4. Trip Facts &amp; Mountain Weather
              </p>
              <span className="text-xs text-[#57534d]">
                Leave blank to use smart defaults by region
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={LABEL_CLS}>Accommodation Summary</label>
                <input
                  type="text"
                  disabled={!canWrite}
                  value={form.accommodationSummary}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      accommodationSummary: e.target.value,
                    }))
                  }
                  placeholder="e.g. Hotel & Mountain Teahouses"
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Meals Summary</label>
                <input
                  type="text"
                  disabled={!canWrite}
                  value={form.mealsSummary}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      mealsSummary: e.target.value,
                    }))
                  }
                  placeholder="e.g. Breakfast, Lunch & Dinner"
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Transport Summary</label>
                <input
                  type="text"
                  disabled={!canWrite}
                  value={form.transportSummary}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      transportSummary: e.target.value,
                    }))
                  }
                  placeholder="e.g. Domestic Flight & Private Vehicle"
                  className={INPUT_CLS}
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={LABEL_CLS}>Weather Station Label</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      disabled={!canWrite}
                      value={form.weatherLocation}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          weatherLocation: e.target.value,
                        }))
                      }
                      placeholder="Auto-geocoded from Area if blank"
                      className={INPUT_CLS}
                    />
                    {canWrite && (
                      <button
                        type="button"
                        disabled={geoSearching}
                        onClick={() => void handleSearchWeatherLocation()}
                        title="Find exact coordinates for this location"
                        className="inline-flex items-center gap-1.5 shrink-0 rounded-xl border border-[#3f6e15]/30 bg-[#3f6e15]/8 px-3 py-2 text-xs font-semibold text-[#3f6e15] hover:bg-[#3f6e15] hover:text-white disabled:opacity-50 cursor-pointer transition-colors"
                      >
                        {geoSearching ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Search className="h-3.5 w-3.5" />
                        )}
                        <span>Find</span>
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className={LABEL_CLS}>Latitude (Optional)</label>
                  <input
                    type="number"
                    step="any"
                    min={-90}
                    max={90}
                    disabled={!canWrite}
                    value={form.weatherLat}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, weatherLat: e.target.value }))
                    }
                    placeholder="e.g. 27.9958"
                    className={INPUT_CLS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>Longitude (Optional)</label>
                  <input
                    type="number"
                    step="any"
                    min={-180}
                    max={180}
                    disabled={!canWrite}
                    value={form.weatherLon}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, weatherLon: e.target.value }))
                    }
                    placeholder="e.g. 86.8289"
                    className={INPUT_CLS}
                  />
                </div>
              </div>

              {geoError && (
                <p className="text-xs text-rose-600">{geoError}</p>
              )}

              {geoResults.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#3f6e15]">
                      Select exact weather coordinates:
                    </span>
                    <button
                      type="button"
                      onClick={() => setGeoResults([])}
                      className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {geoResults.map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            weatherLocation: place.name,
                            weatherLat: place.latitude.toFixed(4),
                            weatherLon: place.longitude.toFixed(4),
                          }));
                          setGeoResults([]);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left hover:border-[#3f6e15] hover:bg-sky-50/40 cursor-pointer transition-colors"
                      >
                        <p className="text-sm font-semibold text-[#1c1917]">
                          {place.name}
                          {place.elevation !== null && (
                            <span className="ml-1.5 text-xs font-medium text-[#f05e25]">
                              ({place.elevation}m)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-[#57534d]">
                          {[place.admin1, place.country]
                            .filter(Boolean)
                            .join(", ")}{" "}
                          · {place.latitude.toFixed(3)},{" "}
                          {place.longitude.toFixed(3)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <ChecklistBuilder
            title="Key Trip Highlights"
            description="Top selling points displayed prominently in the Overview section."
            items={form.highlights}
            onChange={(next) =>
              setForm((prev) => ({ ...prev, highlights: next }))
            }
            placeholder="e.g. Sunrise summit hike up Kala Patthar (5,545m) facing Mt. Everest"
            disabled={!canWrite}
            accentColor="cobalt"
          />
        </div>
      )}

      {/* TAB 2: PHOTOS & MAP */}
      {activeTab === "media" && (
        <div className="space-y-6">
          {/* Primary Cover Photo */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-heading font-bold text-xl text-[#1c1917]">
                Hero Cover Photo
              </h2>
              <p className="text-sm text-[#57534d]">
                Shown on destination cards and as the large left photo in the gallery mosaic.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-2.5 top-2.5 rounded-full bg-[#f05e25] px-2.5 py-0.5 text-[11px] font-bold uppercase text-white shadow-xs">
                  Active Cover
                </span>
              </div>

              <div className="space-y-3">
                <ImageUploadZone
                  label="Drag & drop a new Cover Photo or click to upload"
                  hint="JPG, PNG, or WebP up to 5 MB"
                  folder="trips"
                  multiple={false}
                  disabled={!canWrite}
                  onUploaded={(urls) => {
                    if (urls[0]) setPhotoAsCover(urls[0]);
                  }}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={LABEL_CLS}>Or Choose Stock Preset</label>
                    <select
                      disabled={!canWrite}
                      value={
                        HERO_IMAGE_PRESETS.some((p) => p.url === form.image)
                          ? form.image
                          : ""
                      }
                      onChange={(e) => {
                        if (e.target.value) setPhotoAsCover(e.target.value);
                      }}
                      className={INPUT_CLS}
                    >
                      <option value="">Choose local preset...</option>
                      {HERO_IMAGE_PRESETS.map((p) => (
                        <option key={p.url} value={p.url}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={LABEL_CLS}>Cover Image Path / URL</label>
                    <input
                      type="text"
                      disabled={!canWrite}
                      value={form.image}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          image: e.target.value,
                          gallery: Array.from(
                            new Set(
                              [e.target.value, ...prev.gallery].filter(Boolean)
                            )
                          ),
                        }))
                      }
                      className={`${INPUT_CLS} font-mono text-xs`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Multi-Photo Gallery Manager */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-heading font-bold text-xl text-[#1c1917]">
                Photo Gallery ({uniqueGalleryPhotos.length} photos)
              </h2>
              <p className="text-sm text-[#57534d]">
                Slot #1 is your main Hero photo; slots #2–#4 fill the right mosaic tiles, and extra photos open inside the &quot;+X photos&quot; lightbox.
              </p>
            </div>

            <ImageUploadZone
              label="Drag & drop multiple trip photos or click to browse"
              hint="Select multiple JPG, PNG, or WebP files at once (max 5 MB each)"
              folder="trips"
              multiple={true}
              disabled={!canWrite}
              onUploaded={(urls) => addGalleryPhotos(urls)}
            />

            {canWrite && (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={manualGalleryUrl}
                  onChange={(e) => setManualGalleryUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = manualGalleryUrl.trim();
                      if (val) {
                        addGalleryPhotos([val]);
                        setManualGalleryUrl("");
                      }
                    }
                  }}
                  placeholder="Or paste image path e.g. /images/trips/gokyo.jpg"
                  className="flex-1 min-w-[220px] rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-xs text-[#1c1917] placeholder:text-slate-400 focus:border-[#3f6e15] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = manualGalleryUrl.trim();
                    if (val) {
                      addGalleryPhotos([val]);
                      setManualGalleryUrl("");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#3f6e15] hover:border-[#3f6e15] cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add URL</span>
                </button>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {uniqueGalleryPhotos.map((photoUrl, idx) => {
                const isCover = photoUrl === form.image;
                return (
                  <div
                    key={`${photoUrl}-${idx}`}
                    className={`rounded-xl border overflow-hidden bg-[#f8fafc] ${
                      isCover ? "border-[#f05e25] ring-2 ring-[#f05e25]/20" : "border-slate-200"
                    }`}
                  >
                    <div className="relative aspect-[4/3] bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoUrl}
                        alt={`Gallery slot ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <span
                        className={`absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          isCover
                            ? "bg-[#f05e25] text-white"
                            : "bg-slate-900/75 text-white"
                        }`}
                      >
                        {isCover ? "#1 Hero" : `#${idx + 1}`}
                      </span>
                    </div>

                    <div className="p-2.5 flex items-center justify-between gap-1.5 bg-white">
                      {!isCover && canWrite ? (
                        <button
                          type="button"
                          onClick={() => setPhotoAsCover(photoUrl)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-[#3f6e15] hover:border-[#3f6e15] cursor-pointer"
                        >
                          Set Hero
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-[#57534d] truncate">
                          {isCover ? "Primary cover" : "Gallery"}
                        </span>
                      )}

                      {canWrite && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveGalleryPhoto(idx, -1)}
                            title="Move earlier"
                            className="rounded p-1 text-slate-400 hover:text-[#3f6e15] disabled:opacity-25 cursor-pointer"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === uniqueGalleryPhotos.length - 1}
                            onClick={() => moveGalleryPhoto(idx, 1)}
                            title="Move later"
                            className="rounded p-1 text-slate-400 hover:text-[#3f6e15] disabled:opacity-25 cursor-pointer"
                          >
                            <ArrowLeftRight className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeGalleryPhoto(photoUrl)}
                            title="Remove photo"
                            className="rounded p-1 text-rose-500 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Route Map & Video */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3f6e15]/10 text-[#3f6e15]">
                <MapIcon className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-heading font-bold text-xl text-[#1c1917]">
                  Trekking Route Map &amp; Video
                </h2>
                <p className="text-sm text-[#57534d]">
                  Upload a trail map image displayed inside the dedicated Map section.
                </p>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
              <div>
                {form.mapImage ? (
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-200 bg-[#f8fafc]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.mapImage}
                      alt="Route map preview"
                      className="h-full w-full object-contain"
                    />
                    {canWrite && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({ ...prev, mapImage: "" }))
                        }
                        className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer shadow-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove Map</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-[#f8fafc] text-center p-4">
                    <MapIcon className="h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-xs text-[#57534d]">
                      No route map uploaded yet
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <ImageUploadZone
                  label="Drag & drop a Route Map image or click to upload"
                  hint="JPG, PNG, or WebP map graphic up to 5 MB"
                  folder="maps"
                  multiple={false}
                  disabled={!canWrite}
                  onUploaded={(urls) => {
                    if (urls[0]) {
                      setForm((prev) => ({ ...prev, mapImage: urls[0] }));
                    }
                  }}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={LABEL_CLS}>Map Image Path / URL</label>
                    <input
                      type="text"
                      disabled={!canWrite}
                      value={form.mapImage}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, mapImage: e.target.value }))
                      }
                      placeholder="/api/uploads/maps/..."
                      className={`${INPUT_CLS} font-mono text-xs`}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>
                      Promo Video URL (Optional)
                    </label>
                    <input
                      type="text"
                      disabled={!canWrite}
                      value={form.videoUrl}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, videoUrl: e.target.value }))
                      }
                      placeholder="https://youtube.com/..."
                      className={`${INPUT_CLS} font-mono text-xs`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: ITINERARY */}
      {activeTab === "itinerary" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-heading font-bold text-xl text-[#1c1917]">
                Day-by-Day Itinerary ({form.itinerary.length} stages)
              </h2>
              <p className="text-sm text-[#57534d]">
                Include elevation, meals, accommodation, walking distance, and hours for each stage.
              </p>
            </div>
            {canWrite && (
              <button
                type="button"
                onClick={addItineraryDay}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#f05e25] hover:bg-[#d94e18] px-4 py-2 text-sm font-semibold text-white cursor-pointer shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Add Day</span>
              </button>
            )}
          </div>

          <div>
            <label className={LABEL_CLS}>
              Detailed Itinerary Intro / Logistics Overview (Optional)
            </label>
            <p className="text-xs text-[#57534d] mb-2">
              Appears right above Day 1 in Detailed Itinerary (e.g., hotel categories, airport pickup options, route summary, or pacing flexibility note).
            </p>
            <textarea
              rows={4}
              disabled={!canWrite}
              value={form.itineraryIntro}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, itineraryIntro: e.target.value }))
              }
              placeholder="Write general logistics or accommodation notes for the whole itinerary..."
              className={`${INPUT_CLS} leading-relaxed`}
            />
          </div>

          <div className="space-y-3">
            {form.itinerary.map((day, idx) => {
              const isOpen = expandedDays[idx] ?? false;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-[#f8fafc] overflow-hidden"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-white">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedDays((prev) => ({ ...prev, [idx]: !isOpen }))
                      }
                      className="flex flex-1 min-w-[200px] items-center gap-3 text-left cursor-pointer"
                    >
                      <span className="rounded-lg bg-[#3f6e15]/10 px-2.5 py-1 font-mono text-xs font-bold text-[#3f6e15]">
                        {day.dayLabel || `Day ${idx + 1}`}
                      </span>
                      <span className="text-sm font-semibold text-[#1c1917] truncate">
                        {day.title || "(Untitled stage)"}
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#f05e25] shrink-0">
                        {day.altitude || "0"}m
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {canWrite && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveItineraryDay(idx, -1)}
                          title="Move stage up"
                          className="rounded p-1.5 text-slate-400 hover:text-[#3f6e15] disabled:opacity-25 cursor-pointer"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === form.itinerary.length - 1}
                          onClick={() => moveItineraryDay(idx, 1)}
                          title="Move stage down"
                          className="rounded p-1.5 text-slate-400 hover:text-[#3f6e15] disabled:opacity-25 cursor-pointer"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateItineraryDay(idx)}
                          title="Duplicate stage"
                          className="rounded p-1.5 text-slate-400 hover:text-[#3f6e15] cursor-pointer"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        {form.itinerary.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                itinerary: prev.itinerary.filter(
                                  (_, dIdx) => dIdx !== idx
                                ),
                              }))
                            }
                            title="Delete stage"
                            className="rounded p-1.5 text-rose-500 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {isOpen && (
                    <div className="p-4 space-y-3 border-t border-slate-200">
                      <div className="grid gap-3 sm:grid-cols-[130px_1fr_140px]">
                        <div>
                          <label className={LABEL_CLS}>Day Label</label>
                          <input
                            type="text"
                            disabled={!canWrite}
                            value={day.dayLabel}
                            onChange={(e) => {
                              const next = [...form.itinerary];
                              next[idx] = {
                                ...next[idx],
                                dayLabel: e.target.value,
                              };
                              setForm((prev) => ({ ...prev, itinerary: next }));
                            }}
                            className={`${INPUT_CLS} font-mono`}
                          />
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Stage Title</label>
                          <input
                            type="text"
                            disabled={!canWrite}
                            value={day.title}
                            onChange={(e) => {
                              const next = [...form.itinerary];
                              next[idx] = { ...next[idx], title: e.target.value };
                              setForm((prev) => ({ ...prev, itinerary: next }));
                            }}
                            placeholder="e.g. Trek from Phakding to Namche Bazaar"
                            className={INPUT_CLS}
                          />
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Altitude (m)</label>
                          <input
                            type="number"
                            min={0}
                            max={9000}
                            disabled={!canWrite}
                            value={day.altitude}
                            onChange={(e) => {
                              const next = [...form.itinerary];
                              next[idx] = {
                                ...next[idx],
                                altitude: e.target.value,
                              };
                              setForm((prev) => ({ ...prev, itinerary: next }));
                            }}
                            className={`${INPUT_CLS} font-mono`}
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <div>
                          <label className={LABEL_CLS}>Transport</label>
                          <input
                            type="text"
                            disabled={!canWrite}
                            value={day.transport}
                            onChange={(e) => {
                              const next = [...form.itinerary];
                              next[idx] = {
                                ...next[idx],
                                transport: e.target.value,
                              };
                              setForm((prev) => ({ ...prev, itinerary: next }));
                            }}
                            placeholder="Private vehicle, Flight, On foot"
                            className={INPUT_CLS}
                          />
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Meals Included</label>
                          <input
                            type="text"
                            disabled={!canWrite}
                            value={day.meals}
                            onChange={(e) => {
                              const next = [...form.itinerary];
                              next[idx] = { ...next[idx], meals: e.target.value };
                              setForm((prev) => ({ ...prev, itinerary: next }));
                            }}
                            placeholder="Breakfast, Lunch, Dinner"
                            className={INPUT_CLS}
                          />
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Accommodation</label>
                          <input
                            type="text"
                            disabled={!canWrite}
                            value={day.accommodation}
                            onChange={(e) => {
                              const next = [...form.itinerary];
                              next[idx] = {
                                ...next[idx],
                                accommodation: e.target.value,
                              };
                              setForm((prev) => ({ ...prev, itinerary: next }));
                            }}
                            placeholder="Mountain Teahouse"
                            className={INPUT_CLS}
                          />
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Distance (km)</label>
                          <input
                            type="number"
                            step="0.1"
                            min={0}
                            max={500}
                            disabled={!canWrite}
                            value={day.distanceKm}
                            onChange={(e) => {
                              const next = [...form.itinerary];
                              next[idx] = {
                                ...next[idx],
                                distanceKm: e.target.value,
                              };
                              setForm((prev) => ({ ...prev, itinerary: next }));
                            }}
                            placeholder="e.g. 11.4"
                            className={`${INPUT_CLS} font-mono`}
                          />
                        </div>
                        <div>
                          <label className={LABEL_CLS}>Walking Duration</label>
                          <input
                            type="text"
                            disabled={!canWrite}
                            value={day.durationHrs}
                            onChange={(e) => {
                              const next = [...form.itinerary];
                              next[idx] = {
                                ...next[idx],
                                durationHrs: e.target.value,
                              };
                              setForm((prev) => ({ ...prev, itinerary: next }));
                            }}
                            placeholder="e.g. 5–6 hrs"
                            className={INPUT_CLS}
                          />
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#3f6e15]/20 bg-[#3f6e15]/[0.03] p-3.5 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#3f6e15]">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>Attach Travel Guide (Optional)</span>
                          </label>
                          <Link
                            href="/admin/guides"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3f6e15] hover:underline"
                          >
                            <span>Manage Guides</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        </div>

                        <select
                          disabled={!canWrite}
                          value={
                            availableGuides.find(
                              (g) => `/guides/${g.slug}` === day.guideUrl.trim()
                            )?.slug ?? ""
                          }
                          onChange={(e) => {
                            const selectedSlug = e.target.value;
                            const next = [...form.itinerary];
                            if (!selectedSlug) {
                              next[idx] = {
                                ...next[idx],
                                guideLabel: "",
                                guideUrl: "",
                              };
                            } else {
                              const picked = availableGuides.find(
                                (g) => g.slug === selectedSlug
                              );
                              if (picked) {
                                next[idx] = {
                                  ...next[idx],
                                  guideLabel: picked.title,
                                  guideUrl: `/guides/${picked.slug}`,
                                };
                              }
                            }
                            setForm((prev) => ({ ...prev, itinerary: next }));
                          }}
                          className={INPUT_CLS}
                        >
                          <option value="">
                            {availableGuides.length > 0
                              ? "Select a published Travel Guide (or type custom URL below)..."
                              : "No published guides yet — create one in Travel Guides"}
                          </option>
                          {availableGuides.map((g) => (
                            <option key={g.id} value={g.slug}>
                              {g.title} (/guides/{g.slug})
                            </option>
                          ))}
                        </select>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className={LABEL_CLS}>
                              Optional Guide Pill Label
                            </label>
                            <input
                              type="text"
                              disabled={!canWrite}
                              value={day.guideLabel}
                              onChange={(e) => {
                                const next = [...form.itinerary];
                                next[idx] = {
                                  ...next[idx],
                                  guideLabel: e.target.value,
                                };
                                setForm((prev) => ({
                                  ...prev,
                                  itinerary: next,
                                }));
                              }}
                              placeholder="e.g. Kathmandu, Nepal: Complete Travel Guide"
                              className={INPUT_CLS}
                            />
                          </div>
                          <div>
                            <label className={LABEL_CLS}>
                              Optional Guide Link URL
                            </label>
                            <input
                              type="text"
                              disabled={!canWrite}
                              value={day.guideUrl}
                              onChange={(e) => {
                                const next = [...form.itinerary];
                                next[idx] = {
                                  ...next[idx],
                                  guideUrl: e.target.value,
                                };
                                setForm((prev) => ({
                                  ...prev,
                                  itinerary: next,
                                }));
                              }}
                              placeholder="/guides/... or https://..."
                              className={`${INPUT_CLS} font-mono text-xs`}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className={LABEL_CLS}>
                          Detailed Day Description &amp; Logistics
                        </label>
                        <textarea
                          rows={4}
                          disabled={!canWrite}
                          value={day.note}
                          onChange={(e) => {
                            const next = [...form.itinerary];
                            next[idx] = { ...next[idx], note: e.target.value };
                            setForm((prev) => ({ ...prev, itinerary: next }));
                          }}
                          placeholder="Full description of today's transfers, trail route, attractions, acclimatization tips, and overnight stay..."
                          className={`${INPUT_CLS} leading-relaxed`}
                        />
                      </div>

                      <div className="space-y-2.5 pt-2 border-t border-slate-200/70">
                        <label className={LABEL_CLS}>Day Photo (Optional)</label>
                        <div className="grid gap-3 sm:grid-cols-[180px_1fr] items-start">
                          <div>
                            {day.image ? (
                              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={day.image}
                                  alt={`Day ${idx + 1} preview`}
                                  className="h-full w-full object-cover"
                                />
                                {canWrite && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = [...form.itinerary];
                                      next[idx] = { ...next[idx], image: "" };
                                      setForm((prev) => ({
                                        ...prev,
                                        itinerary: next,
                                      }));
                                    }}
                                    className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-white/95 border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer shadow-xs"
                                    aria-label="Remove day photo"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="flex aspect-[16/10] w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-center p-2">
                                <ImagePlus className="h-5 w-5 text-slate-300" />
                                <span className="mt-1 text-[11px] text-[#57534d]">
                                  No day photo
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <ImageUploadZone
                              label="Upload photo for this day"
                              hint="JPG, PNG, or WebP up to 5 MB"
                              folder="trips"
                              multiple={false}
                              disabled={!canWrite}
                              onUploaded={(urls) => {
                                if (urls[0]) {
                                  const next = [...form.itinerary];
                                  next[idx] = {
                                    ...next[idx],
                                    image: urls[0],
                                  };
                                  setForm((prev) => ({
                                    ...prev,
                                    itinerary: next,
                                  }));
                                }
                              }}
                            />
                            <input
                              type="text"
                              disabled={!canWrite}
                              value={day.image}
                              onChange={(e) => {
                                const next = [...form.itinerary];
                                next[idx] = {
                                  ...next[idx],
                                  image: e.target.value,
                                };
                                setForm((prev) => ({
                                  ...prev,
                                  itinerary: next,
                                }));
                              }}
                              placeholder="/api/uploads/trips/... or /images/trips/..."
                              className={`${INPUT_CLS} font-mono text-xs`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 4: INCLUDES & EXCLUDES */}
      {activeTab === "includes" && (
        <div className="space-y-6">
          <div className="space-y-6">
            <ServiceGroupBuilder
              title="Categorized What's Included"
              description="Group inclusions into structured cards (Accommodations, Meals, Ground Transport, Guides, Equipment, Support). Overrides the flat checklist below when filled."
              groups={form.includeGroups}
              onChange={(next) =>
                setForm((prev) => ({ ...prev, includeGroups: next }))
              }
              disabled={!canWrite}
              templateLabel="Load Categorized Includes Template"
              templateGroups={DEFAULT_INCLUDE_GROUPS_TEMPLATE}
              accentColor="emerald"
            />

            <ServiceGroupBuilder
              title="Categorized What's Excluded"
              description="Group exclusions cleanly (Drinks & Trail Extras, Kathmandu Meals, Flights & Visa, Personal Expenses). Overrides the flat checklist below when filled."
              groups={form.excludeGroups}
              onChange={(next) =>
                setForm((prev) => ({ ...prev, excludeGroups: next }))
              }
              disabled={!canWrite}
              templateLabel="Load Categorized Excludes Template"
              templateGroups={DEFAULT_EXCLUDE_GROUPS_TEMPLATE}
              accentColor="rose"
            />
          </div>

          <div className="border-t border-slate-200 pt-6 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#57534d]">
              Quick Flat Lists (Fallback used when no categories above are configured)
            </p>
            <div className="grid gap-6 lg:grid-cols-2">
              <ChecklistBuilder
                title="What's Included (Flat List)"
                description="Services covered in the package tariff (permits, guides, porters, meals, transfers)."
                items={form.includes}
                onChange={(next) =>
                  setForm((prev) => ({ ...prev, includes: next }))
                }
                placeholder="Add included service..."
                disabled={!canWrite}
                templateLabel="Load Nepal Trek Template"
                templateItems={DEFAULT_INCLUDES_TEMPLATE}
                accentColor="emerald"
              />

              <ChecklistBuilder
                title="What's Excluded (Flat List)"
                description="Items guests pay separately (flights, visa, insurance, personal trail extras)."
                items={form.excludes}
                onChange={(next) =>
                  setForm((prev) => ({ ...prev, excludes: next }))
                }
                placeholder="Add excluded item..."
                disabled={!canWrite}
                templateLabel="Load Standard Exclusions"
                templateItems={DEFAULT_EXCLUDES_TEMPLATE}
                accentColor="rose"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COST & DEPARTURES */}
      {activeTab === "cost" && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3f6e15]">
              Base Package Tariff
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={LABEL_CLS}>Price (NPR Rs.) *</label>
                <input
                  type="number"
                  min={1000}
                  disabled={!canWrite}
                  value={form.price}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                  className={`${INPUT_CLS} font-mono`}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Price (USD $) — Optional</label>
                <input
                  type="number"
                  min={0}
                  disabled={!canWrite}
                  value={form.priceUsd}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, priceUsd: e.target.value }))
                  }
                  placeholder="e.g. 1290"
                  className={`${INPUT_CLS} font-mono`}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Max Group Size</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  disabled={!canWrite}
                  value={form.groupMax}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, groupMax: e.target.value }))
                  }
                  className={`${INPUT_CLS} font-mono`}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-heading font-bold text-xl text-[#1c1917]">
                  Group Price Breakdown Tiers ({form.priceTiers.length})
                </h2>
                <p className="text-sm text-[#57534d]">
                  Offer tiered per-person pricing by group size (e.g., 1 person, 2–8 people, 9–15 people). Also automatically updates the live booking calculator.
                </p>
              </div>
              {canWrite && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const base = Math.max(
                        1000,
                        Number.parseInt(form.price || "100000", 10) || 100000
                      );
                      const baseUsd =
                        form.priceUsd.trim() !== ""
                          ? Number.parseInt(form.priceUsd, 10)
                          : null;
                      const ts = Date.now();
                      setForm((prev) => ({
                        ...prev,
                        priceTiers: [
                          {
                            id: `tier-${ts}-1`,
                            minGroup: "1",
                            maxGroup: "1",
                            label: "1 person",
                            price: String(base),
                            priceUsd: baseUsd !== null ? String(baseUsd) : "",
                          },
                          {
                            id: `tier-${ts}-2`,
                            minGroup: "2",
                            maxGroup: "5",
                            label: "2 - 5 people",
                            price: String(Math.round((base * 0.95) / 100) * 100),
                            priceUsd:
                              baseUsd !== null
                                ? String(Math.round(baseUsd * 0.95))
                                : "",
                          },
                          {
                            id: `tier-${ts}-3`,
                            minGroup: "6",
                            maxGroup: "12",
                            label: "6 - 12 people",
                            price: String(Math.round((base * 0.9) / 100) * 100),
                            priceUsd:
                              baseUsd !== null
                                ? String(Math.round(baseUsd * 0.9))
                                : "",
                          },
                        ],
                      }));
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-[#f8fafc] px-3.5 py-2 text-xs font-semibold text-[#3f6e15] hover:border-[#3f6e15] hover:bg-sky-50 cursor-pointer transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#f05e25]" />
                    <span>Generate Standard Tiers</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        priceTiers: [
                          ...prev.priceTiers,
                          {
                            id: `tier-${Date.now()}-${prev.priceTiers.length + 1}`,
                            minGroup: String(prev.priceTiers.length === 0 ? 1 : 2),
                            maxGroup: String(prev.priceTiers.length === 0 ? 1 : 8),
                            label: "",
                            price: prev.price || "100000",
                            priceUsd: prev.priceUsd || "",
                          },
                        ],
                      }))
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#3f6e15] hover:bg-[#315710] px-3.5 py-2 text-xs font-semibold text-white cursor-pointer shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Tier</span>
                  </button>
                </div>
              )}
            </div>

            {form.priceTiers.length > 0 ? (
              <div className="space-y-3">
                {form.priceTiers.map((tier, idx) => (
                  <div
                    key={tier.id}
                    className="rounded-xl border border-slate-200 bg-[#f8fafc] p-4 grid gap-3 sm:grid-cols-[90px_90px_1fr_130px_120px_auto] items-end"
                  >
                    <div>
                      <label className={LABEL_CLS}>Min Guests</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        disabled={!canWrite}
                        value={tier.minGroup}
                        onChange={(e) => {
                          const next = [...form.priceTiers];
                          next[idx] = { ...next[idx], minGroup: e.target.value };
                          setForm((prev) => ({ ...prev, priceTiers: next }));
                        }}
                        className={`${INPUT_CLS} font-mono`}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Max Guests</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        disabled={!canWrite}
                        value={tier.maxGroup}
                        onChange={(e) => {
                          const next = [...form.priceTiers];
                          next[idx] = { ...next[idx], maxGroup: e.target.value };
                          setForm((prev) => ({ ...prev, priceTiers: next }));
                        }}
                        className={`${INPUT_CLS} font-mono`}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Custom Label</label>
                      <input
                        type="text"
                        disabled={!canWrite}
                        value={tier.label}
                        onChange={(e) => {
                          const next = [...form.priceTiers];
                          next[idx] = { ...next[idx], label: e.target.value };
                          setForm((prev) => ({ ...prev, priceTiers: next }));
                        }}
                        placeholder="e.g. 2 - 8 people"
                        className={INPUT_CLS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Price (NPR)</label>
                      <input
                        type="number"
                        min={1000}
                        disabled={!canWrite}
                        value={tier.price}
                        onChange={(e) => {
                          const next = [...form.priceTiers];
                          next[idx] = { ...next[idx], price: e.target.value };
                          setForm((prev) => ({ ...prev, priceTiers: next }));
                        }}
                        className={`${INPUT_CLS} font-mono`}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Price (USD)</label>
                      <input
                        type="number"
                        min={0}
                        disabled={!canWrite}
                        value={tier.priceUsd}
                        onChange={(e) => {
                          const next = [...form.priceTiers];
                          next[idx] = { ...next[idx], priceUsd: e.target.value };
                          setForm((prev) => ({ ...prev, priceTiers: next }));
                        }}
                        placeholder="Opt."
                        className={`${INPUT_CLS} font-mono`}
                      />
                    </div>
                    {canWrite && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            priceTiers: prev.priceTiers.filter(
                              (_, i) => i !== idx
                            ),
                          }))
                        }
                        className="h-[42px] px-3 rounded-xl border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 cursor-pointer flex items-center justify-center"
                        aria-label="Remove tier"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300 bg-[#f8fafc] py-6 text-center text-sm text-[#57534d]">
                No group size price tiers configured. Fixed base price applies to all group sizes.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-heading font-bold text-xl text-[#1c1917]">
                  Fixed Departure Dates ({form.departures.length})
                </h2>
                <p className="text-sm text-[#57534d]">
                  Publish scheduled group departure dates, available seats, and seasonal tariff overrides.
                </p>
              </div>
              {canWrite && (
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      departures: [
                        ...prev.departures,
                        {
                          startDate: "",
                          endDate: "",
                          priceOverride: "",
                          seatsTotal: prev.groupMax || "8",
                          seatsBooked: "0",
                          status: "OPEN",
                          notes: "",
                          bookingCount: 0,
                        },
                      ],
                    }))
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#f05e25] hover:bg-[#d94e18] px-4 py-2 text-sm font-semibold text-white cursor-pointer shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Departure Date</span>
                </button>
              )}
            </div>

            {form.departures.length > 0 ? (
              <div className="space-y-3">
                {form.departures.map((dep, idx) => (
                  <div
                    key={dep.id ?? `new-${idx}`}
                    className="rounded-xl border border-slate-200 bg-[#f8fafc] p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#3f6e15]">
                        Departure #{idx + 1}
                        {dep.bookingCount > 0 &&
                          ` · ${dep.bookingCount} active booking(s)`}
                      </span>
                      {canWrite && (
                        <button
                          type="button"
                          disabled={dep.bookingCount > 0}
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              departures: prev.departures.filter(
                                (_, dIdx) => dIdx !== idx
                              ),
                            }))
                          }
                          title={
                            dep.bookingCount > 0
                              ? "Cannot delete a departure with bookings; mark CANCELLED instead"
                              : "Remove departure date"
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>
                            {dep.bookingCount > 0 ? "Has Bookings" : "Remove"}
                          </span>
                        </button>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                      <div>
                        <label className={LABEL_CLS}>Start Date *</label>
                        <input
                          type="date"
                          disabled={!canWrite}
                          value={dep.startDate}
                          onChange={(e) => {
                            const next = [...form.departures];
                            next[idx] = { ...next[idx], startDate: e.target.value };
                            setForm((prev) => ({ ...prev, departures: next }));
                          }}
                          className={`${INPUT_CLS} font-mono text-xs`}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLS}>End Date</label>
                        <input
                          type="date"
                          disabled={!canWrite}
                          value={dep.endDate}
                          onChange={(e) => {
                            const next = [...form.departures];
                            next[idx] = { ...next[idx], endDate: e.target.value };
                            setForm((prev) => ({ ...prev, departures: next }));
                          }}
                          className={`${INPUT_CLS} font-mono text-xs`}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLS}>Override (Rs.)</label>
                        <input
                          type="number"
                          min={0}
                          disabled={!canWrite}
                          value={dep.priceOverride}
                          onChange={(e) => {
                            const next = [...form.departures];
                            next[idx] = {
                              ...next[idx],
                              priceOverride: e.target.value,
                            };
                            setForm((prev) => ({ ...prev, departures: next }));
                          }}
                          placeholder="Default"
                          className={`${INPUT_CLS} font-mono text-xs`}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLS}>Total Seats</label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          disabled={!canWrite}
                          value={dep.seatsTotal}
                          onChange={(e) => {
                            const next = [...form.departures];
                            next[idx] = {
                              ...next[idx],
                              seatsTotal: e.target.value,
                            };
                            setForm((prev) => ({ ...prev, departures: next }));
                          }}
                          className={`${INPUT_CLS} font-mono text-xs`}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLS}>Booked Seats</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          disabled={!canWrite}
                          value={dep.seatsBooked}
                          onChange={(e) => {
                            const next = [...form.departures];
                            next[idx] = {
                              ...next[idx],
                              seatsBooked: e.target.value,
                            };
                            setForm((prev) => ({ ...prev, departures: next }));
                          }}
                          className={`${INPUT_CLS} font-mono text-xs`}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLS}>Status</label>
                        <select
                          disabled={!canWrite}
                          value={dep.status}
                          onChange={(e) => {
                            const next = [...form.departures];
                            next[idx] = {
                              ...next[idx],
                              status: e.target.value as DepartureDraft["status"],
                            };
                            setForm((prev) => ({ ...prev, departures: next }));
                          }}
                          className={INPUT_CLS}
                        >
                          {DEPARTURE_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        disabled={!canWrite}
                        value={dep.notes}
                        onChange={(e) => {
                          const next = [...form.departures];
                          next[idx] = { ...next[idx], notes: e.target.value };
                          setForm((prev) => ({ ...prev, departures: next }));
                        }}
                        placeholder="Optional batch note (e.g. Small group guaranteed with lead Sherpa)..."
                        className={INPUT_CLS}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300 bg-[#f8fafc] py-8 text-center text-sm text-[#57534d]">
                No fixed departure dates added yet. Guests can still request custom private dates.
              </p>
            )}
          </section>
        </div>
      )}

      {/* TAB 6: EXTRA INFO & PREPARATION */}
      {activeTab === "prep" && (
        <div className="space-y-6">
          {/* KNOW BEFORE YOU GO EXPANDABLE GUIDES */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-heading font-bold text-xl text-[#1c1917]">
                  Know Before You Go — Expandable Guides ({knowBeforeYouGoItems.length})
                </h2>
                <p className="text-xs text-[#57534d] mt-1">
                  Appears as an interactive accordion with Expand all / Collapse all on the trip page. Formatting: start a line with &quot;## Heading&quot; for subheadings, leave blank lines between paragraphs, start lines with &quot;- &quot; for bullets, and wrap text in **bold** for emphasis.
                </p>
              </div>
              {canWrite && (
                <button
                  type="button"
                  onClick={() =>
                    addCustomSectionItem({
                      title: "",
                      content: "",
                      style: "article",
                      placement: "know_before_you_go",
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3f6e15] hover:bg-[#315710] px-3.5 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Topic</span>
                </button>
              )}
            </div>

            {canWrite && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#57534d] mr-1">
                  Quick Presets:
                </span>
                {KNOW_BEFORE_YOU_GO_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      addCustomSectionItem({
                        title: preset.title,
                        content: preset.content,
                        style: "article",
                        placement: "know_before_you_go",
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-[#f8fafc] px-3 py-1.5 text-xs font-medium text-[#3f6e15] hover:border-[#3f6e15] hover:bg-sky-50 cursor-pointer transition-colors"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            )}

            {knowBeforeYouGoItems.length > 0 ? (
              <div className="space-y-4">
                {knowBeforeYouGoItems.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className="rounded-xl border border-slate-200 bg-[#f8fafc] p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#3f6e15]">
                        Guide Topic #{idx + 1}
                      </span>
                      {canWrite && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() =>
                              swapCustomSectionIds(
                                sec.id,
                                knowBeforeYouGoItems[idx - 1].id
                              )
                            }
                            className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-[#3f6e15] hover:text-[#3f6e15] disabled:opacity-30 cursor-pointer"
                            aria-label="Move topic up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === knowBeforeYouGoItems.length - 1}
                            onClick={() =>
                              swapCustomSectionIds(
                                sec.id,
                                knowBeforeYouGoItems[idx + 1].id
                              )
                            }
                            className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-[#3f6e15] hover:text-[#3f6e15] disabled:opacity-30 cursor-pointer"
                            aria-label="Move topic down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCustomSectionById(sec.id)}
                            className="grid h-7 w-7 place-items-center rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 cursor-pointer"
                            aria-label="Remove topic"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className={LABEL_CLS}>Topic Heading *</label>
                      <input
                        type="text"
                        disabled={!canWrite}
                        value={sec.title}
                        onChange={(e) =>
                          updateCustomSectionById(sec.id, {
                            title: e.target.value,
                          })
                        }
                        placeholder="e.g. Best Season to Trek EBC"
                        className={INPUT_CLS}
                      />
                    </div>

                    <div>
                      <label className={LABEL_CLS}>Detailed Guide Content *</label>
                      <textarea
                        rows={7}
                        disabled={!canWrite}
                        value={sec.content}
                        onChange={(e) =>
                          updateCustomSectionById(sec.id, {
                            content: e.target.value,
                          })
                        }
                        placeholder="Intro paragraph...&#10;&#10;## Spring (March to May)&#10;&#10;Detailed paragraphs, - bullets, or **bold highlights**..."
                        className={`${INPUT_CLS} leading-relaxed`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300 bg-[#f8fafc] py-6 text-center text-sm text-[#57534d]">
                No Know Before You Go topics added yet. Use the quick presets above or click &quot;Add Topic&quot;.
              </p>
            )}
          </section>

          {/* GENERAL CUSTOM INFO SECTIONS & NOTES */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-heading font-bold text-xl text-[#1c1917]">
                  Custom Info Sections &amp; Notes ({otherCustomSections.length})
                </h2>
                <p className="text-xs text-[#57534d] mt-1">
                  Add unlimited trip-specific notes, flight logistics, acclimatization guides, or detailed articles anywhere on the trip page. Use a blank line between paragraphs or start lines with &quot;- &quot; for bullet points.
                </p>
              </div>
              {canWrite && (
                <button
                  type="button"
                  onClick={() =>
                    addCustomSectionItem({
                      title: "",
                      content: "",
                      style: "article",
                      placement: "bottom",
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#3f6e15] hover:bg-[#315710] px-3.5 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Blank Section</span>
                </button>
              )}
            </div>

            {canWrite && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#57534d] mr-1">
                  Quick Presets:
                </span>
                {(
                  [
                    {
                      label: "Lukla Flight Info",
                      title: "Lukla Flight Information",
                      style: "callout" as TripCustomSectionStyle,
                      placement: "itinerary" as TripCustomSectionPlacement,
                      content:
                        "During peak trekking months (March, April, May, October, and November), flights to Lukla often operate from Ramechhap (Manthali) instead of Kathmandu due to air traffic.\n\nOutside peak season, flights normally depart directly from Kathmandu. Mountain flights are weather-dependent, so planning 1–2 buffer days before your international flight home is recommended.",
                    },
                    {
                      label: "Arrival Note",
                      title: "Arrival & Briefing Note",
                      style: "note" as TripCustomSectionStyle,
                      placement: "itinerary" as TripCustomSectionPlacement,
                      content:
                        "We recommend arriving in Kathmandu by 3:00 PM at least one day before your trek departure date for permit preparation and gear checks.",
                    },
                    {
                      label: "Acclimatization & Safety",
                      title: "Altitude & Acclimatization Guide",
                      style: "warning" as TripCustomSectionStyle,
                      placement: "bottom" as TripCustomSectionPlacement,
                      content:
                        "Our guides pace every ascent carefully with scheduled rest days so your body adapts naturally to high altitude.\n\n- Guides carry a pulse oximeter and comprehensive first-aid kit\n- Stay hydrated (3–4 litres daily) and communicate any symptoms early",
                    },
                    {
                      label: "Permits & Paperwork",
                      title: "Trekking Permits & Documents",
                      style: "article" as TripCustomSectionStyle,
                      placement: "bottom" as TripCustomSectionPlacement,
                      content:
                        "All national park entry and conservation permits required for this route are arranged by our Kathmandu office ahead of departure.\n\n- Passport valid for at least 6 months\n- High-altitude travel & emergency evacuation insurance certificate",
                    },
                    {
                      label: "Food & Teahouses",
                      title: "Meals & Teahouse Accommodation",
                      style: "article" as TripCustomSectionStyle,
                      placement: "bottom" as TripCustomSectionPlacement,
                      content:
                        "Throughout the trail, you stay in welcoming family-run mountain lodges with warm dining halls heated in the evenings.\n\n- Freshly prepared hot breakfast, lunch, and dinner served daily\n- Vegetarian, vegan, and dietary preferences easily accommodated",
                    },
                  ] as const
                ).map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      addCustomSectionItem({
                        title: preset.title,
                        content: preset.content,
                        style: preset.style,
                        placement: preset.placement,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-[#f8fafc] px-3 py-1.5 text-xs font-medium text-[#3f6e15] hover:border-[#3f6e15] hover:bg-sky-50 cursor-pointer transition-colors"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            )}

            {otherCustomSections.length > 0 ? (
              <div className="space-y-4">
                {otherCustomSections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className="rounded-xl border border-slate-200 bg-[#f8fafc] p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#3f6e15]">
                        Section #{idx + 1}
                      </span>
                      {canWrite && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() =>
                              swapCustomSectionIds(
                                sec.id,
                                otherCustomSections[idx - 1].id
                              )
                            }
                            className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-[#3f6e15] hover:text-[#3f6e15] disabled:opacity-30 cursor-pointer"
                            aria-label="Move section up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === otherCustomSections.length - 1}
                            onClick={() =>
                              swapCustomSectionIds(
                                sec.id,
                                otherCustomSections[idx + 1].id
                              )
                            }
                            className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-[#3f6e15] hover:text-[#3f6e15] disabled:opacity-30 cursor-pointer"
                            aria-label="Move section down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCustomSectionById(sec.id)}
                            className="grid h-7 w-7 place-items-center rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 cursor-pointer"
                            aria-label="Remove section"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className={LABEL_CLS}>Section Heading *</label>
                        <input
                          type="text"
                          disabled={!canWrite}
                          value={sec.title}
                          onChange={(e) =>
                            updateCustomSectionById(sec.id, {
                              title: e.target.value,
                            })
                          }
                          placeholder="e.g. Lukla Flight Information"
                          className={INPUT_CLS}
                        />
                      </div>

                      <div>
                        <label className={LABEL_CLS}>Visual Style</label>
                        <select
                          disabled={!canWrite}
                          value={sec.style}
                          onChange={(e) =>
                            updateCustomSectionById(sec.id, {
                              style: e.target.value as TripCustomSectionStyle,
                            })
                          }
                          className={INPUT_CLS}
                        >
                          <option value="callout">Blue Info Callout</option>
                          <option value="note">Important Note (Orange Accent)</option>
                          <option value="warning">Safety Warning (Amber)</option>
                          <option value="article">Full Article Card</option>
                        </select>
                      </div>

                      <div>
                        <label className={LABEL_CLS}>Placement on Page</label>
                        <select
                          disabled={!canWrite}
                          value={sec.placement}
                          onChange={(e) =>
                            updateCustomSectionById(sec.id, {
                              placement: e.target
                                .value as TripCustomSectionPlacement,
                            })
                          }
                          className={INPUT_CLS}
                        >
                          <option value="overview">After Highlights</option>
                          <option value="itinerary">Above Detailed Itinerary</option>
                          <option value="bottom">Extra Section Before FAQs</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={LABEL_CLS}>Content *</label>
                      <textarea
                        rows={4}
                        disabled={!canWrite}
                        value={sec.content}
                        onChange={(e) =>
                          updateCustomSectionById(sec.id, {
                            content: e.target.value,
                          })
                        }
                        placeholder="Write clear paragraphs. Leave a blank line between paragraphs, or start lines with '- ' for bullets..."
                        className={`${INPUT_CLS} leading-relaxed`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300 bg-[#f8fafc] py-6 text-center text-sm text-[#57534d]">
                No custom info sections added yet. Use the quick presets above or click &quot;Add Blank Section&quot;.
              </p>
            )}
          </section>

          <ChecklistBuilder
            title="Packing & Gear Checklist"
            description="Permits, emergency evacuation insurance rules, layering, footwear, and essential trek hardware."
            items={form.gearList}
            onChange={(next) => setForm((prev) => ({ ...prev, gearList: next }))}
            placeholder="Add packing item, permit requirement, or safety advice..."
            disabled={!canWrite}
            templateLabel="Load Standard Trek Checklist"
            templateItems={DEFAULT_GEAR_TEMPLATE}
            accentColor="orange"
          />
        </div>
      )}

      {/* TAB 7: FAQS */}
      {activeTab === "faqs" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-heading font-bold text-xl text-[#1c1917]">
                Frequently Asked Questions ({form.faqs.length})
              </h2>
              <p className="text-sm text-[#57534d]">
                Clear practical answers that help guests book with confidence.
              </p>
            </div>
            {canWrite && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => {
                      const existingQs = new Set(
                        prev.faqs.map((f) => f.question.trim().toLowerCase())
                      );
                      const additions = DEFAULT_FAQS_TEMPLATE.filter(
                        (t) => !existingQs.has(t.question.trim().toLowerCase())
                      );
                      return { ...prev, faqs: [...prev.faqs, ...additions] };
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-[#f8fafc] px-3.5 py-2 text-xs font-semibold text-[#3f6e15] hover:border-[#3f6e15] hover:bg-sky-50 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#f05e25]" />
                  <span>Load Common Trek FAQs</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      faqs: [...prev.faqs, { question: "", answer: "" }],
                    }))
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#f05e25] hover:bg-[#d94e18] px-4 py-2 text-sm font-semibold text-white cursor-pointer shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add FAQ</span>
                </button>
              </div>
            )}
          </div>

          {form.faqs.length > 0 ? (
            <div className="space-y-3">
              {form.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-[#f8fafc] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#3f6e15]">
                      FAQ #{idx + 1}
                    </span>
                    {canWrite && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            const next = [...form.faqs];
                            const [picked] = next.splice(idx, 1);
                            next.splice(idx - 1, 0, picked);
                            setForm((prev) => ({ ...prev, faqs: next }));
                          }}
                          className="rounded p-1 text-slate-400 hover:text-[#3f6e15] disabled:opacity-25 cursor-pointer"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === form.faqs.length - 1}
                          onClick={() => {
                            const next = [...form.faqs];
                            const [picked] = next.splice(idx, 1);
                            next.splice(idx + 1, 0, picked);
                            setForm((prev) => ({ ...prev, faqs: next }));
                          }}
                          className="rounded p-1 text-slate-400 hover:text-[#3f6e15] disabled:opacity-25 cursor-pointer"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              faqs: prev.faqs.filter((_, fIdx) => fIdx !== idx),
                            }))
                          }
                          className="rounded p-1 text-rose-500 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={LABEL_CLS}>Question</label>
                    <input
                      type="text"
                      disabled={!canWrite}
                      value={faq.question}
                      onChange={(e) => {
                        const next = [...form.faqs];
                        next[idx] = { ...next[idx], question: e.target.value };
                        setForm((prev) => ({ ...prev, faqs: next }));
                      }}
                      placeholder="e.g. Is travel insurance mandatory?"
                      className={INPUT_CLS}
                    />
                  </div>

                  <div>
                    <label className={LABEL_CLS}>Answer</label>
                    <textarea
                      rows={3}
                      disabled={!canWrite}
                      value={faq.answer}
                      onChange={(e) => {
                        const next = [...form.faqs];
                        next[idx] = { ...next[idx], answer: e.target.value };
                        setForm((prev) => ({ ...prev, faqs: next }));
                      }}
                      placeholder="Write a concise, helpful answer..."
                      className={`${INPUT_CLS} leading-relaxed`}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-300 bg-[#f8fafc] py-8 text-center text-sm text-[#57534d]">
              No FAQs added yet. Click &quot;Load Common Trek FAQs&quot; or &quot;Add FAQ&quot;.
            </p>
          )}
        </section>
      )}

      {/* TAB 8: REVIEWS */}
      {activeTab === "reviews" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-heading font-bold text-xl text-[#1c1917]">
                Guest Reviews &amp; Testimonials ({form.reviews.length})
              </h2>
              <p className="text-sm text-[#57534d]">
                Add verified expedition reviews or toggle visibility on the public trip page.
              </p>
            </div>
            {canWrite && (
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    reviews: [
                      {
                        authorName: "",
                        authorCountry: "",
                        rating: 5,
                        title: "",
                        comment: "",
                        tripDate: "",
                        verified: true,
                        isPublished: true,
                      },
                      ...prev.reviews,
                    ],
                  }))
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#f05e25] hover:bg-[#d94e18] px-4 py-2 text-sm font-semibold text-white cursor-pointer shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Add Review</span>
              </button>
            )}
          </div>

          {form.reviews.length > 0 ? (
            <div className="space-y-3">
              {form.reviews.map((rev, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-[#f8fafc] p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={starVal}
                          type="button"
                          disabled={!canWrite}
                          onClick={() => {
                            const next = [...form.reviews];
                            next[idx] = { ...next[idx], rating: starVal };
                            setForm((prev) => ({ ...prev, reviews: next }));
                          }}
                          aria-label={`Rate ${starVal} stars`}
                          className="cursor-pointer disabled:cursor-default"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              starVal <= rev.rating
                                ? "fill-amber-500 text-amber-500"
                                : "text-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-semibold text-[#57534d]">
                        {rev.rating}/5
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <label className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1c1917] cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!canWrite}
                          checked={rev.verified}
                          onChange={(e) => {
                            const next = [...form.reviews];
                            next[idx] = {
                              ...next[idx],
                              verified: e.target.checked,
                            };
                            setForm((prev) => ({ ...prev, reviews: next }));
                          }}
                          className="h-4 w-4 accent-[#3f6e15]"
                        />
                        <span>Verified Guest</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1c1917] cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!canWrite}
                          checked={rev.isPublished}
                          onChange={(e) => {
                            const next = [...form.reviews];
                            next[idx] = {
                              ...next[idx],
                              isPublished: e.target.checked,
                            };
                            setForm((prev) => ({ ...prev, reviews: next }));
                          }}
                          className="h-4 w-4 accent-emerald-600"
                        />
                        <span>Published</span>
                      </label>
                      {canWrite && (
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              reviews: prev.reviews.filter(
                                (_, rIdx) => rIdx !== idx
                              ),
                            }))
                          }
                          className="rounded p-1 text-rose-500 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-4">
                    <div>
                      <label className={LABEL_CLS}>Guest Name *</label>
                      <input
                        type="text"
                        disabled={!canWrite}
                        value={rev.authorName}
                        onChange={(e) => {
                          const next = [...form.reviews];
                          next[idx] = {
                            ...next[idx],
                            authorName: e.target.value,
                          };
                          setForm((prev) => ({ ...prev, reviews: next }));
                        }}
                        placeholder="e.g. Sarah Jenkins"
                        className={INPUT_CLS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Country</label>
                      <input
                        type="text"
                        disabled={!canWrite}
                        value={rev.authorCountry}
                        onChange={(e) => {
                          const next = [...form.reviews];
                          next[idx] = {
                            ...next[idx],
                            authorCountry: e.target.value,
                          };
                          setForm((prev) => ({ ...prev, reviews: next }));
                        }}
                        placeholder="e.g. United Kingdom"
                        className={INPUT_CLS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Headline Title</label>
                      <input
                        type="text"
                        disabled={!canWrite}
                        value={rev.title}
                        onChange={(e) => {
                          const next = [...form.reviews];
                          next[idx] = { ...next[idx], title: e.target.value };
                          setForm((prev) => ({ ...prev, reviews: next }));
                        }}
                        placeholder="e.g. Unforgettable Sherpa team"
                        className={INPUT_CLS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLS}>Trek Date</label>
                      <input
                        type="date"
                        disabled={!canWrite}
                        value={rev.tripDate}
                        onChange={(e) => {
                          const next = [...form.reviews];
                          next[idx] = {
                            ...next[idx],
                            tripDate: e.target.value,
                          };
                          setForm((prev) => ({ ...prev, reviews: next }));
                        }}
                        className={`${INPUT_CLS} font-mono text-xs`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={LABEL_CLS}>Review Comment *</label>
                    <textarea
                      rows={3}
                      disabled={!canWrite}
                      value={rev.comment}
                      onChange={(e) => {
                        const next = [...form.reviews];
                        next[idx] = { ...next[idx], comment: e.target.value };
                        setForm((prev) => ({ ...prev, reviews: next }));
                      }}
                      placeholder="Guest feedback about guides, acclimatization, teahouses, and scenery..."
                      className={`${INPUT_CLS} leading-relaxed`}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-300 bg-[#f8fafc] py-8 text-center text-sm text-[#57534d]">
              No reviews added yet. Click &quot;Add Review&quot; above.
            </p>
          )}
        </section>
      )}
    </AdminShell>
  );
}
