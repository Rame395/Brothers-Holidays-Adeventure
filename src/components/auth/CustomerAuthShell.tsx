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
    <section className="relative min-h-[calc(100vh-5rem)] bg-[#faf9f7] text-[#1c1917] px-4 py-12 sm:py-16 flex items-center justify-center">
      {/* Background glow and subtle mountain topography decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-[36rem] rounded-full bg-gradient-to-b from-[#f05e25]/10 via-[#f05e25]/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-stone-100/60 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center space-y-2.5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-200 bg-white text-[#f05e25] shadow-xs">
            <Mountain className="h-6 w-6 stroke-[2]" />
          </div>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f05e25]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f05e25]" />
            {eyebrow}
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[#1c1917]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm mx-auto font-sans">
              {subtitle}
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-stone-900/5">
          {children}
        </div>

        {footer && (
          <div className="text-center text-xs text-stone-600 font-medium">
            {footer}
          </div>
        )}

        <div className="flex items-center justify-between px-2 text-xs text-stone-500 font-medium">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Secure Traveler Authentication
          </span>
          <Link
            href="/"
            className="text-stone-600 hover:text-[#f05e25] transition-colors"
          >
            ← Explore Treks
          </Link>
        </div>
      </div>
    </section>
  );
}
