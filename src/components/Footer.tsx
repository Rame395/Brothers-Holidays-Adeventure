"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  ArrowRight,
  MapPin,
  Phone,
  Compass,
  Link as LinkIcon,
  Globe,
  ShieldCheck,
  Mountain,
  Check,
} from "lucide-react";
import { KharkaMark } from "./site/Nav";
import { HikerSilhouette } from "./footer/HikerSilhouette";

export default function Footer() {
  const [newsletterName, setNewsletterName] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setTimeout(() => {
      setNewsletterName("");
      setNewsletterEmail("");
      setSubscribed(false);
    }, 4500);
  };

  return (
    <footer className="relative w-full bg-[#061b24] text-slate-200 overflow-hidden text-xs selection:bg-[#0f5d63] selection:text-white border-t border-[#d4af37]/35">
      {/* ──────────────────────────────────────────────────────────
          1. CINEMATIC HIMALAYAN NEWSLETTER BANNER
          Panoramic mountains, mist, climber silhouette, and gold detailing
          ────────────────────────────────────────────────────────── */}
      <div className="relative w-full py-16 sm:py-20 lg:py-24 px-6 lg:px-12 overflow-hidden border-b border-[#d4af37]/30">
        {/* Slow mountain parallax breathing background */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none animate-mountain-breathe"
          style={{
            backgroundImage: "url('/images/cta-himalaya-bg.jpg')",
            backgroundPosition: "center 38%",
          }}
        />

        {/* Cinematic dark teal and navy atmospheric gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#061b24]/92 via-[#0b303b]/78 to-[#061b24]/88 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061b24] via-transparent to-[#061b24]/60 pointer-events-none" />

        {/* Subtle moving cloud / mist overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(15,93,99,0.35),transparent_70%)] animate-mist-drift pointer-events-none" />

        {/* Top-left animated topographic contour curves */}
        <div className="absolute top-0 left-0 w-80 sm:w-96 lg:w-[480px] h-72 pointer-events-none opacity-25 select-none overflow-hidden animate-contour-glow">
          <svg className="w-full h-full" viewBox="0 0 500 350" fill="none">
            <path d="M -40,30 Q 90,20 160,70 T 280,160 T 380,290" stroke="#d4af37" strokeWidth="1.2" opacity="0.65" />
            <path d="M -40,80 Q 110,60 190,120 T 320,220 T 430,350" stroke="#d4af37" strokeWidth="1.2" opacity="0.55" />
            <path d="M -40,140 Q 130,110 230,170 T 360,280 T 470,400" stroke="#d4af37" strokeWidth="1.2" opacity="0.45" />
            <path d="M -40,200 Q 150,160 260,230 T 400,330 T 510,440" stroke="#d4af37" strokeWidth="1.2" opacity="0.35" />
            <path d="M -40,260 Q 170,210 290,280 T 440,380 T 550,490" stroke="#d4af37" strokeWidth="1.2" opacity="0.25" />
          </svg>
        </div>

        {/* Subtle animated ridge light trail */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden opacity-40"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M 100,240 Q 420,120 720,170 T 1180,90 T 1440,140"
            stroke="#e8b765"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="animate-ridge-light"
          />
        </svg>

        {/* Mountain Ridge & Summit Mountaineer Silhouette on Right */}
        <div className="hidden lg:block absolute right-12 xl:right-24 top-8 pointer-events-none select-none z-10">
          <div className="relative">
            {/* Summit beacon star pulse */}
            <div className="absolute -top-3.5 left-7 w-2.5 h-2.5 rounded-full bg-[#d4af37] animate-beacon-pulse shadow-[0_0_12px_#d4af37]" />
            {/* Hiker silhouette standing atop mountain peak */}
            <HikerSilhouette className="w-16 h-16 xl:w-20 xl:h-20 text-[#041219] drop-shadow-[0_4px_12px_rgba(212,175,55,0.4)]" />
          </div>
        </div>

        {/* Newsletter Content Container */}
        <div className="relative z-20 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Headline & Eyebrow */}
          <div className="text-center lg:text-left space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.26em] text-[#d4af37] font-semibold">
              <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-r from-transparent to-[#d4af37]" />
              <span>EXPEDITION DISPATCHES</span>
              <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-l from-transparent to-[#d4af37]" />
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-normal tracking-tight">
              Subscribe To Our{" "}
              <span className="italic font-serif text-[#d4af37]">Newsletter</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300/85 font-light leading-relaxed pt-1">
              Seasonal weather bulletins, pass opening notices, and high-altitude field dispatches delivered directly to your logbook.
            </p>
          </div>

          {/* Form / Subscription Controls */}
          <div className="w-full lg:w-auto">
            {subscribed ? (
              <div className="px-6 py-4 rounded-2xl bg-[#081f2a]/90 border border-[#d4af37]/60 text-[#d4af37] text-sm font-medium flex items-center justify-center gap-2.5 shadow-xl animate-fade-in backdrop-blur-md">
                <Check className="w-5 h-5 text-emerald-400" />
                <span>Thank you! Field dispatches &amp; route dossiers sent to your inbox.</span>
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full"
              >
                {/* Input 1: Name */}
                <div className="relative group w-full sm:w-44 lg:w-48">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-[#d4af37] transition-colors" />
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={newsletterName}
                    onChange={(e) => setNewsletterName(e.target.value)}
                    className="w-full h-12 pl-10 pr-3 rounded-xl bg-[#081f2a]/80 backdrop-blur-md border border-slate-700/70 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50 transition-all shadow-inner"
                  />
                </div>

                {/* Input 2: Email */}
                <div className="relative group w-full sm:w-56 lg:w-64">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-[#d4af37] transition-colors" />
                  <input
                    type="email"
                    required
                    placeholder="Your Email Address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full h-12 pl-10 pr-3 rounded-xl bg-[#081f2a]/80 backdrop-blur-md border border-slate-700/70 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50 transition-all shadow-inner"
                  />
                </div>

                {/* Button: Subscribe */}
                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 h-12 rounded-xl bg-gradient-to-r from-[#e8b765] via-[#dfa851] to-[#c59a4a] text-[#071317] font-semibold text-xs sm:text-sm tracking-wide shadow-lg shadow-[#d4af37]/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer group shrink-0"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          2. MAIN 5-COLUMN FOOTER BODY (Deep Navy & Dark Teal)
          KHARKA Brand, Nepal Office, Top Treks, Quick Links & Global Support
          ────────────────────────────────────────────────────────── */}
      <div className="relative w-full py-14 sm:py-16 lg:py-20 px-6 lg:px-12 bg-gradient-to-b from-[#061b24] via-[#08222d] to-[#041219]">
        {/* Subtle gold contour background watermark on right side */}
        <div className="absolute right-0 bottom-0 w-96 lg:w-[500px] h-72 pointer-events-none opacity-20 select-none overflow-hidden rotate-180">
          <svg className="w-full h-full" viewBox="0 0 500 350" fill="none">
            <path d="M -40,30 Q 90,20 160,70 T 280,160 T 380,290" stroke="#d4af37" strokeWidth="1" opacity="0.6" />
            <path d="M -40,80 Q 110,60 190,120 T 320,220 T 430,350" stroke="#d4af37" strokeWidth="1" opacity="0.5" />
            <path d="M -40,140 Q 130,110 230,170 T 360,280 T 470,400" stroke="#d4af37" strokeWidth="1" opacity="0.4" />
            <path d="M -40,200 Q 150,160 260,230 T 400,330 T 510,440" stroke="#d4af37" strokeWidth="1" opacity="0.3" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
            {/* COLUMN 1: KHARKA BRAND IDENTITY (lg:col-span-3) */}
            <div className="lg:col-span-3 space-y-4 lg:pr-6 lg:border-r border-[#d4af37]/20">
              <Link href="/" className="inline-flex flex-col gap-1.5 group">
                <div className="flex items-center gap-2.5">
                  <KharkaMark className="h-5 w-8 text-[#d4af37] shrink-0 transition-transform duration-500 group-hover:-translate-y-0.5 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
                  <span className="font-serif text-xl lg:text-[22px] tracking-[0.2em] text-white font-normal uppercase whitespace-nowrap">
                    K H A R K A
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#d4af37] font-medium pl-1">
                  — EXPLORE · TREK · DISCOVER —
                </span>
              </Link>

              <p className="text-xs text-[#aab9c0] leading-relaxed pt-1">
                Experience the Himalayas with KHARKA — where every journey becomes a story.
              </p>

              <div className="pt-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400/80">
                  High Altitude Logistics · Field Cartography Since 1993
                </span>
              </div>
            </div>

            {/* COLUMN 2: NEPAL (HEAD OFFICE) (lg:col-span-3) */}
            <div className="lg:col-span-3 space-y-3.5 lg:px-6 lg:border-r border-[#d4af37]/20">
              <div className="flex items-center gap-2 text-[#d4af37]">
                <MapPin className="w-4 h-4 text-[#d4af37] shrink-0" />
                <h4 className="font-bold text-xs font-mono uppercase tracking-wider text-[#d4af37]">
                  NEPAL (HEAD OFFICE)
                </h4>
              </div>

              <div className="space-y-2 text-xs text-[#aab9c0]">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-[#d4af37]/80 shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    Kathmandu, Nepal
                    <br />
                    <span className="text-slate-400 text-[11px]">Thamel Marg, P.O. Box 11870</span>
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Phone className="w-3.5 h-3.5 text-[#d4af37]/80 shrink-0" />
                  <a
                    href="tel:+97714701884"
                    className="hover:text-[#d4af37] transition-colors"
                  >
                    +977-1-4567890 / +977 14701884
                  </a>
                </div>

                <div className="flex items-center gap-2.5">
                  <Mail className="w-3.5 h-3.5 text-[#d4af37]/80 shrink-0" />
                  <a
                    href="mailto:info@kharka.com"
                    className="hover:text-[#d4af37] transition-colors"
                  >
                    info@kharka.com
                  </a>
                </div>
              </div>

              {/* Exact user requirements: Sun-Fri in green, Closed Saturday in gold */}
              <div className="pt-2 border-t border-white/5 space-y-1">
                <div className="text-emerald-400 font-medium inline-flex items-center gap-1.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sun to Fri · 9:00 AM to 6:00 PM NPT</span>
                </div>
                <div>
                  <span className="text-[#e8b765] font-medium text-xs">
                    Closed Saturday
                  </span>
                </div>
              </div>
            </div>

            {/* COLUMN 3: TOP TREKS (lg:col-span-2) */}
            <div className="lg:col-span-2 space-y-3.5 lg:px-4 lg:border-r border-[#d4af37]/20">
              <div className="flex items-center gap-2 text-[#d4af37]">
                <Compass className="w-4 h-4 text-[#d4af37] shrink-0" />
                <h4 className="font-bold text-xs font-mono uppercase tracking-wider text-[#d4af37]">
                  TOP TREKS
                </h4>
              </div>

              <ul className="space-y-2 text-xs text-[#aab9c0]">
                <li>
                  <Link
                    href="/destinations/everest-base-camp-trek"
                    className="group inline-flex items-center justify-between w-full hover:text-[#d4af37] hover:translate-x-1 transition-all"
                  >
                    <span>Everest Base Camp</span>
                    <span className="text-[#d4af37]/70 group-hover:text-[#d4af37] group-hover:translate-x-0.5 transition-transform">
                      ›
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/destinations/everest-base-camp-trek-helicopter-return"
                    className="group inline-flex items-center justify-between w-full hover:text-[#d4af37] hover:translate-x-1 transition-all"
                  >
                    <span>EBC Helicopter Return</span>
                    <span className="text-[#d4af37]/70 group-hover:text-[#d4af37] group-hover:translate-x-0.5 transition-transform">
                      ›
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/destinations/annapurna-circuit-trek"
                    className="group inline-flex items-center justify-between w-full hover:text-[#d4af37] hover:translate-x-1 transition-all"
                  >
                    <span>Annapurna Circuit</span>
                    <span className="text-[#d4af37]/70 group-hover:text-[#d4af37] group-hover:translate-x-0.5 transition-transform">
                      ›
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/destinations/annapurna-base-camp-trek"
                    className="group inline-flex items-center justify-between w-full hover:text-[#d4af37] hover:translate-x-1 transition-all"
                  >
                    <span>Annapurna Base Camp</span>
                    <span className="text-[#d4af37]/70 group-hover:text-[#d4af37] group-hover:translate-x-0.5 transition-transform">
                      ›
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/destinations/langtang-valley-trek"
                    className="group inline-flex items-center justify-between w-full hover:text-[#d4af37] hover:translate-x-1 transition-all"
                  >
                    <span>Langtang Valley</span>
                    <span className="text-[#d4af37]/70 group-hover:text-[#d4af37] group-hover:translate-x-0.5 transition-transform">
                      ›
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/destinations/manaslu-circuit-trek"
                    className="group inline-flex items-center justify-between w-full hover:text-[#d4af37] hover:translate-x-1 transition-all"
                  >
                    <span>Manaslu Circuit</span>
                    <span className="text-[#d4af37]/70 group-hover:text-[#d4af37] group-hover:translate-x-0.5 transition-transform">
                      ›
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* COLUMN 4: QUICK LINKS (lg:col-span-2) */}
            <div className="lg:col-span-2 space-y-3.5 lg:px-4 lg:border-r border-[#d4af37]/20">
              <div className="flex items-center gap-2 text-[#d4af37]">
                <LinkIcon className="w-4 h-4 text-[#d4af37] shrink-0" />
                <h4 className="font-bold text-xs font-mono uppercase tracking-wider text-[#d4af37]">
                  QUICK LINKS
                </h4>
              </div>

              <ul className="space-y-2 text-xs text-[#aab9c0]">
                <li>
                  <Link
                    href="/about"
                    className="group inline-flex items-center justify-between w-full hover:text-[#d4af37] hover:translate-x-1 transition-all"
                  >
                    <span>About Us</span>
                    <span className="text-[#d4af37]/70 group-hover:text-[#d4af37] group-hover:translate-x-0.5 transition-transform">
                      ›
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/process"
                    className="group inline-flex items-center justify-between w-full hover:text-[#d4af37] hover:translate-x-1 transition-all"
                  >
                    <span>Our Process</span>
                    <span className="text-[#d4af37]/70 group-hover:text-[#d4af37] group-hover:translate-x-0.5 transition-transform">
                      ›
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/journal"
                    className="group inline-flex items-center justify-between w-full hover:text-[#d4af37] hover:translate-x-1 transition-all"
                  >
                    <span>Journal</span>
                    <span className="text-[#d4af37]/70 group-hover:text-[#d4af37] group-hover:translate-x-0.5 transition-transform">
                      ›
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="group inline-flex items-center justify-between w-full hover:text-[#d4af37] hover:translate-x-1 transition-all"
                  >
                    <span>Contact Us</span>
                    <span className="text-[#d4af37]/70 group-hover:text-[#d4af37] group-hover:translate-x-0.5 transition-transform">
                      ›
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/destinations"
                    className="group inline-flex items-center justify-between w-full hover:text-[#d4af37] hover:translate-x-1 transition-all"
                  >
                    <span>All Destinations</span>
                    <span className="text-[#d4af37]/70 group-hover:text-[#d4af37] group-hover:translate-x-0.5 transition-transform">
                      ›
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* COLUMN 5: GLOBAL SUPPORT & SOCIALS (lg:col-span-2) */}
            <div className="lg:col-span-2 space-y-4 lg:pl-4">
              <div className="flex items-center gap-2 text-[#d4af37]">
                <Globe className="w-4 h-4 text-[#d4af37] shrink-0" />
                <h4 className="font-bold text-xs font-mono uppercase tracking-wider text-[#d4af37]">
                  GLOBAL SUPPORT
                </h4>
              </div>

              <div className="space-y-1.5 text-xs text-[#aab9c0]">
                <div>
                  <span className="text-slate-300 font-medium">Australia:</span>{" "}
                  <a
                    href="https://wa.me/61426378149"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#d4af37] transition-colors"
                  >
                    +61 426 378 149
                  </a>
                </div>
                <div>
                  <span className="text-slate-300 font-medium">Japan:</span>{" "}
                  <a
                    href="https://wa.me/818041070813"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#d4af37] transition-colors"
                  >
                    +81 80 4107 0813
                  </a>
                </div>
              </div>

              {/* Prominent Colorful Social Icons matching Reference Design */}
              <div className="pt-2 flex items-center gap-2.5">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:shadow-[0_0_12px_rgba(24,119,242,0.6)] cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:shadow-[0_0_12px_rgba(220,39,67,0.6)] cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center text-white transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:shadow-[0_0_12px_rgba(255,0,0,0.6)] cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                {/* X (Twitter) */}
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X"
                  className="w-8 h-8 rounded-full bg-black border border-slate-700/80 flex items-center justify-center text-white transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:shadow-[0_0_12px_rgba(255,255,255,0.3)] cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          3. BOTTOM BAR (Clean, Elegant, Gold-Accented)
          Accreditations, Payment Methods, Copyright, Legal Links
          ────────────────────────────────────────────────────────── */}
      <div className="w-full bg-[#041219] border-t border-[#d4af37]/30 py-4 sm:py-5 px-6 lg:px-12 text-[11px] text-[#aab9c0]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Badges & Payment Methods */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4">
            {/* Secure Booking */}
            <div className="inline-flex items-center gap-1.5 text-white/90">
              <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
              <span className="font-medium">Secure Booking</span>
            </div>

            <span className="text-[#d4af37]/40 hidden sm:inline">|</span>

            {/* NMA Member */}
            <div className="inline-flex items-center gap-1.5 text-white/90">
              <Mountain className="w-4 h-4 text-[#d4af37]" />
              <span className="font-medium">NMA Member</span>
            </div>

            <span className="text-[#d4af37]/40 hidden sm:inline">|</span>

            {/* Payment Logos */}
            <div className="flex items-center gap-2.5">
              {/* VISA */}
              <div className="px-2 py-0.5 rounded bg-white text-[#1A1F71] font-bold text-[10px] tracking-wider italic flex items-center shadow-xs">
                VISA
              </div>

              {/* Mastercard */}
              <div className="px-2 py-0.5 rounded bg-[#1e293b] flex items-center shadow-xs">
                <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B] opacity-90" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] -ml-1.5 opacity-90" />
              </div>

              {/* PayPal */}
              <div className="px-2 py-0.5 rounded bg-[#003087] text-white font-bold text-[10px] tracking-tight flex items-center shadow-xs">
                <span className="italic font-sans text-cyan-300">P</span>
                <span className="italic font-sans text-blue-200">P</span>
              </div>

              {/* Stripe */}
              <div className="px-2 py-0.5 rounded bg-[#635BFF] text-white font-bold text-[10px] tracking-tight shadow-xs">
                stripe
              </div>
            </div>
          </div>

          {/* Right: Copyright & Legal */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 text-slate-400 font-light">
            <span>© 2026 KHARKA. All rights reserved.</span>
            <span className="text-[#d4af37]/40">|</span>
            <Link href="/about" className="hover:text-[#d4af37] transition-colors">
              Privacy Policy
            </Link>
            <span className="text-[#d4af37]/40">|</span>
            <Link href="/process" className="hover:text-[#d4af37] transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
