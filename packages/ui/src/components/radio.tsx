'use client'
import { ellipse, ink, type InkTimeline } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export interface RadioOption { value: string; label: React.ReactNode; disabled?: boolean }

export interface ScribbleRadioGroupProps {
  options: RadioOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  name?: string
  seed?: string
  className?: string
  'aria-label'?: string
}

/**
 * Circle your answer. No dot-in-ring — the pen circles the chosen option's
 * label, and the previous circle fades like erased pencil.
 */
export function ScribbleRadioGroup({
  options, value: valueProp, defaultValue, onValueChange, seed: seedProp, className, ...rest
}: ScribbleRadioGroupProps) {
  const seed = useSeed(seedProp)
  const [internal, setInternal] = React.useState(defaultValue ?? '')
  const value = valueProp ?? internal
  const [gen, setGen] = React.useState(0)
  const refs = React.useRef(new Map<string, HTMLButtonElement>())
  const [circle, setCircle] = React.useState<{ tl: InkTimeline; x: number; y: number } | null>(null)
  const [fading, setFading] = React.useState<{ tl: InkTimeline; x: number; y: number } | null>(null)
  const hostRef = React.useRef<HTMLDivElement>(null)

  const pick = (v: string) => {
    if (valueProp === undefined) setInternal(v)
    onValueChange?.(v)
    setGen(g => g + 1)
  }

  React.useLayoutEffect(() => {
    const host = hostRef.current
    const el = value ? refs.current.get(value) : null
    if (!host || !el) { setCircle(null); return }
    const hb = host.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    const cx = r.left - hb.left + r.width / 2
    const cy = r.top - hb.top + r.height / 2
    const tl = ink(
      [ellipse(0, 0, r.width / 2 + r.height * 0.32, r.height * 0.78, `${seed}:${value}:${gen}`)],
      { seed: `${seed}:${value}:${gen}`, roughness: 1, speed: 1.9, width: 2 },
    )
    setCircle(prev => {
      if (prev) { setFading(prev); setTimeout(() => setFading(null), 380) }
      return { tl, x: cx, y: cy }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, gen, seed])

  return (
    <div ref={hostRef} role="radiogroup" className={cn('relative inline-flex flex-col items-start gap-1.5', className)} {...rest}>
      {options.map(o => (
        <button
          key={o.value}
          ref={el => { if (el) refs.current.set(o.value, el) }}
          role="radio"
          aria-checked={value === o.value}
          disabled={o.disabled}
          onClick={() => pick(o.value)}
          className={cn(
            'relative z-10 bg-transparent px-3 py-0.5 font-body text-sm',
            o.disabled ? 'cursor-not-allowed text-pencil' : 'cursor-pointer',
            value === o.value ? 'text-ink' : 'text-ink-soft hover:text-ink',
          )}
          style={{ border: 'none' }}
        >
          {o.label}
        </button>
      ))}
      {fading && (
        <span className="pointer-events-none absolute opacity-0 transition-opacity duration-300" style={{ left: fading.x, top: fading.y }}>
          <Ink overlay timeline={fading.tl} draw={false} color="var(--sui-pencil)" />
        </span>
      )}
      {circle && (
        <span className="pointer-events-none absolute" style={{ left: circle.x, top: circle.y }}>
          <Ink overlay timeline={circle.tl} color="var(--sui-accent)" />
        </span>
      )}
    </div>
  )
}
