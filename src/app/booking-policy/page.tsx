import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CloudSun,
  Infinity as InfinityIcon,
  PlaneLanding,
  ShieldCheck,
} from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/booking-policy");
}

const GUARANTEES = [
  {
    icon: ShieldCheck,
    title: "20% Low Booking Deposit",
    desc: "Reserve your trek, peak climbing permit, or private tour with only a 20% advance deposit. Pay the remaining balance upon arrival in Kathmandu before departure.",
  },
  {
    icon: CalendarClock,
    title: "Free Date Rescheduling",
    desc: "Plans changed? Shift your departure dates up to 15 days prior to arrival with zero administrative modification fee across any Trek or Tour itinerary.",
  },
  {
    icon: InfinityIcon,
    title: "Lifetime Deposit Credit",
    desc: "If unforeseen travel restrictions, medical emergencies, or family commitments stop your trip, 100% of your advance deposit remains valid as a lifetime trip credit—never forfeited.",
  },
  {
    icon: CloudSun,
    title: "Lukla & Weather Delay Protection",
    desc: "Himalayan mountain flights occasionally face weather holds. Our flight desk manages priority helicopter options, Ramechhap transfers, or flexible itinerary adjustments at zero extra service markup.",
  },
  {
    icon: PlaneLanding,
    title: "Guaranteed Small-Group Departures",
    desc: "Once booked, your trek runs on schedule—whether you travel solo or in a group. We never cancel confirmed departures due to low group numbers.",
  },
  {
    icon: CheckCircle2,
    title: "24/7 Rescue & Altitude Support",
    desc: "Every lead guide carries a calibrated pulse oximeter and satellite messenger backed by our 24/7 Kathmandu rescue desk for immediate evacuation coordination if ever required.",
  },
];

const TERMS = [
  {
    window: "30+ days before arrival",
    rule: "Free date change or 100% lifetime credit transfer (or refund minus third-party bank/permit fees already issued).",
  },
  {
    window: "15–29 days before arrival",
    rule: "Free date reschedule within 24 months or 100% transferable lifetime credit for any Nepal, Tibet, or Bhutan route.",
  },
  {
    window: "Within 14 days of arrival",
    rule: "Permits, domestic flights, and lodge reservations are already pre-issued; unused value can be applied toward a rescheduled departure minus non-refundable airline/permit costs.",
  },
];

export default function BookingPolicyPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Risk-Free Booking Policy", path: "/booking-policy" },
        ])}
      />

      <div className="min-h-screen bg-[#f8fafc] text-[#1c1917] pb-20">
        {/* Header */}
        <section className="bg-white border-b border-stone-200/80 py-12 sm:py-16 px-5 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f05e25]/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#f05e25]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Traveler Protection Promise</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-5xl font-bold text-[#1c1917] tracking-tight">
              Risk-Free Himalayan Booking Policy
            </h1>
            <p className="text-sm sm:text-base text-[#57534d] max-w-3xl leading-relaxed">
              Book your Nepal, Tibet, or Bhutan adventure with complete
              flexibility. From low advance deposits to lifetime trip credits and
              real-time Lukla weather support, our policy is designed around
              real-world mountain travel.
            </p>
          </div>
        </section>

        {/* Guarantees */}
        <section className="max-w-6xl mx-auto px-5 lg:px-8 pt-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GUARANTEES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#3f6e15]/10 text-[#3f6e15] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="font-heading text-xl font-bold text-[#1c1917]">
                    {item.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#57534d] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Cancellation & Reschedule Schedule */}
          <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-xs">
            <div className="px-6 py-5 border-b border-stone-200 bg-[#faf9f7]">
              <h2 className="font-heading text-2xl font-bold text-[#3f6e15]">
                Rescheduling &amp; Cancellation Schedule
              </h2>
              <p className="text-xs sm:text-sm text-[#57534d] mt-1">
                Simple, transparent terms with no hidden administrative fees.
              </p>
            </div>
            <div className="divide-y divide-stone-200">
              {TERMS.map((t) => (
                <div
                  key={t.window}
                  className="px-6 py-4 grid grid-cols-1 sm:grid-cols-[240px_1fr] gap-2 sm:gap-6 items-baseline"
                >
                  <div className="text-sm font-bold text-[#1c1917]">
                    {t.window}
                  </div>
                  <div className="text-xs sm:text-sm text-[#57534d] leading-relaxed">
                    {t.rule}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl bg-[#162b0c] text-white p-7 sm:p-9 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff8a50]">
                Ready When You Are
              </p>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold">
                Plan your dates with zero booking stress.
              </h2>
              <p className="text-xs sm:text-sm text-white/80 max-w-xl">
                Speak directly with our Thamel, Kathmandu team to lock in your
                permits and ideal trekking season.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/destinations?view=all"
                className="inline-flex items-center gap-2 rounded-full bg-[#f05e25] hover:bg-[#d94e18] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors"
              >
                <span>Browse Trips</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 hover:bg-white hover:text-[#162b0c] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors"
              >
                <span>Ask a Question</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
