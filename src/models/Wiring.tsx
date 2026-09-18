import { useMemo } from 'react'
import {
  CatmullRomCurve3,
  Vector3,
  TubeGeometry,
  MeshStandardMaterial,
  Color,
  BufferAttribute,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { DIM } from './scale'
import { placementOf, BUTTON_CLUSTERS } from './placement'

/** Dupont ribbon colours — the real ones are garish and that is the point. */
const WIRE_COLOURS = ['#d94a3d', '#e0a02a', '#3f8f4f', '#2f6fbf', '#8a4fbf', '#d8d8d8'] as const

/** One material for every jumper. The colours ride on a vertex attribute so
 *  all eighteen runs merge into a single mesh — §11 asks for the wires not to
 *  cost a draw call each, and eighteen tubes was the largest remaining cluster. */
const wireMaterial = new MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.42,
  metalness: 0.05,
})

/** Deterministic jitter — the routing should look hand-done, but it must not
 *  reshuffle itself on every render. */
function seeded(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x) - 0.5
}

interface Run {
  /** Where this bundle goes, for the signal-path animation in beat 5. */
  id: string
  from: readonly [number, number, number]
  to: readonly [number, number, number]
  /** Extra control points so the run drapes instead of going straight. */
  via: readonly (readonly [number, number, number])[]
  count: number
}

function v(p: readonly [number, number, number]): Vector3 {
  return new Vector3(p[0], p[1], p[2])
}

/**
 * §6/§8 — every jumper is a TubeGeometry swept along a CatmullRomCurve3.
 *
 * The runs sag and wander on purpose. A CAD-clean harness would look nothing
 * like the inside of this build, and the honesty of the wiring is part of what
 * the exploded view is showing.
 */
export function Wiring() {
  const runs = useMemo<readonly Run[]>(() => {
    const pico = placementOf('pico').position
    const imu = placementOf('imu').position
    const pot = placementOf('pot').position
    const joystick = placementOf('joystick').position
    const usb = placementOf('usb').position

    return [
      // I²C to the IMU — SDA/SCL, runs forward along the rail
      { id: 'i2c', from: pico, to: imu, via: [[0.2, 0.08, 0.04]], count: 4 },
      // GPIO out to both thumb clusters — right side, then left and forward
      {
        id: 'gpio-right',
        from: pico,
        to: BUTTON_CLUSTERS[0].position,
        via: [[-0.34, -0.16, -0.1]],
        count: 3,
      },
      {
        id: 'gpio-left',
        from: pico,
        to: BUTTON_CLUSTERS[1].position,
        via: [[0.02, -0.04, 0.12]],
        count: 3,
      },
      // ADC to the potentiometer in the foregrip
      { id: 'adc-pot', from: pico, to: pot, via: [[0.42, -0.3, 0.08]], count: 3 },
      // ADC to the joystick on the stock
      { id: 'adc-stick', from: pico, to: joystick, via: [[-0.9, 0.06, -0.06]], count: 4 },
      // power and HID data out of the grip base
      { id: 'usb', from: pico, to: usb, via: [[-0.6, -0.5, 0]], count: 2 },
    ]
  }, [])

  const merged = useMemo(() => {
    const geometries: TubeGeometry[] = []

    runs.forEach((run, runIndex) => {
      for (let i = 0; i < run.count; i++) {
        const seed = runIndex * 17 + i
        const spread = 0.012

        const start = v(run.from).add(
          new Vector3(seeded(seed) * spread, seeded(seed + 1) * spread, seeded(seed + 2) * spread),
        )
        const end = v(run.to).add(
          new Vector3(
            seeded(seed + 3) * spread,
            seeded(seed + 4) * spread,
            seeded(seed + 5) * spread,
          ),
        )

        const mids = run.via.map((m, mi) =>
          v(m).add(
            new Vector3(
              seeded(seed + 10 + mi) * 0.05,
              seeded(seed + 20 + mi) * 0.05 - 0.02,
              seeded(seed + 30 + mi) * 0.05,
            ),
          ),
        )

        const curve = new CatmullRomCurve3([start, ...mids, end], false, 'catmullrom', 0.4)
        const geo = new TubeGeometry(curve, 26, DIM.wire.r, 6, false)

        // paint this run's colour onto its vertices before the merge
        const colour = new Color(WIRE_COLOURS[(runIndex + i) % WIRE_COLOURS.length])
        const count = geo.attributes.position?.count ?? 0
        const colours = new Float32Array(count * 3)
        for (let vtx = 0; vtx < count; vtx++) {
          colours[vtx * 3] = colour.r
          colours[vtx * 3 + 1] = colour.g
          colours[vtx * 3 + 2] = colour.b
        }
        geo.setAttribute('color', new BufferAttribute(colours, 3))
        geometries.push(geo)
      }
    })

    const result = mergeGeometries(geometries, false)
    for (const g of geometries) g.dispose()
    return result
  }, [runs])

  if (!merged) return null

  return <mesh geometry={merged} material={wireMaterial} castShadow />
}
