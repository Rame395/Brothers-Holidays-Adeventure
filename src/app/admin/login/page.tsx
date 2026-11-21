"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mountain, ShieldCheck } from "lucide-react";
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
          className="rounded-lg border border-rose-500/40 bg-rose-950/50 px-4 py-3 text-xs text-rose-200"
        >
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="admin-email"
          className="block font-mono text-[11px] uppercase tracking-[0.2em] text-[#e8b765]"
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
          className="w-full rounded-lg border border-white/15 bg-[#0a171f] px-4 py-3 text-sm text-white placeholder-white/35 focus:border-[#d99f38] focus:outline-none focus:ring-1 focus:ring-[#d99f38]"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="admin-password"
            className="block font-mono text-[11px] uppercase tracking-[0.2em] text-[#e8b765]"
          >
            Passphrase
          </label>
          <Link
            href="/admin/forgot-password"
            className="text-xs text-[#89d6e2] hover:underline"
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
            className="w-full rounded-lg border border-white/15 bg-[#0a171f] px-4 py-3 pr-11 text-sm text-white placeholder-white/35 focus:border-[#d99f38] focus:outline-none focus:ring-1 focus:ring-[#d99f38]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide passphrase" : "Show passphrase"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <TurnstileWidget theme="dark" onToken={setTurnstileToken} />

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#e8b765] via-[#d99f38] to-[#c48b28] px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-[#060d12] transition-all hover:brightness-110 disabled:opacity-60 cursor-pointer"
      >
        <Lock className="h-3.5 w-3.5" />
        <span>{submitting ? "Verifying..." : "Authenticate to Command"}</span>
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[radial-gradient(ellipse_at_top,_rgba(217,159,56,0.12),_transparent_55%)]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#d99f38]/40 bg-[#0b1922] text-[#e8b765] shadow-lg">
            <Mountain className="h-6 w-6" />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#e8b765]">
            BROTHERS Holidays · Operations
          </p>
          <h1 className="font-serif text-3xl text-white tracking-tight">
            Administrator Sign In
          </h1>
          <p className="text-xs text-white/60">
            Hardware-grade session isolation with mandatory Two-Factor Authentication.
          </p>
        </div>

        <div className="rounded-2xl border border-[#d99f38]/30 bg-[#0b161e]/95 p-6 sm:p-8 shadow-2xl">
          <Suspense
            fallback={
              <div className="py-12 text-center font-mono text-xs text-white/50">
                Loading secure portal...
              </div>
            }
          >
            <AdminLoginForm />
          </Suspense>
        </div>

        <div className="flex items-center justify-between px-2 text-[11px] text-white/50">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[#89d6e2]" />
            Isolated Admin Boundary
          </span>
          <Link href="/" className="hover:text-[#e8b765] transition-colors">
            ← Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
