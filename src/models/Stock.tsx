import { useMemo } from 'react'
import { ExtrudeGeometry } from 'three'
import { STOCK_OUTLINE, buildShape, EXTRUDE_DEPTH, BEVEL } from './profiles'
import { shellMaterial } from './materials'

/** Detachable stock — skeletal, with the cut-out traced into the outline. */
export function Stock() {
  const geo = useMemo(
    () =>
      new ExtrudeGeometry(buildShape(STOCK_OUTLINE), {
        depth: EXTRUDE_DEPTH * 0.72,
        ...BEVEL,
      }),
    [],
  )

  return (
    <mesh
      geometry={geo}
      material={shellMaterial}
      position={[0, 0, -EXTRUDE_DEPTH * 0.36]}
      castShadow
      receiveShadow
    />
  )
}
