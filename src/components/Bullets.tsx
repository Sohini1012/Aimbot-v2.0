interface Props {
  points: readonly string[]
  tone?: 'paper' | 'noir'
}

/** Tight bulleted facts. Amber marker, one line each where possible. */
export function Bullets({ points, tone = 'paper' }: Props) {
  const text = tone === 'noir' ? 'text-grey-1' : 'text-muted'
  return (
    <ul className="space-y-3">
      {points.map((p) => (
        <li key={p.slice(0, 28)} className={`flex gap-3 ${text}`}>
          <span
            aria-hidden="true"
            className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-amber"
          />
          <span className="text-[0.95rem] leading-relaxed">{p}</span>
        </li>
      ))}
    </ul>
  )
}
