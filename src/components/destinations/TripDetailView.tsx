"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Ban,
  Banknote,
  BedDouble,
  BookOpen,
  Bus,
  Calendar,
  CalendarRange,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Expand,
  FileText,
  Footprints,
  Gauge,
  Globe,
  Heart,
  HelpCircle,
  Images,
  Info,
  Loader2,
  MapPin,
  MapPinned,
  Mountain,
  PlayCircle,
  ShieldAlert,
  ShieldCheck,
  Star,
  Sun,
  Users,
  Utensils,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BookingPanel } from "@/components/destinations/BookingPanel";
import { ElevationProfile } from "@/components/destinations/ElevationProfile";
import { TripCard } from "@/components/destinations/TripCard";
import { TripCompareModal } from "@/components/destinations/TripCompareModal";
import { TripVoiceoverPlayer } from "@/components/destinations/TripVoiceoverPlayer";
import { TripWeatherWidget } from "@/components/destinations/TripWeatherWidget";
import { CATEGORIES, REGIONS } from "@/data/trips";
import type {
  ComparableTripDTO,
  TripCustomSectionDTO,
  TripDTO,
  TripServiceIconKey,
} from "@/lib/types";
import {
  addCompareTripSlug,
  toggleSavedTripSlug,
  useCompareTripSlugs,
  useSavedTripSlugs,
} from "@/lib/trip-client-store";
import { downloadTripPdf } from "@/lib/trip-pdf";
import { formatPriceUsd } from "@/lib/booking";
import { trackViewTrip } from "@/lib/analytics";
import {
  matchTravelGuideForDayTitle,
  type TravelGuideSummaryDTO,
} from "@/lib/travel-guides";
import {
  formatPriceTierLabel,
  formatSeasonRange,
  resolveTripWeatherLocation,
} from "@/lib/weather-locations";

function ServiceGroupIcon({
  icon,
  className = "h-4.5 w-4.5",
}: {
  icon: TripServiceIconKey;
  className?: string;
}) {
  switch (icon) {
    case "accommodation":
      return <BedDouble className={className} />;
    case "meals":
      return <Utensils className={className} />;
    case "transport":
      return <Bus className={className} />;
    case "guide":
      return <Users className={className} />;
    case "equipment":
      return <Mountain className={className} />;
    case "permits":
      return <FileText className={className} />;
    case "support":
      return <ShieldCheck className={className} />;
    default:
      return <Info className={className} />;
  }
}

function SectionNavIcon({ id }: { id: string }) {
  const cls = "h-3.5 w-3.5 shrink-0";
  switch (id) {
    case "overview":
      return <BookOpen className={cls} strokeWidth={1.85} />;
    case "highlights":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.85}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cls}
          aria-hidden="true"
        >
          <path d="M12 10V3l5 2.5L12 8" />
          <path d="M3 20l6.5-10 3.5 5 2.5-3.5L21 20H3z" />
        </svg>
      );
    case "itinerary":
      return <CalendarRange className={cls} strokeWidth={1.85} />;
    case "includes":
      return <BadgeCheck className={cls} strokeWidth={1.85} />;
    case "excludes":
      return <Ban className={cls} strokeWidth={1.85} />;
    case "cost":
      return <Banknote className={cls} strokeWidth={1.85} />;
    case "map":
      return <MapPinned className={cls} strokeWidth={1.85} />;
    case "know-before-you-go":
      return <ShieldCheck className={cls} strokeWidth={1.85} />;
    case "reviews":
      return <Star className={cls} strokeWidth={1.85} />;
    case "faqs":
      return <HelpCircle className={cls} strokeWidth={1.85} />;
    default:
      return <Info className={cls} strokeWidth={1.85} />;
  }
}

function CompareArrowsIcon({ className = "h-3.5 w-3.5 shrink-0" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 3l4 4-4 4" />
      <path d="M4 7h16" />
      <path d="M8 21l-4-4 4-4" />
      <path d="M20 17H4" />
    </svg>
  );
}

function PdfDocumentIcon({ className = "h-3.5 w-3.5 shrink-0" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M12 18v-6" />
      <path d="M9.5 15.5L12 18l2.5-2.5" />
    </svg>
  );
}

