import Link from "next/link";
import type { Metadata } from "next";
import MirrorHighRoutes from "@/components/MirrorHighRoutes";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import TrekkingRegions from "@/components/home/TrekkingRegions";
import BookingProcessSection from "@/components/home/BookingProcessSection";
import { Hero } from "@/components/hero/Hero";
import { QuickDispatchForm } from "@/components/home/QuickDispatchForm";
import { AlpineBackdrop } from "@/components/site/AlpineBackdrop";
import { ParallaxBackdrop } from "@/components/motion/ParallaxBackdrop";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { HeroCloudTransition } from "@/components/motion/HeroCloudTransition";
import { getPublishedTrekRoutes } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Compass,
  HeartHandshake,
  MapPin,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/");
}

export default async function HomePage() {
  const trekRoutes = await getPublishedTrekRoutes();

  return (
    <div className="flex flex-col w-full relative">
      {/* SECTION 1: HIMALAYAN HERO + ANIMATED SUSPENSION BRIDGE REVEAL */}
      <Hero />

      {/* VOLUMETRIC SCROLL-REACTIVE CLOUD TRANSITION */}
      <HeroCloudTransition />

      {/* SECTION 2: SELECTED HIGH ROUTES DIRECTORY PREVIEW */}
      <MirrorHighRoutes treks={trekRoutes} />

      {/* SECTION 3: WHY CHOOSE US (SHERPA HERITAGE & PARALLAX MOUNTAIN) */}
      <WhyChooseUs />

      {/* SECTION 4: TREKKING REGIONS CAROUSEL */}
      <TrekkingRegions />

      {/* SECTION 5: CINEMATIC INTERLUDE: ABOVE THE CLOUDS */}
      <section className="relative w-full overflow-hidden bg-white h-[44vw] min-h-[360px] max-h-[560px] flex items-center justify-center">
        <AlpineBackdrop
          imageSrc="/images/trips/hero-ama-dablam.jpg"
          imageAlt="Ama Dablam rising above Himalayan cloud sea"
          variant="cinematic"
          objectPosition="object-top"
          showMistWave
          showStarGrain
        />
        <ScrollReveal
          direction="scale"
          distance={44}
          className="relative z-20 max-w-4xl mx-auto px-6 text-center space-y-3"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7dd3fc] drop-shadow-sm">
            27°51′N · 86°51′E · HIGH HIMALAYA
          </p>
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-white font-bold tracking-wide leading-tight drop-shadow-[0_4px_24px_rgba(7,21,38,0.65)]">
            “Beyond the valleys, where the trail rises above the clouds.”
          </h2>
        </ScrollReveal>
      </section>

      {/* SECTION 6: WHO WE ARE, TRACK RECORD & DIRECT ENQUIRY */}
      <section
        id="who-we-are"
        className="w-full relative overflow-hidden py-20 lg:py-28 bg-white text-[#1c1917] border-t border-slate-100"
      >

        <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-10 space-y-14">
          {/* Who We Are */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <ScrollReveal direction="left" className="lg:col-span-5 space-y-5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-[2px] bg-[#f05e25]" />
                <span className="text-[11px] font-semibold tracking-[0.2em] text-[#3f6e15] uppercase">
                  Kathmandu Outfitters
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl text-[#1c1917] font-semibold tracking-tight leading-[1.1]">
                Built by local mountain guides, not middlemen.
              </h2>

              <p className="text-sm sm:text-base text-[#57534d] leading-relaxed">
                From our office in Thamel, we run small-group treks and technical
                climbs with transparent USD pricing, generous acclimatization schedules,
                and senior Sherpa leaders who know every trail.
              </p>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#3f6e15] hover:text-[#f05e25] transition-colors"
                >
                  <span>Read our story</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </ScrollReveal>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <ScrollReveal delay={0} distance={56} className="h-full">
                <div className="h-full rounded-2xl bg-white/95 p-6 border border-slate-200/80 shadow-sm hover:-translate-y-1.5 hover:shadow-lg hover:border-[#f05e25]/30 transition-all duration-300 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] text-[#3f6e15] flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#1c1917]">
                    Thamel Base HQ &amp; Gear
                  </h3>
                  <p className="text-xs text-[#57534d] leading-relaxed">
                    In-person route briefings, complimentary down gear check, and
                    calibrated pulse oximeter assignment before you fly to the trail.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={140} distance={56} className="h-full">
                <div className="h-full rounded-2xl bg-white/95 p-6 border border-slate-200/80 shadow-sm hover:-translate-y-1.5 hover:shadow-lg hover:border-[#f05e25]/30 transition-all duration-300 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] text-[#3f6e15] flex items-center justify-center">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#1c1917]">
                    Flight &amp; Weather Desk
                  </h3>
                  <p className="text-xs text-[#57534d] leading-relaxed">
                    Live satellite weather monitoring and priority domestic flight
                    coordination to minimize weather delays across Lukla and Pokhara.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={280} distance={56} className="h-full">
                <div className="h-full rounded-2xl bg-white/95 p-6 border border-slate-200/80 shadow-sm hover:-translate-y-1.5 hover:shadow-lg hover:border-[#f05e25]/30 transition-all duration-300 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] text-[#3f6e15] flex items-center justify-center">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#1c1917]">
                    Ethical Porter Welfare
                  </h3>
                  <p className="text-xs text-[#57534d] leading-relaxed">
                    Strict IPPG compliance—guaranteed fair living wages, warm alpine
                    gear, medical emergency cover, and 20 kg load maximums.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Metrics Strip */}
          <ScrollReveal delay={100}>
            <div className="rounded-2xl bg-white/95 p-6 sm:p-8 border border-slate-200/80 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 tabular-nums">
              <div className="space-y-1 md:pr-6 md:border-r border-slate-200">
                <div className="font-serif text-3xl sm:text-4xl font-bold text-[#1c1917]">
                  <AnimatedCounter target={10} suffix="+ Years" />
                </div>
                <div className="text-xs text-[#57534d]">
                  Operating from Thamel, Kathmandu
                </div>
              </div>
              <div className="space-y-1 md:pr-6 md:border-r border-slate-200">
                <div className="font-serif text-3xl sm:text-4xl font-bold text-[#1c1917]">
                  <AnimatedCounter target={100} suffix="+" />
                </div>
                <div className="text-xs text-[#57534d]">
                  Certified Guides &amp; Mountain Staff
                </div>
              </div>
              <div className="space-y-1 md:pr-6 md:border-r border-slate-200">
                <div className="font-serif text-3xl sm:text-4xl font-bold text-[#1c1917]">
                  <AnimatedCounter target={5644} suffix=" m" />
                </div>
                <div className="text-xs text-[#57534d]">
                  Highest Trekking Viewpoint
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-serif text-3xl sm:text-4xl font-bold text-[#3f6e15]">
                  <AnimatedCounter target={1000} suffix="+" />
                </div>
                <div className="text-xs text-[#57534d]">
                  Safe Mountain Summits &amp; Crossings
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* SECTION 7: HOW BOOKING WORKS (SIMPLE 4-STEP EXPEDITION PROCESS) */}
      <BookingProcessSection />

      {/* SECTION 8: CLOSING CALL TO ACTION */}
      <section className="w-full relative overflow-hidden py-24 sm:py-32 bg-[#071526] border-t border-white/10">
        <ParallaxBackdrop
          imageSrc="/images/cta-himalaya-bg.jpg"
          imageAlt="Himalayan peaks at twilight"
          speed={115}
          kenBurns
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#071526]/80 via-[#071526]/65 to-[#071526]/90" />
        <div
          aria-hidden="true"
          className="absolute -top-px inset-x-0 h-16 sm:h-24 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,0.55) 35%, transparent 100%)",
          }}
        />

        <div className="relative z-20 max-w-3xl mx-auto px-6 text-center space-y-6">
          <ScrollReveal direction="up" distance={52} className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7dd3fc]">
              2026 / 2027 Trekking Seasons
            </p>

            <h2 className="font-serif text-4xl sm:text-5xl text-white font-normal tracking-tight">
              Ready to step onto the{" "}
              <span className="italic text-[#ff7a45]">trail?</span>
            </h2>

            <p className="text-white/80 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Clear USD pricing, in-house permits, and senior Sherpa guides from
              Lukla or Pokhara back to Kathmandu.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/destinations"
                className="w-full sm:w-auto px-7 py-3 rounded-lg bg-[#f05e25] hover:bg-[#ff7a45] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Browse All Trips</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/journal"
                className="w-full sm:w-auto px-7 py-3 rounded-lg border border-white/25 bg-[#071526]/60 hover:bg-[#071526] text-white font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-[#7dd3fc]" />
                <span>Read Field Journal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>

          <QuickDispatchForm />
        </div>
      </section>
    </div>
  );
}
