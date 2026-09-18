import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import type { Group } from 'three'
import { Lighting } from './Lighting'
import { scrollState } from './scrollState'
import { Blaster } from '@/models/Blaster'
import { CameraRig } from './CameraRig'
import { WalkLight } from './WalkLight'
import { SignalPath } from './SignalPath'
import { Arena } from '@/game/Arena'
import type { AimTrainer } from '@/game/useAimTrainer'

/** Rotates the assembled model through the orbit and explode beats. */
function BlasterRig() {
  const ref = useRef<Group>(null)

  useFrame(() => {
    const g = ref.current
    if (!g) return
    // §8 beat 3 calls for 40 degrees of rotation across the explode
    g.rotation.y = -0.5 + scrollState.progress * 1.4
  })

  return (
    <group ref={ref} scale={0.78} position={[0, -0.1, 0]}>
      <Blaster />
    </group>
  )
}

/** Swaps the blaster out for the arena at the muzzle dive (§8 beat 7). */
function SceneSwitch({ trainer }: { trainer: AimTrainer }) {
  const blasterRef = useRef<Group>(null)
  const arenaRef = useRef<Group>(null)

  useFrame(() => {
    // Beat 7 is the dive through the muzzle; the blaster is gone by beat 8.
    const inGame = scrollState.beat >= 8
    if (blasterRef.current) blasterRef.current.visible = !inGame
    if (arenaRef.current) arenaRef.current.visible = inGame
  })

  return (
    <>
      <group ref={blasterRef}>
        <BlasterRig />
        <SignalPath />
      </group>
      <group ref={arenaRef} visible={false}>
        <Arena trainer={trainer} />
      </group>
    </>
  )
}

interface Props {
  /** §12 — canvas is decorative-with-a-label; the real story is in the DOM. */
  ariaLabel: string
  reducedMotion: boolean
  trainer: AimTrainer
}

export function Stage({ ariaLabel, reducedMotion, trainer }: Props) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" role="img" aria-label={ariaLabel}>
      <Canvas
        shadows={!reducedMotion}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.6, 5.5], fov: 38 }}
      >
        <color attach="background" args={['#101013']} />
        <Suspense fallback={null}>
          <Lighting shadows={!reducedMotion} />
          <WalkLight />
          <CameraRig reduced={reducedMotion} />
          <SceneSwitch trainer={trainer} />
        </Suspense>
        {import.meta.env.DEV && <Perf position="bottom-left" />}
      </Canvas>
    </div>
  )
}
