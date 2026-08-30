'use client'
import { arrow, capsule, ellipse, ink, rect, scribbleFill, underline, type InkTimeline } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export type ButtonShape = 'capsule' | 'box' | 'sticker' | 'underline' | 'ghost'

export interface ScribbleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'danger' | 'ghost'
  /** the drawn silhouette: capsule (default), box, sticker (scribble-filled), underline, ghost */
  shape?: ButtonShape
  /** CTA: a trailing arrow that extends on hover */
  withArrow?: boolean
  /** tilt in degrees — hand-placed buttons are rarely level */
  tilt?: number
  /** 0 = ruler-straight … 2 = scrawled */
  roughness?: number
  seed?: string
}

/**
 * Drawn, not boxed. The default is a capsule — one confident stroke around
 * the label — with box, scribble-filled sticker, and underline shapes when
 * the moment calls for them. Pressing squishes the ink into the paper;
 * releasing re-draws with a fresh seed, because hands never repeat a line.
 */
export const ScribbleButton = React.forwardRef<HTMLButtonElement, ScribbleButtonProps>(
  function ScribbleButton({ variant = 'default', shape = 'capsule', withArrow, tilt = 0, roughness = 0.9, seed: seedProp, className, children, disabled, onPointerUp, ...rest }, fwd) {
    const seed = useSeed(seedProp)
    const [gen, setGen] = React.useState(0)
    const [box, setBox] = React.useState<{ w: number; h: number } | null>(null)
    const [hover, setHover] = React.useState(false)
    const innerRef = React.useRef<HTMLButtonElement | null>(null)

    React.useLayoutEffect(() => {
      const el = innerRef.current
      if (!el) return
      const measure = () => {
        const w = el.offsetWidth, h = el.offsetHeight
        setBox(b => (b && Math.abs(b.w - w) < 1 && Math.abs(b.h - h) < 1) ? b : { w, h })
      }
      measure()
      const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
      ro?.observe(el)
      return () => ro?.disconnect()
    }, [])

    const isPrimary = variant === 'primary'
    const strokeColor = disabled ? 'var(--sui-pencil)'
      : variant === 'danger' ? 'var(--sui-danger)'
      : isPrimary ? 'var(--sui-accent)'
      : 'var(--sui-ink)'

    const outlineTl: InkTimeline | null = React.useMemo(() => {
      if (!box || shape === 'ghost') return null
      const s = `${seed}:${gen}`
      const opts = { seed: s, roughness: disabled ? 0.6 : roughness, speed: 2.8, width: isPrimary ? 2.3 : 1.9 }
      if (shape === 'capsule') {
        const strokes = [capsule(box.w - 4, box.h - 4).map(p => ({ x: p.x + 2, y: p.y + 2 }))]
        if (isPrimary) strokes.push(capsule(box.w - 4, box.h - 4).map(p => ({ x: p.x + 2.6, y: p.y + 2.8 })))
        return ink(strokes, opts)
      }
      if (shape === 'box') {
        const strokes = rect(box.w - 4, box.h - 4, s).map(st => st.map(p => ({ x: p.x + 2, y: p.y + 2 })))
        if (isPrimary) strokes.push(...rect(box.w - 4, box.h - 4, s + '2').map(st => st.map(p => ({ x: p.x + 2, y: p.y + 2 }))))
        return ink(strokes, { ...opts, overshoot: 2 })
      }
      if (shape === 'underline') {
        return ink([underline(box.w - 8, s).map(p => ({ x: p.x + 4, y: p.y + box.h - 4 }))], { ...opts, width: 2.2 })
      }
      // sticker: an ellipse-ish blob outline; the fill is a separate layer
      return ink([ellipse(box.w / 2, box.h / 2, box.w / 2 - 2, box.h / 2 + 1, s)], opts)
    }, [box, seed, gen, shape, isPrimary, disabled, roughness])

    const fillTl: InkTimeline | null = React.useMemo(() => {
      if (!box || shape !== 'sticker') return null
      return ink([scribbleFill(box.w - 10, box.h - 10, 6)], { seed: `${seed}:${gen}:f`, roughness: 0.8, speed: 6, width: 4 })
    }, [box, seed, gen, shape])

    const arrowTl: InkTimeline | null = React.useMemo(() => {
      if (!withArrow || !box) return null
      const len = hover ? 30 : 18
      return ink(arrow({ x: 0, y: 7 }, { x: len, y: 7 }, 0.06, 6), { seed: `${seed}:arr:${hover}`, roughness: 0.8, speed: 2.4 })
    }, [withArrow, box, hover, seed])

    return (
      <button
        ref={el => { innerRef.current = el; if (typeof fwd === 'function') fwd(el); else if (fwd) fwd.current = el }}
        disabled={disabled}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onPointerUp={e => { if (!disabled) setGen(g => g + 1); onPointerUp?.(e) }}
        className={cn(
          'relative inline-flex select-none items-center gap-2 bg-transparent px-4 py-2 font-body text-sm font-bold',
          'transition-transform duration-100 active:translate-y-[2px] active:scale-[0.985]',
          disabled ? 'cursor-not-allowed text-pencil' : 'cursor-pointer',
          variant === 'danger' && 'text-danger',
          isPrimary && shape !== 'sticker' && 'text-accent',
          className,
        )}
        style={{ border: 'none', outline: 'none', transform: tilt ? `rotate(${tilt}deg)` : undefined }}
        {...rest}
      >
        {fillTl && (
          <Ink overlay timeline={fillTl} color={isPrimary ? 'var(--sui-accent)' : 'var(--sui-hl)'} className="absolute" style={{ opacity: isPrimary ? 0.24 : 0.5 }} rate={2.4} />
        )}
        <span className="relative z-10 inline-flex items-center gap-2">
          {children}
          {arrowTl && <Ink timeline={arrowTl} color={strokeColor} className="shrink-0" />}
        </span>
        {outlineTl && (
          <Ink
            overlay
            timeline={outlineTl}
            color={strokeColor}
            className={cn('absolute', shape === 'underline' && 'transition-opacity', shape === 'underline' && !hover && 'opacity-40')}
            rate={1.6}
          />
        )}
      </button>
    )
  },
)
