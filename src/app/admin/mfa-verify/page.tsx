import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import AdminMfaVerifyClient from "@/components/admin/AdminMfaVerifyClient";

async function MfaVerifyGate() {
  const auth = await requireAdmin({ allowPendingMfa: true });
  if (auth.mfaVerified) {
    redirect("/admin");
  }

  return <AdminMfaVerifyClient adminEmail={auth.admin.email} />;
}

export default function AdminMfaVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-sans text-sm font-medium text-[#3f6e15]">
          Loading verification...
        </div>
      }
    >
      <MfaVerifyGate />
    </Suspense>
  );
}
