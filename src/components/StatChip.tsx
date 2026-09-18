interface Props {
  value: string
  label: string
}

export function StatChip({ value, label }: Props) {
  return (
    <div className="rounded-card border border-[var(--hairline-dark)] bg-panel px-5 py-4">
      <p className="font-display text-2xl font-semibold tracking-[-0.02em] text-paper">
        {value}
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-grey-3">
        {label}
      </p>
    </div>
  )
}
