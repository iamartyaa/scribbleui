'use client'
import { ellipse, ink, type InkTimeline } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useSeed, vary } from '@/lib/ink-extra'
import { cn } from '@/lib/utils'

export interface ScribbleAvatarProps {
  src?: string
  alt?: string
  /** fallback initials, handwritten */
  initials?: string
  size?: number
  presence?: 'online' | 'away' | 'none'
  seed?: string
  className?: string
}

/**
 * A portrait in a locket frame: the double-drawn circle means "framed with
 * care", and fallback initials are handwritten, never typeset.
 */
export function ScribbleAvatar({ src, alt = '', initials, size = 48, presence = 'none', seed: seedProp, className }: ScribbleAvatarProps) {
  const seed = useSeed(seedProp)
  const [err, setErr] = React.useState(false)
  const r = size / 2

  const frameTl: InkTimeline = React.useMemo(
    () => ink([
      ellipse(r, r, r - 1.5, r - 1.5, seed),
      ellipse(r, r, r - 4, r - 4.5, seed + '2'),
    ], { seed, roughness: 1, speed: 2.8, width: 1.7 }),
    [r, seed],
  )

  const showImg = src && !err
  return (
    <span className={cn('relative inline-block', className)} style={{ width: size + 4, height: size + 4 }}>
      <span className="absolute inset-0.5 overflow-hidden rounded-full">
        {showImg ? (
          <img src={src} alt={alt} onError={() => setErr(true)} className="size-full rounded-full object-cover" style={{ filter: 'saturate(0.85) contrast(0.96)' }} />
        ) : (
          <span className="flex size-full items-center justify-center rounded-full bg-paper-2 font-hand text-ink" style={{ fontSize: size * 0.42, transform: `rotate(${vary(seed, -6, 6)}deg)` }}>
            {initials ?? '?'}
          </span>
        )}
      </span>
      <Ink overlay timeline={frameTl} color="var(--sui-ink)" className="absolute" rate={1.8} />
      {presence !== 'none' && (
        <span
          aria-label={presence}
          className="absolute bottom-0 right-0 size-2.5 rounded-full"
          style={{ background: presence === 'online' ? 'var(--sui-accent)' : 'var(--sui-pencil)', boxShadow: '0 0 0 2px var(--sui-card)' }}
        />
      )}
    </span>
  )
}
