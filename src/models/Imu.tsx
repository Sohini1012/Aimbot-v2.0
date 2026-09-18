import { useMemo } from 'react'
import { DIM, mm } from './scale'
import { breakoutMaterial, metalMaterial, blackPlasticMaterial } from './materials'
import { Instanced, type InstanceSpec } from './Instanced'

/**
 * MPU-9250 breakout — purple board, single-row header down one long edge,
 * QFN die visible on top. Board size is a derived figure (breakouts vary by
 * manufacturer); the 3 × 3 mm die is the confirmed one.
 */
export function Imu() {
  const { l, w, t } = DIM.imu

  const pins = useMemo<InstanceSpec[]>(() => {
    const n = 9
    const pitch = mm(2.54)
    return Array.from({ length: n }, (_, i) => ({
      position: [(i - (n - 1) / 2) * pitch, mm(1.5), -w / 2 + mm(1.3)] as const,
    }))
  }, [w])

  return (
    <group>
      <mesh castShadow receiveShadow material={breakoutMaterial}>
        <boxGeometry args={[l, t, w]} />
      </mesh>

      {/* the sensor die */}
      <mesh position={[0, t, 0]} material={blackPlasticMaterial} castShadow>
        <boxGeometry args={[DIM.imuDie.s, DIM.imuDie.t, DIM.imuDie.s]} />
      </mesh>

      {/* header along one long edge */}
      <Instanced instances={pins} material={metalMaterial}>
        <boxGeometry args={[mm(0.65), mm(6), mm(0.65)]} />
      </Instanced>
    </group>
  )
}
