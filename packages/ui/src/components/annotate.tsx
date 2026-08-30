'use client'
import {
  bowedLine, ellipse, ink, rect as inkRect, underline as inkUnderline, bracket, type InkTimeline, type Stroke,
} from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useInkConfig, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export type AnnotationKind = 'underline' | 'circle' | 'box' | 'strike' | 'highlight' | 'bracket'

export interface AnnotateProps extends React.HTMLAttributes<HTMLSpanElement> {
  kind?: AnnotationKind
  /** draw it? (toggle to erase) */
  show?: boolean
  color?: string
  seed?: string
  /** extra px around the measured text box */
  padding?: number
  strokeWidth?: number
}

/**
 * A reader's marks on live DOM text. Measured from real client rects, so the
 * mark survives line-wrap, resize, and font swaps — then re-draws itself.
 */
export function Annotate({
  kind = 'underline', show = true, color, seed: seedProp, padding = 2,
  strokeWidth, className, children, ...rest
}: AnnotateProps) {
  const seed = useSeed(seedProp)
  const { roughness } = useInkConfig()
  const hostRef = React.useRef<HTMLSpanElement>(null)
  const contentRef = React.useRef<HTMLSpanElement>(null)
  const [tl, setTl] = React.useState<InkTimeline | null>(null)
  const genRef = React.useRef(0)
  const keyRef = React.useRef('')

  const measure = React.useCallback(() => {
    const host = contentRef.current
    const anchor = hostRef.current
    if (!host || !anchor) return
    const origin = anchor.getBoundingClientRect()
    const union = host.getBoundingClientRect()
    const rects = Array.from(host.getClientRects()).filter(r => r.width > 1 && r.height > 1)
    const rel = (r: DOMRect) => ({
      x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height,
    })
    const boxes = (rects.length ? rects : [union]).map(rel)
    const key = kind + JSON.stringify(boxes.map(b => [b.x | 0, b.y | 0, b.w | 0, b.h | 0]))
    if (key === keyRef.current) return
    if (keyRef.current) genRef.current++ // layout really changed: re-mark with a fresh hand
    keyRef.current = key
    const strokes: Stroke[] = []
    const rough = { seed: `${seed}:${genRef.current}`, roughness: roughness * 1.1, overshoot: 0 }
    for (const b of boxes) {
      const p = padding
      if (kind === 'underline') {
        strokes.push(inkUnderline(b.w + p * 2, rough.seed).map(pt => ({ x: pt.x + b.x - p, y: pt.y + b.y + b.h + 1 })))
      } else if (kind === 'strike') {
        strokes.push(bowedLine(b.x - p, b.y + b.h * 0.56, b.x + b.w + p, b.y + b.h * 0.5, 0.03, rough.seed))
      } else if (kind === 'highlight') {
        strokes.push(bowedLine(b.x - p, b.y + b.h * 0.55, b.x + b.w + p, b.y + b.h * 0.52, 0.02, rough.seed))
      }
    }
    // whole-box marks use the union box
    const u = {
      x: union.left - origin.left - padding, y: union.top - origin.top - padding,
      w: union.width + padding * 2, h: union.height + padding * 2,
    }
    if (kind === 'circle') {
      strokes.push(ellipse(u.x + u.w / 2, u.y + u.h / 2, u.w / 2 + u.h * 0.28, u.h * 0.72, rough.seed))
    } else if (kind === 'box') {
      for (const s of inkRect(u.w, u.h, rough.seed)) {
        strokes.push(s.map(pt => ({ x: pt.x + u.x, y: pt.y + u.y })))
      }
    } else if (kind === 'bracket') {
      strokes.push(bracket(u.h, 8).map(pt => ({ x: pt.x + u.x - 6, y: pt.y + u.y })))
    }
    setTl(ink(strokes, { ...rough, speed: 1.5 }))
  }, [kind, padding, seed, roughness])

  React.useEffect(() => {
    measure()
    const content = contentRef.current
    let raf = 0
    const remeasure = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(remeasure) : null
    if (content && ro) ro.observe(content)
    window.addEventListener('resize', remeasure)
    return () => { ro?.disconnect(); window.removeEventListener('resize', remeasure); cancelAnimationFrame(raf) }
  }, [measure])

  const hl = kind === 'highlight'
  return (
    <span ref={hostRef} className={cn('relative inline', className)} {...rest}>
      <span ref={contentRef}>{children}</span>
      {tl && (
        <Ink
          overlay
          timeline={tl}
          draw={show}
          erase={!show}
          color={color ?? (hl ? 'var(--sui-hl)' : 'var(--sui-accent)')}
          width={strokeWidth ?? (hl ? 14 : undefined)}
          style={hl ? { mixBlendMode: 'multiply', opacity: 0.5 } : undefined}
          className="pointer-events-none absolute"
        />
      )}
    </span>
  )
}
