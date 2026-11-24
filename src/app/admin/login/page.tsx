"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { authFetch } from "@/lib/auth/client";
import TurnstileWidget from "@/components/auth/TurnstileWidget";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await authFetch("/api/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          turnstileToken: turnstileToken || undefined,
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        nextStep?: "mfa_setup" | "mfa_verify" | "done";
      };

      if (!res.ok || !json.ok) {
        setError(json.error || "Invalid email or password");
        return;
      }

      const qs = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
      if (json.nextStep === "mfa_setup") {
        router.push(`/admin/mfa-setup${qs}`);
      } else if (json.nextStep === "mfa_verify") {
        router.push(`/admin/mfa-verify${qs}`);
      } else {
        router.push(nextPath.startsWith("/admin") ? nextPath : "/admin");
      }
      router.refresh();
    } catch {
      setError("Network error while signing in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="admin-email"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
        >
          Administrator Email
        </label>
        <input
          id="admin-email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@brothersholidays.com"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-[#1c1917] placeholder:text-slate-400 focus:border-[#104b87] focus:outline-none focus:ring-2 focus:ring-[#104b87]/15"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="admin-password"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            Passphrase
          </label>
          <Link
            href="/admin/forgot-password"
            className="text-xs font-semibold text-[#104b87] hover:underline"
          >
            Forgot passphrase?
          </Link>
        </div>
        <div className="relative">
          <input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-11 text-sm text-[#1c1917] placeholder:text-slate-400 focus:border-[#104b87] focus:outline-none focus:ring-2 focus:ring-[#104b87]/15"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide passphrase" : "Show passphrase"}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1c1917] cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <TurnstileWidget theme="light" onToken={setTurnstileToken} />

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#f05e25] hover:bg-[#d94e18] px-5 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
      >
        <Lock className="h-4 w-4" />
        <span>{submitting ? "Verifying..." : "Authenticate to Command"}</span>
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#f8fafc] bg-[radial-gradient(ellipse_at_top,_rgba(16,75,135,0.08),_transparent_55%)]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2.5">
          <div className="mx-auto inline-flex items-center justify-center rounded-xl bg-[#071526] px-4 py-2.5 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/brothers_logo_navbar.png"
              alt="BROTHERS Holidays Adventure"
              className="h-8 w-auto object-contain"
            />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f05e25]">
            BROTHERS Holidays · Operations
          </p>
          <h1 className="font-heading font-bold text-3xl text-[#1c1917] tracking-tight">
            Administrator Sign In
          </h1>
          <p className="text-sm text-[#57534d]">
            Hardware-grade session isolation with mandatory Two-Factor Authentication.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
          <Suspense
            fallback={
              <div className="py-12 text-center text-sm font-medium text-[#104b87]">
                Loading secure portal...
              </div>
            }
          >
            <AdminLoginForm />
          </Suspense>
        </div>

        <div className="flex items-center justify-between px-2 text-xs text-[#57534d]">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-4 w-4 text-[#104b87]" />
            Isolated Admin Boundary
          </span>
          <Link
            href="/"
            className="font-semibold text-[#104b87] hover:underline transition-colors"
          >
            ← Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
