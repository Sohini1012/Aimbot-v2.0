import { HERO, STATS, EVENT } from '@/content/site'
import { StatChip } from '../StatChip'

/** §8 beats 0–2 live over the pinned canvas. The text must paint before the
 *  3D is ready (§11), so nothing here waits on Suspense. */
export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[54vh] flex-col justify-center px-5 py-10 sm:px-8 lg:min-h-screen lg:py-16 lg:pl-12"
    >
      <div className="w-full max-w-[620px]">
        <p className="font-mono text-[11px] tracking-[0.25em] text-amber uppercase">
          {HERO.eyebrow}
        </p>

        <h1 className="mt-6 font-display text-[clamp(2.1rem,4.4vw,4.4rem)] leading-[0.92] font-bold tracking-[-0.045em] text-paper">
          {HERO.title}
        </h1>

        <p className="mt-6 max-w-lg text-base text-grey-1 sm:text-lg">{HERO.pitch}</p>

        <div className="mt-8 grid grid-cols-3 gap-2">
          {STATS.map((s) => (
            <StatChip key={s.label} value={s.value} label={s.label} />
          ))}
        </div>

        <div className="mt-12 flex items-center gap-4">
          <span className="font-mono text-[10px] tracking-[0.3em] text-grey-3 uppercase">
            {HERO.scrollCue}
          </span>
          <span
            aria-hidden="true"
            className="h-px w-16 bg-gradient-to-r from-[var(--amber-60)] to-transparent"
          />
        </div>

        <p className="mt-12 font-mono text-[10px] tracking-[0.2em] text-grey-3 uppercase">
          {EVENT.team} · {EVENT.college} · {EVENT.phase}
        </p>
      </div>
    </section>
  )
}
