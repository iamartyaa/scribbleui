import * as React from 'react'
import { toast } from '@/components'

/**
 * Easter egg: press `p` (or the pencil FAB) and your cursor becomes a pen —
 * live ink with the engine's width-from-speed model, drying and fading.
 * Escape hangs the pen back up.
 */
export function PenMode() {
  const [on, setOn] = React.useState(false)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if (e.key === 'p') setOn(o => { const n = !o; toast(n ? 'pen out ✎ — draw! (esc to stop)' : 'pen away'); return n })
      if (e.key === 'Escape') setOn(false)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])

  React.useEffect(() => {
    if (!on) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      canvas.width = innerWidth * dpr
      canvas.height = innerHeight * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    interface Dab { x: number; y: number; w: number; born: number }
    const dabs: Dab[] = []
    let last: { x: number; y: number; t: number } | null = null

    const move = (e: PointerEvent) => {
      const now = performance.now()
      if (last) {
        const d = Math.hypot(e.clientX - last.x, e.clientY - last.y)
        const dt = Math.max(1, now - last.t)
        const v = d / dt // px per ms
        // engine rule: slow = wide wet ink, fast = thin dry line
        const w = Math.max(1.2, 7 - v * 3.4)
        const steps = Math.max(1, Math.floor(d / 3))
        for (let i = 1; i <= steps; i++) {
          dabs.push({
            x: last.x + ((e.clientX - last.x) * i) / steps,
            y: last.y + ((e.clientY - last.y) * i) / steps,
            w, born: now,
          })
        }
      }
      last = { x: e.clientX, y: e.clientY, t: now }
    }
    const lift = () => { last = null }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerdown', move)
    window.addEventListener('pointerup', lift)
    window.addEventListener('pointerleave', lift)

    let raf = 0
    const LIFE = 4200
    const draw = () => {
      const now = performance.now()
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const ink = getComputedStyle(document.documentElement).getPropertyValue('--sui-accent') || '#2B4FD0'
      while (dabs.length && now - dabs[0].born > LIFE) dabs.shift()
      for (const d of dabs) {
        const age = (now - d.born) / LIFE
        ctx.globalAlpha = 0.75 * (1 - age)
        ctx.fillStyle = ink
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.w / 2, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', move)
      window.removeEventListener('pointerup', lift)
      window.removeEventListener('pointerleave', lift)
      cancelAnimationFrame(raf)
    }
  }, [on])

  return (
    <>
      {on && <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[90]" style={{ width: '100vw', height: '100vh' }} />}
      <button
        aria-label="pen mode"
        title="pen mode (p)"
        onClick={() => setOn(o => !o)}
        className="fixed bottom-5 left-5 z-[91] cursor-pointer bg-card p-2 text-xl shadow-[2px_3px_0_var(--sui-shadow)] transition-transform hover:-rotate-12"
        style={{ border: '1.5px solid var(--sui-ink)', borderRadius: 999 }}
      >{on ? '🖊️' : '✏️'}</button>
    </>
  )
}
