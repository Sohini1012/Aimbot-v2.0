import { useEffect, useState } from 'react'
import { scrollState } from '@/scene/scrollState'
import { WALK_ORDER } from '@/content/hardware'
import type { PartId } from '@/content/types'

/**
 * The component the walk is currently on, as react state.
 *
 * Polled rather than driven from the render loop: the value changes seven
 * times across the whole beat, so watching it on an interval costs nothing,
 * whereas a per-frame subscription would re-render the card sixty times a
 * second to show the same text.
 */
export function useWalkPart(): { id: PartId | null; index: number } {
  const [state, setState] = useState<{ id: PartId | null; index: number }>({
    id: null,
    index: -1,
  })

  useEffect(() => {
    const id = window.setInterval(() => {
      const index = scrollState.beat === 4 ? scrollState.walkIndex : -1
      const partId = index >= 0 ? (WALK_ORDER[index] ?? null) : null
      setState((prev) => (prev.index === index ? prev : { id: partId, index }))
    }, 80)
    return () => window.clearInterval(id)
  }, [])

  return state
}
