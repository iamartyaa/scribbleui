'use client'
import { ellipse, ink, underline, type InkTimeline } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useCalm, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export interface TabItem { value: string; label: React.ReactNode; icon?: React.ReactNode; content?: React.ReactNode }

export interface ScribbleTabsProps {
  items: TabItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  /** 'underline' re-draws a line under the active tab; 'circled' circles it */
  variant?: 'underline' | 'circled'
  seed?: string
  className?: string
}

/**
 * The active mark doesn't slide — the pen lifts (a dotted flight arc shows
 * the hop), flies to the new tab, and draws a fresh mark with a fresh seed.
 * Comes as an underline or a circled tab; icons welcome.
 */
export function ScribbleTabs({ items, value: valueProp, defaultValue, onValueChange, variant = 'underline', seed: seedProp, className }: ScribbleTabsProps) {
  const seed = useSeed(seedProp)
  const calm = useCalm()
  const [internal, setInternal] = React.useState(defaultValue ?? items[0]?.value)
  const value = valueProp ?? internal
  const [gen, setGen] = React.useState(0)
  const [leaving, setLeaving] = React.useState<{ tl: InkTimeline; x: number; y: number } | null>(null)
  const [flight, setFlight] = React.useState<{ tl: InkTimeline } | null>(null)
  const [mark, setMark] = React.useState<{ tl: InkTimeline; x: number; y: number } | null>(null)
  const refs = React.useRef(new Map<string, HTMLButtonElement>())
  const hostRef = React.useRef<HTMLDivElement>(null)

  const select = (v: string) => {
    if (v === value) return
    const host = hostRef.current
    const fromEl = refs.current.get(value)
    const toEl = refs.current.get(v)
    if (mark && !calm && host && fromEl && toEl) {
      setLeaving(mark)
      setTimeout(() => setLeaving(null), 280)
      // the pen's dotted flight between the two tabs
      const hb = host.getBoundingClientRect()
      const f = fromEl.getBoundingClientRect(), t = toEl.getBoundingClientRect()
      const x1 = f.left - hb.left + f.width / 2, x2 = t.left - hb.left + t.width / 2
      const y = f.height + 2
      const dots = []
      const n = 5
      for (let i = 1; i < n; i++) {
        const p = i / n
        const x = x1 + (x2 - x1) * p
        const arcY = y - Math.sin(p * Math.PI) * 16
        dots.push([{ x, y: arcY }, { x: x + 3, y: arcY - 1 }])
      }
      setFlight({ tl: ink(dots, { seed: seed + gen, roughness: 0.6, speed: 3.5, width: 1.6, flightBase: 10 }) })
      setTimeout(() => setFlight(null), 420)
    }
    if (valueProp === undefined) setInternal(v)
    onValueChange?.(v)
    setGen(g => g + 1)
  }

  React.useLayoutEffect(() => {
    const host = hostRef.current
    const el = refs.current.get(value)
    if (!host || !el) return
    const hb = host.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    const s = `${seed}:${gen}`
    if (variant === 'circled') {
      const tl = ink([ellipse(0, 0, r.width / 2 + 8, r.height / 2 + 5, s)], { seed: s, roughness: 1, speed: 2.2, width: 1.8 })
      setMark({ tl, x: r.left - hb.left + r.width / 2, y: r.top - hb.top + r.height / 2 })
    } else {
      const tl = ink([underline(r.width, s)], { seed: s, roughness: 1, speed: 2, width: 2.2 })
      setMark({ tl, x: r.left - hb.left, y: r.height + 4 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, gen, seed, variant])

  const active = items.find(i => i.value === value)
  return (
    <div className={cn('w-full', className)}>
      <div ref={hostRef} role="tablist" className="relative flex flex-wrap gap-1 pb-2.5">
        {items.map(it => (
          <button
            key={it.value}
            ref={el => { if (el) refs.current.set(it.value, el) }}
            role="tab"
            aria-selected={value === it.value}
            onClick={() => select(it.value)}
            onKeyDown={e => {
              const idx = items.findIndex(i => i.value === value)
              if (e.key === 'ArrowRight') select(items[(idx + 1) % items.length].value)
              if (e.key === 'ArrowLeft') select(items[(idx - 1 + items.length) % items.length].value)
            }}
            className={cn(
              'relative z-10 inline-flex cursor-pointer items-center gap-1.5 bg-transparent px-3 py-1 font-body text-sm font-bold',
              value === it.value ? 'text-ink' : 'text-pencil hover:text-ink-soft',
            )}
            style={{ border: 'none' }}
          >
            {it.icon}{it.label}
          </button>
        ))}
        {leaving && (
          <span className="pointer-events-none absolute" style={{ left: leaving.x, top: leaving.y }}>
            <Ink overlay timeline={leaving.tl} erase color="var(--sui-pencil)" rate={2.6} />
          </span>
        )}
        {flight && (
          <span className="pointer-events-none absolute left-0 top-0">
            <Ink overlay timeline={flight.tl} color="var(--sui-pencil)" rate={1.4} />
          </span>
        )}
        {mark && (
          <span className="pointer-events-none absolute" style={{ left: mark.x, top: mark.y }}>
            <Ink overlay timeline={mark.tl} color="var(--sui-accent)" />
          </span>
        )}
      </div>
      {active?.content && (
        <div role="tabpanel" className="pt-3 font-body text-sm text-ink-soft">{active.content}</div>
      )}
    </div>
  )
}
