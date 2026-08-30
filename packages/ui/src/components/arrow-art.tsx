'use client'
import { arrow, bowedLine, ink, loopPath, sampleQuad, zigzag, type InkTimeline, type Pt, type Stroke } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export type ArrowKind = 'straight' | 'curve' | 'loop' | 'zigzag' | 'double'

export interface ScribbleArrowArtProps {
  /** arrow style */
  kind?: ArrowKind
  /** length in px */
  length?: number
  /** rotation in degrees (0 = pointing right) */
  angle?: number
  /** bend, -0.6..0.6 — sign flips the side (curve/double) */
  arc?: number
  /** head size in px */
  head?: number
  color?: string
  strokeWidth?: number
  seed?: string
  className?: string
  /** draw when scrolled into view instead of on mount */
  trigger?: 'mount' | 'visible'
}

function headAt(shaft: Stroke, size: number): Stroke[] {
  const e1 = shaft[shaft.length - 2], e2 = shaft[shaft.length - 1]
  const tx = e2.x - e1.x, ty = e2.y - e1.y
  const l = Math.hypot(tx, ty) || 1
  const ux = tx / l, uy = ty / l
  const wing = (s: number): Stroke => [
    { x: e2.x - ux * size + -uy * s * size * 0.62, y: e2.y - uy * size + ux * s * size * 0.62 },
    { x: e2.x, y: e2.y },
  ]
  return [wing(1), wing(-1)]
}

/**
 * Standalone hand-drawn arrows for pointing at things: straight, curved,
 * loop-de-loop, zigzag, and double-headed — with angle, arc, and head size
 * as knobs. For connecting two live DOM nodes, use ScribbleConnect.
 */
export function ScribbleArrowArt({
  kind = 'curve', length = 90, angle = 0, arc = 0.22, head = 9,
  color = 'var(--sui-accent)', strokeWidth, seed: seedProp, className, trigger = 'mount',
}: ScribbleArrowArtProps) {
  const seed = useSeed(seedProp)
  const hostRef = React.useRef<HTMLSpanElement>(null)
  const [armed, setArmed] = React.useState(trigger === 'mount')

  React.useEffect(() => {
    if (trigger !== 'visible' || armed) return
    const el = hostRef.current
    if (!el || typeof IntersectionObserver === 'undefined') { setArmed(true); return }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { setArmed(true); io.disconnect() } }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [trigger, armed])

  const tl: InkTimeline = React.useMemo(() => {
    const a: Pt = { x: 0, y: 0 }
    const b: Pt = { x: length, y: 0 }
    let strokes: Stroke[]
    if (kind === 'straight') {
      const shaft = bowedLine(a.x, a.y, b.x, b.y, 0.03, seed)
      strokes = [shaft, ...headAt(shaft, head)]
    } else if (kind === 'loop') {
      const shaft = loopPath(a, b, Math.max(8, length * 0.16))
      strokes = [shaft, ...headAt(shaft, head)]
    } else if (kind === 'zigzag') {
      const shaft = zigzag(length, Math.max(5, length * 0.09), Math.max(3, Math.round(length / 24))).map(p => ({ x: p.x, y: p.y - length * 0.045 }))
      strokes = [shaft, ...headAt(shaft, head)]
    } else if (kind === 'double') {
      const strokesArr = arrow(a, b, arc, head)
      const back = headAt([strokesArr[0][1], strokesArr[0][0]], head)
      strokes = [...strokesArr, ...back]
    } else {
      const c = { x: length / 2, y: -length * arc }
      const shaft = sampleQuad(a, c, b, 16)
      strokes = [shaft, ...headAt(shaft, head)]
    }
    return ink(strokes, { seed, roughness: 0.9, speed: 1.9, width: strokeWidth ?? 2 })
  }, [kind, length, arc, head, seed, strokeWidth])

  return (
    <span
      ref={hostRef}
      aria-hidden
      className={cn('inline-block align-middle', className)}
      style={{ transform: angle ? `rotate(${angle}deg)` : undefined }}
    >
      <Ink timeline={tl} draw={armed} color={color} pad={6} />
    </span>
  )
}
