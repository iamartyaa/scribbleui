'use client'
import { arrow, bowedLine, ink, type InkTimeline } from '@scribbleui/engine'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'
import { Ink, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export interface SidebarItem { value: string; label: React.ReactNode; icon?: React.ReactNode; badge?: React.ReactNode }
export interface SidebarGroup { title?: string; items: SidebarItem[]; collapsible?: boolean }

export interface ScribbleSidebarProps {
  /** flat items, or grouped sections with collapsible folds */
  items?: SidebarItem[]
  groups?: SidebarGroup[]
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  title?: string
  /** 'arrow' points from the margin; 'swipe' highlights; 'both' does both */
  marker?: 'arrow' | 'swipe' | 'both'
  seed?: string
  className?: string
}

/**
 * A jotted list that scales from a flat nav to grouped, collapsible,
 * icon-and-badge sections — with a margin arrow that pen-lift hops to
 * "you are here" and an optional highlighter swipe.
 */
export function ScribbleSidebar({
  items, groups: groupsProp, value: valueProp, defaultValue, onValueChange,
  title, marker = 'both', seed: seedProp, className,
}: ScribbleSidebarProps) {
  const groups = groupsProp ?? (items ? [{ items }] : [])
  const seed = useSeed(seedProp)
  const first = groups[0]?.items[0]?.value
  const [internal, setInternal] = React.useState(defaultValue ?? first)
  const value = valueProp ?? internal
  const [gen, setGen] = React.useState(0)
  const [closed, setClosed] = React.useState<Set<number>>(new Set())
  const refs = React.useRef(new Map<string, HTMLButtonElement>())
  const hostRef = React.useRef<HTMLElement>(null)
  const [marks, setMarks] = React.useState<{ arrowTl: InkTimeline; swipeTl: InkTimeline; y: number } | null>(null)

  React.useLayoutEffect(() => {
    const host = hostRef.current
    const el = value ? refs.current.get(value) : null
    if (!host || !el) { setMarks(null); return }
    const hb = host.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    const y = r.top - hb.top + r.height / 2
    const s = `${seed}:${value}:${gen}`
    setMarks({
      y,
      arrowTl: ink(arrow({ x: 0, y: 0 }, { x: 18, y: 0 }, 0.12, 6), { seed: s, roughness: 0.9, speed: 2 }),
      swipeTl: ink([bowedLine(0, 0, r.width, 0, 0.03, s)], { seed: s + 'sw', roughness: 1, speed: 3.4, width: r.height * 0.75 }),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, gen, seed, closed])

  const pick = (v: string) => {
    if (valueProp === undefined) setInternal(v)
    onValueChange?.(v)
    setGen(g => g + 1)
  }

  return (
    <nav ref={hostRef} className={cn('relative inline-block min-w-44 py-1 pl-7', className)}>
      {title && <div className="mb-2 font-label text-[11px] uppercase tracking-wide text-pencil">{title}</div>}
      <div className="flex flex-col items-stretch gap-0.5">
        {groups.map((g, gi) => (
          <div key={gi} className={cn(gi > 0 && 'mt-3')}>
            {g.title && (
              <button
                onClick={() => g.collapsible && setClosed(c => {
                  const n = new Set(c); n.has(gi) ? n.delete(gi) : n.add(gi); return n
                })}
                className={cn('mb-1 flex w-full items-center gap-1.5 bg-transparent p-0 text-left font-label text-[10.5px] uppercase tracking-widest text-pencil', g.collapsible && 'cursor-pointer hover:text-ink-soft')}
                style={{ border: 'none' }}
              >
                {g.collapsible && <span className="font-hand text-sm">{closed.has(gi) ? '+' : '–'}</span>}
                {g.title}
              </button>
            )}
            <AnimatePresence initial={false}>
              {!closed.has(gi) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-stretch gap-0.5 overflow-hidden"
                >
                  {g.items.map(it => (
                    <button
                      key={it.value}
                      ref={el => { if (el) refs.current.set(it.value, el) }}
                      onClick={() => pick(it.value)}
                      aria-current={value === it.value ? 'true' : undefined}
                      className={cn(
                        'relative cursor-pointer bg-transparent px-2 py-1 text-left font-body text-sm',
                        value === it.value ? 'font-bold text-ink' : 'text-ink-soft hover:text-ink',
                      )}
                      style={{ border: 'none' }}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {it.icon && <span className="inline-flex w-5 justify-center">{it.icon}</span>}
                        <span className="flex-1">{it.label}</span>
                        {it.badge && <span className="font-hand text-sm text-danger">{it.badge}</span>}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      {marks && (marker === 'arrow' || marker === 'both') && (
        <span className="pointer-events-none absolute left-0" style={{ top: marks.y }}>
          <Ink overlay timeline={marks.arrowTl} color="var(--sui-accent)" />
        </span>
      )}
      {marks && (marker === 'swipe' || marker === 'both') && (
        <span className="pointer-events-none absolute left-6" style={{ top: marks.y }}>
          <Ink overlay timeline={marks.swipeTl} color="var(--sui-hl)" style={{ mixBlendMode: 'multiply', opacity: 0.4 }} rate={2.2} />
        </span>
      )}
    </nav>
  )
}
