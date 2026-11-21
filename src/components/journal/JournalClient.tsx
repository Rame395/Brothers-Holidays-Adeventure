"use client";

import Link from "next/link";
import { useState } from "react";
import { Activity, ArrowRight, Star, X } from "lucide-react";
import type { JournalPostDTO } from "@/lib/types";
import { trackNewsletterSignup } from "@/lib/analytics";
import { FieldIcon } from "@/components/site/FieldIcon";

export function JournalClient({ stories }: { stories: JournalPostDTO[] }) {
  const [activeStory, setActiveStory] = useState<JournalPostDTO | null>(null);
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [subscribeError, setSubscribeError] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberEmail.trim()) return;
    setSubmitting(true);
    setSubscribeError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: subscriberEmail.trim(),
          source: "journal",
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setSubscribeError(json.error || "Unable to subscribe right now.");
        return;
      }
      trackNewsletterSignup("journal");
      setSubscribeSuccess(true);
      setSubscriberEmail("");
    } catch {
      setSubscribeError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto w-full px-6 lg:px-margin py-12 md:py-16 space-y-20 lg:space-y-28">
        {/* Header Section with Monospace Journal Metadata */}
        <header className="space-y-6 max-w-4xl">
          <div className="flex items-center gap-3 text-tertiary">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span>
            <span className="font-label-md text-label-md uppercase tracking-widest font-semibold">
              Tome IV · Dispatch Registry
            </span>
            <span className="text-outline-variant">/</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Vol. 2026 // Solu-Khumbu &amp; Barun Range
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="font-display-lg text-display-lg text-on-surface leading-tight tracking-tight">
              Alpine Field Journal{" "}
              <span className="font-display-md text-display-md italic text-primary">
                &amp; Expedition Notes
              </span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Unfiltered chronicles from high-altitude waypoints, meteorological
              logs, and physiological field observations prepared by seasoned
              Sherpa leads and mountain medics.
            </p>
          </div>

          {/* Quick Index Ribbon */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant/70 mr-2">
              Dispatches:
            </span>
            {stories.map((story, idx) => (
              <a
                key={story.slug}
                className="px-3.5 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors font-label-sm text-label-sm text-primary font-medium"
                href={`#${story.slug}`}
              >
                {String(idx + 1).padStart(2, "0")}. {story.title.split(" ")[0]}
              </a>
            ))}
            <a
              className="px-3.5 py-1.5 rounded-full bg-secondary-container/60 hover:bg-secondary-container transition-colors font-label-sm text-label-sm text-on-secondary-container font-medium flex items-center gap-1.5"
              href="#physiology-guide"
            >
              <Activity className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Physiology Guide
            </a>
          </div>
        </header>

        {/* Editorial Feed */}
        <section
          aria-label="Field Journal Stories"
          className="space-y-12 lg:space-y-16"
        >
          {stories.map((story) => (
            <article
              key={story.id}
              className="group relative rounded-xl bg-surface-container-lowest overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-outline-variant/30"
              id={story.slug}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
                {/* Visual Pane */}
                <div
                  className={`lg:col-span-7 relative min-h-[320px] lg:min-h-full overflow-hidden ${
                    story.mirrored ? "lg:order-2" : ""
                  }`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                    style={{ backgroundImage: `url('${story.image}')` }}
                  ></div>
                  <div
                    className={`absolute inset-0 ${
                      story.mirrored
                        ? "bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/20 to-transparent lg:bg-gradient-to-l lg:from-transparent lg:via-surface-container-lowest/10 lg:to-surface-container-lowest"
                        : "bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-surface-container-lowest/10 lg:to-surface-container-lowest"
                    }`}
                  ></div>

                  <div
                    className={`absolute top-5 flex items-center gap-2 ${
                      story.mirrored ? "right-5" : "left-5"
                    }`}
                  >
                    <span className="px-3 py-1 rounded-full bg-surface-container-highest/90 backdrop-blur-md text-on-surface font-label-md text-label-md uppercase tracking-wider font-semibold shadow-sm">
                      {story.badge}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-primary-container/85 backdrop-blur-md text-on-primary font-label-sm text-label-sm tracking-wider">
                      {story.metricValue}
                    </span>
                  </div>

                  {story.telemetryWarning && (
                    <div
                      className={`absolute bottom-5 hidden sm:flex items-center gap-3 bg-surface-container-lowest/85 backdrop-blur-md px-3.5 py-1.5 rounded-full text-on-surface-variant font-label-sm text-label-sm ${
                        story.mirrored ? "right-5" : "left-5"
                      }`}
                    >
                      <FieldIcon
                        name={story.telemetryIcon}
                        fallback="warning"
                        className="h-4 w-4 shrink-0 text-tertiary"
                      />
                      {story.telemetryWarning}
                    </div>
                  )}
                </div>

                {/* Editorial Content Pane */}
                <div
                  className={`lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between space-y-6 ${
                    story.mirrored ? "lg:order-1" : ""
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>{" "}
                        {story.dispatchNo}
                      </span>
                      <div className="flex items-center gap-1 text-on-surface font-label-md text-label-md">
                        <Star
                          className="h-4 w-4 shrink-0 text-tertiary fill-current"
                          aria-hidden="true"
                        />
                        <span className="font-semibold">{story.rating}</span>
                        <span className="text-on-surface-variant/70 font-normal">
                          ({story.ratingCount})
                        </span>
                      </div>
                    </div>

                    <h2 className="font-display-md text-display-md text-on-surface group-hover:text-primary transition-colors">
                      <Link href={`/journal/${story.slug}`}>{story.title}</Link>
                    </h2>
                    <p className="font-headline-sm text-headline-sm text-on-surface-variant/90 italic font-normal">
                      {story.subtitle}
                    </p>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      {story.description}
                    </p>
                  </div>

                  {/* Technical Logistics Row & CTA */}
                  <div className="pt-6 space-y-6 bg-surface-container-low/40 rounded-lg p-5 border border-outline-variant/15">
                    <div className="grid grid-cols-3 gap-2 text-left">
                      <div>
                        <div className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant/70">
                          Duration
                        </div>
                        <div className="font-headline-sm text-headline-sm text-on-surface font-normal mt-0.5">
                          {story.duration}
                        </div>
                      </div>
                      <div>
                        <div className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant/70">
                          {story.metricLabel}
                        </div>
                        <div className="font-headline-sm text-headline-sm text-on-surface font-normal mt-0.5">
                          {story.metricValue}
                        </div>
                      </div>
                      <div>
                        <div className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant/70">
                          Tariff
                        </div>
                        <div className="font-headline-sm text-headline-sm text-primary font-normal mt-0.5">
                          {story.tariff}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          {story.logisticsBadge}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
                          type="button"
                          onClick={() => setActiveStory(story)}
                        >
                          Quick Preview
                        </button>
                        <Link
                          href={`/journal/${story.slug}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg transition-all transform active:scale-95 shadow-sm group-hover:shadow-md"
                        >
                          <span>Read Story</span>
                          <ArrowRight
                            className="h-[18px] w-[18px] shrink-0"
                            aria-hidden="true"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* Deep Field Essay / Medical Guide */}
        <section
          className="bg-surface-container-low p-8 sm:p-12 lg:p-16 rounded-3xl space-y-12 border border-outline-variant/30"
          id="physiology-guide"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-outline-variant/30">
            <div className="space-y-2 max-w-2xl">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">
                Clinical Field Monograph
              </span>
              <h2 className="font-display-md text-display-md text-on-surface">
                High Altitude Physiology &amp; Pacing Architecture
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Understanding hypobaric adaptation, fluid electrolyte mechanics,
                and arterial SpO₂ profiles above the 3,500m contour line.
              </p>
            </div>
            <div className="flex items-center gap-4 text-on-surface-variant">
              <div className="text-right">
                <div className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                  Authoring Officer
                </div>
                <div className="font-headline-sm text-headline-sm text-on-surface font-normal">
                  Dr. Pemba T. Sherpa, MD
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-headline-sm font-semibold">
                PS
              </div>
            </div>
          </div>

          {/* Two-Column Editorial Essay */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-7 space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="font-display-md text-display-md text-tertiary/60 leading-none">
                    01
                  </span>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    Acclimatization Above Namche
                  </h3>
                </div>
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                  Ascending too quickly bypasses the critical physiological
                  adaptation phase required above 3,500 meters. BROTHERS guides
                  monitor resting heart rates each morning before leaving camp,
                  ensuring safe progression. Hypoxia triggers arterial pressure
                  shifts that cannot be overcome by grit; only slow, deliberate
                  hematocrit adjustments preserve systemic equilibrium in sub-zero
                  environments.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="font-display-md text-display-md text-tertiary/60 leading-none">
                    02
                  </span>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    Fluid Dynamics &amp; Rhythm
                  </h3>
                </div>
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                  Hydration and pacing dictate summit success more than raw
                  physical conditioning. Drinking four liters daily and
                  maintaining a deliberate pole-plant rhythm prevents
                  altitude-related complications on long alpine days. In dry
                  glacial corridors, hyperventilation strips moisture from lung
                  membranes at three times the sea-level rate. Pacing is not
                  merely conservation; it is continuous cellular preservation.
                </p>
              </div>

              <div className="pt-6 space-y-4">
                <h4 className="font-label-md text-label-md uppercase tracking-widest text-primary font-semibold">
                  Three Non-Negotiable Alpine Protocols
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-surface-container transition-all hover:bg-surface-container-high border border-outline-variant/15">
                    <span className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 font-label-md text-label-md font-semibold">
                      1
                    </span>
                    <div>
                      <div className="font-body-md text-body-md font-medium text-on-surface">
                        Ascend no more than 500 meters per day above 3,000 meters
                      </div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        Calculated sleeping elevation gain, excluding daytime
                        acclimatization ridge push excursions.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-lg bg-surface-container transition-all hover:bg-surface-container-high border border-outline-variant/15">
                    <span className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 font-label-md text-label-md font-semibold">
                      2
                    </span>
                    <div>
                      <div className="font-body-md text-body-md font-medium text-on-surface">
                        Incorporate one rest day for every thousand meters gained
                      </div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        Active rest: light strolls up to 200m higher, returning
                        down to sleep at lower altitude.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-lg bg-surface-container transition-all hover:bg-surface-container-high border border-outline-variant/15">
                    <span className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 font-label-md text-label-md font-semibold">
                      3
                    </span>
                    <div>
                      <div className="font-body-md text-body-md font-medium text-on-surface">
                        Maintain electrolyte intake alongside treated mountain water
                      </div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        Glacial melt is mineral-deficient; sodium, potassium, and
                        magnesium salts must be replenished daily.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Visual Altitude Pacing Chart & Newsletter */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-xl shadow-sm space-y-6 border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">
                      Field Telemetry Tool
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">
                      Altitude vs. O₂ Saturation
                    </h3>
                  </div>
                  <Activity
                    className="h-6 w-6 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <div
                    className="p-4 rounded-lg space-y-1"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(0, 107, 120, 0.08), rgba(238, 252, 254, 0.5))",
                    }}
                  >
                    <div className="flex justify-between items-center text-body-md">
                      <span className="font-medium text-on-surface">
                        1,400m (Kathmandu)
                      </span>
                      <strong className="text-primary">98% SpO₂</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container-lowest overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: "98%",
                          background: "linear-gradient(90deg, #006b78, #00a0b0)",
                        }}
                      ></div>
                    </div>
                    <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                      Sea-level baseline · Normal lung arterial flow
                    </p>
                  </div>

                  <div
                    className="p-4 rounded-lg space-y-1"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(0, 107, 120, 0.06), rgba(238, 252, 254, 0.4))",
                    }}
                  >
                    <div className="flex justify-between items-center text-body-md">
                      <span className="font-medium text-on-surface">
                        3,440m (Namche)
                      </span>
                      <strong className="text-primary">88% – 92% SpO₂</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container-lowest overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: "90%",
                          background: "linear-gradient(90deg, #006b78, #c88a3e)",
                        }}
                      ></div>
                    </div>
                    <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                      Active adaptation · Compulsory rest day interval
                    </p>
                  </div>

                  <div
                    className="p-4 rounded-lg space-y-1"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(200, 138, 62, 0.06), rgba(254, 185, 104, 0.12))",
                    }}
                  >
                    <div className="flex justify-between items-center text-body-md">
                      <span className="font-medium text-on-surface">
                        4,410m (Dingboche)
                      </span>
                      <strong className="text-tertiary">80% – 85% SpO₂</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container-lowest overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: "82%",
                          background: "linear-gradient(90deg, #c88a3e, #895508)",
                        }}
                      ></div>
                    </div>
                    <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                      Hypobaric pressure transition · Pulse rate elevation
                    </p>
                  </div>

                  <div
                    className="p-4 rounded-lg space-y-1 border border-tertiary/20"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(137, 85, 8, 0.08), rgba(200, 50, 50, 0.06))",
                    }}
                  >
                    <div className="flex justify-between items-center text-body-md">
                      <span className="font-medium text-on-surface">
                        5,164m (Gorak Shep)
                      </span>
                      <strong className="text-error font-semibold">
                        75% – 80% SpO₂
                      </strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container-lowest overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: "77%",
                          background: "linear-gradient(90deg, #895508, #ba1a1a)",
                        }}
                      ></div>
                    </div>
                    <p className="text-label-sm uppercase tracking-wider text-tertiary">
                      Extreme threshold · Gamow bag &amp; O₂ standby active
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/contact"
                    className="w-full text-center py-3 rounded-full bg-primary-container text-on-primary font-label-md text-label-md uppercase tracking-wider hover:bg-primary transition-colors block shadow-sm"
                  >
                    Consult Mountain Medical Officer
                  </Link>
                </div>
              </div>

              {/* Newsletter dispatch signup */}
              <div className="p-6 rounded-xl bg-surface-container space-y-4 border border-outline-variant/30">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">
                  Field Journal Dispatch
                </span>
                <h4 className="font-headline-sm text-headline-sm text-on-surface">
                  Subscribe to Monthly Topo Chronicles
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Detailed mountain passes condition reports and route revisions
                  emailed once monthly.
                </p>

                {subscribeSuccess ? (
                  <p className="font-label-md text-primary font-semibold py-2">
                    ✓ You are subscribed to BROTHERS Field Chronicles.
                  </p>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-3">
                    <input
                      type="email"
                      required
                      placeholder="climber@domain.com"
                      className="w-full px-4 py-2.5 rounded-full bg-surface-container-lowest text-on-surface text-body-md border border-outline-variant/30 focus:outline-none"
                      value={subscriberEmail}
                      onChange={(e) => setSubscriberEmail(e.target.value)}
                    />
                    {subscribeError && (
                      <p className="text-xs text-error font-medium">
                        {subscribeError}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-2.5 rounded-full bg-surface-container-highest hover:bg-surface-variant text-on-surface font-label-md uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {submitting ? "Subscribing..." : "Subscribe"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Story Detail Reader Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-3xl w-full p-8 sm:p-10 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto border border-outline-variant/30">
            <button
              onClick={() => setActiveStory(null)}
              type="button"
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high cursor-pointer"
            >
              <X className="h-5 w-5 shrink-0" aria-hidden="true" />
            </button>

            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">
                {activeStory.dispatchNo} · {activeStory.badge}
              </span>
              <h2 className="font-display-md text-display-md text-on-surface mt-1">
                {activeStory.title}
              </h2>
              <p className="font-headline-sm text-headline-sm text-on-surface-variant italic mt-1">
                {activeStory.subtitle}
              </p>
            </div>

            <div className="h-64 rounded-2xl overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeStory.image}
                alt={activeStory.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4 font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              <p>{activeStory.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-surface-container-low text-center">
              <div>
                <span className="font-label-sm uppercase text-on-surface-variant block">
                  Duration
                </span>
                <strong className="text-on-surface font-headline-sm">
                  {activeStory.duration}
                </strong>
              </div>
              <div>
                <span className="font-label-sm uppercase text-on-surface-variant block">
                  {activeStory.metricLabel}
                </span>
                <strong className="text-on-surface font-headline-sm">
                  {activeStory.metricValue}
                </strong>
              </div>
              <div>
                <span className="font-label-sm uppercase text-on-surface-variant block">
                  All-Inclusive Tariff
                </span>
                <strong className="text-primary font-headline-sm">
                  {activeStory.tariff}
                </strong>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-outline-variant/20">
              <Link
                href={`/journal/${activeStory.slug}`}
                className="flex-1 py-3.5 rounded-full bg-primary-container text-on-primary font-label-lg text-center hover:bg-primary transition-colors"
              >
                Open Full Dispatch Article
              </Link>
              <button
                onClick={() => setActiveStory(null)}
                type="button"
                className="px-6 py-3.5 rounded-full bg-surface-container text-on-surface font-label-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
