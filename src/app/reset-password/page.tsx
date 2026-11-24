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
        <Link href="/login" className="text-[#f05e25] font-semibold hover:underline">
          ← Return to Sign In
        </Link>
      }
    >
      <Suspense
        fallback={
          <div className="py-10 text-center text-xs text-stone-500">
            Loading recovery form...
          </div>
        }
      >
        <CustomerResetClient />
      </Suspense>
    </CustomerAuthShell>
  );
}
