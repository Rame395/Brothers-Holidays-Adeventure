"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, MailCheck, UserPlus } from "lucide-react";
import { authFetch } from "@/lib/auth/client";
import { evaluatePasswordStrength } from "@/lib/auth/validation";
import TurnstileWidget from "@/components/auth/TurnstileWidget";

export default function CustomerSignupClient() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sentMessage, setSentMessage] = useState("");
  const [error, setError] = useState("");

  const strength = evaluatePasswordStrength(password);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (
          d: {
            googleOAuthEnabled?: boolean;
            turnstileSiteKey?: string | null;
          } | null
        ) => {
          if (!d) return;
          setGoogleEnabled(Boolean(d.googleOAuthEnabled));
          setTurnstileSiteKey(d.turnstileSiteKey ?? null);
        }
      )
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passphrases do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await authFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          fullName,
          email,
          phone: phone || undefined,
          country: country || undefined,
          password,
          turnstileToken: turnstileToken || undefined,
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        message?: string;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setError(json.error || "Unable to create account.");
        return;
      }
      setSentMessage(
        json.message ||
          "Verification link sent. Check your inbox to activate your account."
      );
    } catch {
      setError("Network error creating account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sentMessage) {
    return (
      <div className="space-y-4 text-center py-4">
        <MailCheck className="h-10 w-10 text-emerald-600 mx-auto" />
        <h2 className="font-heading text-2xl font-bold text-[#1c1917]">Check Your Inbox</h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{sentMessage}</p>
        <p className="text-[11px] text-stone-400">
          (In local development without SMTP, open the terminal console to copy the verification URL.)
        </p>
      </div>
    );
  }

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
            href="/api/auth/google"
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
            <span>or create password</span>
            <span className="h-px flex-1 bg-stone-200" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="signup-name"
            className="block text-xs font-semibold uppercase tracking-[0.14em] text-stone-700"
          >
            Full Name
          </label>
          <input
            id="signup-name"
            type="text"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Pemba Sherpa"
            className="w-full h-11 rounded-xl bg-[#faf9f7] border border-stone-200 px-4 text-sm text-[#1c1917] placeholder:text-stone-400 focus:bg-white focus:border-[#1c1917] focus:ring-2 focus:ring-[#f05e25]/20 focus:outline-none transition-all duration-200"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="signup-email"
            className="block text-xs font-semibold uppercase tracking-[0.14em] text-stone-700"
          >
            Email Address
          </label>
          <input
            id="signup-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-11 rounded-xl bg-[#faf9f7] border border-stone-200 px-4 text-sm text-[#1c1917] placeholder:text-stone-400 focus:bg-white focus:border-[#1c1917] focus:ring-2 focus:ring-[#f05e25]/20 focus:outline-none transition-all duration-200"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label
              htmlFor="signup-phone"
              className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-600"
            >
              Phone (Optional)
            </label>
            <input
              id="signup-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+977 98..."
              className="w-full h-10 rounded-xl bg-[#faf9f7] border border-stone-200 px-3 text-xs text-[#1c1917] placeholder:text-stone-400 focus:bg-white focus:border-[#1c1917] focus:ring-2 focus:ring-[#f05e25]/20 focus:outline-none transition-all duration-200"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="signup-country"
              className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-600"
            >
              Country (Optional)
            </label>
            <input
              id="signup-country"
              type="text"
              autoComplete="country-name"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Nepal / Australia / USA"
              className="w-full h-10 rounded-xl bg-[#faf9f7] border border-stone-200 px-3 text-xs text-[#1c1917] placeholder:text-stone-400 focus:bg-white focus:border-[#1c1917] focus:ring-2 focus:ring-[#f05e25]/20 focus:outline-none transition-all duration-200"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="signup-password"
            className="block text-xs font-semibold uppercase tracking-[0.14em] text-stone-700"
          >
            Password (Min. 12 Characters)
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={12}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Use a memorable 12+ character password"
              className="w-full h-11 rounded-xl bg-[#faf9f7] border border-stone-200 px-4 pr-11 text-sm text-[#1c1917] placeholder:text-stone-400 focus:bg-white focus:border-[#1c1917] focus:ring-2 focus:ring-[#f05e25]/20 focus:outline-none transition-all duration-200"
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
          <div className="pt-1 space-y-1">
            <div className="h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  strength.score >= 3
                    ? "bg-emerald-500"
                    : strength.score === 2
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${strength.score * 25}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500 font-medium">{strength.label}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="signup-confirm"
            className="block text-xs font-semibold uppercase tracking-[0.14em] text-stone-700"
          >
            Confirm Password
          </label>
          <input
            id="signup-confirm"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your password"
            className="w-full h-11 rounded-xl bg-[#faf9f7] border border-stone-200 px-4 text-sm text-[#1c1917] placeholder:text-stone-400 focus:bg-white focus:border-[#1c1917] focus:ring-2 focus:ring-[#f05e25]/20 focus:outline-none transition-all duration-200"
          />
        </div>

        <TurnstileWidget
          siteKey={turnstileSiteKey}
          theme="light"
          onToken={setTurnstileToken}
        />

        <button
          type="submit"
          disabled={submitting || !strength.meetsMinLength}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#1c1917] hover:bg-[#f05e25] text-white text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-200 shadow-md shadow-stone-900/10 hover:shadow-[#f05e25]/20 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
        >
          <UserPlus className="h-4 w-4" />
          <span>{submitting ? "Creating Account..." : "Create Traveler Account"}</span>
        </button>
      </form>
    </div>
  );
}
