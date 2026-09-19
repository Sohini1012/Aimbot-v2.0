import { useEffect, useState } from 'react'
import { GLB_URL } from '@/models/BlasterGLB'

/**
 * §6 — Path B must never break Path A.
 *
 * useGLTF suspends forever on a missing file, so asking for the GLB without
 * checking would leave the stage permanently empty on any checkout where the
 * model has not been built. A HEAD request settles it before anything mounts.
 *
 * The content-type check matters for the same reason it does for the demo
 * video: dev servers and SPA hosts answer unknown paths with index.html and a
 * 200, so r.ok alone would happily report a missing model as present.
 */
export function useGlbAvailable(): boolean | null {
  const [available, setAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(GLB_URL, { method: 'HEAD' })
      .then((r) => {
        const type = r.headers.get('content-type') ?? ''
        const ok = r.ok && !type.includes('text/html')
        if (!cancelled) setAvailable(ok)
      })
      .catch(() => {
        if (!cancelled) setAvailable(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return available
}
