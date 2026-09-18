import { useMemo } from 'react'
import { LatheGeometry, Vector2 } from 'three'
import { shellMaterial, shellTrimMaterial } from './materials'

/**
 * Barrel extension — twist-locks onto the muzzle (docs/REFERENCES.md).
 * Lathed rather than extruded because it is a body of revolution, which also
 * makes it the cheapest part in the scene: one profile, 24 segments.
 */
export function Barrel() {
  const geo = useMemo(() => {
    const profile = [
      new Vector2(0.0, 0.0),
      new Vector2(0.15, 0.0),
      new Vector2(0.16, 0.06),
      new Vector2(0.14, 0.1),
      new Vector2(0.14, 0.62),
      new Vector2(0.17, 0.66),
      new Vector2(0.17, 0.74),
      new Vector2(0.12, 0.76),
      new Vector2(0.0, 0.76),
    ]
    return new LatheGeometry(profile, 28)
  }, [])

  return (
    <group position={[1.56, 0.02, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <mesh geometry={geo} material={shellMaterial} castShadow receiveShadow />
      {/* orange muzzle trim */}
      <mesh position={[0, 0.78, 0]} material={shellTrimMaterial} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.06, 24]} />
      </mesh>
    </group>
  )
}
