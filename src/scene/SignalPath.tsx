import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  CatmullRomCurve3,
  Vector3,
  MeshBasicMaterial,
  Color,
  type InstancedMesh,
  Object3D,
} from 'three'
import { scrollState } from './scrollState'
import { EXPLODE } from './explodeMap'
import { placementOf } from '@/models/placement'
import type { PartId } from '@/content/types'

const SCENE_SCALE = 0.78
const PULSES = 7

const pulseMaterial = new MeshBasicMaterial({
  color: new Color('#f5a623'),
  transparent: true,
  opacity: 0,
})

/** Exploded world position of a part, which is where the signal has to route
 *  through while everything is apart. */
function explodedPosition(id: PartId): Vector3 {
  const place = placementOf(id).position
  const spec = EXPLODE[id]
  return new Vector3(
    (place[0] + spec.offset[0]) * SCENE_SCALE,
    (place[1] + spec.offset[1]) * SCENE_SCALE,
    (place[2] + spec.offset[2]) * SCENE_SCALE,
  )
}

/**
 * §8 beat 5 — an amber trace travelling the signal path: IMU → Pico →
 * filter stages → USB out.
 *
 * The pulses are one instanced mesh moving along a single curve, so the whole
 * effect is one draw call. They are spaced evenly in curve parameter and all
 * advance together, which reads as flow rather than as separate dots.
 */
export function SignalPath() {
  const ref = useRef<InstancedMesh>(null)

  const curve = useMemo(() => {
    const imu = explodedPosition('imu')
    const pico = explodedPosition('pico')
    const usb = explodedPosition('usb')

    // bow the mid-sections out so the path is legible against the parts
    const midA = imu.clone().lerp(pico, 0.5).add(new Vector3(0, 0.22, 0.2))
    const midB = pico.clone().lerp(usb, 0.5).add(new Vector3(-0.15, 0.1, 0.25))

    return new CatmullRomCurve3([imu, midA, pico, midB, usb], false, 'catmullrom', 0.5)
  }, [])

  useFrame((_, delta) => {
    const mesh = ref.current
    if (!mesh) return

    const active = scrollState.beat === 5
    const wanted = active ? 0.95 : 0
    pulseMaterial.opacity += (wanted - pulseMaterial.opacity) * (1 - Math.pow(0.01, delta))

    if (pulseMaterial.opacity < 0.01) {
      mesh.visible = false
      return
    }
    mesh.visible = true

    const dummy = new Object3D()
    // one full traverse per two seconds of wall clock
    const head = (performance.now() / 2000) % 1

    for (let i = 0; i < PULSES; i++) {
      const t = (head + i / PULSES) % 1
      const point = curve.getPointAt(t)
      dummy.position.copy(point)
      // taper the tail so the leading pulse is brightest
      const lead = 1 - i / PULSES
      dummy.scale.setScalar(0.028 + lead * 0.03)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, PULSES]}
      material={pulseMaterial}
      visible={false}
    >
      <sphereGeometry args={[1, 10, 8]} />
    </instancedMesh>
  )
}
