"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BedDouble,
  Bus,
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
  HelpCircle,
  Images,
  Info,
  Map as MapIcon,
  MapPin,
  Mountain,
  PlayCircle,
  ShieldAlert,
  ShieldCheck,
  Star,
  Sun,
  Users,
  Utensils,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BookingPanel } from "@/components/destinations/BookingPanel";
import { ElevationProfile } from "@/components/destinations/ElevationProfile";
import { TripCard } from "@/components/destinations/TripCard";
import { TripWeatherWidget } from "@/components/destinations/TripWeatherWidget";
import { CATEGORIES, REGIONS } from "@/data/trips";
import type {
  TripCustomSectionDTO,
  TripDTO,
  TripServiceIconKey,
} from "@/lib/types";
import { formatRs } from "@/lib/booking";
import { trackViewTrip } from "@/lib/analytics";
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
      return "bg-sky-50 text-[#104b87] border-sky-200";
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
            <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-[#104b87] shrink-0" />
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
              className="font-heading text-xl sm:text-[22px] font-bold text-[#104b87] pt-3 first:pt-0 tracking-tight"
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
        className="rounded-[14px] border border-[#104b87]/15 bg-[#104b87]/[0.05] p-6 sm:p-7 space-y-3"
      >
        <div className="flex items-center gap-2.5">
          <Info className="h-5 w-5 text-[#104b87] shrink-0" />
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
  whatsappNumber,
}: {
  trip: TripDTO;
  related: TripDTO[];
  whatsappNumber?: string;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mapLightboxOpen, setMapLightboxOpen] = useState(false);
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
        rootMargin: "-140px 0px -60% 0px",
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
  const heroExtraCount = Math.max(allPhotos.length - 4, 0);

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
    <div className="min-h-screen bg-[#f8fafc] text-[#1c1917] font-sans">
      {/* 1. CLEAN HEADER + BENTO PHOTO MOSAIC GALLERY */}
      <section id="gallery-top" className="bg-white pt-24 sm:pt-28 pb-8">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 space-y-6">
          {/* Breadcrumbs + Top Meta */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav
              aria-label="Breadcrumb"
              className="text-xs sm:text-[13px] font-medium flex flex-wrap items-center gap-2 text-[#64748b]"
            >
              <Link
                href="/"
                className="hover:text-[#104b87] transition-colors"
              >
                Home
              </Link>
              <span className="text-slate-300">/</span>
              <Link
                href="/destinations"
                className="hover:text-[#104b87] transition-colors"
              >
                Destinations
              </Link>
              <span className="text-slate-300">/</span>
              <Link
                href={`/destinations/country/${encodeURIComponent(
                  trip.country
                )}`}
                className="hover:text-[#104b87] transition-colors"
              >
                {countryLabel}
              </Link>
              <span className="text-slate-300">/</span>
              {trip.region ? (
                <Link
                  href={`/destinations/region/${encodeURIComponent(
                    trip.region
                  )}`}
                  className="text-[#104b87] font-semibold hover:underline"
                >
                  {formatSlugLabel(trip.region, "region")}
                </Link>
              ) : (
                <Link
                  href={`/destinations/category/${encodeURIComponent(
                    primaryCategorySlug
                  )}`}
                  className="text-[#104b87] font-semibold hover:underline"
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
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1c1917] shadow-xs hover:border-[#104b87] hover:text-[#104b87] transition-colors cursor-pointer"
              >
                <Camera className="h-3.5 w-3.5 text-[#104b87]" />
                <span>All Photos ({allPhotos.length})</span>
              </button>
            </div>
          </div>

          {/* Title & Tagline Row */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#104b87]/[0.08] border border-[#104b87]/15 px-3 py-1 text-xs font-semibold text-[#104b87]">
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

          {/* BENTO PHOTO MOSAIC (Desktop) */}
          <div className="hidden lg:block">
            {allPhotos.length >= 4 && (
              <div className="grid grid-cols-12 gap-2.5 h-[460px] rounded-[16px] overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setLightboxIndex(0)}
                  className="col-span-7 relative h-full w-full overflow-hidden group cursor-pointer focus:outline-none"
                >
                  <Image
                    src={allPhotos[0]}
                    alt={`${trip.name} primary view`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="sr-only">Open full photo gallery</span>
                </button>

                <div className="col-span-5 grid grid-rows-2 gap-2.5 h-full">
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(1)}
                    className="relative h-full w-full overflow-hidden group cursor-pointer focus:outline-none"
                  >
                    <Image
                      src={allPhotos[1]}
                      alt={`${trip.name} gallery photo 2`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 42vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </button>

                  <div className="grid grid-cols-2 gap-2.5 h-full">
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(2)}
                      className="relative h-full w-full overflow-hidden group cursor-pointer focus:outline-none"
                    >
                      <Image
                        src={allPhotos[2]}
                        alt={`${trip.name} gallery photo 3`}
                        fill
                        sizes="(max-width: 1024px) 50vw, 22vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => setLightboxIndex(3)}
                      className="relative h-full w-full overflow-hidden group cursor-pointer focus:outline-none"
                    >
                      <Image
                        src={allPhotos[3]}
                        alt={`${trip.name} gallery photo 4`}
                        fill
                        sizes="(max-width: 1024px) 50vw, 22vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/65 backdrop-blur-sm border border-white/25 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md">
                          <Images className="h-3.5 w-3.5" />
                          <span>
                            {heroExtraCount > 0
                              ? `+${heroExtraCount} photos`
                              : "View gallery"}
                          </span>
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {allPhotos.length === 3 && (
              <div className="grid grid-cols-12 gap-2.5 h-[460px] rounded-[16px] overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setLightboxIndex(0)}
                  className="col-span-7 relative h-full w-full overflow-hidden group cursor-pointer focus:outline-none"
                >
                  <Image
                    src={allPhotos[0]}
                    alt={`${trip.name} primary view`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </button>
                <div className="col-span-5 grid grid-rows-2 gap-2.5 h-full">
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(1)}
                    className="relative h-full w-full overflow-hidden group cursor-pointer focus:outline-none"
                  >
                    <Image
                      src={allPhotos[1]}
                      alt={`${trip.name} gallery photo 2`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 42vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(2)}
                    className="relative h-full w-full overflow-hidden group cursor-pointer focus:outline-none"
                  >
                    <Image
                      src={allPhotos[2]}
                      alt={`${trip.name} gallery photo 3`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 42vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/25 px-3 py-1.5 text-xs font-semibold text-white">
                      <Images className="h-3.5 w-3.5" />
                      <span>View gallery</span>
                    </span>
                  </button>
                </div>
              </div>
            )}

            {allPhotos.length === 2 && (
              <div className="grid grid-cols-12 gap-2.5 h-[450px] rounded-[16px] overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setLightboxIndex(0)}
                  className="col-span-7 relative h-full w-full overflow-hidden group cursor-pointer focus:outline-none"
                >
                  <Image
                    src={allPhotos[0]}
                    alt={`${trip.name} primary view`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(1)}
                  className="col-span-5 relative h-full w-full overflow-hidden group cursor-pointer focus:outline-none"
                >
                  <Image
                    src={allPhotos[1]}
                    alt={`${trip.name} gallery photo 2`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/25 px-3 py-1.5 text-xs font-semibold text-white">
                    <Images className="h-3.5 w-3.5" />
                    <span>View gallery</span>
                  </span>
                </button>
              </div>
            )}

            {allPhotos.length <= 1 && (
              <button
                type="button"
                onClick={() => setLightboxIndex(0)}
                className="relative block aspect-[16/9] max-h-[470px] w-full overflow-hidden rounded-[16px] shadow-sm group cursor-pointer focus:outline-none"
              >
                <Image
                  src={allPhotos[0] || trip.image}
                  alt={trip.name}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/25 px-3.5 py-1.5 text-xs font-semibold text-white">
                  <Camera className="h-3.5 w-3.5" />
                  <span>View photo</span>
                </span>
              </button>
            )}
          </div>

          {/* MOBILE PHOTO STRIP (< lg) */}
          <div className="lg:hidden space-y-2.5">
            <button
              type="button"
              onClick={() => setLightboxIndex(0)}
              className="relative block aspect-[16/10] w-full overflow-hidden rounded-[16px] shadow-sm cursor-pointer"
            >
              <Image
                src={allPhotos[0] || trip.image}
                alt={trip.name}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-white/25 px-3 py-1 text-xs font-semibold text-white">
                <Camera className="h-3.5 w-3.5" />
                <span>{allPhotos.length} Photos</span>
              </span>
            </button>

            {allPhotos.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allPhotos.slice(0, 4).map((src, idx) => (
                  <button
                    key={`${src}-${idx}`}
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className="relative aspect-[4/3] w-full overflow-hidden rounded-[8px] border border-slate-200 cursor-pointer"
                  >
                    <Image
                      src={src}
                      alt={`${trip.name} photo ${idx + 1}`}
                      fill
                      sizes="25vw"
                      className="object-cover"
                    />
                    {idx === 3 && heroExtraCount > 0 && (
                      <span className="absolute inset-0 bg-black/55 flex items-center justify-center text-[11px] font-bold text-white">
                        +{heroExtraCount}
                      </span>
                    )}
                  </button>
                ))}
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
                className="absolute left-4 sm:left-8 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-[#104b87] hover:border-[#104b87] transition-colors cursor-pointer"
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
                className="absolute right-4 sm:right-8 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-[#104b87] hover:border-[#104b87] transition-colors cursor-pointer"
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
      <div className="sticky top-[64px] sm:top-[72px] z-30 border-y border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
          <div className="flex items-center overflow-x-auto divide-x divide-slate-200/70 scrollbar-none">
            {sections.map((s) => {
              const isActive = activeSection === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setActiveSection(s.id)}
                  className={`whitespace-nowrap px-4 py-3.5 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? "border-[#104b87] text-[#104b87] font-semibold"
                      : "border-transparent text-[#57534d] hover:text-[#104b87]"
                  }`}
                >
                  {s.label}
                </a>
              );
            })}
          </div>

          <a
            href="#book"
            className="ml-auto shrink-0 whitespace-nowrap rounded-full bg-[#f05e25] hover:bg-[#d94e18] px-4 py-1.5 text-xs font-semibold text-white lg:hidden transition-colors"
          >
            Book Now
          </a>
        </div>
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <div className="mx-auto grid max-w-7xl gap-8 lg:gap-10 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
        <div className="min-w-0 space-y-8">
          {/* SECTION 1: CLEAN OVERVIEW PROSE */}
          <section id="overview" className="scroll-mt-36">
            <div className="rounded-[16px] border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-heading text-2xl sm:text-[30px] text-[#1c1917] font-bold tracking-tight">
                  Overview
                </h2>
                <span className="rounded-full bg-[#f8fafc] border border-slate-200 px-3 py-1 text-xs font-medium text-[#57534d]">
                  {trip.area}
                </span>
              </div>
              {renderFormattedRichText(trip.overview)}
            </div>
          </section>

          {/* SECTION 2: TRIP FACTS GRID + LIVE MOUNTAIN WEATHER */}
          <section aria-label="Trip facts and mountain weather">
            <div className="rounded-[16px] border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-6">
                {tripFacts.map((fact) => (
                  <div key={fact.label} className="flex items-start gap-3.5 min-w-0">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#104b87]/[0.07] text-[#104b87]">
                      <fact.icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-[#64748b] leading-snug">
                        {fact.label}
                      </dt>
                      <dd className="mt-0.5 text-[15px] font-semibold text-[#1c1917] leading-snug break-words">
                        {fact.value}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>

              <TripWeatherWidget
                locationLabel={weatherLoc.label}
                maxAltitude={trip.maxAltitude}
                lat={weatherLoc.lat}
                lon={weatherLoc.lon}
                query={weatherLoc.query}
                country={weatherLoc.country}
              />
            </div>
          </section>

          {/* SECTION 3: TRIP HIGHLIGHTS CARD */}
          {trip.highlights.length > 0 && (
            <section id="highlights" className="scroll-mt-36">
              <div className="relative overflow-hidden rounded-[16px] border border-slate-200 bg-gradient-to-br from-[#f8fafc] via-white to-[#f05e25]/[0.045] p-6 sm:p-8 shadow-xs">
                {/* Decorative Alpine Ridge Watermark */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 600 180"
                  className="pointer-events-none absolute -bottom-2 right-0 h-36 sm:h-44 w-auto text-[#104b87]/[0.06]"
                  fill="currentColor"
                >
                  <path d="M0 180 L115 72 L205 136 L345 18 L455 110 L535 58 L600 120 L600 180 Z" />
                </svg>

                <div className="relative space-y-5">
                  <h2 className="font-heading text-2xl sm:text-[30px] text-[#1c1917] font-bold tracking-tight">
                    Trip Highlights
                  </h2>

                  <ul className="space-y-4">
                    {trip.highlights.map((h, i) => {
                      const parts = splitHighlight(h);
                      return (
                        <li
                          key={`${h}-${i}`}
                          className="flex items-start gap-3.5"
                        >
                          <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center text-[#f05e25]">
                            <Mountain className="h-4.5 w-4.5" />
                          </span>
                          <p className="text-[15px] leading-[1.7] text-[#292524]">
                            {parts.title ? (
                              <>
                                <strong className="font-semibold text-[#1c1917]">
                                  {parts.title}:
                                </strong>{" "}
                                {parts.body}
                              </>
                            ) : (
                              parts.body
                            )}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* ADMIN CUSTOM SECTIONS: OVERVIEW PLACEMENT */}
          {overviewCustomSections.map(renderCustomSection)}

          {/* SECTION 4: SHORT ITINERARY + ADMIN NOTES + DETAILED ACCORDION */}
          {trip.itinerary.length > 0 && (
            <section id="itinerary" className="scroll-mt-36 space-y-6">
              {/* Day-to-Day Short Itinerary */}
              <div className="rounded-[16px] border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-heading text-2xl sm:text-[30px] text-[#1c1917] font-bold tracking-tight">
                    Day-to-Day Short Itinerary
                  </h2>
                  <span className="text-xs font-medium text-[#64748b] tabular-nums">
                    {trip.itinerary.length}{" "}
                    {trip.itinerary.length === 1 ? "stage" : "days"}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {trip.itinerary.map((d, idx) => (
                    <button
                      key={`short-${d.day}-${idx}`}
                      type="button"
                      onClick={() => jumpToDetailedDay(idx)}
                      className="w-full text-left rounded-[10px] bg-[#104b87]/[0.045] hover:bg-[#104b87]/[0.08] transition-colors px-4 py-3 grid grid-cols-1 sm:grid-cols-[88px_minmax(0,1fr)_90px_86px] items-center gap-2 sm:gap-0 cursor-pointer"
                    >
                      <span className="text-sm font-semibold text-[#104b87] sm:pr-3 sm:border-r sm:border-dashed sm:border-[#104b87]/25 tabular-nums">
                        {formatPaddedStageLabel(d.day, unit)}
                      </span>
                      <span className="text-sm font-medium text-[#1c1917] sm:px-4 leading-snug">
                        {d.title}
                      </span>
                      <span className="text-sm text-[#57534d] sm:px-3 sm:border-l sm:border-dashed sm:border-[#104b87]/25 tabular-nums">
                        {d.altitude > 0
                          ? `${d.altitude.toLocaleString("en-US")}m`
                          : "—"}
                      </span>
                      <span className="text-sm text-[#57534d] sm:pl-3 sm:border-l sm:border-dashed sm:border-[#104b87]/25 tabular-nums">
                        {d.durationHrs?.trim() || "—"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Custom Sections between Short & Detailed Itinerary */}
              {itineraryCustomSections.map(renderCustomSection)}

              {/* Detailed Itinerary Accordions */}
              <div className="rounded-[16px] border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <h2 className="font-heading text-2xl sm:text-[30px] text-[#1c1917] font-bold tracking-tight">
                    Detailed Itinerary
                  </h2>
                  <button
                    type="button"
                    onClick={toggleAllDays}
                    className="rounded-full border border-slate-200 bg-[#f8fafc] hover:border-[#104b87] hover:text-[#104b87] px-3.5 py-1.5 text-xs font-semibold text-[#57534d] transition-colors cursor-pointer"
                  >
                    {allDaysExpanded ? "Collapse All" : "Expand All"}
                  </button>
                </div>

                {trip.itineraryIntro && (
                  <div className="rounded-[12px] border border-slate-200/80 bg-[#f8fafc] p-5 sm:p-6">
                    {renderFormattedRichText(trip.itineraryIntro)}
                  </div>
                )}

                <div className="space-y-4">
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

                    const guideLabelText = d.guideLabel?.trim();
                    const guideHref = d.guideUrl?.trim();
                    const isExternalGuide = Boolean(
                      guideHref && /^https?:\/\//i.test(guideHref)
                    );

                    return (
                      <div
                        key={`detail-${d.day}-${idx}`}
                        id={`detailed-day-${idx}`}
                        className={`scroll-mt-36 rounded-[14px] border transition-colors ${
                          isOpen
                            ? "border-[#104b87]/25 bg-white shadow-2xs"
                            : "border-slate-200 bg-[#f8fafc]/70 hover:bg-white"
                        }`}
                      >
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => toggleDayOpen(idx)}
                          className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left cursor-pointer"
                        >
                          <div className="flex flex-wrap items-center gap-3 min-w-0">
                            <span
                              className={`rounded-[8px] px-2.5 py-1 text-xs font-semibold shrink-0 tabular-nums ${
                                isPeak
                                  ? "bg-[#f05e25] text-white"
                                  : "bg-[#104b87]/10 text-[#104b87]"
                              }`}
                            >
                              {formatPaddedStageLabel(d.day, unit)}
                            </span>
                            <h3 className="font-heading text-xl sm:text-[22px] font-bold text-[#1c1917] leading-snug">
                              {d.title}
                            </h3>
                          </div>

                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-[#57534d] transition-transform duration-200 ${
                              isOpen ? "rotate-180 text-[#104b87]" : ""
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="px-5 pb-6 pt-2 border-t border-slate-100 space-y-4">
                            {guideLabelText &&
                              (guideHref ? (
                                isExternalGuide ? (
                                  <a
                                    href={guideHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full border border-[#104b87]/20 bg-[#104b87]/[0.05] px-4 py-1.5 text-xs sm:text-[13px] font-medium text-[#104b87] hover:bg-[#104b87]/10 transition-colors"
                                  >
                                    <Info className="h-3.5 w-3.5 shrink-0" />
                                    <span>{guideLabelText}</span>
                                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                                  </a>
                                ) : (
                                  <Link
                                    href={guideHref}
                                    className="inline-flex items-center gap-2 rounded-full border border-[#104b87]/20 bg-[#104b87]/[0.05] px-4 py-1.5 text-xs sm:text-[13px] font-medium text-[#104b87] hover:bg-[#104b87]/10 transition-colors"
                                  >
                                    <Info className="h-3.5 w-3.5 shrink-0" />
                                    <span>{guideLabelText}</span>
                                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                                  </Link>
                                )
                              ) : (
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#104b87]/20 bg-[#104b87]/[0.05] px-4 py-1.5 text-xs sm:text-[13px] font-medium text-[#104b87]">
                                  <Info className="h-3.5 w-3.5 shrink-0" />
                                  <span>{guideLabelText}</span>
                                </div>
                              ))}

                            {daySpecs.length > 0 && (
                              <div className="border-y border-slate-100 py-3.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {daySpecs.map((spec) => (
                                  <div
                                    key={spec.label}
                                    className="flex items-center gap-3 min-w-0"
                                  >
                                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#104b87]/[0.07] text-[#104b87]">
                                      <spec.icon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-[11px] font-semibold text-[#f05e25] leading-tight">
                                        {spec.label}
                                      </p>
                                      <p className="text-[13px] sm:text-sm font-semibold text-[#1c1917] leading-snug tabular-nums mt-0.5 break-words">
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
                                className="block rounded-[12px] overflow-hidden border border-slate-200 max-w-[340px] w-full aspect-[16/10] relative group cursor-pointer focus:outline-none shadow-2xs"
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
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* SECTION 5: INCLUDES */}
          {(trip.includeGroups.length > 0 || trip.includes.length > 0) && (
            <section id="includes" className="scroll-mt-36">
              <div className="rounded-[16px] border border-emerald-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-600 text-white shadow-xs shrink-0">
                    <Check className="h-4 w-4" />
                  </span>
                  <h2 className="font-heading text-2xl sm:text-[28px] text-[#1c1917] font-bold">
                    What&apos;s Included
                  </h2>
                </div>

                {trip.includeGroups.length > 0 ? (
                  <div className="space-y-4">
                    {trip.includeGroups.map((grp) => (
                      <div
                        key={grp.id}
                        className="rounded-[12px] border border-slate-200/90 bg-[#f8fafc]/70 p-5 sm:p-6 space-y-3.5"
                      >
                        <div className="flex items-center gap-3 border-b border-slate-200/80 pb-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#104b87]/[0.08] text-[#104b87]">
                            <ServiceGroupIcon
                              icon={grp.icon}
                              className="h-4 w-4"
                            />
                          </span>
                          <h3 className="text-[17px] font-semibold text-[#1c1917]">
                            {grp.title}
                          </h3>
                        </div>

                        {grp.subtitle && (
                          <p className="text-sm font-medium text-[#57534d]">
                            {grp.subtitle}
                          </p>
                        )}

                        <ul className="space-y-2.5">
                          {grp.items.map((item, idx) => (
                            <li
                              key={`${grp.id}-${idx}`}
                              className="flex items-start gap-2.5 text-[15px] text-[#292524] leading-relaxed"
                            >
                              <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="grid gap-3.5 sm:grid-cols-2">
                    {trip.includes.map((x, idx) => (
                      <li
                        key={`${x}-${idx}`}
                        className="flex items-start gap-2.5 text-[15px] text-[#1c1917] leading-relaxed"
                      >
                        <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )}

          {/* SECTION 6: EXCLUDES */}
          {(trip.excludeGroups.length > 0 || trip.excludes.length > 0) && (
            <section id="excludes" className="scroll-mt-36">
              <div className="rounded-[16px] border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-200 text-slate-700 shrink-0">
                    <X className="h-4 w-4" />
                  </span>
                  <h2 className="font-heading text-2xl sm:text-[28px] text-[#1c1917] font-bold">
                    What&apos;s Excluded
                  </h2>
                </div>

                {trip.excludeGroups.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {trip.excludeGroups.map((grp) => (
                      <div
                        key={grp.id}
                        className="border-l-2 border-slate-200 pl-4 space-y-2.5"
                      >
                        <h3 className="text-[16px] font-semibold text-[#1c1917]">
                          {grp.title}
                        </h3>
                        {grp.subtitle && (
                          <p className="text-xs font-medium text-[#64748b]">
                            {grp.subtitle}
                          </p>
                        )}
                        <ul className="space-y-2">
                          {grp.items.map((item, idx) => (
                            <li
                              key={`${grp.id}-${idx}`}
                              className="flex items-start gap-2.5 text-[15px] text-[#57534d] leading-relaxed"
                            >
                              <X className="mt-1 h-4 w-4 shrink-0 text-rose-500" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="grid gap-3.5 sm:grid-cols-2">
                    {trip.excludes.map((x, idx) => (
                      <li
                        key={`${x}-${idx}`}
                        className="flex items-start gap-2.5 text-[15px] text-[#57534d] leading-relaxed"
                      >
                        <X className="mt-1 h-4 w-4 shrink-0 text-rose-500" />
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )}

          {/* SECTION 7: TRIP COST & GROUP DATES */}
          <section id="cost" className="scroll-mt-36">
            <div className="rounded-[16px] border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Wallet className="h-5 w-5 text-[#f05e25] shrink-0" />
                  <h2 className="font-heading text-2xl sm:text-[30px] text-[#1c1917] font-bold tracking-tight">
                    Cost &amp; Group Departures
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#64748b]">Price per person</p>
                  <div className="flex items-baseline gap-2.5 justify-end">
                    <span className="text-2xl sm:text-3xl font-bold text-[#104b87] tabular-nums">
                      {formatRs(trip.price)}
                    </span>
                    {trip.priceUsd !== null &&
                      trip.priceUsd !== undefined &&
                      trip.priceUsd > 0 && (
                        <span className="text-xs font-medium text-[#57534d] tabular-nums">
                          (≈ ${trip.priceUsd.toLocaleString("en-US")} USD)
                        </span>
                      )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 rounded-[12px] border border-slate-200/80 bg-[#f8fafc] p-4">
                <div>
                  <p className="text-xs text-[#64748b]">Group Size</p>
                  <p className="mt-0.5 text-[15px] font-semibold text-[#1c1917]">
                    Up to {trip.groupMax} travellers
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#64748b]">Private Trips</p>
                  <p className="mt-0.5 text-[15px] font-semibold text-[#1c1917]">
                    Available any date
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#64748b]">Price Transparency</p>
                  <p className="mt-0.5 text-[15px] font-semibold text-emerald-700">
                    All permits &amp; fees incl.
                  </p>
                </div>
              </div>

              {trip.priceTiers.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#f05e25] shrink-0" />
                    <h3 className="text-sm font-semibold text-[#104b87]">
                      Group Price Breakdown
                    </h3>
                  </div>

                  <div className="rounded-[12px] border border-slate-200 overflow-hidden bg-white">
                    <div className="bg-[#104b87]/[0.06] border-b border-slate-200 px-5 py-3 grid grid-cols-2 text-xs sm:text-sm font-semibold text-[#104b87]">
                      <span>Group Size</span>
                      <span>Price Per Person</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {trip.priceTiers.map((tier) => (
                        <div
                          key={tier.id}
                          className="px-5 py-3.5 grid grid-cols-2 items-center text-[15px] hover:bg-[#f8fafc] transition-colors"
                        >
                          <span className="font-medium text-[#1c1917]">
                            {formatPriceTierLabel(tier)}
                          </span>
                          <span className="font-bold text-[#104b87] tabular-nums">
                            {formatRs(tier.price)}
                            {tier.priceUsd !== null &&
                              tier.priceUsd !== undefined &&
                              tier.priceUsd > 0 && (
                                <span className="ml-2 text-xs font-medium text-[#64748b]">
                                  (≈ ${tier.priceUsd.toLocaleString("en-US")})
                                </span>
                              )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {trip.departures.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-[#104b87]">
                    Scheduled Group Dates ({trip.departures.length})
                  </h3>

                  <div className="divide-y divide-slate-200/80 rounded-[12px] border border-slate-200 overflow-hidden">
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
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 hover:bg-[#f8fafc] transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[15px] font-semibold text-[#1c1917]">
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

                          <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                            <div className="text-left sm:text-right">
                              <span className="block text-[11px] text-[#64748b]">
                                Per person
                              </span>
                              <span className="text-lg font-bold text-[#104b87] tabular-nums">
                                {formatRs(effectivePrice)}
                              </span>
                            </div>

                            {isClosed ? (
                              <span className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-medium text-slate-400">
                                Full
                              </span>
                            ) : (
                              <a
                                href="#book"
                                className="rounded-full bg-[#f05e25] hover:bg-[#d94e18] px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs"
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[12px] border border-dashed border-slate-300 bg-[#f8fafc] p-5">
                  <div>
                    <p className="text-[15px] font-semibold text-[#1c1917]">
                      Flexible Private &amp; Custom Departures
                    </p>
                    <p className="text-xs text-[#57534d] mt-0.5">
                      Pick any preferred start date directly in the booking
                      calendar on the right.
                    </p>
                  </div>
                  <a
                    href="#book"
                    className="shrink-0 rounded-full bg-[#104b87] hover:bg-[#0a355f] px-5 py-2 text-xs font-semibold text-white transition-colors"
                  >
                    Select Date →
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* SECTION 8: ROUTE MAP, VIDEO & ELEVATION PROFILE */}
          {(Boolean(trip.mapImage) || profile.length > 1) && (
            <section id="map" className="scroll-mt-36">
              <div className="rounded-[16px] border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <MapIcon className="h-5 w-5 text-[#104b87] shrink-0" />
                    <h2 className="font-heading text-2xl sm:text-[30px] text-[#1c1917] font-bold tracking-tight">
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
                    <div className="rounded-full bg-[#104b87]/[0.08] border border-[#104b87]/15 px-3.5 py-1.5 text-xs font-semibold text-[#104b87] tabular-nums">
                      Max Elevation:{" "}
                      <span className="text-[#f05e25]">
                        {trip.maxAltitude.toLocaleString("en-US")} m
                      </span>
                    </div>
                  </div>
                </div>

                {trip.mapImage && (
                  <div className="relative overflow-hidden rounded-[12px] border border-slate-200 bg-[#f8fafc]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={trip.mapImage}
                      alt={`${trip.name} route map`}
                      className="w-full max-h-[460px] object-contain mx-auto cursor-pointer"
                      onClick={() => setMapLightboxOpen(true)}
                    />
                    <button
                      type="button"
                      onClick={() => setMapLightboxOpen(true)}
                      className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 hover:bg-[#104b87] px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors cursor-pointer shadow-md"
                    >
                      <Expand className="h-3.5 w-3.5" />
                      <span>Expand Map</span>
                    </button>
                  </div>
                )}

                {profile.length > 1 && (
                  <div className="pt-2">
                    <ElevationProfile
                      points={profile}
                      height={240}
                      showLabels={profile.length <= 8}
                      animateKey={trip.slug}
                    />
                    <p className="mt-4 text-xs text-[#64748b] text-center border-t border-slate-100 pt-3">
                      Hover or tap along the route profile to inspect daily camp
                      elevations
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* SECTION 9: KNOW BEFORE YOU GO, GEAR LIST & ADMIN BOTTOM SECTIONS */}
          {(knowBeforeYouGoSections.length > 0 ||
            trip.gearList.length > 0 ||
            bottomCustomSections.length > 0) && (
            <section id="know-before-you-go" className="scroll-mt-36 space-y-6">
              {knowBeforeYouGoSections.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-heading text-2xl sm:text-[30px] text-[#1c1917] font-bold tracking-tight">
                      Know Before You Go
                    </h2>
                    <button
                      type="button"
                      onClick={toggleAllGuides}
                      className="text-sm font-semibold text-[#104b87] hover:text-[#f05e25] transition-colors cursor-pointer"
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
                              ? "border-[#104b87]/35 ring-1 ring-[#104b87]/10"
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
                                  isOpen ? "bg-[#f05e25]" : "bg-[#104b87]/40"
                                }`}
                              />
                              <h3 className="font-heading text-lg sm:text-[21px] font-bold text-[#1c1917] tracking-tight">
                                {sec.title}
                              </h3>
                            </div>
                            <span
                              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all ${
                                isOpen
                                  ? "border-[#104b87]/20 bg-[#104b87]/[0.07] text-[#104b87] rotate-180"
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
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#104b87] text-white shadow-xs shrink-0">
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
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[8px] bg-[#104b87]/10 text-xs font-bold text-[#104b87] tabular-nums">
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
            <section id="reviews" className="scroll-mt-36">
              <div className="rounded-[16px] border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
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
            <section id="faqs" className="scroll-mt-36">
              <div className="rounded-[16px] border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#104b87]/10 text-[#104b87] shrink-0">
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
                      className="group rounded-[12px] border border-slate-200 bg-[#f8fafc] p-5 transition-colors open:bg-white open:border-[#104b87]/35"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] sm:text-base font-semibold text-[#1c1917]">
                        <span>{faq.question}</span>
                        <span className="text-lg font-semibold text-[#104b87] transition-transform duration-200 group-open:rotate-45 shrink-0">
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
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <BookingPanel trip={trip} whatsappNumber={whatsappNumber} />
        </aside>
      </div>

      {/* 4. SIMILAR / RELATED JOURNEYS */}
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-20 pt-10 lg:px-8 border-t border-slate-200">
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
              className="text-xs sm:text-sm font-semibold text-[#104b87] hover:underline"
            >
              View All Trips ↗
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((t, i) => (
              <TripCard key={t.slug} trip={t} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
