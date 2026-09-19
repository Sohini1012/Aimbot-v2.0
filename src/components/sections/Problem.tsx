import { PROBLEM } from '@/content/site'
import { SectionHeading } from '../SectionHeading'
import { Bullets } from '../Bullets'

export function Problem() {
  return (
    <section id="problem" className="relative bg-paper px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading numeral={PROBLEM.numeral} title={PROBLEM.title} />
          <p className="font-hand text-2xl text-amber-text">{PROBLEM.annotation}</p>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <p className="mb-6 text-lg text-ink">{PROBLEM.lead}</p>
          <Bullets points={PROBLEM.points} />
        </div>
      </div>
    </section>
  )
}
