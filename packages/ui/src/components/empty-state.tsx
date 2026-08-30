'use client'
import { arrow, ink, line, type InkTimeline, type Stroke } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export interface ScribbleEmptyStateProps {
  note?: string
  /** the one action that fixes the emptiness */
  action?: React.ReactNode
  mood?: 'empty' | 'search' | 'error'
  seed?: string
  className?: string
}

function openBox(): Stroke[] {
  return [
    // box body
    [{ x: 20, y: 26 }, { x: 44, y: 36 }, { x: 68, y: 26 }, { x: 68, y: 50 }, { x: 44, y: 60 }, { x: 20, y: 50 }, { x: 20, y: 26 }],
    // open flaps
    [{ x: 20, y: 26 }, { x: 44, y: 16 }, { x: 68, y: 26 }],
    [{ x: 30, y: 12 }, { x: 44, y: 16 }, { x: 58, y: 10 }],
    // inner fold
    [{ x: 44, y: 36 }, { x: 44, y: 60 }],
  ]
}
function magnifier(): Stroke[] {
  const ring: Stroke = []
  for (let i = 0; i <= 22; i++) {
    const a = -0.4 + (i / 22) * Math.PI * 2.15
    ring.push({ x: 40 + Math.cos(a) * 16, y: 32 + Math.sin(a) * 16 })
  }
  return [ring, [{ x: 52, y: 44 }, { x: 66, y: 58 }]]
}
function sadFace(): Stroke[] {
  const head: Stroke = []
  for (let i = 0; i <= 24; i++) {
    const a = -0.5 + (i / 24) * Math.PI * 2.2
    head.push({ x: 44 + Math.cos(a) * 22, y: 36 + Math.sin(a) * 22 })
  }
  return [head, line(36, 30, 37, 31), line(52, 30, 53, 31),
    [{ x: 34, y: 48 }, { x: 44, y: 43 }, { x: 54, y: 48 }]]
}

/**
 * Emptiness with a doodle and a nudge: the doodle draws, the note writes,
 * and the arrow flicks at the one action that fixes it — in that order,
 * because the order tells the story.
 */
export function ScribbleEmptyState({ note = 'nothing here yet —', action, mood = 'empty', seed: seedProp, className }: ScribbleEmptyStateProps) {
  const seed = useSeed(seedProp)
  const [stage, setStage] = React.useState(0)

  const doodleTl: InkTimeline = React.useMemo(() => {
    const strokes = mood === 'search' ? magnifier() : mood === 'error' ? sadFace() : openBox()
    return ink(strokes, { seed, roughness: 1, speed: 1.9, width: 1.9 })
  }, [mood, seed])
  const arrowTl: InkTimeline = React.useMemo(
    () => ink(arrow({ x: 0, y: 0 }, { x: 20, y: 26 }, -0.3, 7), { seed: seed + ':a', roughness: 0.9, speed: 1.7 }),
    [seed],
  )

  return (
    <div className={cn('flex flex-col items-center gap-1 py-6 text-center', className)}>
      <Ink timeline={doodleTl} color="var(--sui-ink)" onDone={() => setStage(s => Math.max(s, 1))} />
      <p className={cn('m-0 font-hand text-xl text-ink-soft transition-opacity duration-300', stage < 1 && 'opacity-0')}>
        {note}
      </p>
      {action && (
        <div className="relative mt-3">
          {stage >= 1 && (
            <span className="absolute -left-7 -top-6">
              <Ink timeline={arrowTl} color="var(--sui-accent)" onDone={() => setStage(2)} />
            </span>
          )}
          {action}
        </div>
      )}
    </div>
  )
}
