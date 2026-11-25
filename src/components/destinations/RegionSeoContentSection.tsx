import { BookOpen } from "lucide-react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { sanitizeRichHtml } from "@/lib/html-sanitize";

export function RegionSeoContentSection({
  regionName,
  seoContent,
}: {
  regionName: string;
  seoContent?: string | null;
}) {
  const sanitized = seoContent ? sanitizeRichHtml(seoContent) : "";
  if (!sanitized || !sanitized.replace(/<[^>]+>/g, "").trim()) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
      <ScrollReveal distance={40} duration={780}>
        <article className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-10 lg:p-12 shadow-sm">
          <div className="mb-6 pb-4 border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f05e25]">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Regional Trail Guide</span>
              </p>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#1c1917] tracking-tight">
                Complete {regionName} Overview
              </h2>
            </div>
          </div>

          <div
            className="region-seo-prose max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitized }}
          />
        </article>
      </ScrollReveal>
    </section>
  );
}
