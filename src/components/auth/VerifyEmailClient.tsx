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
      <div className="py-10 text-center font-mono text-xs text-white/65">
        Confirming verification token...
      </div>
    );
  }

  if (state === "verified") {
    return (
      <div className="space-y-4 text-center py-4">
        <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
        <h2 className="font-serif text-2xl text-white">Account Activated</h2>
        <p className="text-xs text-white/75">{message}</p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-[#d99f38] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#061015] hover:bg-[#e8b765]"
        >
          Sign In to Your Account
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <MailWarning className="h-9 w-9 text-amber-400 mx-auto" />
        <p className="text-xs text-white/75">
          {state === "error"
            ? message
            : "Paste the verification link from your email, or request a fresh verification email below."}
        </p>
      </div>

      <form onSubmit={handleResend} className="space-y-3 pt-2 border-t border-white/10">
        <input
          type="email"
          required
          placeholder="Your registration email"
          value={resendEmail}
          onChange={(e) => setResendEmail(e.target.value)}
          className="w-full rounded-lg border border-white/15 bg-[#061015] px-4 py-2.5 text-sm text-white focus:border-[#d99f38] focus:outline-none"
        />
        <button
          type="submit"
          disabled={resending}
          className="w-full rounded-lg bg-[#d99f38] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#061015] hover:bg-[#e8b765] disabled:opacity-60 cursor-pointer"
        >
          {resending ? "Sending..." : "Send Fresh Verification Email"}
        </button>
        {resendMsg && (
          <p className="text-xs text-[#89d6e2] text-center">{resendMsg}</p>
        )}
      </form>
    </div>
  );
}
