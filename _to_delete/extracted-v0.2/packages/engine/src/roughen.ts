import type { Pt, Stroke, RoughOptions } from './types.js'
import { makeNoise1D, rng } from './prng.js'

const dist = (a: Pt, b: Pt) => Math.hypot(b.x - a.x, b.y - a.y)

/** Resample a polyline to roughly even spacing (keeps first & last points). */
export function resample(stroke: Stroke, spacing: number): Stroke {
  if (stroke.length < 2) return stroke.slice()
  const out: Pt[] = [stroke[0]]
  let carry = 0
  for (let i = 1; i < stroke.length; i++) {
    let a = stroke[i - 1]
    const b = stroke[i]
    let d = dist(a, b)
    while (carry + d >= spacing) {
      const need = spacing - carry
      const t = need / d
      const p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
      out.push(p)
      a = p
      d = dist(a, b)
      carry = 0
    }
    carry += d
  }
  const last = stroke[stroke.length - 1]
  const tail = out[out.length - 1]
  if (dist(tail, last) > spacing * 0.25) out.push({ ...last })
  else out[out.length - 1] = { ...last }
  return out
}

/**
 * The hand: perturb a clean polyline with smooth seeded noise, perpendicular
 * to travel, with amplitude that eases to ~0 at the stroke's ends
 * (a hand aims its endpoints; the middle drifts).
 */
export function roughen(stroke: Stroke, opts: RoughOptions = {}, strokeIndex = 0): Stroke {
  const {
    seed = 0, roughness = 1, spacing = 6, overshoot = 0, wavelength = 46,
  } = opts
  if (stroke.length < 2) return stroke.slice()

  let pts = stroke
  if (overshoot > 0) pts = extendEnds(pts, overshoot)
  pts = resample(pts, spacing)
  if (roughness <= 0) return pts

  const noise = makeNoise1D(String(seed) + ':' + strokeIndex)
  const jitter = makeNoise1D(String(seed) + ':j' + strokeIndex)
  const amp = 1.35 * roughness
  const out: Pt[] = []
  let travelled = 0
  // estimate total length for end-easing
  let total = 0
  for (let i = 1; i < pts.length; i++) total += dist(pts[i - 1], pts[i])
  if (total === 0) return pts

  for (let i = 0; i < pts.length; i++) {
    if (i > 0) travelled += dist(pts[i - 1], pts[i])
    const prev = pts[Math.max(0, i - 1)]
    const next = pts[Math.min(pts.length - 1, i + 1)]
    let tx = next.x - prev.x
    let ty = next.y - prev.y
    const len = Math.hypot(tx, ty) || 1
    tx /= len; ty /= len
    // perpendicular
    const px = -ty, py = tx
    const u = travelled / wavelength
    // ease amplitude near both ends (first/last 12% of the stroke)
    const edge = Math.min(1, Math.min(travelled, total - travelled) / (total * 0.12 + 1e-6))
    const n = noise(u) * amp * edge + jitter(u * 3.1) * amp * 0.35 * edge
    out.push({ x: pts[i].x + px * n, y: pts[i].y + py * n })
  }
  return out
}

/** Extend both ends of a polyline along their end tangents. */
export function extendEnds(stroke: Stroke, by: number): Stroke {
  if (stroke.length < 2) return stroke.slice()
  const a0 = stroke[0], a1 = stroke[1]
  const b0 = stroke[stroke.length - 1], b1 = stroke[stroke.length - 2]
  const d0 = Math.hypot(a1.x - a0.x, a1.y - a0.y) || 1
  const d1 = Math.hypot(b0.x - b1.x, b0.y - b1.y) || 1
  const start = { x: a0.x - ((a1.x - a0.x) / d0) * by, y: a0.y - ((a1.y - a0.y) / d0) * by }
  const end = { x: b0.x + ((b0.x - b1.x) / d1) * by, y: b0.y + ((b0.y - b1.y) / d1) * by }
  return [start, ...stroke, end]
}

/** Seeded per-instance variation helper: returns a stable random in [lo, hi]. */
export function vary(seed: string | number, lo: number, hi: number, salt = ''): number {
  return lo + rng(String(seed) + salt)() * (hi - lo)
}
