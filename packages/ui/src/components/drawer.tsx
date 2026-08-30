'use client'
import { ink, line, rect, type InkTimeline } from '@scribbleui/engine'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { Ink, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export interface ScribbleDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  side?: 'right' | 'left' | 'bottom'
  title?: React.ReactNode
  children: React.ReactNode
  seed?: string
  className?: string
}

/**
 * The page has a folded flap you didn't know about: a dashed crease marks the
 * fold, and the panel unfolds along it with paper-stiff ease.
 */
export function ScribbleDrawer({ open, onOpenChange, side = 'right', title, children, seed: seedProp, className }: ScribbleDrawerProps) {
  const seed = useSeed(seedProp)
  const [size, setSize] = React.useState<{ w: number; h: number } | null>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onOpenChange(false) }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open, onOpenChange])

  React.useLayoutEffect(() => {
    if (open && panelRef.current) {
      const r = panelRef.current.getBoundingClientRect()
      setSize({ w: r.width, h: r.height })
    }
  }, [open])

  const creaseTl: InkTimeline | null = React.useMemo(() => {
    if (!size) return null
    const vertical = side !== 'bottom'
    const len = vertical ? size.h : size.w
    const dashes = []
    for (let p = 6; p < len - 6; p += 16) {
      dashes.push(vertical ? line(1, p, 1, p + 8) : line(p, 1, p + 8, 1))
    }
    return ink(dashes, { seed, roughness: 0.8, speed: 3.5, width: 1.6, flightBase: 12 })
  }, [size, side, seed])

  const frameTl: InkTimeline | null = React.useMemo(
    () => size ? ink(rect(size.w - 2, size.h - 2, seed), { seed, roughness: 0.8, speed: 4, width: 1.6 }) : null,
    [size, seed],
  )

  const variants = {
    right: { closed: { x: '100%' }, open: { x: 0 } },
    left: { closed: { x: '-100%' }, open: { x: 0 } },
    bottom: { closed: { y: '100%' }, open: { y: 0 } },
  }[side]

  if (typeof document === 'undefined') return null
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ background: 'color-mix(in srgb, var(--sui-ink) 12%, transparent)' }}
          onPointerDown={e => { if (e.target === e.currentTarget) onOpenChange(false) }}
        >
          <motion.div
            ref={panelRef}
            role="dialog" aria-modal="true"
            initial="closed" animate="open" exit="closed"
            variants={variants}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className={cn(
              'absolute bg-card p-5 shadow-[6px_0_0_var(--sui-shadow)]',
              side === 'right' && 'inset-y-0 right-0 w-80',
              side === 'left' && 'inset-y-0 left-0 w-80',
              side === 'bottom' && 'inset-x-0 bottom-0 h-72',
              className,
            )}
          >
            {frameTl && <Ink overlay timeline={frameTl} color="var(--sui-ink)" rate={3} className="absolute" />}
            {creaseTl && (
              <span className={cn('pointer-events-none absolute', side === 'right' && 'left-0 top-0', side === 'left' && 'right-0 top-0', side === 'bottom' && 'left-0 top-0 w-full')}>
                <Ink overlay timeline={creaseTl} color="var(--sui-pencil)" rate={3} />
              </span>
            )}
            {title && <h2 className="mb-2 font-display text-lg font-bold">{title}</h2>}
            <div className="font-body text-sm text-ink-soft">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
