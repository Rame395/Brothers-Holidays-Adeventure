import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Compass,
  HeartHandshake,
  Leaf,
  Mountain,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { AboutHeroParallax } from "@/components/about/AboutHeroParallax";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { ImageMaskReveal } from "@/components/motion/ImageMaskReveal";
import { ParallaxBackdrop } from "@/components/motion/ParallaxBackdrop";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/about");
}

const STATS = [
  { target: 14, suffix: "+", label: "Years Guiding" },
  { target: 35, suffix: "+", label: "Himalayan Routes" },
  { target: 4800, suffix: "+", label: "Happy Travellers" },
  { target: 100, suffix: "%", label: "Local Sherpa Crew" },
];

const WHY_CHOOSE_US = [
  {
    icon: HeartHandshake,
    title: "100% Fair Porter & Guide Welfare",
    desc: "Fair wages, comprehensive high-altitude medical insurance, warm expedition gear allowances, and strict 25kg porter load limits.",
  },
  {
    icon: Mountain,
    title: "Conservative Acclimatization",
    desc: "We never trade safety margins for faster schedules. Every stage elevation observes UIAA high-altitude medical guidelines.",
  },
  {
    icon: Leaf,
    title: "Leave No Trace Stewardship",
    desc: "We carry out all non-biodegradable waste, prioritize solar-powered teahouses, and reinvest in local Himalayan trail conservation.",
  },
  {
    icon: Radio,
    title: "Satellite Comm & Rescue Link",
    desc: "Every departure carries Garmin inReach satellite trackers and daily pulse oximeters with 24/7 Kathmandu rescue coordination.",
  },
];

const LEADERSHIP_TEAM = [
  {
    name: "Pasang Dawa Sherpa",
    role: "Head of Expeditions · Everest & Manaslu",
    experience: "14 Years Guiding · 6× Sagarmatha Summits",
    image: "/images/booking/climbers-rope-ridge.jpg",
    quote:
      "The mountain gives you the summit only when you bring humility and correct pacing. We never rush.",
  },
  {
    name: "Tenzing Norbu Lama",
    role: "Senior Trekking Lead · Annapurna & Langtang",
    experience: "11 Years Guiding · High Pass Specialist",
    image: "/images/booking-bg-hikers-ridge.jpg",
    quote:
      "Every guest arrives with questions. Our role is to ensure they return with lifelong memories and total safety.",
  },
  {
    name: "Dawa Yangzum",
    role: "Logistics Lead & Wilderness Medic",
    experience: "9 Years Experience · Wilderness Certified",
    image: "/images/booking/snow-mountain-hikers.jpg",
    quote:
      "Acclimatization is chemistry and discipline. We track oxygen saturation daily so your body adapts with ease.",
  },
];

