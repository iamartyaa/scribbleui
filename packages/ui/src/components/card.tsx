'use client'
import { ink, line, rect, sampleQuad, type InkTimeline, type Stroke } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useSeed, vary } from '@/lib/ink-extra'
import { cn } from '@/lib/utils'

export type Fastener = 'pin' | 'tape' | 'clip' | 'fold' | 'none'

export interface ScribbleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** what holds the scrap to the board */
  fastener?: Fastener
  /** where the fastener sits */
  fastenerAlign?: 'left' | 'center' | 'right'
  /** tilt in degrees; omit for a seeded 0.5–2° hand placement */
  angle?: number
  /** drawn-shadow depth 0–3 (hatch density + lift distance) */
  depth?: 0 | 1 | 2 | 3
  seed?: string
  interactive?: boolean
}

/**
 * A scrap pinned to the board. Angle, fastener (pin, tape, paperclip,
 * corner fold), alignment, and hatched-shadow depth are all yours to place —
 * and the shadow is drawn, never blurred.
 */
export function ScribbleCard({
  fastener = 'pin', fastenerAlign = 'center', angle, depth = 1,
  seed: seedProp, interactive, className, children, style, ...rest
}: ScribbleCardProps) {
  const seed = useSeed(seedProp)
  const rot = angle ?? vary(seed, -1.8, 1.8)
  const tapeRot = vary(seed + 't', -7, 7)
  const [size, setSize] = React.useState<{ w: number; h: number } | null>(null)
  const [hover, setHover] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const m = () => {
      const w = el.offsetWidth, h = el.offsetHeight
      setSize(p => (p && Math.abs(p.w - w) < 1 && Math.abs(p.h - h) < 1) ? p : { w, h })
    }
    m()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(m) : null
    ro?.observe(el)
    return () => ro?.disconnect()
  }, [])

  const borderTl: InkTimeline | null = React.useMemo(
    () => size ? ink(rect(size.w - 2, size.h - 2, seed), { seed, roughness: 1, speed: 3.6, width: 1.6 }) : null,
    [size, seed],
  )
  const hatchTl: InkTimeline | null = React.useMemo(() => {
    if (!size || depth === 0) return null
    const strokes: Stroke[] = []
    const n = (hover ? 3 : 0) + depth * 3
    for (let i = 0; i < n; i++) {
      const off = 3 + i * (7 - depth)
      strokes.push(line(size.w * 0.22 + off, size.h + off * 0.5, size.w + off * 0.6, size.h * 0.35 + off))
    }
    return ink(strokes, { seed: seed + ':h' + hover, roughness: 0.9, speed: 6, width: 1.1, flightBase: 6 })
  }, [size, seed, hover, depth])

  const clipTl: InkTimeline | null = React.useMemo(() => {
    if (fastener !== 'clip') return null
    // a paperclip: two nested U-loops
    const outer = [...sampleQuad({ x: 0, y: 18 }, { x: 0, y: -4 }, { x: 7, y: -4 }, 8), ...sampleQuad({ x: 7, y: -4 }, { x: 14, y: -4 }, { x: 14, y: 22 }, 8)]
    const inner = [...sampleQuad({ x: 14, y: 22 }, { x: 14, y: 30 }, { x: 8, y: 28 }, 6), ...sampleQuad({ x: 8, y: 28 }, { x: 4, y: 26 }, { x: 4, y: 4 }, 8)]
    return ink([outer, inner], { seed: seed + ':clip', roughness: 0.7, speed: 2.4, width: 1.8 })
  }, [fastener, seed])
  const foldTl: InkTimeline | null = React.useMemo(() => {
    if (fastener !== 'fold' || !size) return null
    return ink([
      [{ x: size.w - 22, y: 0 }, { x: size.w - 2, y: 20 }],
      [{ x: size.w - 22, y: 0 }, { x: size.w - 20, y: 16 }, { x: size.w - 2, y: 20 }],
    ], { seed: seed + ':fold', roughness: 0.8, speed: 2, width: 1.5 })
  }, [fastener, size, seed])

  const alignX = fastenerAlign === 'left' ? '18%' : fastenerAlign === 'right' ? '82%' : '50%'
  const lift = 1 + depth
  return (
    <div className="relative inline-block" style={{ transform: `rotate(${rot}deg)` }}>
      {hatchTl && (
        <span className="pointer-events-none absolute -z-10" style={{ left: lift, top: lift }}>
          <Ink overlay timeline={hatchTl} color="var(--sui-pencil)" style={{ opacity: 0.5 }} rate={3} />
        </span>
      )}
      <div
        ref={ref}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        className={cn('relative bg-card p-5 transition-transform duration-150', hover && '-translate-y-1', interactive && 'cursor-pointer', className)}
        style={style}
        {...rest}
      >
        {borderTl && <Ink overlay timeline={borderTl} draw={false} color="var(--sui-ink)" className="absolute" />}
        {fastener === 'pin' && (
          <span aria-hidden className="absolute -top-1.5 size-3 -translate-x-1/2 rounded-full shadow-sm" style={{ left: alignX, background: 'var(--sui-danger)' }} />
        )}
        {fastener === 'tape' && (
          <span aria-hidden className="absolute -top-2 h-4 w-14" style={{ left: alignX, background: 'var(--sui-hl)', opacity: 0.45, transform: `translateX(-50%) rotate(${tapeRot}deg)` }} />
        )}
        {clipTl && (
          <span aria-hidden className="absolute -top-3 -translate-x-1/2" style={{ left: alignX }}>
            <Ink timeline={clipTl} draw={false} color="var(--sui-ink-soft)" />
          </span>
        )}
        {foldTl && <Ink overlay timeline={foldTl} draw={false} color="var(--sui-pencil)" className="absolute" />}
        {children}
      </div>
    </div>
  )
}
