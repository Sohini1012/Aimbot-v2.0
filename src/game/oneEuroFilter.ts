/**
 * 1 Euro Filter — Casiez, Roussel & Vogel, "1€ Filter: A Simple Speed-based
 * Low-pass Filter for Noisy Input in Interactive Systems", CHI 2012.
 *
 * The whole idea in one line: make the low-pass cutoff a function of speed.
 * At low speed the cutoff is low, so jitter (and hand tremor) is smoothed away
 * hard. At high speed the cutoff rises, so fast intentional motion passes
 * through almost untouched and the lag you would normally pay for smoothing
 * does not appear.
 *
 * This is the same algorithm that runs on the Pico. The firmware variant is
 * fixed-rate at 500 Hz; this one takes a timestamp because requestAnimationFrame
 * is not.
 */

/** Exponential smoothing with an explicit alpha. */
class LowPass {
  private y: number | null = null
  private s: number | null = null

  filter(x: number, alpha: number): number {
    const s = this.s === null ? x : alpha * x + (1 - alpha) * this.s
    this.y = x
    this.s = s
    return s
  }

  get last(): number | null {
    return this.y
  }

  reset(): void {
    this.y = null
    this.s = null
  }
}

export interface OneEuroConfig {
  /** Nominal sample rate in Hz, used until two samples have been seen. */
  freq: number
  /** Cutoff at zero speed, Hz. Lower = more tremor suppression when still. */
  minCutoff: number
  /** Speed coefficient. Higher = cutoff opens up faster as you move. */
  beta: number
  /** Fixed cutoff for the derivative estimate, Hz. */
  dCutoff: number
}

export const DEFAULT_ONE_EURO: OneEuroConfig = {
  freq: 120,
  minCutoff: 1.0,
  beta: 0.007,
  dCutoff: 1.0,
}

/** alpha for a given cutoff and sample period. */
function alpha(cutoff: number, dt: number): number {
  const tau = 1 / (2 * Math.PI * cutoff)
  return 1 / (1 + tau / dt)
}

export class OneEuroFilter {
  private cfg: OneEuroConfig
  private xFilter = new LowPass()
  private dxFilter = new LowPass()
  private lastTime: number | null = null

  constructor(cfg: Partial<OneEuroConfig> = {}) {
    this.cfg = { ...DEFAULT_ONE_EURO, ...cfg }
  }

  /** Tunables the potentiometer and the UI sliders drive at runtime. */
  setConfig(cfg: Partial<OneEuroConfig>): void {
    this.cfg = { ...this.cfg, ...cfg }
  }

  getConfig(): Readonly<OneEuroConfig> {
    return this.cfg
  }

  /** The cutoff used on the most recent sample — surfaced in the HUD readout. */
  private lastCutoff = DEFAULT_ONE_EURO.minCutoff
  get cutoff(): number {
    return this.lastCutoff
  }

  reset(): void {
    this.xFilter.reset()
    this.dxFilter.reset()
    this.lastTime = null
    this.lastCutoff = this.cfg.minCutoff
  }

  /**
   * @param x         raw sample
   * @param timestamp seconds (performance.now() / 1000)
   */
  filter(x: number, timestamp?: number): number {
    let dt = 1 / this.cfg.freq
    if (timestamp !== undefined && this.lastTime !== null && timestamp > this.lastTime) {
      dt = timestamp - this.lastTime
    }
    if (timestamp !== undefined) this.lastTime = timestamp

    // Guard against a stalled tab handing us an enormous dt.
    if (!Number.isFinite(dt) || dt <= 0) dt = 1 / this.cfg.freq
    dt = Math.min(dt, 0.1)

    const prev = this.xFilter.last
    // Rate of change, then low-pass it at a fixed cutoff so the speed estimate
    // is not itself noisy — otherwise the adaptive cutoff chatters.
    const dx = prev === null ? 0 : (x - prev) / dt
    const edx = this.dxFilter.filter(dx, alpha(this.cfg.dCutoff, dt))

    // The adaptive step: cutoff rises with |speed|.
    const cutoff = this.cfg.minCutoff + this.cfg.beta * Math.abs(edx)
    this.lastCutoff = cutoff

    return this.xFilter.filter(x, alpha(cutoff, dt))
  }
}

/** Convenience pair for 2D pointer deltas. */
export class OneEuroFilter2D {
  private fx: OneEuroFilter
  private fy: OneEuroFilter

  constructor(cfg: Partial<OneEuroConfig> = {}) {
    this.fx = new OneEuroFilter(cfg)
    this.fy = new OneEuroFilter(cfg)
  }

  setConfig(cfg: Partial<OneEuroConfig>): void {
    this.fx.setConfig(cfg)
    this.fy.setConfig(cfg)
  }

  get cutoff(): number {
    return this.fx.cutoff
  }

  reset(): void {
    this.fx.reset()
    this.fy.reset()
  }

  filter(x: number, y: number, timestamp?: number): readonly [number, number] {
    return [this.fx.filter(x, timestamp), this.fy.filter(y, timestamp)]
  }
}
