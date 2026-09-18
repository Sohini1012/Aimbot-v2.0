import { useEffect, type RefObject } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { setRegionProgress, type RegionName } from '@/scene/scrollState'
import { WALK_ORDER } from '@/content/hardware'

/**
 * Binds one scroll region to its slice of the beat timeline.
 *
 * Under reduced motion the scrub is dropped, so the model lands on each beat's
 * end state instead of animating between them (§5).
 */
export function useScrollBeat(
  ref: RefObject<HTMLElement | null>,
  region: RegionName,
  reduced: boolean,
  onUpdate?: () => void,
): void {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: reduced ? false : 1,
      onUpdate: (self) => {
        setRegionProgress(region, self.progress, WALK_ORDER.length)
        onUpdate?.()
      },
    })

    return () => st.kill()
  }, [ref, region, reduced, onUpdate])
}
