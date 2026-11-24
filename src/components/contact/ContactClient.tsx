"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Clock,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import type { SiteSettingDTO } from "@/lib/types";
import {
  getStoredUtmParams,
  trackGenerateLead,
  trackWhatsAppClick,
} from "@/lib/analytics";

const DIAL_CODES = [
  { code: "+977", label: "+977 (NP)" },
  { code: "+1", label: "+1 (US)" },
  { code: "+44", label: "+44 (UK)" },
  { code: "+61", label: "+61 (AU)" },
  { code: "+91", label: "+91 (IN)" },
  { code: "+49", label: "+49 (DE)" },
  { code: "+33", label: "+33 (FR)" },
  { code: "+81", label: "+81 (JP)" },
  { code: "+65", label: "+65 (SG)" },
  { code: "+86", label: "+86 (CN)" },
] as const;

const TREK_INTERESTS = [
  "Everest & Khumbu",
  "Annapurna Circuit",
  "Langtang Valley",
  "Manaslu Sanctuary",
  "Upper Mustang",
  "Peak Climbing & Expeditions",
  "Custom Private Trip",
] as const;

function formatNepalTime(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const nepalDate = new Date(utc + 3600000 * 5.75);
  let hours = nepalDate.getHours();
  const minutes = String(nepalDate.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
}

export function ContactClient({ settings }: { settings: SiteSettingDTO }) {
  const [currentTime, setCurrentTime] = useState("");
  const [dialCode, setDialCode] = useState("+977");
  const [selectedInterest, setSelectedInterest] = useState<string>(
    TREK_INTERESTS[0]
  );

  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSubmitted, setSuccessSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const cleanWhatsapp =
    settings.whatsappNumber.replace(/[^\d]/g, "") || "9779800000000";
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}`;
  const cleanPhoneHref = settings.contactPhone.replace(/[^+\d]/g, "");

  // Live Nepal Time (UTC+5:45), refreshed every 30s
  useEffect(() => {
    const update = () => setCurrentTime(formatNepalTime());
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    const rawPhone = formState.phone.trim();
    const combinedPhone = rawPhone.startsWith("+")
      ? rawPhone
      : `${dialCode} ${rawPhone}`.trim();
    const trimmedCity = formState.city.trim();
    const trimmedMessage = formState.message.trim();
    const formattedMessage = trimmedCity
      ? `[City: ${trimmedCity}]\n${trimmedMessage}`
      : trimmedMessage;

    try {
      const utm = getStoredUtmParams();
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "GENERAL",
          fullName: formState.fullName.trim(),
          email: formState.email.trim(),
          phone: combinedPhone,
          whatsapp: combinedPhone,
          country: formState.country.trim() || undefined,
          interest: selectedInterest,
          message: formattedMessage,
          sourcePage: "/contact",
          ...utm,
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        reference?: string;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setErrorMsg(json.error || "Unable to transmit inquiry right now.");
        return;
      }

      trackGenerateLead({
        leadType: "contact_form",
        interest: selectedInterest,
        sourcePage: "/contact",
      });
      setReference(json.reference || "");
      setSuccessSubmitted(true);
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccessSubmitted(false);
    setReference("");
    setErrorMsg("");
    setDialCode("+977");
    setSelectedInterest(TREK_INTERESTS[0]);
    setFormState({
      fullName: "",
      email: "",
      phone: "",
      city: "",
      country: "",
      message: "",
    });
  };

  return (
    <div className="w-full bg-white text-[#1c1917]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-28 sm:pt-32 pb-20">
        {/* Top Header Row */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200/80 pb-8 mb-10">
          <div className="space-y-2.5">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f05e25]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f05e25]" />
              Kathmandu Liaison Desk · Nepal
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[#1c1917]">
              Contact Us
            </h1>
          </div>
          <p className="max-w-md text-sm sm:text-base text-stone-600 leading-relaxed md:text-right">
            Tell us when and where you&apos;d like to trek—our Kathmandu planners
            confirm availability and route notes within 24 hours.
          </p>
        </header>

        {/* Main Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* LEFT COLUMN: 2-Column Editorial Form */}
          <div className="lg:col-span-7 flex flex-col justify-between" id="inquiry-form">
            {!successSubmitted ? (
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5"
              >
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-full-name"
                    className="block text-xs font-semibold uppercase tracking-[0.12em] text-stone-700"
                  >
                    Full Name <span className="text-[#f05e25]">*</span>
                  </label>
                  <input
                    id="contact-full-name"
                    type="text"
                    required
                    placeholder="Your full name"
                    value={formState.fullName}
                    onChange={(e) =>
                      setFormState({ ...formState, fullName: e.target.value })
                    }
                    className="w-full h-12 px-4 rounded-xl bg-[#faf9f7] border border-stone-200 text-sm text-[#1c1917] placeholder:text-stone-400 focus:bg-white focus:border-[#1c1917] focus:ring-2 focus:ring-[#f05e25]/20 outline-none transition"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-semibold uppercase tracking-[0.12em] text-stone-700"
                  >
                    Email Address <span className="text-[#f05e25]">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formState.email}
                    onChange={(e) =>
                      setFormState({ ...formState, email: e.target.value })
                    }
                    className="w-full h-12 px-4 rounded-xl bg-[#faf9f7] border border-stone-200 text-sm text-[#1c1917] placeholder:text-stone-400 focus:bg-white focus:border-[#1c1917] focus:ring-2 focus:ring-[#f05e25]/20 outline-none transition"
                  />
                </div>

                {/* Phone / WhatsApp with Dial Code */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-phone"
                    className="block text-xs font-semibold uppercase tracking-[0.12em] text-stone-700"
                  >
                    Phone / WhatsApp <span className="text-[#f05e25]">*</span>
                  </label>
                  <div className="flex items-center h-12 rounded-xl bg-[#faf9f7] border border-stone-200 focus-within:bg-white focus-within:border-[#1c1917] focus-within:ring-2 focus-within:ring-[#f05e25]/20 transition overflow-hidden">
                    <select
                      aria-label="Country dial code"
                      value={dialCode}
                      onChange={(e) => setDialCode(e.target.value)}
                      className="h-full bg-transparent pl-3 pr-2 text-xs font-semibold text-[#1c1917] outline-none cursor-pointer shrink-0"
                    >
                      {DIAL_CODES.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                    <span className="h-5 w-px bg-stone-200 shrink-0" aria-hidden="true" />
                    <input
                      id="contact-phone"
                      type="tel"
                      required
                      placeholder="980XXXXXXX"
                      value={formState.phone}
                      onChange={(e) =>
                        setFormState({ ...formState, phone: e.target.value })
                      }
                      className="w-full h-full px-3.5 bg-transparent text-sm text-[#1c1917] placeholder:text-stone-400 outline-none"
                    />
                  </div>
                </div>

                {/* Trekking Interest */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-interest"
                    className="block text-xs font-semibold uppercase tracking-[0.12em] text-stone-700"
                  >
                    Trekking Interest
                  </label>
                  <select
                    id="contact-interest"
                    value={selectedInterest}
                    onChange={(e) => setSelectedInterest(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-[#faf9f7] border border-stone-200 text-sm text-[#1c1917] focus:bg-white focus:border-[#1c1917] focus:ring-2 focus:ring-[#f05e25]/20 outline-none transition cursor-pointer"
                  >
                    {TREK_INTERESTS.map((interest) => (
                      <option key={interest} value={interest}>
                        {interest}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-city"
                    className="block text-xs font-semibold uppercase tracking-[0.12em] text-stone-700"
                  >
                    City
                  </label>
                  <input
                    id="contact-city"
                    type="text"
                    placeholder="Kathmandu"
                    value={formState.city}
                    onChange={(e) =>
                      setFormState({ ...formState, city: e.target.value })
                    }
                    className="w-full h-12 px-4 rounded-xl bg-[#faf9f7] border border-stone-200 text-sm text-[#1c1917] placeholder:text-stone-400 focus:bg-white focus:border-[#1c1917] focus:ring-2 focus:ring-[#f05e25]/20 outline-none transition"
                  />
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-country"
                    className="block text-xs font-semibold uppercase tracking-[0.12em] text-stone-700"
                  >
                    Country
                  </label>
                  <input
                    id="contact-country"
                    type="text"
                    placeholder="Nepal"
                    value={formState.country}
                    onChange={(e) =>
                      setFormState({ ...formState, country: e.target.value })
                    }
                    className="w-full h-12 px-4 rounded-xl bg-[#faf9f7] border border-stone-200 text-sm text-[#1c1917] placeholder:text-stone-400 focus:bg-white focus:border-[#1c1917] focus:ring-2 focus:ring-[#f05e25]/20 outline-none transition"
                  />
                </div>

                {/* Message / Special Requests */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-semibold uppercase tracking-[0.12em] text-stone-700"
                  >
                    Message / Special Requests{" "}
                    <span className="text-[#f05e25]">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    required
                    placeholder="Share your preferred dates, group size, or any questions about permits and routes..."
                    value={formState.message}
                    onChange={(e) =>
                      setFormState({ ...formState, message: e.target.value })
                    }
                    className="w-full p-4 rounded-xl bg-[#faf9f7] border border-stone-200 text-sm text-[#1c1917] placeholder:text-stone-400 focus:bg-white focus:border-[#1c1917] focus:ring-2 focus:ring-[#f05e25]/20 outline-none transition resize-y"
                  />
                </div>

                {errorMsg && (
                  <p className="sm:col-span-2 text-xs font-medium text-red-600">
                    {errorMsg}
                  </p>
                )}

                {/* Submit Row */}
                <div className="sm:col-span-2 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#1c1917] hover:bg-[#f05e25] text-white rounded-full px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] inline-flex items-center justify-center gap-2.5 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <span>
                      {isSubmitting ? "Sending Enquiry..." : "Send Enquiry"}
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </button>

                  <div className="inline-flex items-center gap-2 text-xs text-stone-500">
                    <Lock className="h-3.5 w-3.5 shrink-0 text-[#f05e25]" aria-hidden="true" />
                    <span>Direct to our Thamel desk · No booking brokers</span>
                  </div>
                </div>
              </form>
            ) : (
              <div
                id="success-state"
                className="rounded-3xl bg-[#faf9f7] border border-stone-200 p-8 sm:p-10 space-y-5"
              >
                <div className="flex items-center gap-3 text-[#1c1917]">
                  <BadgeCheck
                    className="h-8 w-8 shrink-0 text-[#f05e25]"
                    aria-hidden="true"
                  />
                  <h2 className="font-serif text-2xl font-bold">
                    Enquiry Logged with Our Kathmandu Desk
                  </h2>
                </div>

                {reference && (
                  <span className="inline-block rounded-full bg-white px-3.5 py-1 font-mono text-xs font-semibold text-[#f05e25] border border-stone-200">
                    Ref · {reference}
                  </span>
                )}

                <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                  Tashi Delek, <strong>{formState.fullName}</strong>. Your
                  message regarding <em>{selectedInterest}</em> is now with our
                  route planners in Thamel. We&apos;ll reply to{" "}
                  <strong>{formState.email}</strong> within 24 hours.
                </p>

                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-[#1c1917] hover:bg-[#f05e25] text-white rounded-full px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors cursor-pointer"
                >
                  Send Another Enquiry
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Rounded Scenic Himalayan Card */}
          <aside className="lg:col-span-5">
            <div className="relative min-h-[420px] lg:min-h-full h-full rounded-3xl overflow-hidden shadow-lg border border-stone-200/70 flex flex-col justify-between p-6 sm:p-8 text-white">
              <Image
                src="/images/himalaya-suspension-bridge-trekkers.jpg"
                alt="Trekkers crossing a Himalayan suspension bridge in Nepal"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#0d161b]/90 via-[#0d161b]/25 to-[#0d161b]/15"
              />

              {/* Top-right Live Nepal Time Badge */}
              <div className="relative z-10 flex justify-end">
                <div className="bg-[#0d161b]/65 backdrop-blur-md border border-white/15 rounded-full px-3.5 py-1.5 text-xs text-white flex items-center gap-2 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-[#f05e25] animate-pulse" />
                  <span className="font-medium tracking-wide">
                    Kathmandu · {currentTime || "09:42 AM"} NPT
                  </span>
                </div>
              </div>

              {/* Bottom Editorial Caption & Quick Contact Actions */}
              <div className="relative z-10 space-y-4 pt-20">
                <div className="space-y-1.5">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f3ca7e]">
                    Your Himalayan Journey
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight text-white">
                    Direct from Kathmandu to the High Passes
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick("contact_card")}
                    className="inline-flex items-center gap-2 rounded-full bg-[#f05e25] hover:bg-[#d94d16] px-4 py-2 text-xs font-semibold text-white transition-colors shadow-sm"
                  >
                    <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>WhatsApp Chat</span>
                  </a>
                  <a
                    href={`tel:${cleanPhoneHref}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 px-4 py-2 text-xs font-medium text-white transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{settings.contactPhone}</span>
                  </a>
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 px-4 py-2 text-xs font-medium text-white transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>Email Desk</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom Office Info Strip */}
        <section
          aria-label="Kathmandu office details"
          className="mt-14 pt-8 border-t border-stone-200 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* 1. Kathmandu Office */}
          <div className="rounded-2xl bg-[#faf9f7] border border-stone-200/80 p-6 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#f05e25]">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Kathmandu Office</span>
            </div>
            <p className="text-sm font-medium text-[#1c1917] leading-relaxed">
              {settings.officeAddress}
            </p>
            <a
              href="https://maps.google.com/?q=Thamel,Kathmandu,Nepal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1c1917] hover:text-[#f05e25] transition-colors"
            >
              <span>Open in Google Maps</span>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </a>
          </div>

          {/* 2. Direct Line & Hours */}
          <div className="rounded-2xl bg-[#faf9f7] border border-stone-200/80 p-6 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#f05e25]">
              <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Direct Line &amp; Hours</span>
            </div>
            <div className="space-y-1 text-sm text-[#1c1917]">
              <a
                href={`tel:${cleanPhoneHref}`}
                className="block font-medium hover:text-[#f05e25] transition-colors"
              >
                {settings.contactPhone}
              </a>
              <a
                href={`mailto:${settings.contactEmail}`}
                className="block text-stone-600 hover:text-[#f05e25] transition-colors"
              >
                {settings.contactEmail}
              </a>
            </div>
            <p className="text-xs text-stone-500">
              Sun – Fri · 9:00 AM – 6:00 PM NPT
            </p>
          </div>

          {/* 3. Certified Mountain Team */}
          <div className="rounded-2xl bg-[#faf9f7] border border-stone-200/80 p-6 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#f05e25]">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Certified Mountain Team</span>
            </div>
            <p className="text-sm font-medium text-[#1c1917] leading-relaxed">
              IFMGA / NNMGA licensed guides · Direct TIMS &amp; NTB permit
              handling
            </p>
            <p className="text-xs text-stone-500">
              &lt; 24 hr reply directly from Kathmandu operations
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
