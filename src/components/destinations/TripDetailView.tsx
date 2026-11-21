"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Gauge,
  MapPin,
  Mountain,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BookingPanel } from "@/components/destinations/BookingPanel";
import { ElevationProfile } from "@/components/destinations/ElevationProfile";
import { TripCard } from "@/components/destinations/TripCard";
import {
  categoryLabel,
  regionLabel,
  type Category,
  type Region,
} from "@/data/trips";
import type { TripDTO } from "@/lib/types";
import { formatRs } from "@/lib/booking";
import { trackViewTrip } from "@/lib/analytics";

const MONTHS = [
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

const SECTIONS = [
  { id: "gallery-top", label: "Gallery" },
  { id: "overview", label: "Overview" },
  { id: "altitude", label: "Altitude Profile" },
  { id: "itinerary", label: "Itinerary" },
  { id: "includes", label: "Includes" },
];

export function TripDetailView({
  trip,
  related,
}: {
  trip: TripDTO;
  related: TripDTO[];
}) {
  const [activeHeroImg, setActiveHeroImg] = useState<string>(trip.image);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [itineraryFilter, setItineraryFilter] = useState<"all" | "high">("all");

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

  // Combine main image + gallery images (deduplicated) for the top gallery
  const allPhotos = Array.from(new Set([trip.image, ...trip.gallery]));

  const profile = trip.itinerary.map((d) => ({
    label: d.title,
    sub: `${trip.days === 1 ? "" : "Day "}${d.day}`,
    altitude: d.altitude,
  }));

  const stats = [
    {
      icon: Clock,
      label: "Duration",
      value: `${trip.days} ${trip.days === 1 ? "day" : "days"}`,
    },
    {
      icon: Mountain,
      label: "Max Altitude",
      value: `${trip.maxAltitude.toLocaleString("en-US")} m`,
    },
    { icon: Gauge, label: "Technical Grade", value: trip.difficulty },
    { icon: Users, label: "Group Size", value: `≤ ${trip.groupMax} guests` },
    {
      icon: MapPin,
      label: "Start / Finish",
      value: `${trip.start} → ${trip.end}`,
    },
  ];

  const filteredItinerary =
    itineraryFilter === "all"
      ? trip.itinerary
      : trip.itinerary.filter(
          (d, idx) =>
            d.altitude === trip.maxAltitude ||
            Boolean(d.note) ||
            idx === 0 ||
            idx === trip.itinerary.length - 1
        );

  return (
    <div className="min-h-screen bg-[#f8fafb] text-[#111d1f]">
      {/* 1. HERO SECTION: Big Background Image Above Title + Top Gallery Strip & Button */}
      <section
        id="gallery-top"
        className="relative flex min-h-[78vh] flex-col justify-end overflow-hidden bg-[#050c0e]"
      >
        {/* Primary Full-Bleed Background Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={activeHeroImg}
          src={activeHeroImg}
          alt={trip.name}
          width={1600}
          height={1008}
          className="absolute inset-0 h-full w-full object-cover opacity-85 transition-all duration-700"
        />
        {/* Alpine Slate & Glacial Teal Atmospheric Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050c0e] via-[#050c0e]/50 to-[#050c0e]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050c0e]/80 via-[#050c0e]/30 to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-10 pt-28 lg:px-8">
          {/* Top Bar: Breadcrumb + Prominent Gallery Trigger Button */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <nav className="font-mono text-xs uppercase tracking-[0.22em] flex flex-wrap items-center gap-2 text-white/70">
              <Link href="/" className="hover:text-[#e8b765] transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link
                href="/destinations"
                className="hover:text-[#e8b765] transition-colors"
              >
                Destinations
              </Link>
              <span>/</span>
              {trip.region ? (
                <Link
                  href={`/destinations?category=trekking&region=${trip.region}`}
                  className="text-[#89d6e2] hover:text-[#e8b765] transition-colors"
                >
                  {regionLabel(trip.region as Region)}
                </Link>
              ) : (
                <Link
                  href={`/destinations?category=${
                    trip.categories[0] ?? "trekking"
                  }`}
                  className="text-[#89d6e2] hover:text-[#e8b765] transition-colors"
                >
                  {categoryLabel((trip.categories[0] ?? "trekking") as Category)}
                </Link>
              )}
            </nav>

            {/* Gallery Action Button Brought to the Top */}
            <button
              type="button"
              onClick={() => setLightboxIndex(0)}
              className="inline-flex items-center gap-2 rounded-full border border-[#e8b765]/80 bg-[#071318]/85 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest text-[#e8b765] backdrop-blur-md transition-all hover:bg-[#e8b765] hover:text-[#050c0e] shadow-lg cursor-pointer"
            >
              <Camera className="h-4 w-4" />
              <span>View Gallery ({allPhotos.length} Photos)</span>
            </button>
          </div>

          {/* Title & Tagline */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#00515b]/80 border border-[#89d6e2]/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-[#89d6e2] mb-3 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e8b765]" />
                <span>{trip.area}</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.96] text-white font-light tracking-tight">
                {trip.name}
              </h1>
              <p className="mt-4 max-w-2xl text-base sm:text-lg text-white/85 font-light leading-relaxed">
                {trip.tagline}
              </p>
            </div>

            {/* Interactive Top Gallery Thumbnails Strip (Brought to Top!) */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-white/15 bg-[#071318]/75 p-3 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#89d6e2]">
                    Expedition Field Gallery
                  </span>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(0)}
                    className="font-mono text-[10px] uppercase tracking-wider text-[#e8b765] hover:underline cursor-pointer"
                  >
                    Expand Fullscreen ↗
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {allPhotos.slice(0, 4).map((src, i) => {
                    const isCurrent = activeHeroImg === src;
                    return (
                      <div key={src + i} className="relative group">
                        <button
                          type="button"
                          onClick={() => setActiveHeroImg(src)}
                          onDoubleClick={() => setLightboxIndex(i)}
                          className={`relative block aspect-[4/3] w-full overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                            isCurrent
                              ? "border-[#e8b765] ring-2 ring-[#e8b765]/40 scale-[1.02]"
                              : "border-white/15 opacity-75 hover:opacity-100 hover:border-white/50"
                          }`}
                          title="Click to preview on hero · Double-click for fullscreen"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt={`${trip.name} gallery ${i + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => setLightboxIndex(i)}
                          className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[8px] uppercase text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                        >
                          Zoom
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 5-Column Expedition Telemetry Bar */}
          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/15 backdrop-blur-xl sm:grid-cols-3 lg:grid-cols-5 shadow-xl">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-[#071318]/85 px-5 py-4 transition-colors hover:bg-[#003840]/90"
              >
                <dt className="font-mono flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#89d6e2]">
                  <s.icon className="h-3.5 w-3.5 text-[#e8b765]" /> {s.label}
                </dt>
                <dd className="mt-1.5 font-serif text-base sm:text-lg font-normal text-white">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Lightbox Modal for Fullscreen Gallery */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#050c0e]/95 p-4 backdrop-blur-xl"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            aria-label="Close gallery"
            onClick={() => setLightboxIndex(null)}
            className="absolute right-6 top-6 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-[#e8b765] hover:text-[#050c0e] transition-colors cursor-pointer"
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
                className="absolute left-4 sm:left-8 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-[#e8b765] hover:text-[#050c0e] transition-colors cursor-pointer"
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
                className="absolute right-4 sm:right-8 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-[#e8b765] hover:text-[#050c0e] transition-colors cursor-pointer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div
            className="max-w-5xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={allPhotos[lightboxIndex]}
              alt={`${trip.name} — photo ${lightboxIndex + 1}`}
              className="max-h-[78vh] w-auto max-w-full rounded-2xl border border-white/15 object-contain shadow-2xl"
            />
            <div className="mt-4 flex items-center justify-between w-full max-w-md px-4 font-mono text-xs text-white/80">
              <span>{trip.name}</span>
              <span className="text-[#e8b765]">
                Photo {lightboxIndex + 1} of {allPhotos.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. STICKY SECTION SUB-NAVIGATION */}
      <div className="sticky top-16 z-30 border-b border-[#d8e5e7] bg-white/95 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto px-5 lg:px-8">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="whitespace-nowrap border-b-2 border-transparent py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-[#3f484a] transition-colors hover:border-[#00515b] hover:text-[#003840] font-semibold"
            >
              {s.label}
            </a>
          ))}
          <a
            href="#book"
            className="ml-auto whitespace-nowrap rounded-full bg-[#00515b] px-4 py-1.5 font-mono text-xs uppercase tracking-wider font-semibold text-white lg:hidden"
          >
            Book Now
          </a>
        </div>
      </div>

      {/* 3. MAIN CONTENT GRID: Overview + Altitude + Itinerary + Includes (Left) | Sticky Booking Panel (Right) */}
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
        <div className="min-w-0 space-y-14">
          {/* SECTION A: PROFESSIONAL OVERVIEW DOSSIER */}
          <section id="overview" className="scroll-mt-32">
            <div className="rounded-2xl border border-[#d8e5e7] bg-white p-6 sm:p-8 shadow-[0_10px_30px_-15px_rgba(0,56,64,0.07)]">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#e8f0f3]">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#b58133] font-semibold">
                    Expedition Dossier · Route Overview
                  </p>
                  <h2 className="mt-1 font-serif text-3xl sm:text-4xl text-[#111d1f] font-normal">
                    The Journey &amp; Field Brief
                  </h2>
                </div>
                <span className="rounded-full bg-[#f2f8fa] border border-[#d8e5e7] px-3.5 py-1 font-mono text-xs text-[#00515b] font-semibold">
                  {trip.area}
                </span>
              </div>

              {/* Editorial Overview Text */}
              <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#263235] font-normal">
                {trip.overview}
              </p>

              {/* Key Expedition Highlights Grid */}
              <div className="mt-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00515b] font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-[#b58133]" /> Signature
                  Route Highlights
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {trip.highlights.map((h, i) => (
                    <div
                      key={h}
                      className="flex items-start gap-3.5 rounded-xl border border-[#e2edf0] bg-[#f8fafb] p-4 transition-colors hover:border-[#006b78]/40 hover:bg-[#f2f8fa]"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#00515b] font-mono text-xs font-bold text-white shadow-sm">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="text-sm font-medium text-[#111d1f] leading-snug pt-0.5">
                        {h}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 12-Month Seasonal Climbing & Trekking Window */}
              <div className="mt-8 rounded-xl border border-[#e2edf0] bg-[#f8fafb] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] flex items-center gap-2 text-[#3f484a] font-semibold">
                    <Calendar className="h-3.5 w-3.5 text-[#00515b]" /> Optimal
                    Seasonal Window
                  </p>
                  <div className="flex items-center gap-4 font-mono text-[10px]">
                    <span className="flex items-center gap-1.5 text-[#00515b] font-semibold">
                      <span className="h-2.5 w-2.5 rounded-sm bg-[#00515b] inline-block" />{" "}
                      Prime Window
                    </span>
                    <span className="flex items-center gap-1.5 text-[#6f797b]">
                      <span className="h-2.5 w-2.5 rounded-sm bg-[#dbe7ea] inline-block" />{" "}
                      Off-Season
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-1.5">
                  {MONTHS.map((m, i) => {
                    const on = trip.seasonMonths.includes(i + 1);
                    return (
                      <div key={m} className="text-center">
                        <div
                          className={`h-8 rounded-md transition-colors ${
                            on
                              ? "bg-gradient-to-t from-[#003840] to-[#006b78] shadow-sm"
                              : "bg-[#e3eff2]"
                          }`}
                        />
                        <span
                          className={`mt-1.5 block font-mono text-[10px] ${
                            on
                              ? "text-[#003840] font-bold"
                              : "text-[#6f797b]"
                          }`}
                        >
                          {m}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION B: TOPOGRAPHIC ALTITUDE PROFILE */}
          <section id="altitude" className="scroll-mt-32">
            <div className="rounded-2xl border border-[#d8e5e7] bg-white p-6 sm:p-8 shadow-[0_10px_30px_-15px_rgba(0,56,64,0.07)]">
              <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-[#e8f0f3] mb-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#b58133] font-semibold">
                    Topographic Survey Profile
                  </p>
                  <h2 className="mt-1 font-serif text-3xl text-[#111d1f] font-normal">
                    Stage-by-Stage Altitude Gradient
                  </h2>
                </div>
                <div className="rounded-lg bg-[#f2f8fa] border border-[#d8e5e7] px-3 py-1.5 font-mono text-xs text-[#003840]">
                  Apex Elevation:{" "}
                  <strong className="text-[#b58133]">
                    {trip.maxAltitude.toLocaleString("en-US")} m
                  </strong>
                </div>
              </div>

              <div className="pt-4 pb-2">
                <ElevationProfile
                  points={profile}
                  height={240}
                  showLabels={profile.length <= 8}
                  animateKey={trip.slug}
                />
              </div>

              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#55606a] text-center border-t border-[#e8f0f3] pt-3">
                Hover or tap along the ridge transect to inspect each daily camp
                elevation
              </p>
            </div>
          </section>

          {/* SECTION C: REDESIGNED PROFESSIONAL ITINERARY FIELD LOG */}
          <section id="itinerary" className="scroll-mt-32">
            <div className="rounded-2xl border border-[#d8e5e7] bg-white p-6 sm:p-8 shadow-[0_10px_30px_-15px_rgba(0,56,64,0.07)]">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#e8f0f3]">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#b58133] font-semibold">
                    Chronological Field Log · {trip.itinerary.length} Stages
                  </p>
                  <h2 className="mt-1 font-serif text-3xl sm:text-4xl text-[#111d1f] font-normal">
                    Day-by-Day Expedition Itinerary
                  </h2>
                </div>

                {/* Filter buttons */}
                <div className="inline-flex rounded-full border border-[#d8e5e7] bg-[#f8fafb] p-1 self-start sm:self-end">
                  <button
                    type="button"
                    onClick={() => setItineraryFilter("all")}
                    className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                      itineraryFilter === "all"
                        ? "bg-[#00515b] text-white font-semibold"
                        : "text-[#55606a] hover:text-[#111d1f]"
                    }`}
                  >
                    All Stages ({trip.itinerary.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setItineraryFilter("high")}
                    className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                      itineraryFilter === "high"
                        ? "bg-[#b58133] text-white font-semibold"
                        : "text-[#55606a] hover:text-[#111d1f]"
                    }`}
                  >
                    Key Milestones
                  </button>
                </div>
              </div>

              {/* Timeline Spine & Stage Cards */}
              <ol className="relative mt-6 space-y-3 pl-8 sm:pl-10">
                {/* Continuous Vertical Gradient Spine */}
                <span
                  className="absolute bottom-4 left-[13px] sm:left-[17px] top-4 w-0.5 bg-gradient-to-b from-[#008ab5] via-[#00515b] to-[#b58133]"
                  aria-hidden
                />

                {filteredItinerary.map((d, i) => {
                  const isPeak = d.altitude === trip.maxAltitude;
                  const origIdx = trip.itinerary.indexOf(d);
                  const prevAlt =
                    origIdx > 0
                      ? trip.itinerary[origIdx - 1]!.altitude
                      : d.altitude;
                  const delta = d.altitude - prevAlt;

                  return (
                    <li
                      key={`${d.day}-${i}`}
                      className={`group relative rounded-xl border p-4 sm:p-5 transition-all ${
                        isPeak
                          ? "border-[#b58133] bg-gradient-to-r from-[#fffdf9] to-[#f9f4eb] shadow-md"
                          : "border-[#e2edf0] bg-[#f8fafb] hover:border-[#006b78]/50 hover:bg-white hover:shadow-sm"
                      }`}
                    >
                      {/* Timeline Node Marker */}
                      <span
                        className={`absolute -left-[27px] sm:-left-[31px] top-5 grid h-4 w-4 place-items-center rounded-full border-2 border-white shadow-sm ${
                          isPeak
                            ? "bg-[#b58133] ring-4 ring-[#b58133]/25"
                            : "bg-[#00515b]"
                        }`}
                      />

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`rounded-md px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${
                              isPeak
                                ? "bg-[#b58133] text-white"
                                : "bg-[#00515b]/10 text-[#00515b]"
                            }`}
                          >
                            {unit} {d.day}
                          </span>
                          {isPeak && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#b58133]/15 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#b58133]">
                              <Compass className="h-3 w-3" /> Apex Point
                            </span>
                          )}
                        </div>

                        {/* Elevation & Delta Readout */}
                        <div className="flex items-center gap-2 font-mono text-xs">
                          {origIdx > 0 && delta !== 0 && (
                            <span
                              className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] ${
                                delta > 0
                                  ? "bg-[#b58133]/12 text-[#b58133]"
                                  : "bg-[#008ab5]/12 text-[#006b78]"
                              }`}
                            >
                              {delta > 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {delta > 0 ? `+${delta}m` : `${delta}m`}
                            </span>
                          )}
                          <span className="rounded-md bg-white border border-[#d8e5e7] px-2.5 py-0.5 font-semibold text-[#003840]">
                            {d.altitude.toLocaleString("en-US")} m
                          </span>
                        </div>
                      </div>

                      <h3 className="mt-2 font-serif text-lg sm:text-xl font-medium text-[#111d1f]">
                        {d.title}
                      </h3>

                      {d.note && (
                        <p className="mt-1.5 text-xs sm:text-sm text-[#3f484a] leading-relaxed bg-white/80 rounded-lg p-2.5 border border-[#e8f0f3]">
                          {d.note}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>

          {/* SECTION D: INCLUDED & EXCLUDED LEDGER */}
          <section id="includes" className="scroll-mt-32">
            <div className="mb-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#b58133] font-semibold">
                Transparent Expedition Ledger
              </p>
              <h2 className="mt-1 font-serif text-3xl sm:text-4xl text-[#111d1f] font-normal">
                What&apos;s Included &amp; Excluded
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-[#006b78]/30 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#e8f0f3]">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[#00515b] text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#00515b] font-bold">
                    Included in Tariff
                  </p>
                </div>
                <ul className="space-y-3">
                  {trip.includes.map((x) => (
                    <li
                      key={x}
                      className="flex items-start gap-3 text-sm text-[#111d1f]"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#006b78]" />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-[#d8e5e7] bg-[#f8fafb] p-6">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#e2edf0]">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[#e2edf0] text-[#55606a]">
                    <X className="h-3.5 w-3.5" />
                  </span>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#55606a] font-bold">
                    Not Included
                  </p>
                </div>
                <ul className="space-y-3">
                  {trip.excludes.map((x) => (
                    <li
                      key={x}
                      className="flex items-start gap-3 text-sm text-[#55606a]"
                    >
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-[#6f797b]" />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* SECTION E: FREQUENTLY ASKED QUESTIONS (WHEN PRESENT) */}
          {trip.faqs.length > 0 && (
            <section id="faqs" className="scroll-mt-32">
              <div className="mb-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#b58133] font-semibold">
                  Pre-Departure Briefing
                </p>
                <h2 className="mt-1 font-serif text-3xl sm:text-4xl text-[#111d1f] font-normal">
                  Frequently Asked Questions
                </h2>
              </div>
              <div className="space-y-3">
                {trip.faqs.map((faq) => (
                  <details
                    key={faq.id}
                    className="group rounded-2xl border border-[#d8e5e7] bg-white p-5 shadow-xs"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-lg text-[#111d1f]">
                      <span>{faq.question}</span>
                      <span className="font-mono text-xs text-[#00515b] transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-sm text-[#3f484a] leading-relaxed border-t border-[#e8f0f3] pt-3">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* SECTION F: VERIFIED TREKKER REVIEWS (WHEN PRESENT) */}
          {trip.reviews.length > 0 && (
            <section id="reviews" className="scroll-mt-32">
              <div className="mb-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#b58133] font-semibold">
                  Field Dispatches &amp; Reviews
                </p>
                <h2 className="mt-1 font-serif text-3xl sm:text-4xl text-[#111d1f] font-normal">
                  Verified Climber Reports
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {trip.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-2xl border border-[#d8e5e7] bg-white p-5 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[#b58133]">
                        {Array.from({ length: rev.rating }).map((_, idx) => (
                          <Star
                            key={idx}
                            className="h-3.5 w-3.5 fill-current"
                          />
                        ))}
                      </div>
                      {rev.verified && (
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#0f4c54] bg-[#f2efe8] border border-[#d6cfc2] px-2 py-0.5 rounded-full">
                          Verified Ascent
                        </span>
                      )}
                    </div>
                    {rev.title && (
                      <h3 className="font-serif text-lg text-[#111d1f]">
                        {rev.title}
                      </h3>
                    )}
                    <p className="text-xs sm:text-sm text-[#3f484a] leading-relaxed">
                      {rev.comment}
                    </p>
                    <p className="font-mono text-[11px] text-[#6f797b] pt-1">
                      {rev.authorName}
                      {rev.authorCountry ? ` · ${rev.authorCountry}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT SIDEBAR: Sticky Booking Panel */}
        <aside className="lg:sticky lg:top-28 lg:self-start space-y-4">
          <BookingPanel trip={trip} />
          <Link
            href="/contact"
            className="flex items-center justify-between rounded-2xl border border-[#d8e5e7] bg-white p-4 text-sm transition-all hover:border-[#00515b] hover:shadow-md"
          >
            <span>
              <span className="block font-serif text-base font-medium text-[#111d1f]">
                Have a custom question first?
              </span>
              <span className="text-xs text-[#55606a]">
                Speak directly with a BROTHERS Holidays Adventure expedition lead
              </span>
            </span>
            <ArrowUpRight className="h-4 w-4 text-[#00515b]" />
          </Link>
        </aside>
      </div>

      {/* 4. SIMILAR / RELATED JOURNEYS */}
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-20 pt-8 lg:px-8 border-t border-[#d8e5e7]">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#b58133] font-semibold">
                Keep Exploring
              </p>
              <h2 className="mt-1 font-serif text-3xl sm:text-4xl text-[#111d1f] font-normal">
                Similar Himalayan Journeys
              </h2>
            </div>
            <Link
              href="/destinations"
              className="font-mono text-xs uppercase tracking-wider text-[#00515b] hover:underline font-semibold"
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

      {/* Mobile Sticky Bottom Booking Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#d6cfc2] bg-[#faf8f4]/96 p-3 lg:hidden shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#526065]">
              From / person
            </p>
            <p className="font-serif text-lg font-semibold text-[#141c1f] tabular-nums">
              {formatRs(trip.price)}
            </p>
          </div>
          <a
            href="#book"
            className="rounded-full bg-[#0f4c54] hover:bg-[#0c3d44] transition-colors px-6 py-2.5 font-mono text-xs uppercase tracking-widest font-semibold text-white shadow-md"
          >
            Book Expedition
          </a>
        </div>
      </div>
    </div>
  );
}
