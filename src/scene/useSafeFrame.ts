import { useFrame } from '@react-three/fiber'
import type { RootState } from '@react-three/fiber'

/**
 * useFrame that cannot kill the render loop.
 *
 * react-three-fiber runs every useFrame callback inside one requestAnimationFrame
 * tick. An exception thrown by any of them propagates out of the loop and the
 * loop stops being scheduled — so a single bad lookup in a single component
 * blanks the entire canvas, permanently, with no way back short of a remount.
 *
 * That is not hypothetical: a missing placement entry for the wiring harness
 * threw here on every frame and turned the whole stage black.
 *
 * The first failure per callback is reported; after that it stays quiet rather
 * than filling the console with tens of thousands of identical lines (the real
 * incident logged ~78,000). The frame is skipped, the loop survives, and the
 * rest of the scene keeps drawing.
 */
export function useSafeFrame(
  label: string,
  callback: (state: RootState, delta: number) => void,
  renderPriority = 0,
): void {
  let failed = false

  useFrame((state, delta) => {
    try {
      callback(state, delta)
    } catch (error) {
      if (!failed) {
        failed = true
        console.error(`[frame:${label}] threw — this frame is skipped, the loop continues`, error)
      }
    }
  }, renderPriority)
}
