import type { Pt, Stroke } from './types.js'
import { rng } from './prng.js'

/** All shapes return clean control polylines; run them through roughen(). */

export function line(x1: number, y1: number, x2: number, y2: number): Stroke {
  return [{ x: x1, y: y1 }, { x: x2, y: y2 }]
}

/** A gently bowed line — a hand never rules perfectly flat. */
export function bowedLine(x1: number, y1: number, x2: number, y2: number, bow = 0.02, seed: string | number = 0): Stroke {
  const r = rng(String(seed) + 'bow')
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const sway = (r() - 0.5) * 2 * bow * len
  const px = -dy / len, py = dx / len
  return sampleQuad({ x: x1, y: y1 }, { x: mx + px * sway, y: my + py * sway }, { x: x2, y: y2 }, 12)
}

/** Rectangle as four separate strokes with corner overshoot — "I mean this". */
export function rect(w: number, h: number, seed: string | number = 0): Stroke[] {
  const r = rng(String(seed) + 'rect')
  const j = (k: number) => (r() - 0.5) * k
  return [
    bowedLine(0 + j(2), 0 + j(2), w + j(2), 0 + j(2), 0.015, String(seed) + 't'),
    bowedLine(w + j(2), 0 + j(2), w + j(2), h + j(2), 0.02, String(seed) + 'r'),
    bowedLine(w + j(2), h + j(2), 0 + j(2), h + j(2), 0.015, String(seed) + 'b'),
    bowedLine(0 + j(2), h + j(2), 0 + j(2), 0 + j(2), 0.02, String(seed) + 'l'),
  ]
}

/** Ellipse drawn like a hand draws one: start off-axis, close with overlap. */
export function ellipse(cx: number, cy: number, rx: number, ry: number, seed: string | number = 0, loops = 1): Stroke {
  const r = rng(String(seed) + 'ell')
  const start = -0.6 + r() * 0.4
  const overlap = 0.55 + r() * 0.35
  const total = Math.PI * 2 * loops + overlap
  const steps = Math.max(24, Math.round(28 * loops))
  const pts: Pt[] = []
  for (let i = 0; i <= steps; i++) {
    const a = start + (i / steps) * total
    // radius drifts a touch per pass — loops don't retrace
    const drift = 1 + 0.045 * Math.sin(a * 1.7 + r() * 6) + 0.03 * ((a - start) / (Math.PI * 2))
    pts.push({ x: cx + Math.cos(a) * rx * drift, y: cy + Math.sin(a) * ry * drift })
  }
  return pts
}

/** The checkbox flick: short slow down-stroke, long fast up-stroke, overshooting. */
export function tick(size: number): Stroke {
  const s = size
  return [
    { x: 0, y: s * 0.52 },
    { x: s * 0.32, y: s * 0.85 },
    { x: s * 1.08, y: -s * 0.12 },
  ]
}

export function cross(size: number): Stroke[] {
  return [
    [{ x: 0, y: 0 }, { x: size, y: size }],
    [{ x: size, y: 0 }, { x: 0, y: size }],
  ]
}

/** Teacher's error scribble under a bad field. */
export function zigzag(w: number, amp = 5, cycles = 5): Stroke {
  const pts: Pt[] = []
  const steps = cycles * 2
  for (let i = 0; i <= steps; i++) {
    pts.push({ x: (w * i) / steps, y: i % 2 === 0 ? 0 : amp })
  }
  return pts
}

/** Two quick strike strokes through a width — the scratch-out. */
export function scratch(w: number, seed: string | number = 0): Stroke[] {
  return [
    bowedLine(-w * 0.06, 3, w * 1.06, -2, 0.06, String(seed) + 's1'),
    bowedLine(-w * 0.03, 7, w * 1.04, 3, 0.05, String(seed) + 's2'),
  ]
}

/** An expressive underline with a confident end. */
export function underline(w: number, seed: string | number = 0): Stroke {
  return bowedLine(0, 0, w, 0, 0.035, seed)
}

/** Curved arrow from a to b (bulge > 0 bends left of travel), head included. */
export function arrow(a: Pt, b: Pt, bulge = 0.18, headSize = 9): Stroke[] {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
  const dx = b.x - a.x, dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  const px = -dy / len, py = dx / len
  const c = { x: mx + px * bulge * len, y: my + py * bulge * len }
  const shaft = sampleQuad(a, c, b, 16)
  // head angles off the end tangent
  const e1 = shaft[shaft.length - 2], e2 = shaft[shaft.length - 1]
  const tx = e2.x - e1.x, ty = e2.y - e1.y
  const tl = Math.hypot(tx, ty) || 1
  const ux = tx / tl, uy = ty / tl
  const wing = (sign: number): Stroke => [
    {
      x: e2.x - ux * headSize + -uy * sign * headSize * 0.62,
      y: e2.y - uy * headSize + ux * sign * headSize * 0.62,
    },
    { x: e2.x, y: e2.y },
  ]
  return [shaft, wing(1), wing(-1)]
}

/** Margin bracket spanning height h, opening toward +x. */
export function bracket(h: number, depth = 7): Stroke {
  return [
    { x: depth, y: 0 },
    { x: 0, y: h * 0.08 },
    { x: 0, y: h * 0.92 },
    { x: depth, y: h },
  ]
}

