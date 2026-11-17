// Per-frame hero state lives outside React: written by scroll/pointer listeners,
// read inside the single useFrame stepper and by direct DOM writes.
export const heroState = {
  /** 0 at top of hero, 1 when the scroll transition has finished. */
  progress: 0,
  /** Pointer in -1..1, smoothed in the stepper. */
  mouseX: 0,
  mouseY: 0,
  reducedMotion: false,
};

/** Display altitude (metres) for a given scroll progress: valley floor to Everest summit. */
export function altitudeFor(progress: number): number {
  const p = Math.min(1, Math.max(0, progress));
  const eased = 1 - Math.pow(1 - p, 2.2);
  return Math.round(4410 + (8849 - 4410) * eased);
}
