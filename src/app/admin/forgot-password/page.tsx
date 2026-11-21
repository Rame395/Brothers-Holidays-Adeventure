"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck, ShieldAlert } from "lucide-react";
import { authFetch } from "@/lib/auth/client";
import TurnstileWidget from "@/components/auth/TurnstileWidget";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentMessage, setSentMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await authFetch("/api/admin/auth/forgot-password", {
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
        setError(json.error || "Unable to process request.");
        return;
      }
      setSentMessage(
        json.message ||
          "If an active administrator account matches that email, reset instructions have been sent."
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[#d99f38]/40 bg-[#0b1922] text-[#e8b765]">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#e8b765]">
            Admin Recovery
          </p>
          <h1 className="font-serif text-3xl text-white">
            Reset Admin Passphrase
          </h1>
          <p className="text-xs text-white/60">
            Single-use recovery links expire in 30 minutes and sign out all active sessions.
          </p>
        </div>

        <div className="rounded-2xl border border-[#d99f38]/30 bg-[#0b161e] p-6 sm:p-8 shadow-2xl">
          {sentMessage ? (
            <div className="space-y-4 text-center py-4">
              <MailCheck className="h-10 w-10 text-emerald-400 mx-auto" />
              <p className="text-sm text-white/90">{sentMessage}</p>
              <p className="text-xs text-white/50">
                (In local development without SMTP, inspect your server console logs for the reset URL.)
              </p>
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#e8b765] hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Return to Admin Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg border border-rose-500/40 bg-rose-950/50 px-4 py-3 text-xs text-rose-200">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="forgot-admin-email"
                  className="block font-mono text-[11px] uppercase tracking-[0.2em] text-[#e8b765]"
                >
                  Administrator Email
                </label>
                <input
                  id="forgot-admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@brothersholidays.com"
                  className="w-full rounded-lg border border-white/15 bg-[#0a171f] px-4 py-3 text-sm text-white placeholder-white/35 focus:border-[#d99f38] focus:outline-none"
                />
              </div>

              <TurnstileWidget theme="dark" onToken={setTurnstileToken} />

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-[#d99f38] px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#060d12] hover:bg-[#e8b765] disabled:opacity-60 cursor-pointer"
              >
                {submitting ? "Sending..." : "Send Recovery Link"}
              </button>

              <div className="text-center">
                <Link
                  href="/admin/login"
                  className="text-xs text-white/60 hover:text-[#e8b765]"
                >
                  ← Back to Admin Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
