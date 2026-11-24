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
        <p className="text-sm font-medium text-rose-700">
          Missing or invalid password reset token.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block text-xs font-semibold uppercase tracking-wider text-[#f05e25] hover:underline"
        >
          Request a New Reset Link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-4 text-center py-4">
        <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
        <h2 className="font-heading text-2xl font-bold text-[#1c1917]">Password Updated</h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          All previous sessions have been signed out. You can now sign in with your new password.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-block rounded-xl bg-[#1c1917] hover:bg-[#f05e25] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition shadow-sm"
          >
            Sign In
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
          htmlFor="cust-reset-pass"
          className="block text-xs font-semibold uppercase tracking-[0.14em] text-stone-700"
        >
          New Password (12+ characters)
        </label>
        <input
          id="cust-reset-pass"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 12 characters"
          className="w-full h-11 rounded-xl bg-[#faf9f7] border border-stone-200 px-4 text-sm text-[#1c1917] placeholder:text-stone-400 focus:bg-white focus:border-[#1c1917] focus:ring-2 focus:ring-[#f05e25]/20 focus:outline-none transition-all duration-200"
        />
        <div className="pt-1 space-y-1">
          <div className="h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                strength.score >= 3
                  ? "bg-emerald-500"
                  : strength.score === 2
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${strength.score * 25}%` }}
            />
          </div>
          <p className="text-[11px] text-stone-500 font-medium">{strength.label}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="cust-reset-confirm"
          className="block text-xs font-semibold uppercase tracking-[0.14em] text-stone-700"
        >
          Confirm New Password
        </label>
        <input
          id="cust-reset-confirm"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat your password"
          className="w-full h-11 rounded-xl bg-[#faf9f7] border border-stone-200 px-4 text-sm text-[#1c1917] placeholder:text-stone-400 focus:bg-white focus:border-[#1c1917] focus:ring-2 focus:ring-[#f05e25]/20 focus:outline-none transition-all duration-200"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !strength.meetsMinLength}
        className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#1c1917] hover:bg-[#f05e25] text-white text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-200 shadow-md shadow-stone-900/10 hover:shadow-[#f05e25]/20 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
      >
        <span>{submitting ? "Updating..." : "Save New Password"}</span>
      </button>
    </form>
  );
}
