import * as React from 'react'
import {
  Handwritten, ScribbleAccordion, ScribbleAvatar, ScribbleBlockquote, ScribbleCard,
  ScribbleKbd, ScribbleMarquee, ScribbleSeparator, ScribbleTable, toast,
} from '@/components'
import type { ComponentEntry } from './types'

const card: ComponentEntry = {
  slug: 'card',
  title: 'Card',
  icon: '🗂️',
  category: 'Surfaces',
  tagline: 'a scrap pinned to the board',
  description: 'Angle, fastener (pin, tape, paperclip, corner fold), fastener alignment and hatched-shadow depth are all adjustable — and the shadow is drawn hatching, never a blur.',
  Demo: () => (
    <div className="flex flex-wrap gap-8 py-3">
      <ScribbleCard fastener="pin" className="w-44"><p className="m-0 text-sm font-bold">pinned</p><p className="m-0 mt-1 text-xs text-ink-soft">red pin, centered</p></ScribbleCard>
      <ScribbleCard fastener="tape" fastenerAlign="left" angle={2} className="w-44"><p className="m-0 text-sm font-bold">taped, left</p><p className="m-0 mt-1 text-xs text-ink-soft">tilted 2° on purpose</p></ScribbleCard>
      <ScribbleCard fastener="clip" depth={2} className="w-44"><p className="m-0 text-sm font-bold">clipped</p><p className="m-0 mt-1 text-xs text-ink-soft">drawn paperclip, deeper shadow</p></ScribbleCard>
      <ScribbleCard fastener="fold" depth={3} angle={-1.5} className="w-44"><p className="m-0 text-sm font-bold">dog-eared</p><p className="m-0 mt-1 text-xs text-ink-soft">corner fold, deepest</p></ScribbleCard>
    </div>
  ),
  knobs: [
    { key: 'fastener', label: 'fastener', type: 'select', options: ['pin', 'tape', 'clip', 'fold', 'none'], def: 'pin' },
    { key: 'align', label: 'align', type: 'select', options: ['left', 'center', 'right'], def: 'center' },
    { key: 'angle', label: 'angle°', type: 'range', min: -6, max: 6, def: -1 },
    { key: 'depth', label: 'depth', type: 'range', min: 0, max: 3, def: 1 },
  ],
  KnobDemo: ({ k }) => (
    <div className="flex h-44 items-center justify-center">
      <ScribbleCard
        fastener={k.fastener as never}
        fastenerAlign={k.align as never}
        angle={k.angle as number}
        depth={k.depth as never}
        seed={JSON.stringify(k)}
        className="w-52"
      >
        <p className="m-0 text-sm font-bold">adjust me</p>
        <p className="m-0 mt-1 text-xs text-ink-soft">angle, fastener, depth — your call</p>
      </ScribbleCard>
    </div>
  ),
  usage: `import { ScribbleCard } from '@/scribbleui/components/card'

<ScribbleCard fastener="clip" fastenerAlign="left" angle={2} depth={2}>
  <TripNotes />
</ScribbleCard>`,
  props: [
    ['fastener', `'pin' | 'tape' | 'clip' | 'fold' | 'none'`, 'what holds it to the board'],
    ['fastenerAlign', `'left' | 'center' | 'right'`, 'where it\'s fastened'],
    ['angle', 'number (deg)', 'tilt; omit for a seeded hand placement'],
    ['depth', '0 | 1 | 2 | 3', 'hatched-shadow depth'],
  ],
}

const accordion: ComponentEntry = {
  slug: 'accordion',
  title: 'Accordion',
  icon: '🪗',
  category: 'Surfaces',
  tagline: 'paper strips, wavy rules, a claiming bracket',
  description: 'Separators are wavy pencil lines, the open title gets underlined in ink, a drawn bracket claims exactly the revealed content, and the chevron is a plus that re-draws into a minus — hands don\'t rotate glyphs.',
  Demo: () => (
    <ScribbleAccordion defaultValue="a" items={[
      { value: 'a', title: 'why does the open row feel different?', content: 'It sits on darker paper, arrived with a tiny rotation, and the bracket beside this text spans exactly what was revealed.' },
      { value: 'b', title: 'is the chevron rotating?', content: 'No — the plus is erased and a minus is drawn. Watch it.' },
      { value: 'c', title: 'can several be open?', content: 'Pass multiple. This demo keeps one.' },
    ]} />
  ),
  usage: `import { ScribbleAccordion } from '@/scribbleui/components/accordion'

<ScribbleAccordion
  multiple
  items={[{ value: 'a', title: 'shipping?', content: <Answer /> }]}
/>`,
  props: [
    ['items', '{ value, title, content }[]', 'the strips'],
    ['multiple', 'boolean', 'allow several open'],
  ],
}

const table: ComponentEntry = {
  slug: 'table',
  title: 'Table',
  icon: '▦',
  category: 'Surfaces',
  tagline: 'a properly ruled ledger',
  description: 'Every rule is measured from the real rendered table, so the drawn grid always lands on the rows and columns: ink for the header rule, pencil for the body grid, a full drawn border, and a highlighter swipe on hover.',
  Demo: () => (
    <ScribbleTable
      onRowClick={r => toast(String(r.kernel))}
      columns={[
        { key: 'kernel', header: 'kernel' },
        { key: 'gflops', header: 'gflops' },
        { key: 'notes', header: 'notes' },
      ]}
      rows={[
        { kernel: 'naive', gflops: '309', notes: 'one thread, one dot product' },
        { kernel: 'coalesced', gflops: '1.9k', notes: 'reads get organized' },
        { kernel: 'tiled', gflops: '8.5k', notes: 'shared memory enters' },
        { kernel: 'cuBLAS', gflops: '23k', notes: 'the ceiling' },
      ]}
    />
  ),
  usage: `import { ScribbleTable } from '@/scribbleui/components/table'

<ScribbleTable
  bordered
  columns={[{ key: 'kernel', header: 'kernel' }, …]}
  rows={data}
  onRowClick={open}
/>`,
  props: [
    ['columns / rows', 'defs / records', 'the ledger'],
    ['bordered', 'boolean', 'draw the outer border too (default true)'],
    ['onRowClick', '(row, i) => void', 'rows become clickable'],
  ],
}

