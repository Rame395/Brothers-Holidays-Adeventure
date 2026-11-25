"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  CheckCircle2,
  KeyRound,
  Laptop,
  Trash2,
} from "lucide-react";
import { authFetch } from "@/lib/auth/client";
import { evaluatePasswordStrength } from "@/lib/auth/validation";
import AdminShell from "./AdminShell";

export interface AdminSessionDTO {
  id: string;
  deviceLabel: string | null;
  ipAddress: string | null;
  mfaVerified: boolean;
  lastActivityAt: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface AdminAuditDTO {
  id: string;
  actorType: string;
  email: string | null;
  action: string;
  success: boolean;
  ipAddress: string | null;
  metadata: string | null;
  createdAt: string;
}

export default function AdminSecurityOverviewClient({
  admin,
  permissions,
  initialSessions,
  initialAuditLogs,
}: {
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;
    mfaEnabled: boolean;
    lastLoginAt: string | null;
  };
  permissions: readonly string[];
  initialSessions: AdminSessionDTO[];
  initialAuditLogs: AdminAuditDTO[];
}) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initialSessions);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdStatus, setPwdStatus] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [savingPwd, setSavingPwd] = useState(false);

  const strength = evaluatePasswordStrength(newPassword);

  async function handleLogoutAll() {
    await authFetch("/api/admin/auth/logout-all", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function handleRevokeSession(id: string) {
    const res = await authFetch(`/api/admin/auth/sessions/${id}`, {
      method: "DELETE",
    });
    const json = (await res.json()) as {
      ok: boolean;
      revokedCurrent?: boolean;
    };
    if (res.ok && json.ok) {
      if (json.revokedCurrent) {
        router.push("/admin/login");
        router.refresh();
      } else {
        setSessions((prev) => prev.filter((s) => s.id !== id));
      }
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdStatus(null);
    if (newPassword !== confirmPassword) {
      setPwdStatus({ type: "err", text: "Passphrases do not match." });
      return;
    }
    setSavingPwd(true);
    try {
      const res = await authFetch("/api/admin/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        message?: string;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setPwdStatus({
          type: "err",
          text: json.error || "Unable to update passphrase.",
        });
        return;
      }
      setPwdStatus({
        type: "ok",
        text: json.message || "Passphrase updated.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.refresh();
    } catch {
      setPwdStatus({ type: "err", text: "Network error updating passphrase." });
    } finally {
      setSavingPwd(false);
    }
  }

  return (
    <AdminShell
      admin={admin}
      permissions={permissions}
      title="Security & Audit"
      subtitle="Session governance, role permissions, passphrase rotation, and authentication events."
      actions={
        <>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            MFA Verified
          </span>
          <button
            type="button"
            onClick={handleLogoutAll}
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer transition-colors"
          >
            Log Out All Devices
          </button>
        </>
      }
    >
      {/* Identity & RBAC Matrix */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-[#3f6e15]/20 bg-gradient-to-br from-[#3f6e15]/[0.06] to-white p-6 shadow-xs space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3f6e15]">
            Zero-Trust Access Verified
          </p>
          <h2 className="font-heading font-bold text-2xl text-[#1c1917]">
            Security &amp; RBAC Foundation Active
          </h2>
          <p className="text-sm text-[#57534d] leading-relaxed">
            Your administrator account (
            <code className="font-mono text-xs font-semibold text-[#3f6e15]">
              {admin.email}
            </code>
            ) is authenticated via Argon2id, mandatory TOTP MFA, strict{" "}
            <code className="font-mono text-xs text-[#f05e25]">
              SameSite=Strict
            </code>{" "}
            server-side session rotation, and full audit logging.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-2">
            {permissions.map((perm) => (
              <span
                key={perm}
                className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 font-mono text-xs font-medium text-[#3f6e15]"
              >
                {perm}
              </span>
            ))}
          </div>
        </div>

        {/* Change Passphrase */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#3f6e15]">
            <KeyRound className="h-4 w-4 text-[#f05e25]" />
            <h3 className="font-heading font-bold text-lg text-[#1c1917]">
              Rotate Admin Passphrase
            </h3>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-3">
            {pwdStatus && (
              <div
                className={`rounded-xl border px-3.5 py-2.5 text-sm ${
                  pwdStatus.type === "ok"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                {pwdStatus.text}
              </div>
            )}
            <input
              type="password"
              required
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] placeholder:text-slate-400 focus:border-[#3f6e15] focus:outline-none focus:ring-2 focus:ring-[#3f6e15]/15"
            />
            <input
              type="password"
              required
              minLength={12}
              placeholder="New passphrase (12+ chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] placeholder:text-slate-400 focus:border-[#3f6e15] focus:outline-none focus:ring-2 focus:ring-[#3f6e15]/15"
            />
            {newPassword && (
              <p className="text-xs font-medium text-[#57534d]">
                {strength.label}
              </p>
            )}
            <input
              type="password"
              required
              minLength={12}
              placeholder="Confirm new passphrase"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#1c1917] placeholder:text-slate-400 focus:border-[#3f6e15] focus:outline-none focus:ring-2 focus:ring-[#3f6e15]/15"
            />
            <button
              type="submit"
              disabled={savingPwd || !strength.meetsMinLength}
              className="w-full rounded-xl bg-[#f05e25] hover:bg-[#d94e18] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 cursor-pointer transition-colors shadow-xs"
            >
              {savingPwd ? "Updating..." : "Update Passphrase"}
            </button>
          </form>
        </div>
      </div>

      {/* Active Sessions */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-[#3f6e15]">
            <Laptop className="h-4 w-4 text-[#f05e25]" />
            <h3 className="font-heading font-bold text-xl text-[#1c1917]">
              Active Administrator Sessions ({sessions.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="pb-3 pr-4">Device</th>
                <th className="pb-3 pr-4">IP Address</th>
                <th className="pb-3 pr-4">Last Activity</th>
                <th className="pb-3 pr-4">Expires</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 pr-4 font-medium text-[#1c1917]">
                    {s.deviceLabel || "Unknown Device"}
                    {s.isCurrent && (
                      <span className="ml-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        Current
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 pr-4 font-mono text-xs text-[#57534d]">
                    {s.ipAddress || "—"}
                  </td>
                  <td className="py-3.5 pr-4 text-[#57534d]">
                    {new Date(s.lastActivityAt).toLocaleString()}
                  </td>
                  <td className="py-3.5 pr-4 text-[#57534d]">
                    {new Date(s.expiresAt).toLocaleString()}
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(s.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Security Audit Log */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-[#3f6e15]">
          <Activity className="h-4 w-4 text-[#3f6e15]" />
          <h3 className="font-heading font-bold text-xl text-[#1c1917]">
            Security Audit Trail (Latest 25 Events)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="pb-3 pr-4">Timestamp</th>
                <th className="pb-3 pr-4">Portal</th>
                <th className="pb-3 pr-4">Action</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">IP</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="py-3 pr-4 font-mono text-xs text-[#57534d] whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs font-semibold text-[#3f6e15]">
                    {log.actorType}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs font-medium text-[#1c1917]">
                    {log.action}
                  </td>
                  <td className="py-3 pr-4 text-[#57534d]">
                    {log.email || "—"}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-[#57534d]">
                    {log.ipAddress || "—"}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        log.success
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-rose-200 bg-rose-50 text-rose-700"
                      }`}
                    >
                      {log.success ? "OK" : "DENIED"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
