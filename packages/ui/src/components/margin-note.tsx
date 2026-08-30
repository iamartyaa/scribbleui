'use client'
import { ink, sampleQuad, type InkTimeline } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useSeed, vary } from '@/lib/ink-extra'
import { cn } from '@/lib/utils'

export interface MarginNoteProps extends React.HTMLAttributes<HTMLDivElement> {
  /** the note text, rendered in the hand font */
  note: string
  side?: 'right' | 'left'
  color?: string
  seed?: string
  /** width reserved for the margin column (px) */
  marginWidth?: number
  /** which child phrase to anchor on — wrap it in <MarginNote.Anchor> */
  children: React.ReactNode
}

const AnchorCtx = React.createContext<React.RefObject<HTMLSpanElement | null> | null>(null)

/** Mark the exact phrase the note points at. */
function Anchor({ children }: { children: React.ReactNode }) {
  const ref = React.useContext(AnchorCtx)
  return <span ref={ref ?? undefined} className="text-inherit">{children}</span>
}

/**
 * Real marginalia: the paragraph keeps a margin column, the note sits in it
 * at a jotted angle, and a drawn leader line ties it to the exact phrase it
 * doubts. Re-routes on reflow; collapses below the text on narrow screens.
 */
export function MarginNote({ note, side = 'right', color = 'var(--sui-accent)', seed: seedProp, marginWidth = 150, className, children, ...rest }: MarginNoteProps) {
  const seed = useSeed(seedProp)
  const rot = vary(seed, -3, 3)
  const hostRef = React.useRef<HTMLDivElement>(null)
  const anchorRef = React.useRef<HTMLSpanElement>(null)
  const noteRef = React.useRef<HTMLSpanElement>(null)
  const [tl, setTl] = React.useState<InkTimeline | null>(null)
  const [narrow, setNarrow] = React.useState(false)
  const keyRef = React.useRef('')

  const route = React.useCallback(() => {
    const host = hostRef.current, anchor = anchorRef.current, noteEl = noteRef.current
    if (!host || !noteEl) return
    setNarrow(host.clientWidth < 420)
    if (!anchor || host.clientWidth < 420) { setTl(null); keyRef.current = ''; return }
    const hb = host.getBoundingClientRect()
    const ab = anchor.getBoundingClientRect()
    const nb = noteEl.getBoundingClientRect()
    const start = {
      x: ab.left - hb.left + (side === 'right' ? ab.width : 0),
      y: ab.top - hb.top + ab.height * 0.4,
    }
    const end = {
      x: nb.left - hb.left + (side === 'right' ? -6 : nb.width + 6),
      y: nb.top - hb.top + nb.height * 0.5,
    }
    const key = JSON.stringify([start.x | 0, start.y | 0, end.x | 0, end.y | 0])
    if (key === keyRef.current) return
    keyRef.current = key
    const c = { x: (start.x + end.x) / 2, y: Math.min(start.y, end.y) - 12 }
    setTl(ink([sampleQuad(start, c, end, 14)], { seed, roughness: 0.85, speed: 1.5, width: 1.5 }))
  }, [seed, side])

  React.useEffect(() => {
    route()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(route) : null
    if (hostRef.current && ro) ro.observe(hostRef.current)
    window.addEventListener('resize', route)
    return () => { ro?.disconnect(); window.removeEventListener('resize', route) }
  }, [route])

  return (
    <AnchorCtx.Provider value={anchorRef}>
      <div
        ref={hostRef}
        className={cn('relative', className)}
        style={narrow ? undefined : { [side === 'right' ? 'paddingRight' : 'paddingLeft']: marginWidth + 16 }}
        {...rest}
      >
        <div>{children}</div>
        <span
          ref={noteRef}
          className={cn('z-10 font-hand text-lg leading-tight', narrow ? 'mt-1 inline-block' : 'absolute top-1')}
          style={{
            color,
            width: narrow ? undefined : marginWidth,
            transform: `rotate(${rot}deg)`,
            ...(narrow ? {} : { [side === 'right' ? 'right' : 'left']: 0 }),
          }}
        >
          {note}
        </span>
        {tl && <Ink overlay timeline={tl} color={color} className="absolute" />}
      </div>
    </AnchorCtx.Provider>
  )
}
MarginNote.Anchor = Anchor
