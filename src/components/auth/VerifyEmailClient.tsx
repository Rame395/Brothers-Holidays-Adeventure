"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, MailWarning } from "lucide-react";
import { authFetch } from "@/lib/auth/client";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const attemptedTokenRef = useRef<string>("");

  const [result, setResult] = useState<{
    token: string;
    status: "verified" | "error";
    message: string;
  } | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [resending, setResending] = useState(false);

  const state: "verifying" | "verified" | "error" | "missing" = !token
    ? "missing"
    : result && result.token === token
    ? result.status
    : "verifying";
  const message = result && result.token === token ? result.message : "";

  useEffect(() => {
    if (!token) return;
    if (attemptedTokenRef.current === token) return;
    attemptedTokenRef.current = token;

    authFetch("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const json = (await res.json()) as {
          ok: boolean;
          message?: string;
          error?: string;
        };
        if (res.ok && json.ok) {
          setResult({
            token,
            status: "verified",
            message: json.message || "Email verified! You can now sign in.",
          });
        } else {
          setResult({
            token,
            status: "error",
            message: json.error || "Verification link is invalid or expired.",
          });
        }
      })
      .catch(() => {
        setResult({
          token,
          status: "error",
          message: "Unable to verify right now. Please try again.",
        });
      });
  }, [token]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setResending(true);
    setResendMsg("");
    try {
      const res = await authFetch("/api/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: resendEmail }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        message?: string;
        error?: string;
      };
      setResendMsg(
        json.ok
          ? json.message || "If eligible, a verification link was sent."
          : json.error || "Unable to send verification link."
      );
    } catch {
      setResendMsg("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  }

  if (state === "verifying") {
    return (
      <div className="py-10 text-center text-xs text-stone-500 font-medium">
        Confirming verification token...
      </div>
    );
  }

  if (state === "verified") {
    return (
      <div className="space-y-4 text-center py-4">
        <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
        <h2 className="font-heading text-2xl font-bold text-[#1c1917]">Account Activated</h2>
        <p className="text-xs sm:text-sm text-stone-600">{message}</p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-block rounded-xl bg-[#1c1917] hover:bg-[#f05e25] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition shadow-sm"
          >
            Sign In to Your Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <MailWarning className="h-9 w-9 text-amber-500 mx-auto" />
        <p className="text-xs sm:text-sm text-stone-600">
          {state === "error"
            ? message
            : "Paste the verification link from your email, or request a fresh verification email below."}
        </p>
      </div>

      <form onSubmit={handleResend} className="space-y-3 pt-2 border-t border-stone-200">
        <input
          type="email"
          required
          placeholder="Your registration email"
          value={resendEmail}
          onChange={(e) => setResendEmail(e.target.value)}
          className="w-full h-11 rounded-xl bg-[#faf9f7] border border-stone-200 px-4 text-sm text-[#1c1917] placeholder:text-stone-400 focus:bg-white focus:border-[#1c1917] focus:ring-2 focus:ring-[#f05e25]/20 focus:outline-none transition-all duration-200"
        />
        <button
          type="submit"
          disabled={resending}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#1c1917] hover:bg-[#f05e25] text-white text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-200 shadow-md shadow-stone-900/10 hover:shadow-[#f05e25]/20 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
        >
          {resending ? "Sending..." : "Send Fresh Verification Email"}
        </button>
        {resendMsg && (
          <p className="text-xs text-stone-600 text-center font-medium">{resendMsg}</p>
        )}
      </form>
    </div>
  );
}
