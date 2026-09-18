import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Nav } from './components/Nav'
import { Hero } from './components/sections/Hero'
import { Problem } from './components/sections/Problem'
import { Inside } from './components/sections/Inside'
import { Firmware } from './components/sections/Firmware'
import { GameSectionView } from './components/sections/GameSectionView'
import { BuildLog } from './components/sections/BuildLog'
import { Team } from './components/sections/Team'
import { Footer } from './components/sections/Footer'
import { useLenis } from './hooks/useLenis'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useSimplified } from './hooks/useSimplified'
import { useScrollBeat } from './hooks/useScrollBeat'
import { scrollState } from './scene/scrollState'
import { useAimTrainer } from './game/useAimTrainer'

/**
 * §11 — three.js is ~285 KB gzipped and must not sit in the critical path.
 * Lazy-loading the stage lets the hero heading paint immediately and the model
 * fade in behind it, rather than showing a blank screen behind a loader.
 * The Suspense fallback is deliberately null: the dark hero is already the
 * correct backdrop, so there is nothing to show while three.js arrives.
 */
const Stage = lazy(() => import('./scene/Stage').then((m) => ({ default: m.Stage })))

/** §12 — the canvas description, updated per beat so a screen reader is told
 *  what is on screen rather than being handed an unchanging label. */
const BEAT_LABELS: readonly string[] = [
  'A dark stage with a faint wireframe silhouette of the controller.',
  'The controller assembling itself from scattered parts.',
  'The assembled AIMBOT v2.0 controller rotating slowly.',
  'The controller in exploded view, every internal part separated and labelled.',
  'A close look at one internal component, highlighted in amber.',
  'An animated signal tracing the path from the IMU through the Pico to the USB output.',
  'The controller reassembling into a whole.',
  'The camera diving through the muzzle into the game view.',
  'The aim-trainer arena, with targets and a crosshair.',
]

export function App() {
  const reduced = useReducedMotion()
  const simplified = useSimplified()
  const heroRegion = useRef<HTMLDivElement>(null)
  const insideRegion = useRef<HTMLDivElement>(null)
  const gameRegion = useRef<HTMLDivElement>(null)

  const [beatLabel, setBeatLabel] = useState<string>(BEAT_LABELS[0] ?? '')
  const lastBeat = useRef(-1)

  const trainer = useAimTrainer(true, !reduced)

  useLenis(!reduced)

  const syncLabel = useCallback(() => {
    if (scrollState.beat !== lastBeat.current) {
      lastBeat.current = scrollState.beat
      setBeatLabel(BEAT_LABELS[scrollState.beat] ?? '')
    }
  }, [])

  useScrollBeat(heroRegion, 'hero', reduced, syncLabel)
  useScrollBeat(insideRegion, 'inside', reduced, syncLabel)
  useScrollBeat(gameRegion, 'game', reduced, syncLabel)

  useEffect(() => {
    ScrollTrigger.normalizeScroll(!reduced)
    return () => {
      ScrollTrigger.normalizeScroll(false)
    }
  }, [reduced])

  useEffect(() => {
    // Refresh once fonts have settled — pin distances computed against
    // pre-swap metrics leave every trigger a few pixels off.
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 300)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <>
      <a
        href="#problem"
        className="sr-only rounded-chip bg-amber px-4 py-2 font-mono text-[11px] tracking-[0.2em] text-noir uppercase focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100]"
      >
        Skip to content
      </a>

      <Nav />

      <Suspense fallback={null}>
        <Stage
          ariaLabel={beatLabel}
          reducedMotion={reduced}
          simplified={simplified}
          trainer={trainer}
        />
      </Suspense>

      <main className="relative z-10">
        {/* Beats 0-2 — the canvas shows through behind the hero copy. */}
        <div ref={heroRegion} className="relative" style={{ height: '220vh' }}>
          <div className="sticky top-0">
            <Hero />
          </div>
        </div>

        <Problem />

        {/* Beats 3-6 — explode, component walk, signal path, reassemble. */}
        <div ref={insideRegion} className="relative">
          <Inside />
        </div>

        <Firmware />

        {/* Beats 7-8 — muzzle dive into the arena. */}
        <div ref={gameRegion} className="relative">
          <GameSectionView trainer={trainer} />
        </div>

        <BuildLog />
        <Team />
      </main>

      <Footer />
    </>
  )
}
