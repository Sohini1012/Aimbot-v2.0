import { useEffect, useRef } from 'react'
import { labelStore } from '@/scene/labelStore'
import { HARDWARE } from '@/content/hardware'
import type { PartId } from '@/content/types'

/** Must match LABELLED in LabelProjector — one slot per part, allocated once. */
const SLOTS: readonly PartId[] = [
  'pico',
  'imu',
  'omron',
  'buttons',
  'pot',
  'joystick',
  'pcb',
  'wires',
  'usb',
]

interface SlotRefs {
  group: SVGGElement | null
  line: SVGPolylineElement | null
  dot: SVGCircleElement | null
  text: HTMLSpanElement | null
}

/**
 * §8 beat 3 — thin amber leader lines joining each part to a floating mono
 * label.
 *
 * The DOM is allocated once, as a fixed pool of nine slots, and the rAF loop
 * writes attributes straight onto those nodes.
 *
 * The first version of this used setState inside the loop with a position-keyed
 * equality check. Because the projected positions change every frame, the key
 * always differed, so it re-rendered the SVG and all nine spans sixty times a
 * second and dropped the page to roughly 1fps. Attribute writes on retained
 * nodes cost nothing by comparison and React never re-renders at all.
 */
export function LabelOverlay() {
  const slots = useRef<SlotRefs[]>(SLOTS.map(() => ({ group: null, line: null, dot: null, text: null })))
  const raf = useRef(0)

  useEffect(() => {
    const loop = () => {
      const items = labelStore.items

      SLOTS.forEach((id, i) => {
        const slot = slots.current[i]
        if (!slot) return
        const item = items.find((it) => it.id === id)

        if (!item || item.opacity <= 0.01) {
          if (slot.group) slot.group.style.opacity = '0'
          if (slot.text) slot.text.style.opacity = '0'
          return
        }

        const leftSide = item.lx < 0.5
        const elbowX = leftSide ? item.lx * 100 + 4 : item.lx * 100 - 4
        const opacity = String(item.opacity)

        if (slot.group) slot.group.style.opacity = opacity
        if (slot.line) {
          slot.line.setAttribute(
            'points',
            `${item.ax * 100},${item.ay * 100} ${elbowX},${item.ly * 100} ${item.lx * 100},${item.ly * 100}`,
          )
          slot.line.setAttribute('stroke', item.active ? '#f5a623' : '#f5a62399')
          slot.line.setAttribute('stroke-width', item.active ? '0.28' : '0.16')
        }
        if (slot.dot) {
          slot.dot.setAttribute('cx', String(item.ax * 100))
          slot.dot.setAttribute('cy', String(item.ay * 100))
          slot.dot.setAttribute('r', item.active ? '0.7' : '0.45')
        }
        if (slot.text) {
          slot.text.style.opacity = opacity
          slot.text.style.left = `${item.lx * 100}%`
          slot.text.style.top = `${item.ly * 100}%`
          slot.text.style.transform = `translate(${leftSide ? '0' : '-100%'}, -50%)`
          slot.text.style.color = item.active ? 'var(--color-amber)' : 'var(--color-grey-2)'
        }
      })

      raf.current = requestAnimationFrame(loop)
    }

    raf.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf.current)
  }, [])

  return (
    <>
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {SLOTS.map((id, i) => (
          <g
            key={id}
            opacity={0}
            ref={(el) => {
              const slot = slots.current[i]
              if (slot) slot.group = el
            }}
          >
            <polyline
              fill="none"
              stroke="#f5a62399"
              strokeWidth={0.16}
              vectorEffect="non-scaling-stroke"
              ref={(el) => {
                const slot = slots.current[i]
                if (slot) slot.line = el
              }}
            />
            <circle
              r={0.45}
              fill="#f5a623"
              ref={(el) => {
                const slot = slots.current[i]
                if (slot) slot.dot = el
              }}
            />
          </g>
        ))}
      </svg>

      {SLOTS.map((id, i) => (
        <span
          key={id}
          className="pointer-events-none absolute font-mono text-[9px] tracking-[0.16em] whitespace-nowrap uppercase sm:text-[10px]"
          style={{ opacity: 0 }}
          ref={(el) => {
            const slot = slots.current[i]
            if (slot) slot.text = el
          }}
        >
          {HARDWARE.find((h) => h.id === id)?.short ?? id}
        </span>
      ))}
    </>
  )
}
