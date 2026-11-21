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
        <p className="text-sm text-rose-300">
          Missing or invalid password reset token.
        </p>
        <Link
          href="/admin/forgot-password"
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
          All previous administrator sessions have been terminated. Sign in with your new passphrase and authenticator code.
        </p>
        <Link
          href="/admin/login"
          className="inline-block rounded-lg bg-[#d99f38] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#060d12] hover:bg-[#e8b765]"
        >
          Go to Admin Login
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
          htmlFor="new-admin-pass"
          className="block font-mono text-[11px] uppercase tracking-[0.2em] text-[#e8b765]"
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
          className="w-full rounded-lg border border-white/15 bg-[#0a171f] px-4 py-3 text-sm text-white placeholder-white/35 focus:border-[#d99f38] focus:outline-none"
        />
        <div className="pt-1 space-y-1">
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full transition-all ${
                strength.score >= 3
                  ? "bg-emerald-400"
                  : strength.score === 2
                  ? "bg-amber-400"
                  : "bg-rose-400"
              }`}
              style={{ width: `${strength.score * 25}%` }}
            />
          </div>
          <p className="text-[11px] text-white/55">{strength.label}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="confirm-admin-pass"
          className="block font-mono text-[11px] uppercase tracking-[0.2em] text-[#e8b765]"
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
          className="w-full rounded-lg border border-white/15 bg-[#0a171f] px-4 py-3 text-sm text-white focus:border-[#d99f38] focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !strength.meetsMinLength}
        className="w-full rounded-lg bg-[#d99f38] px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#060d12] hover:bg-[#e8b765] disabled:opacity-60 cursor-pointer"
      >
        {submitting ? "Updating..." : "Save New Passphrase"}
      </button>
    </form>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[#d99f38]/40 bg-[#0b1922] text-[#e8b765]">
            <KeyRound className="h-5 w-5" />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#e8b765]">
            Credential Recovery
          </p>
          <h1 className="font-serif text-3xl text-white">
            Set New Admin Passphrase
          </h1>
        </div>

        <div className="rounded-2xl border border-[#d99f38]/30 bg-[#0b161e] p-6 sm:p-8 shadow-2xl">
          <Suspense
            fallback={
              <div className="py-8 text-center font-mono text-xs text-white/50">
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
