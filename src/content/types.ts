/** Stable ids for every modelled part. Drives the model registry, the explode
 *  map and the component walk — all three index off this union, so adding a
 *  part is a compile error until it is modelled, mapped and narrated. */
export type PartId =
  | 'shell_left'
  | 'shell_right'
  | 'barrel'
  | 'stock'
  | 'mag'
  | 'pico'
  | 'imu'
  | 'omron'
  | 'buttons'
  | 'pot'
  | 'joystick'
  | 'pcb'
  | 'wires'
  | 'usb'

export interface HardwarePart {
  id: PartId
  /** Display name, set in JetBrains Mono on the card. */
  name: string
  /** Short label for leader lines in the exploded view. */
  short: string
  /** One sentence: what it does in the build. Source: §7. */
  role: string
  /** Where it physically sits. Source: §7. */
  placement: string
  /** Optional story beat — the memorable detail for this part. */
  note?: string
  /** Whether the component walk flies to this part. */
  inWalk: boolean
}

export interface FirmwareStage {
  index: number
  label: string
  detail: string
}

export interface BomEntry {
  item: string
  qty: number
  sourcing: 'e-waste' | 'bought' | 'reused'
  /** Rupees. null = not yet supplied by the team; never invent a figure. */
  cost: number | null
}

export interface TeamMember {
  name: string
  role: string
}

export interface SectionMeta {
  id: string
  numeral: string
  title: string
}
