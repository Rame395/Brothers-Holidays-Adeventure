"use client";

import { useState } from "react";
import { ArrowRight, Check, Mail } from "lucide-react";
import { trackNewsletterSignup } from "@/lib/analytics";

export function QuickDispatchForm() {
  const [quickEmail, setQuickEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [quickSuccess, setQuickSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEmail.trim()) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: quickEmail.trim(),
          source: "home-cta",
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setErrorMsg(json.error || "Unable to subscribe right now.");
        return;
      }
      trackNewsletterSignup("home-cta");
      setQuickSuccess(true);
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-4 max-w-lg mx-auto w-full">
      {quickSuccess ? (
        <div className="inline-flex items-center justify-center gap-2 p-3.5 px-6 rounded-xl border border-[#c89b4b]/50 bg-[#0b181f]/90 text-[#e5b96b] font-medium text-sm text-center w-full">
          <Check className="w-4 h-4 shrink-0" />
          <span>Seasonal updates queued for {quickEmail || "your inbox"}.</span>
        </div>
      ) : (
        <form
          className="relative flex items-center rounded-xl border border-white/20 bg-[#0b181f]/85 px-4 py-1.5 shadow-lg transition-colors focus-within:border-[#c89b4b]"
          onSubmit={handleQuickSubmit}
        >
          <Mail className="w-4 h-4 text-[#e5b96b] shrink-0 mr-3" />
          <input
            className="bg-transparent text-white placeholder-white/45 text-sm focus:outline-none flex-1 min-w-0 pr-2 py-2"
            placeholder="Get seasonal departure openings by email"
            required
            type="email"
            value={quickEmail}
            onChange={(e) => setQuickEmail(e.target.value)}
          />
          <button
            aria-label="Submit email for seasonal route updates"
            disabled={submitting}
            className="w-9 h-9 rounded-lg bg-[#c89b4b] hover:bg-[#e5b96b] text-[#081318] flex items-center justify-center transition-colors shrink-0 cursor-pointer disabled:opacity-60"
            type="submit"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
      {errorMsg && (
        <p className="mt-2 text-xs text-rose-300 text-center">{errorMsg}</p>
      )}
    </div>
  );
}
