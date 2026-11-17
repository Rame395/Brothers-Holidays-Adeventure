"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { TREKS } from "@/data/treks";
import AnimatedStat from "@/components/AnimatedStat";
import MirrorHighRoutes from "@/components/MirrorHighRoutes";
import { Hero } from "@/components/hero/Hero";

export default function HomePage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    route: "",
    startDate: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [quickEmail, setQuickEmail] = useState("");
  const [quickSuccess, setQuickSuccess] = useState(false);

  const scrollRoutes = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setEnquirySuccess(true);
    }, 600);
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuickSuccess(true);
    setTimeout(() => {
      setQuickSuccess(false);
      setQuickEmail("");
    }, 4000);
  };

  return (
    <div className="flex flex-col w-full relative">
      {/* SECTION 1: 3D HIMALAYAN FLIGHT HERO + TOPOGRAPHIC SURVEY PROFILE */}
      <Hero />

      {/* SECTION 2: 3D MIRROR SCREEN SELECTED HIGH ROUTES */}
      <MirrorHighRoutes />

      {/* SECTION 3: PROSE BLOCK ("Who we are" / Field Ethos & Safety) */}
      <section className="w-full py-24 lg:py-32 bg-surface" id="who-we-are">
        <div className="max-w-7xl mx-auto px-6 lg:px-margin">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Sticky Meta Aside */}
            <div className="lg:col-span-4 space-y-6">
              <div className="inline-flex items-center gap-2 text-primary font-label-md text-label-md uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Field Ethos &amp; Safety
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-normal">
                Who we are
              </h2>
              <div className="p-6 rounded-lg bg-surface-container-low space-y-4 shadow-sm border border-outline-variant/20">
                <p className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
                  Logistics Certification
                </p>
                <p className="font-headline-sm text-headline-sm text-primary font-serif">
                  Nepal Mountaineering Association #NMA-884
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Every route plan contains redundant oxygen reserves, active
                  satellite telemetry, and dedicated medical triage protocols.
                </p>
              </div>
            </div>

            {/* Narrative Content */}
            <div className="lg:col-span-8 space-y-12">
              <p className="font-display-md text-display-md text-on-surface leading-tight font-normal">
                We build quiet, sustained journeys into the high Himalaya. Every
                trek is led by certified mountain guides and backed by full
                emergency evacuation insurance.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {/* Key Highlight 1 */}
                <div className="p-6 rounded-lg bg-surface-container-lowest shadow-sm flex flex-col justify-between h-full space-y-6 border border-outline-variant/15 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[20px]">
                        payments
                      </span>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full">
                      FIXED QUOTE
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1">
                      <AnimatedStat
                        value={185000}
                        prefix="Rs. "
                        sublabel="ITEMIZED"
                        size="md"
                        colorScheme="primary"
                        duration={1400}
                      />
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-normal">
                      Transparent Ledger
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      Base trek pricing from Rs. 1,85,000 with government permits, park
                      dues, and gear logistics transparently itemized.
                    </p>
                  </div>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-tertiary font-medium">
                    All-inclusive fees
                  </span>
                </div>

                {/* Key Highlight 2 */}
                <div className="p-6 rounded-lg bg-surface-container-lowest shadow-sm flex flex-col justify-between h-full space-y-6 border border-outline-variant/15 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[20px]">
                        group
                      </span>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full">
                      SAFETY RATIO
                    </span>
                  </div>
                  <div className="space-y-2">
                    <AnimatedStat
                      isString="1:4 Ratio"
                      sublabel="IFMGA CERTIFIED"
                      size="md"
                      colorScheme="primary"
                    />
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-normal">
                      Veteran Guidance
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      Cohorts capped at 8 trekkers. Led by high-altitude
                      UIAGM/IFMGA certified Sherpa mountaineers.
                    </p>
                  </div>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-tertiary font-medium">
                    1:4 Guide-to-climber ratio
                  </span>
                </div>

                {/* Key Highlight 3 */}
                <div className="p-6 rounded-lg bg-surface-container-lowest shadow-sm flex flex-col justify-between h-full space-y-6 border border-outline-variant/15 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[20px]">
                        elevation
                      </span>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full">
                      PHYSIOLOGICAL LIMIT
                    </span>
                  </div>
                  <div className="space-y-2">
                    <AnimatedStat
                      value={400}
                      suffix="m / day"
                      sublabel="ACCLIMATIZATION"
                      size="md"
                      colorScheme="amber"
                      duration={1600}
                    />
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-normal">
                      Altitude Discipline
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      Complete topographic clarity. Strict 400m sleep-altitude gain
                      limits with mapped acclimatization rest points.
                    </p>
                  </div>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-tertiary font-medium">
                    Bio-metric oxygen tracking
                  </span>
                </div>
              </div>

              {/* Micro-stats Counter strip with animated statics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-8 rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm relative overflow-hidden">
                <div className="col-span-2 sm:col-span-4 flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                    <span className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
                      FIELD OPERATIONAL STATICS &amp; TELEMETRY
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant/70 hidden sm:inline">
                    STATION: KHUMBU / THORONG DOCK
                  </span>
                </div>

                <AnimatedStat
                  value={14}
                  label="Active High Passes"
                  sublabel="SURVEYED ROUTES"
                  barPercent={78}
                  colorScheme="primary"
                  duration={1600}
                />

                <AnimatedStat
                  value={100}
                  suffix="%"
                  label="Heli-Rescue Underwrite"
                  sublabel="100% COVERAGE"
                  barPercent={100}
                  colorScheme="primary"
                  duration={1800}
                />

                <AnimatedStat
                  value={5416}
                  suffix="m"
                  label="Highest Trail Pass"
                  sublabel="THORONG LA"
                  barPercent={92}
                  colorScheme="primary"
                  duration={2000}
                />

                <AnimatedStat
                  isString="Zero"
                  label="Single-Use Plastics"
                  sublabel="ECO ACCREDITED"
                  barPercent={100}
                  colorScheme="tertiary"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FORM ("Begin an Enquiry") */}
      <section className="w-full py-24 bg-surface" id="enquiry">
        <div className="max-w-5xl mx-auto px-6 lg:px-margin">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden border border-outline-variant/30">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Form Header & Expedition Rules */}
              <div className="lg:col-span-5 bg-primary-container p-8 lg:p-12 text-on-primary flex flex-col justify-between">
                <div className="space-y-6">
                  <span className="font-label-md text-label-md uppercase tracking-widest text-on-primary-container">
                    Field Application
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-on-primary font-normal leading-tight">
                    Begin an Enquiry
                  </h2>
                  <p className="font-body-md text-body-md text-surface-variant leading-relaxed">
                    We accept maximum 12 expeditions per calendar season to respect
                    fragile Himalayan ecosystems and guarantee top Sherpa
                    mountaineering leadership.
                  </p>
                </div>
                <div className="pt-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-primary-container text-[20px]">
                      verified
                    </span>
                    <span className="font-body-sm text-body-sm text-surface">
                      Official TIMS &amp; Park permits arranged
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-primary-container text-[20px]">
                      medical_services
                    </span>
                    <span className="font-body-sm text-body-sm text-surface">
                      Garmin InReach satellite protocol included
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-primary-container text-[20px]">
                      schedule
                    </span>
                    <span className="font-body-sm text-body-sm text-surface">
                      Initial response within 24 hours
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Form Body */}
              <div className="lg:col-span-7 p-8 lg:p-12 bg-surface-container-lowest">
                {!enquirySuccess ? (
                  <form className="space-y-6" onSubmit={handleEnquirySubmit}>
                    {/* Field 1: Route Selector */}
                    <div className="space-y-2">
                      <label
                        className="block font-label-lg text-label-lg text-on-surface font-semibold"
                        htmlFor="route-select"
                      >
                        Preferred Route
                      </label>
                      <span className="block font-body-sm text-body-sm text-on-surface-variant">
                        Select your intended trail or high pass
                      </span>
                      <div className="relative mt-2">
                        <select
                          className="w-full h-12 pl-4 pr-10 rounded-full bg-surface text-on-surface font-body-md text-body-md appearance-none focus:outline-none focus:bg-surface-container-low transition-colors cursor-pointer border border-outline-variant/30"
                          id="route-select"
                          required
                          value={formData.route}
                          onChange={(e) =>
                            setFormData({ ...formData, route: e.target.value })
                          }
                        >
                          <option disabled value="">
                            Select route...
                          </option>
                          <option value="manaslu">
                            Manaslu Circuit &amp; Larkya La (16 Days)
                          </option>
                          <option value="langtang">
                            Langtang Valley &amp; Kyanjin Ri (9 Days)
                          </option>
                          <option value="khumbu">
                            Khumbu Three Passes Traverse (18 Days)
                          </option>
                          <option value="dolpo">
                            Upper Dolpo &amp; Crystal Mountain (24 Days)
                          </option>
                          <option value="annapurna">
                            Annapurna Sanctuary Basin (11 Days)
                          </option>
                          <option value="custom">
                            Bespoke Alpine Traverse / Survey
                          </option>
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                          unfold_more
                        </span>
                      </div>
                    </div>

                    {/* Field 2: Desired Start Date */}
                    <div className="space-y-2">
                      <label
                        className="block font-label-lg text-label-lg text-on-surface font-semibold"
                        htmlFor="start-date"
                      >
                        Desired Start Window
                      </label>
                      <span className="block font-body-sm text-body-sm text-on-surface-variant">
                        Trekking runs from September through May
                      </span>
                      <div className="relative mt-2">
                        <input
                          className="w-full h-12 px-4 rounded-full bg-surface text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-low transition-colors border border-outline-variant/30"
                          id="start-date"
                          placeholder="e.g. November 2026 or Spring Season"
                          required
                          type="text"
                          value={formData.startDate}
                          onChange={(e) =>
                            setFormData({ ...formData, startDate: e.target.value })
                          }
                        />
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                          calendar_month
                        </span>
                      </div>
                    </div>

                    {/* Contact detail */}
                    <div className="space-y-2">
                      <label
                        className="block font-label-lg text-label-lg text-on-surface font-semibold"
                        htmlFor="lead-email"
                      >
                        Lead Climber Email
                      </label>
                      <input
                        className="w-full h-12 px-4 rounded-full bg-surface text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-low transition-colors border border-outline-variant/30"
                        id="lead-email"
                        placeholder="you@domain.com"
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>

                    {/* Action button */}
                    <div className="pt-4">
                      <button
                        className="w-full h-12 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg tracking-wider hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        <span>
                          {isSubmitting ? "Transmitting..." : "Send Enquiry"}
                        </span>
                        <span className="material-symbols-outlined text-[18px]">
                          send
                        </span>
                      </button>
                      <p className="font-label-sm text-label-sm text-center text-on-surface-variant/80 mt-3">
                        No immediate commitment or deposit required for
                        itinerary consultation.
                      </p>
                    </div>
                  </form>
                ) : (
                  /* Success Confirmation State */
                  <div className="py-12 flex flex-col items-center text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[32px]">
                        check_circle
                      </span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface font-serif">
                      Enquiry Dispatched
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
                      Our expedition master in Kathmandu is reviewing your
                      selected route window. We will send the full dossier to{" "}
                      <strong>{formData.email}</strong> shortly.
                    </p>
                    <button
                      className="mt-4 px-6 py-2 rounded-full bg-surface-container text-primary font-label-md text-label-md uppercase tracking-wider hover:bg-surface-variant transition-colors"
                      onClick={() => setEnquirySuccess(false)}
                      type="button"
                    >
                      Submit Another Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: CLOSING CALL TO ACTION */}
      <section className="w-full py-28 lg:py-36 bg-surface-container-low relative overflow-hidden border-t border-outline-variant/30">
        {/* Topo contour vector decoration background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
          <svg
            className="w-full h-full"
            preserveAspectRatio="none"
            viewBox="0 0 1000 400"
          >
            <path
              className="text-primary-container"
              d="M0,200 C150,120 350,280 500,160 C650,40 850,220 1000,140 L1000,400 L0,400 Z"
              fill="currentColor"
            ></path>
            <path
              className="text-primary"
              d="M0,260 C200,200 400,320 600,220 C800,120 900,280 1000,210 L1000,400 L0,400 Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto px-6 lg:px-margin text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface text-tertiary font-label-md text-label-md uppercase tracking-widest shadow-sm">
            <span className="material-symbols-outlined text-[16px]">hiking</span>
            Expedition Season 2026/27
          </div>
          <h2 className="font-display-lg text-display-lg text-on-surface font-normal tracking-tight">
            Step onto the trail
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto leading-relaxed">
            Base pricing from $1,850. Full permits and emergency insurance
            standard.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg tracking-wide hover:bg-primary transition-all shadow-md"
              href="/route/khumbu-glacier-traverse"
            >
              Plan your route
            </Link>
            <Link
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-surface-container-lowest text-on-surface font-label-lg text-label-lg tracking-wide hover:bg-surface-variant transition-colors shadow-sm"
              href="/journal"
            >
              Read the journal
            </Link>
          </div>

          {/* Quick Inquiry Email input */}
          <div className="pt-8 max-w-md mx-auto">
            {quickSuccess ? (
              <div className="p-4 rounded-full bg-primary-container text-on-primary font-body-md text-center shadow-md animate-fade-in">
                Field dispatch guide sent to {quickEmail || "your inbox"}!
              </div>
            ) : (
              <form
                className="relative flex items-center"
                onSubmit={handleQuickSubmit}
              >
                <input
                  className="w-full h-14 pl-6 pr-16 rounded-full bg-surface-container-lowest text-on-surface font-body-md text-body-md shadow-md focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
                  placeholder="you@domain.com"
                  required
                  type="email"
                  value={quickEmail}
                  onChange={(e) => setQuickEmail(e.target.value)}
                />
                <button
                  aria-label="Submit quick inquiry"
                  className="absolute right-2 w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center hover:bg-primary transition-all shadow-sm"
                  type="submit"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    arrow_forward
                  </span>
                </button>
              </form>
            )}
            <span className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant/70 mt-3">
              Instant high-resolution route maps &amp; pack lists delivered via PDF
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
