'use client'
import { ellipse, ink, rect, tick, type InkTimeline } from '@scribbleui/engine'
import { vary } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useCalm, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export interface SelectOption { value: string; label: string; disabled?: boolean }

export interface ScribbleSelectProps {
  options: SelectOption[]
  /** single-select value */
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  /** multi-select mode: circles stay on every pick */
  multiple?: boolean
  values?: string[]
  defaultValues?: string[]
  onValuesChange?: (v: string[]) => void
  placeholder?: string
  disabled?: boolean
  seed?: string
  className?: string
  'aria-label'?: string
}

/**
 * Options on a dropped paper scrap. Picking circles the option — the circle
 * lands exactly around the row, exam-paper style. Multi-select keeps every
 * circle and adds a tick in the margin.
 */
export function ScribbleSelect({
  options, value: valueProp, defaultValue, onValueChange,
  multiple, values: valuesProp, defaultValues, onValuesChange,
  placeholder = 'pick one…', disabled, seed: seedProp, className, ...rest
}: ScribbleSelectProps) {
  const seed = useSeed(seedProp)
  const calm = useCalm()
  const [internal, setInternal] = React.useState(defaultValue ?? '')
  const [internalMulti, setInternalMulti] = React.useState<string[]>(defaultValues ?? [])
  const value = valueProp ?? internal
  const values = valuesProp ?? internalMulti
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(0)
  const [closingPick, setClosingPick] = React.useState<string | null>(null)
  const hostRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const rowRefs = React.useRef(new Map<string, HTMLDivElement>())
  const [w, setW] = React.useState(200)
  const rot = vary(seed, -1.8, 1.8)

  React.useLayoutEffect(() => {
    const el = hostRef.current
    if (el) setW(Math.max(160, el.clientWidth))
  }, [])

  React.useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent) => { if (!hostRef.current?.contains(e.target as Node)) setOpen(false) }
    window.addEventListener('pointerdown', close)
    return () => window.removeEventListener('pointerdown', close)
  }, [open])

  const boxTl: InkTimeline = React.useMemo(
    () => ink([...rect(w, 36, seed), [{ x: w - 24, y: 15 }, { x: w - 17, y: 22 }, { x: w - 10, y: 15 }]], { seed, roughness: 0.7, speed: 2.6, width: 1.8 }),
    [w, seed],
  )
  const scrapTl: InkTimeline = React.useMemo(
    () => ink(rect(w, options.length * 34 + 14, seed + ':scrap'), { seed: seed + ':s', roughness: 1, speed: 3, width: 1.6 }),
    [w, options.length, seed],
  )
  const tickTl: InkTimeline = React.useMemo(
    () => ink([tick(10)], { seed: seed + ':t', roughness: 0.9, speed: 1.8, width: 2 }),
    [seed],
  )

  /** circle drawn around one option ROW, measured from the real row element */
  const CircleAround = ({ v, drawn }: { v: string; drawn: boolean }) => {
    const [geo, setGeo] = React.useState<{ x: number; y: number; rx: number; ry: number } | null>(null)
    React.useLayoutEffect(() => {
      const row = rowRefs.current.get(v)
      const list = listRef.current
      if (!row || !list) return
      const lb = list.getBoundingClientRect()
      const rb = row.getBoundingClientRect()
      setGeo({
        x: rb.left - lb.left + rb.width / 2,
        y: rb.top - lb.top + rb.height / 2,
        rx: Math.min(rb.width / 2 + 6, rb.width * 0.46),
        ry: rb.height / 2 + 4,
      })
    }, [v])
    const tl = React.useMemo(
      () => geo ? ink([ellipse(0, 0, geo.rx, geo.ry, seed + v)], { seed: seed + ':c' + v, roughness: 1, speed: 2.4, width: 2 }) : null,
      [geo, v],
    )
    if (!geo || !tl) return null
    return (
      <span className="pointer-events-none absolute" style={{ left: geo.x, top: geo.y }}>
        <Ink overlay timeline={tl} draw={drawn} color="var(--sui-accent)" />
      </span>
    )
  }

  const pickSingle = (v: string) => {
    setClosingPick(v)
    const commit = () => {
      if (valueProp === undefined) setInternal(v)
      onValueChange?.(v)
      setOpen(false)
      setClosingPick(null)
    }
    if (calm) commit()
    else setTimeout(commit, 380)
  }
  const pickMulti = (v: string) => {
    const next = values.includes(v) ? values.filter(x => x !== v) : [...values, v]
    if (valuesProp === undefined) setInternalMulti(next)
    onValuesChange?.(next)
  }

  const chosen = options.find(o => o.value === value)
  const triggerLabel = multiple
    ? (values.length ? `${values.length} picked` : placeholder)
    : (chosen?.label ?? placeholder)

  return (
    <div ref={hostRef} className={cn('relative inline-block w-52 align-top', disabled && 'opacity-60', className)}>
      <button
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive(a => Math.min(options.length - 1, a + 1)) }
          if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a - 1)) }
          if (e.key === 'Enter' && open) { e.preventDefault(); (multiple ? pickMulti : pickSingle)(options[active].value) }
          if (e.key === 'Escape') setOpen(false)
        }}
        className="relative block h-9 w-full cursor-pointer bg-transparent px-3 text-left font-body text-sm"
        style={{ border: 'none', color: (multiple ? values.length : chosen) ? 'var(--sui-ink)' : 'var(--sui-pencil)' }}
        {...rest}
      >
        {triggerLabel}
        <Ink overlay timeline={boxTl} draw={false} color="var(--sui-ink)" className="absolute" />
      </button>
      {open && (
        <div
          ref={listRef}
          role="listbox"
          aria-multiselectable={multiple}
          className="absolute left-2 top-full z-30 mt-1 w-full bg-card py-2 shadow-[3px_4px_0_var(--sui-shadow)]"
          style={{ transform: `rotate(${rot}deg)`, transformOrigin: 'top left' }}
        >
          <Ink overlay timeline={scrapTl} color="var(--sui-ink)" rate={2.5} className="absolute" />
          {options.map((o, i) => {
            const picked = multiple ? values.includes(o.value) : o.value === value
            return (
              <div
                key={o.value}
                ref={el => { if (el) rowRefs.current.set(o.value, el) }}
                role="option"
                aria-selected={picked}
                onPointerEnter={() => setActive(i)}
                onClick={() => !o.disabled && (multiple ? pickMulti : pickSingle)(o.value)}
                className={cn(
                  'relative cursor-pointer px-4 py-1.5 font-body text-sm',
                  o.disabled && 'cursor-not-allowed text-pencil',
                  i === active && !o.disabled && 'text-accent',
                )}
              >
                {multiple && picked && (
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 text-accent"><Ink timeline={tickTl} rate={2} /></span>
                )}
                {o.label}
              </div>
            )
          })}
          {/* circles live at the LIST level so they wrap the measured rows */}
          {multiple
            ? values.map(v => <CircleAround key={v} v={v} drawn />)
            : closingPick && <CircleAround v={closingPick} drawn />}
        </div>
      )}
    </div>
  )
}
