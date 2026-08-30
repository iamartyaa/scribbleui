import type { InkStroke, InkTimeline, Pt, Stroke } from './types.js'

const f = (n: number) => Math.round(n * 100) / 100

/** Polyline -> smoothed SVG path (quadratic midpoint smoothing). */
export function toPathD(pts: readonly Pt[]): string {
  if (pts.length === 0) return ''
  if (pts.length === 1) return `M${f(pts[0].x)} ${f(pts[0].y)}`
  if (pts.length === 2) return `M${f(pts[0].x)} ${f(pts[0].y)}L${f(pts[1].x)} ${f(pts[1].y)}`
  let d = `M${f(pts[0].x)} ${f(pts[0].y)}`
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2
    const my = (pts[i].y + pts[i + 1].y) / 2
    d += `Q${f(pts[i].x)} ${f(pts[i].y)} ${f(mx)} ${f(my)}`
  }
  const last = pts[pts.length - 1]
  d += `L${f(last.x)} ${f(last.y)}`
  return d
}

export interface DashStroke {
  d: string
  length: number
  t0: number
  t1: number
  /** average nib width for this stroke */
  width: number
  stroke: InkStroke
}

/** Timeline -> per-stroke path data ready for non-linear dash reveal. */
export function toDashStrokes(tl: InkTimeline): DashStroke[] {
  return tl.strokes.map(s => ({
    d: toPathD(s.points),
    length: s.length,
    t0: s.t0,
    t1: s.t1,
    width: s.points.reduce((a, p) => a + p.w, 0) / (s.points.length || 1),
    stroke: s,
  }))
}

/**
 * Variable-width filled outline for one timed stroke (the "wet ink" look).
 * Returns a closed polygon path — fill it, don't stroke it.
 */
export function toInkOutlineD(s: InkStroke): string {
  const pts = s.points
  if (pts.length < 2) return ''
  const left: Pt[] = []
  const right: Pt[] = []
  for (let i = 0; i < pts.length; i++) {
    const prev = pts[Math.max(0, i - 1)]
    const next = pts[Math.min(pts.length - 1, i + 1)]
    let tx = next.x - prev.x, ty = next.y - prev.y
    const l = Math.hypot(tx, ty) || 1
    tx /= l; ty /= l
    const px = -ty, py = tx
    const w = pts[i].w / 2
    left.push({ x: pts[i].x + px * w, y: pts[i].y + py * w })
    right.push({ x: pts[i].x - px * w, y: pts[i].y - py * w })
  }
  right.reverse()
  return toPathD(left) + toPathD(right).replace(/^M/, 'L') + 'Z'
}

/** Simple static render of a full timeline as centerline paths. */
export function toStaticSVGPaths(tl: InkTimeline): string[] {
  return tl.strokes.map(s => toPathD(s.points))
}
