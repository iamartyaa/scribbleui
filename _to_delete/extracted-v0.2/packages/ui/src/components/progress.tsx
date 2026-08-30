'use client'
import { bowedLine, ink, rect, tick, type InkTimeline } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export interface ScribbleProgressProps {
  /** 0..100 */
  value: number
  label?: string
  seed?: string
  className?: string
}

/**
 * The destination is drawn first: an empty checkbox waits at the end of a
 * pencil guide. Progress is ink advancing toward it — and when the line
 * arrives, the tick flicks. The payoff is the point.
 */
export function ScribbleProgress({ value, label, seed: seedProp, className }: ScribbleProgressProps) {
  const seed = useSeed(seedProp)
  const clamped = Math.max(0, Math.min(100, value))
  const [w, setW] = React.useState(220)
  const hostRef = React.useRef<HTMLDivElement>(null)
  const BOX = 20
  const trackW = w - BOX - 12

  React.useLayoutEffect(() => {
    const el = hostRef.current
    if (!el) return
    const m = () => setW(p => Math.abs(p - el.clientWidth) < 1 ? p : el.clientWidth)
    m()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(m) : null
    ro?.observe(el)
    return () => ro?.disconnect()
  }, [])

  const guideTl = React.useMemo(
    () => ink([bowedLine(0, BOX / 2, trackW, BOX / 2, 0.015, seed)], { seed, roughness: 0.7, speed: 4, width: 1.2 }),
    [trackW, seed],
  )
  const inkTl = React.useMemo(
    () => ink([bowedLine(0, BOX / 2, trackW, BOX / 2, 0.02, seed + 'i')], { seed: seed + ':i', roughness: 0.9, speed: 4, width: 2.8 }),
    [trackW, seed],
  )
  const boxTl = React.useMemo(
    () => ink(rect(BOX, BOX, seed + 'b'), { seed: seed + ':b', roughness: 1, speed: 2.6, width: 1.7 }),
    [seed],
  )
  const tickTl = React.useMemo(
    () => ink([tick(BOX * 0.9).map(p => ({ x: p.x + 3, y: p.y + 2 }))], { seed: seed + ':t', roughness: 0.9, speed: 1.7, width: 2.5 }),
    [seed],
  )

  return (
    <div
      ref={hostRef}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('relative inline-block w-60', className)}
      style={{ height: BOX + 6 }}
    >
      <Ink overlay timeline={guideTl} draw={false} color="var(--sui-pencil)" className="absolute" style={{ opacity: 0.6 }} />
      <Ink overlay timeline={inkTl} progress={clamped / 100} color="var(--sui-accent)" className="absolute" />
      <span className="absolute" style={{ left: trackW + 10, top: 0 }}>
        <Ink overlay timeline={boxTl} draw={false} color="var(--sui-ink)" />
        {clamped >= 100 && <Ink overlay timeline={tickTl} color="var(--sui-accent)" className="absolute" />}
      </span>
      <span className="pointer-events-none absolute -top-5 font-hand text-base text-accent" style={{ left: Math.max(0, (clamped / 100) * trackW - 12) }}>
        {Math.round(clamped)}%
      </span>
    </div>
  )
}
