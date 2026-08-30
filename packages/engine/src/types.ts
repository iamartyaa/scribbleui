/** A bare 2D point. */
export interface Pt { x: number; y: number }

/** A point on an ink timeline: position, arrival time (ms), and nib width (px). */
export interface TimedPt { x: number; y: number; t: number; w: number }

/** One continuous pen-down stroke, as drawn geometry (pre-timing). */
export type Stroke = Pt[]

/** A timed stroke plus cached arc-length table. */
export interface InkStroke {
  points: TimedPt[]
  /** total arc length in px */
  length: number
  /** cumulative arc length per point */
  cum: number[]
  /** pen-down start time (ms) */
  t0: number
  /** pen-up time (ms) */
  t1: number
}

/** The engine's core output: strokes with human timing. Renderers just play it. */
export interface InkTimeline {
  strokes: InkStroke[]
  /** total duration incl. pen-up flights (ms) */
  duration: number
}

export interface RoughOptions {
  /** any string or number; same seed -> identical ink (SSR-safe) */
  seed?: string | number
  /** 0 = ruler, 1 = relaxed hand (default), 2+ = scrawl */
  roughness?: number
  /** resample spacing in px (default 6) */
  spacing?: number
  /** extend stroke ends by this many px (drawn-past-the-corner energy) */
  overshoot?: number
  /** wobble wavelength in px (default 46) */
  wavelength?: number
}

export interface TimingOptions {
  /** cruise speed px/ms (default 1.1) */
  speed?: number
  /** exponent for the 2/3 power law slowdown in curves (default 0.66) */
  beta?: number
  /** min/max speed clamp as fractions of cruise (defaults 0.28 / 1.6) */
  minSpeedRatio?: number
  maxSpeedRatio?: number
  /** pen-up flight: ms added between strokes = base + dist/flightSpeed */
  flightBase?: number
  flightSpeed?: number
  /** base nib width px (default 2) */
  width?: number
  /** how strongly speed thins the line, 0..1 (default 0.45) */
  widthFromSpeed?: number
}
