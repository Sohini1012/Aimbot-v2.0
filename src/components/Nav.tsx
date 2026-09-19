import { useEffect, useState } from 'react'
import { SECTIONS } from '@/content/site'

/** §10 — fixed mono nav with section numerals and an amber active indicator. */
export function Nav() {
  const [active, setActive] = useState<string>('hero')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    )

    for (const s of SECTIONS) {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <nav
      aria-label="Section navigation"
      className="fixed top-0 right-0 left-0 z-50 border-b border-[var(--color-line)] bg-[color-mix(in_srgb,var(--color-paper)_85%,transparent)] backdrop-blur-md"
    >
      <div className="mx-auto flex h-[52px] max-w-[1400px] items-center justify-between gap-4 px-5 sm:px-8">
        <a
          href="#hero"
          className="font-mono text-[11px] font-medium tracking-[0.2em] text-ink uppercase"
        >
          AIMBOT<span className="text-amber-text">·</span>v2.0
        </a>

        <ul className="hidden items-center gap-0.5 lg:flex">
          {SECTIONS.slice(1).map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={active === s.id ? 'true' : undefined}
                className={`rounded-chip px-2 py-2 font-mono text-[10px] whitespace-nowrap tracking-[0.1em] uppercase transition-colors duration-200 xl:tracking-[0.16em] ${
                  active === s.id
                    ? 'text-amber-text'
                    : 'text-dim hover:text-ink'
                }`}
              >
                <span className="mr-1.5 hidden opacity-60 xl:inline">{s.numeral}</span>
                {s.title}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="https://github.com/Sohini1012/Aimbot-v2.0"
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-chip border border-[var(--color-line-strong)] px-3 py-2 font-mono text-[11px] tracking-[0.18em] text-dim uppercase transition-colors duration-200 hover:border-amber hover:text-amber-text"
        >
          Repo
        </a>
      </div>
    </nav>
  )
}
