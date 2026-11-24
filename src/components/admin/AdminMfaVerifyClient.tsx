"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, LogOut, ShieldCheck } from "lucide-react";
import { authFetch } from "@/lib/auth/client";

export default function AdminMfaVerifyClient({
  adminEmail,
}: {
  adminEmail: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "";

  const [code, setCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await authFetch("/api/admin/auth/mfa/verify", {
        method: "POST",
        body: JSON.stringify({
          code,
          useBackupCode,
          rememberDevice,
          next: nextPath || undefined,
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        redirectTo?: string;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setError(json.error || "Invalid verification code");
        return;
      }
      window.location.assign(json.redirectTo || "/admin");
    } catch {
      setError("Network error while verifying code.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await authFetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#f8fafc] bg-[radial-gradient(ellipse_at_top,_rgba(16,75,135,0.08),_transparent_55%)]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#071526] text-[#ff8a50] shadow-md">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f05e25]">
            Two-Factor Challenge
          </p>
          <h1 className="font-heading font-bold text-3xl text-[#1c1917]">
            Verify Administrator Session
          </h1>
          <p className="text-sm text-[#57534d]">{adminEmail}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg space-y-5">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-mfa-code"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                {useBackupCode
                  ? "One-Time Recovery Code"
                  : "6-Digit Authenticator Code"}
              </label>
              <input
                id="admin-mfa-code"
                type="text"
                inputMode={useBackupCode ? "text" : "numeric"}
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={useBackupCode ? "XXXX-XXXX-XXXX" : "000000"}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center font-mono text-xl tracking-[0.35em] text-[#1c1917] placeholder:text-slate-300 focus:border-[#104b87] focus:outline-none focus:ring-2 focus:ring-[#104b87]/15"
              />
            </div>

            <label
              htmlFor="admin-remember-device"
              className="flex items-start gap-2.5 text-xs text-[#57534d] cursor-pointer select-none"
            >
              <input
                id="admin-remember-device"
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#104b87] focus:ring-[#104b87]/30 cursor-pointer"
              />
              <span>
                Trust this device for 30 days (don&apos;t ask for a code on this browser)
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[#f05e25] hover:bg-[#d94e18] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 cursor-pointer shadow-sm"
            >
              {submitting ? "Verifying..." : "Verify & Open Command Portal"}
            </button>
          </form>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => {
                setUseBackupCode((v) => !v);
                setCode("");
                setError("");
              }}
              className="inline-flex items-center gap-1.5 font-semibold text-[#104b87] hover:underline cursor-pointer"
            >
              <KeyRound className="h-3.5 w-3.5" />
              {useBackupCode ? "Use 6-digit app code" : "Use backup recovery code"}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 font-medium text-[#57534d] hover:text-[#1c1917] cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
