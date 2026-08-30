'use client'
import { ink, zigzag, type InkTimeline, type Stroke } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export interface ScribbleSeparatorProps {
  variant?: 'squiggle' | 'dots' | 'wave'
  label?: string
  seed?: string
  className?: string
}

/**
 * A scribe's flourish between thoughts. Draws once when scrolled into view,
 * with a confident end-flick — never loops.
 */
export function ScribbleSeparator({ variant = 'squiggle', label, seed: seedProp, className }: ScribbleSeparatorProps) {
  const seed = useSeed(seedProp)
  const [armed, setArmed] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setArmed(true); return }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { setArmed(true); io.disconnect() } }, { threshold: 0.6 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const tl: InkTimeline = React.useMemo(() => {
    const W = 120
    let strokes: Stroke[]
    if (variant === 'dots') {
      strokes = [0, 1, 2].map(i => [{ x: W / 2 - 20 + i * 20, y: 4 }, { x: W / 2 - 18 + i * 20, y: 5 }])
    } else if (variant === 'wave') {
      const pts = []
      for (let x = 0; x <= W; x += 4) pts.push({ x, y: 5 + Math.sin(x / 9) * 4 })
      strokes = [pts]
    } else {
      strokes = [zigzag(W, 8, 7).map(p => ({ x: p.x, y: p.y + 1 }))]
    }
    return ink(strokes, { seed, roughness: 0.9, speed: 2.2, width: 1.8, flightBase: 30 })
  }, [variant, seed])

  return (
    <div ref={ref} role="separator" className={cn('my-6 flex items-center justify-center gap-3', className)}>
      <Ink timeline={tl} draw={armed} color="var(--sui-pencil)" />
      {label && <span className="font-hand text-lg text-pencil">{label}</span>}
      {label && <Ink timeline={tl} draw={armed} color="var(--sui-pencil)" />}
    </div>
  )
}
