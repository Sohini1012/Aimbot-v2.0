import { useLayoutEffect, useRef } from 'react'
import { Object3D, type InstancedMesh } from 'three'
import { DIM, mm } from './scale'
import { blackPlasticMaterial, metalMaterial } from './materials'

/** Thumb-cluster layout, in local units relative to the cluster centre. */
export const BUTTON_SLOTS: readonly (readonly [number, number])[] = [
  [-mm(11), mm(9)],
  [mm(1), mm(11)],
  [mm(12), mm(7)],
  [-mm(7), -mm(6)],
  [mm(6), -mm(8)],
]

/**
 * Five 6 × 6 mm tactile switches: reload, weapon swap, clutch, sensitivity
 * cycle, recentre.
 *
 * §11 asks for these to be instanced. Two instanced meshes (body + plunger)
 * carry all five, so the cluster costs 2 draw calls instead of 10.
 */
export function Buttons() {
  const bodies = useRef<InstancedMesh>(null)
  const plungers = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const dummy = new Object3D()
    const b = bodies.current
    const p = plungers.current
    if (!b || !p) return

    BUTTON_SLOTS.forEach(([x, z], i) => {
      dummy.position.set(x, 0, z)
      dummy.updateMatrix()
      b.setMatrixAt(i, dummy.matrix)

      dummy.position.set(x, DIM.button.h / 2 + DIM.button.plunger / 2, z)
      dummy.updateMatrix()
      p.setMatrixAt(i, dummy.matrix)
    })

    b.instanceMatrix.needsUpdate = true
    p.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <group>
      <instancedMesh
        ref={bodies}
        args={[undefined, undefined, BUTTON_SLOTS.length]}
        material={metalMaterial}
        castShadow
      >
        <boxGeometry args={[DIM.button.s, DIM.button.h, DIM.button.s]} />
      </instancedMesh>

      <instancedMesh
        ref={plungers}
        args={[undefined, undefined, BUTTON_SLOTS.length]}
        material={blackPlasticMaterial}
        castShadow
      >
        <cylinderGeometry args={[mm(1.7), mm(1.7), DIM.button.plunger, 10]} />
      </instancedMesh>
    </group>
  )
}
