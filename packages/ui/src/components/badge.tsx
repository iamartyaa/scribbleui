'use client'
import { ellipse, ink, type InkTimeline } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export interface ScribbleBadgeProps {
  count?: number
  /** show a plain dot instead of a count */
  dot?: boolean
  max?: number
  children?: React.ReactNode
  seed?: string
  className?: string
}

/**
 * Urgency measured in scribble loops: each escalation adds another loop to
 * the circle. Three unread = calmly circled; twenty = furiously scribbled.
 */
export function ScribbleBadge({ count = 0, dot, max = 9, children, seed: seedProp, className }: ScribbleBadgeProps) {
  const seed = useSeed(seedProp)
  const [gen, setGen] = React.useState(0)
  const prev = React.useRef(count)
  React.useEffect(() => {
    if (count !== prev.current) { prev.current = count; setGen(g => g + 1) }
  }, [count])

  const loops = count <= 0 ? 1 : Math.min(1 + Math.floor(Math.log2(Math.max(1, count / 2))), 4)
  const label = count > max ? `${max}+` : String(count)

  const ringTl: InkTimeline = React.useMemo(
    () => ink(
      [ellipse(0, 0, 10 + label.length * 3.2, 9.5, `${seed}:${gen}`, loops)],
      { seed: `${seed}:${gen}`, roughness: 1 + loops * 0.16, speed: 2.6, width: 1.7 },
    ),
    [seed, gen, loops, label.length],
  )

  const show = dot || count > 0
  return (
    <span className={cn('relative inline-block', className)}>
      {children}
      {show && (
        <span
          className={cn('absolute -right-2 -top-2 flex items-center justify-center', gen > 0 && 'animate-[badge-shake_0.35s_ease]')}
          role="status"
          aria-label={dot ? 'new' : `${label} new`}
          key={gen}
        >
          {dot ? (
            <span className="size-2 rounded-full" style={{ background: 'var(--sui-danger)' }} />
          ) : (
            <>
              <span className="relative z-10 px-1 font-hand text-sm font-bold leading-none text-danger">{label}</span>
              <span className="absolute left-1/2 top-1/2">
                <Ink overlay timeline={ringTl} color="var(--sui-danger)" rate={1.8} />
              </span>
            </>
          )}
        </span>
      )}
    </span>
  )
}
