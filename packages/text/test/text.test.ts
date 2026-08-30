import { describe, expect, it } from 'vitest'
import { HandWriter, hands, layoutText, writeText } from '../src/index.js'

describe('.hand fonts', () => {
  it('ship all printable ASCII', () => {
    for (const f of Object.values(hands)) {
      for (let c = 33; c < 127; c++) {
        expect(f.glyphs[String.fromCharCode(c)]).toBeDefined()
      }
    }
  })
})

describe('layout', () => {
  it('advances monotonically and wraps at maxWidth', () => {
    const one = layoutText('hello world hello world', hands.print, { size: 30, maxWidth: Infinity })
    const wrapped = layoutText('hello world hello world', hands.print, { size: 30, maxWidth: 200 })
    expect(one.lines).toBe(1)
    expect(wrapped.lines).toBeGreaterThan(1)
    expect(wrapped.width).toBeLessThanOrEqual(210)
  })
  it('is deterministic', () => {
    const a = writeText('scribble', hands.script, { seed: 'x', size: 40 })
    const b = writeText('scribble', hands.script, { seed: 'x', size: 40 })
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })
})

describe('HandWriter streaming', () => {
  it('never re-times already-written ink', () => {
    const w = new HandWriter(hands.print, { seed: 's', size: 30 })
    const t1 = w.append('hel')
    const firstStroke = JSON.stringify(t1.strokes[0])
    const t2 = w.append('lo world')
    expect(JSON.stringify(t2.strokes[0])).toBe(firstStroke)
    expect(t2.duration).toBeGreaterThan(t1.duration)
    // times strictly ordered across the splice point
    for (let i = 1; i < t2.strokes.length; i++) {
      expect(t2.strokes[i].t0 + 1e-6).toBeGreaterThanOrEqual(t2.strokes[i - 1].t0)
    }
  })
})
