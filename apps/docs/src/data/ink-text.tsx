import * as React from 'react'
import {
  Annotate, Handwritten, MarginNote, ScratchNumber, ScribbleArrow, ScribbleArrowArt,
  ScribbleButton, ScribbleCard, Stickman,
} from '@/components'
import type { ComponentEntry } from './types'

const handwritten: ComponentEntry = {
  slug: 'handwritten',
  title: 'Handwritten',
  icon: '✍️',
  category: 'Ink & Text',
  tagline: 'text that writes itself — the founding component',
  description: 'Centerline stroke fonts with real pen physics: the nib slows through curves, lifts and flies between strokes, and ink width follows speed. Presets give you headings, paragraphs and script asides; the real text stays in the DOM for selection, screen readers and SEO.',
  Demo: () => (
    <div className="flex flex-col gap-4">
      <Handwritten as="h1" seed="hw-h1" color="var(--sui-ink)">Dear reader,</Handwritten>
      <Handwritten as="p" seed="hw-p" maxWidth={460} color="var(--sui-ink-soft)">this paragraph is being written, not typed.</Handwritten>
      <Handwritten as="span" seed="hw-s" color="var(--sui-accent)">— yours, a very patient pen</Handwritten>
    </div>
  ),
  variants: [
    { title: 'weights', note: 'light · regular · bold (double-passed)', Demo: () => (
      <div className="flex flex-col gap-3">
        <Handwritten hand="print" weight="light" size={30} seed="w1">featherlight</Handwritten>
        <Handwritten hand="print" weight="regular" size={30} seed="w2">regular nib</Handwritten>
        <Handwritten hand="print" weight="bold" size={30} seed="w3">traced twice</Handwritten>
      </div>
    ) },
    { title: 'hands', note: 'print · script · bold — or bring your own .hand font', Demo: () => (
      <div className="flex flex-col gap-3">
        <Handwritten hand="print" size={28} seed="h1x">print hand</Handwritten>
        <Handwritten hand="script" size={28} seed="h2x">flowing script</Handwritten>
        <Handwritten hand="bold" size={28} seed="h3x">heavy marker</Handwritten>
      </div>
    ) },
    { title: 'scroll-scrubbed', note: 'drive progress yourself — scrubbing back un-writes', Demo: () => {
      const [p, setP] = React.useState(0.65)
      return (
        <div className="flex flex-col gap-2">
          <Handwritten trigger="manual" progress={p} hand="script" size={34} seed="scrub">un-write me</Handwritten>
          <input type="range" min={0} max={100} value={p * 100} onChange={e => setP(Number(e.target.value) / 100)} className="w-52 accent-[var(--sui-accent)]" aria-label="progress" />
        </div>
      )
    } },
  ],
  knobs: [
    { key: 'size', label: 'size', type: 'range', min: 18, max: 72, def: 40 },
    { key: 'weight', label: 'weight', type: 'select', options: ['light', 'regular', 'bold'], def: 'regular' },
    { key: 'hand', label: 'hand', type: 'select', options: ['print', 'script', 'bold'], def: 'script' },
  ],
  KnobDemo: ({ k }) => (
    <Handwritten
      size={k.size as number}
      weight={k.weight as 'light' | 'regular' | 'bold'}
      hand={k.hand as 'print' | 'script' | 'bold'}
      seed={`knob:${k.size}:${k.weight}:${k.hand}`}
      color="var(--sui-ink)"
    >the quick brown fox</Handwritten>
  ),
  usage: `import { Handwritten } from '@/scribbleui/components/handwritten'

<Handwritten as="h1">Dear reader,</Handwritten>
<Handwritten as="p" maxWidth={460}>
  this paragraph is being written, not typed.
</Handwritten>
<Handwritten trigger="visible" hand="script" weight="bold">
  writes when scrolled into view
</Handwritten>`,
  props: [
    ['as', `'h1' | 'h2' | 'h3' | 'p' | 'span'`, 'typographic preset (size, hand, weight, line-height)'],
    ['hand', `'print' | 'script' | 'bold' | HandFont`, 'stroke font — bring your own .hand file'],
    ['weight', `'light' | 'regular' | 'bold'`, 'nib weight; bold double-passes like traced lettering'],
    ['trigger', `'mount' | 'visible' | 'manual'`, 'when the pen starts'],
    ['progress', 'number 0–1', 'manual mode: scrub through the writing (backwards un-writes)'],
    ['seed', 'string', 'same seed → identical ink (SSR-safe)'],
    ['duration', 'number (ms)', 'force total time; otherwise natural pace'],
  ],
  wild: {
    title: 'a letter that signs itself',
    Demo: () => (
      <ScribbleCard fastener="tape" angle={-1} className="w-80">
        <p className="m-0 font-body text-sm leading-6 text-ink-soft">…so that's the whole story. See you at the workshop —</p>
        <div className="mt-2 text-accent">
          <Handwritten hand="script" size={34} seed="sig" trigger="visible">Amartya</Handwritten>
        </div>
      </ScribbleCard>
    ),
  },
}

