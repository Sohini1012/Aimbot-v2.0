import { useEffect, useState } from 'react'
import type { AimTrainer } from './useAimTrainer'
import { Sparkline } from './Sparkline'
import { GAME_SECTION } from '@/content/site'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.2em] text-grey-3 uppercase">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tracking-[-0.02em] text-paper tabular-nums">
        {value}
      </p>
    </div>
  )
}

function Toggle({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={`rounded-chip border px-3 py-2 font-mono text-[10px] tracking-[0.18em] uppercase transition-colors duration-200 ${
        pressed
          ? 'border-amber bg-[var(--amber-20)] text-amber'
          : 'border-[var(--hairline-dark)] text-grey-2 hover:text-paper'
      }`}
    >
      {children}
    </button>
  )
}

/**
 * The HUD, in the DOM rather than in the canvas.
 *
 * §12 requires every fact to exist as real text for screen readers, and
 * numbers rendered into WebGL are invisible to them. The live figures are
 * polled on a 100 ms interval instead of every frame — the eye cannot read
 * faster than that, and re-rendering this subtree at 60 Hz would cost more
 * than the arena does.
 */
export function Hud({ trainer }: { trainer: AimTrainer }) {
  const [, tickState] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => tickState((n) => n + 1), 100)
    return () => window.clearInterval(id)
  }, [])

  const stats = trainer.stateRef.current.stats
  const readout = trainer.readoutRef.current
  const clutched = trainer.stateRef.current.clutched

  return (
    <div className="rounded-card-lg border border-[var(--hairline-dark)] bg-panel p-5">
      <div
        className="grid grid-cols-3 gap-4"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <Stat label="Accuracy" value={`${Math.round(stats.accuracy * 100)}%`} />
        <Stat
          label="Reaction"
          value={stats.hits > 0 ? `${Math.round(stats.meanReaction)}ms` : '—'}
        />
        <Stat label="Streak" value={`${stats.streak}`} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Toggle
          pressed={trainer.mode === 'imu'}
          onClick={() => trainer.setMode(trainer.mode === 'imu' ? 'pointer' : 'imu')}
        >
          {GAME_SECTION.rawLabel}
        </Toggle>
        <Toggle pressed={trainer.filterOn} onClick={() => trainer.setFilterOn(!trainer.filterOn)}>
          {GAME_SECTION.filteredLabel}
        </Toggle>
        <button
          type="button"
          onClick={trainer.reset}
          className="rounded-chip border border-[var(--hairline-dark)] px-3 py-2 font-mono text-[10px] tracking-[0.18em] text-grey-2 uppercase transition-colors duration-200 hover:text-paper"
        >
          Reset
        </button>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] tracking-[0.2em] text-grey-3 uppercase">
            Raw vs filtered
          </p>
          <p className="font-mono text-[10px] tracking-[0.2em] text-amber uppercase tabular-nums">
            {readout.cutoff.toFixed(2)} Hz
          </p>
        </div>
        <Sparkline traceRef={trainer.traceRef} />
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-[var(--hairline-dark)] pt-4">
        <div>
          <dt className="font-mono text-[9px] tracking-[0.18em] text-grey-3 uppercase">Yaw</dt>
          <dd className="font-mono text-xs text-grey-1 tabular-nums">
            {readout.yaw.toFixed(1)}°
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[9px] tracking-[0.18em] text-grey-3 uppercase">Pitch</dt>
          <dd className="font-mono text-xs text-grey-1 tabular-nums">
            {readout.pitch.toFixed(1)}°
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[9px] tracking-[0.18em] text-grey-3 uppercase">Clutch</dt>
          <dd
            className={`font-mono text-xs tabular-nums ${clutched ? 'text-amber' : 'text-grey-1'}`}
          >
            {clutched ? 'HELD' : 'OPEN'}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <label
          htmlFor="sens"
          className="font-mono text-[10px] tracking-[0.2em] text-grey-3 uppercase"
        >
          Sensitivity (pot)
        </label>
        <input
          id="sens"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={trainer.sensitivity}
          onChange={(e) => trainer.setSensitivity(Number(e.target.value))}
          className="mt-2 w-full accent-[var(--color-amber)]"
        />
      </div>

      <p className="mt-4 font-mono text-[10px] tracking-[0.18em] text-grey-3 uppercase">
        {GAME_SECTION.clutchHint} · ARROWS TO AIM · ENTER TO FIRE
      </p>
    </div>
  )
}
