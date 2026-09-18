/**
 * Synthetic tremor, for the RAW IMU demo in §9a.
 *
 * This stands in for the signal the MPU-9250 actually produces when an unsteady
 * hand holds the controller: a fast oscillation riding on the slow movement the
 * user intends. Physiological tremor sits around 8–12 Hz for essential tremor
 * and 4–6 Hz for Parkinsonian tremor, so the generator sums components across
 * that band rather than using one clean sine — a single frequency is trivially
 * filterable and would make the 1€ filter look better than it is.
 *
 * Sensor noise is added on top as broadband jitter, because the real IMU has
 * that too and it is what the minimum cutoff has to deal with when the hand is
 * otherwise still.
 */

export interface TremorConfig {
  /** Peak displacement in pixels. */
  amplitude: number
  /** Broadband sensor noise, pixels. */
  noise: number
}

export const DEFAULT_TREMOR: TremorConfig = {
  amplitude: 9,
  noise: 1.4,
}

interface Component {
  freq: number
  phase: number
  weight: number
}

function components(seed: number): Component[] {
  // spread across the physiological tremor band
  return [
    { freq: 8.4, phase: seed * 1.7, weight: 1.0 },
    { freq: 11.3, phase: seed * 3.1 + 1.2, weight: 0.55 },
    { freq: 5.2, phase: seed * 0.9 + 2.4, weight: 0.4 },
    { freq: 14.9, phase: seed * 2.3 + 0.6, weight: 0.22 },
  ]
}

export class TremorSource {
  private cx: Component[]
  private cy: Component[]
  private cfg: TremorConfig

  constructor(cfg: Partial<TremorConfig> = {}) {
    this.cfg = { ...DEFAULT_TREMOR, ...cfg }
    this.cx = components(1)
    this.cy = components(2)
  }

  setConfig(cfg: Partial<TremorConfig>): void {
    this.cfg = { ...this.cfg, ...cfg }
  }

  private evaluate(cs: Component[], t: number): number {
    let sum = 0
    let weight = 0
    for (const c of cs) {
      sum += Math.sin(t * c.freq * Math.PI * 2 + c.phase) * c.weight
      weight += c.weight
    }
    return (sum / weight) * this.cfg.amplitude
  }

  /** @param t seconds */
  sample(t: number): readonly [number, number] {
    const nx = (Math.random() - 0.5) * 2 * this.cfg.noise
    const ny = (Math.random() - 0.5) * 2 * this.cfg.noise
    return [this.evaluate(this.cx, t) + nx, this.evaluate(this.cy, t) + ny]
  }
}
