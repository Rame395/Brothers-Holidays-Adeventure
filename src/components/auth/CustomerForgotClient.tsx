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
        <MailCheck className="h-10 w-10 text-emerald-400 mx-auto" />
        <p className="text-sm text-white/90">{sentMessage}</p>
        <p className="text-[11px] text-white/50">
          (In local development without SMTP, check the server console for the reset link.)
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#e8b765] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-950/50 px-4 py-3 text-xs text-rose-200">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="forgot-cust-email"
          className="block font-mono text-[11px] uppercase tracking-[0.2em] text-[#e8b765]"
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
          className="w-full rounded-lg border border-white/15 bg-[#061015] px-4 py-3 text-sm text-white placeholder-white/35 focus:border-[#d99f38] focus:outline-none"
        />
      </div>

      <TurnstileWidget
        siteKey={turnstileSiteKey}
        theme="dark"
        onToken={setTurnstileToken}
      />

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-[#d99f38] px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#061015] hover:bg-[#e8b765] disabled:opacity-60 cursor-pointer"
      >
        {submitting ? "Sending..." : "Send Reset Instructions"}
      </button>
    </form>
  );
}
