'use client'
import { bowedLine, ink, type InkTimeline } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useCalm, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export interface ScribbleMarqueeProps {
  items: React.ReactNode[]
  /** px per second */
  speed?: number
  seed?: string
  className?: string
}

/**
 * Content rides a paper tape pulled through slots cut in the page — with a
 * tiny speed wobble, because a hand is doing the pulling. Hover drags it slow.
 */
export function ScribbleMarquee({ items, speed = 40, seed: seedProp, className }: ScribbleMarqueeProps) {
  const seed = useSeed(seedProp)
  const calm = useCalm()
  const [w, setW] = React.useState(600)
  const [hover, setHover] = React.useState(false)
  const hostRef = React.useRef<HTMLDivElement>(null)
  const trackRef = React.useRef<HTMLDivElement>(null)
  const offset = React.useRef(0)

  React.useLayoutEffect(() => {
    const el = hostRef.current
    if (!el) return
    const m = () => setW(p => Math.abs(p - el.clientWidth) < 1 ? p : el.clientWidth)
    m()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(m) : null
    ro?.observe(el)
    return () => ro?.disconnect()
  }, [])

  React.useEffect(() => {
    if (calm) return
    let raf = 0
    let last = performance.now()
    const stepFn = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      const track = trackRef.current
      if (track) {
        const half = track.scrollWidth / 2
        const wobble = 1 + 0.12 * Math.sin(now / 900)
        offset.current = (offset.current + speed * wobble * (hover ? 0.25 : 1) * dt) % (half || 1)
        track.style.transform = `translateX(${-offset.current}px)`
      }
      raf = requestAnimationFrame(stepFn)
    }
    raf = requestAnimationFrame(stepFn)
    return () => cancelAnimationFrame(raf)
  }, [speed, hover, calm])

  const railTl: InkTimeline = React.useMemo(
    () => ink([
      bowedLine(0, 0, w, 0, 0.008, seed), bowedLine(0, 4, w, 4, 0.01, seed + 'b'),
      bowedLine(0, 40, w, 40, 0.008, seed + '2'), bowedLine(0, 44, w, 44, 0.01, seed + '2b'),
    ], { seed, roughness: 0.7, speed: 5, width: 1.3 }),
    [w, seed],
  )

  return (
    <div
      ref={hostRef}
      className={cn('relative w-full overflow-hidden', className)}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      style={{ height: 50 }}
    >
      <Ink overlay timeline={railTl} draw={false} color="var(--sui-ink)" className="absolute" style={{ top: 2 }} />
      <div ref={trackRef} className="absolute top-1 flex h-[42px] w-max items-center gap-8 px-4 will-change-transform">
        {[...items, ...items].map((it, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap font-display text-sm font-bold text-ink-soft">
            {it}
            <span aria-hidden className="size-1.5 rounded-full" style={{ background: 'var(--sui-pencil)' }} />
          </span>
        ))}
      </div>
    </div>
  )
}
