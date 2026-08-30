import { ellipse, ink } from '@scribbleui/engine'
import * as React from 'react'
import {
  Annotate, Handwritten, Ink, MarginNote, ScratchNumber, ScribbleArrowArt, ScribbleBadge,
  ScribbleButton, ScribbleCard, ScribbleCheckbox, ScribbleKbd, ScribbleLoader,
  ScribbleMarquee, ScribbleProgress, ScribbleSeparator, ScribbleSlider, ScribbleSwitch,
  Stickman, toast, useSeed,
} from '@/components'
import { GitHubButton } from './GitHubButton'
import { CodeBlock } from './CodeBlock'
import { useDoodleBurst } from './eggs'

function Wordmark() {
  const seed = useSeed('wordmark')
  const circleTl = React.useMemo(
    () => ink([ellipse(0, 0, 52, 34, seed)], { seed, roughness: 1.1, speed: 2.2, width: 3 }),
    [seed],
  )
  const { burst, layer } = useDoodleBurst()
  return (
    <div className="relative cursor-pointer select-none" onClick={e => burst(e.clientX, e.clientY)} title="click me">
      {layer}
      <div className="flex flex-wrap items-baseline gap-4">
        <Handwritten hand="print" weight="bold" size={84} seed="wm-scribble" color="var(--sui-ink)">Scribble</Handwritten>
        <span className="relative inline-block px-3">
          <Handwritten hand="print" weight="bold" size={76} seed="wm-ui" color="var(--sui-brand)">UI</Handwritten>
          <span className="pointer-events-none absolute left-1/2 top-[46%]">
            <Ink overlay timeline={circleTl} color="var(--sui-brand)" rate={0.9} />
          </span>
        </span>
      </div>
    </div>
  )
}

function Doctrine() {
  const rules = [
    { t: 'strokes mean something', d: 'The circle around a radio option IS the selection. The scratch-out IS the number change. Decorative wobble gets deleted in review.', f: 'pin' as const },
    { t: 'pen physics, not path tricks', d: 'Velocity follows a two-thirds-power-law: slow through curves, flying on straights, pen-up flights between strokes, width from speed.', f: 'tape' as const },
    { t: 'seeded imperfection', d: 'No two buttons match, but the same seed always draws the same ink — SSR, hydration and screenshot tests all agree.', f: 'clip' as const },
    { t: 'one signature move each', d: 'The checkbox flicks. The tabs underline pen-lifts and flies. The skeleton is a pencil draft. 150–400ms, then quiet.', f: 'fold' as const },
  ]
  return (
    <div className="grid gap-7 sm:grid-cols-2">
      {rules.map((r, i) => (
        <ScribbleCard key={r.t} fastener={r.f} depth={2} seed={'doc' + i} className="h-full w-full">
          <h3 className="m-0 font-display text-base font-bold">{r.t}</h3>
          <p className="mb-0 mt-1.5 font-body text-sm leading-6 text-ink-soft">{r.d}</p>
        </ScribbleCard>
      ))}
    </div>
  )
}

function Collage() {
  const [p, setP] = React.useState(64)
  return (
    <div className="relative grid gap-6 border-[1.5px] border-ink bg-card p-6 shadow-[4px_5px_0_var(--sui-shadow)] sm:grid-cols-2 lg:grid-cols-3">
      <div className="flex flex-col gap-3">
        <ScribbleCheckbox defaultChecked label="the tick is a flick" />
        <ScribbleSwitch defaultChecked label="ink poured behind" />
        <ScribbleSlider value={p} onValueChange={setP} showValue format={v => v + '%'} className="w-full" label="ink" />
      </div>
      <div className="flex flex-col items-start gap-4">
        <ScribbleProgress value={p} className="w-full" label="toward the flick" />
        <div className="flex items-center gap-5">
          <ScribbleLoader variant="comet" size={34} />
          <ScribbleBadge count={Math.round(p / 8)}><span className="text-2xl">🔔</span></ScribbleBadge>
          <ScribbleKbd listen>K</ScribbleKbd>
        </div>
        <ScribbleButton shape="sticker" variant="primary" onClick={() => toast.success('that one is free')}>try me</ScribbleButton>
      </div>
      <div className="hidden lg:block">
        <p className="m-0 font-body text-sm leading-7">
          Every mark here is <Annotate kind="underline">measured from live DOM</Annotate>, drawn
          with <Annotate kind="circle" color="var(--sui-danger)">real pen physics</Annotate>, and
          seeded so <Annotate kind="highlight">tests never flake</Annotate>.
        </p>
      </div>
    </div>
  )
}

