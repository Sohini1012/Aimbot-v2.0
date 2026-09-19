import { useMemo, forwardRef } from 'react'
import { ExtrudeGeometry, type Group } from 'three'
import {
  BODY_OUTLINE,
  SLIDE_OUTLINE,
  buildShape,
  HALF_DEPTH,
  BEVEL,
  RAIL,
} from './profiles'
import { shellMaterial, shellAccentMaterial, shellTrimMaterial, metalMaterial } from './materials'
import { Instanced, type InstanceSpec } from './Instanced'
import { mm } from './scale'

/**
 * One half of the Retaliator clamshell. The real blaster is two moulded halves
 * screwed together, which is both accurate and exactly what beat 3 needs: the
 * halves split laterally and the cavity is revealed between them.
 *
 * `side` is +1 for the left half (+Z) and -1 for the right (-Z).
 */
export const ShellHalf = forwardRef<Group, { side: 1 | -1 }>(function ShellHalf({ side }, ref) {
  const bodyGeo = useMemo(
    () => new ExtrudeGeometry(buildShape(BODY_OUTLINE), { depth: HALF_DEPTH, ...BEVEL }),
    [],
  )

  const slideGeo = useMemo(
    () => new ExtrudeGeometry(buildShape(SLIDE_OUTLINE), { depth: HALF_DEPTH * 0.86, ...BEVEL }),
    [],
  )

  // Rail teeth sit on the slide, which is where the Retaliator actually
  // carries its single tactical rail.
  const railTeeth = useMemo<InstanceSpec[]>(() => {
    const out: InstanceSpec[] = []
    for (let i = 0; i < RAIL.teeth; i++) {
      const t = i / (RAIL.teeth - 1)
      out.push({ position: [RAIL.from + t * (RAIL.to - RAIL.from), 0.44, HALF_DEPTH * 0.43] })
    }
    return out
  }, [])

  return (
    <group ref={ref} scale={[1, 1, side]}>
      <mesh geometry={bodyGeo} material={shellMaterial} castShadow receiveShadow />
      <mesh geometry={slideGeo} material={shellAccentMaterial} position={[0, 0, 0.002]} castShadow />
      <Instanced instances={railTeeth} material={shellAccentMaterial}>
        <boxGeometry args={[RAIL.toothWidth, RAIL.height, RAIL.width]} />
      </Instanced>
      {/* clip release, just in front of the trigger and behind the magwell */}
      <mesh position={[0.02, -0.24, HALF_DEPTH * 0.9]} material={shellTrimMaterial}>
        <boxGeometry args={[mm(10), mm(14), mm(4)]} />
      </mesh>
      {/* jet-style body vents, a Retaliator styling cue */}
      <mesh position={[0.72, 0.04, HALF_DEPTH * 0.92]} material={metalMaterial}>
        <boxGeometry args={[0.24, 0.06, mm(2)]} />
      </mesh>
    </group>
  )
})

/** Trigger — orange trim, inside the guard. */
export function Trigger() {
  return (
    <mesh position={[-0.24, -0.32, 0]} castShadow material={shellTrimMaterial}>
      <boxGeometry args={[0.06, 0.2, 0.11]} />
    </mesh>
  )
}

/** Foregrip — the references are explicit that it is "just a stylised
 *  cylinder", so it is one rather than the angled wedge modelled before. */
export function Foregrip() {
  return (
    <group position={[0.84, -0.46, 0]} rotation={[0, 0, 0.08]}>
      <mesh material={shellTrimMaterial} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.115, 0.56, 20]} />
      </mesh>
      <mesh position={[0, 0.3, 0]} material={shellAccentMaterial}>
        <cylinderGeometry args={[0.055, 0.055, 0.1, 14]} />
      </mesh>
      <mesh position={[0, -0.3, 0]} material={shellAccentMaterial}>
        <cylinderGeometry args={[0.115, 0.1, 0.05, 20]} />
      </mesh>
    </group>
  )
}
