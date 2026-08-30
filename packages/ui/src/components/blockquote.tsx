'use client'
import { bowedLine, ink, sampleQuad, type InkTimeline } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useSeed, vary } from '@/lib/ink-extra'
import { cn } from '@/lib/utils'

export interface ScribbleBlockquoteProps {
  children: React.ReactNode
  cite?: string
  /** 'margin' = rule + big quotes; 'card' = copied onto a taped paper scrap */
  variant?: 'margin' | 'card'
  seed?: string
  className?: string
}

/**
 * A quote copied into a commonplace book: oversized drawn quotation marks
 * open AND close it, a margin rule sweeps its height, and the attribution
 * arrives after a drawn dash. The card variant tapes it in like a clipping.
 */
export function ScribbleBlockquote({ children, cite, variant = 'margin', seed: seedProp, className }: ScribbleBlockquoteProps) {
  const seed = useSeed(seedProp)
  const rot = vary(seed, -1.4, 1.4)
  const [h, setH] = React.useState(0)
  const bodyRef = React.useRef<HTMLQuoteElement>(null)
  const [armed, setArmed] = React.useState(false)

  React.useLayoutEffect(() => {
    if (bodyRef.current) setH(bodyRef.current.scrollHeight)
  }, [children])
  React.useEffect(() => {
    const el = bodyRef.current
    if (!el || typeof IntersectionObserver === 'undefined') { setArmed(true); return }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { setArmed(true); io.disconnect() } }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const openQ: InkTimeline = React.useMemo(
    () => ink([
      sampleQuad({ x: 12, y: 2 }, { x: 2, y: 10 }, { x: 10, y: 24 }, 9),
      sampleQuad({ x: 26, y: 2 }, { x: 16, y: 10 }, { x: 24, y: 24 }, 9),
    ], { seed, roughness: 0.9, speed: 1.5, width: 3 }),
    [seed],
  )
  const closeQ: InkTimeline = React.useMemo(
    () => ink([
      sampleQuad({ x: 2, y: 22 }, { x: 12, y: 14 }, { x: 4, y: 0 }, 9),
      sampleQuad({ x: 16, y: 22 }, { x: 26, y: 14 }, { x: 18, y: 0 }, 9),
    ], { seed: seed + 'c', roughness: 0.9, speed: 1.5, width: 3 }),
    [seed],
  )
  const ruleTl: InkTimeline | null = React.useMemo(
    () => h && variant === 'margin' ? ink([bowedLine(2, 0, 0, h, 0.035, seed)], { seed: seed + ':r', roughness: 0.9, speed: 2.6, width: 2.2 }) : null,
    [h, seed, variant],
  )
  const dashTl: InkTimeline = React.useMemo(
    () => ink([bowedLine(0, 4, 22, 3, 0.08, seed + 'd')], { seed: seed + ':d', roughness: 1, speed: 2, width: 1.8 }),
    [seed],
  )

  const body = (
    <figure className={cn('relative m-0', variant === 'margin' ? 'pl-10 pr-8' : 'p-1', className)}>
      <span className={cn('absolute text-accent', variant === 'margin' ? '-top-3 left-7' : '-top-4 -left-2')}>
        <Ink timeline={openQ} draw={armed} color="var(--sui-accent)" />
      </span>
      {ruleTl && (
        <span className="absolute left-0 top-0">
          <Ink overlay timeline={ruleTl} draw={armed} color="var(--sui-accent)" />
        </span>
      )}
      <blockquote ref={bodyRef} className="m-0 pt-5 font-body text-base italic leading-7 text-ink">
        {children}
        <span className="relative ml-2 inline-block w-7 align-middle">
          <span className="absolute -top-5 left-0"><Ink timeline={closeQ} draw={armed} color="var(--sui-accent)" rate={0.8} /></span>
        </span>
      </blockquote>
      {cite && (
        <figcaption className="mt-2 flex items-center gap-2 font-hand text-xl text-ink-soft">
          <Ink timeline={dashTl} draw={armed} color="var(--sui-ink-soft)" />
          {cite}
        </figcaption>
      )}
    </figure>
  )

  if (variant === 'card') {
    return (
      <div className="relative inline-block bg-card p-5 shadow-[3px_4px_0_var(--sui-shadow)]" style={{ transform: `rotate(${rot}deg)`, border: '1.5px solid var(--sui-ink)' }}>
        <span aria-hidden className="absolute -top-2 left-1/2 h-4 w-14 -translate-x-1/2" style={{ background: 'var(--sui-hl)', opacity: 0.45, transform: `translateX(-50%) rotate(${vary(seed + 'tp', -6, 6)}deg)` }} />
        {body}
      </div>
    )
  }
  return body
}
