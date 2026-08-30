import * as React from 'react'
import { ScribbleButton, ScribbleRadioGroup, ScribbleSlider, ScribbleSwitch } from '@/components'
import type { KnobDef } from '../data'

export type KnobValues = Record<string, number | string | boolean>

export function defaults(defs: KnobDef[]): KnobValues {
  return Object.fromEntries(defs.map(d => [d.key, d.def]))
}

/** The customize panel — built, of course, from the library's own controls. */
export function Knobs({ defs, values, onChange, onShake }: {
  defs: KnobDef[]
  values: KnobValues
  onChange: (v: KnobValues) => void
  onShake: () => void
}) {
  return (
    <div className="flex flex-col gap-5">
      {defs.map(d => (
        <div key={d.key}>
          <div className="mb-1 font-label text-[10px] uppercase tracking-widest text-pencil">{d.label}</div>
          {d.type === 'range' && (
            <ScribbleSlider
              min={d.min} max={d.max} step={d.step ?? 1}
              value={values[d.key] as number}
              onValueChange={v => onChange({ ...values, [d.key]: v })}
              showValue
              className="w-full"
              label={d.label}
            />
          )}
          {d.type === 'select' && (
            <ScribbleRadioGroup
              aria-label={d.label}
              value={String(values[d.key])}
              onValueChange={v => onChange({ ...values, [d.key]: v })}
              options={(d.options ?? []).map(o => ({ value: o, label: o }))}
              className="!gap-0.5"
            />
          )}
          {d.type === 'toggle' && (
            <ScribbleSwitch
              checked={Boolean(values[d.key])}
              onCheckedChange={v => onChange({ ...values, [d.key]: v })}
              label={d.label}
            />
          )}
        </div>
      ))}
      <ScribbleButton shape="box" onClick={onShake}>🎲 shake the pen</ScribbleButton>
    </div>
  )
}
