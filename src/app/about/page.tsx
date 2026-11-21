import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import {
  Compass,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/about");
}

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About Us", path: "/about" },
        ])}
      />
    <div className="flex flex-col w-full bg-[#071116] text-white selection:bg-[#c9a46a] selection:text-white">
      {/* ──────────────────────────────────────────────────────────
          1. EDITORIAL HERO SECTION
          ────────────────────────────────────────────────────────── */}
      <section className="relative w-full pt-16 sm:pt-24 pb-20 sm:pb-28 px-6 lg:px-12 overflow-hidden border-b border-[#c59a4a]/25">
        {/* Background glow & subtle mountain backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/images/cta-himalaya-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071116]/80 via-[#071116]/90 to-[#071116]" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c59a4a]/50 bg-[#0c1b22]/80 backdrop-blur-md text-[#e8b765] shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c59a4a] animate-pulse" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em]">
              Our Heritage · Est. Nepal
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-tight text-white">
            Rooted in the high passes,{" "}
            <em className="text-[#e8b765] font-serif not-italic">
              crafted for the silence.
            </em>
          </h1>

          <p className="text-white/75 text-base sm:text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
            BROTHERS Holidays Adventure was built by Himalayan mountain guides with
            a single conviction: true expeditions are small, patient, and deeply
            respectful of the mountains and the Sherpa community who call them home.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/destinations"
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#e8b765] via-[#dfa851] to-[#c59a4a] text-[#071317] font-semibold text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
            >
              Explore Our Routes
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3.5 rounded-full border border-[#c59a4a]/60 bg-[#0c1b22]/70 hover:bg-[#0c1b22] text-white font-medium text-xs sm:text-sm uppercase tracking-wider backdrop-blur-md transition-all flex items-center gap-2"
            >
              Talk With a Lead Guide
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          2. THE FOUNDATION STORY (2-COLUMN EDITORIAL)
          ────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-20 sm:py-28 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Text */}
          <div className="space-y-6">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-[#e8b765]">
              Chapter I · The Brothers Ethos
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal leading-tight">
              A refusal to turn sacred peaks into crowded tourist conveyer belts.
            </h2>
            <div className="space-y-4 text-white/75 text-sm sm:text-base leading-relaxed font-light">
              <p>
                Founded in Thamel, Kathmandu, BROTHERS Holidays Adventure grew from
                decades of high-altitude rope-fixing, high-pass guiding, and deep
                local ties across the Khumbu, Annapurna, and Manaslu valleys.
              </p>
              <p>
                While commercial mass-tourism rushed to discount safety margins, pack
                forty hikers behind a single guide, and rely on underpaid porters,
                we chose the opposite direction: strict 1:6 guide-to-guest ratios,
                generous acclimatization schedules, and complete financial transparency.
              </p>
              <p>
                When you step onto the trail with Brothers, you walk with certified
                Sherpa climbing leads who know every stone, weather pattern, and
                teahouse elder from Lukla to Kala Patthar.
              </p>
            </div>

            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-white/10">
              <div>
                <span className="font-serif text-2xl sm:text-3xl text-[#e8b765] block font-normal">
                  10+
                </span>
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-white/50">
                  Years Guiding
                </span>
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl text-[#e8b765] block font-normal">
                  100%
                </span>
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-white/50">
                  Local Crew
                </span>
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl text-[#e8b765] block font-normal">
                  8,848m
                </span>
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-white/50">
                  Summit Mastery
                </span>
              </div>
            </div>
          </div>

          {/* Right Feature Card */}
          <div className="relative rounded-2xl border border-[#c59a4a]/40 bg-[#0a171d]/90 p-8 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="w-12 h-12 rounded-xl bg-[#c59a4a]/15 border border-[#c59a4a]/30 flex items-center justify-center text-[#e8b765]">
              <Compass className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-2xl text-white font-normal">
              Our Guiding Principles
            </h3>

            <ul className="space-y-4">
              {[
                {
                  title: "100% Fair Porter & Guide Welfare",
                  desc: "Fair wages, comprehensive medical insurance, warm gear allowances, and strict 25kg porter weight limits.",
                },
                {
                  title: "Conservative Acclimatization",
                  desc: "We never compromise safety for shorter itineraries. Our stage elevations strictly observe UIAA high-altitude medical guidelines.",
                },
                {
                  title: "Leave No Trace Commitment",
                  desc: "We pack out all non-biodegradable waste, support solar teahouse power, and contribute to trail conservation initiatives.",
                },
                {
                  title: "Direct Satellite Comm & Rescue Link",
                  desc: "Every team carries Garmin inReach satellite devices and pulse oximeters, with 24/7 direct standby for helicopter evacuation.",
                },
              ].map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#c59a4a] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {item.title}
                    </h4>
                    <p className="text-xs text-white/60 leading-relaxed mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          3. CREDIBILITY & GOVERNMENT ACCREDITATIONS
          ────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-16 px-6 lg:px-12 bg-[#050d11] border-y border-[#c59a4a]/20">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-[#e8b765]">
              Full Legal Protection
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal">
              Certified &amp; Accredited By Nepal&apos;s Mountaineering Authorities
            </h2>
            <p className="text-white/60 text-sm max-w-xl mx-auto">
              Your deposits and emergency insurances are legally safeguarded by the
              Government of Nepal&apos;s Ministry of Culture, Tourism &amp; Civil Aviation.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                badge: "NTB Reg. 1509",
                org: "Nepal Tourism Board",
                desc: "Official licensed expedition operator in Nepal.",
              },
              {
                badge: "TAAN Member",
                org: "Trekking Agencies' Association",
                desc: "Strict compliance with safety and porter welfare codes.",
              },
              {
                badge: "NMA Certified",
                org: "Nepal Mountaineering Association",
                desc: "Certified for peak climbing and technical glacier routes.",
              },
              {
                badge: "Govt. Reg. 58177",
                org: "Company Registrar",
                desc: "Registered corporation with full bonded fiscal security.",
              },
            ].map((card) => (
              <div
                key={card.badge}
                className="rounded-xl border border-white/10 bg-[#09151b]/80 p-5 space-y-2.5 transition-all hover:border-[#c59a4a]/40"
              >
                <div className="inline-block px-2.5 py-1 rounded bg-[#c59a4a]/15 text-[#e8b765] font-mono text-[11px] font-semibold">
                  {card.badge}
                </div>
                <h4 className="font-serif text-base text-white">{card.org}</h4>
                <p className="text-xs text-white/55 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          4. LEADERSHIP & FIELD CREW
          ────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-20 px-6 lg:px-12 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-[#e8b765]">
            Veteran Guides
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal">
            The Men &amp; Women Leading Your Route
          </h2>
          <p className="text-white/60 text-sm max-w-xl mx-auto">
            Not subcontracted freelance guides, but dedicated, long-standing team
            members with official IFMGA/NNMGA licensing and wilderness first-responder training.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: "Pasang Dawa Sherpa",
              role: "Head of Expeditions · Everest & Manaslu",
              experience: "14 Years Guiding · 6x Sagarmatha Summits",
              quote:
                "The mountain gives you the summit only when you bring humility and correct pacing. We never rush.",
            },
            {
              name: "Tenzing Norbu Lama",
              role: "Senior Trekking Lead · Annapurna & Langtang",
              experience: "11 Years Guiding · High Pass Specialist",
              quote:
                "Every guest arrives with questions. Our role is to ensure they return with stories of a lifetime and total safety.",
            },
            {
              name: "Dawa Yangzum",
              role: "Logistics Lead & Wilderness Medic",
              experience: "9 Years Experience · Red Cross Wilderness Certified",
              quote:
                "Acclimatization is chemistry and discipline. We track oxygen saturation daily so your body adapts with ease.",
            },
          ].map((g) => (
            <div
              key={g.name}
              className="rounded-2xl border border-white/10 bg-[#09151b]/80 p-6 space-y-4 hover:border-[#c59a4a]/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[#c59a4a]/20 border border-[#c59a4a]/40 flex items-center justify-center text-[#e8b765] font-serif text-lg font-bold">
                {g.name[0]}
              </div>
              <div>
                <h3 className="font-serif text-xl text-white">{g.name}</h3>
                <p className="text-xs font-mono text-[#e8b765] mt-0.5">
                  {g.role}
                </p>
                <p className="text-[11px] text-white/50 font-mono mt-1">
                  {g.experience}
                </p>
              </div>
              <p className="text-xs text-white/70 italic leading-relaxed pt-2 border-t border-white/10">
                &ldquo;{g.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          5. CLOSING CTA BANNER
          ────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-16 px-6 lg:px-12 bg-gradient-to-r from-[#0c222c] via-[#07171e] to-[#0c222c] border-t border-[#c59a4a]/30">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal">
            Ready to plan your Himalayan journey?
          </h2>
          <p className="text-white/70 text-sm max-w-xl mx-auto">
            Whether you are targeting Everest Base Camp, the high passes of Thorong La,
            or a quiet teahouse route in Langtang, we are here to craft your bespoke ledger.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/destinations"
              className="px-7 py-3 rounded-full bg-[#c59a4a] hover:bg-[#d8ab58] text-[#071317] font-semibold text-xs uppercase tracking-wider transition-all"
            >
              Browse All Treks
            </Link>
            <Link
              href="/contact"
              className="px-7 py-3 rounded-full border border-white/25 hover:border-white text-white font-medium text-xs uppercase tracking-wider transition-all"
            >
              Contact Nepal Head Office
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
