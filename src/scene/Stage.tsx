import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import type { Group } from 'three'
import { Lighting } from './Lighting'
import { scrollState } from './scrollState'
import { Blaster } from '@/models/Blaster'

/** Interim rig: a slow orbit so the exploded view can be judged from a moving
 *  camera. The real camera flights land in milestones 10-13. */
function BlasterRig() {
  const ref = useRef<Group>(null)

  useFrame(() => {
    const g = ref.current
    if (!g) return
    // 40 degrees of rotation across the explode, per §8 beat 3
    g.rotation.y = -0.5 + scrollState.progress * 1.4
  })

  return (
    <group ref={ref} scale={0.78} position={[0, -0.1, 0]}>
      <Blaster />
    </group>
  )
}

interface Props {
  /** §12 — canvas is decorative-with-a-label; the real story is in the DOM. */
  ariaLabel: string
  reducedMotion: boolean
}

export function Stage({ ariaLabel, reducedMotion }: Props) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      role="img"
      aria-label={ariaLabel}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.6, 5.5], fov: 38 }}
      >
        <color attach="background" args={['#101013']} />
        <Suspense fallback={null}>
          <Lighting shadows={!reducedMotion} />
          <BlasterRig />
        </Suspense>
        {import.meta.env.DEV && <Perf position="bottom-left" />}
      </Canvas>
    </div>
  )
}
