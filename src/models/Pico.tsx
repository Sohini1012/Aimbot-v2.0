import { useMemo } from 'react'
import { DIM, mm } from './scale'
import { pcbMaterial, metalMaterial, blackPlasticMaterial } from './materials'
import { Instanced, type InstanceSpec } from './Instanced'

/**
 * Raspberry Pi Pico (RP2040) — 51 × 21 × 1 mm, micro-USB overhanging the top
 * edge, 40 castellated pins down both long edges. Confirmed spec, see
 * docs/REFERENCES.md.
 */
export function Pico() {
  const { l, w, t } = DIM.pico

  const pins = useMemo<InstanceSpec[]>(() => {
    const perSide = 20
    const pitch = mm(2.54)
    const out: InstanceSpec[] = []
    for (let i = 0; i < perSide; i++) {
      const x = (i - (perSide - 1) / 2) * pitch
      out.push({ position: [x, 0, w / 2] })
      out.push({ position: [x, 0, -w / 2] })
    }
    return out
  }, [w])

  return (
    <group>
      <mesh castShadow receiveShadow material={pcbMaterial}>
        <boxGeometry args={[l, t, w]} />
      </mesh>

      {/* RP2040 package — silver, centre of the board */}
      <mesh position={[0, t, 0]} material={metalMaterial} castShadow>
        <boxGeometry args={[mm(7), mm(0.9), mm(7)]} />
      </mesh>

      {/* micro-USB, overhanging the top edge */}
      <mesh position={[l / 2 + mm(1.5), t * 0.6, 0]} material={metalMaterial} castShadow>
        <boxGeometry args={[mm(6), mm(2.6), mm(7.5)]} />
      </mesh>

      {/* BOOTSEL */}
      <mesh position={[l / 2 - mm(10), t, 0]} material={blackPlasticMaterial}>
        <cylinderGeometry args={[mm(1.5), mm(1.5), mm(1.2), 10]} />
      </mesh>

      <Instanced instances={pins} material={metalMaterial}>
        <boxGeometry args={[mm(1.4), t * 1.4, mm(1.2)]} />
      </Instanced>
    </group>
  )
}
