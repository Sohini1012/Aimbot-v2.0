/**
 * The shell body traces out ~2.6 world units from rear face to muzzle. A real
 * Retaliator body is roughly 400 mm over the same span, so one world unit is
 * about 154 mm.
 *
 * Every internal part is authored in real millimetres through `mm()` rather
 * than in eyeballed world units. That keeps the components honestly sized
 * relative to the shell — the Pico really is small inside that cavity, and the
 * exploded view should show that rather than flatter the electronics.
 */
const MM_PER_UNIT = 154

export function mm(millimetres: number): number {
  return millimetres / MM_PER_UNIT
}

/** Real dimensions from docs/REFERENCES.md. */
export const DIM = {
  pico: { l: mm(51), w: mm(21), t: mm(1) },
  imu: { l: mm(25), w: mm(15), t: mm(1.2) },
  imuDie: { s: mm(3), t: mm(1) },
  button: { s: mm(6), h: mm(3.2), plunger: mm(1.6) },
  omron: { l: mm(12.8), w: mm(5.8), h: mm(6.5) },
  pot: { body: mm(10), shaft: mm(6), shaftLen: mm(12) },
  joystick: { l: mm(34), w: mm(26), t: mm(1.6), capR: mm(8) },
  perfboard: { l: mm(70), w: mm(30), t: mm(1.6) },
  wire: { r: mm(0.7) },
} as const
