import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function TrekkingIcon({ className = "w-4 h-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M5 17h14v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-2Z" />
      <path d="M6 17V9a2 2 0 0 1 2-2h3.2a1.5 1.5 0 0 1 1.3.75L14 10.5c.8 1.2 2 1.8 3.6 2a2 2 0 0 1 1.4 1.9V17" />
      <path d="M9.5 11.5h2.5" />
      <path d="M9.5 14h3" />
    </svg>
  );
}

export function PeakClimbingIcon({ className = "w-4 h-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="m3 20 6.5-11 3.5 5.5 2.5-3.5L21 20H3Z" />
      <path d="M9.5 9V4.5" />
      <path d="M9.5 4.5 13 6l-3.5 1.5" />
      <path d="m7.2 13 2.3-1.2 2 1.4" />
    </svg>
  );
}

export function CulturalTourIcon({ className = "w-4 h-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M4 20h16" />
      <path d="M6.5 20v-2.5h11V20" />
      <path d="M7.5 17.5a4.5 4.5 0 0 1 9 0" />
      <path d="M10.5 13h3v-2h-3v2Z" />
      <path d="M12 11V4.5" />
      <path d="M10 8.5h4" />
      <path d="M10.8 6.5h2.4" />
    </svg>
  );
}

export function ShortTrekIcon({ className = "w-4 h-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="16.5" cy="7.5" r="2.5" />
      <path d="m3 19 5.5-8 4 5 2.5-3 6 6H3Z" />
      <path d="M16.5 3v1" />
      <path d="M21 7.5h-1" />
    </svg>
  );
}

export function DayTourIcon({ className = "w-4 h-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M4 20h16" />
      <path d="M7 20v-4h10v4" />
      <path d="m5.5 16 6.5-3 6.5 3" />
      <path d="M8.5 13.5v-2.5h7v2.5" />
      <path d="m7 11 5-3 5 3" />
      <path d="M12 8V4.5" />
    </svg>
  );
}

export function WildlifeSafariIcon({ className = "w-4 h-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="7" cy="16" r="3.2" />
      <circle cx="17" cy="16" r="3.2" />
      <path d="M10.2 15.5h3.6" />
      <path d="M5.2 13.2 7 7h2.5l1 5.5" />
      <path d="M18.8 13.2 17 7h-2.5l-1 5.5" />
      <path d="M9.5 10.5h5" />
    </svg>
  );
}

export function HelicopterIcon({ className = "w-4 h-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M4 6h16" />
      <path d="M12 6v3" />
      <path d="M8 9h7.5a3.5 3.5 0 0 1 3.5 3.5v1a2.5 2.5 0 0 1-2.5 2.5H10a3 3 0 0 1-3-3v-1.5" />
      <path d="M7 12.5H3.5L2.5 10" />
      <path d="M11 16v3" />
      <path d="M15.5 16v3" />
      <path d="M8 19h10.5" />
    </svg>
  );
}

export function DefaultAdventureIcon({ className = "w-4 h-4", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="m14.8 9.2-2 4.8-4.8 2 2-4.8 4.8-2Z" />
    </svg>
  );
}

export function CategoryGlyph({
  slug,
  name,
  className = "w-[18px] h-[18px]",
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  const key = `${slug} ${name}`.toLowerCase();

  if (key.includes("short")) {
    return <ShortTrekIcon className={className} />;
  }
  if (key.includes("climb") || key.includes("peak") || key.includes("expedition")) {
    return <PeakClimbingIcon className={className} />;
  }
  if (key.includes("heli") || key.includes("luxury") || key.includes("vip")) {
    return <HelicopterIcon className={className} />;
  }
  if (key.includes("wildlife") || key.includes("safari") || key.includes("jungle")) {
    return <WildlifeSafariIcon className={className} />;
  }
  if (key.includes("day")) {
    return <DayTourIcon className={className} />;
  }
  if (key.includes("tour") || key.includes("heritage") || key.includes("cultural")) {
    return <CulturalTourIcon className={className} />;
  }
  if (key.includes("trek")) {
    return <TrekkingIcon className={className} />;
  }

  return <DefaultAdventureIcon className={className} />;
}
