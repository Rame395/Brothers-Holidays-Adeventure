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
        <Link href="/login" className="text-[#f05e25] font-semibold hover:underline">
          ← Return to Sign In
        </Link>
      }
    >
      <Suspense
        fallback={
          <div className="py-10 text-center text-xs text-stone-500">
            Verifying...
          </div>
        }
      >
        <VerifyEmailClient />
      </Suspense>
    </CustomerAuthShell>
  );
}
