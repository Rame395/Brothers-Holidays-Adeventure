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
        <MailCheck className="h-10 w-10 text-emerald-400 mx-auto" />
        <h2 className="font-serif text-2xl text-white">Check Your Inbox</h2>
        <p className="text-xs text-white/75 leading-relaxed">{sentMessage}</p>
        <p className="text-[11px] text-white/45">
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
          className="rounded-lg border border-rose-500/40 bg-rose-950/50 px-4 py-3 text-xs text-rose-200"
        >
          {error}
        </div>
      )}

      {googleEnabled && (
        <>
          <a
            href="/api/auth/google"
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/[0.06] px-4 py-3 text-xs font-semibold text-white hover:bg-white/[0.12] transition-colors"
          >
            Continue with Google
          </a>
          <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-white/35">
            <span className="h-px flex-1 bg-white/10" />
            <span>or create passphrase</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="signup-name"
            className="block font-mono text-[11px] uppercase tracking-[0.2em] text-[#e8b765]"
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
            className="w-full rounded-lg border border-white/15 bg-[#061015] px-4 py-2.5 text-sm text-white placeholder-white/35 focus:border-[#d99f38] focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="signup-email"
            className="block font-mono text-[11px] uppercase tracking-[0.2em] text-[#e8b765]"
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
            className="w-full rounded-lg border border-white/15 bg-[#061015] px-4 py-2.5 text-sm text-white placeholder-white/35 focus:border-[#d99f38] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label
              htmlFor="signup-phone"
              className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/60"
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
              className="w-full rounded-lg border border-white/15 bg-[#061015] px-3 py-2 text-xs text-white placeholder-white/35 focus:border-[#d99f38] focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="signup-country"
              className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/60"
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
              className="w-full rounded-lg border border-white/15 bg-[#061015] px-3 py-2 text-xs text-white placeholder-white/35 focus:border-[#d99f38] focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="signup-password"
            className="block font-mono text-[11px] uppercase tracking-[0.2em] text-[#e8b765]"
          >
            Passphrase (Min. 12 Characters)
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
              placeholder="Use a memorable 12+ character passphrase"
              className="w-full rounded-lg border border-white/15 bg-[#061015] px-4 py-2.5 pr-11 text-sm text-white placeholder-white/35 focus:border-[#d99f38] focus:outline-none"
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
          <div className="pt-1 space-y-1">
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  strength.score >= 3
                    ? "bg-emerald-400"
                    : strength.score === 2
                    ? "bg-amber-400"
                    : "bg-rose-400"
                }`}
                style={{ width: `${strength.score * 25}%` }}
              />
            </div>
            <p className="text-[11px] text-white/55">{strength.label}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="signup-confirm"
            className="block font-mono text-[11px] uppercase tracking-[0.2em] text-[#e8b765]"
          >
            Confirm Passphrase
          </label>
          <input
            id="signup-confirm"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your passphrase"
            className="w-full rounded-lg border border-white/15 bg-[#061015] px-4 py-2.5 text-sm text-white placeholder-white/35 focus:border-[#d99f38] focus:outline-none"
          />
        </div>

        <TurnstileWidget
          siteKey={turnstileSiteKey}
          theme="dark"
          onToken={setTurnstileToken}
        />

        <button
          type="submit"
          disabled={submitting || !strength.meetsMinLength}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#e8b765] via-[#d99f38] to-[#c48b28] px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#061015] hover:brightness-110 disabled:opacity-60 cursor-pointer"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>{submitting ? "Creating Account..." : "Create Traveler Account"}</span>
        </button>
      </form>
    </div>
  );
}
