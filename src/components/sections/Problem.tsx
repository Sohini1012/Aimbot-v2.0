import { PROBLEM } from '@/content/site'
import { SectionHeading } from '../SectionHeading'

export function Problem() {
  return (
    <section id="problem" className="relative bg-paper px-5 py-28 sm:px-8 sm:py-36">
      <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading numeral={PROBLEM.numeral} title={PROBLEM.title} />
          <p className="font-hand text-2xl text-amber-text">{PROBLEM.annotation}</p>
        </div>

        <div className="space-y-6 lg:col-span-6 lg:col-start-7">
          {PROBLEM.body.map((p) => (
            <p key={p.slice(0, 32)} className="text-muted">
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
