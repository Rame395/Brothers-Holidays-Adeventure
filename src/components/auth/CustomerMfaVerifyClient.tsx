"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, LogOut } from "lucide-react";
import { authFetch } from "@/lib/auth/client";

export default function CustomerMfaVerifyClient({ email }: { email: string }) {
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
      const res = await authFetch("/api/auth/mfa/verify", {
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
      window.dispatchEvent(new Event("bha-auth-changed"));
      router.push(json.redirectTo || "/account");
      router.refresh();
    } catch {
      setError("Network error while verifying code.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await authFetch("/api/auth/logout", { method: "POST" });
    window.dispatchEvent(new Event("bha-auth-changed"));
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-white/65 text-center">
        Signing in as <span className="text-white font-medium">{email}</span>
      </p>

      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-950/50 px-4 py-3 text-xs text-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="cust-mfa-code"
            className="block font-mono text-[11px] uppercase tracking-[0.2em] text-[#e8b765]"
          >
            {useBackupCode
              ? "One-Time Recovery Code"
              : "6-Digit Authenticator Code"}
          </label>
          <input
            id="cust-mfa-code"
            type="text"
            inputMode={useBackupCode ? "text" : "numeric"}
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={useBackupCode ? "XXXX-XXXX-XXXX" : "000000"}
            className="w-full rounded-lg border border-white/15 bg-[#061015] px-4 py-3 text-center font-mono text-lg tracking-[0.35em] text-white placeholder-white/25 focus:border-[#d99f38] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[#d99f38] px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#061015] hover:bg-[#e8b765] disabled:opacity-60 cursor-pointer"
        >
          {submitting ? "Verifying..." : "Verify & Continue"}
        </button>
      </form>

      <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
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
          {useBackupCode ? "Use 6-digit app code" : "Use backup code"}
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
  );
}
