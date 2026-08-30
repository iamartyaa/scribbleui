import type * as React from 'react'

export interface KnobDef {
  key: string
  label: string
  type: 'range' | 'select' | 'toggle'
  min?: number
  max?: number
  step?: number
  options?: string[]
  def: number | string | boolean
}

export interface ComponentEntry {
  slug: string
  title: string
  /** tiny sidebar glyph */
  icon: string
  category: string
  /** the handwritten one-liner */
  tagline: string
  description: string
  /** main interactive preview */
  Demo: React.FC
  variants?: { title: string; note?: string; Demo: React.FC }[]
  /** extra knobs; every page also gets the universal "shake the pen" reseed */
  knobs?: KnobDef[]
  KnobDemo?: React.FC<{ k: Record<string, number | string | boolean> }>
  usage: string
  props?: [name: string, type: string, note: string][]
  /** "in the wild" — the component doing a real job */
  wild?: { title: string; note?: string; Demo: React.FC }
}
