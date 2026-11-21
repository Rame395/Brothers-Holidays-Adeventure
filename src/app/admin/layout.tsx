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
    <div className="min-h-screen w-full bg-[#060d12] text-[#e7eef0] selection:bg-[#d99f38] selection:text-[#060d12]">
      {children}
    </div>
  );
}
