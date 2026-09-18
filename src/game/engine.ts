/**
 * Aim-trainer state machine (§9a).
 *
 * Deliberately headless: it owns targets, scoring and timing, and knows
 * nothing about three.js or the DOM. That keeps it testable and lets the same
 * state drive both the WebGL arena and the DOM HUD.
 *
 * Arena coordinates are normalised to [-1, 1] on both axes, so the engine does
 * not care about canvas size or device pixel ratio.
 */

export interface Target {
  id: number
  x: number
  y: number
  radius: number
  /** performance.now()/1000 when it appeared — used for reaction time. */
  spawnedAt: number
  /** Set when hit, for the pop animation. */
  hitAt: number | null
}

export interface GameStats {
  shots: number
  hits: number
  /** 0–1 */
  accuracy: number
  /** Milliseconds, mean over hits. */
  meanReaction: number
  streak: number
  bestStreak: number
}

export interface GameState {
  targets: Target[]
  stats: GameStats
  /** Crosshair, arena coords. */
  cursor: { x: number; y: number }
  clutched: boolean
}

const MAX_TARGETS = 3
const TARGET_RADIUS = 0.11

export function createState(): GameState {
  return {
    targets: [],
    stats: {
      shots: 0,
      hits: 0,
      accuracy: 0,
      meanReaction: 0,
      streak: 0,
      bestStreak: 0,
    },
    cursor: { x: 0, y: 0 },
    clutched: false,
  }
}

let nextId = 1

function spawn(now: number): Target {
  // keep targets off the very edge so they are always reachable
  return {
    id: nextId++,
    x: (Math.random() * 2 - 1) * 0.78,
    y: (Math.random() * 2 - 1) * 0.66,
    radius: TARGET_RADIUS,
    spawnedAt: now,
    hitAt: null,
  }
}

export function tick(state: GameState, now: number): void {
  // retire finished pop animations
  state.targets = state.targets.filter((t) => t.hitAt === null || now - t.hitAt < 0.35)

  const live = state.targets.filter((t) => t.hitAt === null)
  while (live.length < MAX_TARGETS) {
    const t = spawn(now)
    state.targets.push(t)
    live.push(t)
  }
}

let reactionTotal = 0

/** @returns the target that was hit, or null for a miss. */
export function shoot(state: GameState, now: number): Target | null {
  state.stats.shots += 1

  const hit = state.targets.find(
    (t) =>
      t.hitAt === null &&
      Math.hypot(t.x - state.cursor.x, t.y - state.cursor.y) <= t.radius,
  )

  if (hit) {
    hit.hitAt = now
    state.stats.hits += 1
    state.stats.streak += 1
    state.stats.bestStreak = Math.max(state.stats.bestStreak, state.stats.streak)
    reactionTotal += (now - hit.spawnedAt) * 1000
    state.stats.meanReaction = reactionTotal / state.stats.hits
  } else {
    state.stats.streak = 0
  }

  state.stats.accuracy = state.stats.hits / state.stats.shots
  return hit ?? null
}

export function resetStats(state: GameState): void {
  reactionTotal = 0
  state.stats = {
    shots: 0,
    hits: 0,
    accuracy: 0,
    meanReaction: 0,
    streak: 0,
    bestStreak: 0,
  }
}

/** Clamp the crosshair to the arena. */
export function moveCursor(state: GameState, dx: number, dy: number): void {
  if (state.clutched) return
  state.cursor.x = Math.max(-1, Math.min(1, state.cursor.x + dx))
  state.cursor.y = Math.max(-1, Math.min(1, state.cursor.y + dy))
}
