import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createState,
  moveCursor,
  resetStats,
  shoot,
  tick,
  type GameState,
} from './engine'
import { OneEuroFilter2D } from './oneEuroFilter'
import { TremorSource } from './tremor'

export type InputMode = 'pointer' | 'imu'

export interface TrainerReadout {
  /** Degrees, for the HUD. Derived from crosshair position. */
  yaw: number
  pitch: number
  /** Hz — the live adaptive cutoff, the number that makes the filter legible. */
  cutoff: number
  /** The "potentiometer" position, 0–1. */
  sensitivity: number
}

export interface Trace {
  raw: number
  filtered: number
}

const HISTORY = 160

/**
 * Owns the aim trainer: input, filtering, scoring and the rolling trace.
 *
 * The state object is a ref rather than react state — it mutates every frame
 * and rendering it through setState would re-render the whole section at 60 Hz.
 * Only the HUD numbers are lifted into state, on a throttle.
 */
export function useAimTrainer(active: boolean) {
  const stateRef = useRef<GameState>(createState())
  const filterRef = useRef(new OneEuroFilter2D())
  const tremorRef = useRef(new TremorSource())
  const traceRef = useRef<Trace[]>([])

  const [mode, setMode] = useState<InputMode>('pointer')
  const [filterOn, setFilterOn] = useState(true)
  const [sensitivity, setSensitivity] = useState(0.5)
  const [, forceTick] = useState(0)

  const sensRef = useRef(sensitivity)
  sensRef.current = sensitivity
  const modeRef = useRef(mode)
  modeRef.current = mode
  const filterOnRef = useRef(filterOn)
  filterOnRef.current = filterOn

  const readoutRef = useRef<TrainerReadout>({
    yaw: 0,
    pitch: 0,
    cutoff: 1,
    sensitivity: 0.5,
  })

  /** Intent from the pointer, accumulated between frames. */
  const intentRef = useRef({ dx: 0, dy: 0 })

  const onPointerMove = useCallback((dx: number, dy: number) => {
    intentRef.current.dx += dx
    intentRef.current.dy += dy
  }, [])

  const fire = useCallback(() => {
    shoot(stateRef.current, performance.now() / 1000)
    forceTick((n) => n + 1)
  }, [])

  const setClutch = useCallback((on: boolean) => {
    stateRef.current.clutched = on
    if (on) filterRef.current.reset()
    forceTick((n) => n + 1)
  }, [])

  const reset = useCallback(() => {
    resetStats(stateRef.current)
    traceRef.current = []
    forceTick((n) => n + 1)
  }, [])

  /** Advance one frame. Called from the render loop. */
  const step = useCallback(() => {
    const now = performance.now() / 1000
    const state = stateRef.current
    tick(state, now)

    // sensitivity scalar, exactly as the potentiometer ADC is applied in firmware
    const sens = 0.4 + sensRef.current * 1.6

    let dx = intentRef.current.dx
    let dy = intentRef.current.dy
    intentRef.current.dx = 0
    intentRef.current.dy = 0

    let rawX = dx
    if (modeRef.current === 'imu') {
      // the hand shakes whether or not it is moving
      const [tx, ty] = tremorRef.current.sample(now)
      dx += tx * 0.0016
      dy += ty * 0.0016
      rawX = dx
    }

    let outX = dx
    let outY = dy
    if (filterOnRef.current) {
      const [fx, fy] = filterRef.current.filter(dx, dy, now)
      outX = fx
      outY = fy
    }

    moveCursor(state, outX * sens, outY * sens)

    // rolling trace for the sparkline — raw against filtered
    traceRef.current.push({ raw: rawX, filtered: outX })
    if (traceRef.current.length > HISTORY) traceRef.current.shift()

    readoutRef.current = {
      yaw: state.cursor.x * 42,
      pitch: state.cursor.y * 28,
      cutoff: filterRef.current.cutoff,
      sensitivity: sensRef.current,
    }
  }, [])

  // keyboard: arrows move, space clutches, enter fires (§12 — keyboard-only play)
  useEffect(() => {
    if (!active) return

    const KEY_STEP = 0.02
    const held = new Set<string>()

    const onDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setClutch(true)
        return
      }
      if (e.code === 'Enter' || e.code === 'KeyF') {
        e.preventDefault()
        fire()
        return
      }
      if (e.key.startsWith('Arrow')) {
        e.preventDefault()
        held.add(e.key)
      }
    }

    const onUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setClutch(false)
      held.delete(e.key)
    }

    const id = window.setInterval(() => {
      if (held.has('ArrowLeft')) onPointerMove(-KEY_STEP, 0)
      if (held.has('ArrowRight')) onPointerMove(KEY_STEP, 0)
      if (held.has('ArrowUp')) onPointerMove(0, KEY_STEP)
      if (held.has('ArrowDown')) onPointerMove(0, -KEY_STEP)
    }, 16)

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [active, fire, setClutch, onPointerMove])

  // reset the filter when the input model changes, so the first frame after a
  // toggle is not a spike from stale history
  useEffect(() => {
    filterRef.current.reset()
  }, [mode, filterOn])

  return useMemo(
    () => ({
      stateRef,
      traceRef,
      readoutRef,
      mode,
      setMode,
      filterOn,
      setFilterOn,
      sensitivity,
      setSensitivity,
      onPointerMove,
      fire,
      setClutch,
      reset,
      step,
    }),
    [mode, filterOn, sensitivity, onPointerMove, fire, setClutch, reset, step],
  )
}

export type AimTrainer = ReturnType<typeof useAimTrainer>
