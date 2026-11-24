"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock, Mountain } from "lucide-react";
import type { TripDTO } from "@/lib/types";
import { formatRs } from "@/lib/booking";

export function TripCard({ trip }: { trip: TripDTO; index?: number }) {
  return (
    <Link
      href={`/destinations/${trip.slug}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-[#d6cfc2] bg-[#0b181f] shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#c89b4b] hover:shadow-xl"
    >
      <Image
        src={trip.image}
        alt={trip.name}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#081318] via-[#081318]/45 to-black/20" />

      <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
        <span className="rounded-full border border-white/20 bg-[#081318]/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
          {trip.difficulty}
        </span>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#081318]/75 border border-white/15 text-white transition-colors duration-300 group-hover:bg-[#c89b4b] group-hover:text-[#081318] group-hover:border-[#c89b4b]">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7dd3fc]">
          {trip.area}
        </p>
        <h3 className="mt-1 font-serif text-2xl font-semibold leading-tight text-white tracking-wide">
          {trip.name}
        </h3>
        <div className="mt-2.5 flex items-center gap-4 text-xs text-white/85 tabular-nums">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#f05e25]" /> {trip.days}{" "}
            {trip.days === 1 ? "day" : "days"}
          </span>
          <span className="flex items-center gap-1.5">
            <Mountain className="h-3.5 w-3.5 text-[#f05e25]" />{" "}
            {trip.maxAltitude.toLocaleString("en-US")} m
          </span>
        </div>
        <p className="mt-2.5 text-xs leading-relaxed text-white/75 line-clamp-2">
          {trip.tagline}
        </p>
        <div className="mt-4 flex items-end justify-between border-t border-white/15 pt-3 tabular-nums">
          <span className="text-[11px] uppercase tracking-wider text-white/60">
            From / person
          </span>
          <span className="font-serif text-lg font-bold text-[#f05e25]">
            {formatRs(trip.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
