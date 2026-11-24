import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import CustomerAuthShell from "@/components/auth/CustomerAuthShell";
import CustomerMfaVerifyClient from "@/components/auth/CustomerMfaVerifyClient";
import { requireCustomer } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Verify Identity",
  robots: { index: false, follow: false },
};

async function CustomerMfaGate() {
  const auth = await requireCustomer({ allowPendingMfa: true });
  if (auth.mfaVerified) {
    redirect("/account");
  }
  return <CustomerMfaVerifyClient email={auth.customer.email} />;
}

export default function CustomerMfaPage() {
  return (
    <CustomerAuthShell
      eyebrow="Two-Factor Security"
      title="Verify Your Device"
      subtitle="Enter the 6-digit code from your authenticator app or a recovery code."
    >
      <Suspense
        fallback={
          <div className="py-10 text-center text-xs text-stone-500">
            Checking session...
          </div>
        }
      >
        <CustomerMfaGate />
      </Suspense>
    </CustomerAuthShell>
  );
}
