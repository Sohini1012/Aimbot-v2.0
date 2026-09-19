import { Suspense, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import type { Group } from 'three'
import { Lighting } from './Lighting'
import { scrollState } from './scrollState'
import { Blaster } from '@/models/Blaster'
import { CameraRig } from './CameraRig'
import { WalkLight } from './WalkLight'
import { SignalPath } from './SignalPath'
import { LabelProjector } from './LabelProjector'
import { HeroGhost } from './HeroGhost'
import { LabelOverlay } from '@/components/LabelOverlay'
import { Arena } from '@/game/Arena'
import type { AimTrainer } from '@/game/useAimTrainer'

/** Dev-only: surfaces renderer stats and the camera so the scene can be
 *  verified without relying on screenshots. Stripped from production. */
function RenderProbe() {
  const { gl, camera } = useThree()
  useFrame(() => {
    ;(globalThis as unknown as { __r3f?: unknown }).__r3f = {
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      cam: [
        Number(camera.position.x.toFixed(2)),
        Number(camera.position.y.toFixed(2)),
        Number(camera.position.z.toFixed(2)),
      ],
    }
  })
  return null
}

/** Rotates the assembled model through the orbit and explode beats. */
function BlasterRig({ simplified }: { simplified: boolean }) {
  const ref = useRef<Group>(null)
  const spin = useRef(-0.5)

  useFrame((_, delta) => {
    const g = ref.current
    if (!g) return

    // A slow idle turn through the orbit beat, then the 40 degrees beat 3
    // asks for across the explode. Damped rather than written straight from
    // scroll, so a flicked scroll wheel does not snap the model round.
    const base = -0.5 + scrollState.progress * 1.4
    const idle = scrollState.beat === 2 ? performance.now() / 9000 : 0
    const wanted = base + idle
    spin.current += (wanted - spin.current) * (1 - Math.pow(0.02, delta))
    g.rotation.y = spin.current
  })

  return (
    <group ref={ref} scale={0.78} position={[0, -0.1, 0]}>
      <Blaster simplified={simplified} />
    </group>
  )
}

/** Swaps the blaster out for the arena at the muzzle dive (§8 beat 7). */
function SceneSwitch({ trainer, simplified }: { trainer: AimTrainer; simplified: boolean }) {
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
        <HeroGhost />
        <BlasterRig simplified={simplified} />
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
  simplified: boolean
  /** Hidden outside the 3D regions, so paper sections get the full width. */
  visible: boolean
  trainer: AimTrainer
}

export function Stage({ ariaLabel, reducedMotion, simplified, visible, trainer }: Props) {
  return (
    /**
     * The stage owns its own column rather than sitting behind the whole page.
     *
     * A full-bleed fixed canvas means every text panel is drawn on top of the
     * model — which is exactly the overlap this layout exists to prevent. The
     * panel takes the right 56% on desktop and the top 46vh on narrow screens;
     * the copy lives in the space left over and the two never share pixels.
     */
    <div
      className={`pointer-events-none fixed z-0 transition-opacity duration-500 ease-[var(--ease-ui)] top-[52px] right-0 left-0 h-[46vh] lg:top-0 lg:left-auto lg:h-screen lg:w-[50vw] xl:w-[54vw] ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      role="img"
      aria-label={ariaLabel}
    >
      <Canvas
        shadows={!reducedMotion && !simplified}
        dpr={simplified ? [1, 1.5] : [1, 2]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.6, 5.5], fov: 38 }}
      >
        <color attach="background" args={['#101013']} />
        <Suspense fallback={null}>
          <Lighting shadows={!reducedMotion && !simplified} />
          <WalkLight />
          <CameraRig reduced={reducedMotion} simplified={simplified} />
          <SceneSwitch trainer={trainer} simplified={simplified} />
          <LabelProjector />
        </Suspense>
        {import.meta.env.DEV && <RenderProbe />}
        {import.meta.env.DEV && <Perf position="bottom-left" />}
      </Canvas>

      {/* leader lines and part names, drawn over the canvas inside the panel */}
      <LabelOverlay />
    </div>
  )
}
