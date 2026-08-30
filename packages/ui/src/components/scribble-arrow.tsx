'use client'
import { arrow, ink, type InkTimeline } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export interface ScribbleArrowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** elements to connect — refs to nodes inside the same positioned container */
  fromRef: React.RefObject<HTMLElement | null>
  toRef: React.RefObject<HTMLElement | null>
  /** curve bend, -0.5..0.5 (sign flips the side) */
  bulge?: number
  color?: string
  seed?: string
  label?: string
  show?: boolean
}

/**
 * "Look here." A hand-drawn arrow between two DOM nodes that re-routes
 * itself when either one moves. Mount it inside a position:relative parent
 * that contains both endpoints.
 */
export function ScribbleArrow({
  fromRef, toRef, bulge = 0.18, color, seed: seedProp, label, show = true, className, style, ...rest
}: ScribbleArrowProps) {
  const seed = useSeed(seedProp)
  const hostRef = React.useRef<HTMLDivElement>(null)
  const [tl, setTl] = React.useState<InkTimeline | null>(null)
  const [mid, setMid] = React.useState<{ x: number; y: number } | null>(null)
  const keyRef = React.useRef('')

  const route = React.useCallback(() => {
    const host = hostRef.current?.offsetParent as HTMLElement | null
    const a = fromRef.current, b = toRef.current
    if (!host || !a || !b) return
    const hb = host.getBoundingClientRect()
    const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect()
    const ca = { x: ra.left - hb.left + ra.width / 2, y: ra.top - hb.top + ra.height / 2 }
    const cb = { x: rb.left - hb.left + rb.width / 2, y: rb.top - hb.top + rb.height / 2 }
    // start/end on the rect edges, not centers
    const shrink = (from: typeof ca, to: typeof ca, r: DOMRect) => {
      const dx = to.x - from.x, dy = to.y - from.y
      const len = Math.hypot(dx, dy) || 1
      const k = (Math.min(r.width, r.height) / 2 + 8) / len
      return { x: from.x + dx * k, y: from.y + dy * k }
    }
    const p1 = shrink(ca, cb, ra)
    const p2 = shrink(cb, ca, rb)
    const key = JSON.stringify([p1.x | 0, p1.y | 0, p2.x | 0, p2.y | 0, bulge])
    if (key === keyRef.current) return
    keyRef.current = key
    setTl(ink(arrow(p1, p2, bulge), { seed, roughness: 0.9, speed: 1.6 }))
    setMid({ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 })
  }, [fromRef, toRef, bulge, seed])

  React.useEffect(() => {
    route()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(route) : null
    if (fromRef.current && ro) ro.observe(fromRef.current)
    if (toRef.current && ro) ro.observe(toRef.current)
    window.addEventListener('resize', route)
    return () => { ro?.disconnect(); window.removeEventListener('resize', route) }
  }, [route, fromRef, toRef])

  return (
    <div ref={hostRef} className={cn('pointer-events-none absolute inset-0', className)} style={style} {...rest}>
      {tl && show && (
        <Ink overlay timeline={tl} color={color ?? 'var(--sui-accent)'} />
      )}
      {label && mid && show && (
        <span
          className="absolute -translate-x-1/2 -translate-y-full font-hand text-lg"
          style={{ left: mid.x, top: mid.y - 6, color: color ?? 'var(--sui-accent)' }}
        >
          {label}
        </span>
      )}
    </div>
  )
}