function formatSlugLabel(slug: string, kind: "region" | "category"): string {
  if (kind === "region") {
    const found = REGIONS.find((r) => r.id === slug);
    if (found) return found.label;
  } else {
    const found = CATEGORIES.find((c) => c.id === slug);
    if (found) return found.label;
  }
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatStageLabel(day: string, unit: string): string {
  const trimmed = day.trim();
  if (/^(day|stage)\b/i.test(trimmed)) return trimmed;
  return `${unit} ${trimmed}`;
}

function formatPaddedStageLabel(day: string, unit: string): string {
  const trimmed = day.trim();
  const numMatch = /^(?:(?:day|stage)\s+)?(\d+)$/i.exec(trimmed);
  if (numMatch) {
    return `${unit} ${numMatch[1].padStart(2, "0")}`;
  }
  if (/^(day|stage)\b/i.test(trimmed)) return trimmed;
  return `${unit} ${trimmed}`;
}

function formatShortDate(iso: string): string {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return dt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function departureStatusStyle(status: string): string {
  switch (status) {
    case "GUARANTEED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "LIMITED":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "SOLD_OUT":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "CANCELLED":
      return "bg-slate-100 text-slate-500 border-slate-200";
    default:
      return "bg-sky-50 text-[#3f6e15] border-sky-200";
  }
}

function splitHighlight(text: string): { title: string | null; body: string } {
  const colonIdx = text.indexOf(":");
  if (colonIdx > 0 && colonIdx <= 60) {
    const title = text.slice(0, colonIdx).trim();
    const body = text.slice(colonIdx + 1).trim();
    if (title && body) return { title, body };
  }
  return { title: null, body: text };
}

function renderInlineEmphasis(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-[#1c1917]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

function renderTextBlockLines(lines: string[], key: number | string) {
  const allBullets =
    lines.length > 0 &&
    lines.every((l) => l.startsWith("- ") || l.startsWith("• "));

  if (allBullets) {
    return (
      <ul key={key} className="space-y-2 pl-1">
        {lines.map((line, lIdx) => (
          <li
            key={lIdx}
            className="flex items-start gap-2.5 text-[15px] leading-[1.7] text-[#292524]"
          >
            <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-[#3f6e15] shrink-0" />
            <span>{renderInlineEmphasis(line.replace(/^[-•]\s+/, ""))}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p
      key={key}
      className="text-[15.5px] leading-[1.82] text-[#292524] whitespace-pre-line"
    >
      {renderInlineEmphasis(lines.join("\n"))}
    </p>
  );
}

function renderFormattedRichText(content: string) {
  const blocks = content
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="space-y-3.5">
      {blocks.map((block, bIdx) => {
        const lines = block
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length === 0) return null;

        const first = lines[0];
        if (first.startsWith("## ") || first.startsWith("### ")) {
          const isH5 = first.startsWith("### ");
          const headingText = first.slice(isH5 ? 4 : 3).trim();
          const restLines = lines.slice(1);
          const headingEl = isH5 ? (
            <h5
              key={`${bIdx}-h`}
              className="font-heading text-lg font-semibold text-[#1c1917] pt-2 first:pt-0"
            >
              {renderInlineEmphasis(headingText)}
            </h5>
          ) : (
            <h4
              key={`${bIdx}-h`}
              className="font-heading text-xl sm:text-[22px] font-bold text-[#3f6e15] pt-3 first:pt-0 tracking-tight"
            >
              {renderInlineEmphasis(headingText)}
            </h4>
          );

          if (restLines.length === 0) return headingEl;
          return (
            <div key={bIdx} className="space-y-2.5">
              {headingEl}
              {renderTextBlockLines(restLines, `${bIdx}-body`)}
            </div>
          );
        }

        return renderTextBlockLines(lines, bIdx);
      })}
    </div>
  );
}

function renderCustomSection(sec: TripCustomSectionDTO) {
  if (sec.style === "callout") {
    return (
      <div
        key={sec.id}
        className="rounded-[14px] border border-[#3f6e15]/15 bg-[#3f6e15]/[0.05] p-6 sm:p-7 space-y-3"
      >
        <div className="flex items-center gap-2.5">
          <Info className="h-5 w-5 text-[#3f6e15] shrink-0" />
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#1c1917]">
            {sec.title}
          </h3>
        </div>
        {renderFormattedRichText(sec.content)}
      </div>
    );
  }

  if (sec.style === "note") {
    return (
      <div
        key={sec.id}
        className="rounded-[14px] border border-[#f05e25]/25 border-l-4 border-l-[#f05e25] bg-[#f05e25]/[0.05] p-6 sm:p-7 space-y-2.5"
      >
        <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#1c1917]">
          {sec.title}
        </h3>
        {renderFormattedRichText(sec.content)}
      </div>
    );
  }

  if (sec.style === "warning") {
    return (
      <div
        key={sec.id}
        className="rounded-[14px] border border-amber-200 bg-amber-50/75 p-6 sm:p-7 space-y-3"
      >
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0" />
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#1c1917]">
            {sec.title}
          </h3>
        </div>
        {renderFormattedRichText(sec.content)}
      </div>
    );
  }

  return (
    <div
      key={sec.id}
      className="rounded-[16px] border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4"
    >
      <h3 className="font-heading text-2xl sm:text-[28px] font-bold text-[#1c1917] tracking-tight">
        {sec.title}
      </h3>
      {renderFormattedRichText(sec.content)}
    </div>
  );
}

export function TripDetailView({
  trip,
  related,
  comparableTrips = [],
  whatsappNumber,
  travelGuides = [],
}: {
  trip: TripDTO;
  related: TripDTO[];
  comparableTrips?: ComparableTripDTO[];
  whatsappNumber?: string;
  travelGuides?: TravelGuideSummaryDTO[];
}) {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mapLightboxOpen, setMapLightboxOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [activeDayImage, setActiveDayImage] = useState<{
    src: string;
    caption: string;
  } | null>(null);
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [openDays, setOpenDays] = useState<Set<number>>(
    () => new Set(trip.itinerary.map((_, i) => i))
  );
  const [openGuideIds, setOpenGuideIds] = useState<Set<string>>(() => {
    const first = (trip.customSections ?? []).find(
      (s) => s.placement === "know_before_you_go"
    );
    return first ? new Set([first.id]) : new Set();
  });

  const savedSlugs = useSavedTripSlugs();
  const compareSlugs = useCompareTripSlugs();
  const isSaved = savedSlugs.includes(trip.slug);
  const isInCompare = compareSlugs.includes(trip.slug);

  const handleOpenCompare = () => {
    addCompareTripSlug(trip.slug);
    setCompareModalOpen(true);
  };

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      await downloadTripPdf(trip);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  useEffect(() => {
    trackViewTrip({
      slug: trip.slug,
      name: trip.name,
      price: trip.price,
      country: trip.country,
      region: trip.region,
    });
  }, [trip.slug, trip.name, trip.price, trip.country, trip.region]);

  const unit = trip.days === 1 ? "Stage" : "Day";

  const allPhotos = useMemo(
    () =>
      Array.from(
        new Set([trip.image, ...(trip.gallery ?? [])].filter(Boolean))
      ),
    [trip.image, trip.gallery]
  );

  const profile = useMemo(
    () =>
      trip.itinerary.map((d) => ({
        label: d.title,
        sub: formatStageLabel(d.day, unit),
        altitude: d.altitude,
      })),
    [trip.itinerary, unit]
  );

  const resolvedDayGuides = useMemo(() => {
    const map = new Map<number, { label: string; href: string }>();
    const autoAttachedSlugs = new Set<string>();

    trip.itinerary.forEach((d, idx) => {
      const explicitLabel = d.guideLabel?.trim();
      const explicitHref = d.guideUrl?.trim() || "";
      if (explicitLabel) {
        map.set(idx, { label: explicitLabel, href: explicitHref });
        return;
      }

      if (travelGuides.length > 0) {
        const matched = matchTravelGuideForDayTitle(d.title, travelGuides);
        if (matched && !autoAttachedSlugs.has(matched.slug)) {
          autoAttachedSlugs.add(matched.slug);
          map.set(idx, {
            label: matched.title,
            href: `/guides/${matched.slug}`,
          });
        }
      }
    });

    return map;
  }, [trip.itinerary, travelGuides]);

  const avgRating = useMemo(() => {
    if (trip.reviews.length === 0) return null;
    const sum = trip.reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / trip.reviews.length;
  }, [trip.reviews]);

  const overviewCustomSections = useMemo(
    () =>
      (trip.customSections ?? []).filter((s) => s.placement === "overview"),
    [trip.customSections]
  );

  const itineraryCustomSections = useMemo(
    () =>
      (trip.customSections ?? []).filter((s) => s.placement === "itinerary"),
    [trip.customSections]
  );

  const bottomCustomSections = useMemo(
    () => (trip.customSections ?? []).filter((s) => s.placement === "bottom"),
    [trip.customSections]
  );

  const knowBeforeYouGoSections = useMemo(
    () =>
      (trip.customSections ?? []).filter(
        (s) => s.placement === "know_before_you_go"
      ),
    [trip.customSections]
  );

  const allGuidesOpen =
    knowBeforeYouGoSections.length > 0 &&
    knowBeforeYouGoSections.every((s) => openGuideIds.has(s.id));

  const toggleGuide = (id: string) => {
    setOpenGuideIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllGuides = () => {
    if (allGuidesOpen) {
      setOpenGuideIds(new Set());
    } else {
      setOpenGuideIds(new Set(knowBeforeYouGoSections.map((s) => s.id)));
    }
  };

  const sections = useMemo(() => {
    const list: { id: string; label: string }[] = [
      { id: "overview", label: "Overview" },
    ];
    if (trip.highlights.length > 0) {
      list.push({ id: "highlights", label: "Highlights" });
    }
    if (trip.itinerary.length > 0) {
      list.push({ id: "itinerary", label: "Itinerary" });
    }
    if (trip.includeGroups.length > 0 || trip.includes.length > 0) {
      list.push({ id: "includes", label: "Includes" });
    }
    if (trip.excludeGroups.length > 0 || trip.excludes.length > 0) {
      list.push({ id: "excludes", label: "Excludes" });
    }
    list.push({ id: "cost", label: "Cost" });
    if (Boolean(trip.mapImage) || profile.length > 1) {
      list.push({ id: "map", label: "Map" });
    }
    if (
      knowBeforeYouGoSections.length > 0 ||
      trip.gearList.length > 0 ||
      bottomCustomSections.length > 0
    ) {
      list.push({ id: "know-before-you-go", label: "Know Before You Go" });
    }
    if (trip.reviews.length > 0) {
      list.push({ id: "reviews", label: "Reviews" });
    }
    if (trip.faqs.length > 0) {
      list.push({ id: "faqs", label: "FAQs" });
    }
    return list;
  }, [
    trip.highlights.length,
    trip.itinerary.length,
    trip.includeGroups.length,
    trip.includes.length,
    trip.excludeGroups.length,
    trip.excludes.length,
    trip.mapImage,
    profile.length,
    knowBeforeYouGoSections.length,
    trip.gearList.length,
    bottomCustomSections.length,
    trip.reviews.length,
    trip.faqs.length,
  ]);

  useEffect(() => {
    if (typeof window === "undefined" || sections.length === 0) return;

    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      {
        rootMargin: "-84px 0px -60% 0px",
        threshold: 0.05,
      }
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    if (lightboxIndex === null && !mapLightboxOpen && !activeDayImage) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
        setMapLightboxOpen(false);
        setActiveDayImage(null);
        return;
      }
      if (lightboxIndex !== null && allPhotos.length > 1) {
        if (e.key === "ArrowLeft") {
          setLightboxIndex(
            (lightboxIndex - 1 + allPhotos.length) % allPhotos.length
          );
        } else if (e.key === "ArrowRight") {
          setLightboxIndex((lightboxIndex + 1) % allPhotos.length);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, mapLightboxOpen, activeDayImage, allPhotos.length]);

  const primaryCategorySlug = trip.categories[0] ?? "trekking";
  const safeActivePhotoIndex =
    allPhotos.length > 0 ? Math.min(activePhotoIndex, allPhotos.length - 1) : 0;
  const activePhoto = allPhotos[safeActivePhotoIndex] || trip.image;

  const countryLabel =
    trip.country.charAt(0).toUpperCase() + trip.country.slice(1);
  const activityLabel = formatSlugLabel(primaryCategorySlug, "category");
  const accommodationSummary =
    trip.accommodationSummary?.trim() ||
    trip.itinerary.find((d) => d.accommodation?.trim())?.accommodation?.trim() ||
    "Hotel & Mountain Lodges";
  const mealsSummary =
    trip.mealsSummary?.trim() ||
    (trip.days > 1 ? "Breakfast, Lunch & Dinner" : "Meals as per itinerary");
  const transportSummary =
    trip.transportSummary?.trim() || "Private Vehicle & Transfers";
  const startEndSummary =
    trip.start.trim().toLowerCase() === trip.end.trim().toLowerCase()
      ? trip.start
      : `${trip.start} – ${trip.end}`;
  const seasonsSummary = formatSeasonRange(trip.seasonMonths);

  const tripFacts = [
    { icon: Globe, label: "Destination", value: countryLabel },
    {
      icon: Clock,
      label: "Duration",
      value: `${trip.days} ${trip.days === 1 ? "day" : "days"}`,
    },
    { icon: Gauge, label: "Difficulty", value: trip.difficulty },
    { icon: Footprints, label: "Activity", value: activityLabel },
    {
      icon: Mountain,
      label: "Max Altitude",
      value: `${trip.maxAltitude.toLocaleString("en-US")} m`,
    },
    { icon: Users, label: "Group Size", value: `Up to ${trip.groupMax}` },
    { icon: BedDouble, label: "Accommodation", value: accommodationSummary },
    { icon: Utensils, label: "Meals", value: mealsSummary },
    { icon: Bus, label: "Transport", value: transportSummary },
    { icon: MapPin, label: "Start & End Point", value: startEndSummary },
    { icon: Sun, label: "Best Seasons", value: seasonsSummary },
  ];

  const weatherLoc = useMemo(() => resolveTripWeatherLocation(trip), [trip]);

  const allDaysExpanded =
    trip.itinerary.length > 0 && openDays.size >= trip.itinerary.length;

  const toggleDayOpen = (idx: number) => {
    setOpenDays((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const toggleAllDays = () => {
    if (allDaysExpanded) {
      setOpenDays(new Set());
    } else {
      setOpenDays(new Set(trip.itinerary.map((_, i) => i)));
    }
  };

  const jumpToDetailedDay = (idx: number) => {
    setOpenDays((prev) => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
    const target = document.getElementById(`detailed-day-${idx}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#1c1917] font-sans">
      {/* 1. CLEAN HEADER + BENTO PHOTO MOSAIC GALLERY */}
      <section id="gallery-top" className="bg-white pt-20 sm:pt-28 pb-6 sm:pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8 space-y-6">
          {/* Breadcrumbs + Top Meta */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav
              aria-label="Breadcrumb"
              className="text-xs sm:text-[13px] font-medium flex flex-wrap items-center gap-2 text-[#64748b]"
            >
              <Link
                href="/"
                className="hover:text-[#3f6e15] transition-colors"
              >
                Home
              </Link>
              <span className="text-slate-300">/</span>
              <Link
                href="/destinations"
                className="hover:text-[#3f6e15] transition-colors"
              >
                Destinations
              </Link>
              <span className="text-slate-300">/</span>
              <Link
                href={`/destinations/country/${encodeURIComponent(
                  trip.country
                )}`}
                className="hover:text-[#3f6e15] transition-colors"
              >
                {countryLabel}
              </Link>
              <span className="text-slate-300">/</span>
              {trip.region ? (
                <Link
                  href={`/destinations/region/${encodeURIComponent(
                    trip.region
                  )}`}
                  className="text-[#3f6e15] font-semibold hover:underline"
                >
                  {formatSlugLabel(trip.region, "region")}
                </Link>
              ) : (
                <Link
                  href={`/destinations/category/${encodeURIComponent(
                    primaryCategorySlug
                  )}`}
                  className="text-[#3f6e15] font-semibold hover:underline"
                >
                  {activityLabel}
                </Link>
              )}
            </nav>

            <div className="flex flex-wrap items-center gap-2.5">
              {avgRating !== null && (
                <a
                  href="#reviews"
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors"
                >
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  <span className="tabular-nums">{avgRating.toFixed(1)}</span>
                  <span className="text-amber-700/80 font-normal">
                    ({trip.reviews.length}{" "}
                    {trip.reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setLightboxIndex(0)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1c1917] shadow-xs hover:border-[#3f6e15] hover:text-[#3f6e15] transition-colors cursor-pointer"
              >
                <Camera className="h-3.5 w-3.5 text-[#3f6e15]" />
                <span>All Photos ({allPhotos.length})</span>
              </button>
            </div>
          </div>

          {/* Title & Tagline Row */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3f6e15]/[0.08] border border-[#3f6e15]/15 px-3 py-1 text-xs font-semibold text-[#3f6e15]">
                <MapPin className="h-3.5 w-3.5 text-[#f05e25]" />
                {trip.area}
              </span>
              {trip.badge && (
                <span className="inline-flex items-center rounded-full bg-[#f05e25] px-3 py-1 text-xs font-semibold text-white">
                  {trip.badge}
                </span>
              )}
            </div>

            <h1 className="font-heading text-3xl sm:text-5xl lg:text-[54px] font-bold text-[#1c1917] tracking-tight leading-[1.08]">
              {trip.name}
            </h1>

            <p className="max-w-3xl text-sm sm:text-base lg:text-lg text-[#57534d] leading-relaxed">
              {trip.tagline}
            </p>
          </div>

          {/* INTERACTIVE MAIN PHOTO STAGE + THUMBNAIL STRIP */}
          <div className="space-y-2.5">
            <div className="relative h-[240px] sm:h-[320px] lg:h-[390px] w-full overflow-hidden rounded-[22px] bg-stone-900 shadow-lg border border-stone-200/80 group">
              <button
                type="button"
                onClick={() => setLightboxIndex(safeActivePhotoIndex)}
                className="relative block h-full w-full cursor-pointer focus:outline-none"
                aria-label="Open full photo gallery"
              >
                <Image
                  key={activePhoto}
                  src={activePhoto}
                  alt={`${trip.name} photo ${safeActivePhotoIndex + 1}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 1280px"
                  className="animate-rise object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
              </button>

              {allPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActivePhotoIndex(
                        (safeActivePhotoIndex - 1 + allPhotos.length) %
                          allPhotos.length
                      )
                    }
                    aria-label="Previous photo"
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-white/60 text-[#1c1917] shadow-lg hover:bg-[#f05e25] hover:text-white hover:border-[#f05e25] active:scale-95 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActivePhotoIndex(
                        (safeActivePhotoIndex + 1) % allPhotos.length
                      )
                    }
                    aria-label="Next photo"
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-white/60 text-[#1c1917] shadow-lg hover:bg-[#f05e25] hover:text-white hover:border-[#f05e25] active:scale-95 transition-all cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Bottom Controls Row inside Main Photo */}
              <div className="pointer-events-none absolute inset-x-3.5 sm:inset-x-5 bottom-3.5 sm:bottom-5 z-10 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/20 px-3 py-1.5 text-xs font-semibold text-white tabular-nums">
                  <Camera className="h-3.5 w-3.5 text-[#ff8a50]" />
                  <span>
                    {safeActivePhotoIndex + 1} / {Math.max(1, allPhotos.length)}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => setLightboxIndex(safeActivePhotoIndex)}
                  className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-black/70 hover:bg-[#f05e25] backdrop-blur-md border border-white/25 hover:border-[#f05e25] px-3.5 py-1.5 text-xs font-semibold text-white shadow-md transition-colors cursor-pointer"
                >
                  <Images className="h-3.5 w-3.5" />
                  <span>Full Gallery</span>
                </button>
              </div>
            </div>

            {/* Thumbnail Selector Strip Below Main Image */}
            {allPhotos.length > 1 && (
              <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar py-1.5 px-1">
                {allPhotos.map((src, idx) => {
                  const isActive = idx === safeActivePhotoIndex;
                  return (
                    <button
                      key={`${src}-${idx}`}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      aria-label={`View ${trip.name} photo ${idx + 1}`}
                      aria-pressed={isActive}
                      className={`relative shrink-0 w-20 sm:w-28 md:w-32 aspect-[16/10] rounded-[12px] overflow-hidden transition-all duration-300 cursor-pointer focus:outline-none ${
                        isActive
                          ? "ring-2 ring-[#f05e25] ring-offset-2 opacity-100 scale-[1.02] shadow-md"
                          : "opacity-70 hover:opacity-100 border border-stone-200 hover:border-[#f05e25]/60"
                      }`}
                    >
                      <Image
                        src={src}
                        alt={`${trip.name} thumbnail ${idx + 1}`}
                        fill
                        sizes="(max-width: 640px) 96px, 144px"
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* GALLERY LIGHTBOX MODAL */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-xl"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            aria-label="Close gallery"
            onClick={() => setLightboxIndex(null)}
            className="absolute right-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-[#f05e25] hover:border-[#f05e25] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {allPhotos.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    (lightboxIndex - 1 + allPhotos.length) % allPhotos.length
                  );
                }}
                className="absolute left-4 sm:left-8 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-[#3f6e15] hover:border-[#3f6e15] transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((lightboxIndex + 1) % allPhotos.length);
                }}
                className="absolute right-4 sm:right-8 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-[#3f6e15] hover:border-[#3f6e15] transition-colors cursor-pointer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div
            className="max-w-5xl w-full flex flex-col items-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={allPhotos[lightboxIndex]}
              alt={`${trip.name} — photo ${lightboxIndex + 1}`}
              className="max-h-[72vh] w-auto max-w-full rounded-[16px] border border-white/15 object-contain shadow-2xl"
            />

            <div className="flex items-center justify-between w-full max-w-lg px-2 text-xs text-white/80">
              <span className="truncate font-medium">{trip.name}</span>
              <span className="text-[#ff8a50] font-semibold shrink-0 tabular-nums">
                Photo {lightboxIndex + 1} of {allPhotos.length}
              </span>
            </div>

            {allPhotos.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 px-2">
                {allPhotos.map((src, idx) => (
                  <button
                    key={`${src}-${idx}`}
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-[8px] border-2 transition-all cursor-pointer ${
                      idx === lightboxIndex
                        ? "border-[#f05e25] scale-105"
                        : "border-white/15 opacity-55 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Thumbnail ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ROUTE MAP LIGHTBOX MODAL */}
      {mapLightboxOpen && trip.mapImage && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-xl"
          onClick={() => setMapLightboxOpen(false)}
        >
          <button
            type="button"
            aria-label="Close map"
            onClick={() => setMapLightboxOpen(false)}
            className="absolute right-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-[#f05e25] hover:border-[#f05e25] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="max-w-6xl w-full flex flex-col items-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={trip.mapImage}
              alt={`${trip.name} route map`}
              className="max-h-[82vh] w-auto max-w-full rounded-[16px] border border-white/15 bg-white object-contain shadow-2xl"
            />
            <p className="text-xs font-medium text-white/80">
              {trip.name} — Trail &amp; Altitude Map
            </p>
          </div>
        </div>
      )}

      {/* DAY PHOTO LIGHTBOX MODAL */}
      {activeDayImage && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-xl"
          onClick={() => setActiveDayImage(null)}
        >
          <button
            type="button"
            aria-label="Close day photo"
            onClick={() => setActiveDayImage(null)}
            className="absolute right-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-[#f05e25] hover:border-[#f05e25] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="max-w-5xl w-full flex flex-col items-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeDayImage.src}
              alt={activeDayImage.caption}
              className="max-h-[82vh] w-auto max-w-full rounded-[16px] border border-white/15 bg-white object-contain shadow-2xl"
            />
            <p className="text-xs sm:text-sm font-medium text-white/85 text-center">
              {activeDayImage.caption}
            </p>
          </div>
        </div>
      )}

      {/* 2. STICKY SECTION SUB-NAVIGATION */}
      <div id="trip-subnav-sentinel" aria-hidden="true" className="h-0 w-full" />
      <div className="sticky top-0 z-40 border-y border-stone-200/80 bg-white/95 backdrop-blur-xl shadow-[0_6px_24px_-8px_rgba(28,25,23,0.1)]">
        <div className="mx-auto flex max-w-7xl flex-col lg:flex-row lg:items-center lg:justify-between gap-2 lg:gap-3 px-4 sm:px-5 lg:px-8 py-2.5">
          <div className="flex w-full lg:w-auto min-w-0 lg:flex-1 items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            {sections.map((s) => {
              const isActive = activeSection === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setActiveSection(s.id)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs sm:text-[13px] font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#3f6e15] text-white shadow-sm shadow-[#3f6e15]/25"
                      : "text-[#57534d] hover:bg-stone-100 hover:text-[#1c1917]"
                  }`}
                >
                  <SectionNavIcon id={s.id} />
                  <span>{s.label}</span>
                </a>
              );
            })}
          </div>

          <div className="flex w-full lg:w-auto shrink-0 items-center justify-between lg:justify-end gap-1.5 sm:gap-2 border-t border-stone-100 pt-2 lg:border-t-0 lg:pt-0 lg:border-l lg:border-stone-200/80 lg:pl-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleOpenCompare}
                title="Compare expeditions"
                aria-label="Compare this expedition with other trips"
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                  isInCompare
                    ? "border-[#3f6e15]/40 bg-[#3f6e15]/10 text-[#3f6e15] hover:bg-[#3f6e15]/15"
                    : "border-stone-200 bg-white text-[#1c1917] hover:border-[#3f6e15]/40 hover:text-[#3f6e15]"
                }`}
              >
                <CompareArrowsIcon className="h-3.5 w-3.5 shrink-0" />
                <span>Compare</span>
                {compareSlugs.length > 0 && (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#3f6e15] px-1 text-[10px] font-bold text-white tabular-nums">
                    {compareSlugs.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                title="Download itinerary PDF"
                aria-label="Download itinerary PDF"
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#1c1917] hover:border-[#f05e25]/50 hover:text-[#f05e25] disabled:opacity-60 transition-all cursor-pointer active:scale-95"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#f05e25] shrink-0" />
                ) : (
                  <PdfDocumentIcon className="h-3.5 w-3.5 text-[#f05e25] shrink-0" />
                )}
                <span>{isGeneratingPdf ? "PDF..." : "PDF"}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleSavedTripSlug(trip.slug)}
                title={isSaved ? "Remove from saved" : "Save expedition"}
                aria-label={
                  isSaved
                    ? "Remove trip from saved wishlist"
                    : "Save trip to wishlist"
                }
                aria-pressed={isSaved}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                  isSaved
                    ? "border-[#f05e25]/40 bg-[#f05e25]/10 text-[#f05e25]"
                    : "border-stone-200 bg-white text-[#1c1917] hover:border-[#f05e25]/50 hover:text-[#f05e25]"
                }`}
              >
                <Heart
                  className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                    isSaved
                      ? "fill-[#f05e25] text-[#f05e25]"
                      : "text-[#57534d]"
                  }`}
                />
                <span>{isSaved ? "Saved" : "Save"}</span>
              </button>
            </div>

            <a
              href="#booking"
              className="shrink-0 whitespace-nowrap rounded-full bg-[#f05e25] hover:bg-[#d94e18] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm lg:hidden transition-colors"
            >
              Book Now
            </a>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT GRID ON TEXTURED ALPINE CANVAS */}
      <div className="relative overflow-hidden bg-[#f5f3ee]">
        {/* Subtle Topographic Contour Pattern Backdrop */}
        <svg
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 h-full w-full opacity-[0.045] text-[#1c1917]"
        >
          <defs>
            <pattern
              id="alpine-topo-grid"
              width="120"
              height="120"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.7"
              />
              <circle
                cx="60"
                cy="60"
                r="34"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.7"
              />
              <circle
                cx="60"
                cy="60"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.7"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#alpine-topo-grid)" />
        </svg>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-white/75 to-transparent"
        />

        <div className="relative z-10 mx-auto grid grid-cols-1 max-w-7xl gap-8 lg:gap-10 px-4 sm:px-5 py-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
        <div className="min-w-0 space-y-7 sm:space-y-8">
          {/* SECTION 1: CLEAN OVERVIEW PROSE */}
          <section id="overview" className="scroll-mt-28 lg:scroll-mt-20">
            <div className="relative overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_8px_30px_-12px_rgba(28,25,23,0.09)]">
              <div
                aria-hidden="true"
                className="h-[3px] w-full bg-gradient-to-r from-[#3f6e15] via-[#f05e25] to-[#ff8a50]"
              />
              <div className="relative overflow-hidden bg-gradient-to-r from-[#faf8f4] via-white to-[#fff7f3] px-5 sm:px-8 py-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 320 90"
                  className="pointer-events-none absolute right-0 bottom-0 h-16 w-auto text-[#1c1917]/[0.035]"
                  fill="currentColor"
                >
                  <path d="M0 90 L75 35 L135 65 L215 10 L275 55 L320 30 L320 90 Z" />
                </svg>
                <div className="relative">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f05e25]">
                    Expedition Overview
                  </p>
                  <h2 className="mt-0.5 font-heading text-2xl sm:text-[30px] text-[#1c1917] font-bold tracking-tight">
                    Overview
                  </h2>
                </div>
                <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white border border-stone-200 px-3.5 py-1.5 text-xs font-semibold text-[#3f6e15] shadow-2xs">
                  <MapPin className="h-3.5 w-3.5 text-[#f05e25]" />
                  <span>{trip.area}</span>
                </span>
              </div>

              <div className="p-5 sm:p-8 space-y-6">
                <TripVoiceoverPlayer
                  tripSlug={trip.slug}
                  overview={trip.overview}
                  overviewCustomSections={overviewCustomSections}
                  highlights={trip.highlights}
                  itineraryIntro={trip.itineraryIntro}
                  itinerary={trip.itinerary}
                  includes={trip.includes}
                  includeGroups={trip.includeGroups}
                  excludes={trip.excludes}
                  excludeGroups={trip.excludeGroups}
                  knowBeforeYouGoSections={knowBeforeYouGoSections}
                  gearList={trip.gearList}
                  bottomCustomSections={bottomCustomSections}
                  faqs={trip.faqs}
                />

                <div className="rounded-[12px] border border-stone-200/70 border-l-4 border-l-[#f05e25] bg-[#faf9f6] p-5 sm:p-6">
                  {renderFormattedRichText(trip.overview)}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: TRIP FACTS GRID + LIVE MOUNTAIN WEATHER */}
          <section aria-label="Trip facts and mountain weather">
            <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_8px_30px_-12px_rgba(28,25,23,0.09)]">
              <div className="bg-gradient-to-r from-[#faf8f4] to-white px-5 sm:px-8 py-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f05e25]">
                    At a Glance
                  </p>
                  <h2 className="mt-0.5 font-heading text-2xl sm:text-[26px] text-[#1c1917] font-bold tracking-tight">
                    Trip Facts
                  </h2>
                </div>
                <span className="rounded-full border border-stone-200 bg-white px-3.5 py-1 text-xs font-semibold text-[#57534d] tabular-nums shadow-2xs">
                  {trip.days} Days · {trip.maxAltitude.toLocaleString("en-US")} m
                </span>
              </div>

              <div className="p-5 sm:p-8 space-y-6">
                <dl className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5">
                  {tripFacts.map((fact, idx) => (
                    <div
                      key={fact.label}
                      className="group flex items-start gap-3 rounded-[12px] border border-stone-200/80 bg-gradient-to-br from-white to-[#faf8f4] p-3.5 sm:p-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#f05e25]/40 transition-all duration-200 min-w-0"
                    >
                      <div
                        className={`grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-[12px] bg-white shadow-2xs ring-1 ring-stone-200/80 transition-transform duration-200 group-hover:scale-105 ${
                          idx % 2 === 0 ? "text-[#3f6e15]" : "text-[#f05e25]"
                        }`}
                      >
                        <fact.icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-[#64748b] leading-snug">
                          {fact.label}
                        </dt>
                        <dd className="mt-0.5 text-[13.5px] sm:text-[15px] font-bold text-[#1c1917] leading-snug break-words">
                          {fact.value}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>

                <div className="pt-4 border-t border-stone-100">
                  <TripWeatherWidget
                    locationLabel={weatherLoc.label}
                    maxAltitude={trip.maxAltitude}
                    lat={weatherLoc.lat}
                    lon={weatherLoc.lon}
                    query={weatherLoc.query}
                    country={weatherLoc.country}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: CLEAN EDITORIAL TRIP HIGHLIGHTS */}
          {trip.highlights.length > 0 && (
            <section id="highlights" className="scroll-mt-28 lg:scroll-mt-20">
              <div className="overflow-hidden rounded-[16px] border border-stone-200/90 bg-white shadow-[0_8px_30px_-12px_rgba(28,25,23,0.09)]">
                <div className="bg-gradient-to-r from-[#faf8f4] to-white px-5 sm:px-8 py-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f05e25]">
                      Key Experiences
                    </p>
                    <h2 className="mt-0.5 font-heading text-2xl sm:text-[30px] text-[#1c1917] font-bold tracking-tight">
                      Trip Highlights
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#3f6e15]/[0.08] border border-[#3f6e15]/15 px-3.5 py-1 text-xs font-semibold text-[#3f6e15] tabular-nums">
                    {trip.highlights.length}{" "}
                    {trip.highlights.length === 1 ? "Highlight" : "Highlights"}
                  </span>
                </div>

                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-5 sm:p-8">
                  {trip.highlights.map((h, i) => {
                    const parts = splitHighlight(h);
                    return (
                      <li
                        key={`${h}-${i}`}
                        className="flex items-start gap-3.5 pb-4 border-b border-stone-100 last:border-b-0"
                      >
                        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-[8px] bg-[#3f6e15]/10 text-[#3f6e15] font-bold text-xs tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          {parts.title ? (
                            <>
                              <strong className="block font-semibold text-[15px] text-[#1c1917] mb-0.5 leading-snug">
                                {parts.title}
                              </strong>
                              <span className="text-[14px] leading-relaxed text-[#44403c]">
                                {parts.body}
                              </span>
                            </>
                          ) : (
                            <span className="text-[14.5px] leading-relaxed text-[#292524]">
                              {parts.body}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          )}

          {/* ADMIN CUSTOM SECTIONS: OVERVIEW PLACEMENT */}
          {overviewCustomSections.map(renderCustomSection)}

          {/* SECTION 4: SHORT ITINERARY + ADMIN NOTES + DETAILED ACCORDION */}
          {trip.itinerary.length > 0 && (
            <section id="itinerary" className="scroll-mt-28 lg:scroll-mt-20 space-y-6">
              {/* Day-to-Day Short Itinerary */}
              <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_8px_30px_-12px_rgba(28,25,23,0.09)]">
                <div className="bg-gradient-to-r from-[#faf8f4] to-white px-5 sm:px-8 py-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f05e25]">
                      Route Summary
                    </p>
                    <h2 className="mt-0.5 font-heading text-2xl sm:text-[30px] text-[#1c1917] font-bold tracking-tight">
                      Day-to-Day Short Itinerary
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#3f6e15]/[0.08] border border-[#3f6e15]/15 px-3.5 py-1 text-xs font-semibold text-[#3f6e15] tabular-nums">
                    {trip.itinerary.length}{" "}
                    {trip.itinerary.length === 1 ? "Stage" : "Days"}
                  </span>
                </div>

                <div className="p-5 sm:p-8">
                  <div className="hidden sm:grid sm:grid-cols-[96px_minmax(0,1fr)_104px_92px_28px] px-4 pb-2.5 text-[11px] font-bold uppercase tracking-wider text-[#64748b] border-b border-stone-100">
                    <span>Stage</span>
                    <span>Route Overview</span>
                    <span>Altitude</span>
                    <span>Duration</span>
                    <span className="sr-only">Jump</span>
                  </div>

                  <div className="mt-2.5 space-y-2">
                    {trip.itinerary.map((d, idx) => {
                      const isPeak =
                        d.altitude === trip.maxAltitude && d.altitude > 0;
                      return (
                        <button
                          key={`short-${d.day}-${idx}`}
                          type="button"
                          onClick={() => jumpToDetailedDay(idx)}
                          className="group w-full text-left rounded-[12px] border border-stone-200/80 bg-[#faf9f7]/80 hover:border-[#3f6e15]/40 hover:bg-white hover:shadow-xs hover:-translate-y-0.5 transition-all px-3.5 sm:px-4 py-3 flex flex-col sm:grid sm:grid-cols-[96px_minmax(0,1fr)_104px_92px_28px] sm:items-center gap-2 sm:gap-0 cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2 sm:block sm:pr-3">
                            <span
                              className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums ${
                                isPeak
                                  ? "bg-[#f05e25] text-white"
                                  : "bg-[#3f6e15]/10 text-[#3f6e15]"
                              }`}
                            >
                              {formatPaddedStageLabel(d.day, unit)}
                            </span>

                            <div className="flex items-center gap-2 sm:hidden text-xs font-medium text-[#57534d] tabular-nums">
                              {d.altitude > 0 && (
                                <span className="rounded-md bg-white border border-stone-200 px-2 py-0.5">
                                  {d.altitude.toLocaleString("en-US")}m
                                </span>
                              )}
                              {d.durationHrs?.trim() && (
                                <span className="rounded-md bg-white border border-stone-200 px-2 py-0.5">
                                  {d.durationHrs.trim()}
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="text-[14.5px] font-semibold text-[#1c1917] sm:pr-4 leading-snug group-hover:text-[#3f6e15] transition-colors">
                            {d.title}
                          </span>

                          <span className="hidden sm:inline-block text-sm font-medium text-[#44403c] tabular-nums">
                            {d.altitude > 0
                              ? `${d.altitude.toLocaleString("en-US")} m`
                              : "—"}
                          </span>

                          <span className="hidden sm:inline-block text-sm text-[#57534d] tabular-nums">
                            {d.durationHrs?.trim() || "—"}
                          </span>

                          <ChevronRight className="hidden sm:block h-4 w-4 text-stone-400 group-hover:text-[#3f6e15] group-hover:translate-x-0.5 transition-all justify-self-end" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Admin Custom Sections between Short & Detailed Itinerary */}
              {itineraryCustomSections.map(renderCustomSection)}

              {/* Detailed Itinerary Accordions */}
              <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_8px_30px_-12px_rgba(28,25,23,0.09)]">
                <div className="bg-gradient-to-r from-[#faf8f4] to-white px-5 sm:px-8 py-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f05e25]">
                      Stage-by-Stage Breakdown
                    </p>
                    <h2 className="mt-0.5 font-heading text-2xl sm:text-[30px] text-[#1c1917] font-bold tracking-tight">
                      Detailed Itinerary
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={toggleAllDays}
                    className="rounded-full border border-stone-200 bg-white hover:border-[#3f6e15] hover:bg-[#3f6e15] hover:text-white px-4 py-2 text-xs font-semibold text-[#1c1917] transition-all cursor-pointer shadow-2xs"
                  >
                    {allDaysExpanded ? "Collapse All" : "Expand All"}
                  </button>
                </div>

                <div className="p-5 sm:p-8 space-y-5">
                  {trip.itineraryIntro && (
                    <div className="rounded-[12px] border border-stone-200/80 bg-[#faf9f7] p-4 sm:p-6">
                      {renderFormattedRichText(trip.itineraryIntro)}
                    </div>
                  )}

                <div className="relative space-y-3.5 sm:pl-6">
                  <div
                    aria-hidden="true"
                    className="hidden sm:block absolute left-2 top-5 bottom-5 w-px bg-stone-200"
                  />

                  {trip.itinerary.map((d, idx) => {
                    const isOpen = openDays.has(idx);
                    const isPeak =
                      d.altitude === trip.maxAltitude && d.altitude > 0;
                    const prevAlt =
                      idx > 0 ? trip.itinerary[idx - 1]!.altitude : d.altitude;
                    const delta = d.altitude - prevAlt;

                    const daySpecs: Array<{
                      icon: typeof Mountain;
                      label: string;
                      value: string;
                    }> = [];
                    if (d.altitude > 0) {
                      const deltaLabel =
                        idx > 0 && delta !== 0
                          ? ` (${delta > 0 ? `+${delta}` : delta}m)`
                          : "";
                      daySpecs.push({
                        icon: Mountain,
                        label: "Max Altitude",
                        value: `${d.altitude.toLocaleString("en-US")} m${deltaLabel}`,
                      });
                    }
                    if (d.durationHrs?.trim()) {
                      daySpecs.push({
                        icon: Clock,
                        label: "Duration",
                        value: d.durationHrs.trim(),
                      });
                    }
                    if (d.transport?.trim()) {
                      daySpecs.push({
                        icon: Bus,
                        label: "Transport",
                        value: d.transport.trim(),
                      });
                    }
                    if (d.meals?.trim()) {
                      daySpecs.push({
                        icon: Utensils,
                        label: "Meals",
                        value: d.meals.trim(),
                      });
                    }
                    if (d.accommodation?.trim()) {
                      daySpecs.push({
                        icon: BedDouble,
                        label: "Accommodation",
                        value: d.accommodation.trim(),
                      });
                    }
                    if (d.distanceKm !== null && d.distanceKm !== undefined) {
                      daySpecs.push({
                        icon: Footprints,
                        label: "Distance",
                        value: `${d.distanceKm} km`,
                      });
                    }

                    const resolvedGuide = resolvedDayGuides.get(idx);
                    const guideLabelText = resolvedGuide?.label;
                    const guideHref = resolvedGuide?.href || "";
                    const isExternalGuide = Boolean(
                      guideHref && /^https?:\/\//i.test(guideHref)
                    );

                    return (
                      <div
                        key={`detail-${d.day}-${idx}`}
                        id={`detailed-day-${idx}`}
                        className={`relative scroll-mt-28 lg:scroll-mt-20 rounded-[12px] border transition-all ${
                          isOpen
                            ? "border-[#3f6e15]/30 bg-white shadow-md shadow-stone-900/[0.04]"
                            : "border-stone-200/85 bg-[#faf9f7]/65 hover:bg-white hover:border-stone-300"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`hidden sm:block absolute -left-[22px] top-6 h-3 w-3 rounded-full ring-4 ring-white transition-colors ${
                            isPeak
                              ? "bg-[#f05e25]"
                              : isOpen
                              ? "bg-[#3f6e15]"
                              : "bg-stone-300"
                          }`}
                        />

                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => toggleDayOpen(idx)}
                          className="w-full px-4 sm:px-5 py-4 flex items-center justify-between gap-3 text-left cursor-pointer"
                        >
                          <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`rounded-lg px-2.5 py-1 text-xs font-bold shrink-0 tabular-nums ${
                                  isPeak
                                    ? "bg-[#f05e25] text-white"
                                    : "bg-[#3f6e15]/10 text-[#3f6e15]"
                                }`}
                              >
                                {formatPaddedStageLabel(d.day, unit)}
                              </span>
                              {isPeak && (
                                <span className="rounded-md bg-orange-50 border border-[#f05e25]/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#d94e18]">
                                  High Point
                                </span>
                              )}
                            </div>

                            <h3 className="font-heading text-lg sm:text-[21px] font-bold text-[#1c1917] leading-snug">
                              {d.title}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            {!isOpen && (d.altitude > 0 || d.durationHrs?.trim()) && (
                              <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-[#64748b] tabular-nums">
                                {d.altitude > 0 && (
                                  <span className="rounded-md bg-stone-100 px-2 py-1">
                                    {d.altitude.toLocaleString("en-US")}m
                                  </span>
                                )}
                                {d.durationHrs?.trim() && (
                                  <span className="rounded-md bg-stone-100 px-2 py-1">
                                    {d.durationHrs.trim()}
                                  </span>
                                )}
                              </div>
                            )}

                            <span
                              className={`grid h-8 w-8 place-items-center rounded-full border transition-all ${
                                isOpen
                                  ? "border-[#3f6e15]/25 bg-[#3f6e15]/[0.07] text-[#3f6e15]"
                                  : "border-stone-200 bg-white text-[#57534d]"
                              }`}
                            >
                              <ChevronDown
                                className={`h-4 w-4 transition-transform duration-200 ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            </span>
                          </div>
                        </button>

                        {isOpen && (
                          <div className="px-4 sm:px-5 pb-5 sm:pb-6 pt-3 border-t border-stone-100 space-y-4">
                            {guideLabelText &&
                              (guideHref ? (
                                isExternalGuide ? (
                                  <a
                                    href={guideHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full border border-[#3f6e15]/20 bg-[#3f6e15]/[0.05] px-4 py-1.5 text-xs sm:text-[13px] font-medium text-[#3f6e15] hover:bg-[#3f6e15]/10 transition-colors"
                                  >
                                    <Info className="h-3.5 w-3.5 shrink-0" />
                                    <span>{guideLabelText}</span>
                                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                                  </a>
                                ) : (
                                  <Link
                                    href={guideHref}
                                    className="inline-flex items-center gap-2 rounded-full border border-[#3f6e15]/20 bg-[#3f6e15]/[0.05] px-4 py-1.5 text-xs sm:text-[13px] font-medium text-[#3f6e15] hover:bg-[#3f6e15]/10 transition-colors"
                                  >
                                    <Info className="h-3.5 w-3.5 shrink-0" />
                                    <span>{guideLabelText}</span>
                                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                                  </Link>
                                )
                              ) : (
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#3f6e15]/20 bg-[#3f6e15]/[0.05] px-4 py-1.5 text-xs sm:text-[13px] font-medium text-[#3f6e15]">
                                  <Info className="h-3.5 w-3.5 shrink-0" />
                                  <span>{guideLabelText}</span>
                                </div>
                              ))}

                            {daySpecs.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                                {daySpecs.map((spec) => (
                                  <div
                                    key={spec.label}
                                    className="flex items-center gap-2.5 rounded-[12px] border border-stone-200/75 bg-[#faf9f7] p-3 min-w-0"
                                  >
                                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-[#3f6e15] ring-1 ring-stone-200/70">
                                      <spec.icon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#f05e25] leading-tight">
                                        {spec.label}
                                      </p>
                                      <p className="text-[13px] font-semibold text-[#1c1917] leading-snug tabular-nums mt-0.5 break-words">
                                        {spec.value}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {d.note ? (
                              renderFormattedRichText(d.note)
                            ) : (
                              <p className="text-sm text-[#57534d]">
                                Guided stage following our acclimatization
                                schedule along {trip.area}.
                              </p>
                            )}

                            {d.image && (
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveDayImage({
                                    src: d.image!,
                                    caption: `${formatPaddedStageLabel(
                                      d.day,
                                      unit
                                    )} — ${d.title}`,
                                  })
                                }
                                className="block rounded-[12px] overflow-hidden border border-stone-200 max-w-[340px] w-full aspect-[16/10] relative group cursor-pointer focus:outline-none shadow-2xs"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={d.image}
                                  alt={`${formatPaddedStageLabel(
                                    d.day,
                                    unit
                                  )} — ${d.title}`}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                                  <Expand className="h-3 w-3" />
                                  <span>View</span>
                                </span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 5: INCLUDES */}
          {(trip.includeGroups.length > 0 || trip.includes.length > 0) && (
            <section id="includes" className="scroll-mt-28 lg:scroll-mt-20">
              <div className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-white shadow-[0_2px_16px_-4px_rgba(28,25,23,0.06)]">
                <div className="bg-gradient-to-r from-emerald-50/90 via-emerald-50/40 to-white px-5 sm:px-8 py-5 border-b border-emerald-100 flex items-center gap-3.5">
                  <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-emerald-600 text-white shadow-xs shrink-0">
                    <Check className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                      Included in Your Package
                    </p>
                    <h2 className="font-heading text-2xl sm:text-[28px] text-[#1c1917] font-bold tracking-tight">
                      What&apos;s Included
                    </h2>
                  </div>
                </div>

                <div className="p-5 sm:p-8">
                  {trip.includeGroups.length > 0 ? (
                    <div
                      className={`grid gap-4 ${
                        trip.includeGroups.length > 1
                          ? "md:grid-cols-2"
                          : "grid-cols-1"
                      }`}
                    >
                      {trip.includeGroups.map((grp) => (
                        <div
                          key={grp.id}
                          className="rounded-[12px] border border-stone-200/80 bg-[#faf9f7]/70 p-4 sm:p-5 space-y-3"
                        >
                          <div className="flex items-center gap-3 border-b border-stone-200/80 pb-3">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#3f6e15]/[0.08] text-[#3f6e15]">
                              <ServiceGroupIcon
                                icon={grp.icon}
                                className="h-4 w-4"
                              />
                            </span>
                            <h3 className="text-[16px] font-bold text-[#1c1917]">
                              {grp.title}
                            </h3>
                          </div>

                          {grp.subtitle && (
                            <p className="text-xs sm:text-sm font-medium text-[#57534d]">
                              {grp.subtitle}
                            </p>
                          )}

                          <ul className="space-y-2.5">
                            {grp.items.map((item, idx) => (
                              <li
                                key={`${grp.id}-${idx}`}
                                className="flex items-start gap-2.5 text-[14.5px] text-[#292524] leading-relaxed"
                              >
                                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                                  <Check className="h-3 w-3" />
                                </span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {trip.includes.map((x, idx) => (
                        <li
                          key={`${x}-${idx}`}
                          className="flex items-start gap-3 rounded-[12px] border border-stone-100 bg-[#faf9f7]/75 px-4 py-3 text-[14.5px] text-[#1c1917] leading-relaxed"
                        >
                          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="h-3 w-3" />
                          </span>
                          <span>{x}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* SECTION 6: EXCLUDES */}
          {(trip.excludeGroups.length > 0 || trip.excludes.length > 0) && (
            <section id="excludes" className="scroll-mt-28 lg:scroll-mt-20">
              <div className="overflow-hidden rounded-2xl border border-stone-200/85 bg-white shadow-[0_2px_16px_-4px_rgba(28,25,23,0.06)]">
                <div className="bg-gradient-to-r from-rose-50/80 via-rose-50/30 to-white px-5 sm:px-8 py-5 border-b border-rose-100/80 flex items-center gap-3.5">
                  <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-rose-500 text-white shadow-xs shrink-0">
                    <X className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-rose-600">
                      Not Included
                    </p>
                    <h2 className="font-heading text-2xl sm:text-[28px] text-[#1c1917] font-bold tracking-tight">
                      What&apos;s Excluded
                    </h2>
                  </div>
                </div>

                <div className="p-5 sm:p-8">
                  {trip.excludeGroups.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {trip.excludeGroups.map((grp) => (
                        <div
                          key={grp.id}
                          className="rounded-[12px] border border-stone-200/80 bg-[#faf9f7]/60 p-4 sm:p-5 space-y-2.5"
                        >
                          <h3 className="text-[16px] font-bold text-[#1c1917] border-b border-stone-200/70 pb-2.5">
                            {grp.title}
                          </h3>
                          {grp.subtitle && (
                            <p className="text-xs font-medium text-[#64748b]">
                              {grp.subtitle}
                            </p>
                          )}
                          <ul className="space-y-2.5 pt-1">
                            {grp.items.map((item, idx) => (
                              <li
                                key={`${grp.id}-${idx}`}
                                className="flex items-start gap-2.5 text-[14.5px] text-[#57534d] leading-relaxed"
                              >
                                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600">
                                  <X className="h-3 w-3" />
                                </span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {trip.excludes.map((x, idx) => (
                        <li
                          key={`${x}-${idx}`}
                          className="flex items-start gap-3 rounded-[12px] border border-stone-100 bg-[#faf9f7]/65 px-4 py-3 text-[14.5px] text-[#57534d] leading-relaxed"
                        >
                          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600">
                            <X className="h-3 w-3" />
                          </span>
                          <span>{x}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* SECTION 7: TRIP COST & GROUP DATES */}
          <section id="cost" className="scroll-mt-28 lg:scroll-mt-20">
            <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_8px_30px_-12px_rgba(28,25,23,0.09)]">
              <div className="bg-gradient-to-r from-[#faf8f4] via-white to-[#fff7f3] px-5 sm:px-8 py-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f05e25]">
                    Transparent Pricing
                  </p>
                  <h2 className="mt-0.5 font-heading text-2xl sm:text-[30px] text-[#1c1917] font-bold tracking-tight">
                    Cost
                  </h2>
                </div>

                <div className="inline-flex items-baseline gap-1.5 rounded-full border border-[#f05e25]/25 bg-[#f05e25]/[0.08] px-4 py-2">
                  <span className="text-xs font-medium text-[#57534d]">From</span>
                  <span className="text-lg font-bold text-[#1c1917] tabular-nums">
                    {formatPriceUsd(trip.price, trip.priceUsd)}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#f05e25]">
                    USD
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-8 space-y-6">

              {/* Dynamic Group Price Breakdown Table */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#f05e25] shrink-0" />
                  <h3 className="text-sm font-bold text-[#f05e25]">
                    Group Price Breakdown
                  </h3>
                </div>

                {(() => {
                  const lowestTierPrice =
                    trip.priceTiers.length > 1
                      ? Math.min(...trip.priceTiers.map((t) => t.price))
                      : null;

                  return (
                    <div className="rounded-2xl border border-[#f05e25]/30 overflow-hidden bg-white shadow-2xs">
                      <div className="bg-gradient-to-r from-[#f05e25]/18 via-[#f05e25]/12 to-[#f05e25]/16 border-b border-[#f05e25]/25 px-4 sm:px-6 py-3.5 grid grid-cols-2 text-xs sm:text-sm font-bold text-[#1c1917]">
                        <span>Group Size</span>
                        <span>Price Per Person</span>
                      </div>

                      <div className="divide-y divide-[#f05e25]/15">
                        {trip.priceTiers.length > 0 ? (
                          trip.priceTiers.map((tier) => {
                            const isBestRate =
                              lowestTierPrice !== null &&
                              tier.price === lowestTierPrice;

                            return (
                              <div
                                key={tier.id}
                                className="px-4 sm:px-6 py-4 grid grid-cols-2 items-center gap-3 hover:bg-[#faf9f7] transition-colors"
                              >
                                <span className="text-sm sm:text-[15px] font-medium text-[#1c1917]">
                                  {formatPriceTierLabel(tier)}
                                </span>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm sm:text-[15px] font-bold text-[#1c1917] tabular-nums">
                                    {formatPriceUsd(tier.price, tier.priceUsd)}
                                  </span>
                                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#64748b]">
                                    USD
                                  </span>
                                  {isBestRate && (
                                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700">
                                      Best Rate
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="px-4 sm:px-6 py-4 grid grid-cols-2 items-center gap-3 hover:bg-[#faf9f7] transition-colors">
                            <span className="text-sm sm:text-[15px] font-medium text-[#1c1917]">
                              1 – {trip.groupMax}{" "}
                              {trip.groupMax === 1 ? "person" : "people"}
                            </span>
                            <span className="text-sm sm:text-[15px] font-bold text-[#1c1917] tabular-nums">
                              {formatPriceUsd(trip.price, trip.priceUsd)} USD
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Compact Value Strip */}
              <div className="grid gap-3 sm:grid-cols-3 rounded-[12px] border border-stone-200/80 bg-[#faf9f7] p-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">
                    Group Size
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-[#1c1917]">
                    Up to {trip.groupMax} travellers
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">
                    Private Trips
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-[#1c1917]">
                    Available any date
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">
                    Price Transparency
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-emerald-700">
                    All permits &amp; fees incl.
                  </p>
                </div>
              </div>

              {trip.departures.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#3f6e15]">
                    Scheduled Group Dates ({trip.departures.length})
                  </h3>

                  <div className="divide-y divide-stone-200/80 rounded-[12px] border border-stone-200 overflow-hidden bg-white">
                    {trip.departures.map((dep) => {
                      const seatsLeft = Math.max(
                        dep.seatsTotal - dep.seatsBooked,
                        0
                      );
                      const isClosed =
                        dep.status === "SOLD_OUT" ||
                        dep.status === "CANCELLED" ||
                        seatsLeft === 0;
                      const effectivePrice = dep.priceOverride ?? trip.price;

                      return (
                        <div
                          key={dep.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:px-5 hover:bg-[#faf9f7] transition-colors"
                        >
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <Calendar className="h-4 w-4 text-[#f05e25] shrink-0" />
                              <span className="text-[15px] font-bold text-[#1c1917]">
                                {formatShortDate(dep.startDate)}
                                {dep.endDate
                                  ? ` → ${formatShortDate(dep.endDate)}`
                                  : ""}
                              </span>
                              <span
                                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${departureStatusStyle(
                                  dep.status
                                )}`}
                              >
                                {dep.status.replace("_", " ")}
                              </span>
                            </div>
                            <p className="text-xs text-[#57534d]">
                              {isClosed
                                ? "No spots available"
                                : `${seatsLeft} of ${dep.seatsTotal} spots open`}
                              {dep.notes ? ` · ${dep.notes}` : ""}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 shrink-0">
                            <div className="text-left sm:text-right">
                              <span className="block text-[11px] text-[#64748b]">
                                Per person
                              </span>
                              <span className="text-lg font-bold text-[#3f6e15] tabular-nums">
                                {formatPriceUsd(
                                  effectivePrice,
                                  dep.priceOverride ? null : trip.priceUsd
                                )}
                              </span>
                            </div>

                            {isClosed ? (
                              <span className="rounded-full border border-stone-200 bg-stone-100 px-4 py-2 text-xs font-medium text-stone-400">
                                Full
                              </span>
                            ) : (
                              <a
                                href="#booking"
                                className="rounded-full bg-[#f05e25] hover:bg-[#d94e18] px-5 py-2 text-xs font-bold text-white transition-colors shadow-xs"
                              >
                                Book Now
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[12px] border border-dashed border-stone-300 bg-[#faf9f7] p-5">
                  <div>
                    <p className="text-[15px] font-bold text-[#1c1917]">
                      Flexible Private &amp; Custom Departures
                    </p>
                    <p className="text-xs text-[#57534d] mt-1">
                      Pick any preferred start date directly in the booking
                      calendar.
                    </p>
                  </div>
                  <a
                    href="#booking"
                    className="shrink-0 text-center rounded-full bg-[#3f6e15] hover:bg-[#315710] px-5 py-2.5 text-xs font-bold text-white transition-colors"
                  >
                    Select Date →
                  </a>
                </div>
              )}
              </div>
            </div>
          </section>

          {/* SECTION 8: ROUTE MAP, VIDEO & ELEVATION PROFILE */}
          {(Boolean(trip.mapImage) || profile.length > 1) && (
            <section id="map" className="scroll-mt-28 lg:scroll-mt-20">
              <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_8px_30px_-12px_rgba(28,25,23,0.09)]">
                <div className="bg-gradient-to-r from-[#faf8f4] to-white px-5 sm:px-8 py-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f05e25]">
                      Trail Topography
                    </p>
                    <h2 className="mt-0.5 font-heading text-2xl sm:text-[30px] text-[#1c1917] font-bold tracking-tight">
                      Route Map &amp; Elevation Profile
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {trip.videoUrl && (
                      <a
                        href={trip.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#f05e25]/35 bg-orange-50 px-3.5 py-1.5 text-xs font-semibold text-[#d94e18] hover:bg-[#f05e25] hover:text-white transition-colors"
                      >
                        <PlayCircle className="h-4 w-4" />
                        <span>Watch Route Video</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <div className="rounded-full bg-[#3f6e15]/[0.08] border border-[#3f6e15]/15 px-3.5 py-1.5 text-xs font-semibold text-[#3f6e15] tabular-nums">
                      Max Elevation:{" "}
                      <span className="text-[#f05e25]">
                        {trip.maxAltitude.toLocaleString("en-US")} m
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-8 space-y-6">

                {trip.mapImage && (
                  <div className="relative group overflow-hidden rounded-2xl border border-stone-200 bg-[#faf9f7]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={trip.mapImage}
                      alt={`${trip.name} route map`}
                      className="w-full max-h-[460px] object-contain mx-auto cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]"
                      onClick={() => setMapLightboxOpen(true)}
                    />
                    <button
                      type="button"
                      onClick={() => setMapLightboxOpen(true)}
                      className="absolute bottom-3.5 right-3.5 inline-flex items-center gap-1.5 rounded-full bg-slate-900/85 hover:bg-[#3f6e15] px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition-colors cursor-pointer shadow-lg"
                    >
                      <Expand className="h-3.5 w-3.5" />
                      <span>Expand Full Map</span>
                    </button>
                  </div>
                )}

                {profile.length > 1 && (
                  <div className="rounded-2xl border border-stone-200/80 bg-[#faf9f7]/70 p-4 sm:p-6">
                    <div className="w-full pt-1">
                      <ElevationProfile
                        points={profile}
                        height={240}
                        showLabels={profile.length <= 8}
                        animateKey={trip.slug}
                      />
                    </div>
                    <p className="mt-4 text-xs text-[#64748b] text-center border-t border-stone-200/70 pt-3">
                      Hover or tap along the elevation chart to inspect daily camp
                      altitudes
                    </p>
                  </div>
                )}
                </div>
              </div>
            </section>
          )}

          {/* SECTION 9: KNOW BEFORE YOU GO, GEAR LIST & ADMIN BOTTOM SECTIONS */}
          {(knowBeforeYouGoSections.length > 0 ||
            trip.gearList.length > 0 ||
            bottomCustomSections.length > 0) && (
            <section id="know-before-you-go" className="scroll-mt-28 lg:scroll-mt-20 space-y-6">
              {knowBeforeYouGoSections.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-heading text-2xl sm:text-[30px] text-[#1c1917] font-bold tracking-tight">
                      Know Before You Go
                    </h2>
                    <button
                      type="button"
                      onClick={toggleAllGuides}
                      className="text-sm font-semibold text-[#3f6e15] hover:text-[#f05e25] transition-colors cursor-pointer"
                    >
                      {allGuidesOpen ? "Collapse all" : "Expand all"}
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {knowBeforeYouGoSections.map((sec) => {
                      const isOpen = openGuideIds.has(sec.id);
                      return (
                        <div
                          key={sec.id}
                          className={`rounded-[14px] border bg-white transition-all shadow-xs overflow-hidden ${
                            isOpen
                              ? "border-[#3f6e15]/35 ring-1 ring-[#3f6e15]/10"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            onClick={() => toggleGuide(sec.id)}
                            className="flex w-full items-center justify-between gap-4 px-5 sm:px-7 py-4 sm:py-5 text-left cursor-pointer hover:bg-[#f8fafc]/80 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`h-2.5 w-2.5 rounded-full shrink-0 transition-colors ${
                                  isOpen ? "bg-[#f05e25]" : "bg-[#3f6e15]/40"
                                }`}
                              />
                              <h3 className="font-heading text-lg sm:text-[21px] font-bold text-[#1c1917] tracking-tight">
                                {sec.title}
                              </h3>
                            </div>
                            <span
                              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all ${
                                isOpen
                                  ? "border-[#3f6e15]/20 bg-[#3f6e15]/[0.07] text-[#3f6e15] rotate-180"
                                  : "border-slate-200 bg-white text-[#57534d]"
                              }`}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </span>
                          </button>

                          {isOpen && (
                            <div className="border-t border-slate-100 px-5 sm:px-7 py-5 sm:py-6">
                              {renderFormattedRichText(sec.content)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {trip.gearList.length > 0 && (
                <div className="rounded-[16px] border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                  <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#3f6e15] text-white shadow-xs shrink-0">
                      <ShieldAlert className="h-4 w-4" />
                    </span>
                    <h2 className="font-heading text-2xl sm:text-[28px] text-[#1c1917] font-bold">
                      {knowBeforeYouGoSections.length > 0
                        ? "Packing & Gear Checklist"
                        : "Know Before You Go & Gear Checklist"}
                    </h2>
                  </div>
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    {trip.gearList.map((item, idx) => (
                      <div
                        key={`${item}-${idx}`}
                        className="flex items-start gap-3 rounded-[12px] border border-slate-200/80 bg-[#f8fafc] p-4"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[8px] bg-[#3f6e15]/10 text-xs font-bold text-[#3f6e15] tabular-nums">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-[#1c1917] leading-relaxed">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bottomCustomSections.map(renderCustomSection)}
            </section>
          )}

          {/* SECTION 10: TRAVELLER REVIEWS */}
          {trip.reviews.length > 0 && (
            <section id="reviews" className="scroll-mt-28 lg:scroll-mt-20">
              <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-[0_8px_30px_-12px_rgba(28,25,23,0.09)] space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <h2 className="font-heading text-2xl sm:text-[30px] text-[#1c1917] font-bold tracking-tight">
                    Traveller Reviews
                  </h2>

                  {avgRating !== null && (
                    <div className="flex items-center gap-2 rounded-[10px] border border-amber-200 bg-amber-50 px-3.5 py-2">
                      <Star className="h-4.5 w-4.5 fill-amber-500 text-amber-500" />
                      <div>
                        <span className="text-base font-bold text-[#1c1917] tabular-nums">
                          {avgRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-[#57534d]">
                          {" "}
                          / 5.0 ({trip.reviews.length}{" "}
                          {trip.reviews.length === 1 ? "review" : "reviews"})
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {trip.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded-[12px] border border-slate-200 bg-[#f8fafc] p-5 space-y-2.5 flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {Array.from({ length: rev.rating }).map((_, idx) => (
                              <Star
                                key={idx}
                                className="h-3.5 w-3.5 fill-current"
                              />
                            ))}
                          </div>
                          {rev.verified && (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              Verified Guest
                            </span>
                          )}
                        </div>
                        {rev.title && (
                          <h3 className="text-base font-semibold text-[#1c1917]">
                            {rev.title}
                          </h3>
                        )}
                        <p className="text-sm text-[#57534d] leading-relaxed">
                          {rev.comment}
                        </p>
                      </div>
                      <p className="text-xs text-[#64748b] pt-2.5 border-t border-slate-200/70">
                        <strong className="font-semibold text-[#1c1917]">
                          {rev.authorName}
                        </strong>
                        {rev.authorCountry ? ` · ${rev.authorCountry}` : ""}
                        {rev.tripDate
                          ? ` · ${formatShortDate(rev.tripDate)}`
                          : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* SECTION 11: FREQUENTLY ASKED QUESTIONS */}
          {trip.faqs.length > 0 && (
            <section id="faqs" className="scroll-mt-28 lg:scroll-mt-20">
              <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-[0_8px_30px_-12px_rgba(28,25,23,0.09)]">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#3f6e15]/10 text-[#3f6e15] shrink-0">
                    <HelpCircle className="h-4 w-4" />
                  </span>
                  <h2 className="font-heading text-2xl sm:text-[28px] text-[#1c1917] font-bold">
                    Frequently Asked Questions
                  </h2>
                </div>
                <div className="space-y-3">
                  {trip.faqs.map((faq) => (
                    <details
                      key={faq.id}
                      className="group rounded-[12px] border border-slate-200 bg-[#f8fafc] p-5 transition-colors open:bg-white open:border-[#3f6e15]/35"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] sm:text-base font-semibold text-[#1c1917]">
                        <span>{faq.question}</span>
                        <span className="text-lg font-semibold text-[#3f6e15] transition-transform duration-200 group-open:rotate-45 shrink-0">
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-sm text-[#57534d] leading-relaxed border-t border-slate-100 pt-3 whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* RIGHT SIDEBAR: Sticky Booking Panel */}
        <aside
          id="booking"
          className="min-w-0 scroll-mt-28 lg:scroll-mt-20 lg:sticky lg:top-20 lg:self-start"
        >
          <BookingPanel trip={trip} whatsappNumber={whatsappNumber} />
        </aside>
        </div>
      </div>

      {/* 4. SIMILAR / RELATED JOURNEYS */}
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-5 pb-20 pt-10 lg:px-8 border-t border-slate-200">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#f05e25]">
                Keep Exploring
              </p>
              <h2 className="mt-1 font-heading text-3xl sm:text-4xl text-[#1c1917] font-bold tracking-tight">
                Similar Trips You May Like
              </h2>
            </div>
            <Link
              href="/destinations"
              className="group inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full border border-[#3f6e15]/25 bg-white pl-5 pr-2 py-2 text-[13px] font-semibold text-[#1c1917] shadow-[0_6px_18px_-10px_rgba(28,25,23,0.22)] transition-all duration-200 hover:border-[#3f6e15] hover:bg-[#3f6e15] hover:text-white hover:shadow-[0_12px_26px_-10px_rgba(63,110,21,0.42)] active:scale-[0.98]"
            >
              <span>View All Trips</span>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#3f6e15]/10 text-[#3f6e15] transition-all duration-200 group-hover:bg-white/20 group-hover:text-white group-hover:translate-x-0.5">
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2]" />
              </span>
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((t, i) => (
              <TripCard key={t.slug} trip={t} index={i} />
            ))}
          </div>
        </section>
      )}

      <TripCompareModal
        open={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        currentTripSlug={trip.slug}
        catalog={comparableTrips.length > 0 ? comparableTrips : [trip]}
      />
    </div>
  );
}
