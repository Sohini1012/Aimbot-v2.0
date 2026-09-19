import {useThree} from '@react-three/fiber'

import { Vector3 } from 'three'
import { scrollState } from './scrollState'
import { EXPLODE } from './explodeMap'
import { placementOf } from '@/models/placement'
import { HARDWARE } from '@/content/hardware'
import { WALK_ORDER } from '@/content/hardware'
import { labelStore, type ProjectedLabel } from './labelStore'
import type { PartId } from '@/content/types'
import { useSafeFrame } from '@/scene/useSafeFrame'

const SCENE_SCALE = 0.78
const world = new Vector3()

/** Parts that get a label in the exploded view — every modelled part. */
const LABELLED: readonly PartId[] = [
  'pico',
  'imu',
  'omron',
  'buttons',
  'pot',
  'joystick',
  'pcb',
  'wires',
  'usb',
]

/**
 * Projects each part's exploded position into panel coordinates every frame.
 *
 * The labels are drawn as an SVG overlay rather than as drei <Html>: text in
 * an SVG stays crisp at any DPR, leader lines are trivial, and nine DOM
 * elements being transformed independently every frame is exactly the kind of
 * layout thrash the frame budget cannot absorb.
 */
export function LabelProjector() {
  const { camera, size } = useThree()

  useSafeFrame('labels', () => {
    // labels belong to the exploded beats only
    const beat = scrollState.beat
    const showing = beat >= 3 && beat <= 6
    if (!showing) {
      if (labelStore.items.length) labelStore.items = []
      return
    }

    // fade in across the explode, out across the reassemble
    let globalOpacity = 1
    if (beat === 3) globalOpacity = Math.max(0, (scrollState.beatProgress - 0.45) / 0.35)
    if (beat === 6) globalOpacity = 1 - Math.min(1, scrollState.beatProgress / 0.4)

    const activeId = beat === 4 && scrollState.walkIndex >= 0 ? WALK_ORDER[scrollState.walkIndex] : undefined

    const items: ProjectedLabel[] = []

    LABELLED.forEach((id, index) => {
      const part = HARDWARE.find((h) => h.id === id)
      if (!part) return

      const place = placementOf(id).position
      const spec = EXPLODE[id]
      world.set(
        (place[0] + spec.offset[0]) * SCENE_SCALE,
        (place[1] + spec.offset[1]) * SCENE_SCALE,
        (place[2] + spec.offset[2]) * SCENE_SCALE,
      )
      world.project(camera)

      const ax = (world.x + 1) / 2
      const ay = (1 - world.y) / 2

      // behind the camera, or off panel — skip rather than draw a label
      // pinned to an edge with a line going nowhere
      if (world.z > 1 || ax < -0.2 || ax > 1.2 || ay < -0.2 || ay > 1.2) return

      // Labels are pushed to whichever side the part sits on and stacked in a
      // column, so leader lines fan out instead of crossing each other.
      const leftSide = ax < 0.5
      const column = leftSide ? 0.08 : 0.92
      const slot = index / Math.max(1, LABELLED.length - 1)
      const ly = 0.12 + slot * 0.74

      const isActive = id === activeId
      items.push({
        id,
        short: part.short,
        name: part.name,
        ax,
        ay,
        lx: column,
        ly,
        // during the walk, the inactive labels dim rather than vanish
        opacity: globalOpacity * (beat === 4 && !isActive ? 0.28 : 1),
        active: isActive,
      })
    })

    labelStore.items = items
    void size
  })

  return null
}
