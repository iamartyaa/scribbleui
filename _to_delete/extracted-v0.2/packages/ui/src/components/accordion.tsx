'use client'
import { bowedLine, bracket, ink, line, underline, type InkTimeline } from '@scribbleui/engine'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'
import { Ink, useSeed, vary } from '@/lib/ink-extra'
import { cn } from '@/lib/utils'

export interface AccordionItem { value: string; title: React.ReactNode; content: React.ReactNode }

export interface ScribbleAccordionProps {
  items: AccordionItem[]
  defaultValue?: string
  /** allow multiple rows open at once */
  multiple?: boolean
  seed?: string
  className?: string
}

/** A plus that re-draws into a minus — hands don't rotate glyphs. */
function PlusMinus({ open, seed }: { open: boolean; seed: string }) {
  const tl = React.useMemo(() => {
    const strokes = open
      ? [line(0, 6, 12, 6)]
      : [line(0, 6, 12, 6), line(6, 0, 6, 12)]
    return ink(strokes, { seed: seed + open, roughness: 1, speed: 1.9, width: 2, flightBase: 40 })
  }, [open, seed])
  return <Ink timeline={tl} color={open ? 'var(--sui-accent)' : 'var(--sui-pencil)'} rate={1.8} />
}

function Row({ it, open, onToggle, seed, last }: { it: AccordionItem; open: boolean; onToggle: () => void; seed: string; last: boolean }) {
  const [h, setH] = React.useState(0)
  const [w, setW] = React.useState(400)
  const bodyRef = React.useRef<HTMLDivElement>(null)
  const rowRef = React.useRef<HTMLDivElement>(null)
  const [hover, setHover] = React.useState(false)
  const rot = vary(seed, -0.5, 0.5)

  React.useLayoutEffect(() => {
    if (open && bodyRef.current) setH(bodyRef.current.scrollHeight)
  }, [open, it.content])
  React.useLayoutEffect(() => {
    const el = rowRef.current
    if (!el) return
    const m = () => setW(p => Math.abs(p - el.clientWidth) < 1 ? p : el.clientWidth)
    m()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(m) : null
    ro?.observe(el)
    return () => ro?.disconnect()
  }, [])

  const sepTl: InkTimeline = React.useMemo(
    () => ink([bowedLine(0, 0, w, 0, 0.02, seed + 'sep')], { seed: seed + ':sep', roughness: 0.9, speed: 4.5, width: 1.1 }),
    [w, seed],
  )
  const titleLine: InkTimeline = React.useMemo(
    () => ink([underline(Math.min(w * 0.5, 220), seed + 'u')], { seed: seed + ':u', roughness: 1, speed: 2.4, width: 1.8 }),
    [w, seed],
  )
  const bracketTl: InkTimeline | null = React.useMemo(
    () => h ? ink([bracket(h - 8, 8)], { seed: seed + h, roughness: 0.9, speed: 1.8, width: 1.8 }) : null,
    [h, seed],
  )

  return (
    <div ref={rowRef} className="relative">
      <button
        aria-expanded={open}
        onClick={onToggle}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        className="relative flex w-full cursor-pointer items-center justify-between gap-3 bg-transparent px-1.5 py-3 text-left font-body text-sm font-bold text-ink"
        style={{ border: 'none' }}
      >
        <span className="relative">
          {it.title}
          {(open || hover) && (
            <span className="absolute -bottom-1.5 left-0">
              <Ink overlay timeline={titleLine} color={open ? 'var(--sui-accent)' : 'var(--sui-pencil)'} rate={2} style={hover && !open ? { opacity: 0.5 } : undefined} />
            </span>
          )}
        </span>
        <PlusMinus open={open} seed={seed} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0, rotate: rot * 2 }}
            animate={{ height: 'auto', opacity: 1, rotate: 0 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.32, 0.9, 0.35, 1] }}
            className="overflow-hidden"
          >
            <div ref={bodyRef} className="relative bg-paper-2 py-3 pl-7 pr-3 font-body text-sm text-ink-soft">
              {bracketTl && (
                <span className="absolute left-1.5 top-3">
                  <Ink overlay timeline={bracketTl} color="var(--sui-accent)" />
                </span>
              )}
              {it.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!last && <Ink timeline={sepTl} draw={false} color="var(--sui-pencil)" style={{ opacity: 0.55, display: 'block' }} />}
    </div>
  )
}

/**
 * Paper strips, not list rows: separators are wavy pencil lines, the open
 * title gets underlined in ink, a drawn bracket claims exactly the revealed
 * content, and the chevron is a plus that re-draws into a minus.
 */
export function ScribbleAccordion({ items, defaultValue, multiple, seed: seedProp, className }: ScribbleAccordionProps) {
  const seed = useSeed(seedProp)
  const [open, setOpen] = React.useState<string[]>(defaultValue ? [defaultValue] : [])
  const toggle = (v: string) => setOpen(o =>
    o.includes(v) ? o.filter(x => x !== v) : multiple ? [...o, v] : [v],
  )
  return (
    <div className={cn('w-full', className)}>
      {items.map((it, i) => (
        <Row
          key={it.value}
          it={it}
          seed={seed + it.value}
          open={open.includes(it.value)}
          onToggle={() => toggle(it.value)}
          last={i === items.length - 1}
        />
      ))}
    </div>
  )
}
