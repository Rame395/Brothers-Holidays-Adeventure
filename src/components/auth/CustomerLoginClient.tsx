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
          className="rounded-lg border border-rose-500/40 bg-rose-950/50 px-4 py-3 text-xs text-rose-200"
        >
          {error}
        </div>
      )}

      {googleEnabled && (
        <>
          <a
            href={googleHref}
            className="w-full inline-flex items-center justify-center gap-2.5 rounded-lg border border-white/20 bg-white/[0.06] px-4 py-3 text-xs font-semibold text-white hover:bg-white/[0.12] transition-colors"
          >
            <span>Continue with Google</span>
          </a>
          <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-white/35">
            <span className="h-px flex-1 bg-white/10" />
            <span>or email</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="cust-login-email"
            className="block font-mono text-[11px] uppercase tracking-[0.2em] text-[#e8b765]"
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
            className="w-full rounded-lg border border-white/15 bg-[#061015] px-4 py-3 text-sm text-white placeholder-white/35 focus:border-[#d99f38] focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="cust-login-password"
              className="block font-mono text-[11px] uppercase tracking-[0.2em] text-[#e8b765]"
            >
              Passphrase
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#89d6e2] hover:underline"
            >
              Forgot passphrase?
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
              placeholder="Enter your passphrase"
              className="w-full rounded-lg border border-white/15 bg-[#061015] px-4 py-3 pr-11 text-sm text-white placeholder-white/35 focus:border-[#d99f38] focus:outline-none"
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

        <TurnstileWidget
          siteKey={turnstileSiteKey}
          theme="dark"
          onToken={setTurnstileToken}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#e8b765] via-[#d99f38] to-[#c48b28] px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#061015] hover:brightness-110 disabled:opacity-60 cursor-pointer"
        >
          <LogIn className="h-3.5 w-3.5" />
          <span>{submitting ? "Signing In..." : "Sign In"}</span>
        </button>
      </form>

      <div className="pt-3 border-t border-white/10">
        <button
          type="button"
          onClick={() => setShowResend((v) => !v)}
          className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-[#e8b765] cursor-pointer"
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
              className="w-full rounded-lg border border-white/15 bg-[#061015] px-3 py-2 text-xs text-white focus:border-[#d99f38] focus:outline-none"
            />
            <button
              type="submit"
              disabled={resending}
              className="w-full rounded-lg border border-[#d99f38]/50 bg-[#d99f38]/10 px-3 py-2 text-xs font-semibold text-[#e8b765] hover:bg-[#d99f38]/20 disabled:opacity-60 cursor-pointer"
            >
              {resending ? "Sending..." : "Resend Verification Link"}
            </button>
            {resendStatus && (
              <p className="text-[11px] text-[#89d6e2]">{resendStatus}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
