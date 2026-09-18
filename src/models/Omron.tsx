import { DIM, mm } from './scale'
import { metalMaterial, blackPlasticMaterial } from './materials'
import { MeshStandardMaterial, Color } from 'three'

const omronBody = new MeshStandardMaterial({
  color: new Color('#f6f5f2'),
  roughness: 0.55,
  metalness: 0,
})

/**
 * Omron D2FC micro-switch, harvested from a dead Logitech mouse. White body,
 * black base, sprung metal lever, three pins out the bottom.
 *
 * This is the part with the story on it, so it gets the lever geometry rather
 * than a stand-in box — it is the one component a visitor will look at closely.
 */
export function Omron() {
  const { l, w, h } = DIM.omron

  return (
    <group>
      <mesh castShadow receiveShadow material={omronBody}>
        <boxGeometry args={[l, h, w]} />
      </mesh>

      {/* black base */}
      <mesh position={[0, -h / 2 + mm(1), 0]} material={blackPlasticMaterial}>
        <boxGeometry args={[l * 1.02, mm(2), w * 1.02]} />
      </mesh>

      {/* the actuator button on top */}
      <mesh position={[mm(2.4), h / 2 + mm(0.6), 0]} material={blackPlasticMaterial} castShadow>
        <boxGeometry args={[mm(3.2), mm(1.6), mm(3.2)]} />
      </mesh>

      {/* sprung metal lever */}
      <mesh
        position={[mm(1.2), h / 2 + mm(1.8), 0]}
        rotation={[0, 0, -0.12]}
        material={metalMaterial}
        castShadow
      >
        <boxGeometry args={[l * 0.86, mm(0.35), w * 0.6]} />
      </mesh>

      {/* three pins */}
      {[-mm(4), 0, mm(4)].map((x) => (
        <mesh key={x} position={[x, -h / 2 - mm(2), 0]} material={metalMaterial}>
          <boxGeometry args={[mm(0.8), mm(4), mm(0.5)]} />
        </mesh>
      ))}
    </group>
  )
}