const separator: ComponentEntry = {
  slug: 'separator',
  title: 'Separator',
  icon: '〰',
  category: 'Surfaces',
  tagline: "a scribe's flourish between thoughts",
  description: 'Squiggle, dots, or wave — drawn once when scrolled into view, with a confident end-flick. Never loops.',
  Demo: () => (
    <div className="flex flex-col">
      <ScribbleSeparator variant="squiggle" />
      <ScribbleSeparator variant="dots" />
      <ScribbleSeparator variant="wave" label="meanwhile" />
    </div>
  ),
  usage: `import { ScribbleSeparator } from '@/scribbleui/components/separator'

<ScribbleSeparator variant="wave" label="meanwhile" />`,
  props: [['variant', `'squiggle' | 'dots' | 'wave'`, 'the flourish'], ['label', 'string', 'optional handwritten word between two flourishes']],
}

const avatar: ComponentEntry = {
  slug: 'avatar',
  title: 'Avatar',
  icon: '👤',
  category: 'Surfaces',
  tagline: 'a locket frame, initials handwritten',
  description: 'A double-drawn circle frame — traced twice means framed with care. Fallback initials are handwritten, never typeset, and the presence dot is an ink drop.',
  Demo: () => (
    <div className="flex items-center gap-6 py-2">
      <ScribbleAvatar initials="ay" presence="online" size={56} />
      <ScribbleAvatar initials="kb" size={48} />
      <ScribbleAvatar initials="mm" size={44} presence="away" />
      <ScribbleAvatar initials="+3" size={40} />
    </div>
  ),
  usage: `import { ScribbleAvatar } from '@/scribbleui/components/avatar'

<ScribbleAvatar src={user.photo} initials="ay" presence="online" />`,
  props: [
    ['src / initials', 'string', 'photo, or handwritten fallback'],
    ['presence', `'online' | 'away' | 'none'`, 'ink-drop status'],
  ],
}

const kbd: ComponentEntry = {
  slug: 'kbd',
  title: 'Kbd',
  icon: '⌨',
  category: 'Surfaces',
  tagline: 'a keycap sketched from life',
  description: 'A drawn cap on a drawn base line — and with listen, the sketched cap physically depresses when its real key fires. Docs that feel alive.',
  Demo: () => (
    <p className="flex items-center gap-2 font-body text-sm text-ink-soft">
      press <ScribbleKbd listen>K</ScribbleKbd> or <ScribbleKbd listen>S</ScribbleKbd> — the caps really depress
    </p>
  ),
  usage: `import { ScribbleKbd } from '@/scribbleui/components/kbd'

press <ScribbleKbd listen>K</ScribbleKbd> to search`,
  props: [['listen', 'boolean', 'depress when the real key fires']],
}

const marquee: ComponentEntry = {
  slug: 'marquee',
  title: 'Marquee',
  icon: '📜',
  category: 'Surfaces',
  tagline: 'a paper tape, hand-pulled',
  description: 'Content rides a tape between double-ruled edges — with a tiny speed wobble, because a hand is pulling it. Hover drags it slow.',
  Demo: () => (
    <ScribbleMarquee items={['every stroke carries meaning', 'pen physics', 'seeded ink', 'a11y first', 'MIT']} />
  ),
  usage: `import { ScribbleMarquee } from '@/scribbleui/components/marquee'

<ScribbleMarquee items={['drawn', 'not', 'rendered']} speed={40} />`,
  props: [['items', 'ReactNode[]', 'what rides the tape'], ['speed', 'number', 'px/second before the wobble']],
}

const blockquote: ComponentEntry = {
  slug: 'blockquote',
  title: 'Blockquote',
  icon: '❝',
  category: 'Surfaces',
  tagline: 'copied into a commonplace book',
  description: 'Oversized drawn quotation marks open AND close the quote, a margin rule sweeps its height, and the attribution arrives after a drawn dash. The card variant tapes it in like a clipping.',
  Demo: () => (
    <div className="flex flex-col gap-8">
      <ScribbleBlockquote cite="a wise reviewer">
        Perfection is achieved when there is nothing left to take away — except the wobble. Keep the wobble.
      </ScribbleBlockquote>
    </div>
  ),
  variants: [
    { title: 'card clipping', Demo: () => (
      <ScribbleBlockquote variant="card" cite="the changelog">
        v0.2: the accordion no longer looks machine-made.
      </ScribbleBlockquote>
    ) },
  ],
  usage: `import { ScribbleBlockquote } from '@/scribbleui/components/blockquote'

<ScribbleBlockquote cite="a wise reviewer" variant="card">
  Keep the wobble.
</ScribbleBlockquote>`,
  props: [['variant', `'margin' | 'card'`, 'margin rule, or taped clipping'], ['cite', 'string', 'handwritten attribution']],
}

export const surfaces: ComponentEntry[] = [card, accordion, table, separator, avatar, kbd, marquee, blockquote]