const annotate: ComponentEntry = {
  slug: 'annotate',
  title: 'Annotate',
  icon: '⭕',
  category: 'Ink & Text',
  tagline: "a reader's marks on live DOM text",
  description: 'Underline, circle, box, strike, highlight and bracket — measured from the text\'s real client rects, so marks survive line-wrap, resize and font swaps, then re-draw themselves like a reader re-marking the page.',
  Demo: () => {
    const [on, setOn] = React.useState(true)
    return (
      <div>
        <p className="max-w-md font-body leading-8">
          The trick is that marks are measured from <Annotate kind="circle" show={on} color="var(--sui-danger)">real rects</Annotate>, so they
          survive <Annotate kind="underline" show={on}>line wrap and resize</Annotate> — not
          <Annotate kind="strike" show={on}> guessed positions</Annotate>, and yes,
          <Annotate kind="highlight" show={on}> highlights compose</Annotate> with everything else.
        </p>
        <ScribbleButton className="mt-3" onClick={() => setOn(o => !o)}>{on ? 'erase the marks' : 'mark it up'}</ScribbleButton>
      </div>
    )
  },
  variants: [
    { title: 'every mark', Demo: () => (
      <p className="max-w-md font-body leading-9">
        <Annotate kind="underline">underline</Annotate> · <Annotate kind="circle">circle</Annotate> · <Annotate kind="box">box</Annotate> · <Annotate kind="strike">strike</Annotate> · <Annotate kind="highlight">highlight</Annotate> · <Annotate kind="bracket">bracket</Annotate>
      </p>
    ) },
  ],
  usage: `import { Annotate } from '@/scribbleui/components/annotate'

<p>
  measured from <Annotate kind="circle">real rects</Annotate>,
  never <Annotate kind="strike">guessed</Annotate>
</p>`,
  props: [
    ['kind', `'underline' | 'circle' | 'box' | 'strike' | 'highlight' | 'bracket'`, 'the mark'],
    ['show', 'boolean', 'toggle to draw / erase'],
    ['color', 'string', 'defaults: accent ink, highlighter for highlight'],
    ['padding', 'number', 'px around the measured box'],
  ],
  wild: {
    title: 'code review, on paper',
    Demo: () => (
      <pre className="m-0 bg-paper-2 p-4 font-label text-xs leading-7">
        <code>
          {'const total = items.reduce(\n  (sum, i) => sum + i.price '}<Annotate kind="circle" color="var(--sui-danger)">* 100</Annotate>{',\n  0\n)  '}
        </code>
        <span className="ml-3 font-hand text-base text-danger">cents again?!</span>
      </pre>
    ),
  },
}

const arrows: ComponentEntry = {
  slug: 'arrow',
  title: 'Arrows',
  icon: '↝',
  category: 'Ink & Text',
  tagline: '"look here" — five kinds of pointing',
  description: 'Standalone hand-drawn arrows with angle, arc, length and head size as props — straight, curved, loop-de-loop, zigzag and double-headed. For connecting two live DOM nodes (with re-routing), use ScribbleConnect.',
  Demo: () => (
    <div className="flex flex-wrap items-center gap-x-10 gap-y-6 py-4">
      <ScribbleArrowArt kind="straight" length={80} seed="a1" />
      <ScribbleArrowArt kind="curve" length={90} arc={0.3} seed="a2" />
      <ScribbleArrowArt kind="loop" length={110} seed="a3" color="var(--sui-brand)" />
      <ScribbleArrowArt kind="zigzag" length={90} seed="a4" />
      <ScribbleArrowArt kind="double" length={90} arc={0.15} seed="a5" color="var(--sui-ink)" />
    </div>
  ),
  variants: [
    { title: 'any angle', note: 'rotate freely — they are ink, not icons', Demo: () => (
      <div className="flex items-center gap-8 py-6">
        {[0, -35, -90, 30, 145].map(a => <ScribbleArrowArt key={a} kind="curve" length={64} angle={a} seed={'ang' + a} />)}
      </div>
    ) },
    { title: 'connecting live nodes', note: 'ScribbleConnect re-routes when either box moves', Demo: () => {
      const a = React.useRef<HTMLDivElement>(null)
      const b = React.useRef<HTMLDivElement>(null)
      const [wide, setWide] = React.useState(false)
      return (
        <div className="relative flex items-start justify-between py-2" style={{ paddingRight: wide ? 0 : 90, transition: 'padding 300ms' }}>
          <div ref={a} className="border-[1.5px] border-ink bg-card px-3 py-2 font-label text-xs">idea.txt</div>
          <div ref={b} className="mt-20 cursor-pointer border-[1.5px] border-ink bg-card px-3 py-2 font-label text-xs" onClick={() => setWide(w => !w)}>shipped.tsx (click me)</div>
          <ScribbleArrow fromRef={a} toRef={b} label="somehow" bulge={-0.24} />
        </div>
      )
    } },
  ],
  knobs: [
    { key: 'kind', label: 'kind', type: 'select', options: ['straight', 'curve', 'loop', 'zigzag', 'double'], def: 'curve' },
    { key: 'length', label: 'length', type: 'range', min: 40, max: 200, def: 110 },
    { key: 'arc', label: 'arc', type: 'range', min: -50, max: 50, def: 24 },
    { key: 'angle', label: 'angle', type: 'range', min: -180, max: 180, def: 0 },
    { key: 'head', label: 'head', type: 'range', min: 4, max: 18, def: 9 },
  ],
  KnobDemo: ({ k }) => (
    <div className="flex h-40 items-center justify-center">
      <ScribbleArrowArt
        kind={k.kind as never}
        length={k.length as number}
        arc={(k.arc as number) / 100}
        angle={k.angle as number}
        head={k.head as number}
        seed={`k:${JSON.stringify(k)}`}
      />
    </div>
  ),
  usage: `import { ScribbleArrowArt } from '@/scribbleui/components/arrow-art'
import { ScribbleArrow } from '@/scribbleui/components/scribble-arrow'

<ScribbleArrowArt kind="loop" length={110} angle={-20} />

{/* connect two live elements — re-routes on move */}
<ScribbleArrow fromRef={draftRef} toRef={finalRef} label="ships as" />`,
  props: [
    ['kind', `'straight' | 'curve' | 'loop' | 'zigzag' | 'double'`, 'arrow style'],
    ['length / angle / arc / head', 'number', 'the geometry knobs'],
    ['trigger', `'mount' | 'visible'`, 'draw on scroll-in'],
  ],
  wild: {
    title: 'onboarding nudge',
    Demo: () => (
      <div className="flex items-end gap-2 py-2">
        <Stickman pose="point" size={80} seed="sm-arrow" />
        <ScribbleArrowArt kind="curve" length={70} arc={0.35} angle={-24} seed="nudge" color="var(--sui-brand)" />
        <ScribbleButton variant="primary" shape="sticker">start here</ScribbleButton>
      </div>
    ),
  },
}

