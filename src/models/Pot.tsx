import { useMemo } from 'react'
import { DIM, mm } from './scale'
import { metalMaterial, blackPlasticMaterial } from './materials'
import { Instanced, type InstanceSpec } from './Instanced'
import { MeshStandardMaterial, Color } from 'three'

const potBody = new MeshStandardMaterial({
  color: new Color('#2f4f8f'),
  roughness: 0.45,
  metalness: 0.3,
})

/**
 * 10k rotary potentiometer — the accessibility knob. Blue body, knurled shaft,
 * three pins. Recessed in the foregrip so it is thumb-reachable mid-game.
 *
 * The knurling is 16 thin boxes around the shaft; at the distance beat 4 flies
 * to, a smooth cylinder reads as a plastic peg and loses the "you can grip this
 * and turn it" affordance that the part is entirely about.
 */
export function Pot() {
  const { body, shaft, shaftLen } = DIM.pot

  const knurls = useMemo<InstanceSpec[]>(() => {
    const n = 16
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2
      return {
        position: [Math.cos(a) * (shaft / 2), mm(6) + shaftLen / 2, Math.sin(a) * (shaft / 2)] as const,
        rotation: [0, -a, 0] as const,
      }
    })
  }, [shaft, shaftLen])

  const pins = useMemo<InstanceSpec[]>(
    () => [-mm(2.5), 0, mm(2.5)].map((x) => ({ position: [x, -mm(6), 0] as const })),
    [],
  )

  return (
    <group>
      <mesh castShadow receiveShadow material={potBody}>
        <cylinderGeometry args={[body / 2, body / 2, mm(7), 20]} />
      </mesh>

      {/* threaded collar */}
      <mesh position={[0, mm(4.5), 0]} material={metalMaterial}>
        <cylinderGeometry args={[mm(3.5), mm(3.5), mm(3), 18]} />
      </mesh>

      {/* shaft */}
      <mesh position={[0, mm(6) + shaftLen / 2, 0]} material={metalMaterial} castShadow>
        <cylinderGeometry args={[shaft / 2, shaft / 2, shaftLen, 18]} />
      </mesh>

      <Instanced instances={knurls} material={metalMaterial}>
        <boxGeometry args={[mm(0.5), shaftLen * 0.8, mm(0.5)]} />
      </Instanced>

      {/* three pins out the back */}
      <Instanced instances={pins} material={metalMaterial}>
        <boxGeometry args={[mm(0.8), mm(6), mm(0.4)]} />
      </Instanced>

      <mesh position={[0, -mm(3.6), 0]} material={blackPlasticMaterial}>
        <cylinderGeometry args={[body / 2.2, body / 2.2, mm(1.4), 16]} />
      </mesh>
    </group>
  )
}
