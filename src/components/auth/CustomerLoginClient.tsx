"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn, Mail } from "lucide-react";
import { authFetch } from "@/lib/auth/client";
import TurnstileWidget from "@/components/auth/TurnstileWidget";

const OAUTH_ERROR_LABELS: Record<string, string> = {
  oauth_cancelled: "Google sign-in was cancelled.",
  oauth_not_configured: "Google sign-in is not yet enabled on this environment.",
  oauth_invalid_state: "Sign-in security state could not be verified. Please try again.",
  oauth_expired_state: "Your sign-in session expired. Please try again.",
  oauth_failed: "Google sign-in could not be completed. Please try email sign-in.",
};

export default function CustomerLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "";
  const urlError = searchParams.get("error") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(
    urlError ? OAUTH_ERROR_LABELS[urlError] || "Unable to complete sign-in." : ""
  );

  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (
          d: {
            authenticated?: boolean;
            googleOAuthEnabled?: boolean;
            turnstileSiteKey?: string | null;
          } | null
        ) => {
          if (!d) return;
          setGoogleEnabled(Boolean(d.googleOAuthEnabled));
          setTurnstileSiteKey(d.turnstileSiteKey ?? null);
          if (d.authenticated && !nextPath) {
            router.replace("/account");
          }
        }
      )
      .catch(() => {});
  }, [nextPath, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await authFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          turnstileToken: turnstileToken || undefined,
          next: nextPath || undefined,
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        nextStep?: "mfa_verify" | "done";
        redirectTo?: string;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setError(json.error || "Invalid email or password");
        return;
      }

      if (json.nextStep === "mfa_verify") {
        const qs = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
        router.push(`/login/mfa${qs}`);
        return;
      }

      window.dispatchEvent(new Event("bha-auth-changed"));
      router.push(json.redirectTo || "/account");
      router.refresh();
    } catch {
      setError("Network error while signing in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setResendStatus("");
    setResending(true);
    try {
      const res = await authFetch("/api/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: resendEmail || email }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        message?: string;
        error?: string;
      };
      setResendStatus(
        json.ok
          ? json.message || "Verification link sent if account is pending."
          : json.error || "Unable to send link."
      );
    } catch {
      setResendStatus("Network error while sending link.");
    } finally {
      setResending(false);
    }
  }

  const googleHref = nextPath
    ? `/api/auth/google?next=${encodeURIComponent(nextPath)}`
    : "/api/auth/google";

  return (
    <div className="space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800"
        >
          {error}
        </div>
      )}

      {googleEnabled && (
        <>
          <a
            href={googleHref}
            className="w-full h-12 inline-flex items-center justify-center gap-3 rounded-xl border border-stone-200 bg-white px-4 text-xs font-semibold text-stone-800 hover:bg-stone-50 hover:border-stone-300 transition-colors shadow-xs"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </a>
          <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
            <span className="h-px flex-1 bg-stone-200" />
            <span>or with email</span>
            <span className="h-px flex-1 bg-stone-200" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="cust-login-email"
            className="block text-xs font-semibold uppercase tracking-[0.14em] text-stone-700"
          >
            Email Address
          </label>
          <input
            id="cust-login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-12 rounded-xl bg-[#faf9f7] border border-stone-200 px-4 text-sm text-[#1c1917] placeholder:text-stone-400 focus:bg-white focus:border-[#1c1917] focus:ring-2 focus:ring-[#f05e25]/20 focus:outline-none transition-all duration-200"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="cust-login-password"
              className="block text-xs font-semibold uppercase tracking-[0.14em] text-stone-700"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-[#f05e25] hover:text-[#d94e18] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="cust-login-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full h-12 rounded-xl bg-[#faf9f7] border border-stone-200 px-4 pr-11 text-sm text-[#1c1917] placeholder:text-stone-400 focus:bg-white focus:border-[#1c1917] focus:ring-2 focus:ring-[#f05e25]/20 focus:outline-none transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#1c1917] cursor-pointer p-1"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <TurnstileWidget
          siteKey={turnstileSiteKey}
          theme="light"
          onToken={setTurnstileToken}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#1c1917] hover:bg-[#f05e25] text-white text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-200 shadow-md shadow-stone-900/10 hover:shadow-[#f05e25]/20 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
        >
          <LogIn className="h-4 w-4" />
          <span>{submitting ? "Signing In..." : "Sign In"}</span>
        </button>
      </form>

      <div className="pt-3 border-t border-stone-200">
        <button
          type="button"
          onClick={() => setShowResend((v) => !v)}
          className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 hover:text-[#f05e25] transition-colors cursor-pointer"
        >
          <Mail className="h-3.5 w-3.5" />
          <span>Need to verify your email address?</span>
        </button>

        {showResend && (
          <form onSubmit={handleResend} className="mt-3 space-y-2.5">
            <input
              type="email"
              required
              placeholder="Enter signup email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              className="w-full h-10 rounded-xl bg-[#faf9f7] border border-stone-200 px-3 text-xs text-[#1c1917] placeholder:text-stone-400 focus:bg-white focus:border-[#1c1917] focus:ring-2 focus:ring-[#f05e25]/20 focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={resending}
              className="w-full h-10 rounded-xl border border-stone-300 bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-800 transition disabled:opacity-60 cursor-pointer"
            >
              {resending ? "Sending..." : "Resend Verification Link"}
            </button>
            {resendStatus && (
              <p className="text-xs text-stone-600 font-medium">{resendStatus}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