export function Home({ nav }: { nav: (h: string) => void }) {
  return (
    <div className="mx-auto max-w-4xl px-6 pb-28 pt-12 lg:px-10">
      {/* hero */}
      <div className="relative">
        <Wordmark />
        <div className="pointer-events-none absolute -top-4 right-0 hidden md:block" style={{ animation: 'floaty 5s ease-in-out infinite' }}>
          <Stickman pose="point" size={110} flip seed="hero-sm" />
        </div>
        <p className="mt-5 max-w-xl font-body text-lg leading-8 text-ink-soft">
          Hand-drawn React components where <strong className="text-ink">every stroke carries meaning</strong> —
          real pen physics, seeded imperfection, copy-paste like shadcn.
        </p>
        <p className="font-hand text-2xl text-brand">not a font. not a filter. a pen that understands what it's drawing.</p>
        <div className="mt-6 flex flex-wrap items-center gap-5">
          <ScribbleButton variant="primary" shape="sticker" withArrow onClick={() => nav('#/c/handwritten')}>open the sketchbook</ScribbleButton>
          <GitHubButton big />
          <span className="font-label text-xs text-pencil">press <ScribbleKbd listen>P</ScribbleKbd> to borrow the pen</span>
        </div>
      </div>

      <div className="mt-12"><ScribbleMarquee items={['38 components', 'zero-dep engine', 'seeded ink', 'your handwriting, soon', 'a11y first', 'reduced-motion safe', 'MIT']} /></div>

      {/* install */}
      <div className="mt-14 max-w-xl">
        <CodeBlock label="thirty seconds to ink" code={`npx scribbleui add button checkbox toast\n# or, from any shadcn project:\nnpx shadcn@latest add https://scribbleui.com/r/button.json`} />
      </div>

      <ScribbleSeparator variant="wave" label="the doctrine" />
      <Doctrine />

      <ScribbleSeparator variant="squiggle" />
      <MarginNote note="all of this is live — poke it" seed="collage-note">
        <Collage />
      </MarginNote>

      {/* numbers */}
      <div className="mt-16 flex flex-wrap items-end justify-center gap-x-16 gap-y-8">
        {[
          { n: 38, l: 'components' },
          { n: 5, l: 'stickman poses' },
          { n: 0, l: 'runtime deps beyond the engine' },
          { n: 100, l: '% of strokes with a job' },
        ].map(s => (
          <div key={s.l} className="flex flex-col items-center gap-1">
            <ScratchNumber value={s.n} size={44} seed={'stat' + s.l} />
            <span className="max-w-36 text-center font-label text-[10px] uppercase tracking-wider text-pencil">{s.l}</span>
          </div>
        ))}
      </div>

      <ScribbleSeparator variant="dots" />
      <div className="flex flex-col items-center gap-3 text-center">
        <Stickman pose="draw" size={100} seed="footer-sm" />
        <Handwritten hand="script" size={30} seed="cta-line" trigger="visible" color="var(--sui-ink-soft)">now go draw your interface</Handwritten>
        <div className="flex gap-4">
          <ScribbleButton variant="primary" withArrow onClick={() => nav('#/c/button')}>components</ScribbleButton>
          <a href="https://iamartyaa.github.io" target="_blank" rel="noreferrer" className="no-underline"><ScribbleButton shape="underline">meet the pen-holder</ScribbleButton></a>
        </div>
      </div>
    </div>
  )
}
