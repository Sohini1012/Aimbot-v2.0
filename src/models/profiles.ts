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

/**
 * Short stock — barely a stock at all, which is accurate.
 *
 * Traced as one solid wedge with a single notch rather than a skeletal frame.
 * The skeletal version had a cut-out that, at hero framing, separated into
 * what looked like three unrelated white boxes floating behind the grip: a
 * shape that is legible on a reference photo is not automatically legible at
 * 200 pixels wide.
 */
export const STOCK_OUTLINE: readonly Pt[] = [
  { x: -0.95, y: 0.16 },
  { x: -1.46, y: 0.12 },
  { x: -1.54, y: 0.0 },
  { x: -1.52, y: -0.3 },
  { x: -1.4, y: -0.42 },
  { x: -1.18, y: -0.4 },
  { x: -1.14, y: -0.2 },
  { x: -0.95, y: -0.18 },
]

export const EXTRUDE_DEPTH = 0.5
export const HALF_DEPTH = EXTRUDE_DEPTH / 2

/**
 * Edge rounding — the "pillow".
 *
 * A flat extrusion is a slab: constant thickness, knife edges, no shape across
 * its own width. Real moulded ABS is crowned — the face bulges slightly and
 * rolls over into the edge, and that roll is where every highlight lives.
 *
 * A big bevelThickness with a matching NEGATIVE bevelOffset produces exactly
 * that: the edge rounds over deeply, but because the offset pulls the bevel
 * inward the traced outline is preserved instead of being inflated. (Growing
 * it outward with a positive offset is what fattened the blaster on the first
 * attempt at this.)
 *
 * bevelSegments is what makes the roll read as a curve rather than a chamfer.
 */
export const BEVEL = {
  bevelEnabled: true,
  bevelThickness: 0.055,
  bevelSize: 0.038,
  bevelOffset: -0.038,
  bevelSegments: 6,
} as const

/** Shallower crown for small parts, where the full radius would eat them. */
export const BEVEL_FINE = {
  bevelEnabled: true,
  bevelThickness: 0.018,
  bevelSize: 0.014,
  bevelOffset: -0.014,
  bevelSegments: 4,
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
