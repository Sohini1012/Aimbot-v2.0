import { useMemo } from 'react'
import { DIM, mm } from './scale'
import { metalMaterial, blackPlasticMaterial } from './materials'
import { Instanced, type InstanceSpec } from './Instanced'
import { MeshStandardMaterial, Color } from 'three'

const moduleBoard = new MeshStandardMaterial({
  color: new Color('#1a3a6b'),
  roughness: 0.68,
  metalness: 0.1,
})

/** KY-023 analog thumb joystick — movement axis, so the device is usable
 *  one-handed. Black cap on a blue module board, five pins. */
export function Joystick() {
  const { l, w, t, capR } = DIM.joystick

  const pins = useMemo<InstanceSpec[]>(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        position: [(i - 2) * mm(2.54), -mm(3), -w / 2 + mm(2)] as const,
      })),
    [w],
  )

  return (
    <group>
      <mesh castShadow receiveShadow material={moduleBoard}>
        <boxGeometry args={[l, t, w]} />
      </mesh>

      {/* gimbal housing */}
      <mesh position={[0, mm(6), 0]} material={blackPlasticMaterial} castShadow>
        <boxGeometry args={[mm(22), mm(11), mm(22)]} />
      </mesh>

      {/* stick */}
      <mesh position={[0, mm(13), 0]} material={blackPlasticMaterial} castShadow>
        <cylinderGeometry args={[mm(3), mm(3.4), mm(6), 12]} />
      </mesh>

      {/* thumb cap — concave top */}
      <mesh position={[0, mm(17), 0]} material={blackPlasticMaterial} castShadow>
        <cylinderGeometry args={[capR, capR * 0.72, mm(5), 20]} />
      </mesh>

      {/* five pins */}
      <Instanced instances={pins} material={metalMaterial}>
        <boxGeometry args={[mm(0.65), mm(6), mm(0.65)]} />
      </Instanced>
    </group>
  )
}
