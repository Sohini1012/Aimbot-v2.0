import { useRef, useMemo, useLayoutEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useSafeFrame } from '@/scene/useSafeFrame'
import { Vector3, type Group, type Object3D } from 'three'
import { EXPLODE, partProgress, backOut, scatterOffset } from '@/scene/explodeMap'
import { scrollState } from '@/scene/scrollState'
import type { PartId } from '@/content/types'

export const GLB_URL = '/models/aimbot.glb'

/**
 * GLB node name → the part the explode map knows about.
 *
 * The furniture that has no PartId of its own rides with the part it is bolted
 * to, so the exploded view does not leave a trigger and a rail hanging in
 * mid-air while everything around them separates.
 */
const NODE_TO_PART: Record<string, PartId> = {
  shell_left: 'shell_left',
  shell_right: 'shell_right',
  slide: 'shell_left',
  rail: 'shell_left',
  trigger: 'shell_right',
  foregrip: 'shell_right',
  barrel: 'barrel',
  muzzle: 'barrel',
  sight: 'barrel',
  stock: 'stock',
  mag: 'mag',
  pico: 'pico',
  imu: 'imu',
  omron: 'omron',
  buttons: 'buttons',
  pot: 'pot',
  joystick: 'joystick',
  pcb: 'pcb',
  usb: 'usb',
  wires: 'wires',
}

interface Tracked {
  node: Object3D
  part: PartId
  /** Where the node sits in the GLB, which is its assembled position. */
  base: Vector3
}

function explodeAmount(): number {
  const { beat, beatProgress } = scrollState
  if (beat < 3) return 0
  if (beat === 3) return Math.min(1, beatProgress / 0.68)
  if (beat === 4 || beat === 5) return 1
  if (beat === 6) return 1 - Math.min(1, beatProgress / 0.72)
  return 0
}

function scatterAmount(): number {
  const { beat, beatProgress } = scrollState
  if (beat === 0) return 1
  if (beat === 1) return 1 - backOut(Math.min(1, beatProgress / 0.75))
  return 0
}

const tmp = new Vector3()

/**
 * The Blender-built blaster.
 *
 * Part transforms are driven exactly as in the procedural path — the same
 * explode map, the same beat maths — so the two models are interchangeable and
 * the timeline does not care which one is mounted.
 *
 * Base positions are read off the GLB rather than from the placement table:
 * the modelled positions are the authority once the model exists, and keeping
 * a second copy of them in TypeScript is how the two quietly drift apart.
 */
export function BlasterGLB({ simplified = false }: { simplified?: boolean }) {
  const { scene } = useGLTF(GLB_URL)
  const root = useRef<Group>(null)

  const model = useMemo(() => scene.clone(true), [scene])

  const tracked = useMemo<Tracked[]>(() => {
    const out: Tracked[] = []
    model.traverse((node) => {
      const part = NODE_TO_PART[node.name]
      if (part) out.push({ node, part, base: node.position.clone() })
    })
    return out
  }, [model])

  useLayoutEffect(() => {
    model.traverse((node) => {
      node.castShadow = !simplified
      node.receiveShadow = !simplified
    })
  }, [model, simplified])

  useSafeFrame('blaster-glb', () => {
    const amount = explodeAmount()
    const scatter = scatterAmount()

    for (const { node, part, base } of tracked) {
      const spec = EXPLODE[part]
      const t = partProgress(amount, spec.delay)
      tmp.set(spec.offset[0], spec.offset[1], spec.offset[2]).multiplyScalar(t)

      if (scatter > 0) {
        const s = scatterOffset(part)
        const local = Math.min(1, Math.max(0, scatter * (1 + spec.delay)))
        tmp.x += s[0] * local
        tmp.y += s[1] * local
        tmp.z += s[2] * local
      }

      node.position.set(base.x + tmp.x, base.y + tmp.y, base.z + tmp.z)
    }
  })

  return (
    <group ref={root}>
      <primitive object={model} />
    </group>
  )
}

useGLTF.preload(GLB_URL)
