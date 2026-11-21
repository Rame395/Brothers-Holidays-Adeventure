import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import CustomerAuthShell from "@/components/auth/CustomerAuthShell";
import VerifyEmailClient from "@/components/auth/VerifyEmailClient";

export const metadata: Metadata = {
  title: "Verify Email Address",
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <CustomerAuthShell
      eyebrow="Account Activation"
      title="Email Verification"
      footer={
        <Link href="/login" className="text-[#e8b765] hover:underline">
          ← Return to Sign In
        </Link>
      }
    >
      <Suspense
        fallback={
          <div className="py-10 text-center font-mono text-xs text-white/50">
            Verifying...
          </div>
        }
      >
        <VerifyEmailClient />
      </Suspense>
    </CustomerAuthShell>
  );
}
