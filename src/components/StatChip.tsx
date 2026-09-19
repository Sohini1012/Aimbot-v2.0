interface Props {
  value: string
  label: string
}

export function StatChip({ value, label }: Props) {
  return (
    <div className="rounded-card border border-[var(--hairline-dark)] bg-panel px-3 py-3">
      <p className="font-display text-lg font-semibold tracking-[-0.02em] text-paper whitespace-nowrap">
        {value}
      </p>
      <p className="mt-1 font-mono text-[9px] leading-tight uppercase tracking-[0.14em] text-grey-3">
        {label}
      </p>
    </div>
  )
}
