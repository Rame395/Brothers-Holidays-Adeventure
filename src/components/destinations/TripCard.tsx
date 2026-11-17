"use client";

import Link from "next/link";
import { ArrowUpRight, Clock, Mountain } from "lucide-react";
import type { Trip } from "@/data/trips";
import { formatRs } from "@/lib/booking";

export function TripCard({ trip }: { trip: Trip; index?: number }) {
  return (
    <Link
      href={`/destinations/${trip.slug}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-[#d8e5e7] bg-[#071318] shadow-[0_14px_35px_-12px_rgba(0,56,64,0.22)] transition-all duration-500 hover:-translate-y-1 hover:border-[#006b78]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={trip.image}
        alt={trip.name}
        loading="lazy"
        width={1600}
        height={1008}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-108"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050c0e] via-[#050c0e]/45 to-black/25 transition-opacity duration-500 group-hover:opacity-95" />

      <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
        <span className="rounded-full border border-white/20 bg-[#071318]/75 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[#89d6e2] backdrop-blur-md">
          {trip.difficulty}
        </span>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md transition-all duration-500 group-hover:rotate-45 group-hover:bg-[#e8b765] group-hover:text-[#050c0e]">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#e8b765]">
          {trip.area}
        </p>
        <h3 className="mt-1.5 font-serif text-2xl leading-tight text-white font-normal">
          {trip.name}
        </h3>
        <div className="mt-3 flex items-center gap-4 font-mono text-xs text-white/80">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#89d6e2]" /> {trip.days}{" "}
            {trip.days === 1 ? "day" : "days"}
          </span>
          <span className="flex items-center gap-1.5">
            <Mountain className="h-3.5 w-3.5 text-[#e8b765]" />{" "}
            {trip.maxAltitude.toLocaleString("en-US")} m
          </span>
        </div>
        <div className="mt-3 grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 group-hover:grid-rows-[1fr]">
          <div className="overflow-hidden">
            <p className="text-xs leading-relaxed text-white/75 pt-1">
              {trip.tagline}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between border-t border-white/15 pt-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/60">
            From / person
          </span>
          <span className="font-serif text-base font-medium text-[#e8b765]">
            {formatRs(trip.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
