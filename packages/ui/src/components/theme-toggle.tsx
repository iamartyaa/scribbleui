'use client'
import { crescent, doodleLoop, ellipse, ink, line, twinkle, type InkTimeline, type Stroke } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useCalm, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export interface ScribbleThemeToggleProps {
  /** controlled theme; otherwise reads/writes data-theme on <html> */
  theme?: 'light' | 'dark'
  onThemeChange?: (t: 'light' | 'dark') => void
  seed?: string
  className?: string
}

function sunStrokes(): Stroke[] {
  const s: Stroke[] = [ellipse(16, 16, 8, 8, 'sun')]
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    s.push(line(16 + Math.cos(a) * 11, 16 + Math.sin(a) * 11, 16 + Math.cos(a) * 15, 16 + Math.sin(a) * 15))
  }
  return s
}
function moonStrokes(): Stroke[] {
  return [
    ...crescent(14, 18, 10),
    ...twinkle(28, 8, 3),
    ...twinkle(31, 20, 2.2),
    ...twinkle(24, 28, 1.8),
  ]
}

/**
 * Day isn't toggled off — it's scribbled out, and night is drawn fresh.
 * 300ms of furious pen over the sun, then the moon's arc in one stroke.
 */
export function ScribbleThemeToggle({ theme: themeProp, onThemeChange, seed: seedProp, className }: ScribbleThemeToggleProps) {
  const seed = useSeed(seedProp)
  const calm = useCalm()
  const [internal, setInternal] = React.useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
  const theme = themeProp ?? internal
  const [scribbling, setScribbling] = React.useState(false)

  const iconTl: InkTimeline = React.useMemo(
    () => ink(theme === 'light' ? sunStrokes() : moonStrokes(), { seed: seed + theme, roughness: 0.8, speed: 2.4, width: 1.8, flightBase: 24 }),
    [theme, seed],
  )
  const scribbleTl: InkTimeline = React.useMemo(
    () => ink([doodleLoop(30, 30, 3, seed).map(p => ({ x: p.x + 1, y: p.y + 1 }))], { seed: seed + ':scr', roughness: 1.4, speed: 3.2, width: 2.4 }),
    [seed],
  )

  const flip = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    const commit = () => {
      if (themeProp === undefined) {
        setInternal(next)
        document.documentElement.dataset.theme = next
      }
      onThemeChange?.(next)
      setScribbling(false)
    }
    if (calm) { commit(); return }
    setScribbling(true)
    setTimeout(commit, 330)
  }

  return (
    <button
      aria-label={theme === 'light' ? 'switch to night' : 'switch to day'}
      onClick={flip}
      className={cn('relative inline-block cursor-pointer bg-transparent p-1', className)}
      style={{ border: 'none', width: 40, height: 40, color: 'var(--sui-ink)' }}
    >
      <Ink timeline={iconTl} className="absolute left-1 top-1" overlay color={theme === 'light' ? 'var(--sui-ink)' : 'var(--sui-accent)'} />
      {scribbling && (
        <Ink overlay timeline={scribbleTl} color="var(--sui-danger)" rate={1.6} className="absolute left-1 top-1" />
      )}
    </button>
  )
}
