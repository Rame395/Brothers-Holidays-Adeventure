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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#f8fafc] bg-[radial-gradient(ellipse_at_top,_rgba(16,75,135,0.08),_transparent_55%)]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#071526] text-[#ff8a50] shadow-md">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f05e25]">
            Admin Recovery
          </p>
          <h1 className="font-heading font-bold text-3xl text-[#1c1917]">
            Reset Admin Passphrase
          </h1>
          <p className="text-sm text-[#57534d]">
            Single-use recovery links expire in 30 minutes and sign out all active sessions.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
          {sentMessage ? (
            <div className="space-y-4 text-center py-4">
              <MailCheck className="h-10 w-10 text-emerald-600 mx-auto" />
              <p className="text-sm text-[#1c1917] font-medium">{sentMessage}</p>
              <p className="text-xs text-[#57534d]">
                (In local development without SMTP, inspect your server console logs for the reset URL.)
              </p>
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#3f6e15] hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Admin Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="forgot-admin-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-[#1c1917] placeholder:text-slate-400 focus:border-[#3f6e15] focus:outline-none focus:ring-2 focus:ring-[#3f6e15]/15"
                />
              </div>

              <TurnstileWidget theme="light" onToken={setTurnstileToken} />

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#f05e25] hover:bg-[#d94e18] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 cursor-pointer shadow-sm"
              >
                {submitting ? "Sending..." : "Send Recovery Link"}
              </button>

              <div className="text-center">
                <Link
                  href="/admin/login"
                  className="text-xs font-semibold text-[#3f6e15] hover:underline"
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
