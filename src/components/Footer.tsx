"use client";

import type { ReactNode } from "react";
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
  Phone,
  ShieldCheck,
} from "lucide-react";
import type { SiteSettingDTO } from "@/lib/types";
import { trackNewsletterSignup } from "@/lib/analytics";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import FooterAlpineParallax from "@/components/site/FooterAlpineParallax";

function FacebookColorLogo() {
  return (
    <span className="h-10 w-10 rounded-full bg-[#1877F2] text-white shadow-md flex items-center justify-center">
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
        <path d="M13.5 21.5v-8.2h2.75l.41-3.2H13.5V8.05c0-.93.26-1.56 1.59-1.56h1.7V3.63c-.29-.04-1.3-.13-2.48-.13-2.45 0-4.13 1.5-4.13 4.25v2.35H7.4v3.2h2.78v8.2h3.32Z" />
      </svg>
    </span>
  );
}

function InstagramColorLogo() {
  return (
    <span
      className="h-10 w-10 rounded-full text-white shadow-md flex items-center justify-center"
      style={{
        background:
          "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}

function TikTokColorLogo() {
  return (
    <span className="h-10 w-10 rounded-full bg-[#0f0f10] ring-1 ring-white/20 shadow-md flex items-center justify-center">
      <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
        <path
          fill="#25F4EE"
          d="M18.7 6.3a4.6 4.6 0 0 1-3.5-4h-3.1v13a2.7 2.7 0 0 1-2.7 2.4 2.7 2.7 0 0 1-2.7-2.7 2.7 2.7 0 0 1 2.7-2.7c.26 0 .5.04.74.1V9.1a5.9 5.9 0 0 0-.74-.05 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6V8a7.8 7.8 0 0 0 4.5 1.4V6.2c-.34 0-.68.03-.9.1Z"
          transform="translate(-0.7, -0.5)"
        />
        <path
          fill="#FE2C55"
          d="M18.7 6.3a4.6 4.6 0 0 1-3.5-4h-3.1v13a2.7 2.7 0 0 1-2.7 2.4 2.7 2.7 0 0 1-2.7-2.7 2.7 2.7 0 0 1 2.7-2.7c.26 0 .5.04.74.1V9.1a5.9 5.9 0 0 0-.74-.05 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6V8a7.8 7.8 0 0 0 4.5 1.4V6.2c-.34 0-.68.03-.9.1Z"
          transform="translate(0.7, 0.5)"
        />
        <path
          fill="#FFFFFF"
          d="M18.7 6.3a4.6 4.6 0 0 1-3.5-4h-3.1v13a2.7 2.7 0 0 1-2.7 2.4 2.7 2.7 0 0 1-2.7-2.7 2.7 2.7 0 0 1 2.7-2.7c.26 0 .5.04.74.1V9.1a5.9 5.9 0 0 0-.74-.05 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6V8a7.8 7.8 0 0 0 4.5 1.4V6.2c-.34 0-.68.03-.9.1Z"
        />
      </svg>
    </span>
  );
}

function WhatsAppColorLogo() {
  return (
    <span className="h-10 w-10 rounded-full bg-[#25D366] text-white shadow-md flex items-center justify-center">
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
        <path d="M12.04 2.2a9.8 9.8 0 0 0-8.43 14.81L2.1 21.8l4.94-1.3a9.8 9.8 0 1 0 5-18.3Zm0 17.9a8.08 8.08 0 0 1-4.12-1.13l-.3-.17-2.93.77.78-2.86-.19-.3a8.08 8.08 0 1 1 6.76 3.69Zm4.43-6.05c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.53.06a6.62 6.62 0 0 1-1.95-1.2 7.36 7.36 0 0 1-1.35-1.68c-.14-.24-.01-.37.11-.5.11-.11.24-.28.36-.42.12-.14.16-.24.24-.41.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.47-.4-.4-.55-.41h-.47c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02 0 1.2.87 2.35.99 2.51.12.16 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.05.14-1.16-.06-.1-.22-.16-.46-.28Z" />
      </svg>
    </span>
  );
}

function YouTubeColorLogo() {
  return (
    <span className="h-10 w-10 rounded-full bg-[#FF0000] text-white shadow-md flex items-center justify-center">
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
        <path d="M21.8 7.2a2.6 2.6 0 0 0-1.83-1.84C18.36 4.92 12 4.92 12 4.92s-6.36 0-7.97.44A2.6 2.6 0 0 0 2.2 7.2C1.76 8.83 1.76 12 1.76 12s0 3.17.44 4.8a2.6 2.6 0 0 0 1.83 1.84c1.61.44 7.97.44 7.97.44s6.36 0 7.97-.44a2.6 2.6 0 0 0 1.83-1.84c.44-1.63.44-4.8.44-4.8s0-3.17-.44-4.8ZM9.9 15V9l5.3 3-5.3 3Z" />
      </svg>
    </span>
  );
}

function TripAdvisorColorLogo() {
  return (
    <span className="h-10 w-10 rounded-full bg-[#34E0A1] text-[#000000] shadow-md flex items-center justify-center">
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
        <path d="M12 6.8c-2.5 0-4.9.6-6.9 1.6L3.4 6.8h2.7A11.8 11.8 0 0 1 12 5.4c2.2 0 4.3.5 5.9 1.4h2.7l-1.7 1.6c-2-1-4.4-1.6-6.9-1.6Zm-4.7 2.9a4.4 4.4 0 1 0 0 8.8 4.4 4.4 0 0 0 0-8.8Zm0 6.8a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8Zm0-3.5a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Zm9.4-3.3a4.4 4.4 0 1 0 0 8.8 4.4 4.4 0 0 0 0-8.8Zm0 6.8a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8Zm0-3.5a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2ZM12 15.2l-1.8 2.5h3.6L12 15.2Z" />
      </svg>
    </span>
  );
}

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
  const facebookUrl = settings?.facebookUrl?.trim() || "https://facebook.com";
  const instagramUrl = settings?.instagramUrl?.trim() || "https://instagram.com";
  const tiktokUrl = settings?.tiktokUrl?.trim() || "https://tiktok.com";
  const youtubeUrl = settings?.youtubeUrl?.trim() || "https://youtube.com";
  const tripadvisorUrl = settings?.tripadvisorUrl?.trim() || "";

  const socialLinks: Array<{
    label: string;
    href: string;
    logo: ReactNode;
  }> = [
    { label: "Facebook", href: facebookUrl, logo: <FacebookColorLogo /> },
    { label: "Instagram", href: instagramUrl, logo: <InstagramColorLogo /> },
    { label: "TikTok", href: tiktokUrl, logo: <TikTokColorLogo /> },
    ...(whatsappUrl
      ? [{ label: "WhatsApp", href: whatsappUrl, logo: <WhatsAppColorLogo /> }]
      : []),
    { label: "YouTube", href: youtubeUrl, logo: <YouTubeColorLogo /> },
    ...(tripadvisorUrl
      ? [
          {
            label: "TripAdvisor",
            href: tripadvisorUrl,
            logo: <TripAdvisorColorLogo />,
          },
        ]
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
      className="relative w-full overflow-hidden bg-[#142136] text-white text-sm"
    >
      {/* Animated Himalayan Trekkers Panoramic Divider */}
      <FooterAlpineParallax containerRef={footerRef} />

      {/* 1. Dark Alpine Newsletter Strip */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-6 sm:pt-8">
        <ScrollReveal distance={22}>
          <div className="relative overflow-hidden rounded-[16px] border border-white/12 bg-white/[0.05] backdrop-blur-xs p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#34E0A1]/70 via-[#f05e25] to-[#ff8a50]"
            />

            <div className="space-y-1.5 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff8a50]">
                <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                Seasonal Trail Notes
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Seasonal Departures &amp; Trail Conditions
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Get early-bird fixed departure openings, Lukla flight advisories,
                and Himalayan weather updates.
              </p>
            </div>

            {subscribed ? (
              <div className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-xs sm:text-sm font-semibold text-emerald-300">
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
                  className="w-full sm:w-40 px-4 py-2.5 rounded-full bg-white/10 border border-white/15 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#f05e25] focus:bg-white/15 transition-colors"
                />
                <input
                  type="email"
                  required
                  placeholder="Your Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full sm:w-56 px-4 py-2.5 rounded-full bg-white/10 border border-white/15 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#f05e25] focus:bg-white/15 transition-colors"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="group px-6 py-2.5 rounded-full bg-[#f05e25] hover:bg-[#ff733d] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-60"
                >
                  <span>{submitting ? "Saving..." : "Subscribe"}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                {errorMsg && (
                  <p className="text-xs text-rose-400 self-center">{errorMsg}</p>
                )}
              </form>
            )}
          </div>
        </ScrollReveal>
      </div>

      {/* 2. Balanced 4-Column Footer Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-12 sm:pt-14 pb-12 sm:pb-14">
        <ScrollReveal distance={22} delay={60}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-10">
            {/* Col 1: Brand & Colorful Official Social Media Icons */}
            <div className="sm:col-span-2 lg:col-span-4 space-y-5 lg:pr-6">
              <Link
                href="/"
                className="inline-block"
                aria-label="BROTHERS Holidays Adventure Home"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/brothers_logo_navbar.png"
                  alt="BROTHERS Holidays Adventure"
                  className="h-14 w-auto object-contain"
                />
              </Link>
              <p className="text-slate-300 text-[13px] leading-relaxed max-w-sm">
                {footerDescription}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="inline-flex rounded-full transition-transform duration-200 hover:-translate-y-1 hover:scale-110 active:scale-95"
                  >
                    {s.logo}
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2: Kathmandu Office */}
            <div className="lg:col-span-3 lg:border-l lg:border-white/10 lg:pl-7 space-y-3.5">
              <div className="flex items-center gap-2 text-white">
                <MapPin className="w-4 h-4 text-[#ff8a50]" aria-hidden="true" />
                <h4 className="text-xs font-bold uppercase tracking-[0.16em]">
                  Kathmandu Office
                </h4>
              </div>
              <div className="space-y-3 text-slate-300 text-[13px]">
                <p className="leading-snug font-medium text-white">
                  {officeAddress}
                </p>
                <p className="tabular-nums">
                  <a
                    href={`tel:${contactPhone.replace(/[^+\d]/g, "")}`}
                    className="inline-flex items-center gap-2 hover:text-[#ff8a50] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#34E0A1]" aria-hidden="true" />
                    <span>{contactPhone}</span>
                  </a>
                </p>
                <p>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="inline-flex items-center gap-2 hover:text-[#ff8a50] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#34E0A1]" aria-hidden="true" />
                    <span>{contactEmail}</span>
                  </a>
                </p>
                <p className="inline-flex items-center gap-2 pt-0.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  <span>{officeHours}</span>
                </p>
              </div>
            </div>

            {/* Col 3: Popular Treks */}
            <div className="lg:col-span-2 lg:border-l lg:border-white/10 lg:pl-7 space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
                Popular Treks
              </h4>
              <ul className="space-y-2.5 text-slate-300 text-[13px]">
                {[
                  {
                    name: "Everest Base Camp",
                    href: "/destinations/everest-base-camp-trek",
                  },
                  {
                    name: "Annapurna Circuit",
                    href: "/destinations/annapurna-circuit-trek",
                  },
                  {
                    name: "Langtang Valley",
                    href: "/destinations/langtang-valley-trek",
                  },
                  {
                    name: "Manaslu Circuit",
                    href: "/destinations/manaslu-circuit-trek",
                  },
                  {
                    name: "EBC Heli Return",
                    href: "/destinations/everest-base-camp-trek-helicopter-return",
                  },
                ].map((trek) => (
                  <li key={trek.href}>
                    <Link
                      href={trek.href}
                      className="group inline-flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <span className="h-1 w-1 rounded-full bg-[#ff8a50] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                        {trek.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Explore (Clean 2-Column Sub-Grid) */}
            <div className="lg:col-span-3 lg:border-l lg:border-white/10 lg:pl-7 space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
                Explore
              </h4>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-slate-300 text-[13px]">
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
                      className="group inline-flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <span className="h-1 w-1 rounded-full bg-[#34E0A1] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* 3. Crisp Bottom Licensing & Back-to-Top Strip */}
      <div className="relative z-10 border-t border-white/10 bg-[#0f1a2c]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-5 pb-20 sm:py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-slate-300">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#34E0A1]/15 border border-[#34E0A1]/30 px-3 py-1 text-[11px] font-semibold text-[#34E0A1]">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Licensed Nepal Operator
            </span>
            <span className="hidden sm:inline text-white/25">·</span>
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
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-[#f05e25] hover:border-[#f05e25] text-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer"
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
