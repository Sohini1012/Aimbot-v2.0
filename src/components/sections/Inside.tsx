import { INSIDE } from '@/content/site'
import { HARDWARE } from '@/content/hardware'
import { SectionHeading } from '../SectionHeading'

/**
 * Beats 3-5 play behind this section, so it stays transparent and the copy
 * scrolls over the exploded model.
 *
 * §12 — every part's name, role and placement exists here as real DOM text.
 * A screen reader gets the whole teardown without the canvas.
 */
export function Inside() {
  return (
    <section id="inside" className="relative px-5 sm:px-8">
      <div className="mx-auto max-w-[1200px] py-28 sm:py-36">
        <div className="max-w-xl">
          <SectionHeading numeral={INSIDE.numeral} title={INSIDE.title} tone="noir" />
          {INSIDE.body.map((p) => (
            <p key={p.slice(0, 32)} className="mb-5 text-grey-1">
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* The component walk. Each card pins beside its part as the camera
          flies to it; they are ordinary DOM so the content survives without
          the 3D. */}
      <div className="mx-auto max-w-[1200px] pb-32">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HARDWARE.filter((h) => h.inWalk).map((part) => (
            <li
              key={part.id}
              id={`part-${part.id}`}
              className="rounded-card-lg border border-[var(--hairline-dark)] bg-[color-mix(in_srgb,var(--color-panel)_88%,transparent)] p-6 backdrop-blur-sm"
            >
              <p className="font-mono text-[10px] tracking-[0.22em] text-amber uppercase">
                {part.short}
              </p>
              <h3 className="mt-3 font-display text-lg font-semibold tracking-[-0.02em] text-paper">
                {part.name}
              </h3>
              <p className="mt-3 text-sm text-grey-1">{part.role}</p>
              <p className="mt-3 font-mono text-[10px] leading-relaxed tracking-[0.1em] text-grey-3 uppercase">
                {part.placement}
              </p>
              {part.note && (
                <p className="mt-4 border-t border-[var(--hairline-dark)] pt-4 text-sm text-grey-2 italic">
                  {part.note}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
