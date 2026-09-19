import { useEffect, useRef, useState } from 'react'
import { GAME_SECTION } from '@/content/site'
import { SectionHeading } from '../SectionHeading'
import { Bullets } from '../Bullets'
import { Hud } from '@/game/Hud'
import type { AimTrainer } from '@/game/useAimTrainer'

/** §9b — plays public/video/demo.mp4 when it exists, shows the poster when it
 *  does not. Never a broken <video> element. */
function DemoSlot() {
  const [hasVideo, setHasVideo] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    // HEAD rather than letting <video> fail: a 404 inside a media element
    // surfaces as a console error and a broken control strip.
    //
    // The content-type check is load-bearing. Vite's dev server (and most SPA
    // hosts, Vercel included) answer unknown paths with index.html and a 200,
    // so r.ok alone is true for a file that does not exist — which renders
    // exactly the empty player §9b says never to ship.
    fetch('/video/demo.mp4', { method: 'HEAD' })
      .then((r) => {
        const type = r.headers.get('content-type') ?? ''
        if (!cancelled) setHasVideo(r.ok && type.startsWith('video/'))
      })
      .catch(() => {
        if (!cancelled) setHasVideo(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="relative aspect-video overflow-hidden rounded-card-lg border border-[var(--hairline-dark)] bg-noir">
      {hasVideo ? (
        <video
          className="h-full w-full object-cover"
          controls
          preload="metadata"
          playsInline
          aria-label="Demonstration footage of the AIMBOT v2.0 controller"
        >
          <source src="/video/demo.mp4" type="video/mp4" />
        </video>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <p className="font-mono text-[11px] tracking-[0.25em] text-grey-2 uppercase">
            {GAME_SECTION.demoPoster}
          </p>
          <p className="font-mono text-[10px] tracking-[0.2em] text-grey-3 uppercase">
            {hasVideo === null ? '…' : GAME_SECTION.demoMissing}
          </p>
        </div>
      )}
    </div>
  )
}

export function GameSectionView({ trainer }: { trainer: AimTrainer }) {
  const surfaceRef = useRef<HTMLElement>(null)

  // Pointer movement over the arena surface feeds the trainer as intent.
  useEffect(() => {
    const el = surfaceRef.current
    if (!el) return

    // The arena lives in the stage panel now, not behind this column, so
    // aiming listens on the window and is scaled by the panel size.
    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth
      const h = window.innerHeight
      trainer.onPointerMove((e.movementX / w) * 2.2, (-e.movementY / h) * 2.2)
    }
    const onDown = (e: PointerEvent) => {
      // The whole section is the play surface, so a click on the HUD would
      // otherwise fire a shot and score it as a miss.
      const target = e.target
      if (target instanceof Element && target.closest('button, input, a, video, label')) {
        return
      }
      e.preventDefault()
      trainer.fire()
    }

    window.addEventListener('pointermove', onMove)
    el.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerdown', onDown)
    }
  }, [trainer])

  return (
    <section
      ref={surfaceRef}
      id="game"
      className="relative h-full px-5 py-20 sm:px-8 lg:py-28"
    >
      <div className="sticky top-[54vh] max-w-[620px] lg:top-[16vh] lg:pl-12">
        <SectionHeading numeral={GAME_SECTION.numeral} title={GAME_SECTION.title} tone="noir" />

        <div className="grid gap-8">
          <div className="space-y-5">
            <p className="text-lg text-paper">{GAME_SECTION.lead}</p>
            <Bullets points={GAME_SECTION.points} tone="noir" />

            <div className="pt-4">
              <Hud trainer={trainer} />
            </div>
          </div>

        </div>

        <div className="mt-16">
          <h3 className="mb-4 font-mono text-[11px] tracking-[0.22em] text-grey-3 uppercase">
            The real demo
          </h3>
          <DemoSlot />
          <p className="mt-4 text-sm text-grey-2">
            The trainer above is a simulation. This is the hardware itself.
          </p>
        </div>
      </div>
    </section>
  )
}
