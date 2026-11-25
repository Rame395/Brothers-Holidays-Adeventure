"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, LogOut, Mail, RefreshCw } from "lucide-react";
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
  const [rememberDevice, setRememberDevice] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setSubmitting(true);
    try {
      const res = await authFetch("/api/admin/auth/mfa/verify", {
        method: "POST",
        body: JSON.stringify({
          code,
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
        setError(json.error || "Invalid or expired verification code");
        return;
      }
      window.location.assign(json.redirectTo || "/admin");
    } catch {
      setError("Network error while verifying code.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (resending || cooldown > 0) return;
    setError("");
    setInfoMessage("");
    setResending(true);
    try {
      const res = await authFetch("/api/admin/auth/mfa/resend", {
        method: "POST",
      });
      const json = (await res.json()) as {
        ok: boolean;
        message?: string;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setError(json.error || "Unable to send verification code.");
        return;
      }
      setInfoMessage(
        json.message || "A new 6-digit code has been sent to your email."
      );
      setCooldown(30);
    } catch {
      setError("Network error while resending code.");
    } finally {
      setResending(false);
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
        <div className="text-center space-y-2.5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071526] text-[#ff8a50] shadow-md">
            <Mail className="h-6 w-6" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f05e25]">
            Email Verification
          </p>
          <h1 className="font-heading font-bold text-3xl text-[#1c1917]">
            Check Your Email
          </h1>
          <p className="text-sm text-[#57534d] leading-relaxed">
            We sent a 6-digit verification code to{" "}
            <span className="font-semibold text-[#1c1917]">{adminEmail}</span>.
            Enter it below to access the Admin Portal.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg space-y-5">
          {error && (
            <div
              role="alert"
              className="rounded-[14px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
            >
              {error}
            </div>
          )}

          {infoMessage && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{infoMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-mfa-code"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                6-Digit Email Code
              </label>
              <input
                id="admin-mfa-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D+/g, "").slice(0, 6))
                }
                placeholder="000000"
                className="w-full rounded-[14px] border border-slate-300 bg-white px-4 py-3 text-center font-mono text-2xl tracking-[0.4em] text-[#1c1917] placeholder:text-slate-300 focus:border-[#f05e25] focus:outline-none focus:ring-2 focus:ring-[#f05e25]/15"
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
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#f05e25] focus:ring-[#f05e25]/30 cursor-pointer"
              />
              <span>
                Trust this device for 30 days (don&apos;t ask for a code on this browser)
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting || code.length !== 6}
              className="w-full rounded-[14px] bg-[#f05e25] hover:bg-[#d94e18] px-5 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
            >
              {submitting ? "Verifying..." : "Verify & Sign In"}
            </button>
          </form>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="inline-flex items-center gap-1.5 font-semibold text-[#3f6e15] hover:text-[#f05e25] disabled:text-slate-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`}
              />
              <span>
                {resending
                  ? "Sending..."
                  : cooldown > 0
                  ? `Resend code (${cooldown}s)`
                  : "Resend code"}
              </span>
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
