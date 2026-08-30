'use client'
import { ink, type InkTimeline } from '@scribbleui/engine'
import { hands, scaleFor, type HandFont } from '@scribbleui/text'
import * as React from 'react'
import { Ink } from './ink'

/**
 * Per-character handwriting overlay for monospace text fields: each typed
 * character is drawn as ink at its cell position. Old characters stay drawn;
 * only the newest one animates — so typing feels like writing.
 */
export interface HandCharsProps {
  value: string
  /** monospace cell width in px */
  cell: number
  /** font size of the drawn glyphs */
  size: number
  x0?: number
  /** baseline y */
  y0: number
  color?: string
  hand?: HandFont
  seed: string
  /** line index -> extra y offset (for textareas) */
  lineHeight?: number
  /** pre-wrapped lines (textarea); if absent, value is a single line */
  lines?: string[]
}

const Glyph = React.memo(function Glyph({ ch, x, y, size, color, hand, seed }: {
  ch: string; x: number; y: number; size: number; color?: string; hand: HandFont; seed: string
}) {
  const tl: InkTimeline | null = React.useMemo(() => {
    const g = hand.glyphs[ch] ?? hand.glyphs[ch.toUpperCase()]
    if (!g) return null
    const s = scaleFor(hand, size)
    const strokes = g.strokes.map(st => st.map(([gx, gy]) => ({ x: gx * s, y: gy * s })))
    return ink(strokes, { seed: seed + ch, roughness: 0.75, spacing: 2.4, width: Math.max(1.3, size / 14), speed: 1.9 })
  }, [ch, size, hand, seed])
  if (!tl) return null
  return (
    <span className="absolute" style={{ left: x, top: y }}>
      <Ink overlay timeline={tl} color={color} />
    </span>
  )
})

export function HandChars({ value, cell, size, x0 = 0, y0, color, hand = hands.print, seed, lineHeight = 28, lines }: HandCharsProps) {
  const rows = lines ?? [value]
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {rows.map((row, li) =>
        row.split('').map((ch, i) =>
          ch === ' ' ? null : (
            <Glyph
              key={`${li}:${i}:${ch}`}
              ch={ch}
              x={x0 + i * cell + cell / 2 - size * 0.28}
              y={y0 + li * lineHeight}
              size={size}
              color={color}
              hand={hand}
              seed={`${seed}:${li}:${i}`}
            />
          ),
        ),
      )}
    </span>
  )
}
