'use client'
import { arrow, ink, rect, type InkTimeline } from '@scribbleui/engine'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'
import { Ink, useSeed, vary } from '@/lib/ink-extra'
import { cn } from '@/lib/utils'

export interface ContextMenuItem {
  label: string
  onSelect?: () => void
  danger?: boolean
  disabled?: boolean
}

export interface ScribbleContextMenuProps {
  items: ContextMenuItem[]
  children: React.ReactNode
  seed?: string
  className?: string
}

/**
 * Options jotted exactly where you clicked, scribbling in top-to-bottom.
 * The margin arrow points at what you're about to pick; destructive items
 * are written in red ink.
 */
export function ScribbleContextMenu({ items, children, seed: seedProp, className }: ScribbleContextMenuProps) {
  const seed = useSeed(seedProp)
  const rot = vary(seed, -1.5, 1.5)
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null)
  const [active, setActive] = React.useState(0)
  const hostRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!pos) return
    const close = () => setPos(null)
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('pointerdown', close)
    window.addEventListener('keydown', esc)
    return () => { window.removeEventListener('pointerdown', close); window.removeEventListener('keydown', esc) }
  }, [pos])

  const W = 168
  const menuTl: InkTimeline = React.useMemo(
    () => ink(rect(W, items.length * 32 + 12, seed), { seed, roughness: 1, speed: 3.4, width: 1.6 }),
    [items.length, seed],
  )
  const arrowTl: InkTimeline = React.useMemo(
    () => ink(arrow({ x: 0, y: 3 }, { x: 13, y: 0 }, 0.15, 5), { seed: seed + active, roughness: 0.9, speed: 2 }),
    [seed, active],
  )

  return (
    <div
      ref={hostRef}
      className={cn('relative', className)}
      onContextMenu={e => {
        e.preventDefault()
        const r = hostRef.current!.getBoundingClientRect()
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top })
        setActive(0)
      }}
    >
      {children}
      <AnimatePresence>
        {pos && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.15 }}
            className="absolute z-40 bg-card py-1.5 shadow-[3px_4px_0_var(--sui-shadow)]"
            style={{ left: pos.x, top: pos.y, width: W, transform: `rotate(${rot}deg)` }}
            onPointerDown={e => e.stopPropagation()}
          >
            <Ink overlay timeline={menuTl} color="var(--sui-ink)" rate={3} className="absolute" />
            {items.map((it, i) => (
              <motion.button
                key={it.label}
                role="menuitem"
                disabled={it.disabled}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.035 }}
                onPointerEnter={() => setActive(i)}
                onClick={() => { it.onSelect?.(); setPos(null) }}
                className={cn(
                  'relative block w-full cursor-pointer bg-transparent px-7 py-1.5 text-left font-body text-sm',
                  it.disabled && 'cursor-not-allowed text-pencil',
                  it.danger && !it.disabled && 'text-danger',
                )}
                style={{ border: 'none' }}
              >
                {active === i && !it.disabled && (
                  <span className="absolute left-2 top-1/2 -translate-y-1/2">
                    <Ink timeline={arrowTl} color={it.danger ? 'var(--sui-danger)' : 'var(--sui-accent)'} rate={2} />
                  </span>
                )}
                {it.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
