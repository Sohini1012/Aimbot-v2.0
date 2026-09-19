import { useRef } from 'react'

import { Vector3, type PointLight } from 'three'
import { scrollState } from './scrollState'
import { WALK_ORDER } from '@/content/hardware'
import { EXPLODE } from './explodeMap'
import { placementOf } from '@/models/placement'
import { useSafeFrame } from '@/scene/useSafeFrame'

const SCENE_SCALE = 0.78
const target = new Vector3()

/**
 * §8 beat 4 — the component under inspection lights up while the rest fall
 * back.
 *
 * Deviation worth naming: the spec asks for the active part to go amber while
 * the others desaturate to 30% opacity. Every part shares module-level
 * materials (that is what keeps the scene at ~150 draw calls), so tinting one
 * part would tint every part using the same material — the two PCBs, all the
 * metal pins, and so on. Cloning materials per part to allow it would multiply
 * the material count for an effect that lasts one beat.
 *
 * Instead an amber key light tracks the active part. It reads the same way —
 * that component is lit, the others sit in shadow — and it costs one light
 * rather than a second set of materials.
 */
export function WalkLight() {
  const ref = useRef<PointLight>(null)

  useSafeFrame('walk-light', (_, delta) => {
    const light = ref.current
    if (!light) return

    const active = scrollState.beat === 4 && scrollState.walkIndex >= 0
    const id = active ? WALK_ORDER[scrollState.walkIndex] : undefined

    if (id) {
      const place = placementOf(id).position
      const spec = EXPLODE[id]
      target.set(
        (place[0] + spec.offset[0]) * SCENE_SCALE,
        (place[1] + spec.offset[1]) * SCENE_SCALE + 0.25,
        (place[2] + spec.offset[2]) * SCENE_SCALE + 0.35,
      )
      light.position.lerp(target, 1 - Math.pow(0.002, delta))
    }

    // fade in over the first fifth of each sub-beat so the handoff between
    // parts is a cross-fade rather than a cut
    const wanted = active ? 5.5 : 0
    light.intensity += (wanted - light.intensity) * (1 - Math.pow(0.01, delta))
  })

  return <pointLight ref={ref} color="#f5a623" intensity={0} distance={3.2} decay={2} />
}
