"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Compass,
  Quote,
  Star,
} from "lucide-react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import {
  formatReviewDateUTC,
  getReviewerInitials,
} from "@/lib/review-utils";
import type { TripReviewDTO } from "@/lib/types";

function ReviewerAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl?: string | null;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = getReviewerInitials(name);

  if (avatarUrl && !imgFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        onError={() => setImgFailed(true)}
        className="h-12 w-12 rounded-full object-cover ring-2 ring-stone-100 shrink-0 bg-stone-100"
      />
    );
  }

  return (
    <div
      aria-label={`${name} (${initials})`}
      className="h-12 w-12 rounded-full shrink-0 flex items-center justify-center bg-[#3f6e15]/12 text-[#3f6e15] border border-[#3f6e15]/25 font-heading font-bold text-sm tracking-wide select-none"
    >
      {initials}
    </div>
  );
}

export default function ClientReviewsSection({
  reviews,
}: {
  reviews: TripReviewDTO[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(reviews.length > 1);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return "5.0";
    const total = reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const syncScrollControls = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, scrollWidth, clientWidth } = track;
    setCanPrev(scrollLeft > 12);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 12);

    const firstCard = track.firstElementChild as HTMLElement | null;
    const step = firstCard ? firstCard.offsetWidth + 20 : 360;
    const idx = Math.round(scrollLeft / Math.max(step, 1));
    setActiveIndex(Math.min(Math.max(idx, 0), Math.max(reviews.length - 1, 0)));
  }, [reviews.length]);

  useEffect(() => {
    syncScrollControls();
    window.addEventListener("resize", syncScrollControls);
    return () => window.removeEventListener("resize", syncScrollControls);
  }, [syncScrollControls]);

  const scrollByCard = (direction: "prev" | "next") => {
    const track = trackRef.current;
    if (!track) return;
    const firstCard = track.firstElementChild as HTMLElement | null;
    const step = firstCard ? firstCard.offsetWidth + 20 : 380;
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
      aria-label="Client Reviews"
      className="relative w-full overflow-hidden border-t border-stone-200/80 bg-gradient-to-b from-[#faf9f7] via-[#f7f6f2] to-white py-20 sm:py-24"
    >
      {/* Subtle ambient background accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-[#3f6e15]/[0.05] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#f05e25]/[0.04] blur-3xl"
      />

      <div className="relative max-w-[1440px] mx-auto px-6 lg:px-10">
        <ScrollReveal direction="up" distance={24}>
          {/* Editorial Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#f05e25]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f05e25]" />
                <span>Verified Trail Reviews</span>
              </div>
              <h2 className="mt-2.5 font-heading text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#1c1917] leading-[1.08]">
                What Our Travellers Say
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#57534d] leading-relaxed">
                Real reflections from international trekkers who explored Nepal&apos;s high trails with our Kathmandu operations desk and Sherpa guides.
              </p>
            </div>

            {/* Rating Summary + Arrow Controls */}
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3.5 shrink-0">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-stone-200 bg-white px-4 py-2 shadow-xs">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="font-heading text-sm font-bold text-[#1c1917]">
                  {avgRating}
                </span>
                <span className="text-xs text-stone-500">
                  ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollByCard("prev")}
                  disabled={!canPrev}
                  aria-label="Previous reviews"
                  className="h-10 w-10 rounded-full border border-stone-300 bg-white text-[#1c1917] flex items-center justify-center transition-all hover:border-[#f05e25] hover:text-[#f05e25] disabled:opacity-35 disabled:hover:border-stone-300 disabled:hover:text-[#1c1917] cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByCard("next")}
                  disabled={!canNext}
                  aria-label="Next reviews"
                  className="h-10 w-10 rounded-full border border-stone-300 bg-white text-[#1c1917] flex items-center justify-center transition-all hover:border-[#f05e25] hover:text-[#f05e25] disabled:opacity-35 disabled:hover:border-stone-300 disabled:hover:text-[#1c1917] cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Horizontal Snap Carousel Track */}
        <ScrollReveal direction="up" delay={90} distance={26}>
          <div
            ref={trackRef}
            onScroll={syncScrollControls}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {reviews.map((review) => {
              const dateLabel = formatReviewDateUTC(review.tripDate);
              const clampedRating = Math.min(Math.max(review.rating || 5, 1), 5);

              return (
                <article
                  key={review.id}
                  className="w-[86vw] sm:w-[calc((100%-20px)/2)] lg:w-[calc((100%-40px)/3)] shrink-0 snap-start rounded-[16px] border border-stone-200/90 bg-white p-6 sm:p-7 flex flex-col justify-between shadow-[0_8px_28px_-14px_rgba(28,25,23,0.08)] hover:border-[#3f6e15]/35 hover:shadow-[0_18px_38px_-16px_rgba(28,25,23,0.14)] hover:-translate-y-1 transition-all duration-300"
                >
                  <div>
                    {/* Reviewer Identity Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <ReviewerAvatar
                          key={review.avatarUrl || "initials"}
                          name={review.authorName}
                          avatarUrl={review.avatarUrl}
                        />
                        <div className="min-w-0">
                          <h3 className="font-heading text-[15px] font-bold text-[#1c1917] truncate">
                            {review.authorName}
                            {review.authorCountry ? (
                              <span className="font-sans font-medium text-stone-500">
                                , {review.authorCountry}
                              </span>
                            ) : null}
                          </h3>
                          <div
                            className="mt-1 flex items-center gap-0.5"
                            aria-label={`${clampedRating} out of 5 stars`}
                          >
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= clampedRating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-stone-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <Quote
                        aria-hidden="true"
                        className="w-6 h-6 text-stone-200 shrink-0"
                      />
                    </div>

                    {/* Date + Trip Route Tag */}
                    {(dateLabel || review.tripName) && (
                      <div className="mt-4 pt-3.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                        {review.tripName ? (
                          review.tripSlug ? (
                            <Link
                              href={`/destinations/${review.tripSlug}`}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3f6e15] hover:text-[#f05e25] transition-colors"
                            >
                              <Compass className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{review.tripName}</span>
                            </Link>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3f6e15]">
                              <Compass className="w-3.5 h-3.5 shrink-0" />
                              <span>{review.tripName}</span>
                            </span>
                          )
                        ) : (
                          <span />
                        )}

                        {dateLabel && (
                          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">
                            {dateLabel}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Review Headline & Body */}
                    {review.title && (
                      <h4 className="mt-3 font-heading text-sm font-bold text-[#1c1917]">
                        {review.title}
                      </h4>
                    )}
                    <p className="mt-2 text-sm leading-relaxed text-[#44403c]">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  </div>

                  {/* Verified Footer */}
                  <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between">
                    {review.verified ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#3f6e15]">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        Verified Trekker
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-stone-400">
                        Traveller Story
                      </span>
                    )}

                    {review.tripSlug && (
                      <Link
                        href={`/destinations/${review.tripSlug}`}
                        className="text-[11px] font-bold uppercase tracking-wider text-stone-500 hover:text-[#f05e25] transition-colors"
                      >
                        View Trek &rarr;
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination Dots */}
          {reviews.length > 1 && (
            <div
              className="mt-6 flex items-center justify-center gap-2"
              aria-label="Review slide pagination"
            >
              {reviews.map((review, idx) => (
                <button
                  key={review.id}
                  type="button"
                  onClick={() => scrollToCard(idx)}
                  aria-label={`Scroll to review by ${review.authorName}`}
                  aria-current={activeIndex === idx ? "true" : undefined}
                  className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                    activeIndex === idx
                      ? "w-7 bg-[#f05e25]"
                      : "w-2 bg-stone-300 hover:bg-stone-400"
                  }`}
                />
              ))}
            </div>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}
