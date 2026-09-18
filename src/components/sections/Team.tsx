import { TEAM, EVENT } from '@/content/site'
import { SectionHeading } from '../SectionHeading'
import { Eyebrow } from '../Eyebrow'

export function Team() {
  return (
    <section id="team" className="relative bg-paper px-5 py-28 sm:px-8 sm:py-36">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading numeral="06" title={EVENT.team} />

        <Eyebrow className="mb-8">
          {EVENT.college} · {EVENT.hackathon} · {EVENT.track}
        </Eyebrow>

        <ul className="grid gap-4 sm:grid-cols-3">
          {TEAM.map((m) => (
            <li
              key={m.name}
              className="rounded-card-lg border border-[var(--color-line)] bg-white/40 p-6"
            >
              <p className="font-display text-xl font-semibold tracking-[-0.02em] text-ink">
                {m.name}
              </p>
              <p className="mt-2 font-mono text-[11px] tracking-[0.12em] text-dim uppercase">
                {m.role}
              </p>
            </li>
          ))}
        </ul>

        <dl className="mt-12 grid gap-6 border-t border-[var(--color-line)] pt-8 sm:grid-cols-3">
          <div>
            <dt className="font-mono text-[10px] tracking-[0.2em] text-dim uppercase">Venue</dt>
            <dd className="mt-1 text-ink">{EVENT.venue}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] tracking-[0.2em] text-dim uppercase">Dates</dt>
            <dd className="mt-1 text-ink">{EVENT.dates}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] tracking-[0.2em] text-dim uppercase">Format</dt>
            <dd className="mt-1 text-ink">{EVENT.duration}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