const ACCREDITATIONS = [
  {
    badge: "NTB Reg. 1509",
    org: "Nepal Tourism Board",
    desc: "Official licensed trekking and expedition operator recognized by the Government of Nepal.",
  },
  {
    badge: "TAAN Member",
    org: "Trekking Agencies' Association",
    desc: "Strict compliance with mountain safety standards and fair porter welfare codes.",
  },
  {
    badge: "NMA Certified",
    org: "Nepal Mountaineering Association",
    desc: "Certified for trekking peaks, fixed-rope glacier crossings, and technical alpine climbs.",
  },
  {
    badge: "Govt. Reg. 58177",
    org: "Office of Company Registrar",
    desc: "Fully registered Nepali corporation with transparent accounting and fiscal security.",
  },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About Us", path: "/about" },
        ])}
      />

      <div className="flex flex-col w-full bg-white text-[#1c1917] selection:bg-[#3f6e15] selection:text-white">
        {/* 1. CINEMATIC MULTI-LAYER PARALLAX HERO */}
        <section className="relative w-full overflow-hidden">
          <AboutHeroParallax>
            <div className="pt-28 sm:pt-36 pb-28 sm:pb-36 px-5 sm:px-6 lg:px-12 max-w-5xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/25 bg-black/35 backdrop-blur-md text-white shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f05e25]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                  Our Heritage · Kathmandu, Nepal
                </span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase leading-[1.04] tracking-tight text-white drop-shadow-sm">
                Rooted in the high passes,{" "}
                <span className="text-[#ff8a50]">crafted for the silence.</span>
              </h1>

              <p className="text-white/90 text-base sm:text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed drop-shadow-xs">
                Brothers Holidays Adventure was founded by Himalayan mountain
                guides with one quiet conviction: the finest journeys move at
                the rhythm of the trail, honouring both the peaks and the Sherpa
                communities who call them home.
              </p>

              <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/destinations"
                  className="group inline-flex items-center gap-2 rounded-full bg-[#f05e25] hover:bg-[#d94e18] px-7 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all duration-300 active:scale-95"
                >
                  <span>Explore Our Routes</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 hover:bg-white hover:text-[#3f6e15] px-7 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white backdrop-blur-md transition-all duration-300"
                >
                  <span>Talk With a Lead Guide</span>
                </Link>
              </div>
            </div>
          </AboutHeroParallax>
        </section>

        {/* 2. WHO WE ARE + ANIMATED STATISTICS COUNTER */}
        <section className="relative w-full bg-white py-20 sm:py-28 lg:py-32 px-5 sm:px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <ScrollReveal delay={0} distance={28} duration={700}>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#f05e25]">
                Who We Are
              </p>
              <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3f6e15] tracking-tight leading-[1.12]">
                A refusal to turn sacred peaks into crowded conveyer belts.
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={120} distance={32} duration={800}>
              <p className="text-base sm:text-lg text-[#57534d] leading-[1.85] max-w-3xl mx-auto">
                Born in Thamel, Kathmandu from decades of rope-fixing, high-pass
                guiding, and family roots across the Khumbu, Annapurna, and
                Manaslu valleys, Brothers Holidays Adventure chooses depth over
                volume. While commercial operators compress acclimatization and
                pack crowds behind a single guide, we preserve strict 1:6
                guide-to-guest ratios, unhurried rest days, and genuine ties
                with every teahouse along the way.
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal
            delay={220}
            distance={30}
            duration={800}
            className="max-w-5xl mx-auto mt-16 sm:mt-20 pt-12 border-t border-stone-200/80"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
              {STATS.map((stat, idx) => (
                <div
                  key={stat.label}
                  className={`text-center space-y-2 ${
                    idx > 0 ? "lg:border-l lg:border-stone-200/70 lg:pl-6" : ""
                  }`}
                >
                  <div className="font-heading text-4xl sm:text-5xl font-bold text-[#3f6e15] tracking-tight">
                    <AnimatedCounter
                      target={stat.target}
                      suffix={stat.suffix}
                      duration={1500}
                    />
                  </div>
                  <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.14em] text-[#57534d]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* 3. ASYMMETRICAL MISSION & VISION EDITORIAL SPLIT */}
        <section
          id="responsible-travel"
          className="scroll-mt-28 relative w-full overflow-hidden bg-[#faf9f7] py-20 sm:py-28 lg:py-32 px-5 sm:px-6 lg:px-12 border-y border-stone-200/70"
        >
          {/* Subtle Mountain Silhouette Watermark */}
          <svg
            aria-hidden="true"
            viewBox="0 0 1200 260"
            className="pointer-events-none absolute -bottom-2 left-0 w-full max-w-none text-[#3f6e15]/[0.04]"
            fill="currentColor"
          >
            <path d="M0 260 L180 130 L340 205 L540 55 L730 175 L920 85 L1080 165 L1200 95 L1200 260 Z" />
          </svg>

          <div className="relative max-w-7xl mx-auto">
            {/* Block A: Our Mission */}
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-16">
              <div className="lg:col-span-5 space-y-5">
                <ScrollReveal delay={0} distance={34} duration={780}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f05e25]">
                    01 · Our Mission
                  </p>
                  <h2 className="mt-2 font-heading text-3xl sm:text-4xl font-bold text-[#3f6e15] tracking-tight leading-[1.12]">
                    Guiding with patience, discipline, and alpine craft.
                  </h2>
                </ScrollReveal>

                <ScrollReveal delay={120} distance={34} duration={820}>
                  <p className="text-[15.5px] sm:text-base text-[#44403c] leading-[1.8]">
                    Our mission is to craft self-paced Himalayan expeditions
                    where preparation, honest local leadership, and conservative
                    acclimatization let every traveller experience high altitude
                    with confidence—without sacrificing comfort or cultural
                    respect.
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={200} distance={28} duration={780}>
                  <div className="pt-2 border-l-2 border-[#f05e25] pl-4 space-y-1">
                    <p className="text-sm font-semibold text-[#1c1917]">
                      Certified Sherpa &amp; Tamang Leads on Every Departure
                    </p>
                    <p className="text-xs sm:text-sm text-[#57534d]">
                      Zero subcontracting—your guide is a full-time member of
                      our Kathmandu &amp; Khumbu mountaineering family.
                    </p>
                  </div>
                </ScrollReveal>
              </div>

              <div className="lg:col-span-7">
                <ImageMaskReveal
                  src="/images/everest-bridge-trek-clear.jpg"
                  alt="Trekkers crossing a high suspension bridge along the Everest trail"
                  aspectClassName="aspect-[16/10]"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  caption="Khumbu High Crossing · Dudh Koshi Gorge, Nepal"
                />
              </div>
            </div>

            {/* Block B: Our Vision */}
            <div className="mt-20 sm:mt-28 grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-16">
              <div className="lg:col-span-6 order-2 lg:order-1">
                <ImageMaskReveal
                  src="/images/booking-bg-mardi-snow-ridge.jpg"
                  alt="Snow ridge walk overlooking the Annapurna Himalaya on the Mardi Himal trail"
                  aspectClassName="aspect-[4/3]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  softBottomFade="alabaster"
                  caption="Mardi Himal High Ridge · Annapurna Sanctuary, 4,500 m"
                  delay={80}
                />
              </div>

              <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
                <ScrollReveal delay={0} distance={34} duration={780}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f05e25]">
                    02 · Our Vision
                  </p>
                  <h2 className="mt-2 font-heading text-3xl sm:text-4xl font-bold text-[#3f6e15] tracking-tight leading-[1.12]">
                    A mountain world where travel sustains the valleys it visits.
                  </h2>
                </ScrollReveal>

                <ScrollReveal delay={120} distance={34} duration={820}>
                  <p className="text-[15.5px] sm:text-base text-[#44403c] leading-[1.8]">
                    We envision Himalayan adventure tourism anchored in shared
                    prosperity—where mountain porters thrive with dignity,
                    alpine trails remain clean for future generations, and guests
                    return changed by stillness rather than hurried selfies.
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={200} distance={28} duration={780}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-200/80">
                    <div>
                      <p className="text-sm font-bold text-[#3f6e15]">
                        1:6 Ratio
                      </p>
                      <p className="text-xs text-[#57534d] mt-0.5">
                        Intimate small-group pacing
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#3f6e15]">
                        UIAA Pacing
                      </p>
                      <p className="text-xs text-[#57534d] mt-0.5">
                        Built-in acclimatization days
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#3f6e15]">
                        Direct Impact
                      </p>
                      <p className="text-xs text-[#57534d] mt-0.5">
                        Local lodges &amp; trail stewardship
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* 4. WHY CHOOSE US (STAGGERED FEATURE GRID) */}
        <section
          id="why-travel-with-us"
          className="scroll-mt-28 relative w-full bg-white py-20 sm:py-28 px-5 sm:px-6 lg:px-12"
        >
          <div className="max-w-7xl mx-auto space-y-14">
            <ScrollReveal
              delay={0}
              distance={28}
              duration={750}
              className="text-center max-w-2xl mx-auto space-y-3"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#f05e25]">
                Why Choose Us
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#3f6e15] tracking-tight">
                Built for Altitude, Guided by Integrity
              </h2>
              <p className="text-sm sm:text-base text-[#57534d] leading-relaxed">
                Every detail—from luggage weight ethics to satellite rescue
                standby—is engineered around mountain safety and human care.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {WHY_CHOOSE_US.map((item, idx) => (
                <ScrollReveal
                  key={item.title}
                  delay={idx * 100}
                  distance={34}
                  duration={760}
                >
                  <div className="group h-full rounded-2xl border border-stone-200/85 bg-[#faf9f7]/60 hover:bg-white p-6 sm:p-7 transition-all duration-300 hover:border-[#3f6e15]/30 hover:shadow-[0_12px_32px_-12px_rgba(28,25,23,0.12)] flex flex-col justify-between space-y-5">
                    <div className="space-y-4">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#3f6e15]/10 text-[#3f6e15] transition-transform duration-300 group-hover:-translate-y-1">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-heading text-xl font-bold text-[#1c1917] tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-sm text-[#57534d] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    <div className="pt-2">
                      <span className="block h-0.5 w-8 rounded-full bg-[#f05e25]/70 transition-all duration-300 group-hover:w-14 group-hover:bg-[#f05e25]" />
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* 5. MORE THAN TRAVEL (FULL-WIDTH PHOTOGRAPHIC STORYTELLING) */}
        <section className="relative w-full min-h-[480px] sm:min-h-[580px] flex items-center overflow-hidden bg-[#071116]">
          <ParallaxBackdrop
            imageSrc="/images/booking-snow-cinematic.jpg"
            imageAlt="High Himalayan ridge at golden hour"
            speed={95}
            kenBurns
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#071116]/70 via-[#071116]/50 to-[#071116]/75"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-16 bg-gradient-to-b from-white to-transparent opacity-90"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-16 bg-gradient-to-t from-white to-transparent opacity-90"
          />

          <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-6 lg:px-12 py-24 text-center space-y-6">
            <ScrollReveal delay={0} distance={32} duration={900}>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#ff8a50]">
                More Than Travel
              </p>
              <blockquote className="mt-4 font-heading text-3xl sm:text-5xl lg:text-[54px] font-bold uppercase leading-[1.08] tracking-tight text-white">
                Up there, above the treeline, strangers become rope-partners
                for life.
              </blockquote>
              <p className="mt-5 text-white/85 text-base sm:text-lg font-light max-w-2xl mx-auto leading-relaxed">
                We don&apos;t sell checklists of viewpoints. We hold space for
                shared tea around yak-dung stoves, sunrise stillness above five
                thousand meters, and the quiet brotherhood of the trail.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* 6. LEADERSHIP & FIELD CREW (IMAGE-BASED CARDS) */}
        <section
          id="our-team"
          className="scroll-mt-28 relative w-full bg-white py-20 sm:py-28 px-5 sm:px-6 lg:px-12"
        >
          <div className="max-w-7xl mx-auto space-y-14">
            <ScrollReveal
              delay={0}
              distance={28}
              duration={750}
              className="text-center max-w-2xl mx-auto space-y-3"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#f05e25]">
                Veteran Guides
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#3f6e15] tracking-tight">
                The Men &amp; Women Leading Your Route
              </h2>
              <p className="text-sm sm:text-base text-[#57534d] leading-relaxed">
                Dedicated, long-standing team members carrying official
                IFMGA/NNMGA mountaineering licenses and wilderness medical
                training.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
              {LEADERSHIP_TEAM.map((member, idx) => (
                <ScrollReveal
                  key={member.name}
                  delay={idx * 120}
                  distance={36}
                  duration={800}
                >
                  <article className="group space-y-5">
                    <ImageMaskReveal
                      src={member.image}
                      alt={`${member.name} — ${member.role}`}
                      aspectClassName="aspect-[4/3]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      delay={idx * 100}
                    />

                    <div className="space-y-2 px-1">
                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#57534d]">
                        <Compass className="h-3.5 w-3.5 text-[#f05e25]" />
                        <span>{member.experience}</span>
                      </div>
                      <h3 className="font-heading text-2xl font-bold text-[#1c1917] tracking-tight">
                        {member.name}
                      </h3>
                      <p className="text-sm font-semibold text-[#3f6e15]">
                        {member.role}
                      </p>
                      <p className="pt-2 border-t border-stone-200/80 text-sm italic text-[#57534d] leading-relaxed">
                        &ldquo;{member.quote}&rdquo;
                      </p>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* 7. CREDIBILITY & GOVERNMENT ACCREDITATIONS */}
        <section className="relative w-full bg-[#faf9f7] py-16 sm:py-24 px-5 sm:px-6 lg:px-12 border-y border-stone-200/70">
          <div className="max-w-6xl mx-auto space-y-12">
            <ScrollReveal
              delay={0}
              distance={28}
              duration={750}
              className="text-center max-w-2xl mx-auto space-y-3"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#f05e25]">
                Full Legal Protection
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#3f6e15] tracking-tight">
                Certified by Nepal&apos;s Mountaineering Authorities
              </h2>
              <p className="text-sm text-[#57534d] leading-relaxed">
                Every booking is backed by official licensing under the Ministry
                of Culture, Tourism &amp; Civil Aviation of Nepal.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {ACCREDITATIONS.map((card, idx) => (
                <ScrollReveal
                  key={card.badge}
                  delay={idx * 80}
                  distance={28}
                  duration={720}
                >
                  <div className="h-full rounded-2xl border border-stone-200/85 bg-white p-6 space-y-3 shadow-[0_2px_14px_-4px_rgba(28,25,23,0.05)] hover:border-[#3f6e15]/30 transition-colors">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-[#3f6e15]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#3f6e15]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>{card.badge}</span>
                    </div>
                    <h3 className="font-heading text-lg font-bold text-[#1c1917]">
                      {card.org}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#57534d] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <div className="text-center pt-2">
              <Link
                href="/legal-documents"
                className="inline-flex items-center gap-2 rounded-full border border-[#3f6e15]/30 bg-white hover:bg-[#3f6e15] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#3f6e15] hover:text-white transition-colors shadow-xs"
              >
                <span>View Official Legal Documents</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 8. MOUNTAIN BACKGROUND CLOSING CTA */}
        <section className="relative w-full min-h-[420px] sm:min-h-[480px] flex items-center overflow-hidden bg-[#1a2417]">
          <ParallaxBackdrop
            imageSrc="/images/booking-bg-himalaya-panoramic.jpg"
            imageAlt="Panoramic Himalayan sunrise"
            speed={75}
            kenBurns
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#faf9f7] via-[#071116]/45 to-[#071116]/80"
          />

          <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-6 lg:px-12 py-24 text-center space-y-6">
            <ScrollReveal delay={0} distance={30} duration={800}>
              <div className="rounded-3xl border border-white/25 bg-white/92 backdrop-blur-xl px-6 sm:px-12 py-10 sm:py-12 shadow-2xl space-y-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#f05e25]">
                  Begin Your Expedition
                </p>
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3f6e15] tracking-tight">
                  Ready to Walk the High Trails?
                </h2>
                <p className="text-sm sm:text-base text-[#57534d] max-w-xl mx-auto leading-relaxed">
                  Whether you have your sights on Everest Base Camp, the Thorong
                  La crossing, or a quiet teahouse ridge in Langtang, our lead
                  guides will build a thoughtful itinerary around your pace.
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/destinations"
                    className="group inline-flex items-center gap-2 rounded-full bg-[#f05e25] hover:bg-[#d94e18] px-7 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md transition-all duration-300"
                  >
                    <span>Browse All Treks</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-full bg-[#3f6e15] hover:bg-[#315710] px-7 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md transition-all duration-300"
                  >
                    <span>Contact Nepal Head Office</span>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </>
  );
}
