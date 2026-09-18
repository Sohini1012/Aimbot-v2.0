import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { Object3D, type InstancedMesh, type Material } from 'three'

export interface InstanceSpec {
  position: readonly [number, number, number]
  rotation?: readonly [number, number, number]
  scale?: readonly [number, number, number] | number
}

interface Props {
  instances: readonly InstanceSpec[]
  material: Material
  castShadow?: boolean
  /** The geometry element, e.g. <boxGeometry args={[...]} />. */
  children: ReactNode
}

/**
 * §11 — repeated small parts (pins, holes, knurls) are instanced rather than
 * drawn as individual meshes.
 *
 * Forty pin meshes on the Pico look identical to one instanced mesh with forty
 * matrices, but cost forty draw calls instead of one. With every component
 * modelled at real millimetre scale there are hundreds of these, and they were
 * pushing the scene to 518 calls before this existed.
 */
export function Instanced({ instances, material, castShadow = false, children }: Props) {
  const ref = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const dummy = new Object3D()

    instances.forEach((inst, i) => {
      dummy.position.set(inst.position[0], inst.position[1], inst.position[2])
      const r = inst.rotation ?? [0, 0, 0]
      dummy.rotation.set(r[0], r[1], r[2])
      if (typeof inst.scale === 'number') {
        dummy.scale.setScalar(inst.scale)
      } else if (inst.scale) {
        dummy.scale.set(inst.scale[0], inst.scale[1], inst.scale[2])
      } else {
        dummy.scale.setScalar(1)
      }
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [instances])

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, instances.length]}
      material={material}
      castShadow={castShadow}
    >
      {children}
    </instancedMesh>
  )
}
