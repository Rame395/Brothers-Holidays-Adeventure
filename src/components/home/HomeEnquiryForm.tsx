"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { getStoredUtmParams, trackGenerateLead } from "@/lib/analytics";

export function HomeEnquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    interest: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [reference, setReference] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const utm = getStoredUtmParams();
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "TRIP_INQUIRY",
          fullName: formData.name.trim(),
          email: formData.email.trim(),
          interest: formData.interest || "General Expedition Brief",
          sourcePage: "/",
          ...utm,
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        reference?: string;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setErrorMsg(json.error || "Unable to send your enquiry right now.");
        return;
      }

      trackGenerateLead({
        leadType: "home_enquiry",
        interest: formData.interest || undefined,
        sourcePage: "/",
      });
      setReference(json.reference || "");
      setEnquirySuccess(true);
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 bg-white flex flex-col justify-center">
      {!enquirySuccess ? (
        <form className="space-y-5" onSubmit={handleEnquirySubmit}>
          <div className="space-y-1.5">
            <label
              htmlFor="enquiry-name"
              className="block text-[11px] font-semibold tracking-wider text-[#3b464d] uppercase"
            >
              Your Name
            </label>
            <div className="relative">
              <input
                id="enquiry-name"
                type="text"
                required
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full h-12 px-4 pr-11 rounded-xl border border-[#d6cfc2] bg-[#faf8f4] text-sm text-[#141c1f] placeholder-[#6c767a] focus:outline-none focus:border-[#0f4c54] focus:bg-white focus:ring-1 focus:ring-[#0f4c54] transition-colors"
              />
              <User className="w-4 h-4 text-[#6c767a] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="enquiry-email"
              className="block text-[11px] font-semibold tracking-wider text-[#3b464d] uppercase"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                id="enquiry-email"
                type="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full h-12 px-4 pr-11 rounded-xl border border-[#d6cfc2] bg-[#faf8f4] text-sm text-[#141c1f] placeholder-[#6c767a] focus:outline-none focus:border-[#0f4c54] focus:bg-white focus:ring-1 focus:ring-[#0f4c54] transition-colors"
              />
              <Mail className="w-4 h-4 text-[#6c767a] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="enquiry-interest"
              className="block text-[11px] font-semibold tracking-wider text-[#3b464d] uppercase"
            >
              Preferred Region or Route
            </label>
            <div className="relative">
              <select
                id="enquiry-interest"
                value={formData.interest}
                onChange={(e) =>
                  setFormData({ ...formData, interest: e.target.value })
                }
                className="w-full h-12 px-4 pr-11 rounded-xl border border-[#d6cfc2] bg-[#faf8f4] text-sm text-[#141c1f] appearance-none focus:outline-none focus:border-[#0f4c54] focus:bg-white focus:ring-1 focus:ring-[#0f4c54] transition-colors cursor-pointer truncate"
              >
                <option value="" disabled>
                  Choose what interests you
                </option>
                <option value="Everest Base Camp & High Passes">
                  Everest Base Camp &amp; High Passes
                </option>
                <option value="Annapurna Circuit & Sanctuary">
                  Annapurna Circuit &amp; Sanctuary
                </option>
                <option value="Manaslu Circuit & Larkya La">
                  Manaslu Circuit &amp; Larkya La
                </option>
                <option value="Langtang Valley & Kyanjin Ri">
                  Langtang Valley &amp; Kyanjin Ri
                </option>
                <option value="Upper Mustang & Restricted Areas">
                  Upper Mustang &amp; Restricted Areas
                </option>
                <option value="Bespoke Private Trek / Peak Climb">
                  Bespoke Private Trek / Peak Climb
                </option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#6c767a] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-[#0f4c54] hover:bg-[#0c3d44] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
            >
              <span>
                {isSubmitting ? "Submitting..." : "Request Trip Plan & Quote"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-start sm:items-center justify-center gap-1.5 text-xs text-[#526065] mt-3 text-left sm:text-center">
              <ShieldCheck className="w-4 h-4 text-[#0f4c54] shrink-0" />
              <span>Direct response from our Kathmandu planners within 24 hours.</span>
            </div>
          </div>
        </form>
      ) : (
        <div className="py-8 flex flex-col items-center text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#f2efe8] text-[#0f4c54] flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="font-serif text-2xl text-[#141c1f] font-semibold tracking-wide">
            Enquiry Received
          </h4>
          {reference && (
            <span className="inline-block rounded-full bg-[#f2efe8] border border-[#d6cfc2] px-3 py-1 font-mono text-[11px] font-semibold text-[#0f4c54]">
              Ref: {reference}
            </span>
          )}
          <p className="text-sm text-[#4a555a] max-w-sm leading-relaxed">
            Thank you, <strong>{formData.name || "Traveler"}</strong>. We will
            send your route outline and permit breakdown to{" "}
            <strong>{formData.email}</strong>.
          </p>
          <button
            type="button"
            onClick={() => {
              setEnquirySuccess(false);
              setReference("");
              setFormData({
                name: "",
                email: "",
                interest: "",
              });
            }}
            className="mt-2 px-5 py-2 rounded-lg border border-[#d6cfc2] bg-[#faf8f4] hover:bg-[#f2efe8] text-[#0f4c54] font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer"
          >
            Send Another Enquiry
          </button>
        </div>
      )}
    </div>
  );
}
