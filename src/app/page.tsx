"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { TREKS } from "@/data/treks";
import AnimatedStat from "@/components/AnimatedStat";
import MirrorHighRoutes from "@/components/MirrorHighRoutes";
import { Hero } from "@/components/hero/Hero";
import {
  Calendar,
  BookOpen,
  Mail,
  ArrowRight,
  Mountain,
  Star,
  Send,
  Bell,
  ShieldCheck,
  BarChart3,
  User,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    interest: "",
    route: "",
    startDate: "",
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

      {/* SECTIONS 3 & 4: WHO WE ARE, TRUST, BY THE NUMBERS & ENQUIRY */}
      <section
        id="who-we-are"
        className="w-full relative overflow-hidden py-20 lg:py-28 bg-[#e8f7f7] text-[#0b3d47]"
      >
        {/* Subtle Himalayan mountain background with icy-blue atmosphere */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-40 mix-blend-multiply"
          style={{
            backgroundImage: "url('/images/cta-himalaya-bg.jpg')",
            backgroundPosition: "center 28%",
          }}
        />

        {/* Soft atmospheric gradient wash ensuring perfect readability and icy elegance */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#e8f7f7]/90 via-[#dcf1f4]/75 to-[#e8f7f7]/95 pointer-events-none" />

        {/* Topographic contour vector lines in the top-left corner */}
        <div className="absolute top-0 left-0 w-80 sm:w-96 lg:w-[480px] h-72 pointer-events-none opacity-20 select-none overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 500 350" fill="none">
            <path d="M -40,30 Q 90,20 160,70 T 280,160 T 380,290" stroke="#0f5d63" strokeWidth="1.2" opacity="0.6" />
            <path d="M -40,80 Q 110,60 190,120 T 320,220 T 430,350" stroke="#0f5d63" strokeWidth="1.2" opacity="0.5" />
            <path d="M -40,140 Q 130,110 230,170 T 360,280 T 470,400" stroke="#0f5d63" strokeWidth="1.2" opacity="0.4" />
            <path d="M -40,200 Q 150,160 260,230 T 400,330 T 510,440" stroke="#0f5d63" strokeWidth="1.2" opacity="0.3" />
            <path d="M -40,260 Q 170,210 290,280 T 440,380 T 550,490" stroke="#0f5d63" strokeWidth="1.2" opacity="0.2" />
          </svg>
        </div>

        {/* Anchor for #enquiry navigation */}
        <div id="enquiry" className="absolute top-1/2 -mt-24 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 space-y-12 lg:space-y-16">
          {/* A. WHO WE ARE & CREDIBILITY CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Column: Heading & Company Intro Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-[2px] bg-[#d4af37]" />
                <span className="text-[11px] font-bold tracking-[0.2em] text-[#0b3d47] uppercase">
                  OUR JOURNEY
                </span>
              </div>

              <h2 className="font-serif text-4xl sm:text-5xl text-[#0b3d47] font-normal tracking-tight">
                Who we <span className="italic font-serif text-[#d4af37]">are</span>
              </h2>

              <div className="rounded-2xl bg-white/75 backdrop-blur-md p-6 border border-[#0f5d63]/15 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-[#0f5d63]/10 text-[#0f5d63] flex items-center justify-center">
                  <Mountain className="w-5 h-5" />
                </div>
                <p className="text-sm text-[#4a5568] leading-relaxed">
                  BROTHERS Holidays Adventure is more than a trek — it&apos;s a journey into the heart of the
                  Himalayas, crafted for explorers, dreamers and seekers.
                </p>
                <div className="pt-2 border-t border-[#0f5d63]/10 flex items-center justify-between">
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0f5d63] hover:text-[#0b3d47] group transition-colors"
                  >
                    <span>Learn more about us</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <span className="text-[10px] font-mono text-[#0f5d63]/70 uppercase tracking-wider">
                    NMA-884
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Mission Statement & Three Cards */}
            <div className="lg:col-span-8 space-y-8">
              <p className="font-serif text-xl sm:text-2xl lg:text-[26px] text-[#0b3d47] leading-snug font-normal max-w-3xl">
                We build epic, meaningful journeys into the high Himalayas, beyond
                what&apos;s expected—unrivalled guides and trusted by{" "}
                <span className="text-[#d4af37] font-semibold">1,000+</span> stronger
                mountain community.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Credibility Card 1: Our Trekkers */}
                <div className="rounded-2xl bg-white/80 backdrop-blur-md p-5 border border-[#0f5d63]/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all space-y-4 flex flex-col justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#0f5d63]/10 text-[#0f5d63] flex items-center justify-center shrink-0">
                      <Mountain className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold tracking-widest text-[#6b7280] uppercase">
                      OUR TREKKERS
                    </span>
                  </div>
                  <div>
                    <div className="font-serif text-3xl font-normal text-[#0b3d47]">
                      1k+
                    </div>
                    <p className="text-xs text-[#6b7280] mt-1 leading-relaxed">
                      Adventurers who trusted BROTHERS
                    </p>
                  </div>
                  <Link
                    href="/archive"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#d4af37] hover:text-[#b39029] group transition-colors pt-1"
                  >
                    <span>Explore stories</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                {/* Credibility Card 2: Expeditions */}
                <div className="rounded-2xl bg-white/80 backdrop-blur-md p-5 border border-[#0f5d63]/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all space-y-4 flex flex-col justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#0f5d63]/10 text-[#0f5d63] flex items-center justify-center shrink-0">
                      <svg
                        className="w-4 h-4 text-[#0f5d63]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <circle cx="14" cy="4" r="2" />
                        <path d="M7 7.5c0-.8.7-1.5 1.5-1.5h1.8c.8 0 1.5.7 1.5 1.5v5.2c0 .8-.7 1.5-1.5 1.5H8.5c-.8 0-1.5-.7-1.5-1.5V7.5z" opacity="0.9" />
                        <path d="M13.2 6.8c-.5-.5-1.1-.8-1.8-.8H10v3h2.3l1.8 3.5-2.1 4.5-3.5-2.2-.8 1.6 4.3 2.7c.6.4 1.4.3 1.9-.3l2.3-4.2 2 2.2V22h2v-6.2c0-.6-.3-1.2-.7-1.6l-2.4-2.6 1.1-2.8H21V7h-4.8l-1.9-1.2c-.3-.3-.7-.5-1.1-.5z" />
                        <line x1="19.5" y1="8" x2="18.5" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold tracking-widest text-[#6b7280] uppercase">
                      EXPEDITIONS
                    </span>
                  </div>
                  <div>
                    <div className="font-serif text-3xl font-normal text-[#0b3d47]">
                      250+
                    </div>
                    <p className="text-xs text-[#6b7280] mt-1 leading-relaxed">
                      Successful treks across Himalayas
                    </p>
                  </div>
                  <Link
                    href="/destinations"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#d4af37] hover:text-[#b39029] group transition-colors pt-1"
                  >
                    <span>View all trips</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                {/* Credibility Card 3: Customer Rating */}
                <div className="rounded-2xl bg-white/80 backdrop-blur-md p-5 border border-[#0f5d63]/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all space-y-4 flex flex-col justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#0f5d63]/10 text-[#0f5d63] flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <span className="text-[10px] font-bold tracking-widest text-[#6b7280] uppercase">
                      CUSTOMER RATING
                    </span>
                  </div>
                  <div>
                    <div className="font-serif text-3xl font-normal text-[#0b3d47]">
                      4.9<span className="text-lg text-[#6b7280]">/5</span>
                    </div>
                    <p className="text-xs text-[#6b7280] mt-1 leading-relaxed">
                      From our global adventurers
                    </p>
                  </div>
                  <Link
                    href="/journal"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#d4af37] hover:text-[#b39029] group transition-colors pt-1"
                  >
                    <span>Read reviews</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* B. BROTHERS BY THE NUMBERS */}
          <div className="rounded-2xl bg-white/60 backdrop-blur-md p-6 sm:p-8 border border-[#0f5d63]/15 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-[#0f5d63]">
              <BarChart3 className="w-4 h-4" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase">
                BROTHERS BY THE NUMBERS
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {/* Stat 1 */}
              <div className="space-y-1 md:pr-6 md:border-r border-[#0f5d63]/15">
                <div className="font-serif text-3xl sm:text-4xl text-[#0b3d47] font-normal">
                  10+
                </div>
                <div className="text-xs sm:text-sm text-[#6b7280]">
                  Years of Experience
                </div>
              </div>

              {/* Stat 2 */}
              <div className="space-y-1 md:pr-6 md:border-r border-[#0f5d63]/15">
                <div className="font-serif text-3xl sm:text-4xl text-[#0b3d47] font-normal">
                  100+
                </div>
                <div className="text-xs sm:text-sm text-[#6b7280]">
                  Expert Guides
                </div>
              </div>

              {/* Stat 3 */}
              <div className="space-y-1 md:pr-6 md:border-r border-[#0f5d63]/15">
                <div className="font-serif text-3xl sm:text-4xl text-[#0b3d47] font-normal">
                  5,116 m
                </div>
                <div className="text-xs sm:text-sm text-[#6b7280]">
                  Highest Altitude
                </div>
              </div>

              {/* Stat 4 (Highlighted in gold) */}
              <div className="space-y-1">
                <div className="font-serif text-3xl sm:text-4xl text-[#d4af37] font-normal">
                  25+
                </div>
                <div className="text-xs sm:text-sm text-[#d4af37]/90 font-medium">
                  Destinations
                </div>
              </div>
            </div>
          </div>

          {/* C. BEGIN AN ENQUIRY / STAY CONNECTED */}
          <div className="rounded-3xl shadow-xl overflow-hidden border border-[#0f5d63]/20 grid grid-cols-1 lg:grid-cols-12 bg-white">
            {/* Left Panel: Deep Teal */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#0b3d47] via-[#0b3d47] to-[#085459] p-8 sm:p-10 lg:p-12 text-white relative overflow-hidden flex flex-col justify-between space-y-8">
              {/* Background topographic contour decoration */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
                  <circle cx="200" cy="200" r="180" stroke="currentColor" strokeWidth="1" />
                  <circle cx="200" cy="200" r="140" stroke="currentColor" strokeWidth="1" />
                  <circle cx="200" cy="200" r="100" stroke="currentColor" strokeWidth="1" />
                  <circle cx="200" cy="200" r="60" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>

              <div className="relative space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full border border-[#d4af37]/50 bg-[#072b33]/80 flex items-center justify-center text-[#d4af37] shadow-inner">
                    <Send className="w-4 h-4 rotate-[-15deg]" />
                  </div>
                  <span className="text-[11px] font-bold tracking-[0.2em] text-[#d4af37] uppercase">
                    STAY CONNECTED
                  </span>
                </div>

                <h3 className="font-serif text-3xl sm:text-4xl text-white font-normal leading-tight">
                  Open the Journey
                </h3>

                <p className="text-sm text-slate-200/90 leading-relaxed font-light">
                  Get travel tips, route updates, and exclusive offers straight to your inbox.
                </p>
              </div>

              {/* Three Benefit Points */}
              <div className="relative pt-6 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#d4af37] shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-slate-100 font-medium">
                    Expert Trekking Insights
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#d4af37] shrink-0">
                    <Mountain className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-slate-100 font-medium">
                    Exclusive Expedition Offers
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#d4af37] shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-slate-100 font-medium">
                    New Routes &amp; Adventures
                  </span>
                </div>
              </div>
            </div>

            {/* Right Panel: Clean White Form */}
            <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 bg-white flex flex-col justify-center">
              {!enquirySuccess ? (
                <form className="space-y-5" onSubmit={handleEnquirySubmit}>
                  {/* Field 1: Name */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="enquiry-name"
                      className="block text-[11px] font-bold tracking-wider text-[#374151] uppercase"
                    >
                      YOUR NAME
                    </label>
                    <div className="relative">
                      <input
                        id="enquiry-name"
                        type="text"
                        required
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full h-12 px-4 pr-11 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0f5d63] focus:ring-1 focus:ring-[#0f5d63] transition-colors"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Field 2: Email */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="enquiry-email"
                      className="block text-[11px] font-bold tracking-wider text-[#374151] uppercase"
                    >
                      YOUR EMAIL ADDRESS
                    </label>
                    <div className="relative">
                      <input
                        id="enquiry-email"
                        type="email"
                        required
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full h-12 px-4 pr-11 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0f5d63] focus:ring-1 focus:ring-[#0f5d63] transition-colors"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Field 3: Select Interest / Route */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="enquiry-interest"
                      className="block text-[11px] font-bold tracking-wider text-[#374151] uppercase"
                    >
                      SELECT INTEREST
                    </label>
                    <div className="relative">
                      <select
                        id="enquiry-interest"
                        value={formData.interest}
                        onChange={(e) =>
                          setFormData({ ...formData, interest: e.target.value })
                        }
                        className="w-full h-12 px-4 pr-11 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white appearance-none [appearance:none] [-webkit-appearance:none] [-moz-appearance:none] focus:outline-none focus:border-[#0f5d63] focus:ring-1 focus:ring-[#0f5d63] transition-colors cursor-pointer truncate"
                      >
                        <option value="" disabled>
                          Choose what interests you
                        </option>
                        <option value="everest">
                          Everest Base Camp &amp; High Passes
                        </option>
                        <option value="annapurna">
                          Annapurna Circuit &amp; Sanctuary
                        </option>
                        <option value="manaslu">
                          Manaslu Circuit &amp; Larkya La
                        </option>
                        <option value="langtang">
                          Langtang Valley &amp; Kyanjin Ri
                        </option>
                        <option value="mustang">
                          Upper Mustang &amp; Restricted Areas
                        </option>
                        <option value="custom">
                          Bespoke Alpine Traverse / Survey
                        </option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-full bg-[#085459] hover:bg-[#0b3d47] active:scale-[0.99] text-white font-medium text-sm tracking-wide flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
                    >
                      <span>{isSubmitting ? "Submitting..." : "Subscribe Now"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="flex items-center justify-center gap-1.5 text-xs text-[#6b7280] mt-3">
                      <ShieldCheck className="w-4 h-4 text-[#0f5d63]" />
                      <span>No spam. Just inspiring journeys.</span>
                    </div>
                  </div>
                </form>
              ) : (
                /* Success Confirmation State */
                <div className="py-8 flex flex-col items-center text-center space-y-4 animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-[#0f5d63]/10 text-[#0f5d63] flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="font-serif text-2xl text-[#0b3d47] font-normal">
                    Welcome to the Journey
                  </h4>
                  <p className="text-sm text-[#6b7280] max-w-sm leading-relaxed">
                    Thank you, <strong>{formData.name || "Adventurer"}</strong>!
                    Your expedition brief and trail dispatches will be sent to{" "}
                    <strong>{formData.email}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEnquirySuccess(false);
                      setFormData({
                        name: "",
                        email: "",
                        interest: "",
                        route: "",
                        startDate: "",
                      });
                    }}
                    className="mt-2 px-6 py-2 rounded-full bg-[#e8f7f7] hover:bg-[#d4eff2] text-[#0f5d63] font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    Send Another Enquiry
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: CLOSING CALL TO ACTION */}
      <section
        className="w-full relative overflow-hidden py-24 sm:py-32 lg:py-40 bg-[#07131a] bg-cover bg-center border-t border-[#c59a4a]/20"
        style={{
          backgroundImage: "url('/images/cta-himalaya-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Cinematic dark navy vignette & atmospheric overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07131e]/60 via-[#07131e]/40 to-[#07131e]/85 backdrop-brightness-[0.88]" />

        {/* Top-Left Topographic Contour lines */}
        <div className="absolute top-0 left-0 w-72 sm:w-96 lg:w-[460px] h-64 sm:h-80 pointer-events-none opacity-35 select-none overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 500 350" fill="none">
            <path d="M -40,40 Q 80,30 150,80 T 270,170 T 370,300" stroke="#c59a4a" strokeWidth="1.2" opacity="0.6" />
            <path d="M -40,90 Q 100,70 180,130 T 310,230 T 420,360" stroke="#c59a4a" strokeWidth="1.2" opacity="0.5" />
            <path d="M -40,150 Q 120,120 220,180 T 350,290 T 460,410" stroke="#c59a4a" strokeWidth="1.2" opacity="0.4" />
            <path d="M -40,210 Q 140,170 250,240 T 390,340 T 500,450" stroke="#c59a4a" strokeWidth="1.2" opacity="0.3" />
            <path d="M -40,270 Q 160,220 280,290 T 430,390 T 540,500" stroke="#c59a4a" strokeWidth="1.2" opacity="0.2" />
          </svg>
        </div>

        {/* Bottom-Right Topographic Contour lines */}
        <div className="absolute bottom-0 right-0 w-72 sm:w-96 lg:w-[460px] h-64 sm:h-80 pointer-events-none opacity-35 select-none overflow-hidden rotate-180">
          <svg className="w-full h-full" viewBox="0 0 500 350" fill="none">
            <path d="M -40,40 Q 80,30 150,80 T 270,170 T 370,300" stroke="#c59a4a" strokeWidth="1.2" opacity="0.6" />
            <path d="M -40,90 Q 100,70 180,130 T 310,230 T 420,360" stroke="#c59a4a" strokeWidth="1.2" opacity="0.5" />
            <path d="M -40,150 Q 120,120 220,180 T 350,290 T 460,410" stroke="#c59a4a" strokeWidth="1.2" opacity="0.4" />
            <path d="M -40,210 Q 140,170 250,240 T 390,340 T 500,450" stroke="#c59a4a" strokeWidth="1.2" opacity="0.3" />
            <path d="M -40,270 Q 160,220 280,290 T 430,390 T 540,500" stroke="#c59a4a" strokeWidth="1.2" opacity="0.2" />
          </svg>
        </div>

        {/* Content Container */}
        <div className="relative max-w-4xl mx-auto px-6 text-center space-y-6 sm:space-y-8">
          {/* Flanked Expedition Season Badge */}
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            <span className="w-10 sm:w-16 h-[1px] bg-gradient-to-r from-transparent to-[#c59a4a]/70" />
            <div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-1.5 rounded-full border border-[#c59a4a]/60 bg-[#07151e]/80 backdrop-blur-md text-[#e8b765] shadow-lg">
              {/* Trekker silhouette icon */}
              <svg
                className="w-4 h-4 text-[#e8b765] shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="14" cy="4" r="2" />
                <path d="M7 7.5c0-.8.7-1.5 1.5-1.5h1.8c.8 0 1.5.7 1.5 1.5v5.2c0 .8-.7 1.5-1.5 1.5H8.5c-.8 0-1.5-.7-1.5-1.5V7.5z" opacity="0.9" />
                <path d="M13.2 6.8c-.5-.5-1.1-.8-1.8-.8H10v3h2.3l1.8 3.5-2.1 4.5-3.5-2.2-.8 1.6 4.3 2.7c.6.4 1.4.3 1.9-.3l2.3-4.2 2 2.2V22h2v-6.2c0-.6-.3-1.2-.7-1.6l-2.4-2.6 1.1-2.8H21V7h-4.8l-1.9-1.2c-.3-.3-.7-.5-1.1-.5z" />
                <line x1="19.5" y1="8" x2="18.5" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.22em] text-[#e8b765] uppercase">
                Expedition Season 2026/27
              </span>
            </div>
            <span className="w-10 sm:w-16 h-[1px] bg-gradient-to-l from-transparent to-[#c59a4a]/70" />
          </div>

          {/* Heading */}
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white font-normal tracking-tight">
            Step onto the{" "}
            <span className="italic font-display text-[#e8b765]">trail</span>
          </h2>

          {/* Subheading */}
          <p className="text-slate-200/90 text-sm sm:text-base font-light max-w-xl mx-auto leading-relaxed">
            Base pricing from $1,850. Full permits and emergency insurance standard.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/destinations"
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-gradient-to-r from-[#e8b765] via-[#dfa851] to-[#c59a4a] text-[#071317] font-semibold text-sm tracking-wide flex items-center justify-center gap-2.5 shadow-lg shadow-[#c59a4a]/25 hover:brightness-110 active:scale-95 transition-all"
            >
              <Calendar className="w-4 h-4 text-[#071317]" />
              <span>Plan your route</span>
              <ArrowRight className="w-4 h-4 text-[#071317]" />
            </Link>
            <Link
              href="/journal"
              className="w-full sm:w-auto px-7 py-3 rounded-full border border-[#c59a4a]/60 bg-[#07151e]/60 hover:bg-[#07151e]/85 text-[#f3efe6] font-medium text-sm tracking-wide flex items-center justify-center gap-2.5 backdrop-blur-md active:scale-95 transition-all"
            >
              <BookOpen className="w-4 h-4 text-[#e8b765]" />
              <span>Read the journal</span>
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </Link>
          </div>

          {/* Email Subscription Capsule */}
          <div className="pt-4 max-w-xl mx-auto w-full">
            {quickSuccess ? (
              <div className="p-3.5 rounded-full border border-[#c59a4a]/60 bg-[#07151e]/85 backdrop-blur-md text-[#e8b765] font-medium text-sm text-center shadow-xl animate-fade-in">
                ✓ Field dispatch guide &amp; high-altitude maps sent to {quickEmail || "your inbox"}!
              </div>
            ) : (
              <form
                className="relative flex items-center rounded-full border border-[#c59a4a]/60 bg-[#07151e]/75 backdrop-blur-md px-5 py-2 shadow-2xl transition-all focus-within:border-[#e8b765] focus-within:ring-1 focus-within:ring-[#e8b765]/40"
                onSubmit={handleQuickSubmit}
              >
                <Mail className="w-4 h-4 text-[#e8b765] shrink-0 mr-3" />
                <input
                  className="bg-transparent text-white placeholder-slate-400/80 text-sm focus:outline-none flex-1 pr-12 py-1.5"
                  placeholder="your@email.com"
                  required
                  type="email"
                  value={quickEmail}
                  onChange={(e) => setQuickEmail(e.target.value)}
                />
                <button
                  aria-label="Submit email for route maps"
                  className="absolute right-2 w-9 h-9 rounded-full bg-gradient-to-r from-[#e8b765] to-[#c59a4a] text-[#071317] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
                  type="submit"
                >
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
