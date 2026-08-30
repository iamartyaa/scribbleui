'use client'
import { bowedLine, capsule, ellipse, ink, type InkTimeline } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useCalm, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export interface ScribbleSwitchProps {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  label?: React.ReactNode
  /** 'ink' pours ink behind the knob when ON; 'plain' keeps the track empty */
  variant?: 'ink' | 'plain'
  size?: 'sm' | 'md'
  seed?: string
  className?: string
}

/**
 * The knob is wet ink: toggling drags it across with a smear that dries in
 * ~400ms, and ON pours a line of ink into the track behind it — state you
 * can see from across the room, no underline needed.
 */
export function ScribbleSwitch({ checked: checkedProp, defaultChecked, onCheckedChange, disabled, label, variant = 'ink', size = 'md', seed: seedProp, className }: ScribbleSwitchProps) {
  const seed = useSeed(seedProp)
  const calm = useCalm()
  const [internal, setInternal] = React.useState(!!defaultChecked)
  const checked = checkedProp ?? internal
  const [smear, setSmear] = React.useState<InkTimeline | null>(null)
  const W = size === 'md' ? 46 : 36
  const H = size === 'md' ? 24 : 19
  const R = H / 2 - 4

  const trackTl = React.useMemo(
    () => ink([capsule(W, H)], { seed, roughness: 0.8, speed: 2.6, width: 1.8 }),
    [seed, W, H],
  )
  const fillTl = React.useMemo(
    () => ink([bowedLine(H / 2, H / 2, W - H / 2 - 2, H / 2, 0.04, seed + 'f')], { seed: seed + ':f', roughness: 1, speed: 2.4, width: H - 9 }),
    [seed, W, H],
  )
  const knobTl = React.useMemo(
    () => ink([ellipse(0, 0, R, R, seed + ':knob:' + checked)], { seed: seed + ':k', roughness: 0.9, speed: 1.6, width: 2.2 }),
    [seed, checked, R],
  )

  const toggle = () => {
    if (disabled) return
    const next = !checked
    if (!calm) {
      const y = H / 2
      const from = next ? H / 2 : W - H / 2
      const to = next ? W - H / 2 : H / 2
      setSmear(ink([bowedLine(from, y, to, y - 1, 0.08, seed + Math.random())], { seed: seed + ':s', roughness: 1.2, speed: 3.4, width: 3 }))
      setTimeout(() => setSmear(null), 450)
    }
    if (checkedProp === undefined) setInternal(next)
    onCheckedChange?.(next)
  }

  return (
    <label className={cn('inline-flex select-none items-center gap-2.5', disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer', className)}>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={toggle}
        className="relative inline-block bg-transparent p-0"
        style={{ width: W + 6, height: H + 8, border: 'none', color: 'inherit' }}
      >
        <Ink timeline={trackTl} draw={false} color={disabled ? 'var(--sui-pencil)' : 'var(--sui-ink)'} overlay className="absolute" />
        {variant === 'ink' && checked && (
          <Ink timeline={fillTl} color="var(--sui-accent)" overlay className="absolute" style={{ opacity: 0.35 }} rate={2.2} />
        )}
        {smear && (
          <Ink timeline={smear} color="var(--sui-accent)" overlay className="absolute animate-[fadeout_0.45s_ease_forwards]" style={{ opacity: 0.5 }} rate={2} />
        )}
        <span
          className="absolute transition-[left,transform] duration-200 ease-out active:scale-90"
          style={{ left: checked ? W - H / 2 - 1 : H / 2 + 1, top: H / 2 }}
        >
          <Ink overlay timeline={knobTl} draw color={checked ? 'var(--sui-accent)' : 'var(--sui-ink)'} rate={2} />
        </span>
      </button>
      {label && <span className="font-body text-sm">{label}</span>}
    </label>
  )
}
