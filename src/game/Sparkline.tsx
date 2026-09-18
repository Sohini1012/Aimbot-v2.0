import { useEffect, useRef } from 'react'
import type { Trace } from './useAimTrainer'

/**
 * Raw against filtered, drawn on a 2D canvas.
 *
 * §9a asks for this to stay cheap — it is a 160-sample rolling window redrawn
 * each frame, which a charting library would turn into thousands of DOM nodes
 * for no gain.
 */
export function Sparkline({ traceRef }: { traceRef: { current: Trace[] } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    const draw = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr
        canvas.height = h * dpr
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      const trace = traceRef.current
      if (trace.length > 1) {
        // shared scale, so the two lines are honestly comparable
        let peak = 0.0001
        for (const t of trace) {
          peak = Math.max(peak, Math.abs(t.raw), Math.abs(t.filtered))
        }

        const plot = (key: 'raw' | 'filtered', colour: string, width: number) => {
          ctx.beginPath()
          ctx.strokeStyle = colour
          ctx.lineWidth = width
          ctx.lineJoin = 'round'
          trace.forEach((t, i) => {
            const x = (i / (trace.length - 1)) * w
            const y = h / 2 - (t[key] / peak) * (h / 2 - 2)
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          })
          ctx.stroke()
        }

        ctx.strokeStyle = 'rgba(255,255,255,0.08)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, h / 2)
        ctx.lineTo(w, h / 2)
        ctx.stroke()

        plot('raw', 'rgba(201,201,209,0.45)', 1)
        plot('filtered', '#f5a623', 1.6)
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [traceRef])

  return (
    <canvas
      ref={canvasRef}
      className="h-16 w-full"
      aria-hidden="true"
    />
  )
}
