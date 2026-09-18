import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import type { Mesh } from 'three'
import { Lighting } from './Lighting'
import { scrollState } from './scrollState'

/** Milestone 5 placeholder: proves Lenis → ScrollTrigger → scrollState → render
 *  loop is wired end to end before any real geometry exists. Replaced by the
 *  Retaliator in milestone 6. */
function ProofCube() {
  const ref = useRef<Mesh>(null)

  useFrame(() => {
    const m = ref.current
    if (!m) return
    m.rotation.y = scrollState.progress * Math.PI * 4
    m.rotation.x = scrollState.progress * Math.PI
    m.position.y = Math.sin(scrollState.progress * Math.PI) * 0.6
  })

  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[1.4, 1.4, 1.4]} />
      <meshPhysicalMaterial color="#f6f5f2" roughness={0.55} clearcoat={0.15} />
    </mesh>
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
          <ProofCube />
        </Suspense>
        {import.meta.env.DEV && <Perf position="bottom-left" />}
      </Canvas>
    </div>
  )
}
