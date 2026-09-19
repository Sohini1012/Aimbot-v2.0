import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  ExtrudeGeometry,
  EdgesGeometry,
  LineBasicMaterial,
  Object3D,
  MeshBasicMaterial,
  Color,
  type LineSegments,
  type InstancedMesh,
} from 'three'
import { BODY_OUTLINE, SLIDE_OUTLINE, buildShape, HALF_DEPTH, BEVEL } from '@/models/profiles'
import { scrollState } from './scrollState'

const ghostMaterial = new LineBasicMaterial({
  color: new Color('#f5a623'),
  transparent: true,
  opacity: 0,
})

const dustMaterial = new MeshBasicMaterial({
  color: new Color('#f5a623'),
  transparent: true,
  opacity: 0,
})

const DUST = 120

/**
 * §8 beat 0 — the blaster is not there yet: a faint wireframe silhouette and
 * drifting particles, which resolve into the real thing as beat 1 assembles it.
 *
 * Without this the hero panel is simply empty, because the parts genuinely are
 * scattered off screen at that point. The ghost gives the eye something to hold
 * and tells you what is about to arrive.
 */
export function HeroGhost() {
  const lines = useRef<LineSegments>(null)
  const dust = useRef<InstancedMesh>(null)

  const edges = useMemo(() => {
    const body = new ExtrudeGeometry(buildShape(BODY_OUTLINE), { depth: HALF_DEPTH, ...BEVEL })
    const slide = new ExtrudeGeometry(buildShape(SLIDE_OUTLINE), { depth: HALF_DEPTH, ...BEVEL })
    const e1 = new EdgesGeometry(body, 25)
    body.dispose()
    slide.dispose()
    return e1
  }, [])

  const seeds = useMemo(
    () =>
      Array.from({ length: DUST }, () => ({
        x: (Math.random() * 2 - 1) * 3.2,
        y: (Math.random() * 2 - 1) * 2.0,
        z: (Math.random() * 2 - 1) * 2.0,
        speed: 0.08 + Math.random() * 0.22,
        phase: Math.random() * Math.PI * 2,
      })),
    [],
  )

  useFrame((_, delta) => {
    // present through beat 0, gone by the time beat 1 finishes assembling
    let wanted = 0
    if (scrollState.beat === 0) wanted = 1
    else if (scrollState.beat === 1) wanted = Math.max(0, 1 - scrollState.beatProgress * 1.8)

    ghostMaterial.opacity += (wanted * 0.5 - ghostMaterial.opacity) * (1 - Math.pow(0.02, delta))
    dustMaterial.opacity += (wanted * 0.65 - dustMaterial.opacity) * (1 - Math.pow(0.02, delta))

    const visible = ghostMaterial.opacity > 0.005
    if (lines.current) lines.current.visible = visible
    if (dust.current) dust.current.visible = visible
    if (!visible) return

    const t = performance.now() / 1000
    if (lines.current) lines.current.rotation.y = -0.5 + t * 0.06

    const mesh = dust.current
    if (mesh) {
      const dummy = new Object3D()
      seeds.forEach((s, i) => {
        dummy.position.set(
          s.x + Math.sin(t * s.speed + s.phase) * 0.25,
          s.y + Math.cos(t * s.speed * 0.8 + s.phase) * 0.2,
          s.z + Math.sin(t * s.speed * 0.6 + s.phase) * 0.2,
        )
        dummy.scale.setScalar(0.012 + (i % 5) * 0.004)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      })
      mesh.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group scale={0.78} position={[0, -0.1, 0]}>
      <lineSegments ref={lines} geometry={edges} material={ghostMaterial} />
      <instancedMesh ref={dust} args={[undefined, undefined, DUST]} material={dustMaterial}>
        <sphereGeometry args={[1, 6, 5]} />
      </instancedMesh>
    </group>
  )
}
