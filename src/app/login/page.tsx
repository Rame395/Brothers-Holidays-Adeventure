import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import CustomerAuthShell from "@/components/auth/CustomerAuthShell";
import CustomerLoginClient from "@/components/auth/CustomerLoginClient";

export const metadata: Metadata = {
  title: "Traveler Sign In",
  robots: { index: false, follow: false },
};

export default function CustomerLoginPage() {
  return (
    <CustomerAuthShell
      eyebrow="Traveler Portal"
      title="Welcome Back"
      subtitle="Access your Himalayan expedition bookings, inquiries, and travel documents."
      footer={
        <span>
          New traveler?{" "}
          <Link
            href="/signup"
            className="text-[#e8b765] font-semibold hover:underline"
          >
            Create your account →
          </Link>
        </span>
      }
    >
      <Suspense
        fallback={
          <div className="py-10 text-center font-mono text-xs text-white/50">
            Loading sign-in form...
          </div>
        }
      >
        <CustomerLoginClient />
      </Suspense>
    </CustomerAuthShell>
  );
}
