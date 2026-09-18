import { HERO, STATS, EVENT } from '@/content/site'
import { StatChip } from '../StatChip'

/** §8 beats 0–2 live over the pinned canvas. The text must paint before the
 *  3D is ready (§11), so nothing here waits on Suspense. */
export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col justify-center px-5 pt-28 pb-16 sm:px-8"
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <p className="font-mono text-[11px] tracking-[0.25em] text-amber uppercase">
          {HERO.eyebrow}
        </p>

        <h1 className="mt-6 font-display text-[clamp(3rem,12vw,9rem)] leading-[0.92] font-bold tracking-[-0.045em] text-paper">
          {HERO.title}
        </h1>

        <p className="mt-8 max-w-xl text-lg text-grey-1 sm:text-xl">{HERO.pitch}</p>

        <div className="mt-12 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
          {STATS.map((s) => (
            <StatChip key={s.label} value={s.value} label={s.label} />
          ))}
        </div>

        <div className="mt-16 flex items-center gap-4">
          <span className="font-mono text-[10px] tracking-[0.3em] text-grey-3 uppercase">
            {HERO.scrollCue}
          </span>
          <span
            aria-hidden="true"
            className="h-px w-16 bg-gradient-to-r from-[var(--amber-60)] to-transparent"
          />
        </div>

        <p className="mt-20 font-mono text-[10px] tracking-[0.2em] text-grey-3 uppercase">
          {EVENT.team} · {EVENT.college} · {EVENT.phase}
        </p>
      </div>
    </section>
  )
}
