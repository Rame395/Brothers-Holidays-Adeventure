"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Check, Mail, MapPin } from "lucide-react";
import type { SiteSettingDTO } from "@/lib/types";
import { trackNewsletterSignup } from "@/lib/analytics";

export default function Footer({ settings }: { settings?: SiteSettingDTO }) {
  const pathname = usePathname();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const contactEmail = settings?.contactEmail || "info@brothersholidays.com";
  const contactPhone = settings?.contactPhone || "+977-1-4700000";
  const officeAddress =
    settings?.officeAddress || "Thamel, Kathmandu 44600, Nepal";
  const registrationNo =
    settings?.registrationNo || "Govt. Regd. 58177/068/069 · TAAN · NMA · NTB";
  const facebookUrl = settings?.facebookUrl || "https://facebook.com";
  const instagramUrl = settings?.instagramUrl || "https://instagram.com";
  const youtubeUrl = settings?.youtubeUrl || "https://youtube.com";

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

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="relative w-full overflow-hidden bg-[#081318] text-white text-sm border-t border-white/10">
      {/* Subtle static Himalayan photograph wash */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
        style={{ backgroundImage: "url('/images/footer-bg-himalaya.jpg')" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#081318]/90 via-[#081318]/85 to-[#060f13] pointer-events-none"
        aria-hidden="true"
      />

      {/* Newsletter Strip */}
      <div className="relative z-10 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
          <div className="text-center lg:text-left shrink-0">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e5b96b] mb-1.5">
              <Mail className="w-3.5 h-3.5" />
              Seasonal Trail Notes
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif text-white tracking-tight font-normal">
              Seasonal departures &amp; trail conditions
            </h3>
          </div>

          {subscribed ? (
            <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white/5 border border-[#c89b4b]/50 text-sm text-white">
              <Check className="w-4 h-4 text-[#e5b96b]" />
              <span>Subscribed to seasonal trail updates.</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row items-stretch gap-3 w-full lg:w-auto"
            >
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full sm:w-44 px-4 py-2.5 rounded-lg bg-[#0d1c23] border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#c89b4b]"
              />
              <input
                type="email"
                required
                placeholder="Your Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full sm:w-56 px-4 py-2.5 rounded-lg bg-[#0d1c23] border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#c89b4b]"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-lg bg-[#c89b4b] hover:bg-[#e5b96b] text-[#081318] font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-60"
              >
                <span>{submitting ? "Saving..." : "Subscribe"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {errorMsg && (
                <p className="text-xs text-rose-300 self-center">{errorMsg}</p>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-8 lg:gap-x-0 lg:gap-y-0">
          {/* Col 1: Brand & Social */}
          <div className="col-span-2 md:col-span-1 lg:pr-8 space-y-4">
            <Link
              href="/"
              className="inline-block"
              aria-label="BROTHERS Holidays Adventure Home"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/brothers_logo_navbar.png"
                alt="BROTHERS Holidays Adventure"
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </Link>
            <p className="text-white/65 text-[13px] leading-relaxed max-w-[230px]">
              Kathmandu-based trekking and mountaineering outfitter leading small
              groups across Nepal, Tibet, and Bhutan.
            </p>
            <div className="flex items-center gap-2 pt-1">
              {[
                { label: "Facebook", href: facebookUrl, abbr: "FB" },
                { label: "Instagram", href: instagramUrl, abbr: "IG" },
                { label: "YouTube", href: youtubeUrl, abbr: "YT" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-[#c89b4b] text-white/75 hover:text-[#081318] text-[11px] font-semibold tracking-wider transition-colors border border-white/10"
                >
                  {s.abbr}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Head Office */}
          <div className="col-span-2 md:col-span-1 lg:border-l lg:border-white/10 lg:pl-8 space-y-3">
            <div className="flex items-center gap-2 text-[#e5b96b]">
              <MapPin className="w-3.5 h-3.5" />
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                Kathmandu Office
              </h4>
            </div>
            <div className="space-y-2 text-white/70 text-[13px]">
              <p className="leading-snug">{officeAddress}</p>
              <p className="tabular-nums">
                <a
                  href={`tel:${contactPhone.replace(/[^+\d]/g, "")}`}
                  className="hover:text-[#e5b96b] transition-colors"
                >
                  {contactPhone}
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${contactEmail}`}
                  className="hover:text-[#e5b96b] transition-colors"
                >
                  {contactEmail}
                </a>
              </p>
            </div>
            <p className="pt-1 text-xs text-white/50">
              Sun–Fri · 9 AM – 6 PM NPT
            </p>
          </div>

          {/* Col 3: Popular Treks */}
          <div className="lg:border-l lg:border-white/10 lg:pl-8 space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e5b96b]">
              Popular Treks
            </h4>
            <ul className="space-y-2 text-white/70 text-[13px]">
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
                    className="hover:text-white transition-colors"
                  >
                    {trek.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Navigation */}
          <div className="lg:border-l lg:border-white/10 lg:pl-8 space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e5b96b]">
              Explore
            </h4>
            <ul className="space-y-2 text-white/70 text-[13px]">
              {[
                { name: "About Us", href: "/about" },
                { name: "All Destinations", href: "/destinations" },
                { name: "How We Plan", href: "/process" },
                { name: "Field Journal", href: "/journal" },
                { name: "Contact Us", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Direct Representatives */}
          <div className="col-span-2 md:col-span-1 lg:border-l lg:border-white/10 lg:pl-8 space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e5b96b]">
              Global Desk
            </h4>
            <div className="space-y-3 text-white/70 text-[13px] tabular-nums">
              <p>
                <strong className="text-white font-medium block">
                  Australia WhatsApp:
                </strong>
                <a
                  href="https://wa.me/61426378149"
                  className="hover:text-[#e5b96b] transition-colors"
                >
                  +61 426 378 149
                </a>
              </p>
              <p>
                <strong className="text-white font-medium block">
                  Japan WhatsApp:
                </strong>
                <a
                  href="https://wa.me/818041070813"
                  className="hover:text-[#e5b96b] transition-colors"
                >
                  +81 80 4107 0813
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Licensing Strip */}
      <div className="relative z-10 border-t border-white/10 bg-[#060e12]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-5 pb-20 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-white/55">
          <p>
            Licensed Nepal Operator · NMA · TAAN Member · Secure Direct Booking
          </p>
          <p>
            © 2026 {settings?.siteName || "BROTHERS Holidays Adventure"} ·{" "}
            {registrationNo}
          </p>
        </div>
      </div>
    </footer>
  );
}
