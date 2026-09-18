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

  // "flat along the top rail axis, as close to the barrel line as possible"
  imu: { position: [0.72, 0.19, 0], rotation: [0, 0, 0] },

  // "bonded directly behind the Nerf trigger"
  omron: { position: [-0.37, -0.27, 0], rotation: [0, 0, 0.18] },

  // "thumb cluster on the left side of the shell"
  buttons: {
    position: [-0.46, -0.3, HALF_DEPTH * 0.92],
    rotation: [Math.PI / 2, 0, 0],
  },

  // "recessed in the foregrip, thumb-reachable"
  pot: { position: [0.96, -0.46, HALF_DEPTH * 0.55], rotation: [Math.PI / 2.2, 0, 0] },

  // "top of the stock, right thumb"
  joystick: { position: [-1.44, 0.3, -HALF_DEPTH * 0.3], rotation: [0, 0, 0] },

  // "floor of the shell cavity"
  pcb: { position: [-0.18, -0.15, 0], rotation: [0, 0, 0] },

  // "out of the grip base"
  usb: { position: [-0.86, -0.99, 0], rotation: [0, 0, 0.5] },
}

export function placementOf(id: PartId): Placement {
  const p = PLACEMENT[id]
  if (!p) throw new Error(`No placement defined for part "${id}"`)
  return p
}
