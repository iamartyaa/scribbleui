'use client'
import { ink, rect, tick, cross, type InkTimeline } from '@scribbleui/engine'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { Ink, useSeed, vary } from '@/lib/ink-extra'
import { cn } from '@/lib/utils'

export type ToastKind = 'note' | 'success' | 'error'
export interface ToastData { id: number; message: string; kind: ToastKind }

let nextId = 1
const listeners = new Set<(t: ToastData) => void>()

/** Slide a note across the desk. */
export function toast(message: string, kind: ToastKind = 'note'): void {
  const t = { id: nextId++, message, kind }
  listeners.forEach(l => l(t))
}
toast.success = (m: string) => toast(m, 'success')
toast.error = (m: string) => toast(m, 'error')

function ToastCard({ t, onGone, seedBase }: { t: ToastData; onGone: (id: number) => void; seedBase: string }) {
  const seed = `${seedBase}:${t.id}`
  const rot = vary(seed, -2.5, 2.5)
  const [size, setSize] = React.useState<{ w: number; h: number } | null>(null)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect()
      setSize({ w: r.width, h: r.height })
    }
  }, [])
  React.useEffect(() => {
    const timer = setTimeout(() => onGone(t.id), 5200)
    return () => clearTimeout(timer)
  }, [t.id, onGone])

  const borderTl: InkTimeline | null = React.useMemo(
    () => size ? ink(rect(size.w - 2, size.h - 2, seed), { seed, roughness: 1, speed: 4, width: 1.5 }) : null,
    [size, seed],
  )
  const glyphTl: InkTimeline | null = React.useMemo(() => {
    if (t.kind === 'success') return ink([tick(13)], { seed, roughness: 0.9, speed: 1.6, width: 2.4 })
    if (t.kind === 'error') return ink(cross(12), { seed, roughness: 1, speed: 2, width: 2.2 })
    return null
  }, [t.kind, seed])

  return (
    <motion.div
      ref={ref}
      layout
      role="status"
      initial={{ x: 90, opacity: 0, rotate: rot + 4 }}
      animate={{ x: 0, opacity: 1, rotate: rot }}
      exit={{ x: 140, opacity: 0, rotate: rot + 10, transition: { duration: 0.22 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={(_, info) => { if (info.offset.x > 80) onGone(t.id) }}
      className="relative w-64 cursor-grab bg-card px-4 py-3 shadow-[3px_4px_0_var(--sui-shadow)] active:cursor-grabbing"
    >
      {borderTl && <Ink overlay timeline={borderTl} color="var(--sui-ink)" rate={3} className="absolute" />}
      <div className="flex items-start gap-2.5">
        {glyphTl && (
          <span className="mt-0.5 shrink-0" style={{ color: t.kind === 'error' ? 'var(--sui-danger)' : 'var(--sui-accent)' }}>
            <Ink timeline={glyphTl} />
          </span>
        )}
        <p className="m-0 font-body text-sm">{t.message}</p>
      </div>
    </motion.div>
  )
}

/** Mount once. Toasts stack messily on purpose — a tidy stack is a machine's stack. */
export function ScribbleToaster({ className }: { className?: string }) {
  const seedBase = useSeed('toaster')
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  React.useEffect(() => {
    const on = (t: ToastData) => setToasts(ts => [...ts, t].slice(-3))
    listeners.add(on)
    return () => { listeners.delete(on) }
  }, [])
  const gone = React.useCallback((id: number) => setToasts(ts => ts.filter(t => t.id !== id)), [])

  if (typeof document === 'undefined') return null
  return createPortal(
    <div className={cn('fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2.5', className)}>
      <AnimatePresence>
        {toasts.map(t => <ToastCard key={t.id} t={t} onGone={gone} seedBase={seedBase} />)}
      </AnimatePresence>
    </div>,
    document.body,
  )
}
