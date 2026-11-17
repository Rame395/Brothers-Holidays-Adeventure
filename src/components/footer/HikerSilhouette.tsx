// Trekker SVG vector path
export function HikerSilhouette({ className = "w-24 h-24 text-white" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 110"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="High Altitude Mountaineer"
    >
      {/* Head with expedition beanie */}
      <circle cx="56" cy="16" r="6.5" />
      {/* Beanie brim */}
      <path d="M 50 17 Q 56 14 62 17 Q 56 19 50 17 Z" opacity="0.9" />

      {/* Torso leaning forward */}
      <path d="M 50 24 C 54 23, 62 25, 65 30 C 67 34, 65 44, 62 52 C 58 54, 52 53, 49 50 C 47 42, 47 30, 50 24 Z" />

      {/* Heavy expedition backpack */}
      <path d="M 40 24 C 44 21, 49 22, 50 25 C 50 36, 49 46, 46 54 C 41 55, 34 50, 34 40 C 34 32, 36 26, 40 24 Z" />
      {/* Top lid of backpack */}
      <ellipse cx="43" cy="22" rx="6" ry="3.5" transform="rotate(-15 43 22)" />

      {/* Left arm extending forward holding trekking pole */}
      <path d="M 61 31 L 70 41 L 75 52" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Forward trekking pole */}
      <line x1="73" y1="46" x2="88" y2="92" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      {/* Forward pole basket */}
      <line x1="84" y1="84" x2="90" y2="86" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />

      {/* Right arm trailing backward holding rear trekking pole */}
      <path d="M 53 31 L 43 42 L 36 53" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Rear trekking pole */}
      <line x1="38" y1="48" x2="22" y2="90" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      {/* Rear pole basket */}
      <line x1="20" y1="83" x2="26" y2="84" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />

      {/* Front Leg stepping upward with bent knee */}
      <path d="M 58 52 L 67 67 L 72 86 L 78 87 L 78 91 L 67 91 L 62 72 L 55 54 Z" />

      {/* Rear Leg pushing off backward */}
      <path d="M 51 52 L 44 68 L 35 83 L 30 83 L 28 87 L 38 87 L 49 71 L 54 53 Z" />
    </svg>
  );
}
