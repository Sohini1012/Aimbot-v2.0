import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Nav } from './components/Nav'
import { Hero } from './components/sections/Hero'
import { Problem } from './components/sections/Problem'
import { Team } from './components/sections/Team'
import { useLenis } from './hooks/useLenis'
import { useReducedMotion } from './hooks/useReducedMotion'
import { setProgress, scrollState, BEATS } from './scene/scrollState'
import { WALK_ORDER } from './content/hardware'

/**
 * §11 — three.js is ~285 KB gzipped and must not sit in the critical path.
 * Lazy-loading the stage lets the hero heading paint immediately and the model
 * fade in behind it, rather than showing a blank screen behind a loader.
 * The Suspense fallback is deliberately null: the dark hero section is already
 * the correct backdrop, so there is nothing to show while three.js arrives.
 */
const Stage = lazy(() => import('./scene/Stage').then((m) => ({ default: m.Stage })))

const BEAT_LABELS: readonly string[] = [
  'A dark stage with a faint wireframe silhouette of the controller.',
  'The controller assembling itself from scattered parts.',
  'The assembled AIMBOT v2.0 controller rotating slowly.',
  'The controller in exploded view, every internal part separated and labelled.',
  'A close look at one internal component, highlighted in amber.',
  'An animated signal tracing the path from the IMU through the Pico to the USB output.',
  'The controller reassembling into a whole.',
  'The camera diving through the muzzle into the game view.',
  'The aim-trainer game arena.',
]

export function App() {
  const reduced = useReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const [beatLabel, setBeatLabel] = useState<string>(BEAT_LABELS[0] ?? '')

  useLenis(!reduced)

  useEffect(() => {
    const el = stageRef.current
    if (!el) return

    let lastBeat = -1
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: reduced ? false : 1,
      onUpdate: (self) => {
        setProgress(self.progress, WALK_ORDER.length)
        if (scrollState.beat !== lastBeat) {
          lastBeat = scrollState.beat
          setBeatLabel(BEAT_LABELS[scrollState.beat] ?? '')
        }
      },
    })

    ScrollTrigger.normalizeScroll(!reduced)
    return () => {
      st.kill()
      ScrollTrigger.normalizeScroll(false)
    }
  }, [reduced])

  useEffect(() => {
    // Refresh once fonts have settled, otherwise pin distances are computed
    // against pre-swap metrics and every trigger sits a few pixels off.
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 250)
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
        <Stage ariaLabel={beatLabel} reducedMotion={reduced} />
      </Suspense>

      <main className="relative z-10">
        {/* The pinned stage: BEATS span this scroll distance. */}
        <div ref={stageRef} style={{ height: `${BEATS.length * 70}vh` }}>
          <Hero />
        </div>

        <div className="relative z-10 bg-paper">
          <Problem />
          <Team />
        </div>
      </main>
    </>
  )
}
