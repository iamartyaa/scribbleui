import * as React from 'react'
import {
  ScribbleBadge, ScribbleButton, ScribbleLoader, ScribbleProgress, ScribbleSkeleton, toast,
} from '@/components'
import type { ComponentEntry } from './types'

const toastEntry: ComponentEntry = {
  slug: 'toast',
  title: 'Toast',
  icon: '🍞',
  category: 'Feedback',
  tagline: 'a note slid across the desk',
  description: 'Each toast is a paper slip with its own seeded rotation — the stack is messy on purpose, because a tidy stack is a machine\'s stack. Flick one off the desk to dismiss it; success writes its ✓ after landing.',
  Demo: () => (
    <div className="flex flex-wrap gap-4">
      <ScribbleButton onClick={() => toast('saved ✓ — nice.')}>slide a note</ScribbleButton>
      <ScribbleButton variant="primary" onClick={() => toast.success('build shipped')}>success</ScribbleButton>
      <ScribbleButton variant="danger" onClick={() => toast.error('kernel panicked')}>error</ScribbleButton>
    </div>
  ),
  usage: `import { toast, ScribbleToaster } from '@/scribbleui/components/toast'

// once, at the root:
<ScribbleToaster />

// anywhere:
toast('saved ✓ — nice.')
toast.success('build shipped')
toast.error('kernel panicked')`,
  props: [
    ['toast(msg)', 'fn', 'slide a note; .success / .error add drawn ✓ / ✗'],
    ['<ScribbleToaster />', 'component', 'mount once; drag a note right to flick it away'],
  ],
}

const badge: ComponentEntry = {
  slug: 'badge',
  title: 'Badge',
  icon: '➂',
  category: 'Feedback',
  tagline: 'urgency in scribble loops',
  description: 'Each escalation adds another loop to the circle around the count. Three unread = calmly circled; twenty = furiously scribbled. Urgency is drawn, not colored.',
  Demo: () => {
    const [n, setN] = React.useState(2)
    return (
      <div className="flex items-center gap-10 py-3">
        <ScribbleBadge count={n}><span className="text-3xl">🔔</span></ScribbleBadge>
        <ScribbleBadge count={n * 6}><span className="text-3xl">📮</span></ScribbleBadge>
        <ScribbleBadge dot><span className="text-3xl">📁</span></ScribbleBadge>
        <ScribbleButton onClick={() => setN(v => v + 1)}>+1 unread</ScribbleButton>
        <ScribbleButton shape="underline" onClick={() => setN(0)}>read them all</ScribbleButton>
      </div>
    )
  },
  usage: `import { ScribbleBadge } from '@/scribbleui/components/badge'

<ScribbleBadge count={unread}><BellIcon /></ScribbleBadge>
<ScribbleBadge dot><FolderIcon /></ScribbleBadge>`,
  props: [
    ['count', 'number', 'loops scale with magnitude'],
    ['dot', 'boolean', 'just an ink drop, no number'],
    ['max', 'number', 'caps the label at max+'],
  ],
}

const loader: ComponentEntry = {
  slug: 'loader',
  title: 'Loader',
  icon: '➰',
  category: 'Feedback',
  tagline: 'waiting, drawn three ways',
  description: 'A loader only ever waits — outcomes belong to Progress and Toast. Comet orbits a drawn loop with a drying tail; doodle is the bored pen inventing a new scribble each round; dots writes an ellipsis like someone thinking with a pen.',
  Demo: () => (
    <div className="flex items-center gap-14 py-4">
      <div className="flex flex-col items-center gap-2"><ScribbleLoader variant="comet" /><span className="font-label text-[10px] text-pencil">comet</span></div>
      <div className="flex flex-col items-center gap-2"><ScribbleLoader variant="doodle" /><span className="font-label text-[10px] text-pencil">doodle</span></div>
      <div className="flex flex-col items-center gap-2"><ScribbleLoader variant="dots" size={44} /><span className="font-label text-[10px] text-pencil">dots</span></div>
    </div>
  ),
  usage: `import { ScribbleLoader } from '@/scribbleui/components/loader'

<ScribbleLoader variant="comet" />
<ScribbleLoader variant="doodle" size={56} />`,
  props: [
    ['variant', `'comet' | 'doodle' | 'dots'`, 'how the waiting is drawn'],
    ['size', 'number', 'px'],
  ],
}

const progress: ComponentEntry = {
  slug: 'progress',
  title: 'Progress',
  icon: '▭',
  category: 'Feedback',
  tagline: 'a line drawn toward a waiting checkbox',
  description: 'The destination is drawn first: an empty checkbox at the end of a pencil guide. Progress is ink advancing toward it — and at 100%, the checkbox\'s flick fires. The payoff is the point.',
  Demo: () => {
    const [v, setV] = React.useState(58)
    return (
      <div className="flex flex-col gap-5 pt-5">
        <ScribbleProgress value={v} label="upload" className="w-80" />
        <div className="flex gap-4">
          <ScribbleButton onClick={() => setV(p => Math.min(100, p + 17))}>advance</ScribbleButton>
          <ScribbleButton shape="underline" onClick={() => setV(0)}>start over</ScribbleButton>
        </div>
      </div>
    )
  },
  usage: `import { ScribbleProgress } from '@/scribbleui/components/progress'

<ScribbleProgress value={percent} label="upload" />`,
  props: [['value', 'number 0–100', 'at 100 the tick flicks']],
}

const skeleton: ComponentEntry = {
  slug: 'skeleton',
  title: 'Skeleton',
  icon: '𓏟',
  category: 'Feedback',
  tagline: 'loading is sketching',
  description: 'Placeholders are pencil roughs — squiggled fake writing, a boxed fake image with doodled mountains — and while data loads, the pencil keeps lightly adding to the sketch. Content is inked over the draft; the pencil erases. Shimmer is banned.',
  Demo: () => {
    const [loading, setLoading] = React.useState(true)
    return (
      <div className="flex max-w-md flex-col gap-4">
        <ScribbleSkeleton loading={loading} kind="media">
          <div className="border-[1.5px] border-ink bg-card p-3">
            <div className="flex h-20 items-center justify-center bg-paper-2 font-hand text-xl text-pencil">the actual picture 🏔️</div>
            <h4 className="mb-0 mt-2 font-display text-base font-bold">Trip report: Spiti</h4>
            <p className="m-0 text-sm text-ink-soft">Real content, inked over the pencil draft.</p>
          </div>
        </ScribbleSkeleton>
        <ScribbleButton onClick={() => setLoading(l => !l)}>{loading ? 'ink it' : 'back to pencil'}</ScribbleButton>
      </div>
    )
  },
  variants: [
    { title: 'kinds', note: 'text · media · profile', Demo: () => (
      <div className="flex flex-col gap-6">
        <ScribbleSkeleton loading kind="text"><div style={{ height: 84 }} /></ScribbleSkeleton>
        <ScribbleSkeleton loading kind="profile"><div style={{ height: 48 }} /></ScribbleSkeleton>
      </div>
    ) },
  ],
  usage: `import { ScribbleSkeleton } from '@/scribbleui/components/skeleton'

<ScribbleSkeleton loading={isLoading} kind="media">
  <ArticleCard />
</ScribbleSkeleton>`,
  props: [
    ['loading', 'boolean', 'false inks the content over and erases the pencil'],
    ['kind', `'text' | 'media' | 'profile'`, 'what\'s being sketched'],
  ],
}

export const feedback: ComponentEntry[] = [toastEntry, badge, loader, progress, skeleton]
