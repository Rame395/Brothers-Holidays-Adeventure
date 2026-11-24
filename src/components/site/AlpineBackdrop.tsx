import Image from "next/image";

export interface AlpineBackdropProps {
  imageSrc: string;
  imageAlt?: string;
  variant?: "light" | "cinematic";
  showMistWave?: boolean;
  showStarGrain?: boolean;
  objectPosition?: string;
}

export function AlpineBackdrop({
  imageSrc,
  imageAlt = "",
  variant = "light",
  showMistWave = false,
  showStarGrain = false,
  objectPosition = "object-center",
}: AlpineBackdropProps) {
  const isLight = variant === "light";

  return (
    <>
      {/* Oversized panoramic backdrop image */}
      <div
        aria-hidden="true"
        className="absolute left-0 -top-[10%] h-[120%] w-full z-0 pointer-events-none"
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="100vw"
          className={
            isLight
              ? `object-cover ${objectPosition} grayscale-[35%] opacity-30`
              : `object-cover ${objectPosition} grayscale-[25%]`
          }
        />
      </div>

      {/* Atmospheric wash layer */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 z-10 pointer-events-none ${
          isLight ? "bg-white/70" : "bg-[#071526]/35"
        }`}
      />

      {/* Optional subtle snow-grain / starlight radial dots */}
      {showStarGrain && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 opacity-60 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.22) 0 1px, transparent 1.2px), radial-gradient(circle at 78% 28%, rgba(255,255,255,0.16) 0 1px, transparent 1.2px), radial-gradient(circle at 32% 72%, rgba(255,255,255,0.18) 0 1px, transparent 1.2px)",
            backgroundSize: "220px 220px, 280px 280px, 320px 320px",
          }}
        />
      )}

      {/* Optional drifting cloud / mist silhouette along bottom boundary */}
      {showMistWave && (
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          className="absolute inset-x-0 -bottom-2 z-10 w-full h-24 sm:h-32 pointer-events-none opacity-80"
        >
          <path
            d="M0,96 C240,36 420,132 680,78 C920,28 1180,120 1440,64 L1440,160 L0,160 Z"
            fill="#ffffff"
            fillOpacity="0.35"
          />
          <path
            d="M0,118 C300,72 520,144 820,96 C1060,58 1260,128 1440,92 L1440,160 L0,160 Z"
            fill="#ffffff"
            fillOpacity="0.55"
          />
          <path
            d="M0,138 C360,104 620,152 940,120 C1180,96 1320,142 1440,124 L1440,160 L0,160 Z"
            fill="#ffffff"
            fillOpacity="0.85"
          />
        </svg>
      )}

      {/* Dual-ended multi-stop white gradient fades */}
      <div
        aria-hidden="true"
        className="absolute -top-px left-0 w-full h-[35%] z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,0.85) 30%, rgba(255,255,255,0.4) 60%, transparent 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -top-px left-0 w-full h-[18%] z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, #ffffff 0%, #ffffff 20%, rgba(255,255,255,0.92) 45%, transparent 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-px left-0 w-full h-[35%] z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0.85) 30%, rgba(255,255,255,0.4) 60%, transparent 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-px left-0 w-full h-[22%] z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, #ffffff 0%, #ffffff 20%, rgba(255,255,255,0.92) 45%, transparent 100%)",
        }}
      />
    </>
  );
}

export default AlpineBackdrop;
