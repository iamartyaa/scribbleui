'use client'
import { cross, ink, rect, type InkTimeline } from '@scribbleui/engine'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { Ink, useSeed, vary } from '@/lib/ink-extra'
import { cn } from '@/lib/utils'

export interface ScribbleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: React.ReactNode
  children: React.ReactNode
  seed?: string
  className?: string
}

/**
 * A fresh sheet placed over your work. The page behind turns to pencil
 * (grayscale, faded — a draft of itself); the modal is the only ink on the
 * desk. Closing crumples it away, and the ✗ is drawn in red.
 */
export function ScribbleModal({ open, onOpenChange, title, children, seed: seedProp, className }: ScribbleModalProps) {
  const seed = useSeed(seedProp)
  const rot = vary(seed, -1.2, 1.2)
  const [size, setSize] = React.useState<{ w: number; h: number } | null>(null)
  const sheetRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onOpenChange(false) }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open, onOpenChange])

  React.useLayoutEffect(() => {
    if (open && sheetRef.current) {
      setSize({ w: sheetRef.current.offsetWidth, h: sheetRef.current.offsetHeight })
    }
  }, [open])

  const borderTl: InkTimeline | null = React.useMemo(
    () => size ? ink(rect(size.w - 2, size.h - 2, seed).map(s => s.map(p => ({ x: p.x + 1, y: p.y + 1 }))), { seed, roughness: 0.9, speed: 3.6, overshoot: 2, width: 2 }) : null,
    [size, seed],
  )
  const xTl: InkTimeline = React.useMemo(
    () => ink(cross(14), { seed: seed + ':x', roughness: 1, speed: 2.2, width: 2.2 }),
    [seed],
  )

  if (typeof document === 'undefined') return null
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ background: 'color-mix(in srgb, var(--sui-paper) 55%, transparent)', backdropFilter: 'grayscale(0.85) contrast(0.92)' }}
          onPointerDown={e => { if (e.target === e.currentTarget) onOpenChange(false) }}
        >
          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            initial={{ y: -40, rotate: rot * 4, opacity: 0 }}
            animate={{ y: 0, rotate: rot, opacity: 1 }}
            exit={{ scale: 0.6, rotate: rot * 6, opacity: 0, transition: { duration: 0.22 } }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className={cn('relative w-full max-w-md bg-card p-6 shadow-[6px_8px_0_var(--sui-shadow)]', className)}
          >
            {borderTl && <Ink overlay pad={8} timeline={borderTl} color="var(--sui-ink)" rate={2.2} className="absolute" />}
            <button
              aria-label="close"
              onClick={() => onOpenChange(false)}
              className="absolute right-3 top-3 cursor-pointer bg-transparent p-1"
              style={{ border: 'none' }}
            >
              <Ink timeline={xTl} color="var(--sui-danger)" rate={1.6} />
            </button>
            {title && <h2 className="mb-2 pr-8 font-display text-xl font-bold">{title}</h2>}
            <div className="font-body text-sm text-ink-soft">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
