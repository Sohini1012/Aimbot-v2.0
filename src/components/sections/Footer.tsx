import { EVENT, REPO_URL } from '@/content/site'

export function Footer() {
  return (
    <footer className="relative bg-noir px-5 py-16 sm:px-8">
      <div className="spot" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-[1200px] flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-2xl font-semibold tracking-[-0.03em] text-paper">
            AIMBOT v2.0
          </p>
          <p className="mt-2 font-mono text-[10px] tracking-[0.2em] text-grey-3 uppercase">
            {EVENT.team} · {EVENT.college}
          </p>
          <p className="mt-1 font-mono text-[10px] tracking-[0.2em] text-grey-3 uppercase">
            {EVENT.hackathon} · {EVENT.track} · {EVENT.dates}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-chip border border-[var(--hairline-dark)] px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-grey-1 uppercase transition-colors duration-200 hover:border-amber hover:text-amber"
          >
            Repository
          </a>
          <a
            href="#hero"
            className="rounded-chip border border-[var(--hairline-dark)] px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-grey-1 uppercase transition-colors duration-200 hover:border-amber hover:text-amber"
          >
            Back to top
          </a>
        </div>
      </div>
    </footer>
  )
}
