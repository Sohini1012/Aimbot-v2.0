import { INSIDE } from '@/content/site'
import { HARDWARE, WALK_ORDER } from '@/content/hardware'
import { SectionHeading } from '../SectionHeading'
import { useWalkPart } from '@/hooks/useWalkPart'

/**
 * Beats 3-6 play in the stage panel beside this column.
 *
 * The component cards step one at a time rather than sitting in a grid: seven
 * cards at once is a wall of text competing with the model for attention, and
 * it gives the walk nothing to do. One card at a time means the copy and the
 * camera are describing the same part at the same moment.
 *
 * §12 — the full list still exists below in the DOM, so a screen reader (and
 * anyone who does not want to scroll through a camera flight) gets every part.
 */
export function Inside() {
  const walk = useWalkPart()
  const walkParts = HARDWARE.filter((h) => h.inWalk)
  const active = walk.id ? walkParts.find((p) => p.id === walk.id) : null

  return (
    <section id="inside" className="relative px-5 sm:px-8">
      <div className="max-w-[620px] py-20 lg:py-28 lg:pl-12">
        <SectionHeading numeral={INSIDE.numeral} title={INSIDE.title} tone="noir" />
        {INSIDE.body.map((p) => (
          <p key={p.slice(0, 32)} className="mb-5 text-grey-1">
            {p}
          </p>
        ))}
      </div>

      {/* The walk. Sticky, so the card stays put while the camera moves. */}
      <div className="sticky top-[52vh] z-10 max-w-[620px] pb-20 lg:top-[28vh] lg:pl-12">
        <div
          className="min-h-[220px] rounded-card-lg border border-[var(--hairline-dark)] bg-[color-mix(in_srgb,var(--color-panel)_92%,transparent)] p-6 backdrop-blur-sm transition-opacity duration-300"
          style={{ opacity: active ? 1 : 0.25 }}
          role="region"
          aria-live="polite"
          aria-label="Component currently shown"
        >
          {active ? (
            <>
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-mono text-[10px] tracking-[0.22em] text-amber uppercase">
                  {active.short}
                </p>
                <p className="font-mono text-[10px] tracking-[0.18em] text-grey-3 tabular-nums">
                  {String(walk.index + 1).padStart(2, '0')} / {String(WALK_ORDER.length).padStart(2, '0')}
                </p>
              </div>
              <h3 className="mt-3 font-display text-xl font-semibold tracking-[-0.02em] text-paper">
                {active.name}
              </h3>
              <p className="mt-3 text-sm text-grey-1">{active.role}</p>
              <p className="mt-3 font-mono text-[10px] leading-relaxed tracking-[0.1em] text-grey-3 uppercase">
                {active.placement}
              </p>
              {active.note && (
                <p className="mt-4 border-t border-[var(--hairline-dark)] pt-4 text-sm text-grey-2 italic">
                  {active.note}
                </p>
              )}
            </>
          ) : (
            <p className="font-mono text-[10px] tracking-[0.2em] text-grey-3 uppercase">
              Keep scrolling — the teardown walks each component in turn
            </p>
          )}
        </div>

        {/* progress pips, so it is obvious how many parts are left */}
        <ol className="mt-4 flex gap-1.5" aria-hidden="true">
          {walkParts.map((p, i) => (
            <li
              key={p.id}
              className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                i === walk.index ? 'bg-amber' : 'bg-[var(--hairline-dark)]'
              }`}
            />
          ))}
        </ol>
      </div>
    </section>
  )
}
