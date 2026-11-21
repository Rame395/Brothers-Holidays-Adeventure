"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import Nav from "@/components/site/Nav";
import type { NavTripDTO } from "@/lib/types";

export default function Header({ navTrips }: { navTrips?: NavTripDTO[] }) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Pages that already have a full-bleed dark hero canvas starting at top-0
  const isHeroPage =
    pathname === "/" ||
    pathname.startsWith("/destinations") ||
    pathname.startsWith("/route");

  return (
    <>
      <Suspense fallback={null}>
        <Nav navTrips={navTrips} />
      </Suspense>
      {/* Spacer for non-hero content pages so the floating pill doesn't overlap top headings */}
      {!isHeroPage && (
        <div className="h-20 sm:h-24 w-full shrink-0" aria-hidden="true" />
      )}
    </>
  );
}
