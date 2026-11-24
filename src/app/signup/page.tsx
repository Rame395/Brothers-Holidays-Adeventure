import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import CustomerAuthShell from "@/components/auth/CustomerAuthShell";
import CustomerSignupClient from "@/components/auth/CustomerSignupClient";

export const metadata: Metadata = {
  title: "Create Traveler Account",
  robots: { index: false, follow: false },
};

export default function CustomerSignupPage() {
  return (
    <CustomerAuthShell
      eyebrow="Expedition Registry"
      title="Create Traveler Account"
      subtitle="Verify your email to manage trip bookings, itinerary inquiries, and privacy preferences."
      footer={
        <span>
          Already registered?{" "}
          <Link
            href="/login"
            className="text-[#f05e25] font-semibold hover:underline"
          >
            Sign in →
          </Link>
        </span>
      }
    >
      <Suspense
        fallback={
          <div className="py-10 text-center text-xs text-stone-500">
            Loading signup form...
          </div>
        }
      >
        <CustomerSignupClient />
      </Suspense>
    </CustomerAuthShell>
  );
}
