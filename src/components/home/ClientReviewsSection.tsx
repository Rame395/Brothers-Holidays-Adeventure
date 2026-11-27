"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Globe, Star } from "lucide-react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { getReviewerInitials } from "@/lib/review-utils";
import type { ReviewSource, TripReviewDTO } from "@/lib/types";

function formatReviewDateSentenceUTC(isoOrDate?: string | null): string | null {
  if (!isoOrDate) return null;
  const parsed = new Date(isoOrDate);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

function GoogleMark({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.68-.22-2.48H12v4.69h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.83Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.57.37-2.29V6.61H1.26A12 12 0 0 0 0 12c0 1.94.46 3.77 1.26 5.39l4.01-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.26 6.61l4.01 3.1C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

function TripAdvisorMark({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#34E0A1" />
      <circle cx="8.6" cy="12.5" r="2.7" fill="#FFFFFF" stroke="#000000" strokeWidth="1.2" />
      <circle cx="15.4" cy="12.5" r="2.7" fill="#FFFFFF" stroke="#000000" strokeWidth="1.2" />
      <circle cx="8.6" cy="12.5" r="1" fill="#000000" />
      <circle cx="15.4" cy="12.5" r="1" fill="#000000" />
      <path d="M10.7 13.7 12 15.6l1.3-1.9h-2.6Z" fill="#000000" />
      <path d="M6 9.3c2-.9 4-1.3 6-1.3s4 .4 6 1.3" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function SourceBadge({ source }: { source: ReviewSource }) {
  if (source === "google") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5e554a]">
        <GoogleMark className="w-4 h-4" />
        <span>Google</span>
      </span>
    );
  }
  if (source === "tripadvisor") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5e554a]">
        <TripAdvisorMark className="w-4 h-4" />
        <span>TripAdvisor</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5e554a]">
      <Globe className="w-4 h-4 text-[#3f6e15]" aria-hidden="true" />
      <span>Website</span>
    </span>
  );
}

function ReviewerAvatar({
  name,
  avatarUrl,
  verified,
}: {
  name: string;
  avatarUrl?: string | null;
  verified: boolean;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = getReviewerInitials(name);

  return (
    <div className="relative h-10 w-10 shrink-0">
      {avatarUrl && !imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={name}
          onError={() => setImgFailed(true)}
          className="h-10 w-10 rounded-full object-cover border border-[#e7e3dc] bg-[#f5f3ef]"
        />
      ) : (
        <div
          aria-label={`${name} (${initials})`}
          className="h-10 w-10 rounded-full flex items-center justify-center bg-[#1f1b16] text-white font-sans font-semibold text-xs tracking-wide select-none"
        >
          {initials}
        </div>
      )}

      {verified && (
        <span
          title="Verified trekker"
          className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#3f6e15] text-white ring-2 ring-white flex items-center justify-center"
        >
          <Check className="w-2.5 h-2.5 stroke-[2.5]" aria-hidden="true" />
        </span>
      )}
    </div>
  );
}

