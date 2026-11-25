import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import AdminMfaSetupClient from "@/components/admin/AdminMfaSetupClient";

async function MfaSetupGate() {
  const auth = await requireAdmin({ allowPendingMfa: true });
  if (auth.mfaVerified) {
    redirect("/admin");
  }
  if (auth.admin.mfaEnabled) {
    redirect("/admin/mfa-verify");
  }

  return (
    <AdminMfaSetupClient
      adminEmail={auth.admin.email}
      adminName={auth.admin.name}
    />
  );
}

export default function AdminMfaSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-sans text-sm font-medium text-[#3f6e15]">
          Loading MFA enrollment...
        </div>
      }
    >
      <MfaSetupGate />
    </Suspense>
  );
}
