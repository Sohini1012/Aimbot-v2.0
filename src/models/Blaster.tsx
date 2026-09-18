import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Center } from '@react-three/drei'
import { Vector3, type Group } from 'three'
import { ShellHalf, Trigger } from './Shell'
import { Barrel } from './Barrel'
import { Stock } from './Stock'
import { Mag } from './Mag'
import { Internals, type InternalRefs } from './Internals'
import { placementOf } from './placement'
import { EXPLODE, partProgress } from '@/scene/explodeMap'
import { scrollState } from '@/scene/scrollState'
import type { PartId } from '@/content/types'

/**
 * §8 beats 3 and 6.
 *
 * Deviation from the spec worth naming: the spec asks for one GSAP timeline
 * tweening the parts directly. Tweening object3d transforms with GSAP while
 * useFrame also writes to them means two systems fighting over the same
 * matrices, and the loser is whichever ran second that frame. Instead
 * ScrollTrigger (still scrub: 1, still one timeline) drives a single progress
 * value, and this rig derives every transform from it each frame.
 *
 * The practical win is that reversal is free: scrolling up is just progress
 * decreasing, so beat 6 is beat 3 read backwards by construction rather than
 * by a second hand-authored timeline that has to be kept in sync.
 */

/** Explode amount at the current scroll position, 0–1. */
function explodeAmount(): number {
  const { beat, beatProgress } = scrollState
  if (beat < 3) return 0
  if (beat === 3) return beatProgress
  if (beat === 4 || beat === 5) return 1
  if (beat === 6) return 1 - beatProgress
  return 0
}

const tmp = new Vector3()

export function Blaster() {
  const shellLeft = useRef<Group>(null)
  const shellRight = useRef<Group>(null)
  const barrel = useRef<Group>(null)
  const stock = useRef<Group>(null)
  const mag = useRef<Group>(null)

  const internals: InternalRefs = {
    pico: useRef<Group>(null),
    imu: useRef<Group>(null),
    omron: useRef<Group>(null),
    buttons: useRef<Group>(null),
    pot: useRef<Group>(null),
    joystick: useRef<Group>(null),
    pcb: useRef<Group>(null),
    wires: useRef<Group>(null),
    usb: useRef<Group>(null),
  }

  useFrame(() => {
    const amount = explodeAmount()

    const apply = (
      ref: { current: Group | null },
      id: PartId,
      base: readonly [number, number, number],
    ) => {
      const g = ref.current
      if (!g) return
      const spec = EXPLODE[id]
      const t = partProgress(amount, spec.delay)
      tmp.set(spec.offset[0], spec.offset[1], spec.offset[2]).multiplyScalar(t)
      g.position.set(base[0] + tmp.x, base[1] + tmp.y, base[2] + tmp.z)
      if (spec.spin) {
        g.rotation.set(spec.spin[0] * t, spec.spin[1] * t, spec.spin[2] * t)
      }
    }

    apply(shellLeft, 'shell_left', [0, 0, 0])
    apply(shellRight, 'shell_right', [0, 0, 0])
    apply(barrel, 'barrel', [0, 0, 0])
    apply(stock, 'stock', [0, 0, 0])
    apply(mag, 'mag', [0, 0, 0])

    for (const id of ['pico', 'imu', 'omron', 'buttons', 'pot', 'joystick', 'pcb', 'usb'] as const) {
      apply(internals[id], id, placementOf(id).position)
    }
    apply(internals.wires, 'wires', [0, 0, 0])
  })

  return (
    <Center>
      <group ref={shellLeft}>
        <ShellHalf side={1} />
      </group>
      <group ref={shellRight}>
        <ShellHalf side={-1} />
      </group>

      <Trigger />

      <group ref={barrel}>
        <Barrel />
      </group>
      <group ref={stock}>
        <Stock />
      </group>
      <group ref={mag}>
        <Mag />
      </group>

      <Internals refs={internals} />
    </Center>
  )
}
