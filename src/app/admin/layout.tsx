import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Command Portal | BROTHERS Holidays Adventure",
    template: "%s | Command Portal",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] font-sans text-[#1c1917] selection:bg-[#3f6e15] selection:text-white">
      {children}
    </div>
  );
}
