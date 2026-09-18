import { useMemo } from 'react'
import { DIM, mm } from './scale'
import { blackPlasticMaterial, metalMaterial } from './materials'
import { Instanced, type InstanceSpec } from './Instanced'
import { BUTTON_CLUSTERS } from './placement'

/**
 * Four 6 × 6 mm tactile switches in two clusters: reload and clutch under the
 * right thumb, grenade and aux forward on the left.
 *
 * Both clusters are instanced together — two instanced meshes (body and
 * plunger) carry all four buttons wherever they sit on the shell, so the whole
 * arrangement costs 2 draw calls.
 */
export function Buttons() {
  const { bodies, plungers } = useMemo(() => {
    const b: InstanceSpec[] = []
    const p: InstanceSpec[] = []

    for (const cluster of BUTTON_CLUSTERS) {
      for (let i = 0; i < cluster.slots; i++) {
        // spread the pair along the body axis, centred on the cluster anchor
        const along = (i - (cluster.slots - 1) / 2) * mm(14)
        const x = cluster.position[0] + along
        const y = cluster.position[1]
        const z = cluster.position[2]
        const facing = Math.sign(z) || 1

        b.push({ position: [x, y, z], rotation: [Math.PI / 2, 0, 0] })
        p.push({
          position: [x, y, z + facing * (DIM.button.h / 2 + DIM.button.plunger / 2)],
          rotation: [Math.PI / 2, 0, 0],
        })
      }
    }

    return { bodies: b, plungers: p }
  }, [])

  return (
    <group>
      <Instanced instances={bodies} material={metalMaterial} castShadow>
        <boxGeometry args={[DIM.button.s, DIM.button.h, DIM.button.s]} />
      </Instanced>

      <Instanced instances={plungers} material={blackPlasticMaterial} castShadow>
        <cylinderGeometry args={[mm(1.7), mm(1.7), DIM.button.plunger, 10]} />
      </Instanced>
    </group>
  )
}
