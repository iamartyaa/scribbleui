'use client'
import { bowedLine, ink, tick, zigzag, type InkTimeline } from '@scribbleui/engine'
import * as React from 'react'
import { HandChars } from '@/lib/hand-chars'
import { Ink, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export interface ScribbleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  /** teacher's red scribble + note under the line */
  error?: string
  /** small tick at the line's end */
  success?: boolean
  /** draw what the user types as handwriting (default true) */
  handwrite?: boolean
  seed?: string
  containerClassName?: string
}

const CELL = 11.6 // Spline Sans Mono @ 15px ≈ 9px; we set 15px mono below → measure once
const FONT_PX = 15

/**
 * A ruled writing line instead of a box — and what you type is drawn back
 * as ink, character by character, right where the caret is. Errors get the
 * teacher's red scribble.
 */
export const ScribbleInput = React.forwardRef<HTMLInputElement, ScribbleInputProps>(
  function ScribbleInput({ label, error, success, handwrite = true, seed: seedProp, className, containerClassName, onFocus, onBlur, onChange, id, value: valueProp, defaultValue, ...rest }, fwd) {
    const seed = useSeed(seedProp)
    const autoId = React.useId()
    const inputId = id ?? autoId
    const [focused, setFocused] = React.useState(false)
    const [internal, setInternal] = React.useState(String(defaultValue ?? ''))
    const value = valueProp !== undefined ? String(valueProp) : internal
    const [w, setW] = React.useState(220)
    const [cell, setCell] = React.useState(CELL)
    const hostRef = React.useRef<HTMLDivElement>(null)
    const probeRef = React.useRef<HTMLSpanElement>(null)

    React.useLayoutEffect(() => {
      const el = hostRef.current
      if (!el) return
      const m = () => setW(prev => Math.abs(prev - el.clientWidth) < 1 ? prev : el.clientWidth)
      m()
      const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(m) : null
      ro?.observe(el)
      return () => ro?.disconnect()
    }, [])
    React.useLayoutEffect(() => {
      // measure the real monospace advance once
      if (probeRef.current) setCell(probeRef.current.getBoundingClientRect().width / 10)
    }, [])

    const lineTl: InkTimeline = React.useMemo(
      () => ink([bowedLine(0, 0, w, 0, 0.02, seed)], { seed, roughness: 0.9, speed: 2.8, width: 1.8 }),
      [w, seed],
    )
    const errTl: InkTimeline | null = React.useMemo(
      () => error ? ink([zigzag(w, 5, Math.max(4, Math.round(w / 26)))], { seed: seed + ':err', roughness: 1.3, speed: 3 }) : null,
      [error, w, seed],
    )
    const okTl: InkTimeline | null = React.useMemo(
      () => success ? ink([tick(12)], { seed: seed + ':ok', roughness: 0.9, speed: 2 }) : null,
      [success, seed],
    )

    return (
      <div ref={hostRef} className={cn('relative inline-block w-56 align-top', containerClassName)}>
        <span ref={probeRef} aria-hidden className="invisible absolute font-label" style={{ fontSize: FONT_PX }}>0000000000</span>
        {label && (
          <label htmlFor={inputId} className="mb-0.5 block font-label text-[11px] uppercase tracking-wide text-pencil">
            {label}
          </label>
        )}
        <div className="relative" style={{ height: 30 }}>
          <input
            ref={fwd}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? inputId + '-err' : undefined}
            value={value}
            onChange={e => { if (valueProp === undefined) setInternal(e.target.value); onChange?.(e) }}
            onFocus={e => { setFocused(true); onFocus?.(e) }}
            onBlur={e => { setFocused(false); onBlur?.(e) }}
            className={cn('w-full bg-transparent pb-1 font-label outline-none placeholder:text-pencil', className)}
            style={{
              border: 'none', fontSize: FONT_PX, letterSpacing: 0,
              color: handwrite ? 'transparent' : 'var(--sui-ink)',
              caretColor: 'var(--sui-accent)',
            }}
            {...rest}
          />
          {handwrite && value && (
            <HandChars value={value} cell={cell} size={19} x0={1} y0={21} seed={seed} color="var(--sui-ink)" />
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0">
            <Ink timeline={lineTl} draw={false} color="var(--sui-pencil)" style={{ opacity: 0.45 }} overlay className="absolute" />
            {focused && <Ink timeline={lineTl} color="var(--sui-accent)" overlay className="absolute" />}
            {!focused && !!value && <Ink timeline={lineTl} draw={false} color="var(--sui-ink)" overlay className="absolute" />}
          </div>
          {okTl && (
            <span className="pointer-events-none absolute -right-5 bottom-1 text-accent">
              <Ink timeline={okTl} width={2.4} />
            </span>
          )}
        </div>
        {error && (
          <div className="relative mt-1">
            <Ink timeline={errTl!} color="var(--sui-danger)" width={1.6} />
            <p id={inputId + '-err'} className="mt-0.5 font-hand text-base leading-tight text-danger">{error}</p>
          </div>
        )}
      </div>
    )
  },
)
