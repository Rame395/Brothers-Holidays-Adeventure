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
      <p className="text-xs text-stone-600 text-center">
        Signing in as <span className="text-[#1c1917] font-semibold">{email}</span>
      </p>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="cust-mfa-code"
            className="block text-xs font-semibold uppercase tracking-[0.14em] text-stone-700"
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
            className="w-full h-14 rounded-xl bg-[#faf9f7] border border-stone-200 px-4 text-center font-mono text-2xl tracking-[0.35em] text-[#1c1917] placeholder:text-stone-300 focus:bg-white focus:border-[#1c1917] focus:ring-2 focus:ring-[#f05e25]/20 focus:outline-none transition-all duration-200"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#1c1917] hover:bg-[#f05e25] text-white text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-200 shadow-md shadow-stone-900/10 hover:shadow-[#f05e25]/20 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
        >
          <span>{submitting ? "Verifying..." : "Verify & Continue"}</span>
        </button>
      </form>

      <div className="flex items-center justify-between pt-3 border-t border-stone-200 text-xs">
        <button
          type="button"
          onClick={() => {
            setUseBackupCode((v) => !v);
            setCode("");
            setError("");
          }}
          className="inline-flex items-center gap-1.5 font-medium text-[#f05e25] hover:underline cursor-pointer"
        >
          <KeyRound className="h-3.5 w-3.5" />
          {useBackupCode ? "Use 6-digit app code" : "Use backup code"}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1 text-stone-500 hover:text-[#1c1917] transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
