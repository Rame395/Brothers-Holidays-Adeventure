import Link from "next/link";
import type { Metadata } from "next";
import MirrorHighRoutes from "@/components/MirrorHighRoutes";
import TopographicSurveyProfile from "@/components/home/TopographicSurveyProfile";
import { TripCard } from "@/components/destinations/TripCard";
import { Hero } from "@/components/hero/Hero";
import { HomeEnquiryForm } from "@/components/home/HomeEnquiryForm";
import { QuickDispatchForm } from "@/components/home/QuickDispatchForm";
import { getFeaturedTrips, getPublishedTrekRoutes } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Compass,
  FileCheck2,
  Mail,
  Mountain,
  ShieldCheck,
  Users,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/");
}

export default async function HomePage() {
  const [featuredTrips, trekRoutes] = await Promise.all([
    getFeaturedTrips(),
    getPublishedTrekRoutes(),
  ]);

  return (
    <div className="flex flex-col w-full relative">
      {/* SECTION 1: HIMALAYAN HERO + ANIMATED SUSPENSION BRIDGE REVEAL */}
      <Hero />

      {/* SECTION 2: TOPOGRAPHIC ACCLIMATIZATION SURVEY */}
      <section className="w-full py-16 lg:py-24 bg-[#f6f4ef] text-[#141c1f] border-b border-[#e2dcd0] content-auto">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <TopographicSurveyProfile />
        </div>
      </section>

      {/* SECTION 3: SELECTED HIGH ROUTES DIRECTORY PREVIEW */}
      <MirrorHighRoutes treks={trekRoutes} />

      {/* SECTION 3: FEATURED EXPEDITIONS (WARM ALPINE STONE) */}
      {featuredTrips.length > 0 && (
        <section className="w-full py-20 lg:py-24 bg-[#f6f4ef] text-[#141c1f] border-b border-[#e2dcd0] content-auto">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a6782e]">
                  Featured Departures
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#141c1f] tracking-tight">
                  Signature treks &amp; expeditions
                </h2>
                <p className="text-sm text-[#4a555a] leading-relaxed">
                  Itineraries paced for real acclimatization—tested across Khumbu,
                  Annapurna, Manaslu, and Mustang.
                </p>
              </div>

              <Link
                href="/destinations"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0f4c54] hover:text-[#a6782e] transition-colors shrink-0"
              >
                <span>Explore all trips</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTrips.slice(0, 6).map((trip, i) => (
                <TripCard key={trip.slug} trip={trip} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: WHO WE ARE, TRACK RECORD & DIRECT ENQUIRY */}
      <section
        id="who-we-are"
        className="w-full relative overflow-hidden py-20 lg:py-28 bg-[#faf8f4] text-[#141c1f] content-auto"
      >
        <div id="enquiry" className="absolute top-1/2 -mt-24 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 space-y-14">
          {/* Who We Are */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-5 space-y-5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-[2px] bg-[#c89b4b]" />
                <span className="text-[11px] font-semibold tracking-[0.2em] text-[#0f4c54] uppercase">
                  Kathmandu Outfitters
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl text-[#141c1f] font-normal tracking-tight leading-[1.1]">
                Built by local mountain guides, not middlemen.
              </h2>

              <p className="text-sm sm:text-base text-[#4a555a] leading-relaxed">
                From our office in Thamel, we run small-group treks and technical
                climbs with transparent NPR pricing, generous acclimatization schedules,
                and senior Sherpa leaders who know every trail.
              </p>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0f4c54] hover:text-[#a6782e] transition-colors"
                >
                  <span>Read our story</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="rounded-2xl bg-white p-6 border border-[#d6cfc2] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#f2efe8] text-[#0f4c54] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-[#141c1f]">
                  Small Groups (1–8)
                </h3>
                <p className="text-xs text-[#4a555a] leading-relaxed">
                  No crowded 25-person convoys. You hike at a natural rhythm with
                  your lead guide and assistant ratio matched to terrain.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 border border-[#d6cfc2] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#f2efe8] text-[#0f4c54] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-[#141c1f]">
                  Licensed Sherpa Team
                </h3>
                <p className="text-xs text-[#4a555a] leading-relaxed">
                  Certified NMA climbing guides and wilderness first-aid trained
                  leaders, carrying satellite comms and pulse oximeters on high passes.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 border border-[#d6cfc2] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#f2efe8] text-[#0f4c54] flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-[#141c1f]">
                  Permits Handled In-House
                </h3>
                <p className="text-xs text-[#4a555a] leading-relaxed">
                  TIMS cards, conservation entry tickets, Manaslu and Mustang RAP
                  permits, and Lukla flight coordination managed end-to-end.
                </p>
              </div>
            </div>
          </div>

          {/* Metrics Strip */}
          <div className="rounded-2xl bg-[#f2efe8] p-6 sm:p-8 border border-[#d6cfc2] grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 tabular-nums">
            <div className="space-y-1 md:pr-6 md:border-r border-[#d6cfc2]">
              <div className="font-serif text-3xl sm:text-4xl text-[#141c1f]">
                10+ Years
              </div>
              <div className="text-xs text-[#4a555a]">
                Operating from Thamel, Kathmandu
              </div>
            </div>
            <div className="space-y-1 md:pr-6 md:border-r border-[#d6cfc2]">
              <div className="font-serif text-3xl sm:text-4xl text-[#141c1f]">
                100+
              </div>
              <div className="text-xs text-[#4a555a]">
                Certified Guides &amp; Mountain Staff
              </div>
            </div>
            <div className="space-y-1 md:pr-6 md:border-r border-[#d6cfc2]">
              <div className="font-serif text-3xl sm:text-4xl text-[#141c1f]">
                5,644 m
              </div>
              <div className="text-xs text-[#4a555a]">
                Highest Trekking Viewpoint
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-serif text-3xl sm:text-4xl text-[#0f4c54]">
                1,000+
              </div>
              <div className="text-xs text-[#4a555a]">
                Safe Mountain Summits &amp; Crossings
              </div>
            </div>
          </div>

          {/* Direct Enquiry Block */}
          <div className="rounded-3xl shadow-lg overflow-hidden border border-[#d6cfc2] grid grid-cols-1 lg:grid-cols-12 bg-white">
            <div className="lg:col-span-5 bg-[#0f4c54] p-6 sm:p-10 lg:p-12 text-white flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-[#e5b96b] uppercase">
                  <Compass className="w-4 h-4" />
                  <span>Direct Trip Planning</span>
                </div>

                <h3 className="font-serif text-3xl sm:text-4xl text-white font-normal leading-tight">
                  Start planning your dates
                </h3>

                <p className="text-sm text-white/80 leading-relaxed">
                  Tell us your window and route preference. One of our trek planners
                  in Kathmandu will reply within 24 hours with a day-by-day plan and
                  exact permit breakdown.
                </p>
              </div>

              <div className="pt-6 border-t border-white/15 space-y-3.5 text-sm text-white/90">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#e5b96b] shrink-0" />
                  <span>Direct PDF itinerary &amp; transparent NPR quote</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mountain className="w-4 h-4 text-[#e5b96b] shrink-0" />
                  <span>Private departures tailored to your fitness pace</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#e5b96b] shrink-0" />
                  <span>Registered under Nepal NMA &amp; TAAN regulations</span>
                </div>
              </div>
            </div>

            <HomeEnquiryForm />
          </div>
        </div>
      </section>

      {/* SECTION 5: CLOSING CALL TO ACTION */}
      <section
        className="w-full relative overflow-hidden py-24 sm:py-32 bg-[#081318] bg-cover bg-center border-t border-white/10 content-auto"
        style={{
          backgroundImage: "url('/images/cta-himalaya-bg.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#081318]/80 via-[#081318]/65 to-[#081318]/90" />

        <div className="relative max-w-3xl mx-auto px-6 text-center space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e5b96b]">
            2026 / 2027 Trekking Seasons
          </p>

          <h2 className="font-serif text-4xl sm:text-5xl text-white font-normal tracking-tight">
            Ready to step onto the{" "}
            <span className="italic text-[#e5b96b]">trail?</span>
          </h2>

          <p className="text-white/80 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Clear NPR pricing, in-house permits, and senior Sherpa guides from
            Lukla or Pokhara back to Kathmandu.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/destinations"
              className="w-full sm:w-auto px-7 py-3 rounded-lg bg-[#c89b4b] hover:bg-[#e5b96b] text-[#081318] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Browse All Trips</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/journal"
              className="w-full sm:w-auto px-7 py-3 rounded-lg border border-white/25 bg-[#081318]/60 hover:bg-[#081318] text-white font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#e5b96b]" />
              <span>Read Field Journal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <QuickDispatchForm />
        </div>
      </section>
    </div>
  );
}
