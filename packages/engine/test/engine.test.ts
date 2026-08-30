import { describe, expect, it } from 'vitest'
import {
  ink, rect, ellipse, tick, roughen, resample, time, revealedLength,
  toPathD, toDashStrokes, toInkOutlineD, rng, makeNoise1D, arrow, scaleDuration,
} from '../src/index.js'

describe('determinism (the SSR contract)', () => {
  it('same seed -> identical ink, different seed -> different ink', () => {
    const a = ink(rect(120, 44, 'btn'), { seed: 'btn' })
    const b = ink(rect(120, 44, 'btn'), { seed: 'btn' })
    const c = ink(rect(120, 44, 'other'), { seed: 'other' })
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(c))
  })
  it('prng and noise are stable', () => {
    const r = rng('x')
    const seq = [r(), r(), r()]
    const r2 = rng('x')
    expect([r2(), r2(), r2()]).toEqual(seq)
    const n = makeNoise1D('x')
    expect(n(1.5)).toBeCloseTo(makeNoise1D('x')(1.5), 12)
    expect(Math.abs(n(2.7))).toBeLessThanOrEqual(1)
  })
})

describe('timing model', () => {
  it('slows through curves relative to straights', () => {
    // straight line vs half-ellipse of same arc length
    const straight = time([resample([{ x: 0, y: 0 }, { x: 200, y: 0 }], 5)])
    const curve = time([ellipse(0, 0, 63.6, 63.6, 1).slice(0, 30)])
    const vS = straight.strokes[0].length / (straight.strokes[0].t1 - straight.strokes[0].t0)
    const vC = curve.strokes[0].length / (curve.strokes[0].t1 - curve.strokes[0].t0)
    expect(vS).toBeGreaterThan(vC * 1.3)
  })
  it('adds pen-up flight time between strokes proportional to distance', () => {
    const near = time([[{ x: 0, y: 0 }, { x: 10, y: 0 }], [{ x: 12, y: 0 }, { x: 22, y: 0 }]])
    const far = time([[{ x: 0, y: 0 }, { x: 10, y: 0 }], [{ x: 400, y: 0 }, { x: 410, y: 0 }]])
    const gapNear = near.strokes[1].t0 - near.strokes[0].t1
    const gapFar = far.strokes[1].t0 - far.strokes[0].t1
    expect(gapFar).toBeGreaterThan(gapNear + 50)
  })
  it('slow points get wider ink', () => {
    const tl = time([roughen(tick(20), { seed: 1 })], { width: 2, widthFromSpeed: 0.6 })
    const ws = tl.strokes[0].points.map(p => p.w)
    expect(Math.max(...ws)).toBeGreaterThan(Math.min(...ws))
  })
  it('revealedLength is monotonic and hits endpoints', () => {
    const tl = ink(rect(80, 30, 's'), { seed: 's' })
    const s = tl.strokes[2]
    expect(revealedLength(s, s.t0 - 1)).toBe(0)
    expect(revealedLength(s, s.t1 + 1)).toBe(s.length)
    let prev = -1
    for (let t = s.t0; t <= s.t1; t += (s.t1 - s.t0) / 20) {
      const l = revealedLength(s, t)
      expect(l).toBeGreaterThanOrEqual(prev)
      prev = l
    }
  })
  it('scaleDuration preserves rhythm', () => {
    const tl = ink(rect(80, 30, 's'), { seed: 's' })
    const scaled = scaleDuration(tl, 500)
    expect(scaled.duration).toBeCloseTo(500, 6)
    const ratio = tl.strokes[1].t0 / tl.duration
    expect(scaled.strokes[1].t0 / 500).toBeCloseTo(ratio, 6)
  })
})

describe('geometry', () => {
  it('resample spaces points evenly', () => {
    const pts = resample([{ x: 0, y: 0 }, { x: 100, y: 0 }], 10)
    expect(pts.length).toBeGreaterThanOrEqual(10)
    for (let i = 2; i < pts.length - 1; i++) {
      const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
      expect(d).toBeGreaterThan(8)
      expect(d).toBeLessThan(12)
    }
  })
  it('roughen keeps endpoints honest (no overshoot)', () => {
    const r = roughen([{ x: 0, y: 0 }, { x: 100, y: 0 }], { seed: 9, roughness: 2 })
    expect(Math.hypot(r[0].x, r[0].y)).toBeLessThan(1.5)
    const last = r[r.length - 1]
    expect(Math.hypot(last.x - 100, last.y)).toBeLessThan(1.5)
  })
  it('arrow returns shaft + two head wings ending at the tip', () => {
    const [shaft, w1, w2] = arrow({ x: 0, y: 0 }, { x: 100, y: 0 })
    const tip = shaft[shaft.length - 1]
    expect(w1[w1.length - 1]).toEqual(tip)
    expect(w2[w2.length - 1]).toEqual(tip)
  })
  it('svg emit produces valid-looking paths and outlines', () => {
    const tl = ink([tick(18)], { seed: 't' })
    const dash = toDashStrokes(tl)
    expect(dash[0].d.startsWith('M')).toBe(true)
    expect(dash[0].length).toBeGreaterThan(0)
    const outline = toInkOutlineD(tl.strokes[0])
    expect(outline.endsWith('Z')).toBe(true)
    expect(toPathD([])).toBe('')
  })
})
