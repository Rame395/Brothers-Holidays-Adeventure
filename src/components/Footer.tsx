"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ArrowUp,
  Check,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import type { SiteSettingDTO } from "@/lib/types";
import { trackNewsletterSignup } from "@/lib/analytics";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import FooterAlpineParallax from "@/components/site/FooterAlpineParallax";

export default function Footer({ settings }: { settings?: SiteSettingDTO }) {
  const pathname = usePathname();
  const footerRef = useRef<HTMLElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const contactEmail = settings?.contactEmail || "info@brothersholidays.com";
  const contactPhone = settings?.contactPhone || "+977-1-4700000";
  const whatsappNumber = settings?.whatsappNumber || "+9779800000000";
  const whatsappDigits = whatsappNumber.replace(/[^\d]/g, "");
  const whatsappUrl = whatsappDigits ? `https://wa.me/${whatsappDigits}` : "";
  const officeAddress =
    settings?.officeAddress || "Thamel, Kathmandu 44600, Nepal";
  const officeHours = settings?.officeHours || "Sun–Fri · 9 AM – 6 PM NPT";
  const footerDescription =
    settings?.footerDescription ||
    "Kathmandu-based trekking and mountaineering outfitter leading small groups across Nepal, Tibet, and Bhutan with local Sherpa leadership.";
  const registrationNo =
    settings?.registrationNo || "Govt. Regd. 58177/068/069 · TAAN · NMA · NTB";
  const australiaWhatsapp = (settings?.australiaWhatsapp ?? "+61 426 378 149").trim();
  const japanWhatsapp = (settings?.japanWhatsapp ?? "+81 80 4107 0813").trim();
  const facebookUrl = settings?.facebookUrl?.trim() || "https://facebook.com";
  const instagramUrl = settings?.instagramUrl?.trim() || "https://instagram.com";
  const tiktokUrl = settings?.tiktokUrl?.trim() || "https://tiktok.com";
  const youtubeUrl = settings?.youtubeUrl?.trim() || "https://youtube.com";
  const tripadvisorUrl = settings?.tripadvisorUrl?.trim() || "";

  const socialLinks = [
    { label: "Facebook", href: facebookUrl, abbr: "FB" },
    { label: "Instagram", href: instagramUrl, abbr: "IG" },
    { label: "TikTok", href: tiktokUrl, abbr: "TT" },
    ...(whatsappUrl
      ? [{ label: "WhatsApp", href: whatsappUrl, abbr: "WA" }]
      : []),
    { label: "YouTube", href: youtubeUrl, abbr: "YT" },
    ...(tripadvisorUrl
      ? [{ label: "TripAdvisor", href: tripadvisorUrl, abbr: "TA" }]
      : []),
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          source: "footer",
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setErrorMsg(json.error || "Unable to subscribe right now");
        return;
      }
      trackNewsletterSignup("footer");
      setSubscribed(true);
      setName("");
      setEmail("");
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer
      ref={footerRef}
      className="relative w-full overflow-hidden bg-white text-[#111827] text-sm border-t border-stone-200/80"
    >
      {/* Scroll-Reactive Layered Himalayan Peaks & Alpine Pine Horizon */}
      <FooterAlpineParallax containerRef={footerRef} />

      {/* 1. Clean White Newsletter Strip */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-10 sm:pt-12">
        <ScrollReveal distance={24}>
          <div className="relative overflow-hidden rounded-[16px] border border-stone-200/90 bg-white/95 backdrop-blur-xs p-6 sm:p-8 shadow-[0_6px_24px_-12px_rgba(28,25,23,0.08)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#3f6e15]/60 via-[#f05e25] to-[#ff8a50]"
            />

            <div className="space-y-1.5 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f05e25]">
                <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                Seasonal Trail Notes
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-[#1c1917] tracking-tight">
                Seasonal Departures &amp; Trail Conditions
              </h3>
              <p className="text-xs sm:text-sm text-[#57534d] max-w-xl">
                Get early-bird fixed departure openings, Lukla flight advisories,
                and Himalayan weather updates.
              </p>
            </div>

            {subscribed ? (
              <div className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-full bg-emerald-50 border border-emerald-200 text-xs sm:text-sm font-semibold text-[#3f6e15]">
                <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Subscribed to seasonal trail updates.</span>
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full lg:w-auto shrink-0"
              >
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full sm:w-40 px-4 py-2.5 rounded-full bg-[#faf9f7] border border-stone-200 text-[#1c1917] placeholder:text-stone-400 text-sm focus:outline-none focus:border-[#3f6e15] focus:bg-white transition-colors"
                />
                <input
                  type="email"
                  required
                  placeholder="Your Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full sm:w-56 px-4 py-2.5 rounded-full bg-[#faf9f7] border border-stone-200 text-[#1c1917] placeholder:text-stone-400 text-sm focus:outline-none focus:border-[#3f6e15] focus:bg-white transition-colors"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="group px-6 py-2.5 rounded-full bg-[#f05e25] hover:bg-[#d94e18] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-60"
                >
                  <span>{submitting ? "Saving..." : "Subscribe"}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                {errorMsg && (
                  <p className="text-xs text-rose-600 self-center">{errorMsg}</p>
                )}
              </form>
            )}
          </div>
        </ScrollReveal>
      </div>

      {/* 2. Airy 5-Column Editorial Footer Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-12 sm:pt-14 pb-20 sm:pb-24 [text-shadow:0_1px_12px_rgba(255,255,255,0.95)]">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-10">
          {/* Col 1: Brand & Social */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-3 space-y-4 lg:pr-6">
            <Link
              href="/"
              className="inline-block"
              aria-label="BROTHERS Holidays Adventure Home"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/brothers_logo_navbar.png"
                alt="BROTHERS Holidays Adventure"
                className="h-11 w-auto object-contain"
              />
            </Link>
            <p className="text-[#1f2937] font-medium text-[13px] leading-relaxed max-w-[265px]">
              {footerDescription}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 [text-shadow:none]">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-xs border border-stone-200 text-[#111827] hover:bg-[#f05e25] hover:text-white hover:border-[#f05e25] text-[11px] font-bold tracking-wider transition-all duration-200 shadow-xs hover:-translate-y-0.5"
                >
                  {s.abbr}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Kathmandu Office */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-3 lg:border-l lg:border-stone-200/90 lg:pl-7 space-y-3.5">
            <div className="flex items-center gap-2 text-[#111827]">
              <MapPin className="w-3.5 h-3.5 text-[#f05e25]" aria-hidden="true" />
              <h4 className="text-[11px] font-bold uppercase tracking-[0.18em]">
                Kathmandu Office
              </h4>
            </div>
            <div className="space-y-2.5 text-[#1f2937] text-[13px]">
              <p className="leading-snug font-semibold text-[#111827]">
                {officeAddress}
              </p>
              <p className="tabular-nums">
                <a
                  href={`tel:${contactPhone.replace(/[^+\d]/g, "")}`}
                  className="inline-flex items-center gap-2 font-medium hover:text-[#f05e25] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#3f6e15]" aria-hidden="true" />
                  <span>{contactPhone}</span>
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex items-center gap-2 font-medium hover:text-[#f05e25] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#3f6e15]" aria-hidden="true" />
                  <span>{contactEmail}</span>
                </a>
              </p>
              <p className="inline-flex items-center gap-2 pt-1 text-xs font-medium text-[#374151]">
                <Clock className="w-3.5 h-3.5 text-stone-500" aria-hidden="true" />
                <span>{officeHours}</span>
              </p>
            </div>
          </div>

          {/* Col 3: Popular Treks */}
          <div className="col-span-1 lg:col-span-2 lg:border-l lg:border-stone-200/90 lg:pl-7 space-y-3.5">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#111827]">
              Popular Treks
            </h4>
            <ul className="space-y-2 text-[#1f2937] text-[13px]">
              {[
                { name: "Everest Base Camp", href: "/destinations/everest-base-camp-trek" },
                { name: "Annapurna Circuit", href: "/destinations/annapurna-circuit-trek" },
                { name: "Langtang Valley", href: "/destinations/langtang-valley-trek" },
                { name: "Manaslu Circuit", href: "/destinations/manaslu-circuit-trek" },
                { name: "EBC Heli Return", href: "/destinations/everest-base-camp-trek-helicopter-return" },
              ].map((trek) => (
                <li key={trek.href}>
                  <Link
                    href={trek.href}
                    className="group inline-flex items-center gap-1.5 hover:text-[#3f6e15] font-semibold transition-colors"
                  >
                    <span className="h-1 w-1 rounded-full bg-[#f05e25] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                      {trek.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Explore */}
          <div className="col-span-1 lg:col-span-2 lg:border-l lg:border-stone-200/90 lg:pl-7 space-y-3.5">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#111827]">
              Explore
            </h4>
            <ul className="space-y-2 text-[#1f2937] text-[13px]">
              {[
                { name: "About Us", href: "/about" },
                { name: "All Destinations", href: "/destinations" },
                { name: "Travel Guides", href: "/guides" },
                { name: "Field Journal", href: "/journal" },
                { name: "Booking Policy", href: "/booking-policy" },
                { name: "Legal Documents", href: "/legal-documents" },
                { name: "Contact Us", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 hover:text-[#3f6e15] font-semibold transition-colors"
                  >
                    <span className="h-1 w-1 rounded-full bg-[#f05e25] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Global Desk */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-2 lg:border-l lg:border-stone-200/90 lg:pl-7 space-y-3.5 [text-shadow:none]">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#111827] [text-shadow:0_1px_12px_rgba(255,255,255,0.95)]">
              Global Desk
            </h4>
            <div className="space-y-2.5 text-[13px] tabular-nums">
              {australiaWhatsapp && (
                <a
                  href={`https://wa.me/${australiaWhatsapp.replace(/[^\d]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-[12px] border border-stone-200 bg-white/95 backdrop-blur-xs hover:border-[#3f6e15]/40 hover:shadow-sm p-3.5 transition-all shadow-xs"
                >
                  <span className="flex items-center justify-between gap-2 text-xs font-bold text-[#111827]">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Australia Desk
                    </span>
                    <MessageCircle className="w-3.5 h-3.5 text-[#3f6e15] transition-transform group-hover:scale-110" />
                  </span>
                  <span className="mt-1 block text-xs font-medium text-[#374151] group-hover:text-[#111827]">
                    {australiaWhatsapp}
                  </span>
                </a>
              )}

              {japanWhatsapp && (
                <a
                  href={`https://wa.me/${japanWhatsapp.replace(/[^\d]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-[12px] border border-stone-200 bg-white/95 backdrop-blur-xs hover:border-[#3f6e15]/40 hover:shadow-sm p-3.5 transition-all shadow-xs"
                >
                  <span className="flex items-center justify-between gap-2 text-xs font-bold text-[#111827]">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Japan Desk
                    </span>
                    <MessageCircle className="w-3.5 h-3.5 text-[#3f6e15] transition-transform group-hover:scale-110" />
                  </span>
                  <span className="mt-1 block text-xs font-medium text-[#374151] group-hover:text-[#111827]">
                    {japanWhatsapp}
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Crisp Bottom Licensing & Back-to-Top Strip */}
      <div className="relative z-10 border-t border-stone-200 bg-white/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-5 pb-20 sm:py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs font-medium text-[#1f2937]">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3f6e15]/10 px-3 py-1 text-[11px] font-semibold text-[#3f6e15]">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Licensed Nepal Operator
            </span>
            <span className="hidden sm:inline text-stone-300">·</span>
            <span>TAAN · NMA · NTB Registered · Direct Booking</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <p>
              © 2026 {settings?.siteName || "BROTHERS Holidays Adventure"} ·{" "}
              {registrationNo}
            </p>
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white hover:bg-[#f05e25] hover:border-[#f05e25] hover:text-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#1c1917] transition-all cursor-pointer shadow-2xs"
            >
              <span>Top</span>
              <ArrowUp className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
