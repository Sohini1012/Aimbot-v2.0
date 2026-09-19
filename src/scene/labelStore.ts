import type { PartId } from '@/content/types'

export interface ProjectedLabel {
  id: PartId
  short: string
  name: string
  /** Anchor on the part itself, in 0-1 panel coordinates. */
  ax: number
  ay: number
  /** Where the label text sits, in 0-1 panel coordinates. */
  lx: number
  ly: number
  /** 0-1. Drives fade-in, and 0 means do not draw. */
  opacity: number
  /** True while this is the part the component walk is on. */
  active: boolean
}

/**
 * Bridge between the projection pass (inside the canvas, every frame) and the
 * SVG overlay (outside it). A mutable array rather than react state for the
 * same reason the scroll bridge is: this updates 60 times a second.
 */
export const labelStore: { items: ProjectedLabel[] } = { items: [] }
