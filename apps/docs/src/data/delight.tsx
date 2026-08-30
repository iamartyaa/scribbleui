import * as React from 'react'
import {
  ScribbleButton, ScribbleEmptyState, ScribbleThemeToggle, Stickman,
} from '@/components'
import type { ComponentEntry } from './types'

const themeToggle: ComponentEntry = {
  slug: 'theme-toggle',
  title: 'Theme Toggle',
  icon: '🌙',
  category: 'Delight',
  tagline: 'scribble out the sun',
  description: 'Day isn\'t toggled off — it\'s furiously scribbled out, and night is drawn fresh: a proper crescent with twinkle stars. (This one actually flips the site\'s theme — try it.)',
  Demo: () => (
    <div className="flex items-center gap-5">
      <span className="scale-150"><ScribbleThemeToggle /></span>
      <span className="font-hand text-xl text-ink-soft">← 300ms of righteous scribbling</span>
    </div>
  ),
  usage: `import { ScribbleThemeToggle } from '@/scribbleui/components/theme-toggle'

<ScribbleThemeToggle />  // reads/writes data-theme on <html>`,
  props: [['theme / onThemeChange', `'light' | 'dark' / fn`, 'controlled mode, if you manage theme yourself']],
}

const emptyState: ComponentEntry = {
  slug: 'empty-state',
  title: 'Empty State',
  icon: '📭',
  category: 'Delight',
  tagline: 'a doodle and a nudge',
  description: 'A contextual doodle, a handwritten note, then an arrow flicks at the one action that fixes the emptiness — in that order, because the order tells the story.',
  Demo: () => (
    <ScribbleEmptyState note="nothing here yet — draw something?" action={<ScribbleButton variant="primary" shape="sticker">+ first scribble</ScribbleButton>} />
  ),
  variants: [
    { title: 'moods', note: 'empty · search · error', Demo: () => (
      <div className="grid gap-4 md:grid-cols-2">
        <ScribbleEmptyState mood="search" note="no matches — loosen up?" />
        <ScribbleEmptyState mood="error" note="that went badly." />
      </div>
    ) },
  ],
  usage: `import { ScribbleEmptyState } from '@/scribbleui/components/empty-state'

<ScribbleEmptyState
  mood="search"
  note="no matches — loosen up?"
  action={<ScribbleButton>clear filters</ScribbleButton>}
/>`,
  props: [['mood', `'empty' | 'search' | 'error'`, 'which doodle'], ['note', 'string', 'the handwritten line'], ['action', 'ReactNode', 'what the arrow points at']],
}

const stickman: ComponentEntry = {
  slug: 'stickman',
  title: 'Stickman',
  icon: '🚶',
  category: 'Delight',
  tagline: 'the library\'s tiny resident',
  description: 'A pencil-drawn stickman with five poses — wave, point, draw, run, think. Waving, running and drawing keep moving, redrawn stroke-by-stroke like a flipbook. Scatter him through empty states, 404s and docs.',
  Demo: () => (
    <div className="flex flex-wrap items-end gap-10 py-2">
      {(['wave', 'point', 'draw', 'run', 'think'] as const).map(p => (
        <div key={p} className="flex flex-col items-center gap-1">
          <Stickman pose={p} size={92} seed={'sm' + p} />
          <span className="font-label text-[10px] text-pencil">{p}</span>
        </div>
      ))}
    </div>
  ),
  usage: `import { Stickman } from '@/scribbleui/components/stickman'

<Stickman pose="think" size={96} />
<Stickman pose="run" flip />`,
  props: [
    ['pose', `'wave' | 'point' | 'draw' | 'run' | 'think'`, 'what he\'s up to'],
    ['animate', 'boolean', 'flipbook motion for wave/run/draw'],
    ['flip', 'boolean', 'face the other way'],
  ],
  wild: {
    title: 'a 404 with more charm than your homepage',
    Demo: () => (
      <div className="flex items-center gap-6 py-2">
        <Stickman pose="think" size={100} seed="404" />
        <div>
          <p className="m-0 font-display text-2xl font-bold">404</p>
          <p className="m-0 font-hand text-xl text-ink-soft">this page was erased. or never drawn?</p>
          <ScribbleButton className="mt-2" shape="underline">walk home</ScribbleButton>
        </div>
      </div>
    ),
  },
}

export const delight: ComponentEntry[] = [themeToggle, emptyState, stickman]