function ReviewCommentBody({ comment }: { comment: string }) {
  const [expanded, setExpanded] = useState(false);
  const needsClamp = comment.length > 185;
  const shownText =
    needsClamp && !expanded
      ? `${comment.slice(0, 182).trimEnd()}...`
      : comment;

  return (
    <div className="mt-2">
      <p className="font-sans text-[14px] leading-[1.65] text-[#5e554a]">
        {shownText}
      </p>
      {needsClamp && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-1.5 text-xs font-medium text-[#3f6e15] hover:underline cursor-pointer"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

export default function ClientReviewsSection({
  reviews,
}: {
  reviews: TripReviewDTO[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeSource, setActiveSource] = useState<"all" | ReviewSource>("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(reviews.length > 1);

  const sourceCounts = useMemo(() => {
    const counts = { all: reviews.length, google: 0, tripadvisor: 0, website: 0 };
    for (const r of reviews) {
      const s: ReviewSource = r.source ?? "website";
      counts[s] += 1;
    }
    return counts;
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (activeSource === "all") return reviews;
    return reviews.filter((r) => (r.source ?? "website") === activeSource);
  }, [reviews, activeSource]);

  const sourceTabs = useMemo(() => {
    const items: Array<{
      id: "all" | ReviewSource;
      label: string;
      count: number;
    }> = [{ id: "all", label: "All reviews", count: sourceCounts.all }];
    if (sourceCounts.google > 0) {
      items.push({ id: "google", label: "Google", count: sourceCounts.google });
    }
    if (sourceCounts.tripadvisor > 0) {
      items.push({
        id: "tripadvisor",
        label: "TripAdvisor",
        count: sourceCounts.tripadvisor,
      });
    }
    if (sourceCounts.website > 0) {
      items.push({
        id: "website",
        label: "Website",
        count: sourceCounts.website,
      });
    }
    return items;
  }, [sourceCounts]);

  const syncScrollControls = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, scrollWidth, clientWidth } = track;
    setCanPrev(scrollLeft > 12);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 12);

    const firstCard = track.firstElementChild as HTMLElement | null;
    const step = firstCard ? firstCard.offsetWidth + 24 : 360;
    const idx = Math.round(scrollLeft / Math.max(step, 1));
    setActiveIndex(
      Math.min(Math.max(idx, 0), Math.max(filteredReviews.length - 1, 0))
    );
  }, [filteredReviews.length]);

  useEffect(() => {
    const raf = window.requestAnimationFrame(syncScrollControls);
    window.addEventListener("resize", syncScrollControls, { passive: true });
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", syncScrollControls);
    };
  }, [syncScrollControls]);

  const handleSelectSource = (src: "all" | ReviewSource) => {
    setActiveSource(src);
    setActiveIndex(0);
    if (trackRef.current) {
      trackRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const scrollByCard = (direction: "prev" | "next") => {
    const track = trackRef.current;
    if (!track) return;
    const firstCard = track.firstElementChild as HTMLElement | null;
    const step = firstCard ? firstCard.offsetWidth + 24 : 380;
    track.scrollBy({
      left: direction === "next" ? step : -step,
      behavior: "smooth",
    });
  };

  const scrollToCard = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const target = track.children.item(index) as HTMLElement | null;
    if (!target) return;
    track.scrollTo({
      left: target.offsetLeft,
      behavior: "smooth",
    });
  };

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Traveller Reviews"
      className="relative w-full bg-[#faf9f6] py-20 sm:py-24 border-t border-[#e7e3dc]"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        {/* Centered Header Matching All Homepage Sections */}
        <ScrollReveal
          distance={16}
          className="max-w-2xl mx-auto text-center space-y-2.5 mb-8"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#3f6e15]">
            Traveller Reviews
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#1c1917] tracking-wide uppercase leading-tight">
            What Our Travellers Say
          </h2>
          <p className="text-sm sm:text-[15px] text-[#57534d] leading-relaxed">
            Verified stories from guests who trekked Nepal with our Kathmandu
            and Sherpa team across Google, TripAdvisor, and direct bookings.
          </p>
        </ScrollReveal>

        {/* Source Tab Rail + Controls */}
        <ScrollReveal distance={16} delay={40}>
          <div className="mb-8 flex items-end justify-between gap-4 border-b border-[#e7e3dc]">
            <div
              role="tablist"
              aria-label="Review platforms"
              className="flex-1 flex items-center sm:justify-center gap-6 sm:gap-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {sourceTabs.map((tab) => {
                const isActive = activeSource === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleSelectSource(tab.id)}
                    className={`relative shrink-0 inline-flex items-center gap-2 pb-3 pt-1 px-1 text-[14px] sm:text-[15px] font-sans font-medium transition-colors duration-200 cursor-pointer ${
                      isActive
                        ? "text-[#1f1b16]"
                        : "text-[#7b7266] hover:text-[#1f1b16]"
                    }`}
                  >
                    {tab.id === "google" && <GoogleMark className="w-4 h-4" />}
                    {tab.id === "tripadvisor" && (
                      <TripAdvisorMark className="w-4 h-4" />
                    )}
                    {tab.id === "website" && (
                      <Globe
                        className="w-4 h-4 text-[#3f6e15]"
                        aria-hidden="true"
                      />
                    )}
                    <span>{tab.label}</span>
                    <span className="text-xs text-[#7b7266] tabular-nums">
                      ({tab.count})
                    </span>

                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-0 -bottom-px h-[2px] transition-opacity duration-200 ${
                        isActive ? "bg-[#3f6e15] opacity-100" : "opacity-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {filteredReviews.length > 1 && (
              <div className="hidden md:flex items-center gap-2 pb-2 shrink-0">
                <button
                  type="button"
                  onClick={() => scrollByCard("prev")}
                  disabled={!canPrev}
                  aria-label="Previous reviews"
                  className="h-9 w-9 rounded-full border border-[#e7e3dc] bg-white text-[#1f1b16] shadow-[0_4px_12px_-6px_rgba(28,25,23,0.18)] flex items-center justify-center transition-all duration-200 hover:border-[#3f6e15] hover:bg-[#3f6e15] hover:text-white active:scale-95 disabled:opacity-35 disabled:hover:border-[#e7e3dc] disabled:hover:bg-white disabled:hover:text-[#1f1b16] cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[1.75]" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByCard("next")}
                  disabled={!canNext}
                  aria-label="Next reviews"
                  className="h-9 w-9 rounded-full border border-[#e7e3dc] bg-white text-[#1f1b16] shadow-[0_4px_12px_-6px_rgba(28,25,23,0.18)] flex items-center justify-center transition-all duration-200 hover:border-[#3f6e15] hover:bg-[#3f6e15] hover:text-white active:scale-95 disabled:opacity-35 disabled:hover:border-[#e7e3dc] disabled:hover:bg-white disabled:hover:text-[#1f1b16] cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4 stroke-[1.75]" />
                </button>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Clean Responsive 3-Card Review Carousel */}
        <ScrollReveal distance={20} delay={60}>
          <div
            ref={trackRef}
            onScroll={syncScrollControls}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filteredReviews.map((review) => {
              const dateLabel = formatReviewDateSentenceUTC(review.tripDate);
              const clampedRating = Math.min(Math.max(review.rating || 5, 1), 5);
              const source: ReviewSource = review.source ?? "website";

              return (
                <article
                  key={review.id}
                  className="w-[84vw] sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)] shrink-0 snap-start rounded-[14px] border border-[#e7e3dc] bg-white p-6 flex flex-col justify-between transition-[border-color,box-shadow] duration-200 hover:border-[#cfc9be] hover:shadow-[0_10px_28px_-12px_rgba(31,27,22,0.12)]"
                >
                  <div>
                    {/* Stars + Platform Source */}
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className="flex items-center gap-0.5"
                        aria-label={`${clampedRating} out of 5 stars`}
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= clampedRating
                                ? "fill-amber-400 text-amber-400"
                                : "text-stone-200"
                            }`}
                          />
                        ))}
                      </div>

                      <SourceBadge source={source} />
                    </div>

                    {/* Title + Quote + Trip Reference */}
                    <div className="mt-4">
                      {review.title && (
                        <h3 className="font-sans text-[16px] font-semibold text-[#1f1b16] leading-snug">
                          {review.title}
                        </h3>
                      )}

                      <ReviewCommentBody comment={review.comment} />

                      {review.tripName && (
                        <div className="mt-3">
                          {review.tripSlug ? (
                            <Link
                              href={`/destinations/${review.tripSlug}`}
                              className="text-xs font-medium text-[#3f6e15] hover:underline"
                            >
                              {review.tripName}
                            </Link>
                          ) : (
                            <span className="text-xs font-medium text-[#3f6e15]">
                              {review.tripName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Author Identity Row */}
                  <div className="mt-5 pt-4 border-t border-[#f0ede7] flex items-center gap-3">
                    <ReviewerAvatar
                      key={review.avatarUrl || "initials"}
                      name={review.authorName}
                      avatarUrl={review.avatarUrl}
                      verified={review.verified}
                    />
                    <div className="min-w-0">
                      <div className="font-sans text-[14px] font-semibold text-[#1f1b16] truncate">
                        {review.authorName}
                        {review.authorCountry ? (
                          <span className="font-normal text-[#5e554a]">
                            {" "}
                            · {review.authorCountry}
                          </span>
                        ) : null}
                      </div>
                      {dateLabel && (
                        <div className="text-xs text-[#7b7266] mt-0.5">
                          {dateLabel}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Mobile Controls + Quiet Pagination Dots */}
          {filteredReviews.length > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => scrollByCard("prev")}
                disabled={!canPrev}
                aria-label="Previous reviews"
                className="md:hidden h-8 w-8 rounded-full border border-[#e7e3dc] bg-white text-[#1f1b16] shadow-[0_4px_12px_-6px_rgba(28,25,23,0.18)] flex items-center justify-center transition-all duration-200 hover:border-[#3f6e15] hover:bg-[#3f6e15] hover:text-white active:scale-95 disabled:opacity-35 disabled:hover:border-[#e7e3dc] disabled:hover:bg-white disabled:hover:text-[#1f1b16] cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              <div
                className="flex items-center gap-2"
                aria-label="Review slide pagination"
              >
                {filteredReviews.map((review, idx) => (
                  <button
                    key={review.id}
                    type="button"
                    onClick={() => scrollToCard(idx)}
                    aria-label={`Scroll to review by ${review.authorName}`}
                    aria-current={activeIndex === idx ? "true" : undefined}
                    className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                      activeIndex === idx
                        ? "w-6 bg-[#3f6e15]"
                        : "w-2 bg-[#d6d1c7] hover:bg-[#9c9487]"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => scrollByCard("next")}
                disabled={!canNext}
                aria-label="Next reviews"
                className="md:hidden h-8 w-8 rounded-full border border-[#e7e3dc] bg-white text-[#1f1b16] shadow-[0_4px_12px_-6px_rgba(28,25,23,0.18)] flex items-center justify-center transition-all duration-200 hover:border-[#3f6e15] hover:bg-[#3f6e15] hover:text-white active:scale-95 disabled:opacity-35 disabled:hover:border-[#e7e3dc] disabled:hover:bg-white disabled:hover:text-[#1f1b16] cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>
            </div>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}
