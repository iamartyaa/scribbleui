import {
  ink, scaleDuration,
  type InkOptions, type InkTimeline, type Stroke,
} from '@scribbleui/engine'
import type { HandFont } from './hand-format.js'
import { layoutText, type LayoutOptions } from './layout.js'

export interface WriteOptions extends LayoutOptions, InkOptions {
  /** force total duration (ms); otherwise the hand's natural pace */
  duration?: number
}

/** One call: text -> humanly-timed ink, ready for any player. */
export function writeText(text: string, font: HandFont, opts: WriteOptions = {}): InkTimeline {
  const layout = layoutText(text, font, opts)
  const strokes: Stroke[] = []
  for (const g of layout.glyphs) strokes.push(...g.strokes)
  const scale = (opts.size ?? 32) / 100
  const tl = ink(strokes, {
    roughness: 0.6 * Math.max(0.5, scale * 2.4),
    spacing: Math.max(2.2, (opts.size ?? 32) / 9),
    wavelength: 30,
    width: Math.max(1.4, (opts.size ?? 32) / 15),
    ...opts,
  })
  return opts.duration ? scaleDuration(tl, opts.duration) : tl
}

/**
 * Streaming writer — feed it chunks (e.g. LLM tokens); the clock only moves
 * forward, so already-written ink never re-times.
 */
export class HandWriter {
  private text = ''
  private tl: InkTimeline = { strokes: [], duration: 0 }
  constructor(
    private font: HandFont,
    private opts: WriteOptions = {},
  ) {}

  /** Append a chunk; returns the full timeline (existing times preserved). */
  append(chunk: string): InkTimeline {
    const prevChars = this.text.length
    const prevDuration = this.tl.duration
    this.text += chunk
    const full = writeText(this.text, this.font, { ...this.opts, duration: undefined })
    // splice: keep old timing, shift only the new glyphs' strokes to start after prevDuration
    const layout = layoutText(this.text, this.font, this.opts)
    let newStart = 0
    let strokeCount = 0
    for (const g of layout.glyphs) {
      if (g.index < prevChars) strokeCount += g.strokes.length
    }
    newStart = strokeCount
    const keep = this.tl.strokes
    const fresh = full.strokes.slice(newStart)
    const offset = fresh.length && keep.length
      ? Math.max(0, prevDuration - fresh[0].t0 + 40)
      : 0
    const shifted = fresh.map(s => ({
      ...s,
      t0: s.t0 + offset, t1: s.t1 + offset,
      points: s.points.map(p => ({ ...p, t: p.t + offset })),
    }))
    this.tl = {
      strokes: [...keep, ...shifted],
      duration: shifted.length ? shifted[shifted.length - 1].t1 : prevDuration,
    }
    return this.tl
  }

  get timeline(): InkTimeline { return this.tl }
  get value(): string { return this.text }
}
