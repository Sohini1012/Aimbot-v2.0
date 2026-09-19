import type { PartId } from '@/content/types'
import { HALF_DEPTH } from './profiles'

export interface Placement {
  position: readonly [number, number, number]
  rotation?: readonly [number, number, number]
  scale?: number
}

/**
 * Where each part sits when the blaster is assembled, in shell-local
 * coordinates. Every one of these follows the placement column of §7 — this
 * table is the 3D expression of that text, and the two must not drift apart.
 */
export const PLACEMENT: Partial<Record<PartId, Placement>> = {
  // "inside the shell, behind the magazine well"
  pico: { position: [-0.24, -0.04, 0], rotation: [0, 0, 0] },

  // mid-body, on the top rail axis so it shares the barrel line
  imu: { position: [0.16, 0.17, 0], rotation: [0, 0, 0] },

  // "bonded directly behind the Nerf trigger"
  omron: { position: [-0.37, -0.27, 0], rotation: [0, 0, 0.18] },

  // Split across both sides — the clusters carry their own shell-local
  // coordinates, so this group sits at the origin and only the explode
  // offset moves it.
  buttons: { position: [0, 0, 0], rotation: [0, 0, 0] },

  // "recessed in the foregrip, thumb-reachable"
  pot: { position: [1.02, -0.58, HALF_DEPTH * 0.5], rotation: [Math.PI / 2.2, 0, 0] },

  // on the front stability handle, under the supporting thumb
  joystick: { position: [0.86, -0.3, HALF_DEPTH * 0.62], rotation: [0.35, 0, 0] },

  // "floor of the shell cavity"
  pcb: { position: [-0.18, -0.15, 0], rotation: [0, 0, 0] },

  // "out of the grip base"
  usb: { position: [-0.86, -0.99, 0], rotation: [0, 0, 0.5] },

  // The harness has no placement of its own — every run is derived from the
  // parts it connects. This anchor exists so the label has somewhere to point.
  wires: { position: [-0.1, -0.06, 0.06], rotation: [0, 0, 0] },
}

/**
 * The two thumb clusters, in shell-local coordinates.
 * Right side is -Z, left side is +Z.
 */
export const BUTTON_CLUSTERS = [
  {
    id: 'right',
    label: 'RELOAD / CLUTCH',
    position: [-0.4, -0.26, -HALF_DEPTH * 0.94] as const,
    rotation: [Math.PI / 2, 0, 0] as const,
    slots: 2,
  },
  {
    id: 'left',
    label: 'GRENADE / AUX',
    position: [0.24, -0.08, HALF_DEPTH * 0.94] as const,
    rotation: [-Math.PI / 2, 0, 0] as const,
    slots: 2,
  },
] as const

const ORIGIN: Placement = { position: [0, 0, 0] }
const warned = new Set<string>()

/**
 * Never throws.
 *
 * This is called from inside useFrame. An exception there does not surface as
 * one bad label — it tears down the render loop and the canvas goes black,
 * which is exactly what a missing "wires" entry did. A missing placement is a
 * mistake worth shouting about in development, but it must degrade to the
 * origin rather than take the whole scene with it.
 */
export function placementOf(id: PartId): Placement {
  const p = PLACEMENT[id]
  if (p) return p

  if (import.meta.env.DEV && !warned.has(id)) {
    warned.add(id)
    console.warn(`[placement] no entry for part "${id}" — falling back to origin`)
  }
  return ORIGIN
}
