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
      router.push(json.redirectTo || "/admin");
      router.refresh();
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[radial-gradient(ellipse_at_top,_rgba(217,159,56,0.12),_transparent_55%)]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[#d99f38]/40 bg-[#0b1922] text-[#e8b765]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#e8b765]">
            Two-Factor Challenge
          </p>
          <h1 className="font-serif text-3xl text-white">
            Verify Administrator Session
          </h1>
          <p className="text-xs text-white/60">{adminEmail}</p>
        </div>

        <div className="rounded-2xl border border-[#d99f38]/30 bg-[#0b161e] p-6 sm:p-8 shadow-2xl space-y-5">
          {error && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-950/50 px-4 py-3 text-xs text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-mfa-code"
                className="block font-mono text-[11px] uppercase tracking-[0.2em] text-[#e8b765]"
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
                className="w-full rounded-lg border border-white/15 bg-[#0a171f] px-4 py-3 text-center font-mono text-lg tracking-[0.35em] text-white placeholder-white/25 focus:border-[#d99f38] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-[#d99f38] px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#060d12] hover:bg-[#e8b765] disabled:opacity-60 cursor-pointer"
            >
              {submitting ? "Verifying..." : "Verify & Open Command Portal"}
            </button>
          </form>

          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <button
              type="button"
              onClick={() => {
                setUseBackupCode((v) => !v);
                setCode("");
                setError("");
              }}
              className="inline-flex items-center gap-1.5 text-[#89d6e2] hover:underline cursor-pointer"
            >
              <KeyRound className="h-3.5 w-3.5" />
              {useBackupCode ? "Use 6-digit app code" : "Use backup recovery code"}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-white/50 hover:text-white cursor-pointer"
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
