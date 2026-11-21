import Link from "next/link";
import type { ReactNode } from "react";
import { Mountain, ShieldCheck } from "lucide-react";

export default function CustomerAuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="min-h-[calc(100vh-5rem)] bg-[#061116] text-white px-4 py-12 sm:py-16 flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_rgba(217,159,56,0.12),_transparent_58%)]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[#c59a4a]/45 bg-[#0a1a21] text-[#e8b765] shadow-md">
            <Mountain className="h-5 w-5" />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#89d6e2]">
            {eyebrow}
          </p>
          <h1 className="font-serif text-3xl text-white tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-white/65 leading-relaxed max-w-sm mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-[#c59a4a]/35 bg-[#09171e]/95 p-6 sm:p-8 shadow-2xl">
          {children}
        </div>

        {footer && <div className="text-center text-xs text-white/65">{footer}</div>}

        <div className="flex items-center justify-between px-2 text-[11px] text-white/45">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[#89d6e2]" />
            Protected by Argon2id & Session Isolation
          </span>
          <Link href="/" className="hover:text-[#e8b765] transition-colors">
            ← Explore Treks
          </Link>
        </div>
      </div>
    </section>
  );
}
