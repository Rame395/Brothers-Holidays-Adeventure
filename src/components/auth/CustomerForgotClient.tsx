"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { authFetch } from "@/lib/auth/client";
import TurnstileWidget from "@/components/auth/TurnstileWidget";

export default function CustomerForgotClient() {
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sentMessage, setSentMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { turnstileSiteKey?: string | null } | null) => {
        if (d) setTurnstileSiteKey(d.turnstileSiteKey ?? null);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await authFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({
          email,
          turnstileToken: turnstileToken || undefined,
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        message?: string;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setError(json.error || "Unable to submit request.");
        return;
      }
      setSentMessage(
        json.message ||
          "If a verified traveler account matches that email, reset instructions have been sent."
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sentMessage) {
    return (
      <div className="space-y-4 text-center py-4">
        <MailCheck className="h-10 w-10 text-emerald-600 mx-auto" />
        <h2 className="font-heading text-2xl font-bold text-[#1c1917]">Check Your Email</h2>
        <p className="text-sm text-stone-700 leading-relaxed">{sentMessage}</p>
        <p className="text-[11px] text-stone-400">
          (In local development without SMTP, check the server console for the reset link.)
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#f05e25] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800"
        >
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="forgot-cust-email"
          className="block text-xs font-semibold uppercase tracking-[0.14em] text-stone-700"
        >
          Registered Email Address
        </label>
        <input
          id="forgot-cust-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full h-12 rounded-xl bg-[#faf9f7] border border-stone-200 px-4 text-sm text-[#1c1917] placeholder:text-stone-400 focus:bg-white focus:border-[#1c1917] focus:ring-2 focus:ring-[#f05e25]/20 focus:outline-none transition-all duration-200"
        />
      </div>

      <TurnstileWidget
        siteKey={turnstileSiteKey}
        theme="light"
        onToken={setTurnstileToken}
      />

      <button
        type="submit"
        disabled={submitting}
        className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#1c1917] hover:bg-[#f05e25] text-white text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-200 shadow-md shadow-stone-900/10 hover:shadow-[#f05e25]/20 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
      >
        <span>{submitting ? "Sending..." : "Send Reset Instructions"}</span>
      </button>
    </form>
  );
}
