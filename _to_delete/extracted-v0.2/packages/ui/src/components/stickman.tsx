'use client'
import { ellipse, ink, sampleQuad, type InkTimeline, type Stroke } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useCalm, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export type StickmanPose = 'wave' | 'point' | 'draw' | 'run' | 'think'

export interface StickmanProps {
  pose?: StickmanPose
  /** height in px */
  size?: number
  color?: string
  /** waving/running poses keep moving (default true) */
  animate?: boolean
  /** flip horizontally */
  flip?: boolean
  seed?: string
  className?: string
}

/* All poses live in a 64×96 box; ground at y=92, head centered ~ (32,14). */
function pose(name: StickmanPose, frame: 0 | 1, seed: string): Stroke[] {
  const head = ellipse(32, 13, 9.5, 10, seed + 'head')
  const S: Stroke[] = [head]
  const q = (a: [number, number], c: [number, number], b: [number, number]) =>
    sampleQuad({ x: a[0], y: a[1] }, { x: c[0], y: c[1] }, { x: b[0], y: b[1] }, 8)

  if (name === 'wave') {
    S.push(q([32, 23], [31, 40], [32, 58]))                         // spine
    S.push(q([32, 30], [20, 36], [14, 46]))                         // left arm down
    S.push(frame === 0 ? q([32, 30], [46, 22], [52, 8]) : q([32, 30], [47, 26], [56, 16])) // waving arm
    S.push(q([32, 58], [24, 74], [20, 91]))                         // left leg
    S.push(q([32, 58], [40, 74], [44, 91]))                         // right leg
  } else if (name === 'point') {
    S.push(q([32, 23], [31, 40], [32, 58]))
    S.push(q([32, 32], [22, 40], [18, 50]))
    S.push(q([32, 30], [46, 27], [60, 26]))                         // pointing arm →
    S.push([{ x: 58, y: 22 }, { x: 63, y: 26 }, { x: 58, y: 30 }])  // tiny hand arrow
    S.push(q([32, 58], [25, 74], [22, 91]))
    S.push(q([32, 58], [39, 74], [42, 91]))
  } else if (name === 'draw') {
    // crouched, drawing on the ground
    S.length = 0
    S.push(ellipse(24, 26, 9, 9.5, seed + 'head'))
    S.push(q([26, 35], [34, 44], [36, 56]))                         // hunched spine
    S.push(q([30, 42], [42, 50], [50, 62]))                         // drawing arm
    S.push(q([28, 44], [22, 52], [24, 60]))                         // resting arm
    S.push(q([36, 56], [30, 72], [24, 90]))
    S.push(q([36, 56], [44, 72], [48, 90]))
    S.push(frame === 0
      ? q([50, 66], [56, 62], [62, 66])                             // the doodle he draws
      : [...q([48, 66], [54, 62], [60, 66]), ...q([60, 66], [64, 70], [58, 72])])
  } else if (name === 'run') {
    const lean = frame === 0 ? 4 : 7
    S.length = 0
    S.push(ellipse(36 + lean, 14, 9.5, 10, seed + 'head'))
    S.push(q([36 + lean, 24], [33, 40], [30, 56]))
    S.push(frame === 0 ? q([35, 32], [48, 36], [56, 30]) : q([35, 32], [46, 40], [50, 48]))
    S.push(frame === 0 ? q([35, 32], [24, 40], [16, 36]) : q([35, 32], [24, 36], [14, 44]))
    S.push(frame === 0 ? q([30, 56], [42, 68], [52, 74]) : q([30, 56], [38, 74], [36, 90]))
    S.push(frame === 0 ? q([30, 56], [20, 72], [12, 82]) : q([30, 56], [22, 70], [26, 88]))
  } else { // think
    S.push(q([32, 23], [31, 40], [32, 58]))
    S.push(q([32, 32], [24, 34], [24, 24]))                         // hand to chin
    S.push(q([32, 32], [42, 40], [46, 50]))
    S.push(q([32, 58], [26, 74], [24, 91]))
    S.push(q([32, 58], [38, 74], [40, 91]))
    S.push(ellipse(50, 6, 3, 2.6, seed + 'b1'))                     // thought bubbles
    S.push(ellipse(57, -2, 4.4, 3.6, seed + 'b2'))
  }
  return S
}

/**
 * A pencil-drawn stickman for empty states, docs, and 404s. Poses: wave,
 * point, draw, run, think — waving and running keep moving, redrawn stroke
 * by stroke like a flipbook.
 */
export function Stickman({ pose: poseName = 'wave', size = 96, color = 'var(--sui-ink)', animate = true, flip, seed: seedProp, className }: StickmanProps) {
  const seed = useSeed(seedProp)
  const calm = useCalm()
  const [frame, setFrame] = React.useState<0 | 1>(0)
  const moving = animate && !calm && (poseName === 'wave' || poseName === 'run' || poseName === 'draw')

  React.useEffect(() => {
    if (!moving) return
    const id = setInterval(() => setFrame(f => (f === 0 ? 1 : 0)), poseName === 'run' ? 380 : 720)
    return () => clearInterval(id)
  }, [moving, poseName])

  const tl: InkTimeline = React.useMemo(
    () => ink(pose(poseName, frame, seed), { seed: seed + poseName, roughness: 0.9, speed: 2.6, width: 2, flightBase: 30 }),
    [poseName, frame, seed],
  )

  return (
    <span
      aria-hidden
      className={cn('inline-block', className)}
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    >
      <Ink timeline={tl} draw={frame === 0} progress={frame === 1 ? 1 : undefined} color={color} pad={8}
        style={{ height: size, width: 'auto' }} />
    </span>
  )
}
