"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Eye,
  Mountain,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import type { JournalPostDTO } from "@/lib/types";
import { trackNewsletterSignup } from "@/lib/analytics";

function formatPublishedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return "";
  }
}

function getAuthorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "BH";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function BlogCoverInner({
  src,
  alt,
  category,
  readingTimeMin,
  priority = false,
}: {
  src: string;
  alt: string;
  category: string;
  readingTimeMin: number;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src.trim() || failed) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#1b3209] via-[#2b4d12] to-[#0f172a] flex flex-col items-center justify-center p-6 text-center select-none">
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.22) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <Mountain
          className="h-10 w-10 text-white/30 mb-3 transition-transform duration-700 group-hover:scale-110"
          aria-hidden="true"
        />
        <span className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wider text-white/80">
          {category}
        </span>
        <span className="mt-1 text-xs font-medium text-white/55">
          {readingTimeMin} min read
        </span>
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
    />
  );
}

function BlogCoverMedia(props: {
  src: string;
  alt: string;
  category: string;
  readingTimeMin: number;
  priority?: boolean;
}) {
  return <BlogCoverInner key={props.src} {...props} />;
}

function RevealCard({
  children,
  delayMs = 0,
  className = "",
}: {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${Math.min(delayMs, 240)}ms` }}
      className={`blog-reveal ${visible ? "blog-reveal-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

const SPO2_LEVELS = [
  {
    altitude: "1,400m · Kathmandu",
    spo2: "98% SpO₂",
    percent: 98,
    note: "Sea-level baseline · Normal lung arterial flow",
    gradient: "linear-gradient(90deg, #3f6e15, #558b1f)",
    tone: "text-[#3f6e15]",
  },
  {
    altitude: "3,440m · Namche Bazaar",
    spo2: "88% – 92% SpO₂",
    percent: 90,
    note: "Active adaptation · Compulsory acclimatization rest day",
    gradient: "linear-gradient(90deg, #3f6e15, #d97706)",
    tone: "text-[#3f6e15]",
  },
  {
    altitude: "4,410m · Dingboche",
    spo2: "80% – 85% SpO₂",
    percent: 82,
    note: "Hypobaric transition · Second acclimatization staging",
    gradient: "linear-gradient(90deg, #d97706, #f05e25)",
    tone: "text-[#c2410c]",
  },
  {
    altitude: "5,164m · Gorak Shep",
    spo2: "75% – 80% SpO₂",
    percent: 77,
    note: "Extreme threshold · Gamow bag & supplemental O₂ standby",
    gradient: "linear-gradient(90deg, #f05e25, #b91c1c)",
    tone: "text-[#b91c1c]",
  },
];

function AltitudeSpo2MeterCard() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setInView(true));
      return () => cancelAnimationFrame(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5"
    >
      <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3f6e15]">
            Field Telemetry Guide
          </span>
          <h3 className="font-heading text-2xl font-bold text-[#1c1917] mt-0.5">
            Altitude vs. O₂ Saturation
          </h3>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#3f6e15]/10 text-[#3f6e15]">
          <Activity className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <div className="space-y-3.5">
        {SPO2_LEVELS.map((row, idx) => (
          <div
            key={row.altitude}
            className="rounded-xl border border-stone-100 bg-[#f8fafc] p-3.5 space-y-2"
          >
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="font-semibold text-[#1c1917]">
                {row.altitude}
              </span>
              <span className={`font-bold tabular-nums ${row.tone}`}>
                {row.spo2}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200/80">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: inView ? `${row.percent}%` : "0%",
                  transitionDelay: `${idx * 110}ms`,
                  background: row.gradient,
                }}
              />
            </div>
            <p className="text-[11px] font-medium text-[#57534d]">{row.note}</p>
          </div>
        ))}
      </div>

      <Link
        href="/contact"
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#3f6e15] hover:bg-[#315710] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors shadow-xs"
      >
        <span>Consult Our Mountain Operations Team</span>
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

