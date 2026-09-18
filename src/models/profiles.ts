import { Shape } from 'three'

/**
 * Side-view silhouette of the Retaliator body, in world units with +X toward
 * the muzzle and +Y up. Proportions follow docs/REFERENCES.md — the overall
 * body spans x ∈ [-1.05, 1.55], which keeps the assembled blaster a little
 * under 3 units long so it frames cleanly at the hero camera distance.
 *
 * The outline is traced as one closed loop: muzzle → top rail → rear → grip →
 * trigger guard → magazine well → back to the muzzle. Keeping it a single loop
 * (rather than booleans of primitives) means ExtrudeGeometry gives us clean
 * side walls and a bevel that reads as moulded plastic.
 */

export interface Pt {
  x: number
  y: number
}

/** Traced outline, counter-clockwise. */
export const BODY_OUTLINE: readonly Pt[] = [
  // muzzle face
  { x: 1.55, y: -0.12 },
  { x: 1.55, y: 0.16 },
  // step up onto the top rail
  { x: 1.34, y: 0.16 },
  { x: 1.34, y: 0.3 },
  // the long flat top rail — the IMU mounts along this axis
  { x: -0.55, y: 0.3 },
  // rear sight bump
  { x: -0.62, y: 0.38 },
  { x: -0.8, y: 0.38 },
  { x: -0.86, y: 0.3 },
  // rear face, where the stock snaps on
  { x: -1.05, y: 0.28 },
  { x: -1.05, y: -0.18 },
  { x: -0.88, y: -0.2 },
  // grip: rear edge falls away and back
  { x: -0.99, y: -0.95 },
  { x: -0.73, y: -1.02 },
  // grip front edge climbing back to the body
  { x: -0.52, y: -0.34 },
  // trigger guard
  { x: -0.44, y: -0.3 },
  { x: -0.4, y: -0.46 },
  { x: -0.2, y: -0.5 },
  { x: -0.13, y: -0.34 },
  { x: -0.12, y: -0.22 },
  // magazine well, forward of the trigger guard and canted forward
  { x: 0.04, y: -0.22 },
  { x: 0.1, y: -0.74 },
  { x: 0.46, y: -0.78 },
  { x: 0.44, y: -0.22 },
  // body underside running forward to the muzzle
  { x: 1.2, y: -0.2 },
  { x: 1.34, y: -0.16 },
]

export function buildShape(points: readonly Pt[]): Shape {
  const shape = new Shape()
  const first = points[0]
  if (!first) throw new Error('buildShape: empty outline')
  shape.moveTo(first.x, first.y)
  for (let i = 1; i < points.length; i++) {
    const p = points[i]
    if (p) shape.lineTo(p.x, p.y)
  }
  shape.closePath()
  return shape
}

/** The priming slide that sits above and behind the magazine well. */
export const SLIDE_OUTLINE: readonly Pt[] = [
  { x: 0.5, y: 0.02 },
  { x: 1.12, y: 0.02 },
  { x: 1.12, y: 0.24 },
  { x: 0.5, y: 0.24 },
]

/** Skeletal stock — it has a cut-out, it is not a solid block. */
export const STOCK_OUTLINE: readonly Pt[] = [
  { x: -1.05, y: 0.26 },
  { x: -1.86, y: 0.24 },
  { x: -1.92, y: -0.12 },
  { x: -1.72, y: -0.14 },
  { x: -1.7, y: 0.06 },
  { x: -1.3, y: 0.08 },
  { x: -1.3, y: -0.5 },
  { x: -1.52, y: -0.52 },
  { x: -1.5, y: -0.72 },
  { x: -1.05, y: -0.7 },
]

/** Angled foregrip, below the barrel line and ahead of the magazine well. */
export const FOREGRIP_OUTLINE: readonly Pt[] = [
  { x: 0.72, y: -0.2 },
  { x: 0.98, y: -0.2 },
  { x: 1.12, y: -0.78 },
  { x: 0.9, y: -0.84 },
]

export const EXTRUDE_DEPTH = 0.54
export const HALF_DEPTH = EXTRUDE_DEPTH / 2

export const BEVEL = {
  bevelEnabled: true,
  bevelThickness: 0.012,
  bevelSize: 0.012,
  bevelOffset: 0,
  bevelSegments: 2,
} as const
