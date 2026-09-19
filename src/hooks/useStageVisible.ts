import { useEffect, useState, type RefObject } from 'react'

/**
 * True while any 3D region is on screen.
 *
 * The stage panel occupies real layout space on the right, so it has to get
 * out of the way for the paper sections — otherwise half the width is a dark
 * empty rectangle while you read about the firmware.
 */
export function useStageVisible(regions: readonly RefObject<HTMLElement | null>[]): boolean {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const onScreen = new Set<Element>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onScreen.add(entry.target)
          else onScreen.delete(entry.target)
        }
        setVisible(onScreen.size > 0)
      },
      // a small negative margin means the panel fades out just before the
      // region leaves, rather than snapping at the exact boundary
      { rootMargin: '-8% 0px -8% 0px', threshold: 0 },
    )

    for (const ref of regions) {
      if (ref.current) observer.observe(ref.current)
    }
    return () => observer.disconnect()
  }, [regions])

  return visible
}
