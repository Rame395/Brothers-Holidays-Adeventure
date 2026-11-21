"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  CheckCircle2,
  KeyRound,
  Laptop,
  LogOut,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { authFetch } from "@/lib/auth/client";
import { evaluatePasswordStrength } from "@/lib/auth/validation";

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

  async function handleLogout() {
    await authFetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

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
    <div className="min-h-screen bg-[#060d12] text-[#e7eef0]">
      <header className="border-b border-[#d99f38]/25 bg-[#09131a]/95 sticky top-0 z-30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d99f38]/40 bg-[#0b1922] text-[#e8b765]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#e8b765]">
                BROTHERS Holidays · Command Portal
              </p>
              <h1 className="font-serif text-xl text-white">
                {admin.name}{" "}
                <span className="ml-2 inline-flex items-center rounded-full border border-[#d99f38]/40 bg-[#d99f38]/15 px-2.5 py-0.5 font-mono text-[10px] text-[#e8b765]">
                  {admin.role}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-950/50 px-3 py-1 text-[11px] font-medium text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              MFA Verified
            </span>
            <Link
              href="/"
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:text-white hover:border-white/30"
            >
              View Site
            </Link>
            <button
              type="button"
              onClick={handleLogoutAll}
              className="rounded-lg border border-rose-500/35 bg-rose-950/30 px-3 py-1.5 text-xs text-rose-200 hover:bg-rose-950/60 cursor-pointer"
            >
              Log Out All Devices
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#d99f38] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#060d12] hover:bg-[#e8b765] cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Identity & Next Module Banner */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-[#d99f38]/30 bg-gradient-to-br from-[#0b1922] to-[#081218] p-6 space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#89d6e2]">
              Zero-Trust Access Verified
            </p>
            <h2 className="font-serif text-2xl text-white">
              Security & RBAC Foundation Active
            </h2>
            <p className="text-sm text-white/70 leading-relaxed">
              Your administrator account (<code className="text-[#e8b765]">{admin.email}</code>) is authenticated via Argon2id, mandatory TOTP MFA, strict <code className="text-[#89d6e2]">SameSite=Strict</code> server-side session rotation, and full audit logging. CRM, Booking Pipeline, Catalog, Journal, and SEO managers will mount directly onto this verified layout next.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {permissions.map((perm) => (
                <span
                  key={perm}
                  className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-white/70"
                >
                  {perm}
                </span>
              ))}
            </div>
          </div>

          {/* Change Passphrase */}
          <div className="rounded-2xl border border-white/10 bg-[#0b161e] p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#e8b765]">
              <KeyRound className="h-4 w-4" />
              <h3 className="font-mono text-xs uppercase tracking-[0.2em]">
                Rotate Admin Passphrase
              </h3>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-3">
              {pwdStatus && (
                <div
                  className={`rounded-lg border px-3 py-2 text-xs ${
                    pwdStatus.type === "ok"
                      ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-200"
                      : "border-rose-500/40 bg-rose-950/40 text-rose-200"
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
                className="w-full rounded-lg border border-white/15 bg-[#060d12] px-3 py-2 text-xs text-white focus:border-[#d99f38] focus:outline-none"
              />
              <input
                type="password"
                required
                minLength={12}
                placeholder="New passphrase (12+ chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#060d12] px-3 py-2 text-xs text-white focus:border-[#d99f38] focus:outline-none"
              />
              {newPassword && (
                <p className="text-[11px] text-white/55">{strength.label}</p>
              )}
              <input
                type="password"
                required
                minLength={12}
                placeholder="Confirm new passphrase"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#060d12] px-3 py-2 text-xs text-white focus:border-[#d99f38] focus:outline-none"
              />
              <button
                type="submit"
                disabled={savingPwd || !strength.meetsMinLength}
                className="w-full rounded-lg bg-[#d99f38] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#060d12] hover:bg-[#e8b765] disabled:opacity-60 cursor-pointer"
              >
                {savingPwd ? "Updating..." : "Update Passphrase"}
              </button>
            </form>
          </div>
        </div>

        {/* Active Sessions */}
        <section className="rounded-2xl border border-white/10 bg-[#0b161e] p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[#e8b765]">
              <Laptop className="h-4 w-4" />
              <h3 className="font-mono text-xs uppercase tracking-[0.2em]">
                Active Administrator Sessions ({sessions.length})
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 font-mono text-[10px] uppercase tracking-wider text-white/50">
                  <th className="pb-2.5 pr-4">Device</th>
                  <th className="pb-2.5 pr-4">IP Address</th>
                  <th className="pb-2.5 pr-4">Last Activity</th>
                  <th className="pb-2.5 pr-4">Expires</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sessions.map((s) => (
                  <tr key={s.id}>
                    <td className="py-3 pr-4 text-white">
                      {s.deviceLabel || "Unknown Device"}
                      {s.isCurrent && (
                        <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                          Current
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 font-mono text-white/65">
                      {s.ipAddress || "—"}
                    </td>
                    <td className="py-3 pr-4 text-white/65">
                      {new Date(s.lastActivityAt).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-white/65">
                      {new Date(s.expiresAt).toLocaleString()}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRevokeSession(s.id)}
                        className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-[11px] text-rose-300 hover:bg-rose-950/50 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
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
        <section className="rounded-2xl border border-white/10 bg-[#0b161e] p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#e8b765]">
            <Activity className="h-4 w-4" />
            <h3 className="font-mono text-xs uppercase tracking-[0.2em]">
              Security Audit Trail (Latest 25 Events)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 font-mono text-[10px] uppercase tracking-wider text-white/50">
                  <th className="pb-2.5 pr-4">Timestamp</th>
                  <th className="pb-2.5 pr-4">Portal</th>
                  <th className="pb-2.5 pr-4">Action</th>
                  <th className="pb-2.5 pr-4">Email</th>
                  <th className="pb-2.5 pr-4">IP</th>
                  <th className="pb-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {initialAuditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-2.5 pr-4 font-mono text-[11px] text-white/60 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-[10px] text-[#89d6e2]">
                      {log.actorType}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-[11px] text-white">
                      {log.action}
                    </td>
                    <td className="py-2.5 pr-4 text-white/75">
                      {log.email || "—"}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-[11px] text-white/60">
                      {log.ipAddress || "—"}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 font-mono text-[10px] ${
                          log.success
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-rose-500/15 text-rose-300"
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
      </main>
    </div>
  );
}
