import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowLeft, Calendar, Clock, Mountain, Tag } from "lucide-react";
import { FieldIcon } from "@/components/site/FieldIcon";
import { JsonLd } from "@/components/seo/JsonLd";
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

export async function generateStaticParams() {
  const posts = await getPublishedJournalPosts();
  return posts.map((post) => ({ slug: post.slug }));
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
          className="font-serif text-2xl sm:text-3xl text-on-surface pt-4"
        >
          {trimmed.replace(/^##\s+/, "")}
        </h2>
      );
    }
    if (trimmed.startsWith("### ")) {
      return (
        <h3
          key={idx}
          className="font-headline-sm text-xl text-primary pt-3 font-medium"
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
          className="space-y-2 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 text-sm sm:text-base text-on-surface-variant"
        >
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
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
          className="font-serif text-lg sm:text-xl italic text-primary/90 leading-relaxed"
        >
          {trimmed.slice(1, -1)}
        </p>
      );
    }
    return (
      <p
        key={idx}
        className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed"
      >
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-4xl text-on-surface">
          Dispatch Not Found
        </h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          This field journal article could not be located.
        </p>
        <Link
          href="/journal"
          className="mt-6 rounded-full bg-primary-container px-6 py-2.5 font-label-md uppercase tracking-wider text-on-primary"
        >
          Back to Field Journal
        </Link>
      </div>
    );
  }

  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2);
  const publishedDisplay = new Date(post.publishedAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <>
      <JsonLd data={buildArticleJsonLd(post, settings)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Field Journal", path: "/journal" },
          { name: post.title, path: `/journal/${post.slug}` },
        ])}
      />

      <article className="max-w-5xl mx-auto px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 font-label-md uppercase tracking-wider text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Field Journal</span>
          </Link>
          <span className="px-3 py-1 rounded-full bg-surface-container text-primary font-label-sm uppercase tracking-widest font-semibold">
            {post.dispatchNo} · {post.badge}
          </span>
        </div>

        <header className="space-y-5">
          <h1 className="font-display-lg text-4xl sm:text-5xl text-on-surface leading-tight tracking-tight">
            {post.title}
          </h1>
          <p className="font-serif text-xl sm:text-2xl italic text-on-surface-variant">
            {post.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-5 pt-2 text-xs font-mono text-on-surface-variant border-y border-outline-variant/30 py-3">
            <span>
              By <strong className="text-on-surface">{post.authorName}</strong>{" "}
              ({post.authorRole})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              {publishedDisplay}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              {post.readingTimeMin} min read
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mountain className="h-3.5 w-3.5 text-tertiary" />
              {post.metricLabel}: {post.metricValue}
            </span>
          </div>
        </header>

        <div className="relative h-72 sm:h-[420px] rounded-3xl overflow-hidden border border-outline-variant/30 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {post.telemetryWarning && (
          <div className="rounded-2xl border border-tertiary/30 bg-surface-container-low px-5 py-4 flex items-center gap-3">
            <FieldIcon
              name={post.telemetryIcon}
              fallback="warning"
              className="h-5 w-5 shrink-0 text-tertiary"
            />
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-tertiary block font-semibold">
                Field Telemetry Advisory
              </span>
              <span className="text-sm text-on-surface font-medium">
                {post.telemetryWarning}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-6">{renderArticleBlocks(post.content)}</div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-surface-container border border-outline-variant/30">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant block">
              Duration
            </span>
            <strong className="font-serif text-xl text-on-surface">
              {post.duration}
            </strong>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant block">
              {post.metricLabel}
            </span>
            <strong className="font-serif text-xl text-on-surface">
              {post.metricValue}
            </strong>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant block">
              Estimated Tariff
            </span>
            <strong className="font-serif text-xl text-primary">
              {post.tariff}
            </strong>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant block">
              Logistics
            </span>
            <strong className="text-xs sm:text-sm text-on-surface">
              {post.logisticsBadge}
            </strong>
          </div>
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Tag className="h-4 w-4 text-primary" />
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-surface-container text-xs font-mono text-on-surface-variant"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {relatedPosts.length > 0 && (
          <section className="pt-10 border-t border-outline-variant/30 space-y-6">
            <h2 className="font-serif text-2xl sm:text-3xl text-on-surface">
              More Field Dispatches
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/journal/${rel.slug}`}
                  className="group rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 hover:shadow-md transition-all space-y-2"
                >
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-semibold">
                    {rel.dispatchNo} · {rel.badge}
                  </span>
                  <h3 className="font-serif text-xl text-on-surface group-hover:text-primary transition-colors">
                    {rel.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant line-clamp-2">
                    {rel.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
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
        <div className="min-h-[60vh] flex items-center justify-center font-mono text-sm text-primary">
          Loading Dispatch...
        </div>
      }
    >
      <JournalArticleContent params={params} />
    </Suspense>
  );
}
