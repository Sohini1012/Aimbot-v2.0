import { useMemo } from 'react'
import { LatheGeometry, Vector2 } from 'three'
import { shellMaterial, shellTrimMaterial, shellAccentMaterial } from './materials'
import { Instanced, type InstanceSpec } from './Instanced'

/**
 * Barrel extension — twist-locks to the muzzle, and unlike the bare blaster it
 * carries two tactical rails (top and bottom) plus a flip-up iron sight.
 */
export function Barrel() {
  const geo = useMemo(() => {
    const profile = [
      new Vector2(0.0, 0.0),
      new Vector2(0.13, 0.0),
      new Vector2(0.14, 0.05),
      new Vector2(0.12, 0.09),
      new Vector2(0.12, 0.54),
      new Vector2(0.15, 0.58),
      new Vector2(0.15, 0.64),
      new Vector2(0.1, 0.66),
      new Vector2(0.0, 0.66),
    ]
    return new LatheGeometry(profile, 26)
  }, [])

  const rails = useMemo<InstanceSpec[]>(() => {
    const out: InstanceSpec[] = []
    for (let i = 0; i < 7; i++) {
      const y = 0.12 + (i / 6) * 0.38
      out.push({ position: [0, y, 0.12] })
      out.push({ position: [0, y, -0.12] })
    }
    return out
  }, [])

  return (
    <group position={[1.32, 0.0, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <mesh geometry={geo} material={shellMaterial} castShadow receiveShadow />
      <Instanced instances={rails} material={shellAccentMaterial}>
        <boxGeometry args={[0.038, 0.03, 0.09]} />
      </Instanced>
      {/* flip-up iron sight */}
      <mesh position={[0, 0.5, 0.15]} rotation={[0.25, 0, 0]} material={shellAccentMaterial} castShadow>
        <boxGeometry args={[0.07, 0.13, 0.02]} />
      </mesh>
      {/* orange muzzle trim */}
      <mesh position={[0, 0.68, 0]} material={shellTrimMaterial} castShadow>
        <cylinderGeometry args={[0.115, 0.115, 0.055, 22]} />
      </mesh>
    </group>
  )
}
