import { useMemo, useRef } from 'react'

import { Instanced, type InstanceSpec } from '@/models/Instanced'
import { Object3D, MeshStandardMaterial, Color, type InstancedMesh, type Group } from 'three'
import type { AimTrainer } from './useAimTrainer'
import { useSafeFrame } from '@/scene/useSafeFrame'

const targetMaterial = new MeshStandardMaterial({
  color: new Color('#f5a623'),
  emissive: new Color('#f5a623'),
  emissiveIntensity: 0.5,
  roughness: 0.3,
})

const ringMaterial = new MeshStandardMaterial({
  color: new Color('#16161c'),
  roughness: 0.8,
})

const crosshairMaterial = new MeshStandardMaterial({
  color: new Color('#f6f5f2'),
  emissive: new Color('#f6f5f2'),
  emissiveIntensity: 0.8,
})

/** Arena half-extents in world units — the [-1,1] engine space maps onto this. */
const EXTENT_X = 2.6
const EXTENT_Y = 1.7
const MAX_TARGETS = 6

/**
 * The aim trainer arena, rendered in the same WebGL canvas as the blaster
 * (§11 — one context for the whole page).
 *
 * Targets are one instanced mesh, so target count never costs draw calls.
 */
export function Arena({ trainer }: { trainer: AimTrainer }) {
  const targets = useRef<InstancedMesh>(null)
  const crosshair = useRef<Group>(null)

  const backdrop = useMemo<InstanceSpec[]>(() => {
    // a sparse grid of dim posts, so the arena reads as a space rather than a void
    const out: InstanceSpec[] = []
    for (let i = 0; i < 24; i++) {
      out.push({
        position: [(Math.random() * 2 - 1) * 5, (Math.random() * 2 - 1) * 2.4, -3 - Math.random() * 4],
        scale: [0.02, 0.6 + Math.random() * 1.4, 0.02],
      })
    }
    return out
  }, [])

  useSafeFrame('arena', () => {
    trainer.step()

    const state = trainer.stateRef.current
    const mesh = targets.current
    if (mesh) {
      const dummy = new Object3D()
      const now = performance.now() / 1000

      for (let i = 0; i < MAX_TARGETS; i++) {
        const t = state.targets[i]
        if (!t) {
          dummy.scale.setScalar(0)
          dummy.position.set(0, 0, 0)
        } else {
          // pop on hit, then shrink out
          const age = t.hitAt === null ? 0 : now - t.hitAt
          const scale = t.hitAt === null ? 1 : Math.max(0, 1 + age * 4 - age * 14)
          dummy.position.set(t.x * EXTENT_X, t.y * EXTENT_Y, 0)
          dummy.scale.setScalar(t.radius * 9 * scale)
        }
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
    }

    const ch = crosshair.current
    if (ch) {
      ch.position.set(state.cursor.x * EXTENT_X, state.cursor.y * EXTENT_Y, 0.4)
      ch.scale.setScalar(state.clutched ? 1.45 : 1)
    }
  })

  return (
    <group>
      <Instanced instances={backdrop} material={ringMaterial}>
        <boxGeometry args={[1, 1, 1]} />
      </Instanced>

      <instancedMesh
        ref={targets}
        args={[undefined, undefined, MAX_TARGETS]}
        material={targetMaterial}
      >
        <sphereGeometry args={[0.1, 16, 12]} />
      </instancedMesh>

      <group ref={crosshair}>
        <mesh material={crosshairMaterial}>
          <boxGeometry args={[0.22, 0.012, 0.012]} />
        </mesh>
        <mesh material={crosshairMaterial}>
          <boxGeometry args={[0.012, 0.22, 0.012]} />
        </mesh>
        <mesh material={crosshairMaterial}>
          <torusGeometry args={[0.16, 0.006, 8, 28]} />
        </mesh>
      </group>
    </group>
  )
}
