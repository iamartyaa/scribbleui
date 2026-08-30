import type { InkTimeline, RoughOptions, Stroke, TimingOptions } from './types.js'
import { roughen } from './roughen.js'
import { time } from './timing.js'

export interface InkOptions extends RoughOptions, TimingOptions {}

/**
 * The one-call pipeline: clean strokes -> roughened, humanly-timed ink.
 *
 *   const tl = ink(rect(120, 40, seed), { seed, roughness: 1 })
 */
export function ink(strokes: Stroke[], opts: InkOptions = {}): InkTimeline {
  const rough = strokes.map((s, i) => roughen(s, opts, i))
  return time(rough, opts)
}
