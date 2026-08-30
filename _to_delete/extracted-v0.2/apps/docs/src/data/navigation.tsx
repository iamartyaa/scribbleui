import * as React from 'react'
import {
  ScribbleBreadcrumb, ScribbleDock, ScribbleSidebar, ScribbleTabs, toast,
} from '@/components'
import type { ComponentEntry } from './types'

const tabs: ComponentEntry = {
  slug: 'tabs',
  title: 'Tabs',
  icon: '⌒',
  category: 'Navigation',
  tagline: 'the pen lifts, flies, and re-draws',
  description: 'The active mark never slides. The old one erases, a dotted flight arc shows the pen\'s hop, and a fresh mark draws under the new tab with a fresh seed. Underline or circled, icons welcome.',
  Demo: () => (
    <ScribbleTabs items={[
      { value: 'sketch', icon: '✏️', label: 'sketch', content: 'Watch the dotted flight arc when you switch — that\'s the pen travelling.' },
      { value: 'ink', icon: '🖋️', label: 'ink', content: 'Every landing draws with a fresh seed. Hands never repeat a line.' },
      { value: 'ship', icon: '🚀', label: 'ship', content: 'Arrow keys work too.' },
    ]} />
  ),
  variants: [
    { title: 'circled', note: 'the active tab gets circled instead', Demo: () => (
      <ScribbleTabs variant="circled" items={[
        { value: 'mon', label: 'mon' }, { value: 'tue', label: 'tue' }, { value: 'wed', label: 'wed' }, { value: 'thu', label: 'thu' },
      ]} />
    ) },
  ],
  usage: `import { ScribbleTabs } from '@/scribbleui/components/tabs'

<ScribbleTabs
  variant="underline"   // or "circled"
  items={[
    { value: 'sketch', icon: '✏️', label: 'sketch', content: <Sketch /> },
    { value: 'ink', label: 'ink', content: <Ink /> },
  ]}
/>`,
  props: [
    ['variant', `'underline' | 'circled'`, 'how the active tab is marked'],
    ['items', '{ value, label, icon?, content? }[]', 'tabs + panels'],
  ],
}

const sidebar: ComponentEntry = {
  slug: 'sidebar',
  title: 'Sidebar',
  icon: '☰',
  category: 'Navigation',
  tagline: 'a margin arrow says "you are here"',
  description: 'A jotted list that scales from flat nav to grouped, collapsible, icon-and-badge sections. The margin arrow pen-lift hops between items; the active row gets a highlighter swipe. This very site\'s sidebar is this component.',
  Demo: () => (
    <ScribbleSidebar
      title="the studio"
      groups={[
        { title: 'work', items: [
          { value: 'inbox', label: 'inbox', icon: '📥', badge: '3' },
          { value: 'drafts', label: 'drafts', icon: '✏️' },
        ] },
        { title: 'play', collapsible: true, items: [
          { value: 'doodles', label: 'doodles', icon: '🌀' },
          { value: 'cats', label: 'cat pics', icon: '🐈', badge: '!!' },
        ] },
      ]}
    />
  ),
  usage: `import { ScribbleSidebar } from '@/scribbleui/components/sidebar'

<ScribbleSidebar
  groups={[
    { title: 'work', items: [{ value: 'inbox', label: 'inbox', icon: '📥', badge: '3' }] },
    { title: 'play', collapsible: true, items: [...] },
  ]}
  onValueChange={goTo}
/>`,
  props: [
    ['groups', '{ title?, collapsible?, items }[]', 'sections; or pass flat `items`'],
    ['items[].icon / badge', 'ReactNode', 'leading icon, trailing badge'],
    ['marker', `'arrow' | 'swipe' | 'both'`, 'how "you are here" is drawn'],
  ],
}

const breadcrumb: ComponentEntry = {
  slug: 'breadcrumb',
  title: 'Breadcrumb',
  icon: '↣',
  category: 'Navigation',
  tagline: 'a treasure-map route',
  description: 'Your path as dashes between stops; the page you\'re standing on gets the heaviest dot. Truncation becomes a scribbled detour.',
  Demo: () => (
    <ScribbleBreadcrumb items={[
      { label: 'desk', href: '#' },
      { label: 'notebooks', href: '#' },
      { label: 'scribbles', href: '#' },
      { label: 'this one' },
    ]} />
  ),
  usage: `import { ScribbleBreadcrumb } from '@/scribbleui/components/breadcrumb'

<ScribbleBreadcrumb items={[
  { label: 'home', href: '/' },
  { label: 'docs', href: '/docs' },
  { label: 'button' },
]} />`,
  props: [['items', '{ label, href? }[]', 'stops on the route; last one is "you are here"']],
}

const dock: ComponentEntry = {
  slug: 'dock',
  title: 'Dock',
  icon: '⚓',
  category: 'Navigation',
  tagline: 'the shelf sags under your pointer',
  description: 'Sticker icons on a drawn shelf that fisheye-magnify toward your pointer — and the shelf line itself SAGS under the hovered sticker\'s weight, redrawn like a bending plank. Labels arrive on paper scraps; clicking makes a sticker hop.',
  Demo: () => (
    <div className="flex justify-center py-4">
      <ScribbleDock
        active="pen"
        onSelect={v => toast(`${v} hopped!`)}
        items={[
          { value: 'pen', icon: '✏️', label: 'write' },
          { value: 'ink', icon: '🖋️', label: 'ink' },
          { value: 'ruler', icon: '📐', label: 'measure' },
          { value: 'clip', icon: '📎', label: 'attach' },
          { value: 'book', icon: '📓', label: 'notes' },
        ]}
      />
    </div>
  ),
  usage: `import { ScribbleDock } from '@/scribbleui/components/dock'

<ScribbleDock
  active={tool}
  onSelect={setTool}
  items={[{ value: 'pen', icon: '✏️', label: 'write' }, …]}
/>`,
  props: [
    ['items', '{ value, icon, label }[]', 'the stickers'],
    ['active', 'string', 'ink dot under the active sticker'],
    ['onSelect', '(value) => void', 'click — the sticker hops'],
  ],
}

export const navigation: ComponentEntry[] = [tabs, sidebar, breadcrumb, dock]
