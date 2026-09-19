import { Shape } from 'three'

/**
 * Side-view silhouette of the Retaliator, +X toward the muzzle, +Y up.
 *
 * Corrected against the references in docs/REFERENCES.md. Three things the
 * first pass had wrong and this one fixes:
 *
 *  - It primes with a **top slide**, not an under-barrel pump. The slide rides
 *    on the upper body and carries the blaster's single tactical rail.
 *  - The stock is **very short** — reviewers call it unusably short for adults.
 *  - The foregrip is a plain **cylinder**, not an angled wedge.
 *
 * Reviewers describe the overall read as a "pistol dressed as a rifle": a
 * compact, handgun-proportioned body wearing rifle furniture. The outline
 * below is deliberately stubbier than a carbine profile for that reason.
 */

export interface Pt {
  x: number
  y: number
}

/** Main body: muzzle → top → rear → grip → trigger guard → magwell → back. */
export const BODY_OUTLINE: readonly Pt[] = [
  { x: 1.3, y: -0.1 },
  { x: 1.3, y: 0.13 },
  { x: 1.06, y: 0.15 },
  { x: 1.06, y: 0.21 },
  // upper body — the slide rides on top of this
  { x: -0.7, y: 0.21 },
  { x: -0.86, y: 0.19 },
  { x: -0.95, y: 0.12 },
  // rear face where the short stock snaps on
  { x: -0.95, y: -0.12 },
  { x: -0.8, y: -0.15 },
  // grip, raked back
  { x: -0.9, y: -0.88 },
  { x: -0.62, y: -0.95 },
  { x: -0.45, y: -0.3 },
  // trigger guard
  { x: -0.38, y: -0.26 },
  { x: -0.34, y: -0.44 },
  { x: -0.14, y: -0.48 },
  { x: -0.08, y: -0.3 },
  { x: -0.07, y: -0.18 },
  // magazine well, forward of the trigger guard
  { x: 0.06, y: -0.18 },
  { x: 0.1, y: -0.7 },
  { x: 0.44, y: -0.72 },
  { x: 0.42, y: -0.18 },
  // underside forward to the muzzle
  { x: 1.06, y: -0.16 },
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

/**
 * The priming slide. It sits on top of the body and carries the tactical rail,
 * which is the blaster's most recognisable feature from the side.
 */
export const SLIDE_OUTLINE: readonly Pt[] = [
  { x: -0.62, y: 0.21 },
  { x: 1.02, y: 0.21 },
  { x: 1.02, y: 0.38 },
  { x: 0.9, y: 0.42 },
  { x: -0.5, y: 0.42 },
  { x: -0.62, y: 0.36 },
]

/** Short stock — barely a stock at all, which is accurate. */
export const STOCK_OUTLINE: readonly Pt[] = [
  { x: -0.95, y: 0.14 },
  { x: -1.5, y: 0.16 },
  { x: -1.56, y: -0.04 },
  { x: -1.36, y: -0.06 },
  { x: -1.34, y: -0.38 },
  { x: -1.54, y: -0.4 },
  { x: -1.5, y: -0.6 },
  { x: -0.95, y: -0.58 },
]

export const EXTRUDE_DEPTH = 0.5
export const HALF_DEPTH = EXTRUDE_DEPTH / 2

export const BEVEL = {
  bevelEnabled: true,
  bevelThickness: 0.012,
  bevelSize: 0.012,
  bevelOffset: 0,
  bevelSegments: 2,
} as const

/** Picatinny-style rail teeth along the top of the slide. */
export const RAIL = {
  from: -0.42,
  to: 0.86,
  teeth: 13,
  toothWidth: 0.045,
  height: 0.05,
  width: 0.17,
} as const
