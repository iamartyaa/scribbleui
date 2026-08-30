'use client'
import { bowedLine, ellipse, ink, line, type InkTimeline } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useSeed, vary } from '@/lib/ink-extra'
import { cn } from '@/lib/utils'

export interface ScribbleSliderProps {
  min?: number
  max?: number
  step?: number
  value?: number
  defaultValue?: number
  onValueChange?: (v: number) => void
  disabled?: boolean
  label?: string
  seed?: string
  className?: string
  tickEvery?: number
  /** label the major ticks with their values */
  tickLabels?: boolean
  /** always show the value scrap, not just while dragging */
  showValue?: boolean
  format?: (v: number) => string
}

/**
 * A ruler you ink over. The track is pencil (draft), your setting is ink
 * (decision), the thumb is a drawn nib, and while you drag, the value rides
 * along on a little paper scrap.
 */
export function ScribbleSlider({
  min = 0, max = 100, step = 1, value: valueProp, defaultValue, onValueChange,
  disabled, label, seed: seedProp, className, tickEvery, tickLabels, showValue, format = String,
}: ScribbleSliderProps) {
  const seed = useSeed(seedProp)
  const [internal, setInternal] = React.useState(defaultValue ?? min)
  const value = valueProp ?? internal
  const [w, setW] = React.useState(240)
  const [active, setActive] = React.useState(false)
  const hostRef = React.useRef<HTMLDivElement>(null)
  const frac = (value - min) / (max - min || 1)
  const scrapRot = vary(seed + 'scrap', -4, 4)

  React.useLayoutEffect(() => {
    const el = hostRef.current
    if (!el) return
    const m = () => setW(p => Math.abs(p - el.clientWidth) < 1 ? p : el.clientWidth)
    m()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(m) : null
    ro?.observe(el)
    return () => ro?.disconnect()
  }, [])

  const trackTl: InkTimeline = React.useMemo(() => {
    const strokes = [bowedLine(0, 12, w, 12, 0.015, seed)]
    if (tickEvery) {
      for (let v = min; v <= max; v += tickEvery) {
        const x = ((v - min) / (max - min)) * w
        const major = (v - min) % (tickEvery * 5) === 0
        strokes.push(line(x, major ? 5 : 8, x, major ? 19 : 16))
      }
    }
    return ink(strokes, { seed, roughness: 0.7, speed: 3, width: 1.3 })
  }, [w, seed, min, max, tickEvery])

  const inkTl: InkTimeline = React.useMemo(
    () => ink([bowedLine(0, 12, Math.max(2, frac * w), 12, 0.02, seed + 'ink')], { seed: seed + ':i', roughness: 0.8, speed: 3, width: 3.2 }),
    [w, frac, seed],
  )
  const nibTl: InkTimeline = React.useMemo(
    () => ink([ellipse(0, 0, 7, 7, seed + 'nib')], { seed: seed + ':n', roughness: 0.9, speed: 1.6, width: 2 }),
    [seed],
  )

  const showScrap = showValue || active
  return (
    <div ref={hostRef} className={cn('relative inline-block w-60 pt-9', disabled && 'opacity-60', className)}>
      {showScrap && (
        <span
          className="pointer-events-none absolute top-0 -translate-x-1/2 bg-card px-2 py-0.5 font-hand text-lg text-accent shadow-[2px_2px_0_var(--sui-shadow)] transition-[left] duration-75"
          style={{ left: Math.min(Math.max(frac * w, 16), w - 16), transform: `translateX(-50%) rotate(${scrapRot}deg)`, border: '1.3px solid var(--sui-ink)' }}
        >{format(value)}</span>
      )}
      <div className="relative h-6">
        <Ink timeline={trackTl} draw={false} color="var(--sui-pencil)" overlay className="absolute" style={{ opacity: 0.7 }} />
        <Ink timeline={inkTl} draw={false} color="var(--sui-accent)" overlay className="absolute" />
        <span
          className={cn('pointer-events-none absolute transition-transform', active && 'scale-125')}
          style={{ left: frac * w, top: 12 }}
        >
          <Ink overlay timeline={nibTl} draw={false} color="var(--sui-accent)" />
          <span className="absolute -left-0.5 -top-0.5 size-1 rounded-full" style={{ background: 'var(--sui-accent)' }} />
        </span>
        <input
          type="range"
          aria-label={label}
          min={min} max={max} step={step} value={value} disabled={disabled}
          onPointerDown={() => setActive(true)}
          onPointerUp={() => setActive(false)}
          onBlur={() => setActive(false)}
          onChange={e => {
            const v = Number(e.target.value)
            if (valueProp === undefined) setInternal(v)
            onValueChange?.(v)
          }}
          className="absolute inset-x-0 -top-1 h-8 w-full cursor-pointer opacity-0"
        />
      </div>
      {tickEvery && tickLabels && (
        <div className="relative mt-0.5 h-4">
          {Array.from({ length: Math.floor((max - min) / (tickEvery * 5)) + 1 }, (_, i) => {
            const v = min + i * tickEvery * 5
            if (v > max) return null
            return (
              <span key={v} className="absolute -translate-x-1/2 font-label text-[10px] text-pencil" style={{ left: ((v - min) / (max - min)) * w }}>
                {format(v)}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
