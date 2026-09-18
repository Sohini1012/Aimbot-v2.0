import { FIRMWARE_PIPELINE, WHY_NOT_WIFI, ONE_EURO_SNIPPET, CLUTCH_SNIPPET } from '@/content/firmware'
import { SectionHeading } from '../SectionHeading'

function Code({ children, label }: { children: string; label: string }) {
  return (
    <figure className="overflow-hidden rounded-card-lg border border-[var(--hairline-dark)] bg-noir">
      <figcaption className="border-b border-[var(--hairline-dark)] px-5 py-3 font-mono text-[10px] tracking-[0.2em] text-grey-3 uppercase">
        {label}
      </figcaption>
      <div className="overflow-x-auto">
        <pre className="p-5 font-mono text-[12px] leading-relaxed text-grey-1">
          <code>{children}</code>
        </pre>
      </div>
    </figure>
  )
}

export function Firmware() {
  return (
    <section id="firmware" className="relative bg-paper px-5 py-28 sm:px-8 sm:py-36">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading numeral="03" title="What happens between your hand and the cursor" />

        <ol className="mb-16 grid gap-px overflow-hidden rounded-card-lg border border-[var(--color-line)] bg-[var(--color-line)] sm:grid-cols-2 lg:grid-cols-4">
          {FIRMWARE_PIPELINE.map((stage) => (
            <li key={stage.index} className="bg-paper p-6">
              <p className="font-mono text-[10px] tracking-[0.22em] text-amber-text uppercase">
                {String(stage.index).padStart(2, '0')}
              </p>
              <h3 className="mt-3 font-display text-base font-semibold tracking-[-0.02em] text-ink">
                {stage.label}
              </h3>
              <p className="mt-2 text-sm text-muted">{stage.detail}</p>
            </li>
          ))}
        </ol>

        <div className="grid gap-8 lg:grid-cols-2">
          <Code label="1 Euro filter — the accessibility feature">{ONE_EURO_SNIPPET}</Code>
          <div className="space-y-8">
            <Code label="The clutch">{CLUTCH_SNIPPET}</Code>
            <div className="rounded-card-lg border border-[var(--color-line-strong)] bg-[var(--amber-10)] p-6">
              <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink">
                {WHY_NOT_WIFI.heading}
              </h3>
              <p className="mt-3 text-muted">{WHY_NOT_WIFI.body}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
