'use client'
import { ink, type InkTimeline } from '@scribbleui/engine'
import { hands, scaleFor, type HandFont } from '@scribbleui/text'
import * as React from 'react'
import { Ink } from './ink'

export type HandCharStyle = 'print' | 'cursive' | 'marker'
const STYLE_FONT: Record<HandCharStyle, () => HandFont> = {
  print: () => hands.print,
  cursive: () => hands.script,
  marker: () => hands.bold,
}

/**
 * Per-character handwriting overlay for monospace text fields.
 * Each glyph is centered on its character cell BY ITS OWN ADVANCE and scaled
 * down if it would collide with its neighbors — so the ink stays readable at
 * any cell width. Old characters stay drawn; only new ones animate.
 */
export interface HandCharsProps {
  value: string
  /** monospace cell width in px (including letter-spacing) */
  cell: number
  /** target em size of the drawn glyphs */
  size: number
  x0?: number
  /** baseline y of the first line */
  y0: number
  color?: string
  style?: HandCharStyle
  seed: string
  lineHeight?: number
  /** pre-wrapped lines (textarea); if absent, value is a single line */
  lines?: string[]
}

const Glyph = React.memo(function Glyph({ ch, xCenter, y, size, cell, color, font, seed }: {
  ch: string; xCenter: number; y: number; size: number; cell: number; color?: string; font: HandFont; seed: string
}) {
  const tl: InkTimeline | null = React.useMemo(() => {
    const g = font.glyphs[ch] ?? font.glyphs[ch.toUpperCase()]
    if (!g) return null
    let s = scaleFor(font, size)
    // never let a glyph spill into its neighbors' cells
    const maxW = cell * 0.94
    if (g.adv * s > maxW) s = maxW / g.adv
    const half = (g.adv * s) / 2
    const strokes = g.strokes.map(st => st.map(([gx, gy]) => ({ x: gx * s - half, y: gy * s })))
    return ink(strokes, {
      seed: seed + ch,
      roughness: 0.4,
      spacing: 2.2,
      wavelength: 26,
      width: Math.max(1.4, size / 13),
      widthFromSpeed: 0.25,
      speed: 2.1,
    })
  }, [ch, size, cell, font, seed])
  if (!tl) return null
  return (
    <span className="absolute" style={{ left: xCenter, top: y }}>
      <Ink overlay timeline={tl} color={color} />
    </span>
  )
})

export function HandChars({ value, cell, size, x0 = 0, y0, color, style = 'print', seed, lineHeight = 28, lines }: HandCharsProps) {
  const font = STYLE_FONT[style]()
  const rows = lines ?? [value]
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {rows.map((row, li) =>
        row.split('').map((ch, i) =>
          ch === ' ' ? null : (
            <Glyph
              key={`${li}:${i}:${ch}:${style}`}
              ch={ch}
              xCenter={x0 + (i + 0.5) * cell}
              y={y0 + li * lineHeight}
              size={size}
              cell={cell}
              color={color}
              font={font}
              seed={`${seed}:${li}:${i}`}
            />
          ),
        ),
      )}
    </span>
  )
}
