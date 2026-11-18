"use client";

import { useState } from "react";
import Link from "next/link";
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
    }, 4000);
  };

  return (
    <footer className="relative w-full bg-[#0a202a] text-slate-200 overflow-hidden text-xs selection:bg-[#00515b] selection:text-white border-t border-[#1c485a]">
      {/* ──────────────────────────────────────────────────────────
          1. CLEAN DIMMED HIMALAYAN MOUNTAIN TOP BANNER (Compact ~110px)
          Soft atmospheric alpine teal/slate (not black!)
          ────────────────────────────────────────────────────────── */}
      <div
        className="relative w-full py-5 px-4 sm:px-6 bg-cover bg-center bg-no-repeat border-b border-[#133644]"
        style={{
          backgroundImage: `url('/images/footer-mountains-clean.svg')`,
          backgroundPosition: "center top",
        }}
      >
        {/* Subtle dusk mist overlay to ensure high contrast without turning black */}
        <div className="absolute inset-0 bg-[#0a202a]/45 backdrop-blur-[0.5px] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="text-center md:text-left">
            <span className="block text-[10px] font-mono uppercase tracking-[0.22em] text-[#89d6e2] font-semibold">
              Expedition Dispatches
            </span>
            <h3 className="text-lg sm:text-xl font-serif text-white tracking-tight drop-shadow-sm">
              Subscribe To Our Newsletter
            </h3>
          </div>

          {/* Compact Inline Form */}
          {subscribed ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00515b]/90 border border-[#89d6e2]/40 text-emerald-300 text-xs font-medium">
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Subscribed to field updates.</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 w-full md:w-auto"
            >
              <input
                type="text"
                placeholder="Your name"
                value={newsletterName}
                onChange={(e) => setNewsletterName(e.target.value)}
                className="w-full sm:w-36 px-3 py-1.5 rounded bg-[#071922]/85 border border-[#2b596d]/60 text-white placeholder-slate-300 text-xs focus:outline-none focus:border-[#89d6e2]"
              />
              <input
                type="email"
                required
                placeholder="Your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full sm:w-52 px-3 py-1.5 rounded bg-[#071922]/85 border border-[#2b596d]/60 text-white placeholder-slate-300 text-xs focus:outline-none focus:border-[#89d6e2]"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-1.5 rounded bg-[#00515b] hover:bg-[#006b78] text-white font-medium text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shadow-sm border border-[#89d6e2]/30"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          2. COMPACT 4-COLUMN FOOTER BODY (Half-Page Density ~190px)
          Rich Deep Alpine Teal background (#0a202a, not pitch black)
          ────────────────────────────────────────────────────────── */}
      <div className="relative max-w-6xl mx-auto px-5 sm:px-6 py-6 z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Col 1: Nepal Head Office & Exact Operating Hours */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00515b]" />
              <h4 className="font-semibold text-white tracking-wide uppercase text-[11px] font-mono">
                Nepal (Head Office)
              </h4>
            </div>
            <p className="text-slate-300/90 leading-tight">
              Brothers Holidays Adventure Pvt. Ltd.
              <br />
              Thamel Marg, Kathmandu, Nepal
            </p>
            <p className="text-slate-300/80 leading-tight pt-0.5">
              Tel:{" "}
              <a href="tel:+97714701884" className="hover:text-[#89d6e2] transition-colors">
                +977 14701884
              </a>
              <br />
              WhatsApp:{" "}
              <a
                href="https://wa.me/9779851033819"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#89d6e2] transition-colors"
              >
                +977 9851033819
              </a>
            </p>

            {/* Exact user requirement:
                "make the section Sun to Fri · 9:00 AM to 6:00 PM NPT little green and the part Closed Saturday remains same color" */}
            <div className="pt-1.5 leading-snug">
              <span className="text-emerald-400 font-medium inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Sun to Fri · 9:00 AM to 6:00 PM NPT
              </span>
              <br />
              <span className="text-[#e8b765] font-medium">Closed Saturday</span>
            </div>
          </div>

          {/* Col 2: Top Treks */}
          <div className="space-y-1.5">
            <h4 className="font-semibold text-[#89d6e2] uppercase text-[11px] font-mono tracking-wider">
              Top Treks
            </h4>
            <ul className="space-y-1 text-slate-300/85">
              <li>
                <Link href="/destinations/everest-base-camp-trek" className="hover:text-white transition-colors">
                  Everest Base Camp Trek
                </Link>
              </li>
              <li>
                <Link href="/destinations/everest-base-camp-trek-helicopter-return" className="hover:text-white transition-colors">
                  EBC Helicopter Return
                </Link>
              </li>
              <li>
                <Link href="/destinations/annapurna-base-camp-trek" className="hover:text-white transition-colors">
                  Annapurna Base Camp
                </Link>
              </li>
              <li>
                <Link href="/destinations/manaslu-circuit-trek" className="hover:text-white transition-colors">
                  Manaslu Circuit Trek
                </Link>
              </li>
              <li>
                <Link href="/destinations/langtang-valley-trek" className="hover:text-white transition-colors">
                  Langtang Valley Trek
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div className="space-y-1.5">
            <h4 className="font-semibold text-[#89d6e2] uppercase text-[11px] font-mono tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-1 text-slate-300/85">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/destinations" className="hover:text-white transition-colors">
                  All Destinations
                </Link>
              </li>
              <li>
                <Link href="/process" className="hover:text-white transition-colors">
                  Company Accreditations
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Banking &amp; Contact
                </Link>
              </li>
              <li>
                <Link href="/enquire" className="hover:text-white transition-colors">
                  Customise Private Trip
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Global Liaison & Social Icons */}
          <div className="space-y-2">
            <h4 className="font-semibold text-[#89d6e2] uppercase text-[11px] font-mono tracking-wider">
              Global Support
            </h4>
            <p className="text-slate-300/85 leading-tight">
              <strong>Australia:</strong>{" "}
              <a href="https://wa.me/61426378149" className="hover:text-[#89d6e2]">
                +61 426 378 149
              </a>
              <br />
              <strong>Japan:</strong>{" "}
              <a href="https://wa.me/818041070813" className="hover:text-[#89d6e2]">
                +81 80 4107 0813
              </a>
            </p>

            {/* Compact Social Badges */}
            <div className="pt-1 flex items-center gap-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-6 h-6 rounded-full bg-[#1877F2]/90 hover:bg-[#1877F2] flex items-center justify-center text-white transition-transform hover:scale-110"
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12z" />
                </svg>
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="w-6 h-6 rounded-full bg-slate-800 hover:bg-black flex items-center justify-center text-white border border-slate-700 transition-transform hover:scale-110"
              >
                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white transition-transform hover:scale-110"
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-6 h-6 rounded-full bg-[#0A66C2]/90 hover:bg-[#0A66C2] flex items-center justify-center text-white transition-transform hover:scale-110"
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-6 h-6 rounded-full bg-[#FF0000]/90 hover:bg-[#FF0000] flex items-center justify-center text-white transition-transform hover:scale-110"
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          3. SLIM RIDGE & COMPACT BOTTOM BAR (~60px)
          Compact snow curve with climber silhouette on right + bottom info
          ────────────────────────────────────────────────────────── */}
      <div className="relative w-full">
        {/* Compact Snow Wave (only 32px height) */}
        <div className="relative w-full h-8 overflow-visible pointer-events-none">
          <svg
            viewBox="0 0 1920 40"
            preserveAspectRatio="none"
            className="w-full h-full text-white fill-current"
          >
            <path d="M 0,40 L 0,22 C 450,18 960,20 1340,15 C 1540,12 1700,5 1820,2 C 1870,1 1920,4 1920,4 L 1920,40 Z" />
          </svg>

          {/* White mountaineer climbing on top of snow crest */}
          <div className="absolute right-12 sm:right-20 md:right-28 -top-7 pointer-events-none">
            <HikerSilhouette className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
          </div>
        </div>

        {/* Clean, compact white bar */}
        <div className="w-full bg-white text-slate-600 py-2.5 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
            {/* Accreditation Badges */}
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-mono">
              <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-semibold text-slate-700">
                NTB Reg. 1509
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#00515b]/10 border border-[#00515b]/20 font-semibold text-[#00515b]">
                TAAN Member
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-semibold text-slate-700">
                NMA Certified
              </span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="hidden sm:inline font-sans text-slate-600 font-medium">
                VISA • Mastercard • AMEX • SWIFT
              </span>
            </div>

            {/* Copyright & Govt Registration */}
            <p className="text-slate-500 font-light text-[10px] sm:text-right">
              © 2026 Brothers Holidays Adventure Pvt. Ltd. · Govt. Regd. No: 58177/068/069
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
