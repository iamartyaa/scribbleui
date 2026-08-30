'use client'
import { ink, scratch, type InkTimeline } from '@scribbleui/engine'
import { hands, writeText } from '@scribbleui/text'
import * as React from 'react'
import { Ink, useCalm, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export interface ScratchNumberProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number
  size?: number
  seed?: string
  format?: (n: number) => string
}

/**
 * A number corrected the way a human corrects one: the old value gets
 * scratched out and the new value is written fresh. No slot machines.
 */
export function ScratchNumber({ value, size = 34, seed: seedProp, format = String, className, ...rest }: ScratchNumberProps) {
  const seed = useSeed(seedProp)
  const calm = useCalm()
  const [shown, setShown] = React.useState(value)
  const [old, setOld] = React.useState<number | null>(null)
  const [gen, setGen] = React.useState(0)

  React.useEffect(() => {
    if (value === shown) return
    if (calm) { setShown(value); return }
    setOld(shown)
    const t = setTimeout(() => { setShown(value); setOld(null); setGen(g => g + 1) }, 420)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, calm])

  const text = format(old ?? shown)
  const tl: InkTimeline = React.useMemo(
    () => writeText(text, hands.print, { seed: `${seed}:${gen}:${text}`, size }),
    [text, seed, size, gen],
  )
  const scratchTl: InkTimeline | null = React.useMemo(() => {
    if (old === null) return null
    const w = tl.strokes.length ? Math.max(...tl.strokes.flatMap(s => s.points.map(p => p.x))) : size
    return ink(scratch(w, seed), { seed, roughness: 1.6, speed: 2.4 })
  }, [old, tl, seed, size])

  return (
    <span className={cn('relative inline-block align-baseline tabular-nums', className)} {...rest}>
      <span className="sr-only">{format(value)}</span>
      <Ink timeline={tl} draw pad={5} />
      {scratchTl && (
        <Ink
          overlay
          timeline={scratchTl}
          color="var(--sui-danger)"
          className="absolute"
          style={{ top: '38%' }}
        />
      )}
    </span>
  )
}
