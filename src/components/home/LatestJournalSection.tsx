"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import type { JournalPostDTO } from "@/lib/types";

function formatPostDateUTC(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export default function LatestJournalSection({
  posts,
}: {
  posts: JournalPostDTO[];
}) {
  if (!posts || posts.length === 0) {
    return null;
  }

  const lead = posts[0];
  const sidePosts = posts.slice(1, 4);

  return (
    <section
      aria-label="Latest From the Himalayas"
      className="relative w-full bg-white py-14 sm:py-16 border-t border-[#e7e3dc]"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Centered Header Matching Homepage Sibling Sections */}
        <ScrollReveal
          distance={16}
          className="max-w-2xl mx-auto text-center space-y-2.5 mb-8 sm:mb-10"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#3f6e15]">
            Field Journal &amp; Trail Guides
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#1c1917] tracking-wide uppercase leading-tight">
            Latest From the Himalayas
          </h2>
          <p className="text-sm sm:text-[15px] text-[#57534d] leading-relaxed">
            Seasonal trail reports, acclimatisation notes, and route guides
            written by our Kathmandu expedition team.
          </p>
        </ScrollReveal>

        {/* 1 Big Featured Story + 3 Compact Side Stories */}
        <ScrollReveal distance={20} delay={60}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
            {/* Left: Large Featured Story */}
            <Link
              href={`/journal/${lead.slug}`}
              className={`group rounded-[16px] border border-[#e7e3dc] bg-white overflow-hidden flex flex-col transition-[border-color,box-shadow] duration-200 hover:border-[#cfc9be] hover:shadow-[0_14px_34px_-16px_rgba(31,27,22,0.14)] ${
                sidePosts.length > 0
                  ? "lg:col-span-7"
                  : "lg:col-span-12 max-w-4xl mx-auto w-full"
              }`}
            >
              <div className="relative h-[210px] sm:h-[250px] lg:h-[270px] w-full overflow-hidden bg-[#f5f3ef]">
                {lead.image?.trim() ? (
                  <Image
                    src={lead.image}
                    alt={lead.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    unoptimized={lead.image.startsWith("/api/uploads/")}
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#7b7266]">
                    <BookOpen className="w-10 h-10 stroke-[1.4]" />
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#7b7266] tabular-nums">
                    <span className="font-medium text-[#3f6e15]">
                      {lead.category || "Field Dispatch"}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>By {lead.authorName}</span>
                    {lead.publishedAt && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{formatPostDateUTC(lead.publishedAt)}</span>
                      </>
                    )}
                    {lead.readingTimeMin > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{lead.readingTimeMin} min read</span>
                      </>
                    )}
                  </div>

                  <h3 className="mt-2 font-sans text-lg sm:text-xl font-semibold text-[#1f1b16] tracking-[-0.01em] leading-snug group-hover:text-[#3f6e15] transition-colors duration-200">
                    {lead.title}
                  </h3>

                  {lead.excerpt && (
                    <p className="mt-1.5 font-sans text-[13.5px] text-[#5e554a] leading-relaxed line-clamp-2">
                      {lead.excerpt}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#f0ede7] flex items-center justify-between text-[13px] font-medium text-[#1f1b16] group-hover:text-[#3f6e15] transition-colors duration-200">
                  <span>Read article</span>
                  <ArrowRight className="w-4 h-4 stroke-[1.6] transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>

            {/* Right: 3 Compact Stacked Side Stories */}
            {sidePosts.length > 0 && (
              <div className="lg:col-span-5 flex flex-col gap-3.5">
                {sidePosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/journal/${post.slug}`}
                    className="group flex-1 rounded-[14px] border border-[#e7e3dc] bg-white p-3.5 flex items-center gap-3.5 transition-[border-color,box-shadow] duration-200 hover:border-[#cfc9be] hover:shadow-[0_10px_24px_-14px_rgba(31,27,22,0.12)]"
                  >
                    <div className="relative w-28 sm:w-32 h-[88px] sm:h-[96px] shrink-0 rounded-[10px] overflow-hidden bg-[#f5f3ef]">
                      {post.image?.trim() ? (
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          sizes="140px"
                          unoptimized={post.image.startsWith("/api/uploads/")}
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#7b7266]">
                          <BookOpen className="w-5 h-5 stroke-[1.5]" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#7b7266] tabular-nums">
                        <span className="font-medium text-[#3f6e15] truncate max-w-[120px]">
                          {post.category || "Journal"}
                        </span>
                        {post.publishedAt && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{formatPostDateUTC(post.publishedAt)}</span>
                          </>
                        )}
                      </div>

                      <h3 className="mt-1 font-sans text-[14.5px] font-semibold text-[#1f1b16] leading-snug line-clamp-2 group-hover:text-[#3f6e15] transition-colors duration-200">
                        {post.title}
                      </h3>

                      <div className="mt-1.5 flex items-center gap-2 text-xs text-[#5e554a]">
                        <span className="truncate">By {post.authorName}</span>
                        {post.readingTimeMin > 0 && (
                          <>
                            <span aria-hidden="true" className="text-[#7b7266]">
                              ·
                            </span>
                            <span className="shrink-0 text-[#7b7266] tabular-nums">
                              {post.readingTimeMin} min
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Centered Bottom Directory Link */}
        <div className="mt-7 flex justify-center">
          <Link
            href="/journal"
            className="group inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full border border-[#3f6e15]/25 bg-white pl-5 pr-2 py-2 text-[13px] font-semibold text-[#1c1917] shadow-[0_6px_18px_-10px_rgba(28,25,23,0.22)] transition-all duration-200 hover:border-[#3f6e15] hover:bg-[#3f6e15] hover:text-white hover:shadow-[0_12px_26px_-10px_rgba(63,110,21,0.42)] active:scale-[0.98]"
          >
            <span>View all articles</span>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#3f6e15]/10 text-[#3f6e15] transition-all duration-200 group-hover:bg-white/20 group-hover:text-white group-hover:translate-x-0.5">
              <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
