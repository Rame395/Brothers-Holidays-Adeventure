import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, MapPin } from "lucide-react";
import prisma from "@/lib/prisma";

export const instant = false;

export const metadata: Metadata = {
  title: "Himalayan Travel Guides & Trail Stop Wikis",
  description:
    "Explore in-depth guides for Kathmandu, Lukla, Namche Bazaar, Pokhara, and iconic Himalayan trail stops written by local expedition leads.",
};

export default async function GuidesIndexPage() {
  await connection();

  const guides = await prisma.travelGuide.findMany({
    where: { isPublished: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#1c1917] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f05e25]">
            Trail Encyclopaedia
          </p>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-[#3f6e15] tracking-tight">
            Himalayan Travel Guides
          </h1>
          <p className="text-sm sm:text-base text-[#57534d] leading-relaxed">
            Cultural insights, acclimatization advice, and local highlights for
            every key stop along our Nepal, Bhutan, and Tibet itineraries.
          </p>
        </div>

        {guides.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center space-y-3">
            <p className="text-base font-semibold text-[#1c1917]">
              New travel guides are on the way.
            </p>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 rounded-full bg-[#f05e25] hover:bg-[#d94e18] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors"
            >
              <span>Browse All Treks</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((g) => (
              <Link
                key={g.id}
                href={`/guides/${g.slug}`}
                className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xs hover:border-[#3f6e15]/35 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[16/10] w-full overflow-hidden bg-stone-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={g.heroImage || "/images/trips/kathmandu.jpg"}
                      alt={g.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5 space-y-2.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#3f6e15]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#3f6e15]">
                      <MapPin className="h-3 w-3 text-[#f05e25]" />
                      <span>{g.location}</span>
                    </span>
                    <h2 className="font-heading text-xl font-bold text-[#1c1917] group-hover:text-[#3f6e15] transition-colors leading-snug">
                      {g.title}
                    </h2>
                    {g.subtitle && (
                      <p className="text-xs sm:text-sm text-[#57534d] line-clamp-2 leading-relaxed">
                        {g.subtitle}
                      </p>
                    )}
                  </div>
                </div>
                <div className="px-5 pb-5 pt-2 flex items-center gap-1 text-xs font-bold text-[#f05e25]">
                  <span>Read Full Guide</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
