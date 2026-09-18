import { useEffect, useState } from 'react'

/**
 * §11 — the simplified render path.
 *
 * Triggered by viewport width rather than by user-agent sniffing: a narrow
 * window on a laptop has the same layout problem as a phone, and a tablet in
 * landscape does not. Coarse pointer is folded in because a touch device is
 * usually also the weaker GPU.
 */
export function useSimplified(): boolean {
  const [simplified, setSimplified] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches
  })

  useEffect(() => {
    const check = () => {
      setSimplified(
        window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches,
      )
    }
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  return simplified
}
