import { BUILD_LOG, BOM, BOM_TOTAL, BOM_TOTAL_NOTE } from '@/content/site'
import { SectionHeading } from '../SectionHeading'

const SOURCING_LABEL: Record<string, string> = {
  'e-waste': 'E-WASTE',
  bought: 'BOUGHT',
  reused: 'REUSED',
}

export function BuildLog() {
  return (
    <section id="build" className="relative bg-paper px-5 py-28 sm:px-8 sm:py-36">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading numeral={BUILD_LOG.numeral} title={BUILD_LOG.title} />

        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            {BUILD_LOG.body.map((p) => (
              <p key={p.slice(0, 24)} className="mb-5 text-muted">
                {p}
              </p>
            ))}

            <div className="rounded-card-lg border border-[var(--color-line-strong)] bg-[var(--amber-10)] p-5">
              <p className="text-sm text-muted">{BUILD_LOG.eWasteNote}</p>
            </div>

            <ol className="mt-8 space-y-0">
              {BUILD_LOG.timeline.map((row) => (
                <li
                  key={row.at}
                  className="flex gap-5 border-t border-[var(--color-line)] py-4 last:border-b"
                >
                  <span className="shrink-0 font-mono text-[11px] tracking-[0.18em] text-amber-text tabular-nums">
                    {row.at}
                  </span>
                  <span className="text-sm text-muted">{row.what}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <h3 className="mb-4 font-mono text-[11px] tracking-[0.22em] text-dim uppercase">
              Bill of materials
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">
                  Bill of materials for AIMBOT v2.0, with quantities, sourcing and cost in rupees
                </caption>
                <thead>
                  <tr className="border-b border-[var(--color-line-strong)]">
                    <th
                      scope="col"
                      className="py-3 pr-3 font-mono text-[10px] tracking-[0.18em] text-dim uppercase"
                    >
                      Item
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-2 text-right font-mono text-[10px] tracking-[0.18em] text-dim uppercase"
                    >
                      Qty
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-2 font-mono text-[10px] tracking-[0.18em] text-dim uppercase"
                    >
                      Source
                    </th>
                    <th
                      scope="col"
                      className="py-3 pl-2 text-right font-mono text-[10px] tracking-[0.18em] text-dim uppercase"
                    >
                      ₹
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {BOM.map((row) => (
                    <tr key={row.item} className="border-b border-[var(--color-line)]">
                      <td className="py-3 pr-3 text-sm text-ink">
                        {row.item}
                        {row.note && (
                          <span className="mt-1 block text-xs text-dim">{row.note}</span>
                        )}
                      </td>
                      <td className="px-2 py-3 text-right font-mono text-xs text-muted tabular-nums">
                        {row.qty}
                      </td>
                      <td className="px-2 py-3 font-mono text-[10px] tracking-[0.12em] text-dim">
                        {SOURCING_LABEL[row.sourcing]}
                      </td>
                      <td className="py-3 pl-2 text-right font-mono text-xs text-ink tabular-nums">
                        {row.cost === null ? '—' : row.cost === 0 ? '0' : row.cost}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th
                      scope="row"
                      colSpan={3}
                      className="py-4 pr-3 text-left font-mono text-[11px] tracking-[0.18em] text-ink uppercase"
                    >
                      Total spent
                    </th>
                    <td className="py-4 pl-2 text-right font-display text-xl font-semibold text-ink tabular-nums">
                      ₹{BOM_TOTAL}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p className="mt-4 text-sm text-dim">{BOM_TOTAL_NOTE}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
