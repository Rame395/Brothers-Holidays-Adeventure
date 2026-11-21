import type { Metadata } from "next";
import Link from "next/link";
import CustomerAuthShell from "@/components/auth/CustomerAuthShell";
import CustomerForgotClient from "@/components/auth/CustomerForgotClient";

export const metadata: Metadata = {
  title: "Forgot Passphrase",
  robots: { index: false, follow: false },
};

export default function CustomerForgotPasswordPage() {
  return (
    <CustomerAuthShell
      eyebrow="Account Recovery"
      title="Forgot Passphrase"
      subtitle="Single-use recovery links expire in 30 minutes and sign out all active sessions."
      footer={
        <Link href="/login" className="text-[#e8b765] hover:underline">
          ← Return to Sign In
        </Link>
      }
    >
      <CustomerForgotClient />
    </CustomerAuthShell>
  );
}
