"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import Nav from "@/components/site/Nav";
import type { DestinationTaxonomyDTO, NavTripDTO } from "@/lib/types";

export default function Header({
  navTrips,
  taxonomy,
  contactPhone,
}: {
  navTrips?: NavTripDTO[];
  taxonomy?: DestinationTaxonomyDTO;
  contactPhone?: string;
}) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Pages that already have a full-bleed dark hero canvas starting at top-0
  const isHeroPage =
    pathname === "/" ||
    pathname === "/about" ||
    pathname.startsWith("/destinations") ||
    pathname.startsWith("/route");

  return (
    <>
      <Suspense fallback={null}>
        <Nav
          navTrips={navTrips}
          taxonomy={taxonomy}
          contactPhone={contactPhone}
        />
      </Suspense>
      {/* Spacer for non-hero content pages so top bar + navbar never overlap top headings */}
      {!isHeroPage && (
        <div className="h-[104px] sm:h-[116px] w-full shrink-0" aria-hidden="true" />
      )}
    </>
  );
}
