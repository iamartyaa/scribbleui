'use client'
import { ink, type InkTimeline, type Pt } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useSeed, vary } from '@/lib/ink-extra'
import { cn } from '@/lib/utils'

export interface DockItem { value: string; icon: React.ReactNode; label: string }

export interface ScribbleDockProps {
  items: DockItem[]
  active?: string
  onSelect?: (v: string) => void
  seed?: string
  className?: string
}

/**
 * The pencil-case dock: sticker icons on a drawn shelf that fisheye-magnify
 * toward your pointer — and the shelf line itself SAGS under the weight of
 * the hovered sticker, redrawn like a bending plank. Labels arrive on tiny
 * paper scraps; clicking makes a sticker hop.
 */
export function ScribbleDock({ items, active, onSelect, seed: seedProp, className }: ScribbleDockProps) {
  const seed = useSeed(seedProp)
  const [px, setPx] = React.useState<number | null>(null) // pointer x relative to shelf
  const [hover, setHover] = React.useState<string | null>(null)
  const [hopping, setHopping] = React.useState<string | null>(null)
  const [w, setW] = React.useState(0)
  const hostRef = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    const el = hostRef.current
    if (el) setW(el.clientWidth)
  }, [items.length])

  const shelfTl: InkTimeline | null = React.useMemo(() => {
    if (!w) return null
    const pts: Pt[] = []
    for (let x = 0; x <= w; x += 6) {
      // gaussian sag under the pointer
      const sag = px === null ? 0 : 7 * Math.exp(-((x - px) ** 2) / (2 * 42 ** 2))
      pts.push({ x, y: sag })
    }
    return ink([pts], { seed: seed + (px === null ? '' : Math.round(px / 14)), roughness: 0.7, speed: 6, width: 2 })
  }, [w, px, seed])

  const scale = (x: number) => {
    if (px === null) return 1
    const d = Math.abs(x - px)
    return 1 + 0.45 * Math.exp(-(d ** 2) / (2 * 52 ** 2))
  }

  const n = items.length
  const slot = w / Math.max(1, n)

  return (
    <div
      ref={hostRef}
      className={cn('relative inline-flex w-72 flex-col items-stretch', className)}
      onPointerMove={e => {
        const r = hostRef.current!.getBoundingClientRect()
        setPx(e.clientX - r.left)
      }}
      onPointerLeave={() => { setPx(null); setHover(null) }}
    >
      <div className="flex h-14 items-end justify-around">
        {items.map((it, i) => {
          const cx = slot * (i + 0.5)
          const s = scale(cx)
          const tilt = vary(seed + it.value, -6, 6)
          const isHover = hover === it.value
          return (
            <button
              key={it.value}
              aria-label={it.label}
              onPointerEnter={() => setHover(it.value)}
              onClick={() => {
                onSelect?.(it.value)
                setHopping(it.value)
                setTimeout(() => setHopping(h => h === it.value ? null : h), 420)
              }}
              className="relative cursor-pointer bg-transparent p-1 text-2xl"
              style={{
                border: 'none',
                transform: `translateY(${hopping === it.value ? -16 : -(s - 1) * 12}px) scale(${s}) rotate(${isHover ? tilt : 0}deg)`,
                transition: 'transform 160ms ease-out',
                transformOrigin: 'bottom center',
              }}
            >
              <span aria-hidden>{it.icon}</span>
              {isHover && (
                <span
                  className="absolute -top-8 left-1/2 whitespace-nowrap bg-card px-2 py-0.5 font-hand text-sm text-ink shadow-[2px_2px_0_var(--sui-shadow)]"
                  style={{ border: '1.2px solid var(--sui-ink)', transform: `translateX(-50%) rotate(${tilt / 2}deg)` }}
                >{it.label}</span>
              )}
              {active === it.value && (
                <span className="absolute -bottom-3 left-1/2 size-1.5 -translate-x-1/2 rounded-full" style={{ background: 'var(--sui-accent)' }} />
              )}
            </button>
          )
        })}
      </div>
      <div className="relative h-4">
        {shelfTl && <Ink overlay timeline={shelfTl} draw={false} color="var(--sui-ink)" className="absolute left-0 top-0" />}
      </div>
    </div>
  )
}
