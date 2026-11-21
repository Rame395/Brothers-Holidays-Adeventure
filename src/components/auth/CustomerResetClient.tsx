"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { authFetch } from "@/lib/auth/client";
import { evaluatePasswordStrength } from "@/lib/auth/validation";

export default function CustomerResetClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const strength = evaluatePasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passphrases do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await authFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error || "Unable to reset passphrase.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error while resetting passphrase.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center py-4">
        <p className="text-sm text-rose-300">
          Missing or invalid password reset token.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block text-xs font-mono uppercase tracking-wider text-[#e8b765] hover:underline"
        >
          Request a New Reset Link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-4 text-center py-4">
        <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
        <h2 className="font-serif text-2xl text-white">Passphrase Updated</h2>
        <p className="text-xs text-white/70">
          All previous sessions have been signed out. You can now sign in with your new passphrase.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-[#d99f38] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#061015] hover:bg-[#e8b765]"
        >
          Sign In
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
          htmlFor="cust-reset-pass"
          className="block font-mono text-[11px] uppercase tracking-[0.2em] text-[#e8b765]"
        >
          New Passphrase (12+ characters)
        </label>
        <input
          id="cust-reset-pass"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-white/15 bg-[#061015] px-4 py-3 text-sm text-white focus:border-[#d99f38] focus:outline-none"
        />
        <p className="text-[11px] text-white/55">{strength.label}</p>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="cust-reset-confirm"
          className="block font-mono text-[11px] uppercase tracking-[0.2em] text-[#e8b765]"
        >
          Confirm New Passphrase
        </label>
        <input
          id="cust-reset-confirm"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-lg border border-white/15 bg-[#061015] px-4 py-3 text-sm text-white focus:border-[#d99f38] focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !strength.meetsMinLength}
        className="w-full rounded-lg bg-[#d99f38] px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#061015] hover:bg-[#e8b765] disabled:opacity-60 cursor-pointer"
      >
        {submitting ? "Updating..." : "Save New Passphrase"}
      </button>
    </form>
  );
}
