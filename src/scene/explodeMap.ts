import type { PartId } from '@/content/types'

export interface ExplodeSpec {
  /** Offset applied at full explode, in shell-local units. */
  offset: readonly [number, number, number]
  /** Extra rotation at full explode, radians. */
  spin?: readonly [number, number, number]
  /** 0–1. Staggers the parts so they do not all separate on the same frame. */
  delay: number
  /** Where the leader line should anchor, relative to the exploded position. */
  labelAnchor?: readonly [number, number, number]
}

/**
 * §8 beat 3 — every part separates along its own vector.
 *
 * Kept as data rather than as magic numbers inside the timeline, so the
 * exploded view can be retuned without touching animation code, and so beat 6
 * can play the exact same table backwards.
 *
 * Directions follow the real teardown: the clamshell splits laterally, the
 * stock slides off the back, the barrel twists off the front, the magazine
 * drops out of the well, and the internals lift clear of the cavity.
 */
export const EXPLODE: Record<PartId, ExplodeSpec> = {
  shell_left: { offset: [0, 0.1, 1.5], delay: 0.0, labelAnchor: [0, 0.2, 0.2] },
  shell_right: { offset: [0, 0.1, -1.5], delay: 0.0, labelAnchor: [0, 0.2, -0.2] },

  barrel: { offset: [1.5, 0.05, 0], delay: 0.12, labelAnchor: [0.3, 0.1, 0] },
  stock: { offset: [-1.35, -0.05, 0], delay: 0.12, labelAnchor: [-0.3, 0.1, 0] },
  mag: { offset: [0.05, -1.25, 0], delay: 0.08, labelAnchor: [0, -0.2, 0] },

  // internals lift up and out of the cavity, fanned so nothing overlaps
  pico: { offset: [-0.15, 1.15, 0], delay: 0.28, labelAnchor: [0, 0.12, 0] },
  imu: { offset: [0.5, 1.5, 0], delay: 0.34, labelAnchor: [0, 0.1, 0] },
  omron: { offset: [-0.72, 0.62, 0.42], delay: 0.38, labelAnchor: [0, 0.08, 0] },
  buttons: { offset: [-0.6, 0.15, 1.0], delay: 0.42, labelAnchor: [0, 0.08, 0] },
  pot: { offset: [0.95, -0.35, 0.95], delay: 0.46, labelAnchor: [0, 0.1, 0] },
  joystick: { offset: [-1.5, 0.85, -0.3], delay: 0.5, labelAnchor: [0, 0.14, 0] },
  pcb: { offset: [-0.3, 0.6, -0.55], delay: 0.24, labelAnchor: [0, 0.1, 0] },
  wires: { offset: [-0.1, 0.35, 0.25], delay: 0.2, labelAnchor: [0, 0.1, 0] },
  usb: { offset: [-1.0, -0.7, 0.3], delay: 0.16, labelAnchor: [0, 0.08, 0] },
}

/** Ease used for the separation — settles rather than arriving linearly. */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/** §8 beat 1 asks for a slight overshoot on the snap, settling with a
 *  back.out(1.4) feel. This is that curve. */
export function backOut(t: number, overshoot = 1.4): number {
  const c = overshoot + 1
  return 1 + c * Math.pow(t - 1, 3) + overshoot * Math.pow(t - 1, 2)
}

/**
 * Beat 1 — where each part flies in from.
 *
 * Derived from the explode vector rather than authored separately: a part that
 * separates upward also arrives from above, which makes the materialise and
 * the explode read as the same mechanism running in opposite directions.
 * The scatter is deliberately much wider than the explode so parts start off
 * screen.
 */
export function scatterOffset(id: PartId): readonly [number, number, number] {
  const spec = EXPLODE[id]
  const spread = 4.2
  return [
    spec.offset[0] * spread,
    spec.offset[1] * spread + 1.4,
    spec.offset[2] * spread,
  ]
}

/**
 * How far along its vector a part should be, given overall explode progress.
 * The stagger means `delay` shifts a part's window later without shortening it.
 */
export function partProgress(overall: number, delay: number): number {
  const window = 1 - delay
  if (window <= 0) return overall >= 1 ? 1 : 0
  const local = (overall - delay) / window
  return easeOutCubic(Math.min(1, Math.max(0, local)))
}
