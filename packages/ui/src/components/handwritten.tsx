'use client'
import { scaleDuration, type InkTimeline } from '@scribbleui/engine'
import { hands, writeText, type HandFont, type WriteOptions } from '@scribbleui/text'
import * as React from 'react'
import { Ink, useCalm, useInk, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

type Preset = 'h1' | 'h2' | 'h3' | 'p' | 'span'
const PRESETS: Record<Preset, { size: number; hand: 'print' | 'script' | 'bold'; weight: HandwrittenWeight; lineHeight: number }> = {
  h1: { size: 58, hand: 'print', weight: 'bold', lineHeight: 1.28 },
  h2: { size: 40, hand: 'print', weight: 'bold', lineHeight: 1.32 },
  h3: { size: 28, hand: 'print', weight: 'regular', lineHeight: 1.35 },
  p: { size: 21, hand: 'print', weight: 'light', lineHeight: 1.6 },
  span: { size: 24, hand: 'script', weight: 'regular', lineHeight: 1.45 },
}

export type HandwrittenWeight = 'light' | 'regular' | 'bold'

export interface HandwrittenProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  children: string
  /** typographic preset: h1/h2/h3 headings, p paragraphs, span inline script */
  as?: Preset
  /** built-in hand name or your own .hand font (overrides the preset's) */
  hand?: 'print' | 'script' | 'bold' | HandFont
  /** stroke weight — bold is double-passed like traced lettering */
  weight?: HandwrittenWeight
  /** em size in px (overrides the preset's) */
  size?: number
  seed?: string
  trigger?: 'mount' | 'visible' | 'manual'
  /** external 0..1 progress (scroll-scrub; scrubbing back un-writes) */
  progress?: number
  duration?: number
  rate?: number
  color?: string
  maxWidth?: number
  writeOptions?: Partial<WriteOptions>
  onDone?: () => void
}

/**
 * Text that writes itself — with real typographic range. Presets give you
 * headings, paragraphs and script asides; weights change the nib, and bold
 * is double-passed the way hand-letterers trace important words.
 * The real text stays in the DOM: selectable, indexable, screen-readable.
 */
export function Handwritten({
  children: text, as = 'span', hand: handProp, weight: weightProp, size: sizeProp,
  seed: seedProp, trigger = 'mount', progress, duration, rate = 1, color,
  maxWidth, writeOptions, onDone, className, ...rest
}: HandwrittenProps) {
  const preset = PRESETS[as]
  const hand = handProp ?? preset.hand
  const weight = weightProp ?? preset.weight
  const size = sizeProp ?? preset.size
  const seed = useSeed(seedProp ?? `${as}:${text}`)
  const calm = useCalm()
  const font = typeof hand === 'string' ? hands[hand] : hand
  const hostRef = React.useRef<HTMLSpanElement>(null)
  const [armed, setArmed] = React.useState(trigger === 'mount')

  const widthFor = { light: size / 20, regular: size / 15, bold: size / 12.5 }[weight]

  const tl: InkTimeline = useInk(() => {
    const opts: WriteOptions = {
      seed, size, maxWidth, lineHeight: preset.lineHeight,
      width: Math.max(1.3, widthFor),
      roughness: weight === 'light' ? 0.5 : 0.62,
      ...writeOptions,
    }
    let t = writeText(text, font, opts)
    if (weight === 'bold') {
      // second pass, slightly offset — traced lettering
      const second = writeText(text, font, { ...opts, seed: seed + ':2', width: Math.max(1.2, widthFor * 0.8) })
      const off = size / 42
      t = {
        duration: t.duration + second.duration,
        strokes: [
          ...t.strokes,
          ...second.strokes.map(s => ({
            ...s,
            t0: s.t0 + t.duration, t1: s.t1 + t.duration,
            points: s.points.map(p => ({ ...p, x: p.x + off, y: p.y + off * 0.6, t: p.t + t.duration })),
          })),
        ],
      }
    }
    return duration ? scaleDuration(t, duration) : t
  }, [text, font, seed, size, maxWidth, duration, weight, preset.lineHeight])

  React.useEffect(() => {
    if (trigger !== 'visible' || armed) return
    const el = hostRef.current
    if (!el || typeof IntersectionObserver === 'undefined') { setArmed(true); return }
    const io = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) { setArmed(true); io.disconnect() }
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [trigger, armed])

  const Tag: 'h1' | 'h2' | 'h3' | 'p' | 'span' = as === 'span' ? 'span' : as
  return (
    <Tag ref={hostRef as never} className={cn('m-0 inline-block align-baseline', className)} {...rest}>
      <span className="sr-only">{text}</span>
      <Ink
        timeline={tl}
        draw={trigger === 'manual' ? false : armed}
        progress={trigger === 'manual' ? (progress ?? 0) : (calm ? undefined : progress)}
        rate={weight === 'bold' ? rate * 1.5 : rate}
        color={color}
        pad={Math.max(4, size / 6)}
        onDone={onDone}
      />
    </Tag>
  )
}
