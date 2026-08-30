'use client'
import { bowedLine, ink, rect, type InkTimeline } from '@scribbleui/engine'
import * as React from 'react'
import { HandChars, type HandCharStyle } from '@/lib/hand-chars'
import { Ink, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export interface ScribbleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  /** draw typed text as handwriting (default true) */
  handwrite?: boolean
  /** the hand your typing is drawn in */
  handStyle?: HandCharStyle
  seed?: string
  containerClassName?: string
}

const LINE = 32
const FONT_PX = 15
const TRACK = 6

/**
 * A ruled page that grows a line ONLY when the current one is full — and
 * shrinks back when you delete. What you type is drawn as ink on the rules.
 */
export const ScribbleTextarea = React.forwardRef<HTMLTextAreaElement, ScribbleTextareaProps>(
  function ScribbleTextarea({ label, handwrite = true, handStyle = 'print', seed: seedProp, className, containerClassName, rows = 3, onChange, id, value: valueProp, defaultValue, ...rest }, fwd) {
    const seed = useSeed(seedProp)
    const autoId = React.useId()
    const taId = id ?? autoId
    const [w, setW] = React.useState(300)
    const [cell, setCell] = React.useState(9)
    const [internal, setInternal] = React.useState(String(defaultValue ?? ''))
    const value = valueProp !== undefined ? String(valueProp) : internal
    const hostRef = React.useRef<HTMLDivElement>(null)
    const probeRef = React.useRef<HTMLSpanElement>(null)
    const taRef = React.useRef<HTMLTextAreaElement | null>(null)

    React.useLayoutEffect(() => {
      const el = hostRef.current
      if (!el) return
      const m = () => setW(p => Math.abs(p - el.clientWidth) < 1 ? p : el.clientWidth)
      m()
      const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(m) : null
      ro?.observe(el)
      return () => ro?.disconnect()
    }, [])
    React.useLayoutEffect(() => {
      if (probeRef.current) setCell(probeRef.current.getBoundingClientRect().width / 10)
    }, [])

    // manual wrap so the drawn glyphs and the real caret agree (monospace)
    const cols = Math.max(4, Math.floor((w - 24) / cell))
    const lines = React.useMemo(() => {
      // greedy word wrap that mirrors the browser's monospace soft wrap
      const out: string[] = []
      for (const raw of value.split('\n')) {
        if (raw.length <= cols) { out.push(raw); continue }
        let line = ''
        for (const word of raw.split(/(?<= )/)) { // keep trailing spaces attached
          if ((line + word).trimEnd().length <= cols) { line += word; continue }
          if (line) out.push(line)
          let rest = word
          while (rest.trimEnd().length > cols) { out.push(rest.slice(0, cols)); rest = rest.slice(cols) }
          line = rest
        }
        out.push(line)
      }
      return out.length ? out : ['']
    }, [value, cols])

    // exact height: grows only when the last rule is FULL, shrinks on delete
    const lineCount = Math.max(rows, lines.length)
    const H = lineCount * LINE + 14

    const frameTl: InkTimeline = React.useMemo(
      () => ink(rect(w - 2, H, seed).map(s => s.map(p => ({ x: p.x + 1, y: p.y }))), { seed, roughness: 0.85, speed: 3.4, width: 1.7 }),
      [w, H, seed],
    )
    const rulesTl: InkTimeline = React.useMemo(() => {
      const strokes = []
      for (let i = 1; i <= lineCount; i++) strokes.push(bowedLine(12, i * LINE + 2, w - 12, i * LINE + 2, 0.012, seed + i))
      return ink(strokes, { seed: seed + ':r', roughness: 0.55, speed: 4.5, width: 1 })
    }, [w, lineCount, seed])

    return (
      <div ref={hostRef} className={cn('relative inline-block w-72 align-top', containerClassName)}>
        <span ref={probeRef} aria-hidden className="invisible absolute font-label" style={{ fontSize: FONT_PX, letterSpacing: TRACK }}>0000000000</span>
        {label && (
          <label htmlFor={taId} className="mb-0.5 block font-label text-[11px] uppercase tracking-wide text-pencil">{label}</label>
        )}
        <div className="relative transition-[height] duration-200" style={{ height: H }}>
          <Ink overlay timeline={frameTl} draw={false} color="var(--sui-ink)" className="absolute" />
          <Ink overlay timeline={rulesTl} color="var(--sui-pencil)" className="absolute" style={{ opacity: 0.5 }} rate={3} />
          <textarea
            ref={el => { taRef.current = el; if (typeof fwd === 'function') fwd(el); else if (fwd) fwd.current = el }}
            id={taId}
            rows={lineCount}
            value={value}
            
            onChange={e => { if (valueProp === undefined) setInternal(e.target.value); onChange?.(e) }}
            className={cn('absolute inset-0 resize-none overflow-hidden bg-transparent px-3 pt-1.5 font-label outline-none placeholder:text-pencil', className)}
            style={{
              border: 'none', fontSize: FONT_PX, lineHeight: LINE + 'px', letterSpacing: TRACK,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              color: handwrite ? 'transparent' : 'var(--sui-ink)',
              caretColor: 'var(--sui-accent)',
            }}
            {...rest}
          />
          {handwrite && value && (
            <HandChars lines={lines} value={value} cell={cell} size={19} x0={12} y0={28} lineHeight={LINE} style={handStyle} seed={seed} color="var(--sui-ink)" />
          )}
        </div>
      </div>
    )
  },
)
