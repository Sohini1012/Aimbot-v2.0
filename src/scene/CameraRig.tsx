import { useRef } from 'react'
import {useThree} from '@react-three/fiber'

import { Vector3 } from 'three'
import { scrollState } from './scrollState'
import { WALK_ORDER } from '@/content/hardware'
import { EXPLODE } from './explodeMap'
import { placementOf } from '@/models/placement'
import { useSafeFrame } from '@/scene/useSafeFrame'

/**
 * §8 — the camera per beat.
 *
 * Positions are damped toward a target rather than set outright, which is what
 * gives the camera weight: a scrub that jumps looks like a slideshow, and the
 * brief lag as it catches up is most of the "cinematic" feel the spec is after.
 *
 * Beat 4 flies to each component in turn. The target is derived from the part's
 * placement plus its explode offset, so the camera follows whatever the explode
 * map says rather than needing its own hand-tuned waypoint per part.
 */

const SCENE_SCALE = 0.78
const target = new Vector3()
const lookTarget = new Vector3()
const currentLook = new Vector3()

export function CameraRig({ reduced, simplified = false }: { reduced: boolean; simplified?: boolean }) {
  const { camera } = useThree()
  const initialised = useRef(false)

  useSafeFrame('camera', (_, delta) => {
    const { beat, beatProgress, walkIndex } = scrollState

    // defaults: the 3/4 hero framing
    let px = 0
    let py = 0.6
    let pz = 5.5
    let lx = 0
    let ly = 0
    let lz = 0

    if (beat <= 1) {
      // push in from 3/4 rear to 3/4 front across the materialise
      const t = beat === 0 ? 0 : beatProgress
      px = -2.2 + t * 2.2
      py = 1.1 - t * 0.5
      pz = 4.2 + t * 1.3
    } else if (beat === 2) {
      pz = 5.2
      py = 0.5
    } else if (beat === 3) {
      // pull back and rotate as everything separates
      pz = 5.2 + beatProgress * 2.4
      py = 0.5 + beatProgress * 0.9
      px = beatProgress * 1.6
    } else if (beat === 4) {
      // §11 — the simplified path holds one framed shot of the exploded view
      // instead of flying between components. The flights are the most
      // expensive thing the camera does and they read poorly at phone width,
      // where the part being inspected is a handful of pixels.
      const id = simplified ? undefined : WALK_ORDER[Math.max(0, walkIndex)]
      if (simplified) {
        px = 1.4
        py = 1.2
        pz = 7.0
      } else if (id) {
        const place = placementOf(id).position
        const spec = EXPLODE[id]
        lx = (place[0] + spec.offset[0]) * SCENE_SCALE
        ly = (place[1] + spec.offset[1]) * SCENE_SCALE - 0.1
        lz = (place[2] + spec.offset[2]) * SCENE_SCALE

        // sit off to one side of the part so the card beside it is not covered
        px = lx + 0.9
        py = ly + 0.45
        pz = lz + 1.5
      }
    } else if (beat === 5) {
      // hold wide for the signal path
      px = 1.2
      py = 1.2
      pz = 7.2
    } else if (beat === 6) {
      // converge back to the orbit framing as it reassembles
      const t = 1 - beatProgress
      pz = 5.2 + t * 2.4
      py = 0.5 + t * 0.9
      px = t * 1.6
    } else if (beat === 7) {
      // travel along the barrel and dive through the muzzle
      const t = beatProgress
      px = 1.4 + t * 1.4
      py = 0.15
      pz = 2.6 - t * 2.6
      lx = 3
    } else {
      // the arena
      px = 0
      py = 0
      pz = 5.0
    }

    target.set(px, py, pz)
    lookTarget.set(lx, ly, lz)

    if (reduced || !initialised.current) {
      // reduced motion lands on the beat's end state with no travel
      camera.position.copy(target)
      currentLook.copy(lookTarget)
      initialised.current = true
    } else {
      // Frame-rate independent damping. The base is deliberately high: a
      // faster approach snaps to each waypoint and reads as cutting between
      // shots, where this glides and the moves feel continuous.
      const k = 1 - Math.pow(0.018, delta)
      camera.position.lerp(target, k)
      currentLook.lerp(lookTarget, k)
    }

    camera.lookAt(currentLook)
  })

  return null
}
