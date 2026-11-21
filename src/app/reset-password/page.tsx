import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import CustomerAuthShell from "@/components/auth/CustomerAuthShell";
import CustomerResetClient from "@/components/auth/CustomerResetClient";

export const metadata: Metadata = {
  title: "Set New Passphrase",
  robots: { index: false, follow: false },
};

export default function CustomerResetPasswordPage() {
  return (
    <CustomerAuthShell
      eyebrow="Credential Recovery"
      title="Set New Passphrase"
      footer={
        <Link href="/login" className="text-[#e8b765] hover:underline">
          ← Return to Sign In
        </Link>
      }
    >
      <Suspense
        fallback={
          <div className="py-10 text-center font-mono text-xs text-white/50">
            Loading recovery form...
          </div>
        }
      >
        <CustomerResetClient />
      </Suspense>
    </CustomerAuthShell>
  );
}
