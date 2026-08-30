import * as React from 'react'
import {
  Handwritten, InkProvider, ScribbleBreadcrumb, ScribbleSeparator, ScribbleTabs,
} from '@/components'
import { bySlug, type ComponentEntry } from '../data'
import { CodeBlock } from './CodeBlock'
import { Knobs, defaults, type KnobValues } from './Knobs'
import { copy } from './copy'
import { ScribbleButton, ScribbleTable } from '@/components'

function aiMarkdown(e: ComponentEntry): string {
  const props = (e.props ?? []).map(([n, t, d]) => `| ${n} | \`${t}\` | ${d} |`).join('\n')
  return `# Scribble UI — ${e.title}

${e.description}

Install: \`npx scribbleui add ${e.slug}\` (or \`npx shadcn@latest add https://scribbleui.com/r/${e.slug}.json\`)
Registry JSON (full source): https://scribbleui.com/r/${e.slug}.json
Stack: React + TS + Tailwind; runtime dep @scribbleui/engine (zero-dep ink engine).
Behavior contract: seeded deterministic ink (SSR-safe), real semantics under aria-hidden ink, prefers-reduced-motion renders final drawn state.

## Usage
\`\`\`tsx
${e.usage}
\`\`\`

## Props
| prop | type | notes |
| --- | --- | --- |
${props}
`
}

/** A drawn frame that previews live on paper. */
function Preview({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative border-[1.5px] border-ink bg-card p-6 shadow-[3px_4px_0_var(--sui-shadow)]">
      {children}
    </div>
  )
}

export function ComponentPage({ slug }: { slug: string }) {
  const entry = bySlug(slug)
  const [penGen, setPenGen] = React.useState(0)
  const [knobs, setKnobs] = React.useState<KnobValues>({})
  React.useEffect(() => {
    if (entry?.knobs) setKnobs(defaults(entry.knobs))
    setPenGen(0)
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!entry) {
    return <div className="p-10 font-hand text-2xl text-pencil">that page was erased… or never drawn?</div>
  }
  const e = entry

  return (
    <InkProvider seed={`docs:${slug}:${penGen}`} key={`${slug}:${penGen}`}>
      <div className="mx-auto max-w-3xl px-6 pb-28 pt-8 lg:px-10">
        <ScribbleBreadcrumb items={[{ label: 'scribble ui', href: '#/' }, { label: e.category.toLowerCase() }, { label: e.slug }]} />

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Handwritten as="h2" seed={`title:${slug}`} color="var(--sui-ink)">{e.title}</Handwritten>
            <p className="mt-1 font-hand text-2xl text-brand">{e.tagline}</p>
          </div>
          <div className="flex gap-2">
            <ScribbleButton shape="ghost" className="!px-2 !py-1 text-xs" onClick={() => copy(aiMarkdown(e), 'markdown for your AI copied')}>🤖 copy for AI</ScribbleButton>
            <ScribbleButton shape="ghost" className="!px-2 !py-1 text-xs" onClick={() => setPenGen(g => g + 1)}>🎲 reseed page</ScribbleButton>
          </div>
        </div>

        <p className="mt-3 max-w-2xl font-body leading-7 text-ink-soft">{e.description}</p>

        <div className="mt-8">
          <Preview><e.Demo /></Preview>
        </div>

        <div className="mt-6">
          <ScribbleTabs
            items={[
              { value: 'usage', label: 'usage', content: <CodeBlock code={e.usage} /> },
              {
                value: 'install', label: 'install', content: (
                  <div className="flex flex-col gap-3">
                    <CodeBlock label="scribbleui cli" code={`npx scribbleui add ${e.slug}`} />
                    <CodeBlock label="shadcn cli" code={`npx shadcn@latest add https://scribbleui.com/r/${e.slug}.json`} />
                    <p className="m-0 font-body text-sm text-ink-soft">Source lands in your repo — you own it. Runtime dep: <code className="font-label text-xs">@scribbleui/engine</code>.</p>
                  </div>
                ),
              },
              {
                value: 'registry', label: 'registry', content: (
                  <p className="font-body text-sm text-ink-soft">
                    Full component source as registry JSON: <a className="text-accent" href={`/r/${e.slug}.json`} target="_blank" rel="noreferrer">/r/{e.slug}.json</a> — point any shadcn-compatible tool (or your AI agent) at it.
                  </p>
                ),
              },
            ]}
          />
        </div>

        {e.knobs && e.KnobDemo && (
          <>
            <ScribbleSeparator variant="wave" label="make it yours" />
            <div className="grid items-start gap-6 md:grid-cols-[1fr_240px]">
              <Preview><e.KnobDemo k={knobs} /></Preview>
              <Knobs defs={e.knobs} values={knobs} onChange={setKnobs} onShake={() => setPenGen(g => g + 1)} />
            </div>
          </>
        )}

        {e.variants?.length ? (
          <>
            <ScribbleSeparator variant="squiggle" />
            <div className="flex flex-col gap-8">
              {e.variants.map(v => (
                <div key={v.title}>
                  <div className="mb-2 flex items-baseline gap-3">
                    <h3 className="m-0 font-display text-lg font-bold">{v.title}</h3>
                    {v.note && <span className="font-hand text-lg text-pencil">{v.note}</span>}
                  </div>
                  <Preview><v.Demo /></Preview>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {e.wild && (
          <>
            <ScribbleSeparator variant="dots" />
            <div className="mb-2 flex items-baseline gap-3">
              <h3 className="m-0 font-display text-lg font-bold">in the wild</h3>
              <span className="font-hand text-lg text-pencil">{e.wild.title}</span>
            </div>
            <Preview><e.wild.Demo /></Preview>
          </>
        )}

        {e.props?.length ? (
          <>
            <ScribbleSeparator variant="squiggle" />
            <h3 className="mb-3 mt-0 font-display text-lg font-bold">props</h3>
            <ScribbleTable
              bordered={false}
              columns={[
                { key: 'prop', header: 'prop', width: '26%' },
                { key: 'type', header: 'type', width: '34%' },
                { key: 'notes', header: 'notes' },
              ]}
              rows={e.props.map(([p, t, n]) => ({
                prop: <code className="font-label text-xs">{p}</code>,
                type: <code className="font-label text-[11px] text-accent">{t}</code>,
                notes: n,
              }))}
            />
          </>
        ) : null}
      </div>
    </InkProvider>
  )
}
