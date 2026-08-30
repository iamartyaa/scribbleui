import * as React from 'react'
import {
  ScribbleButton, ScribbleContextMenu, ScribbleDrawer, ScribbleModal, ScribblePopover,
  ScribbleTooltip, toast,
} from '@/components'
import type { ComponentEntry } from './types'

const tooltip: ComponentEntry = {
  slug: 'tooltip',
  title: 'Tooltip',
  icon: '💬',
  category: 'Overlays',
  tagline: 'a whispered jot with a leader line',
  description: 'No bubble-with-caret. A handwritten jot connected by a thin drawn leader — the line literally points at what it explains. On leave, the whole thing erases tail-first. Drawn, never faded.',
  Demo: () => (
    <div className="flex gap-8 py-10">
      <ScribbleTooltip content="saves to disk, promise ✓">
        <span><ScribbleButton>hover me</ScribbleButton></span>
      </ScribbleTooltip>
      <ScribbleTooltip content="beneath, for variety" side="bottom">
        <span><ScribbleButton shape="box">or me</ScribbleButton></span>
      </ScribbleTooltip>
    </div>
  ),
  usage: `import { ScribbleTooltip } from '@/scribbleui/components/tooltip'

<ScribbleTooltip content="saves to disk, promise ✓">
  <button>save</button>
</ScribbleTooltip>`,
  props: [
    ['content', 'ReactNode', 'the jot (hand font)'],
    ['side', `'top' | 'bottom'`, 'where it whispers from'],
    ['delay', 'number (ms)', 'hover intent delay'],
  ],
}

const popover: ComponentEntry = {
  slug: 'popover',
  title: 'Popover',
  icon: '🗒️',
  category: 'Overlays',
  tagline: 'a sticky note, slapped on',
  description: 'Content arrives on its own piece of paper, taped on at a seeded 1–3° because humans never tape straight. It lands with a squash-settle and peels off by a corner.',
  Demo: () => (
    <div className="flex h-56 justify-center pt-2">
      <ScribblePopover trigger={<ScribbleButton variant="primary">share</ScribbleButton>}>
        <div className="flex flex-col gap-1.5 font-body">
          <button className="cursor-pointer bg-transparent p-0 text-left hover:text-accent" style={{ border: 'none' }} onClick={() => toast('link copied ✓')}>copy link</button>
          <button className="cursor-pointer bg-transparent p-0 text-left hover:text-accent" style={{ border: 'none' }} onClick={() => toast('email drafted')}>email it</button>
          <button className="cursor-pointer bg-transparent p-0 text-left hover:text-accent" style={{ border: 'none' }} onClick={() => toast('embedded')}>embed</button>
        </div>
      </ScribblePopover>
    </div>
  ),
  usage: `import { ScribblePopover } from '@/scribbleui/components/popover'

<ScribblePopover trigger={<ScribbleButton>share</ScribbleButton>}>
  <ShareOptions />
</ScribblePopover>`,
  props: [
    ['trigger', 'ReactNode', 'click to slap the note on'],
    ['children', 'ReactNode', 'what\'s written on the note'],
  ],
}

const modal: ComponentEntry = {
  slug: 'modal',
  title: 'Modal',
  icon: '▣',
  category: 'Overlays',
  tagline: 'the page behind turns to pencil',
  description: 'A fresh sheet placed over your work. The backdrop doesn\'t dim — the page behind desaturates to a pencil draft of itself, making the sheet the only ink on the desk. Cancel crumples it; the close is an ✗ drawn in red.',
  Demo: () => {
    const [open, setOpen] = React.useState(false)
    return (
      <>
        <ScribbleButton variant="primary" onClick={() => setOpen(true)}>place the sheet</ScribbleButton>
        <ScribbleModal open={open} onOpenChange={setOpen} title="sure about this?">
          <p className="m-0">Everything behind this sheet just turned to pencil. That's the point — this is the only decision on the desk right now.</p>
          <div className="mt-4 flex gap-4">
            <ScribbleButton variant="primary" onClick={() => { setOpen(false); toast.success('inked') }}>yes, ink it</ScribbleButton>
            <ScribbleButton onClick={() => setOpen(false)}>crumple</ScribbleButton>
          </div>
        </ScribbleModal>
      </>
    )
  },
  usage: `import { ScribbleModal } from '@/scribbleui/components/modal'

<ScribbleModal open={open} onOpenChange={setOpen} title="sure about this?">
  <p>…</p>
</ScribbleModal>`,
  props: [
    ['open / onOpenChange', 'boolean / fn', 'controlled visibility'],
    ['title', 'ReactNode', 'sheet heading'],
  ],
}

const drawer: ComponentEntry = {
  slug: 'drawer',
  title: 'Drawer',
  icon: '📂',
  category: 'Overlays',
  tagline: 'the page has a folded flap',
  description: 'A dashed crease marks the fold; the panel unfolds along it with paper-stiff ease. Right, left, or bottom-sheet.',
  Demo: () => {
    const [open, setOpen] = React.useState(false)
    const [side, setSide] = React.useState<'right' | 'bottom'>('right')
    return (
      <div className="flex gap-4">
        <ScribbleButton onClick={() => { setSide('right'); setOpen(true) }}>unfold right</ScribbleButton>
        <ScribbleButton onClick={() => { setSide('bottom'); setOpen(true) }}>bottom sheet</ScribbleButton>
        <ScribbleDrawer open={open} onOpenChange={setOpen} side={side} title="cart (3)">
          <p className="m-0">A dashed crease marks the fold. Escape folds it back.</p>
        </ScribbleDrawer>
      </div>
    )
  },
  usage: `import { ScribbleDrawer } from '@/scribbleui/components/drawer'

<ScribbleDrawer open={open} onOpenChange={setOpen} side="right" title="cart (3)">
  <Cart />
</ScribbleDrawer>`,
  props: [['side', `'right' | 'left' | 'bottom'`, 'which edge the flap folds from']],
}

const contextMenu: ComponentEntry = {
  slug: 'context-menu',
  title: 'Context Menu',
  icon: '☰',
  category: 'Overlays',
  tagline: 'jotted exactly where you clicked',
  description: 'Options scribble in top-to-bottom on a scrap at the cursor; a drawn arrow points at what you\'re about to pick. Destructive items are written in red ink.',
  Demo: () => (
    <ScribbleContextMenu items={[
      { label: 'copy', onSelect: () => toast('copied ✓') },
      { label: 'duplicate', onSelect: () => toast('two of them now') },
      { label: 'burn it', danger: true, onSelect: () => toast.error('gone.') },
    ]}>
      <div className="flex h-28 items-center justify-center border border-dashed border-pencil font-hand text-xl text-pencil">
        right-click anywhere in this scrap
      </div>
    </ScribbleContextMenu>
  ),
  usage: `import { ScribbleContextMenu } from '@/scribbleui/components/context-menu'

<ScribbleContextMenu items={[
  { label: 'copy', onSelect: copy },
  { label: 'delete', danger: true, onSelect: destroy },
]}>
  <FileCard />
</ScribbleContextMenu>`,
  props: [['items', '{ label, onSelect?, danger?, disabled? }[]', 'the jotted options']],
}

export const overlays: ComponentEntry[] = [tooltip, popover, modal, drawer, contextMenu]
