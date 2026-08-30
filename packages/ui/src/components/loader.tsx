'use client'
import { doodleLoop, ellipse, ink, toPathD, type InkTimeline } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, bounds, useCalm, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export type LoaderVariant = 'comet' | 'doodle' | 'dots'

export interface ScribbleLoaderProps {
  variant?: LoaderVariant
  size?: number
  label?: string
  color?: string
  seed?: string
  className?: string
}

/** Comet: a moving window of ink orbits a drawn loop — head bright, tail drying. */
function Comet({ size, color, seed }: { size: number; color: string; seed: string }) {
  const calm = useCalm()
  const pathRef = React.useRef<SVGPathElement>(null)
  const geo = React.useMemo(() => {
    const loop = ellipse(size / 2, size / 2, size / 2.4, size / 3.1, seed)
    const tl = ink([loop], { seed, roughness: 0.9, speed: 2 })
    return { d: toPathD(tl.strokes[0].points), box: bounds(tl, 6) }
  }, [size, seed])

  React.useEffect(() => {
    const el = pathRef.current
    if (!el) return
    const len = el.getTotalLength()
    const window = len * 0.32
    el.style.strokeDasharray = `${window} ${len - window}`
    if (calm) { el.style.strokeDashoffset = '0'; return }
    let raf = 0
    const start = performance.now()
    const step = (now: number) => {
      const t = ((now - start) / 1200) % 1
      el.style.strokeDashoffset = `${-t * len}`
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [geo, calm])

  return (
    <svg viewBox={`${geo.box.x} ${geo.box.y} ${geo.box.w} ${geo.box.h}`} width={geo.box.w} height={geo.box.h} aria-hidden>
      <path d={geo.d} fill="none" stroke={color} strokeWidth={1} strokeLinecap="round" opacity={0.22} />
      <path ref={pathRef} d={geo.d} fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
    </svg>
  )
}

/** Dots: the pen writes "..." over and over, then wipes them. */
function Dots({ size, color, seed }: { size: number; color: string; seed: string }) {
  const [n, setN] = React.useState(1)
  const calm = useCalm()
  React.useEffect(() => {
    if (calm) { setN(3); return }
    const id = setInterval(() => setN(v => (v % 3) + 1), 420)
    return () => clearInterval(id)
  }, [calm])
  const tl: InkTimeline = React.useMemo(() => {
    const r = size / 14
    const dots = Array.from({ length: n }, (_, i) => ellipse(i * size * 0.24 + r, r * 1.4, r, r, seed + i))
    return ink(dots, { seed: seed + n, roughness: 1.1, speed: 1.4, width: r * 1.4, flightBase: 60 })
  }, [n, size, seed])
  return <Ink timeline={tl} color={color} pad={4} />
}

/**
 * Waiting, drawn. `comet` orbits a loop with a drying tail (calm, compact),
 * `doodle` is the bored pen inventing a new scribble each round, and `dots`
 * writes an ellipsis like someone thinking with a pen. Status outcomes
 * (✓ / ✗) belong to Progress and Toast — a loader only ever waits.
 */
export function ScribbleLoader({ variant = 'comet', size = 40, label = 'loading', color = 'var(--sui-accent)', seed: seedProp, className }: ScribbleLoaderProps) {
  const seed = useSeed(seedProp)
  const [gen, setGen] = React.useState(0)

  const doodleTl: InkTimeline | null = React.useMemo(
    () => variant === 'doodle' ? ink([doodleLoop(size, size, 3, `${seed}:${gen}`)], { seed: `${seed}:${gen}`, roughness: 1, speed: 0.9, width: 2 }) : null,
    [variant, size, seed, gen],
  )

  return (
    <span role="status" aria-label={label} className={cn('inline-flex items-center', className)}>
      {variant === 'comet' && <Comet size={size} color={color} seed={seed} />}
      {variant === 'dots' && <Dots size={size} color={color} seed={seed} />}
      {variant === 'doodle' && doodleTl && (
        <Ink timeline={doodleTl} color={color} onDone={() => setTimeout(() => setGen(g => g + 1), 140)} />
      )}
    </span>
  )
}