export function JournalClient({ stories }: { stories: JournalPostDTO[] }) {
  const [activeStory, setActiveStory] = useState<JournalPostDTO | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [subscribeError, setSubscribeError] = useState("");

  useEffect(() => {
    if (!activeStory) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveStory(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeStory]);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const story of stories) {
      const cat = story.category.trim() || "Field Dispatch";
      map.set(cat, (map.get(cat) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [stories]);

  const filteredStories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return stories.filter((story) => {
      if (
        selectedCategory !== "All" &&
        (story.category.trim() || "Field Dispatch") !== selectedCategory
      ) {
        return false;
      }
      if (!q) return true;
      return (
        story.title.toLowerCase().includes(q) ||
        story.subtitle.toLowerCase().includes(q) ||
        story.excerpt.toLowerCase().includes(q) ||
        story.category.toLowerCase().includes(q) ||
        story.authorName.toLowerCase().includes(q) ||
        story.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [stories, selectedCategory, searchQuery]);

  const showSpotlight =
    selectedCategory === "All" && !searchQuery.trim() && stories.length > 0;

  const featuredStory = useMemo(() => {
    if (!showSpotlight) return null;
    return stories.find((s) => s.isFeatured) ?? stories[0] ?? null;
  }, [showSpotlight, stories]);

  const gridStories = useMemo(() => {
    if (!featuredStory) return filteredStories;
    return filteredStories.filter((s) => s.id !== featuredStory.id);
  }, [filteredStories, featuredStory]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberEmail.trim()) return;
    setSubmitting(true);
    setSubscribeError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: subscriberEmail.trim(),
          source: "journal",
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setSubscribeError(json.error || "Unable to subscribe right now.");
        return;
      }
      trackNewsletterSignup("journal");
      setSubscribeSuccess(true);
      setSubscriberEmail("");
    } catch {
      setSubscribeError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#1c1917] flex flex-col w-full">
      {/* 1. Cinematic Editorial Hero */}
      <section className="relative overflow-hidden bg-[#15280d] text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/trips/hero-ama-dablam.jpg"
          alt="Himalayan peaks at golden hour"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(125deg, rgba(13,28,8,0.94) 0%, rgba(21,40,13,0.86) 52%, rgba(28,25,23,0.92) 100%)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 sm:pt-20 sm:pb-24">
          <div className="max-w-3xl space-y-5 animate-blog-fade-up">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 backdrop-blur-md px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#ff9d74]">
              <span className="h-2 w-2 rounded-full bg-[#f05e25] animate-pulse" />
              <span>Alpine Field Journal · Himalayan Dispatches</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight leading-[1.05] text-white">
              Stories, Trail Reports &amp;{" "}
              <span className="text-[#a3cf75]">Mountain Wisdom</span>
            </h1>

            <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
              Practical Himalayan route intelligence, acclimatization medicine,
              seasonal pass briefings, and unfiltered field dispatches written
              by our Kathmandu Sherpa leads and trekking guides.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs font-medium text-white/75">
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-[#a3cf75]" />
                {stories.length}{" "}
                {stories.length === 1 ? "Published Article" : "Published Articles"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#f05e25]" />
                Sherpa &amp; Expedition Lead Authored
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mountain className="h-4 w-4 text-[#a3cf75]" />
                Nepal · Tibet · Bhutan
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Floating Filter & Search Toolbar */}
      <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="rounded-2xl border border-stone-200/90 bg-white p-3.5 sm:p-4 shadow-lg shadow-stone-900/5 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === "All"
                  ? "bg-[#3f6e15] text-white shadow-xs"
                  : "bg-[#f1f5f9] text-[#475569] hover:bg-stone-200/80 hover:text-[#1c1917]"
              }`}
            >
              All ({stories.length})
            </button>
            {categoryCounts.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat.name
                    ? "bg-[#3f6e15] text-white shadow-xs"
                    : "bg-[#f1f5f9] text-[#475569] hover:bg-stone-200/80 hover:text-[#1c1917]"
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
            <a
              href="#physiology-guide"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#3f6e15]/25 bg-[#3f6e15]/[0.06] hover:bg-[#3f6e15]/12 px-3.5 py-1.5 text-xs font-semibold text-[#3f6e15] transition-colors"
            >
              <Activity className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Altitude Guide</span>
            </a>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search
              className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, trails, tags..."
              className="w-full rounded-full border border-stone-200 bg-[#f8fafc] pl-10 pr-9 py-2 text-xs sm:text-sm text-[#1c1917] placeholder:text-slate-400 focus:border-[#3f6e15] focus:bg-white focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear article search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1c1917] cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16 lg:space-y-24">
        {/* 3. Featured Cover Story Spotlight */}
        {featuredStory && (
          <section aria-label="Featured Article">
            <RevealCard>
              <article className="group relative rounded-2xl overflow-hidden bg-white border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  {/* Left Visual Column */}
                  <div className="lg:col-span-7 relative min-h-[280px] sm:min-h-[340px] lg:min-h-[450px] overflow-hidden">
                    <BlogCoverMedia
                      src={featuredStory.image}
                      alt={featuredStory.title}
                      category={featuredStory.category}
                      readingTimeMin={featuredStory.readingTimeMin}
                      priority
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15" />

                    <div className="absolute top-5 left-5 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f05e25] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                        <Sparkles className="h-3 w-3" aria-hidden="true" />
                        Featured Story
                      </span>
                      <span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-[#1c1917] shadow-xs">
                        {featuredStory.category}
                      </span>
                    </div>
                  </div>

                  {/* Right Editorial Content */}
                  <div className="lg:col-span-5 p-7 sm:p-9 lg:p-10 flex flex-col justify-between gap-6">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#57534d]">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar
                            className="h-3.5 w-3.5 text-[#3f6e15]"
                            aria-hidden="true"
                          />
                          {formatPublishedDate(featuredStory.publishedAt)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock
                            className="h-3.5 w-3.5 text-[#f05e25]"
                            aria-hidden="true"
                          />
                          {featuredStory.readingTimeMin} min read
                        </span>
                      </div>

                      <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1c1917] group-hover:text-[#3f6e15] transition-colors leading-[1.08]">
                        <Link href={`/journal/${featuredStory.slug}`}>
                          {featuredStory.title}
                        </Link>
                      </h2>

                      {featuredStory.subtitle && (
                        <p className="text-sm sm:text-base font-medium italic text-[#57534d] leading-relaxed">
                          {featuredStory.subtitle}
                        </p>
                      )}

                      <p className="text-sm text-[#57534d] leading-relaxed line-clamp-3">
                        {featuredStory.excerpt || featuredStory.description}
                      </p>

                      {featuredStory.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {featuredStory.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-[11px] font-medium text-[#475569]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-5 border-t border-stone-100 space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 rounded-full bg-[#3f6e15]/12 text-[#3f6e15] font-heading font-bold text-sm grid place-items-center">
                          {getAuthorInitials(featuredStory.authorName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#1c1917] truncate">
                            {featuredStory.authorName}
                          </p>
                          <p className="text-[11px] text-[#57534d] truncate">
                            {featuredStory.authorRole}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <Link
                          href={`/journal/${featuredStory.slug}`}
                          className="inline-flex items-center gap-2 rounded-full bg-[#3f6e15] hover:bg-[#315710] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-xs hover:shadow-md active:scale-95"
                        >
                          <span>Read Full Story</span>
                          <ArrowRight
                            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                            aria-hidden="true"
                          />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setActiveStory(featuredStory)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-[#f8fafc] hover:border-[#3f6e15]/40 hover:text-[#3f6e15] px-4 py-2.5 text-xs font-semibold text-[#1c1917] transition-colors cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Quick Preview</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </RevealCard>
          </section>
        )}

        {/* 4. Editorial Grid */}
        <section aria-label="Field Journal Articles" className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200/80 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f05e25]">
                {selectedCategory === "All" && !searchQuery.trim()
                  ? "Latest Dispatches"
                  : "Filtered Articles"}
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1c1917] mt-0.5">
                {selectedCategory === "All"
                  ? "All Field Notes & Trail Guides"
                  : `${selectedCategory} Articles`}
              </h2>
            </div>
            <p className="text-xs font-medium text-[#57534d]">
              Showing {filteredStories.length}{" "}
              {filteredStories.length === 1 ? "article" : "articles"}
            </p>
          </div>

          {filteredStories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center space-y-4">
              <p className="font-heading text-2xl font-bold text-[#1c1917]">
                No articles match your search
              </p>
              <p className="text-sm text-[#57534d] max-w-md mx-auto">
                Try another keyword or clear your category filter to view all
                Himalayan expedition journals.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[#3f6e15] hover:bg-[#315710] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
              >
                Clear Search &amp; Filters
              </button>
            </div>
          ) : gridStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {gridStories.map((story, idx) => (
                <RevealCard
                  key={story.id}
                  delayMs={(idx % 3) * 80}
                  className="h-full"
                >
                  <article
                    id={story.slug}
                    className="group h-full rounded-2xl bg-white border border-stone-200/85 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* Card Image */}
                      <Link
                        href={`/journal/${story.slug}`}
                        className="block relative aspect-[16/10] w-full overflow-hidden bg-stone-100"
                      >
                        <BlogCoverMedia
                          src={story.image}
                          alt={story.title}
                          category={story.category}
                          readingTimeMin={story.readingTimeMin}
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />

                        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                          <span className="rounded-full bg-white/92 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1c1917] shadow-xs">
                            {story.category}
                          </span>
                          <span className="rounded-full bg-[#1c1917]/75 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-white">
                            {story.readingTimeMin} min
                          </span>
                        </div>
                      </Link>

                      {/* Card Body */}
                      <div className="p-6 space-y-2.5">
                        <div className="flex items-center gap-2 text-[11px] font-medium text-[#57534d]">
                          <span>{formatPublishedDate(story.publishedAt)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{story.authorName}</span>
                        </div>

                        <h3 className="font-heading text-xl sm:text-[22px] font-bold text-[#1c1917] group-hover:text-[#3f6e15] transition-colors leading-snug line-clamp-2">
                          <Link href={`/journal/${story.slug}`}>
                            {story.title}
                          </Link>
                        </h3>

                        <p className="text-xs sm:text-sm text-[#57534d] leading-relaxed line-clamp-2">
                          {story.excerpt || story.subtitle || story.description}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-6 pb-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                      <Link
                        href={`/journal/${story.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3f6e15] group-hover:text-[#f05e25] transition-colors"
                      >
                        <span>Read Article</span>
                        <ArrowRight
                          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setActiveStory(story)}
                        className="inline-flex items-center gap-1 rounded-full bg-[#f8fafc] hover:bg-[#f1f5f9] border border-stone-200/80 px-3 py-1 text-[11px] font-semibold text-[#475569] hover:text-[#1c1917] transition-colors cursor-pointer"
                      >
                        <Eye className="h-3 w-3" aria-hidden="true" />
                        <span>Preview</span>
                      </button>
                    </div>
                  </article>
                </RevealCard>
              ))}
            </div>
          ) : null}
        </section>

        {/* 5. High Altitude Physiology & Newsletter Monograph */}
        <section
          id="physiology-guide"
          className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-10 lg:p-14 shadow-xs space-y-10"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200/80 pb-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f05e25]">
                Clinical Field Monograph
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1c1917] tracking-tight">
                High Altitude Physiology &amp; Pacing Architecture
              </h2>
              <p className="text-sm sm:text-base text-[#57534d] leading-relaxed">
                Understanding hypobaric adaptation, fluid electrolyte
                mechanics, and arterial SpO₂ profiles above 3,500 meters.
              </p>
            </div>

            <div className="flex items-center gap-3.5 shrink-0">
              <div className="text-left md:text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Authoring Officer
                </p>
                <p className="text-sm font-bold text-[#1c1917]">
                  Dr. Pemba T. Sherpa, MD
                </p>
              </div>
              <div className="h-11 w-11 rounded-full bg-[#3f6e15]/12 text-[#3f6e15] font-heading font-bold grid place-items-center">
                PS
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Essay + Protocols */}
            <div className="lg:col-span-7 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="rounded-2xl bg-[#f8fafc] border border-stone-100 p-5 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-heading text-2xl font-bold text-[#f05e25]/70 leading-none">
                      01
                    </span>
                    <h3 className="font-heading text-xl font-bold text-[#1c1917]">
                      Acclimatization Above Namche
                    </h3>
                  </div>
                  <p className="text-sm text-[#57534d] leading-relaxed">
                    Ascending too fast bypasses critical adaptation above
                    3,500m. Guides check resting heart rates each morning before
                    camp departure so gradual hematocrit adjustments keep pace
                    with elevation gain.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f8fafc] border border-stone-100 p-5 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-heading text-2xl font-bold text-[#f05e25]/70 leading-none">
                      02
                    </span>
                    <h3 className="font-heading text-xl font-bold text-[#1c1917]">
                      Fluid Dynamics &amp; Rhythm
                    </h3>
                  </div>
                  <p className="text-sm text-[#57534d] leading-relaxed">
                    Dry glacial air accelerates respiratory moisture loss.
                    Drinking four liters daily paired with a steady, unhurried
                    uphill cadence protects cellular oxygen delivery across
                    consecutive pass days.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3f6e15]">
                  Three Non-Negotiable Alpine Protocols
                </h4>

                {[
                  {
                    n: "1",
                    title:
                      "Ascend no more than 500 meters sleeping altitude above 3,000m",
                    desc: "Calculated camp-to-camp elevation gain, excluding daytime acclimatization ridge hikes.",
                  },
                  {
                    n: "2",
                    title:
                      "Build one active rest day into every 1,000m elevation band",
                    desc: "Climb high during mid-morning ridge walks and descend to sleep at your base village.",
                  },
                  {
                    n: "3",
                    title:
                      "Pair treated mountain water with balanced electrolytes daily",
                    desc: "Glacial meltwater lacks essential sodium, potassium, and magnesium salts.",
                  },
                ].map((item) => (
                  <div
                    key={item.n}
                    className="flex items-start gap-4 rounded-xl border border-stone-200/75 bg-[#faf9f7] hover:bg-white hover:border-[#3f6e15]/30 p-4 transition-all"
                  >
                    <span className="h-7 w-7 shrink-0 rounded-full bg-[#3f6e15] text-white font-heading text-sm font-bold grid place-items-center">
                      {item.n}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#1c1917]">
                        {item.title}
                      </p>
                      <p className="text-xs text-[#57534d] mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Animated SpO2 Card & Dark Newsletter Box */}
            <div className="lg:col-span-5 space-y-6">
              <AltitudeSpo2MeterCard />

              <div className="rounded-2xl bg-[#182e0b] text-white p-6 sm:p-7 space-y-4 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#a3cf75]">
                  Field Journal Dispatch
                </span>
                <h4 className="font-heading text-2xl font-bold text-white leading-tight">
                  Subscribe to Monthly Trail Chronicles
                </h4>
                <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
                  Receive Himalayan pass weather updates, trail advisories, and
                  new trekking dispatches once a month.
                </p>

                {subscribeSuccess ? (
                  <div className="rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-xs font-semibold text-[#a3cf75]">
                    ✓ You are subscribed to Brothers Field Chronicles.
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-3">
                    <input
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={subscriberEmail}
                      onChange={(e) => setSubscriberEmail(e.target.value)}
                      className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/50 focus:border-[#a3cf75] focus:bg-white/15 focus:outline-none"
                    />
                    {subscribeError && (
                      <p className="text-xs font-medium text-[#ff9d74]">
                        {subscribeError}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-full bg-[#f05e25] hover:bg-[#d94e18] py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {submitting ? "Subscribing..." : "Subscribe"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 6. Polished Quick-Preview Modal */}
      {activeStory && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeStory.title}
          onClick={() => setActiveStory(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-blog-scale-in bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto border border-stone-200"
          >
            <button
              onClick={() => setActiveStory(null)}
              type="button"
              aria-label="Close article preview"
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-[#1c1917] transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
            </button>

            <div className="pr-10 space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="rounded-full bg-[#3f6e15]/10 px-2.5 py-0.5 text-[#3f6e15]">
                  {activeStory.category}
                </span>
                <span className="text-[#57534d]">
                  {formatPublishedDate(activeStory.publishedAt)}
                </span>
                <span aria-hidden="true" className="text-stone-300">
                  ·
                </span>
                <span className="text-[#57534d]">
                  {activeStory.readingTimeMin} min read
                </span>
              </div>

              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1c1917] leading-tight">
                {activeStory.title}
              </h2>

              {activeStory.subtitle && (
                <p className="text-sm sm:text-base italic text-[#57534d]">
                  {activeStory.subtitle}
                </p>
              )}
            </div>

            {activeStory.image?.trim() && (
              <div className="h-56 sm:h-64 rounded-2xl overflow-hidden border border-stone-200">
                <BlogCoverMedia
                  src={activeStory.image}
                  alt={activeStory.title}
                  category={activeStory.category}
                  readingTimeMin={activeStory.readingTimeMin}
                />
              </div>
            )}

            <p className="text-sm sm:text-base text-[#44403c] leading-relaxed">
              {activeStory.excerpt || activeStory.description}
            </p>

            <div className="flex items-center justify-between gap-4 rounded-xl bg-[#f8fafc] border border-stone-100 p-3.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 shrink-0 rounded-full bg-[#3f6e15]/12 text-[#3f6e15] font-heading text-xs font-bold grid place-items-center">
                  {getAuthorInitials(activeStory.authorName)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1c1917] truncate">
                    {activeStory.authorName}
                  </p>
                  <p className="text-[11px] text-[#57534d] truncate">
                    {activeStory.authorRole}
                  </p>
                </div>
              </div>

              {activeStory.tags.length > 0 && (
                <div className="hidden sm:flex items-center gap-1.5">
                  {activeStory.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white border border-stone-200 px-2.5 py-0.5 text-[10px] font-medium text-[#57534d]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-100">
              <Link
                href={`/journal/${activeStory.slug}`}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#3f6e15] hover:bg-[#315710] py-3 px-6 text-xs font-bold uppercase tracking-wider text-white transition-colors shadow-xs"
              >
                <span>Open Full Article</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <button
                onClick={() => setActiveStory(null)}
                type="button"
                className="rounded-full border border-stone-200 bg-white hover:bg-stone-50 px-5 py-3 text-xs font-semibold text-[#1c1917] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
