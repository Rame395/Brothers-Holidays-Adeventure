"use client";

import Link from "next/link";
import {
  Compass,
  FileCheck,
  Stethoscope,
  Footprints,
  Flag,
  ShieldCheck,
  Radio,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

export default function ProcessPage() {
  const steps = [
    {
      num: "01",
      title: "Route Selection & Personal Fitness Intake",
      desc: "We analyze your prior trekking experience, altitude exposure, seasonal availability, and personal ambitions to recommend or tailor the ideal Himalayan route.",
      details: [
        "1-on-1 consultation with an expedition lead",
        "Personalized cardiovascular & strength prep plan",
        "Choosing between teahouse trek vs. alpine tenting",
      ],
      icon: Compass,
    },
    {
      num: "02",
      title: "Permitting, Conservation & Liaison Clearances",
      desc: "Our Kathmandu operations desk secures all mandatory documentation weeks prior to arrival with zero administrative friction for you.",
      details: [
        "TIMS (Trekkers' Information Management System) cards",
        "Sagarmatha / Annapurna / Langtang National Park permits",
        "Restricted Area Permits (Manaslu, Upper Mustang, Nar Phu)",
      ],
      icon: FileCheck,
    },
    {
      num: "03",
      title: "Kathmandu Arrival, Gear Check & Medical Protocol",
      desc: "Upon landing at Tribhuvan International Airport, you are greeted and transferred to your boutique hotel for a thorough gear inspection and medical briefing.",
      details: [
        "Down jacket, boots, crampons & sleeping bag audit",
        "Medical history & altitude medication (Diamox) review",
        "Baseline pulse oximeter check & emergency contact registry",
      ],
      icon: Stethoscope,
    },
    {
      num: "04",
      title: "Trail Execution, Acclimatization & Live Tracking",
      desc: "On the trail, every step adheres to strict altitude discipline. We hike high and sleep low with dedicated acclimatization rest stages.",
      details: [
        "Daily morning and evening SpO2 & heart rate telemetry",
        "Garmin inReach satellite tracking shared with family",
        "Freshly prepared meals and boiled drinking water",
      ],
      icon: Footprints,
    },
    {
      num: "05",
      title: "Summit Window, High Pass & Safe Return",
      desc: "Our expedition leads evaluate barometric trends to time your ascent of high passes or base camps for clear weather, optimal safety, and panoramic views.",
      details: [
        "Early dawn departure for calm atmospheric winds",
        "Full emergency helicopter evacuation underwriting",
        "Celebratory return banquet at Kathmandu HQ",
      ],
      icon: Flag,
    },
  ];

  return (
    <div className="flex flex-col w-full bg-[#071116] text-white selection:bg-[#c9a46a] selection:text-white">
      {/* ──────────────────────────────────────────────────────────
          1. PROCESS HERO SECTION
          ────────────────────────────────────────────────────────── */}
      <section className="relative w-full pt-16 sm:pt-24 pb-20 sm:pb-28 px-6 lg:px-12 overflow-hidden border-b border-[#c59a4a]/25">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/images/cta-himalaya-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071116]/80 via-[#071116]/90 to-[#071116]" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c59a4a]/50 bg-[#0c1b22]/80 backdrop-blur-md text-[#e8b765] shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c59a4a] animate-pulse" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em]">
              The Expedition Methodology
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-tight text-white">
            Precision planning,{" "}
            <em className="text-[#e8b765] font-serif not-italic">
              uncompromising safety.
            </em>
          </h1>

          <p className="text-white/75 text-base sm:text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
            From the moment you first enquire to the day you stand on the summit ridge
            and return home safely, explore our step-by-step expedition framework.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/destinations"
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#e8b765] via-[#dfa851] to-[#c59a4a] text-[#071317] font-semibold text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
            >
              Choose Your Route
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3.5 rounded-full border border-[#c59a4a]/60 bg-[#0c1b22]/70 hover:bg-[#0c1b22] text-white font-medium text-xs sm:text-sm uppercase tracking-wider backdrop-blur-md transition-all flex items-center gap-2"
            >
              Enquire For 2026/27
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          2. THE 5-STAGE CHRONOLOGY
          ────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-20 sm:py-28 px-6 lg:px-12 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-[#e8b765]">
            Stage by Stage
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal">
            The Journey From Kathmandu to the High Summits
          </h2>
        </div>

        <div className="space-y-6">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="rounded-2xl border border-white/10 bg-[#09151b]/80 p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center hover:border-[#c59a4a]/40 transition-all shadow-xl"
              >
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono text-3xl sm:text-4xl font-bold text-[#c59a4a]/40">
                    {st.num}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-[#c59a4a]/15 border border-[#c59a4a]/30 flex items-center justify-center text-[#e8b765] shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <h3 className="font-serif text-xl sm:text-2xl text-white font-normal">
                    {st.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light">
                    {st.desc}
                  </p>

                  <ul className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {st.details.map((d) => (
                      <li
                        key={d}
                        className="flex items-center gap-2 text-[11px] text-white/80 font-mono"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c59a4a]" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          3. SAFETY & EMERGENCY EVACUATION PROTOCOLS
          ────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-16 px-6 lg:px-12 bg-[#050d11] border-y border-[#c59a4a]/20">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-[#e8b765]">
              High Altitude Medicine &amp; Evacuation
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal">
              Our Safety Infrastructure
            </h2>
            <p className="text-white/60 text-sm max-w-xl mx-auto">
              We maintain direct coordination with high-altitude helicopter charter services,
              CIWEC Hospital Kathmandu, and the Himalayan Rescue Association (HRA).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-white/10 bg-[#09151b] p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#c59a4a]/15 text-[#e8b765] flex items-center justify-center">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl text-white">
                Garmin inReach Satellite Link
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Live 10-minute interval GPS breadcrumb tracking and two-way satellite
                messaging to our 24/7 Kathmandu operations desk regardless of cellular signal.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#09151b] p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#c59a4a]/15 text-[#e8b765] flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl text-white">
                Daily Medical Monitoring
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Twice-daily pulse oximetry and Lake Louise AMS scoring. Any sign of Acute
                Mountain Sickness is managed with immediate rest, hydration, or descent.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#09151b] p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#c59a4a]/15 text-[#e8b765] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl text-white">
                Heli Evacuation Underwriting
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Direct coordination with AS350 B3e high-altitude alpine helicopters. If emergency
                airlift is necessary, clearance is granted without waiting for insurance paperwork.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          4. TRANSPARENT PRICING LEDGER (INCLUDED VS EXCLUDED)
          ────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-20 px-6 lg:px-12 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-[#e8b765]">
            No Hidden Fees
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal">
            Transparent Ledger: Included vs Excluded
          </h2>
          <p className="text-white/60 text-sm max-w-xl mx-auto">
            You will never encounter unexpected permit charges, guide tips extortion,
            or surprise luggage penalties on the trail.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Included */}
          <div className="rounded-2xl border border-emerald-500/30 bg-[#091a16]/60 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-widest font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>What is always included</span>
            </div>
            <ul className="space-y-3 text-sm text-white/80">
              {[
                "Airport transfers and Kathmandu hotel accommodation (twin-share)",
                "Licensed, English-speaking Sherpa mountain guide & strong porters (1:2 ratio)",
                "All domestic flights (e.g., Lukla, Pokhara) or private 4WD ground transport",
                "All National Park, TIMS cards and Conservation Area permits",
                "Teahouse lodging & three meals a day (breakfast, lunch, dinner) while trekking",
                "First aid kit, medical oximeter and satellite communication backup",
                "Complete porter insurance, fair wages, warm clothing and gear allowance",
              ].map((inc) => (
                <li key={inc} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <span className="text-xs sm:text-sm text-white/80">{inc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Excluded */}
          <div className="rounded-2xl border border-white/15 bg-[#12161a]/60 p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-white/60 font-mono text-xs uppercase tracking-widest font-semibold">
              <XCircle className="w-5 h-5 text-white/40" />
              <span>What is excluded</span>
            </div>
            <ul className="space-y-3 text-sm text-white/65">
              {[
                "International round-trip flights to and from Kathmandu",
                "Nepal tourist entry visa ($30 for 15 days, $50 for 30 days at airport)",
                "Personal travel and emergency helicopter evacuation insurance policy",
                "Hot showers, battery device charging and Wi-Fi cards at high-altitude teahouses",
                "Personal alcoholic beverages, sodas and bottled mineral water",
                "Personal trekking equipment (boots, trekking poles, sleeping bag)",
                "Discretionary tips for guides and porters at the conclusion of the trek",
              ].map((exc) => (
                <li key={exc} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30 mt-2 shrink-0" />
                  <span className="text-xs sm:text-sm text-white/60">{exc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          5. BOTTOM CTA
          ────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-16 px-6 lg:px-12 bg-gradient-to-r from-[#0c222c] via-[#07171e] to-[#0c222c] border-t border-[#c59a4a]/30">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal">
            Take the first step onto the trail
          </h2>
          <p className="text-white/70 text-sm max-w-xl mx-auto">
            Contact our expedition lead in Kathmandu to check seasonal permit availability
            or customize an itinerary to your specific timing.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/destinations"
              className="px-7 py-3 rounded-full bg-[#c59a4a] hover:bg-[#d8ab58] text-[#071317] font-semibold text-xs uppercase tracking-wider transition-all"
            >
              Browse Destinations
            </Link>
            <Link
              href="/contact"
              className="px-7 py-3 rounded-full border border-white/25 hover:border-white text-white font-medium text-xs uppercase tracking-wider transition-all"
            >
              Contact Head Office
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
