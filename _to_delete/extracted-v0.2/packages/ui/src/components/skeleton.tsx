'use client'
import { bowedLine, ellipse, ink, rect, type InkTimeline, type Stroke } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useCalm, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export type SkeletonKind = 'text' | 'media' | 'profile'

export interface ScribbleSkeletonProps {
  loading: boolean
  children: React.ReactNode
  /** what's being sketched: text lines, a media card, or an avatar row */
  kind?: SkeletonKind
  className?: string
  seed?: string
}

/** placeholder "writing": a low, wavy squiggle the length of a text line */
function squiggle(w: number, y: number, seed: number): Stroke {
  const pts = []
  for (let x = 0; x <= w; x += 7) {
    pts.push({ x, y: y + Math.sin(x / 9 + seed) * 2.6 })
  }
  return pts
}

/**
 * Loading is sketching. Placeholders are pencil roughs — squiggled fake
 * writing, boxed fake media — and while data loads, the pencil keeps
 * lightly adding to the sketch. Content isn't faded in: it's inked over
 * the draft, and the pencil erases. Shimmer is banned.
 */
export function ScribbleSkeleton({ loading, children, kind = 'text', className, seed: seedProp }: ScribbleSkeletonProps) {
  const seed = useSeed(seedProp)
  const calm = useCalm()
  const [w, setW] = React.useState(260)
  const [sketchGen, setSketchGen] = React.useState(0)
  const hostRef = React.useRef<HTMLDivElement>(null)
  const [leaving, setLeaving] = React.useState(false)
  const wasLoading = React.useRef(loading)

  React.useEffect(() => {
    if (wasLoading.current && !loading) {
      setLeaving(true)
      const t = setTimeout(() => setLeaving(false), 520)
      return () => clearTimeout(t)
    }
    wasLoading.current = loading
  }, [loading])

  // the pencil keeps sketching: a light extra pass every 1.4s
  React.useEffect(() => {
    if (!loading || calm) return
    const id = setInterval(() => setSketchGen(g => g + 1), 1400)
    return () => clearInterval(id)
  }, [loading, calm])

  React.useLayoutEffect(() => {
    const el = hostRef.current
    if (!el) return
    const m = () => setW(p => Math.abs(p - el.clientWidth) < 1 ? p : el.clientWidth)
    m()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(m) : null
    ro?.observe(el)
    return () => ro?.disconnect()
  }, [])

  const baseTl: InkTimeline = React.useMemo(() => {
    const strokes: Stroke[] = []
    if (kind === 'profile') {
      strokes.push(ellipse(22, 22, 18, 18, seed))
      strokes.push(squiggle(w * 0.4, 14, 1).map(p => ({ x: p.x + 52, y: p.y })))
      strokes.push(squiggle(w * 0.55, 34, 2).map(p => ({ x: p.x + 52, y: p.y })))
    } else if (kind === 'media') {
      strokes.push(...rect(w, 90, seed))
      // the classic "image" placeholder doodle: mountains + sun
      strokes.push([{ x: w * 0.14, y: 74 }, { x: w * 0.32, y: 40 }, { x: w * 0.45, y: 62 }, { x: w * 0.58, y: 34 }, { x: w * 0.8, y: 74 }])
      strokes.push(ellipse(w * 0.78, 26, 7, 7, seed + 'sun'))
      strokes.push(squiggle(w * 0.7, 108, 3))
      strokes.push(squiggle(w * 0.5, 126, 4))
    } else {
      strokes.push(squiggle(w * 0.5, 8, 1))
      strokes.push(squiggle(w * 0.96, 32, 2))
      strokes.push(squiggle(w * 0.88, 52, 3))
      strokes.push(squiggle(w * 0.6, 72, 4))
    }
    return ink(strokes, { seed, roughness: 0.7, speed: 4.5, width: 1.3, flightBase: 20 })
  }, [w, seed, kind])

  const extraTl: InkTimeline | null = React.useMemo(() => {
    if (!sketchGen) return null
    const y = kind === 'media' ? 80 : 20 + (sketchGen % 4) * 20
    return ink([bowedLine(4, y, w * (0.3 + (sketchGen % 3) * 0.2), y + 2, 0.05, seed + sketchGen)], { seed: seed + ':x' + sketchGen, roughness: 1.2, speed: 5, width: 1 })
  }, [sketchGen, w, seed, kind])

  const showSketch = loading || leaving
  return (
    <div ref={hostRef} className={cn('relative', className)} aria-busy={loading}>
      <div className={cn('transition-opacity duration-300', loading ? 'invisible opacity-0' : 'opacity-100')}>
        {children}
      </div>
      {showSketch && (
        <span className={cn('absolute inset-0 overflow-hidden transition-opacity duration-500', leaving && 'opacity-0')}>
          <Ink overlay timeline={baseTl} draw={loading} color="var(--sui-pencil)" className="absolute" style={{ opacity: 0.6 }} rate={2} />
          {extraTl && <Ink overlay timeline={extraTl} color="var(--sui-pencil)" className="absolute" style={{ opacity: 0.3 }} rate={2} />}
        </span>
      )}
    </div>
  )
}
