import type { ComponentEntry } from './types'
import { inkText } from './ink-text'
import { forms } from './forms'
import { navigation } from './navigation'
import { overlays } from './overlays'
import { feedback } from './feedback'
import { surfaces } from './surfaces'
import { delight } from './delight'

export type { ComponentEntry, KnobDef } from './types'

export const CATEGORIES: { title: string; entries: ComponentEntry[] }[] = [
  { title: 'Ink & Text', entries: inkText },
  { title: 'Forms', entries: forms },
  { title: 'Navigation', entries: navigation },
  { title: 'Overlays', entries: overlays },
  { title: 'Feedback', entries: feedback },
  { title: 'Surfaces', entries: surfaces },
  { title: 'Delight', entries: delight },
]

export const ALL: ComponentEntry[] = CATEGORIES.flatMap(c => c.entries)
export const bySlug = (slug: string): ComponentEntry | undefined => ALL.find(e => e.slug === slug)
