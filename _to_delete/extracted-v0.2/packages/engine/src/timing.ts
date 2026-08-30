import type { InkStroke, InkTimeline, Stroke, TimedPt, TimingOptions } from './types.js'

const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(bx - ax, by - ay)

/**
 * Give a set of drawn strokes human time.
 *
 * Speed follows the two-thirds power law: hands slow through curves and fly
 * on straights — v ∝ curvature^(-beta). Pen-up flights between strokes take
 * real time proportional to travel distance. Width falls out of speed.
 */
export function time(strokes: Stroke[], opts: TimingOptions = {}): InkTimeline {
  const {
    speed = 1.1, beta = 0.66,
    minSpeedRatio = 0.28, maxSpeedRatio = 1.6,
    flightBase = 60, flightSpeed = 2.2,
    width = 2, widthFromSpeed = 0.45,
  } = opts
  const vMin = speed * minSpeedRatio
  const vMax = speed * maxSpeedRatio

  const out: InkStroke[] = []
  let clock = 0
  let penX: number | null = null
  let penY = 0

  for (const s of strokes) {
    if (s.length < 2) continue
    // pen-up flight from previous stroke end
    if (penX !== null) {
      const d = dist(penX, penY, s[0].x, s[0].y)
      clock += flightBase + d / flightSpeed
    }
    const t0 = clock
    const pts: TimedPt[] = []
    const cum: number[] = [0]
    let length = 0

    for (let i = 0; i < s.length; i++) {
      let v = speed
      if (i > 0 && i < s.length - 1) {
        // discrete curvature: turn angle / local segment length
        const a = s[i - 1], b = s[i], c = s[i + 1]
        const v1x = b.x - a.x, v1y = b.y - a.y
        const v2x = c.x - b.x, v2y = c.y - b.y
        const l1 = Math.hypot(v1x, v1y) || 1e-6
        const l2 = Math.hypot(v2x, v2y) || 1e-6
        const cross = v1x * v2y - v1y * v2x
        const dot = v1x * v2x + v1y * v2y
        const angle = Math.abs(Math.atan2(cross, dot))
        const kappa = angle / ((l1 + l2) / 2)
        // v = cruise on straights, decaying with curvature (2/3-power-law flavor)
        v = speed * Math.pow(1 + kappa * 40, -beta)
      }
      v = Math.min(vMax, Math.max(vMin, v))

      if (i > 0) {
        const d = dist(s[i - 1].x, s[i - 1].y, s[i].x, s[i].y)
        length += d
        cum.push(length)
        clock += d / v
      }
      // slower pen presses harder -> wider, wetter line
      const slow = (vMax - v) / (vMax - vMin) // 0 fast .. 1 slow
      const w = width * (1 - widthFromSpeed / 2 + widthFromSpeed * slow)
      pts.push({ x: s[i].x, y: s[i].y, t: clock, w })
    }
    // ease the very first point's time to stroke start
    if (pts.length) pts[0].t = t0
    out.push({ points: pts, length, cum, t0, t1: clock })
    penX = s[s.length - 1].x
    penY = s[s.length - 1].y
  }
  return { strokes: out, duration: clock }
}

/** Scale a timeline to an exact duration (ms), preserving its rhythm. */
export function scaleDuration(tl: InkTimeline, ms: number): InkTimeline {
  if (tl.duration <= 0) return tl
  const k = ms / tl.duration
  return {
    duration: ms,
    strokes: tl.strokes.map(s => ({
      ...s,
      t0: s.t0 * k, t1: s.t1 * k,
      points: s.points.map(p => ({ ...p, t: p.t * k })),
    })),
  }
}

/** Arc length of stroke `s` revealed at global time `t` (for dash players). */
export function revealedLength(s: InkStroke, t: number): number {
  if (t <= s.t0) return 0
  if (t >= s.t1) return s.length
  const pts = s.points
  // binary search on time
  let lo = 0, hi = pts.length - 1
  while (lo + 1 < hi) {
    const mid = (lo + hi) >> 1
    if (pts[mid].t <= t) lo = mid; else hi = mid
  }
  const a = pts[lo], b = pts[hi]
  const span = b.t - a.t || 1e-6
  const f = (t - a.t) / span
  return s.cum[lo] + (s.cum[hi] - s.cum[lo]) * f
}
