"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, KeyRound } from "lucide-react";
import { authFetch } from "@/lib/auth/client";
import { evaluatePasswordStrength } from "@/lib/auth/validation";

function AdminResetForm() {
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
      const res = await authFetch("/api/admin/auth/reset-password", {
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
      setError("Network error while updating passphrase.");
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
          href="/admin/forgot-password"
          className="inline-block text-sm font-semibold text-[#104b87] hover:underline"
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
        <h2 className="font-heading font-bold text-2xl text-[#1c1917]">
          Passphrase Updated
        </h2>
        <p className="text-sm text-[#57534d]">
          All previous administrator sessions have been terminated. Sign in with your new passphrase and authenticator code.
        </p>
        <Link
          href="/admin/login"
          className="inline-block rounded-xl bg-[#f05e25] hover:bg-[#d94e18] px-6 py-2.5 text-sm font-semibold text-white"
        >
          Go to Admin Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="new-admin-pass"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
        >
          New Passphrase (12+ characters)
        </label>
        <input
          id="new-admin-pass"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 12 characters"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-[#1c1917] placeholder:text-slate-400 focus:border-[#104b87] focus:outline-none focus:ring-2 focus:ring-[#104b87]/15"
        />
        <div className="pt-1 space-y-1">
          <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full transition-all ${
                strength.score >= 3
                  ? "bg-emerald-500"
                  : strength.score === 2
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${strength.score * 25}%` }}
            />
          </div>
          <p className="text-xs font-medium text-[#57534d]">{strength.label}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="confirm-admin-pass"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
        >
          Confirm New Passphrase
        </label>
        <input
          id="confirm-admin-pass"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-[#1c1917] focus:border-[#104b87] focus:outline-none focus:ring-2 focus:ring-[#104b87]/15"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !strength.meetsMinLength}
        className="w-full rounded-xl bg-[#f05e25] hover:bg-[#d94e18] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 cursor-pointer shadow-sm"
      >
        {submitting ? "Updating..." : "Save New Passphrase"}
      </button>
    </form>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#f8fafc] bg-[radial-gradient(ellipse_at_top,_rgba(16,75,135,0.08),_transparent_55%)]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#071526] text-[#ff8a50] shadow-md">
            <KeyRound className="h-6 w-6" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f05e25]">
            Credential Recovery
          </p>
          <h1 className="font-heading font-bold text-3xl text-[#1c1917]">
            Set New Admin Passphrase
          </h1>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
          <Suspense
            fallback={
              <div className="py-8 text-center text-sm font-medium text-[#104b87]">
                Validating token...
              </div>
            }
          >
            <AdminResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
