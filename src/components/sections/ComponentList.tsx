import { HARDWARE } from '@/content/hardware'
import { SectionHeading } from '../SectionHeading'

/**
 * The complete parts list, every component labelled, on one page and after the
 * walk has finished.
 *
 * The walk shows one part at a time, which is right for pacing but wrong for
 * anyone who wants the whole picture at once — or who is reading with a screen
 * reader and is not going to scroll through seven camera flights to collect it.
 */
export function ComponentList() {
  return (
    <section id="parts" className="relative bg-paper px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading numeral="02b" title="Every part, in one place" />

        <ul className="grid gap-px overflow-hidden rounded-card-lg border border-[var(--color-line)] bg-[var(--color-line)] sm:grid-cols-2 lg:grid-cols-3">
          {HARDWARE.map((part) => (
            <li key={part.id} className="flex flex-col bg-paper p-6">
              <p className="font-mono text-[10px] tracking-[0.22em] text-amber-text uppercase">
                {part.short}
              </p>
              <h3 className="mt-3 font-display text-base font-semibold tracking-[-0.02em] text-ink">
                {part.name}
              </h3>
              <p className="mt-2 flex-1 text-sm text-muted">{part.role}</p>
              <p className="mt-4 border-t border-[var(--color-line)] pt-3 font-mono text-[10px] leading-relaxed tracking-[0.1em] text-dim uppercase">
                {part.placement}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
