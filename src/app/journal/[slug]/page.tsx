import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Mountain,
  Tag,
} from "lucide-react";
import { FieldIcon } from "@/components/site/FieldIcon";
import { sanitizeRichHtml } from "@/lib/html-sanitize";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  ArticleReadingProgress,
  ShareArticleButton,
} from "@/components/journal/ArticleReadingTools";
import {
  getJournalPostBySlug,
  getPublishedJournalPosts,
  getSiteSettings,
} from "@/lib/data";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildJournalMetadata,
} from "@/lib/seo";

function getAuthorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "BH";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export async function generateStaticParams() {
  try {
    const posts = await getPublishedJournalPosts();
    if (posts.length === 0) return [{ slug: "__placeholder__" }];
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [{ slug: "__placeholder__" }];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [post, settings] = await Promise.all([
    getJournalPostBySlug(slug),
    getSiteSettings(),
  ]);

  if (!post) {
    return {
      title: "Dispatch Not Found",
      robots: { index: false, follow: false },
    };
  }

  return buildJournalMetadata(post, settings);
}

function renderArticleBlocks(content: string) {
  const blocks = content.split(/\n{2,}/).filter((b) => b.trim().length > 0);
  return blocks.map((block, idx) => {
    const trimmed = block.trim();
    if (trimmed.startsWith("## ")) {
      return (
        <h2
          key={idx}
          className="font-heading text-2xl sm:text-3xl font-bold text-[#1c1917] pt-5 pb-2 border-b border-stone-200"
        >
          {trimmed.replace(/^##\s+/, "")}
        </h2>
      );
    }
    if (trimmed.startsWith("### ")) {
      return (
        <h3
          key={idx}
          className="font-heading text-xl text-[#3f6e15] pt-3 font-semibold"
        >
          {trimmed.replace(/^###\s+/, "")}
        </h3>
      );
    }
    if (trimmed.startsWith("- ")) {
      const items = trimmed
        .split("\n")
        .map((line) => line.replace(/^-\s+/, "").trim());
      return (
        <ul
          key={idx}
          className="space-y-2 rounded-2xl border border-stone-200 bg-[#f8fafc] p-5 sm:p-6 text-sm sm:text-base text-[#44403c]"
        >
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#3f6e15] shrink-0" />
              <span>{item.replace(/\*\*/g, "")}</span>
            </li>
          ))}
        </ul>
      );
    }
    if (trimmed.startsWith("*") && trimmed.endsWith("*")) {
      return (
        <p
          key={idx}
          className="border-l-4 border-[#f05e25] bg-[#faf9f7] px-5 py-3.5 rounded-r-xl text-base sm:text-lg italic text-[#1c1917] leading-relaxed"
        >
          {trimmed.slice(1, -1)}
        </p>
      );
    }
    return (
      <p key={idx} className="text-base text-[#44403c] leading-relaxed">
        {trimmed}
      </p>
    );
  });
}

async function JournalArticleContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, settings, allPosts] = await Promise.all([
    getJournalPostBySlug(slug),
    getSiteSettings(),
    getPublishedJournalPosts(),
  ]);

  if (!post) {
    return (
      <div className="min-h-[70vh] bg-[#faf9f7] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-heading text-4xl font-bold text-[#1c1917]">
          Article Not Found
        </h1>
        <p className="mt-3 text-sm text-[#57534d]">
          This field journal article could not be located.
        </p>
        <Link
          href="/journal"
          className="mt-6 rounded-full bg-[#3f6e15] hover:bg-[#315710] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors"
        >
          Back to Field Journal
        </Link>
      </div>
    );
  }

  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const publishedDisplay = new Date(post.publishedAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }
  );
  const hasRichHtml = /<[a-z][\s\S]*>/i.test(post.content);

  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#1c1917] pb-20">
      <ArticleReadingProgress />
      <JsonLd data={buildArticleJsonLd(post, settings)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Field Journal", path: "/journal" },
          { name: post.title, path: `/journal/${post.slug}` },
        ])}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-10">
        {/* Top Navigation Row */}
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white hover:border-[#3f6e15]/40 px-4 py-1.5 text-xs font-semibold text-[#3f6e15] transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Field Journal</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#3f6e15]/10 border border-[#3f6e15]/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#3f6e15]">
              {post.category}
            </span>
            {post.isFeatured && (
              <span className="rounded-full bg-[#f05e25]/10 border border-[#f05e25]/25 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#f05e25]">
                Featured
              </span>
            )}
          </div>
        </div>

        {/* Article Header */}
        <header className="max-w-4xl mx-auto space-y-5 animate-blog-fade-up">
          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-[#1c1917] leading-[1.08] tracking-tight">
            {post.title}
          </h1>

          {post.subtitle && (
            <p className="text-lg sm:text-xl text-[#57534d] leading-relaxed">
              {post.subtitle}
            </p>
          )}

          {/* Author & Reading Meta Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-stone-200/90 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-[#3f6e15]/12 text-[#3f6e15] font-heading font-bold grid place-items-center">
                {getAuthorInitials(post.authorName)}
              </div>
              <div>
                <p className="text-sm font-bold text-[#1c1917]">
                  {post.authorName}
                </p>
                <p className="text-xs text-[#57534d]">{post.authorRole}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#57534d]">
              <span className="inline-flex items-center gap-1.5">
                <Calendar
                  className="h-3.5 w-3.5 text-[#3f6e15]"
                  aria-hidden="true"
                />
                {publishedDisplay}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock
                  className="h-3.5 w-3.5 text-[#f05e25]"
                  aria-hidden="true"
                />
                {post.readingTimeMin} min read
              </span>
              <ShareArticleButton title={post.title} />
            </div>
          </div>
        </header>

        {/* Optional Cover Image */}
        {post.image?.trim() && (
          <div className="max-w-5xl mx-auto overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-lg animate-blog-fade-up">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image}
              alt={post.title}
              className="w-full max-h-[480px] object-cover"
            />
          </div>
        )}

        {/* Paper Editorial Article Body */}
        <article className="max-w-4xl mx-auto rounded-2xl border border-stone-200/85 bg-white p-6 sm:p-10 lg:p-12 shadow-[0_2px_20px_-6px_rgba(28,25,23,0.06)] space-y-8">
          {post.telemetryWarning && (
            <div className="rounded-xl border border-[#f05e25]/25 bg-[#fffaf7] px-5 py-4 flex items-center gap-3.5">
              <FieldIcon
                name={post.telemetryIcon}
                fallback="warning"
                className="h-5 w-5 shrink-0 text-[#f05e25]"
              />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#f05e25] block">
                  Trail Advisory
                </span>
                <span className="text-sm text-[#1c1917] font-medium">
                  {post.telemetryWarning}
                </span>
              </div>
            </div>
          )}

          <div>
            {hasRichHtml ? (
              <div
                className="region-seo-prose"
                dangerouslySetInnerHTML={{
                  __html: sanitizeRichHtml(post.content),
                }}
              />
            ) : (
              <div className="space-y-6">{renderArticleBlocks(post.content)}</div>
            )}
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-stone-200/80">
              <Tag className="h-4 w-4 text-[#3f6e15]" aria-hidden="true" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-medium text-[#475569]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Related Stories */}
        {relatedPosts.length > 0 && (
          <section className="max-w-5xl mx-auto pt-8 border-t border-stone-200/90 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f05e25]">
                  Continue Reading
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1c1917]">
                  More Stories from the Journal
                </h2>
              </div>
              <Link
                href="/journal"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#3f6e15] hover:underline"
              >
                <span>All Articles</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/journal/${rel.slug}`}
                  className="group rounded-2xl border border-stone-200/85 bg-white overflow-hidden shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[16/10] w-full overflow-hidden bg-stone-100">
                      {rel.image?.trim() ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={rel.image}
                          alt={rel.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-[#1b3209] to-[#0f172a] grid place-items-center p-4">
                          <Mountain className="h-7 w-7 text-white/30" />
                        </div>
                      )}
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                        <span className="text-[#3f6e15]">{rel.category}</span>
                        <span className="text-[#57534d]">
                          {rel.readingTimeMin} min
                        </span>
                      </div>
                      <h3 className="font-heading text-lg font-bold text-[#1c1917] group-hover:text-[#3f6e15] transition-colors leading-snug line-clamp-2">
                        {rel.title}
                      </h3>
                      <p className="text-xs text-[#57534d] line-clamp-2 leading-relaxed">
                        {rel.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-4 pt-1 flex items-center gap-1 text-xs font-bold text-[#f05e25]">
                    <span>Read Article</span>
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function JournalArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] bg-[#faf9f7] flex items-center justify-center text-sm font-medium text-[#3f6e15]">
          Loading article...
        </div>
      }
    >
      <JournalArticleContent params={params} />
    </Suspense>
  );
}
