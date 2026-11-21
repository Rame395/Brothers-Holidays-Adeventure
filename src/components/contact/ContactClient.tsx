"use client";

import { useState, useEffect } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Clock,
  Compass,
  Lock,
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

export function ContactClient({ settings }: { settings: SiteSettingDTO }) {
  const [currentTime, setCurrentTime] = useState("");
  const [selectedInterest, setSelectedInterest] = useState("Langtang Circuit");

  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSubmitted, setSuccessSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const cleanWhatsapp = settings.whatsappNumber.replace(/[^\d]/g, "") || "9779800000000";
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}`;

  // Live Nepal Time (UTC+5:45)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const nepalDate = new Date(utc + 3600000 * 5.75);

      let hours = nepalDate.getHours();
      const minutes = String(nepalDate.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hoursStr = String(hours).padStart(2, "0");

      setCurrentTime(`${hoursStr}:${minutes} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const utm = getStoredUtmParams();
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "GENERAL",
          fullName: formState.fullName.trim(),
          email: formState.email.trim(),
          phone: formState.phone.trim(),
          whatsapp: formState.phone.trim(),
          interest: selectedInterest,
          message: formState.message.trim(),
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

  const interests = [
    "Langtang Circuit",
    "Manaslu Sanctuary",
    "Rolwaling & Tashi Lapcha",
    "Upper Mustang Custom",
  ];

  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-margin pt-8 pb-20">
        <div className="absolute -top-12 right-12 w-96 h-96 bg-primary-fixed/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-secondary-container/40 rounded-full blur-3xl pointer-events-none -z-10"></div>

        {/* Editorial Breadcrumb */}
        <div className="flex items-center gap-3 pb-8">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Field Headquarters · Nepal
          </span>
          <span className="text-outline-variant font-label-sm">/</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            Liaison Bureau
          </span>
        </div>

        {/* 1. Hero Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pb-16">
          <div className="lg:col-span-8 space-y-6">
            <h1 className="font-display-lg text-display-lg text-on-surface font-normal leading-[1.1] tracking-tight">
              Start a conversation with our Kathmandu office
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Reach our guides and planners directly via secure form, phone, or
              WhatsApp. Whether you seek custom logistical permits, private
              alpine guiding, or weather window consultations, we speak directly
              from the valley basin.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-all duration-200 shadow-sm active:scale-98"
                href="#inquiry-form"
              >
                <span>Send Enquiry</span>
                <ArrowDown
                  className="h-[18px] w-[18px] shrink-0"
                  aria-hidden="true"
                />
              </a>
              <a
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-surface-container text-primary font-label-lg text-label-lg hover:bg-surface-container-high transition-colors"
                href={whatsappUrl}
                onClick={() => trackWhatsAppClick("contact_hero")}
                rel="noopener noreferrer"
                target="_blank"
              >
                <MessageCircle
                  className="h-[18px] w-[18px] shrink-0"
                  aria-hidden="true"
                />
                <span>Instant WhatsApp Chat</span>
              </a>
            </div>
          </div>

          {/* Quick Status Metric / Micro HUD */}
          <div className="lg:col-span-4 bg-surface-container-low rounded-lg p-6 space-y-4 shadow-sm border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">
                Base Time
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface text-primary font-label-sm text-label-sm shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                NPT (UTC+5:45)
              </span>
            </div>
            <div className="space-y-1">
              <div
                className="font-headline-lg text-headline-lg text-on-surface tracking-tight"
                id="live-time"
              >
                {currentTime || "09:42 AM"}
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Desk operations active · Radio clearance open
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-on-surface-variant border-t border-outline-variant/15">
              <span className="font-label-md text-label-md uppercase tracking-wider">
                Kathmandu Alt
              </span>
              <span className="font-headline-sm text-headline-sm text-on-surface">
                1,400 m
              </span>
            </div>
          </div>
        </div>

        {/* Split Visual & Form Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-surface-container-lowest rounded-lg p-8 shadow-sm space-y-8 border border-outline-variant/30">
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
                <div className="space-y-1">
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">
                    Coordinates
                  </span>
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    Direct Office Access
                  </h2>
                </div>
                <Compass
                  className="h-7 w-7 shrink-0 text-primary"
                  aria-hidden="true"
                />
              </div>

              <div className="space-y-7">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <MapPin className="h-5 w-5 shrink-0" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant block">
                      Physical Address
                    </span>
                    <p className="font-headline-sm text-headline-sm text-on-surface font-normal leading-snug">
                      {settings.officeAddress}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {settings.contactEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
                  </div>
                  <div className="space-y-2.5 w-full">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant block">
                        Telephone Line
                      </span>
                      <a
                        className="font-headline-sm text-headline-sm text-on-surface hover:text-primary transition-colors block"
                        href={`tel:${settings.contactPhone.replace(/[^+\d]/g, "")}`}
                      >
                        {settings.contactPhone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high text-on-surface text-label-md font-label-md hover:bg-primary hover:text-on-primary transition-colors"
                        href={whatsappUrl}
                        onClick={() => trackWhatsAppClick("contact_sidebar")}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
                        WhatsApp Direct Connect
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <Clock className="h-5 w-5 shrink-0" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant block">
                      Office Hours
                    </span>
                    <p className="font-headline-sm text-headline-sm text-on-surface font-normal leading-snug">
                      Sunday to Friday
                      <br />
                      <span className="text-body-md text-on-surface-variant font-label-md">
                        9:00 AM – 6:00 PM NPT
                      </span>
                    </p>
                    <div className="inline-flex items-center gap-1.5 pt-1 text-tertiary font-label-md text-label-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                      Closed Saturday (Official Nepal Weekend)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div
                className="w-full h-56 rounded-lg bg-cover bg-center shadow-sm relative overflow-hidden flex items-end p-4 border border-outline-variant/30"
                style={{
                  backgroundImage: "url('/images/trips/kathmandu.jpg')",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-inverse-surface/20 to-transparent"></div>
                <div className="relative z-10 flex items-center justify-between w-full">
                  <div className="space-y-0.5 text-on-primary">
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed block">
                      Field Outpost Location
                    </span>
                    <span className="font-headline-sm text-headline-sm text-on-primary">
                      Thamel Sanctuary Office
                    </span>
                  </div>
                  <a
                    className="w-8 h-8 rounded-full bg-surface/90 text-on-surface flex items-center justify-center hover:scale-105 transition-transform shadow-md"
                    href="https://maps.google.com/?q=Thamel,Kathmandu,Nepal"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                  </a>
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant px-1">
                20 minutes drive from Tribhuvan International Airport (KTM).
                Vehicle collection available upon expedition reservation.
              </p>
            </div>

            <div className="bg-surface-container rounded-lg p-6 space-y-3 border border-outline-variant/30">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-12 h-12 rounded-full object-cover shadow-sm"
                  alt="Ang Dawa Sherpa"
                  src="/images/trips/everest.jpg"
                />
                <div>
                  <div className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Ang Dawa Sherpa
                  </div>
                  <div className="font-label-sm text-label-sm text-primary uppercase tracking-wider">
                    Chief Field Coordinator
                  </div>
                </div>
              </div>
              <p className="font-headline-sm text-headline-sm italic text-on-surface font-normal leading-snug pt-1">
                “Every crossing requires accurate patience. When you write to us,
                our operational leads review the snowlines before offering an
                answer.”
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Secure Enquiry Form */}
          <div
            className="lg:col-span-7 bg-surface-container-lowest rounded-lg p-8 sm:p-10 shadow-sm space-y-8 border border-outline-variant/30"
            id="inquiry-form"
          >
            <div className="space-y-2 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">
                  Direct Communication
                </span>
              </div>
              <h2 className="font-display-md text-display-md text-on-surface font-normal">
                Send a Message
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Submit your alpine inquiry, private party request, or permit
                requirements below.
              </p>
            </div>

            {!successSubmitted ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      className="font-label-lg text-label-lg text-on-surface font-medium"
                      htmlFor="full-name"
                    >
                      Full Name <span className="text-tertiary">*</span>
                    </label>
                    <span className="font-label-sm text-label-sm text-on-surface-variant/80">
                      Required
                    </span>
                  </div>
                  <input
                    className="w-full h-13 px-5 rounded-full bg-surface-container-low text-on-surface placeholder:text-on-secondary-container font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all border border-outline-variant/30"
                    id="full-name"
                    placeholder="Tenzing Sherpa"
                    required
                    type="text"
                    value={formState.fullName}
                    onChange={(e) =>
                      setFormState({ ...formState, fullName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      className="font-label-lg text-label-lg text-on-surface font-medium"
                      htmlFor="email-address"
                    >
                      Email Address <span className="text-tertiary">*</span>
                    </label>
                    <span className="font-label-sm text-label-sm text-on-surface-variant/80">
                      Encrypted
                    </span>
                  </div>
                  <input
                    className="w-full h-13 px-5 rounded-full bg-surface-container-low text-on-surface placeholder:text-on-secondary-container font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all border border-outline-variant/30"
                    id="email-address"
                    placeholder="tenzing@example.com"
                    required
                    type="email"
                    value={formState.email}
                    onChange={(e) =>
                      setFormState({ ...formState, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      className="font-label-lg text-label-lg text-on-surface font-medium"
                      htmlFor="phone-number"
                    >
                      Phone or WhatsApp Number{" "}
                      <span className="text-tertiary">*</span>
                    </label>
                    <span className="font-label-sm text-label-sm text-on-surface-variant/80">
                      Satellite or Mobile
                    </span>
                  </div>
                  <input
                    className="w-full h-13 px-5 rounded-full bg-surface-container-low text-on-surface placeholder:text-on-secondary-container font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all border border-outline-variant/30"
                    id="phone-number"
                    placeholder="+977 9800000000"
                    required
                    type="tel"
                    value={formState.phone}
                    onChange={(e) =>
                      setFormState({ ...formState, phone: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="font-label-lg text-label-lg text-on-surface font-medium block">
                    Expedition Interest
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {interests.map((interest) => (
                      <button
                        key={interest}
                        onClick={() => setSelectedInterest(interest)}
                        className={`px-4 py-2 rounded-full font-label-md text-label-md transition-colors cursor-pointer ${
                          selectedInterest === interest
                            ? "bg-primary-container text-on-primary font-medium"
                            : "bg-surface-container text-primary hover:bg-primary-container hover:text-on-primary"
                        }`}
                        type="button"
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label
                      className="font-label-lg text-label-lg text-on-surface font-medium"
                      htmlFor="inquiry-message"
                    >
                      Message or Route Inquiry{" "}
                      <span className="text-tertiary">*</span>
                    </label>
                    <span className="font-label-sm text-label-sm text-on-surface-variant/80">
                      Logbook
                    </span>
                  </div>
                  <textarea
                    className="w-full p-5 rounded-2xl bg-surface-container-low text-on-surface placeholder:text-on-secondary-container font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all resize-y border border-outline-variant/30"
                    id="inquiry-message"
                    placeholder="Inquiring about autumn departures for the Langtang circuit..."
                    required
                    rows={5}
                    value={formState.message}
                    onChange={(e) =>
                      setFormState({ ...formState, message: e.target.value })
                    }
                  ></textarea>
                </div>

                {errorMsg && (
                  <p className="text-xs text-error font-medium">{errorMsg}</p>
                )}

                <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <button
                    className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-all duration-200 shadow-md group cursor-pointer disabled:opacity-50"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    <span>
                      {isSubmitting ? "Transmitting..." : "Transmit Inquiry"}
                    </span>
                    <ArrowRight
                      className="h-[18px] w-[18px] shrink-0 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </button>
                  <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
                    <Lock
                      className="h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>Logged directly in Kathmandu CRM</span>
                  </div>
                </div>
              </form>
            ) : (
              <div
                className="p-8 rounded-2xl bg-surface-container text-on-surface space-y-4 animate-fade-in shadow-sm border border-outline-variant/20"
                id="success-state"
              >
                <div className="flex items-center gap-3 text-primary font-headline-md text-headline-md">
                  <BadgeCheck
                    className="h-8 w-8 shrink-0"
                    aria-hidden="true"
                  />
                  <span>Inquiry Transmitted to Kathmandu Dispatch</span>
                </div>
                {reference && (
                  <span className="inline-block rounded-full bg-surface-container-lowest px-3 py-1 font-mono text-xs font-semibold text-primary border border-outline-variant/30">
                    Ref · {reference}
                  </span>
                )}
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Tashi Delek, <strong>{formState.fullName}</strong>. Your dispatch
                  regarding <em>{selectedInterest}</em> has been logged directly
                  with our field operations team in Thamel. You will receive an
                  acknowledgment receipt and preliminary route notes at{" "}
                  <strong>{formState.email}</strong> shortly.
                </p>
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-full bg-primary-container text-on-primary font-label-md uppercase tracking-wider hover:bg-primary transition-colors cursor-pointer"
                  onClick={() => {
                    setSuccessSubmitted(false);
                    setReference("");
                    setFormState({
                      fullName: "",
                      email: "",
                      phone: "",
                      message: "",
                    });
                  }}
                >
                  Send Another Inquiry
                </button>
              </div>
            )}

            <div className="pt-6">
              <div className="p-5 rounded-2xl bg-surface-container-low flex items-start gap-4 shadow-sm border border-outline-variant/20">
                <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed shrink-0 mt-0.5">
                  <ShieldCheck
                    className="h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-label-md text-label-md uppercase tracking-widest text-primary font-semibold">
                    Institutional Assurance
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Direct liaison with licensed IFMGA / NNMGA certified guides.
                    No booking brokers. Your conversation connects directly with
                    individuals who walk the passes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-on-surface border-t border-outline-variant/30">
          <div className="space-y-1">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant block">
              Satellite Comm
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-normal">
              Garmin inReach
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Active on all High-Pass expeditions
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant block">
              Permit Desk
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-normal">
              TIMS &amp; NTB Sync
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Direct liaison with Ministry of Tourism
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant block">
              Heli Evacuation
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-normal">
              B3e Longranger
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Direct charter protocols on file
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant block">
              Response Time
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-normal">
              &lt; 14 Hours
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Standard desk review turnaround
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
