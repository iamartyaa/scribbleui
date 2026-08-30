'use client'
import { ink, rect, type InkTimeline } from '@scribbleui/engine'
import { motion, AnimatePresence } from 'motion/react'
import * as React from 'react'
import { Ink, useSeed, vary } from '@/lib/ink-extra'
import { cn } from '@/lib/utils'

export interface ScribblePopoverProps {
  trigger: React.ReactNode
  children: React.ReactNode
  seed?: string
  className?: string
}

/**
 * A sticky note slapped on with tape — it lands with a squash-settle at a
 * seeded 1–3° angle (humans never tape straight), and peels off by a corner.
 */
export function ScribblePopover({ trigger, children, seed: seedProp, className }: ScribblePopoverProps) {
  const seed = useSeed(seedProp)
  const rot = vary(seed, -3, 3)
  const tapeRot = vary(seed + 't', -6, 6)
  const [open, setOpen] = React.useState(false)
  const [size, setSize] = React.useState<{ w: number; h: number } | null>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const hostRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent) => { if (!hostRef.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('pointerdown', close)
    window.addEventListener('keydown', esc)
    return () => { window.removeEventListener('pointerdown', close); window.removeEventListener('keydown', esc) }
  }, [open])

  React.useLayoutEffect(() => {
    if (open && panelRef.current) {
      // offsetWidth/Height ignore the entry animation's scale transform
      setSize({ w: panelRef.current.offsetWidth, h: panelRef.current.offsetHeight })
    }
  }, [open])

  const borderTl: InkTimeline | null = React.useMemo(
    () => size ? ink(rect(size.w, size.h, seed), { seed, roughness: 1.1, speed: 3.2, width: 1.6 }) : null,
    [size, seed],
  )

  return (
    <div ref={hostRef} className="relative inline-block">
      <span onClick={() => setOpen(o => !o)}>{trigger}</span>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.7, rotate: rot * 3, y: -14, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, rotate: rot, y: 0, x: '-50%' }}
            exit={{ opacity: 0, rotate: rot + 8, y: 10, x: '-50%', transition: { duration: 0.18 } }}
            transition={{ type: 'spring', stiffness: 480, damping: 22 }}
            className={cn('absolute left-1/2 top-full z-40 mt-3 w-56 bg-card p-4 shadow-[3px_5px_0_var(--sui-shadow)]', className)}
            style={{ transformOrigin: 'top center' }}
          >
            <span
              aria-hidden
              className="absolute -top-2 left-1/2 h-4 w-12 -translate-x-1/2"
              style={{ background: 'var(--sui-hl)', opacity: 0.5, transform: `translateX(-50%) rotate(${tapeRot}deg)` }}
            />
            {borderTl && <Ink overlay timeline={borderTl} color="var(--sui-ink)" rate={2.6} className="absolute" />}
            <div className="relative font-body text-sm">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
