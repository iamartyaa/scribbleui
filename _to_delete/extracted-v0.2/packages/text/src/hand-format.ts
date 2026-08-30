/**
 * .hand v1 — Scribble UI's open centerline stroke-font format.
 *
 * Unlike outline fonts (.ttf/.otf/.woff), a .hand glyph is the path the nib
 * actually takes: an ordered list of pen-down strokes, each an ordered list
 * of [x, y] points. Baseline sits at y = 0, up is negative, and capHeight is
 * normalized to 100 units. That makes writing animatable: stroke order and
 * direction are the data, not an afterthought.
 */
export interface HandGlyph {
  /** horizontal advance in font units */
  adv: number
  /** ordered pen-down strokes; each point is [x, y] in font units */
  strokes: [number, number][][]
}

export interface HandFont {
  format: 'hand'
  version: 1
  name: string
  source?: string
  /** capHeight in font units (always 100 in v1) */
  unitsPerCap: 100
  baseline: 0
  xHeight: number
  lineHeight: number
  spaceAdv: number
  glyphs: Record<string, HandGlyph>
}

export function isHandFont(v: unknown): v is HandFont {
  return !!v && typeof v === 'object' && (v as HandFont).format === 'hand'
}

/** px scale factor: fontSize is the em; cap height renders at 0.72em. */
export function scaleFor(font: HandFont, fontSize: number): number {
  return (fontSize * 0.72) / font.unitsPerCap
}
