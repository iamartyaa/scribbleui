'use client'
import { eraseScrub, ink, line, rect, tick, type InkTimeline } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useCalm, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export interface ScribbleCheckboxProps {
  checked?: boolean
  defaultChecked?: boolean
  indeterminate?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  label?: React.ReactNode
  seed?: string
  className?: string
  id?: string
}

/**
 * The tick is a flick — fast, confident, escaping the box on purpose.
 * Unchecking doesn't reverse the flick; it takes the eraser to it.
 */
export function ScribbleCheckbox({
  checked: checkedProp, defaultChecked, indeterminate, onCheckedChange, disabled, label, seed: seedProp, className, id,
}: ScribbleCheckboxProps) {
  const seed = useSeed(seedProp)
  const calm = useCalm()
  const [internal, setInternal] = React.useState(!!defaultChecked)
  const checked = checkedProp ?? internal
  const [erasing, setErasing] = React.useState(false)
  const autoId = React.useId()
  const boxId = id ?? autoId
  const S = 20

  const boxTl = React.useMemo(
    () => ink(rect(S, S, seed), { seed, roughness: 1, speed: 2.4, overshoot: 3, width: 1.8 }),
    [seed],
  )
  const tickTl = React.useMemo(
    () => ink([tick(S * 0.92).map(p => ({ x: p.x + 3, y: p.y + 2 }))], { seed: seed + ':t', roughness: 0.9, speed: 1.7, width: 2.6, widthFromSpeed: 0.7 }),
    [seed],
  )
  const dashTl = React.useMemo(
    () => ink([line(4, S / 2, S - 4, S / 2)], { seed: seed + ':d', roughness: 1, speed: 1.2, width: 2.4 }),
    [seed],
  )
  const scrubTl = React.useMemo(
    () => ink([eraseScrub(S + 6, S * 0.7, 4).map(p => ({ x: p.x - 3, y: p.y + 3 }))], { seed: seed + ':e', roughness: 1.2, speed: 4, width: 7 }),
    [seed],
  )

  const toggle = () => {
    if (disabled) return
    const next = !checked
    if (!next && !calm) {
      setErasing(true)
      setTimeout(() => { setErasing(false); setInternal(next); onCheckedChange?.(next) }, 260)
    } else {
      setInternal(next)
      onCheckedChange?.(next)
    }
  }

  return (
    <label className={cn('inline-flex cursor-pointer select-none items-center gap-2.5', disabled && 'cursor-not-allowed opacity-60', className)}>
      <button
        id={boxId}
        role="checkbox"
        aria-checked={indeterminate ? 'mixed' : checked}
        disabled={disabled}
        onClick={toggle}
        className="relative inline-block bg-transparent p-0"
        style={{ width: S + 8, height: S + 6, border: 'none', color: 'inherit' }}
      >
        <Ink timeline={boxTl} draw={false} color={disabled ? 'var(--sui-pencil)' : 'var(--sui-ink)'} className="absolute left-0 top-0" overlay />
        {indeterminate ? (
          <Ink timeline={dashTl} color="var(--sui-accent)" overlay className="absolute" />
        ) : (checked || erasing) ? (
          <Ink
            timeline={tickTl}
            draw={!erasing}
            color="var(--sui-accent)"
            overlay
            className={cn('absolute transition-opacity', erasing && 'opacity-0 duration-300')}
          />
        ) : null}
        {erasing && (
          <Ink timeline={scrubTl} color="var(--sui-paper)" overlay className="absolute" style={{ opacity: 0.9 }} rate={1.4} />
        )}
      </button>
      {label && <span className="font-body text-sm">{label}</span>}
    </label>
  )
}
