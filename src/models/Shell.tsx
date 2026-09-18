import { useMemo, forwardRef } from 'react'
import { ExtrudeGeometry, type Group } from 'three'
import {
  BODY_OUTLINE,
  SLIDE_OUTLINE,
  FOREGRIP_OUTLINE,
  buildShape,
  HALF_DEPTH,
  BEVEL,
} from './profiles'
import { shellMaterial, shellAccentMaterial, shellTrimMaterial } from './materials'

/**
 * One half of the Retaliator shell. The blaster is a clamshell in real life —
 * two moulded halves screwed together — so modelling it that way is both
 * accurate and exactly what beat 3 needs: the halves split laterally and the
 * internals are revealed in the cavity between them.
 *
 * `side` is -1 for the right half (-Z) and +1 for the left (+Z).
 */
interface HalfProps {
  side: 1 | -1
}

export const ShellHalf = forwardRef<Group, HalfProps>(function ShellHalf({ side }, ref) {
  const bodyGeo = useMemo(
    () =>
      new ExtrudeGeometry(buildShape(BODY_OUTLINE), {
        depth: HALF_DEPTH,
        ...BEVEL,
      }),
    [],
  )

  const slideGeo = useMemo(
    () =>
      new ExtrudeGeometry(buildShape(SLIDE_OUTLINE), {
        depth: HALF_DEPTH * 0.82,
        ...BEVEL,
      }),
    [],
  )

  const foregripGeo = useMemo(
    () =>
      new ExtrudeGeometry(buildShape(FOREGRIP_OUTLINE), {
        depth: HALF_DEPTH * 0.72,
        ...BEVEL,
      }),
    [],
  )

  // Each half is extruded from z=0 outward, then mirrored into place, so the
  // parting line always sits exactly on z=0 however the depth changes.
  return (
    <group ref={ref} scale={[1, 1, side]}>
      <mesh geometry={bodyGeo} material={shellMaterial} castShadow receiveShadow />
      <mesh
        geometry={slideGeo}
        material={shellAccentMaterial}
        position={[0, 0, 0.001]}
        castShadow
      />
      <mesh
        geometry={foregripGeo}
        material={shellTrimMaterial}
        position={[0, 0, HALF_DEPTH * 0.14]}
        castShadow
      />
    </group>
  )
})

/** The trigger — orange trim, sits inside the guard. */
export function Trigger() {
  return (
    <mesh position={[-0.3, -0.34, 0]} castShadow material={shellTrimMaterial}>
      <boxGeometry args={[0.07, 0.22, 0.12]} />
    </mesh>
  )
}
