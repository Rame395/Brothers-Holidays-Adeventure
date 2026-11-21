import {
  AlertTriangle,
  Cloud,
  Compass,
  Flag,
  Footprints,
  GitFork,
  History,
  Microscope,
  Mountain,
  MountainSnow,
  Satellite,
  Snowflake,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  landscape: Mountain,
  filter_hdr: Mountain,
  terrain: MountainSnow,
  ac_unit: Snowflake,
  explore: Compass,
  flag: Flag,
  history: History,
  alt_route: GitFork,
  biotech: Microscope,
  satellite_alt: Satellite,
  downhill_skiing: Footprints,
  cloud: Cloud,
  warning: AlertTriangle,
};

export function FieldIcon({
  name,
  className,
  fallback = "landscape",
}: {
  name?: string | null;
  className?: string;
  fallback?: "warning" | "landscape";
}) {
  const key = name?.trim().toLowerCase() ?? "";
  const Icon =
    ICON_MAP[key] ?? (fallback === "warning" ? AlertTriangle : Mountain);
  return <Icon className={className} aria-hidden="true" />;
}
