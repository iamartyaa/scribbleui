'use client'
import {
  applyDashFrame, play as playTimeline, toPathD,
  type InkTimeline,
} from '@scribbleui/engine'
import * as React from 'react'
import { cn, nextAutoSeed } from './utils'

/* ------------------------------------------------------------------ */
/* context                                                             */
/* ------------------------------------------------------------------ */

export interface InkConfig {
  /** base seed mixed into every component's local seed */
  seed: string
  /** global hand looseness multiplier */
  roughness: number
  /** true = draw statics, skip motion (in addition to the OS preference) */
  calm: boolean
}

const InkContext = React.createContext<InkConfig>({ seed: 'scribble', roughness: 1, calm: false })

export function InkProvider({ seed = 'scribble', roughness = 1, calm = false, children }:
  Partial<InkConfig> & { children: React.ReactNode }) {
  const value = React.useMemo(() => ({ seed, roughness, calm }), [seed, roughness, calm])
  return <InkContext.Provider value={value}>{children}</InkContext.Provider>
}

export function useInkConfig(): InkConfig {
  return React.useContext(InkContext)
}

/** Stable per-instance seed; pass your own for SSR-stable ink. */
export function useSeed(explicit?: string | number): string {
  const ctx = useInkConfig()
  const auto = React.useRef<string | null>(null)
  if (auto.current === null) auto.current = nextAutoSeed()
  return `${ctx.seed}:${explicit ?? auto.current}`
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const on = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

/** Should this render skip animation? (OS pref or calm mode) */
export function useCalm(): boolean {
  const { calm } = useInkConfig()
  return usePrefersReducedMotion() || calm
}

/* ------------------------------------------------------------------ */
/* <Ink> — the one renderer every component uses                       */
/* ------------------------------------------------------------------ */

export interface InkProps extends Omit<React.SVGProps<SVGSVGElement>, 'color'> {
  timeline: InkTimeline
  /** draw-on when it becomes true (default true on mount) */
  draw?: boolean
  /** play in reverse: ink lifts off tail-first */
  erase?: boolean
  /** playback rate; 1 = the hand's natural pace */
  rate?: number
  /** external control: 0..1 through the timeline (disables auto play) */
  progress?: number
  /** bbox padding px */
  pad?: number
  /** stroke color (default currentColor) */
  color?: string
  /** override nib width; otherwise per-stroke width from the ink model */
  width?: number
  onDone?: () => void
  /** absolutely position over the parent (parent needs position:relative) */
  overlay?: boolean
}

export function bounds(tl: InkTimeline, pad = 4) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const s of tl.strokes) for (const p of s.points) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }
  if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 1; maxY = 1 }
  return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 }
}

export const Ink = React.forwardRef<SVGSVGElement, InkProps>(function Ink(
  { timeline, draw = true, erase = false, rate = 1, pad = 4, color, width, onDone, overlay, progress, className, style, ...rest },
  fwd,
) {
  const calm = useCalm()
  const svgRef = React.useRef<SVGSVGElement | null>(null)
  const pathRefs = React.useRef<(SVGPathElement | null)[]>([])
  const box = React.useMemo(() => bounds(timeline, pad), [timeline, pad])
  const ds = React.useMemo(
    () => timeline.strokes.map(s => ({ d: toPathD(s.points), w: s.points.reduce((a, p) => a + p.w, 0) / (s.points.length || 1) })),
    [timeline],
  )

  React.useEffect(() => {
    pathRefs.current.length = timeline.strokes.length
    const els = pathRefs.current
    const lengths = timeline.strokes.map((s, i) => {
      try { return els[i]?.getTotalLength() ?? s.length }
      catch { return s.length }
    })
    if (progress !== undefined) {
      applyDashFrame(timeline, els, lengths, progress * timeline.duration)
      return
    }
    if (calm || !draw) {
      // final state, instantly
      const t = erase ? 0 : timeline.duration
      applyDashFrame(timeline, els, lengths, t)
      if (draw) onDone?.()
      return
    }
    applyDashFrame(timeline, els, lengths, erase ? timeline.duration : 0)
    const handle = playTimeline(timeline, {
      rate,
      onFrame: t => applyDashFrame(timeline, els, lengths, erase ? timeline.duration - t : t),
      onDone,
    })
    return () => handle.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeline, draw, erase, calm, rate, progress])

  return (
    <svg
      ref={el => { svgRef.current = el; if (typeof fwd === 'function') fwd(el); else if (fwd) fwd.current = el }}
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      width={box.w}
      height={box.h}
      aria-hidden="true"
      focusable="false"
      className={cn(overlay && 'pointer-events-none absolute', className)}
      style={overlay ? { left: box.x, top: box.y, ...style } : style}
      {...rest}
    >
      {ds.map((s, i) => (
        <path
          key={i}
          ref={el => { pathRefs.current[i] = el }}
          d={s.d}
          fill="none"
          stroke={color ?? 'currentColor'}
          strokeWidth={width ?? s.w}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
})

/** Memoize an ink build against deps (a thin typed useMemo). */
export function useInk(build: () => InkTimeline, deps: React.DependencyList): InkTimeline {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(build, deps)
}
