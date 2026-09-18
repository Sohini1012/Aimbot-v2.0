import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  tone?: 'paper' | 'noir'
  className?: string
}

export function Eyebrow({ children, tone = 'paper', className = '' }: Props) {
  const color = tone === 'noir' ? 'text-grey-3' : 'text-dim'
  return (
    <p
      className={`font-mono text-[11px] uppercase tracking-[0.25em] ${color} ${className}`}
    >
      {children}
    </p>
  )
}
