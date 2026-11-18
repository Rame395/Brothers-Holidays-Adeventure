"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════
   BROTHERS HOLIDAYS ADVENTURE — CINEMATIC ANIMATED FOOTER
   Deep navy Himalayan panorama · gold borders · animated elements
   ═══════════════════════════════════════════════════════════════ */

export default function Footer() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const footerRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setName("");
      setEmail("");
    }, 4000);
  };

  // Scroll-reveal for the footer
  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative w-full overflow-hidden text-sm selection:bg-[#c9a46a] selection:text-white border-t border-[#c9a46a]/60 shadow-[0_-6px_30px_rgba(201,164,106,0.22)]"
    >
      <style>{`
        @keyframes ft-drift { 0%,100%{transform:translateX(0) scale(1.05)} 50%{transform:translateX(-1.5%) scale(1.07)} }
        @keyframes ft-rise { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ft-glow { 0%,100%{opacity:.45} 50%{opacity:.75} }
        .ft-drift { animation: ft-drift 26s ease-in-out infinite; }
        .ft-rise { opacity:0; animation: ft-rise .8s cubic-bezier(.22,.68,.36,1) forwards; }
        .ft-glow { animation: ft-glow 3.5s ease-in-out infinite; }
        @media(prefers-reduced-motion:reduce){
          .ft-drift,.ft-rise,.ft-glow { animation:none!important; opacity:1!important; }
        }
      `}</style>

      {/* ─── CINEMATIC HIMALAYAN BACKGROUND ─── */}
      <div
        className="ft-drift absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/footer-bg-himalaya.jpg')" }}
        aria-hidden
      />

      {/* Dark overlay for contrast and typography sharpness */}
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            "linear-gradient(180deg, rgba(7,11,18,0.85) 0%, rgba(7,11,18,0.72) 30%, rgba(7,11,18,0.78) 60%, rgba(7,11,18,0.96) 100%)",
        }}
      />

      {/* Warm sunset rim light on eastern horizon */}
      <div
        className="ft-glow absolute right-0 top-0 w-[42%] h-full pointer-events-none"
        aria-hidden
        style={{
          background: "radial-gradient(ellipse at 90% 28%, rgba(201,164,106,0.18), transparent 65%)",
        }}
      />

      {/* ─── 0. TOP LUMINOUS GOLD BORDER (Separating Section Above Footer & Footer) ─── */}
      <div className="relative z-20 w-full h-[2px] bg-gradient-to-r from-transparent via-[#c9a46a] to-transparent opacity-95 shadow-[0_0_14px_rgba(201,164,106,0.7)]" />

      {/* ═══════════════════════════════════════════════════
          1. NEWSLETTER BANNER
          ═══════════════════════════════════════════════════ */}
      <div className="relative z-10">
        <div
          className={`max-w-6xl mx-auto px-6 sm:px-8 py-10 sm:py-12 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10 ${
            revealed ? "ft-rise" : "opacity-0"
          }`}
          style={{ animationDelay: "0.1s" }}
        >
          {/* Left text */}
          <div className="text-center lg:text-left shrink-0">
            <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#c9a46a] mb-2">
              <svg className="w-3.5 h-3.5 text-[#c9a46a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Expedition Dispatches
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif text-white tracking-tight">
              Subscribe To Our <em className="text-[#e9cf9b]">Newsletter</em>
            </h3>
          </div>

          {/* Form */}
          {subscribed ? (
            <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/5 border border-[#c9a46a]/60 backdrop-blur-sm shadow-[0_0_15px_rgba(201,164,106,0.25)]">
              <svg className="w-4 h-4 text-[#c9a46a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-white font-medium">Subscribed to field dispatches.</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row items-stretch gap-3 w-full lg:w-auto"
            >
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c9a46a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full sm:w-44 pl-10 pr-4 py-3 rounded-lg bg-[#07131a]/80 border border-[#c9a46a]/40 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#c9a46a] focus:ring-1 focus:ring-[#c9a46a]/30 backdrop-blur-sm transition-all"
                />
              </div>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c9a46a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  type="email"
                  required
                  placeholder="Your Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full sm:w-56 pl-10 pr-4 py-3 rounded-lg bg-[#07131a]/80 border border-[#c9a46a]/40 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#c9a46a] focus:ring-1 focus:ring-[#c9a46a]/30 backdrop-blur-sm transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-7 py-3 rounded-lg bg-gradient-to-r from-[#e8b765] via-[#dfa851] to-[#c9a46a] text-[#071317] font-semibold text-sm uppercase tracking-wider transition-all hover:brightness-110 hover:shadow-[0_0_22px_rgba(201,164,106,0.55)] active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                Subscribe
                <svg className="w-4 h-4 text-[#071317]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ─── PROMINENT GOLD DIVIDER BETWEEN NEWSLETTER & COLUMNS ─── */}
      <div className="relative z-20 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#c9a46a]/85 to-transparent shadow-[0_0_12px_rgba(201,164,106,0.45)]" />

      {/* ═══════════════════════════════════════════════════
          2. MAIN FOOTER BODY — Columns with Vertical Gold Dividers
          ═══════════════════════════════════════════════════ */}
      <div className="relative z-10">
        <div
          className={`max-w-6xl mx-auto px-6 sm:px-8 py-12 sm:py-14 ${
            revealed ? "ft-rise" : "opacity-0"
          }`}
          style={{ animationDelay: "0.3s" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-y-10 lg:gap-y-0">
            {/* Col 1: Brand & Social */}
            <div className="lg:pr-8 space-y-4">
              <Link href="/" className="inline-block transition-transform hover:scale-105">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/brothers_logo_navbar.png"
                  alt="BROTHERS Holidays Adventure"
                  className="h-10 sm:h-12 w-auto object-contain drop-shadow-md"
                />
              </Link>
              <p className="text-white/65 text-[13px] leading-relaxed max-w-[220px]">
                Experience the high Himalayas with Brothers — where every journey becomes a story.
              </p>
              {/* Social badges */}
              <div className="flex items-center gap-2.5 pt-2">
                {[
                  { label: "Facebook", href: "https://facebook.com", color: "hover:bg-[#1877F2]", icon: "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12z" },
                  { label: "Instagram", href: "https://instagram.com", color: "hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888]", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
                  { label: "YouTube", href: "https://youtube.com", color: "hover:bg-[#FF0000]", icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
                  { label: "X", href: "https://x.com", color: "hover:bg-white/20", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className={`w-8 h-8 rounded-full bg-white/10 ${s.color} flex items-center justify-center text-white/80 hover:text-white transition-all duration-300 hover:scale-110 border border-white/10`}
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d={s.icon} /></svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2: Nepal Head Office (with vertical gold left border) */}
            <div className="lg:border-l lg:border-[#c9a46a]/30 lg:pl-8 space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#c9a46a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                </svg>
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c9a46a]">
                  Nepal (Head Office)
                </h4>
              </div>
              <div className="space-y-2 text-white/65 text-[13px]">
                <p className="leading-snug">
                  Thamel Marg,<br />Kathmandu, Nepal
                </p>
                <p className="leading-snug">
                  <a href="tel:+97714701884" className="hover:text-[#e9cf9b] transition-colors">
                    +977 14701884
                  </a>
                </p>
                <p className="leading-snug">
                  <a href="mailto:info@brothersholidays.com" className="hover:text-[#e9cf9b] transition-colors">
                    info@brothersholidays.com
                  </a>
                </p>
              </div>
              <div className="pt-2 text-[12px] leading-snug">
                <span className="text-emerald-400 font-medium inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sun–Fri · 9 AM – 6 PM NPT
                </span>
                <br />
                <span className="text-[#e9cf9b]/80 text-[11px]">Closed Saturday</span>
              </div>
            </div>

            {/* Col 3: Top Treks (with vertical gold left border) */}
            <div className="lg:border-l lg:border-[#c9a46a]/30 lg:pl-8 space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#c9a46a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 9.192-9.192 3.536 3.536-9.192 9.192-3.536z" />
                </svg>
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c9a46a]">
                  Top Treks
                </h4>
              </div>
              <ul className="space-y-2 text-white/65 text-[13px]">
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
                      className="inline-flex items-center gap-1.5 hover:text-white transition-colors group"
                    >
                      <span className="text-[#c9a46a] group-hover:translate-x-0.5 transition-transform text-xs">›</span>
                      <span>{trek.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Quick Links (with vertical gold left border) */}
            <div className="lg:border-l lg:border-[#c9a46a]/30 lg:pl-8 space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#c9a46a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c9a46a]">
                  Quick Links
                </h4>
              </div>
              <ul className="space-y-2 text-white/65 text-[13px]">
                {[
                  { name: "About Us", href: "/about" },
                  { name: "All Destinations", href: "/destinations" },
                  { name: "Our Process", href: "/process" },
                  { name: "Journal", href: "/journal" },
                  { name: "Contact Us", href: "/contact" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-1.5 hover:text-white transition-colors group"
                    >
                      <span className="text-[#c9a46a] group-hover:translate-x-0.5 transition-transform text-xs">›</span>
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 5: Global Support (with vertical gold left border) */}
            <div className="lg:border-l lg:border-[#c9a46a]/30 lg:pl-8 space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#c9a46a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a14.2 14.2 0 00-4 9 14.2 14.2 0 004 9 14.2 14.2 0 004-9 14.2 14.2 0 00-4-9z" />
                </svg>
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c9a46a]">
                  Global Support
                </h4>
              </div>
              <div className="space-y-3 text-white/65 text-[13px]">
                <p>
                  <strong className="text-white font-medium block">Australia:</strong>
                  <a href="https://wa.me/61426378149" className="hover:text-[#e9cf9b] transition-colors">
                    +61 426 378 149
                  </a>
                </p>
                <p>
                  <strong className="text-white font-medium block">Japan:</strong>
                  <a href="https://wa.me/818041070813" className="hover:text-[#e9cf9b] transition-colors">
                    +81 80 4107 0813
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── PROMINENT GOLD DIVIDER ABOVE BOTTOM BAR ─── */}
      <div className="relative z-20 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#c9a46a]/85 to-transparent shadow-[0_0_12px_rgba(201,164,106,0.45)]" />

      {/* ═══════════════════════════════════════════════════
          3. BOTTOM BAR — Accreditation, Payments & Copyright
          ═══════════════════════════════════════════════════ */}
      <div className="relative z-10 bg-[#04080e]/60">
        <div
          className={`max-w-6xl mx-auto px-6 sm:px-8 py-5 ${
            revealed ? "ft-rise" : "opacity-0"
          }`}
          style={{ animationDelay: "0.5s" }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            {/* Accreditation + Payments */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#c9a46a]/40 bg-[#07131a]/80 text-[#e9cf9b] font-medium tracking-wide shadow-sm">
                <svg className="w-3.5 h-3.5 text-[#c9a46a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                Secure Booking
              </span>
              <span className="px-3 py-1 rounded-full border border-white/15 bg-white/[0.04] text-white/70 font-medium tracking-wide">
                NMA Certified
              </span>
              <span className="px-3 py-1 rounded-full border border-white/15 bg-white/[0.04] text-white/70 font-medium tracking-wide">
                TAAN Member
              </span>
              <span className="text-white/30 hidden sm:inline">|</span>
              <span className="text-white/60 font-medium tracking-wide hidden sm:inline">
                VISA · Mastercard · AMEX · Stripe · SWIFT
              </span>
            </div>

            {/* Copyright & Govt Registration */}
            <p className="text-[11px] text-white/45 sm:text-right">
              © 2026 Brothers Holidays Adventure Pvt. Ltd. · Govt. Regd. 58177/068/069
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
