import type { InkTimeline } from './types.js'
import { revealedLength } from './timing.js'

export interface PlayerHandle { stop: () => void; promise: Promise<void> }

export interface PlayOptions {
  /** stretch/squeeze playback; 1 = the model's natural pace */
  rate?: number
  /** start offset ms into the timeline */
  from?: number
  /** called once per frame with current time (ms, timeline space) */
  onFrame: (t: number) => void
  onDone?: () => void
  /** injectable clock for tests */
  now?: () => number
  raf?: (cb: FrameRequestCallback) => number
  caf?: (id: number) => void
}

/** Play a timeline in real time. The timeline already encodes the hand's rhythm. */
export function play(tl: InkTimeline, opts: PlayOptions): PlayerHandle {
  const rate = opts.rate ?? 1
  const from = opts.from ?? 0
  const nowFn = opts.now ?? (() => performance.now())
  const raf = opts.raf ?? ((cb) => requestAnimationFrame(cb))
  const caf = opts.caf ?? ((id) => cancelAnimationFrame(id))
  let id = 0
  let stopped = false
  let resolve!: () => void
  const promise = new Promise<void>(r => { resolve = r })
  const start = nowFn()
  const step = () => {
    if (stopped) return
    const t = from + (nowFn() - start) * rate
    if (t >= tl.duration) {
      opts.onFrame(tl.duration)
      opts.onDone?.()
      resolve()
      return
    }
    opts.onFrame(t)
    id = raf(step)
  }
  id = raf(step)
  return { stop: () => { stopped = true; caf(id); resolve() }, promise }
}

/**
 * Apply a timeline moment to SVG path elements via non-linear dash reveal.
 * `els[i]` must correspond to `tl.strokes[i]` and carry its total length.
 */
export function applyDashFrame(
  tl: InkTimeline,
  els: ArrayLike<SVGPathElement | null>,
  lengths: number[],
  t: number,
): void {
  for (let i = 0; i < tl.strokes.length; i++) {
    const el = els[i]
    if (!el) continue
    const s = tl.strokes[i]
    const geoLen = lengths[i] ?? s.length
    const revealed = revealedLength(s, t) / (s.length || 1) * geoLen
    el.style.strokeDasharray = `${geoLen}`
    el.style.strokeDashoffset = `${Math.max(0, geoLen - revealed)}`
  }
}
