interface Props {
  numeral: string
  title: string
  tone?: 'paper' | 'noir'
}

/** §5 — the portfolio pattern: mono numeral eyebrow above a tight Inter heading. */
export function SectionHeading({ numeral, title, tone = 'paper' }: Props) {
  const titleColor = tone === 'noir' ? 'text-paper' : 'text-ink'
  const numeralColor = tone === 'noir' ? 'text-amber' : 'text-amber-text'

  return (
    <header className="mb-10">
      <p
        className={`font-mono text-[11px] uppercase tracking-[0.25em] ${numeralColor} mb-4`}
      >
        {numeral}
      </p>
      <h2
        className={`font-display text-4xl leading-[1.05] font-semibold tracking-[-0.035em] sm:text-5xl lg:text-6xl ${titleColor}`}
      >
        {title}
      </h2>
    </header>
  )
}
