/**
 * The bridge between ScrollTrigger and the render loop.
 *
 * Deliberately a mutable singleton rather than React state: the scrub updates
 * this every frame, and routing that through setState would re-render the tree
 * 60 times a second and destroy the frame budget in §11.
 */
export interface ScrollState {
  /** 0–1 across the whole pinned stage. */
  progress: number
  /** Which §8 beat we are in, derived from progress. */
  beat: number
  /** 0–1 within the current beat. */
  beatProgress: number
  /** Index into WALK_ORDER during beat 4, else -1. */
  walkIndex: number
  /** 0-1 within the current component's slice of beat 4. */
  walkSlotProgress: number
}

export const scrollState: ScrollState = {
  progress: 0,
  beat: 0,
  beatProgress: 0,
  walkIndex: -1,
  walkSlotProgress: 0,
}

/** §8 beat boundaries as fractions of the pinned scroll distance. */
export const BEATS = [
  { id: 0, name: 'hero', from: 0.0, to: 0.08 },
  { id: 1, name: 'materialise', from: 0.08, to: 0.18 },
  { id: 2, name: 'orbit', from: 0.18, to: 0.26 },
  { id: 3, name: 'explode', from: 0.26, to: 0.45 },
  { id: 4, name: 'walk', from: 0.45, to: 0.68 },
  { id: 5, name: 'signal', from: 0.68, to: 0.78 },
  { id: 6, name: 'reassemble', from: 0.78, to: 0.86 },
  { id: 7, name: 'muzzle', from: 0.86, to: 0.92 },
  { id: 8, name: 'game', from: 0.92, to: 1.0 },
] as const

export function beatAt(progress: number): { beat: number; beatProgress: number } {
  for (const b of BEATS) {
    if (progress >= b.from && progress < b.to) {
      return { beat: b.id, beatProgress: (progress - b.from) / (b.to - b.from) }
    }
  }
  return progress <= 0 ? { beat: 0, beatProgress: 0 } : { beat: 8, beatProgress: 1 }
}

export function setProgress(p: number, walkCount: number): void {
  const clamped = Math.min(1, Math.max(0, p))
  scrollState.progress = clamped
  const { beat, beatProgress } = beatAt(clamped)
  scrollState.beat = beat
  scrollState.beatProgress = beatProgress
  // Each component owns an equal slice of beat 4. The index changes at the
  // slice boundary and then holds, so the camera settles on a part and stays
  // there rather than drifting continuously toward the next one.
  scrollState.walkIndex =
    beat === 4 ? Math.min(walkCount - 1, Math.floor(beatProgress * walkCount)) : -1
  scrollState.walkSlotProgress =
    beat === 4 ? (beatProgress * walkCount) % 1 : 0
}

/**
 * §10's paper sections interleave with §8's beats, so one monolithic pinned
 * region cannot hold both — a full-bleed paper section would have to sit on
 * top of the canvas mid-beat.
 *
 * Instead each 3D region owns a slice of the global beat timeline and maps its
 * own local scroll progress into that slice. The beat maths above is unchanged;
 * it just gets fed from three triggers rather than one.
 */
export const REGIONS = {
  hero: { from: 0.0, to: 0.26 },
  inside: { from: 0.26, to: 0.86 },
  game: { from: 0.86, to: 1.0 },
} as const

export type RegionName = keyof typeof REGIONS

export function setRegionProgress(
  region: RegionName,
  local: number,
  walkCount: number,
): void {
  const { from, to } = REGIONS[region]
  setProgress(from + Math.min(1, Math.max(0, local)) * (to - from), walkCount)
}

// Dev-only handle so the beat state can be inspected from the console while
// tuning the timeline. Stripped from production builds by the DEV guard.
if (import.meta.env.DEV) {
  ;(globalThis as unknown as { __scrollState?: typeof scrollState }).__scrollState = scrollState
}