const scratchNumber: ComponentEntry = {
  slug: 'scratch-number',
  title: 'Scratch Number',
  icon: '#',
  category: 'Ink & Text',
  tagline: 'corrected, never spun',
  description: 'Humans don\'t slot-machine a number — they scratch out the old one and write the new one. Two quick strike strokes, a pen-up hop, fresh digits.',
  Demo: () => {
    const [n, setN] = React.useState(1247)
    return (
      <div className="flex items-center gap-6">
        <ScratchNumber value={n} size={42} seed="stars-demo" />
        <ScribbleButton onClick={() => setN(v => v + Math.ceil(Math.random() * 90))}>another star ✦</ScribbleButton>
      </div>
    )
  },
  usage: `import { ScratchNumber } from '@/scribbleui/components/scratch-number'

<ScratchNumber value={stars} size={42} format={n => n.toLocaleString()} />`,
  props: [
    ['value', 'number', 'the number; changes trigger the scratch-and-rewrite'],
    ['format', '(n) => string', 'formatting before writing'],
    ['size', 'number', 'digit height in px'],
  ],
  wild: {
    title: 'live star count',
    Demo: () => {
      const [n, setN] = React.useState(1247)
      React.useEffect(() => {
        const id = setInterval(() => setN(v => v + Math.ceil(Math.random() * 3)), 2600)
        return () => clearInterval(id)
      }, [])
      return (
        <div className="flex items-center gap-3 font-body text-sm text-ink-soft">
          <span className="text-xl">⭐</span> <ScratchNumber value={n} size={30} seed="wild-stars" /> stargazers
        </div>
      )
    },
  },
}

const marginNote: ComponentEntry = {
  slug: 'margin-note',
  title: 'Margin Note',
  icon: '✎',
  category: 'Ink & Text',
  tagline: 'marginalia with a leader line',
  description: 'The paragraph keeps a real margin column; the note sits in it at a jotted angle, tied by a drawn leader to the exact phrase it doubts. It re-routes on reflow and folds under the text on narrow screens.',
  Demo: () => (
    <MarginNote note="citation needed!" seed="mn-demo">
      <p className="m-0 max-w-md font-body leading-7 text-ink-soft">
        The library was built in a single legendary
        weekend, <MarginNote.Anchor>fueled entirely by chai</MarginNote.Anchor>, and
        nothing about that sentence deserves scrutiny.
      </p>
    </MarginNote>
  ),
  usage: `import { MarginNote } from '@/scribbleui/components/margin-note'

<MarginNote note="citation needed!">
  <p>
    …fueled entirely by <MarginNote.Anchor>chai</MarginNote.Anchor>, and…
  </p>
</MarginNote>`,
  props: [
    ['note', 'string', 'the margin text (hand font)'],
    ['MarginNote.Anchor', 'wrapper', 'marks the exact phrase the leader points at'],
    ['side', `'right' | 'left'`, 'which margin'],
    ['marginWidth', 'number', 'reserved margin column in px'],
  ],
}

export const inkText: ComponentEntry[] = [handwritten, annotate, arrows, scratchNumber, marginNote]
