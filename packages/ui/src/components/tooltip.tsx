'use client'
import { ink, sampleQuad, type InkTimeline } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useSeed, vary } from '@/lib/ink-extra'
import { cn } from '@/lib/utils'

export interface ScribbleTooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  side?: 'top' | 'bottom'
  delay?: number
  seed?: string
}

/**
 * A whispered jot with a leader line: the line draws, the note scribbles in,
 * and on leave the whole thing erases tail-first. Never faded — always drawn.
 */
export function ScribbleTooltip({ content, children, side = 'top', delay = 250, seed: seedProp }: ScribbleTooltipProps) {
  const seed = useSeed(seedProp)
  const rot = vary(seed, -2.5, 2.5)
  const [state, setState] = React.useState<'hidden' | 'shown' | 'erasing'>('hidden')
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const id = React.useId()

  const leadTl: InkTimeline = React.useMemo(() => {
    const dy = side === 'top' ? -1 : 1
    return ink(
      [sampleQuad({ x: 0, y: 0 }, { x: 10, y: 16 * dy }, { x: 22, y: 26 * dy }, 10)],
      { seed, roughness: 0.8, speed: 1.6, width: 1.4 },
    )
  }, [seed, side])

  const show = () => { clearTimeout(timer.current); timer.current = setTimeout(() => setState('shown'), delay) }
  const hide = () => {
    clearTimeout(timer.current)
    setState(s => s === 'shown' ? 'erasing' : 'hidden')
    timer.current = setTimeout(() => setState('hidden'), 300)
  }

  return (
    <span
      className="relative inline-block"
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {React.cloneElement(children as React.ReactElement<Record<string, unknown>>, { 'aria-describedby': id })}
      {state !== 'hidden' && (
        <span
          role="tooltip"
          id={id}
          className={cn(
            'absolute left-[60%] z-40 w-max max-w-52 font-hand text-base leading-tight text-accent transition-opacity duration-200',
            side === 'top' ? 'bottom-full mb-6' : 'top-full mt-6',
            state === 'erasing' && 'opacity-0',
          )}
          style={{ transform: `rotate(${rot}deg)` }}
        >
          {content}
        </span>
      )}
      {state !== 'hidden' && (
        <span className={cn('pointer-events-none absolute left-[55%]', side === 'top' ? 'top-0' : 'bottom-0')}>
          <Ink overlay timeline={leadTl} erase={state === 'erasing'} color="var(--sui-accent)" />
        </span>
      )}
    </span>
  )
}
