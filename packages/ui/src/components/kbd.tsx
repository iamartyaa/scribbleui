'use client'
import { bowedLine, ink, rect, type InkTimeline } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export interface ScribbleKbdProps {
  children: string
  /** when this key combo fires for real, the sketched cap depresses */
  listen?: boolean
  seed?: string
  className?: string
}

/**
 * A keycap sketched from life — and when its real shortcut fires, the cap
 * depresses onto its base line and pops back. Docs feel alive.
 */
export function ScribbleKbd({ children, listen, seed: seedProp, className }: ScribbleKbdProps) {
  const seed = useSeed(seedProp + children)
  const [pressed, setPressed] = React.useState(false)
  const w = Math.max(26, 14 + children.length * 8)
  const h = 24

  React.useEffect(() => {
    if (!listen) return
    const down = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === children.toLowerCase() || (children === '⌘' && e.metaKey)) setPressed(true)
    }
    const up = () => setPressed(false)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [children, listen])

  const capTl: InkTimeline = React.useMemo(
    () => ink(rect(w, h, seed), { seed, roughness: 0.9, speed: 3, width: 1.6 }),
    [w, seed],
  )
  const baseTl: InkTimeline = React.useMemo(
    () => ink([bowedLine(3, 0, w - 3, 0, 0.06, seed + 'b')], { seed: seed + ':b', roughness: 0.8, speed: 3, width: 1.4 }),
    [w, seed],
  )

  return (
    <kbd
      className={cn('relative inline-block text-center font-label text-xs text-ink', className)}
      style={{ width: w + 4, height: h + 8, background: 'transparent' }}
    >
      <span
        className="absolute left-0.5 top-0 flex items-center justify-center transition-transform duration-75"
        style={{ width: w, height: h, transform: pressed ? 'translateY(3px)' : 'none' }}
      >
        <Ink overlay timeline={capTl} draw={false} color="var(--sui-ink)" className="absolute" />
        <span className="relative">{children}</span>
      </span>
      <span className="absolute bottom-0 left-0.5">
        <Ink overlay timeline={baseTl} draw={false} color="var(--sui-pencil)" />
      </span>
    </kbd>
  )
}
