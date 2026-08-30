import { ellipse, ink, type InkTimeline } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, Stickman, toast } from '@/components'
import { twinkle } from '@scribbleui/engine'

/** Doodle burst: stars + loops scatter from a point and fade. */
export function useDoodleBurst() {
  const [bursts, setBursts] = React.useState<{ id: number; x: number; y: number; tl: InkTimeline }[]>([])
  const idRef = React.useRef(0)
  const burst = (x: number, y: number) => {
    const id = ++idRef.current
    const strokes = []
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + Math.random()
      const r = 26 + Math.random() * 34
      const cx = Math.cos(a) * r, cy = Math.sin(a) * r
      if (i % 2 === 0) strokes.push(...twinkle(cx, cy, 5 + Math.random() * 3))
      else strokes.push(ellipse(cx, cy, 4 + Math.random() * 3, 4, String(id) + i))
    }
    const tl = ink(strokes, { seed: 'burst' + id, roughness: 1.1, speed: 3, width: 1.8, flightBase: 14 })
    setBursts(b => [...b, { id, x, y, tl }])
    setTimeout(() => setBursts(b => b.filter(q => q.id !== id)), 1400)
  }
  const layer = (
    <>
      {bursts.map(b => (
        <span key={b.id} className="pointer-events-none fixed z-[80] animate-[fadeout_1.3s_ease_forwards]" style={{ left: b.x, top: b.y }}>
          <Ink overlay timeline={b.tl} color="var(--sui-brand)" />
        </span>
      ))}
    </>
  )
  return { burst, layer }
}

/** Type "ship" anywhere → the resident runs across the screen with confetti toast. */
export function ShipRunner() {
  const [running, setRunning] = React.useState(false)
  React.useEffect(() => {
    let buf = ''
    const on = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      buf = (buf + e.key).slice(-4)
      if (buf === 'ship') {
        setRunning(true)
        toast.success('SHIP IT ⛵')
        setTimeout(() => setRunning(false), 4200)
      }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])
  if (!running) return null
  return (
    <div className="pointer-events-none fixed bottom-2 left-0 z-[85]" style={{ animation: 'walk-x 4s linear forwards' }}>
      <Stickman pose="run" size={72} seed="runner" />
    </div>
  )
}
