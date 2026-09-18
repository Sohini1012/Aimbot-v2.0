import { shellAccentMaterial, shellTrimMaterial } from './materials'

/** 12-dart quick-reload clip, seated in the magazine well. */
export function Mag() {
  return (
    <group position={[0.27, -0.62, 0]} rotation={[0, 0, -0.06]}>
      <mesh material={shellAccentMaterial} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.62, 0.34]} />
      </mesh>
      {/* the follower window down the side */}
      <mesh position={[0, 0.02, 0.175]} material={shellTrimMaterial}>
        <boxGeometry args={[0.06, 0.46, 0.01]} />
      </mesh>
    </group>
  )
}
