import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  FileCheck2,
  Landmark,
  Mountain,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/legal-documents");
}

const LEGAL_CREDENTIALS = [
  {
    code: "Reg. No. 58177/068/069",
    authority: "Office of Company Registrar",
    ministry: "Government of Nepal · Ministry of Industry",
    title: "Company Registration Certificate",
    summary:
      "Registered private limited adventure and trekking operator incorporated in Kathmandu, Nepal under Brothers Holidays Adventure Pvt. Ltd.",
    icon: Building2,
  },
  {
    code: "Tourism License",
    authority: "Department of Tourism",
    ministry: "Ministry of Culture, Tourism & Civil Aviation",
    title: "Authorized Trekking & Tour Operator License",
    summary:
      "Licensed to organize guided trekking, sightseeing, cultural expeditions, and helicopter tours across Nepal, Tibet, and Bhutan.",
    icon: Landmark,
  },
  {
    code: "NTB Reg. 1509",
    authority: "Nepal Tourism Board (NTB)",
    ministry: "National Tourism Authority of Nepal",
    title: "Nepal Tourism Board Registration",
    summary:
      "Officially registered with the Nepal Tourism Board with authority to process TIMS cards and conservation area entry permits.",
    icon: ShieldCheck,
  },
  {
    code: "TAAN Member",
    authority: "Trekking Agencies' Association of Nepal",
    ministry: "Umbrella Association of Nepali Trek Operators",
    title: "TAAN Active Membership Certificate",
    summary:
      "Committed to TAAN safety protocols, fair guide/porter wage schedules, insurance coverage, and ethical trail operations.",
    icon: FileCheck2,
  },
  {
    code: "NMA Certified",
    authority: "Nepal Mountaineering Association",
    ministry: "Peak Climbing & Expedition Governance",
    title: "NMA Climbing Permit Authorization",
    summary:
      "Authorized to issue NMA trekking peak climbing permits (6,000m–6,500m & technical alpine peaks) and assign certified high-altitude guides.",
    icon: Mountain,
  },
  {
    code: "PAN / Tax Cleared",
    authority: "Inland Revenue Department",
    ministry: "Government of Nepal · Revenue & VAT Compliance",
    title: "Permanent Account Number & Tax Clearance",
    summary:
      "Annually audited and tax-compliant corporate entity ensuring full financial transparency and guest payment security.",
    icon: FileCheck2,
  },
];

export default function LegalDocumentsPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About Us", path: "/about" },
          {
            name: "Legal Documents – Brothers Holidays Adventure Pvt. Ltd.",
            path: "/legal-documents",
          },
        ])}
      />

      <div className="min-h-screen bg-[#f8fafc] text-[#1c1917] pb-20">
        {/* Header */}
        <section className="bg-white border-b border-stone-200/80 py-12 sm:py-16 px-5 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#3f6e15]/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#3f6e15]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#f05e25]" />
              <span>Government Authorized · Nepal</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-5xl font-bold text-[#1c1917] tracking-tight">
              Legal Documents &amp; Official Accreditations
            </h1>
            <p className="text-sm sm:text-base text-[#57534d] max-w-3xl leading-relaxed">
              Brothers Holidays Adventure Pvt. Ltd. is a 100% locally owned,
              government-registered trekking and mountaineering company based in
              Thamel, Kathmandu. Every permit, flight booking, and expedition
              departure operates under full statutory licensing from Nepal&apos;s
              tourism authorities.
            </p>
          </div>
        </section>

        {/* Credentials Grid */}
        <section className="max-w-6xl mx-auto px-5 lg:px-8 pt-12 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LEGAL_CREDENTIALS.map((doc) => {
              const Icon = doc.icon;
              return (
                <article
                  key={doc.title}
                  className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs hover:border-[#3f6e15]/40 transition-colors flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#3f6e15]/10 text-[#3f6e15] flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="inline-flex items-center rounded-full bg-[#faf9f7] border border-stone-200 px-3 py-1 text-[11px] font-bold text-[#f05e25]">
                        {doc.code}
                      </span>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#3f6e15]">
                        {doc.authority}
                      </p>
                      <h2 className="font-heading text-xl font-bold text-[#1c1917] mt-1">
                        {doc.title}
                      </h2>
                    </div>

                    <p className="text-xs sm:text-sm text-[#57534d] leading-relaxed">
                      {doc.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 text-[11px] font-medium text-stone-500">
                    {doc.ministry}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Direct Verification CTA */}
          <div className="rounded-2xl border border-[#3f6e15]/20 bg-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f05e25]">
                Verified Peace of Mind
              </p>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1c1917]">
                Need scanned copies before confirming your deposit?
              </h2>
              <p className="text-xs sm:text-sm text-[#57534d] leading-relaxed">
                Our Kathmandu desk can email PDF copies of our Company
                Registrar certificate, TAAN membership, NMA license, and guide
                credentials immediately upon request.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-[#f05e25] hover:bg-[#d94e18] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors"
              >
                <span>Request Document Copies</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/booking-policy"
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 hover:border-[#3f6e15] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#1c1917] hover:text-[#3f6e15] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#3f6e15]" />
                <span>Booking Policy</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
