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

export function placementOf(id: PartId): Placement {
  const p = PLACEMENT[id]
  if (!p) throw new Error(`No placement defined for part "${id}"`)
  return p
}