/** The bored pen's endless doodle: a looping scribble path (open, tileable). */
export function doodleLoop(w: number, h: number, loops = 3, seed: string | number = 0): Stroke {
  const r = rng(String(seed) + 'doodle')
  const pts: Pt[] = []
  const steps = loops * 26
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = t * Math.PI * 2 * loops
    const wob = 1 + 0.18 * Math.sin(a * 0.63 + r() * 6)
    pts.push({
      x: w / 2 + Math.cos(a) * (w / 2.6) * wob * (0.7 + 0.3 * Math.sin(t * Math.PI)),
      y: h / 2 + Math.sin(a) * (h / 2.6) * wob * (0.75 + 0.25 * Math.cos(t * 2.1)),
    })
  }
  return pts
}

/** Stadium/capsule outline as one closed-ish stroke (for switches, pills). */
export function capsule(w: number, h: number): Stroke {
  const r = h / 2
  const pts: Pt[] = []
  const arc = (cx: number, cy: number, from: number, to: number, steps = 10) => {
    for (let i = 0; i <= steps; i++) {
      const a = from + ((to - from) * i) / steps
      pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r })
    }
  }
  pts.push({ x: r, y: 0 })
  pts.push({ x: w - r, y: 0 })
  arc(w - r, r, -Math.PI / 2, Math.PI / 2)
  pts.push({ x: r, y: h })
  arc(r, r, Math.PI / 2, Math.PI * 1.5)
  pts.push({ x: r + 3, y: -0.5 }) // close with overlap
  return pts
}

/** A 4-point twinkle star (two short crossing strokes + optional sparkle). */
export function twinkle(cx: number, cy: number, r: number): Stroke[] {
  return [
    [{ x: cx, y: cy - r }, { x: cx, y: cy + r }],
    [{ x: cx - r, y: cy }, { x: cx + r, y: cy }],
  ]
}

/** Crescent moon: outer arc + inner bite arc, drawn as two strokes. */
export function crescent(cx: number, cy: number, r: number): Stroke[] {
  const outer: Pt[] = []
  for (let i = 0; i <= 22; i++) {
    const a = -Math.PI * 0.62 + (i / 22) * Math.PI * 1.28
    outer.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r })
  }
  const inner: Pt[] = []
  for (let i = 0; i <= 18; i++) {
    const a = -Math.PI * 0.5 + (i / 18) * Math.PI * 1.05
    inner.push({ x: cx + r * 0.28 + Math.cos(a) * r * 0.72, y: cy + Math.sin(a) * r * 0.74 })
  }
  inner.reverse()
  return [outer, inner]
}

/** Back-and-forth scribble that FILLS a w×h area — the sticker-fill stroke. */
export function scribbleFill(w: number, h: number, gap = 5, slope = 0.55): Stroke {
  const pts: Pt[] = []
  const run = w + h * slope
  let i = 0
  for (let x = -h * slope; x < w; x += gap, i++) {
    if (i % 2 === 0) {
      pts.push({ x: Math.max(0, x), y: x < 0 ? -x / slope : 0 })
      pts.push({ x: Math.min(w, x + h * slope), y: x + h * slope > w ? (w - x) / slope : h })
    } else {
      pts.push({ x: Math.min(w, x + h * slope), y: x + h * slope > w ? (w - x) / slope : h })
      pts.push({ x: Math.max(0, x), y: x < 0 ? -x / slope : 0 })
    }
  }
  void run
  return pts
}

/** Loop-de-loop path from a to b (for playful arrows). */
export function loopPath(a: Pt, b: Pt, loopR = 14): Stroke {
  const dx = b.x - a.x, dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len, uy = dy / len
  const px = -uy, py = ux
  const c = { x: a.x + dx * 0.5 + px * loopR * 0.6, y: a.y + dy * 0.5 + py * loopR * 0.6 }
  const pts: Pt[] = []
  for (let t = 0; t <= 0.34; t += 0.045) pts.push({ x: a.x + dx * t, y: a.y + dy * t })
  const entry = Math.atan2(pts[pts.length - 1].y - c.y, pts[pts.length - 1].x - c.x)
  for (let i = 0; i <= 26; i++) {
    const ang = entry + (i / 26) * Math.PI * 2
    pts.push({ x: c.x + Math.cos(ang) * loopR, y: c.y + Math.sin(ang) * loopR })
  }
  for (let t = 0.66; t <= 1.001; t += 0.045) pts.push({ x: a.x + dx * t, y: a.y + dy * t })
  return pts
}

/** Quadratic bezier sampler. */
export function sampleQuad(a: Pt, c: Pt, b: Pt, steps = 12): Stroke {
  const pts: Pt[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, u = 1 - t
    pts.push({
      x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
      y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
    })
  }
  return pts
}

/** Rubber-eraser smudge: tight back-and-forth strokes across a small area. */
export function eraseScrub(w: number, h: number, passes = 4): Stroke {
  const pts: Pt[] = []
  for (let i = 0; i <= passes; i++) {
    const y = (h * i) / passes
    if (i % 2 === 0) { pts.push({ x: -w * 0.08, y }); pts.push({ x: w * 1.08, y }) }
    else { pts.push({ x: w * 1.08, y }); pts.push({ x: -w * 0.08, y }) }
  }
  return pts
}
