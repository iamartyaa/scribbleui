import type { Stroke } from '@scribbleui/engine'
import { scaleFor, type HandFont } from './hand-format.js'

export interface LayoutOptions {
  /** em size in px (cap height = 0.72em) */
  size?: number
  /** extra px between glyphs */
  letterSpacing?: number
  /** line height multiplier on size (default 1.5) */
  lineHeight?: number
  /** wrap width in px (Infinity = no wrap) */
  maxWidth?: number
}

export interface GlyphPlacement {
  char: string
  /** index into the source text */
  index: number
  x: number
  y: number
  /** absolute-positioned strokes, px */
  strokes: Stroke[]
  advance: number
}

export interface TextLayout {
  glyphs: GlyphPlacement[]
  width: number
  height: number
  lines: number
  size: number
}

/** Lay out text into absolutely-positioned centerline strokes. */
export function layoutText(text: string, font: HandFont, opts: LayoutOptions = {}): TextLayout {
  const { size = 32, letterSpacing = 0, lineHeight = 1.5, maxWidth = Infinity } = opts
  const s = scaleFor(font, size)
  const lineH = size * lineHeight
  const glyphs: GlyphPlacement[] = []
  let x = 0
  // first baseline sits below the ascenders
  let y = size * 0.78
  let line = 0
  let width = 0
  let wordStart = 0 // glyph array index where current word began
  let wordStartX = 0

  const commitLine = () => { width = Math.max(width, x); x = 0; y += lineH; line++ }

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '\n') { commitLine(); wordStart = glyphs.length; wordStartX = 0; continue }
    if (ch === ' ') {
      x += font.spaceAdv * s + letterSpacing
      wordStart = glyphs.length
      wordStartX = x
      continue
    }
    const g = font.glyphs[ch] ?? font.glyphs[ch.toUpperCase()] ?? font.glyphs['?']
    if (!g) continue
    const adv = g.adv * s + letterSpacing
    // word wrap: if this glyph would overflow, move the whole word down
    if (x + adv > maxWidth && wordStartX > 0) {
      const dx = -wordStartX
      const dy = lineH
      for (let k = wordStart; k < glyphs.length; k++) {
        glyphs[k].x += dx; glyphs[k].y += dy
        glyphs[k].strokes = glyphs[k].strokes.map(st => st.map(p => ({ x: p.x + dx, y: p.y + dy })))
      }
      width = Math.max(width, wordStartX)
      x += dx; y += dy; line++
      wordStartX = 0
    }
    glyphs.push({
      char: ch, index: i, x, y, advance: adv,
      strokes: g.strokes.map(st => st.map(([gx, gy]) => ({ x: x + gx * s, y: y + gy * s }))),
    })
    x += adv
  }
  width = Math.max(width, x)
  return { glyphs, width, height: y + size * 0.42, lines: line + 1, size }
}
