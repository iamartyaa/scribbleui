import * as React from 'react'
import {
  Handwritten, ScribbleDrawer, ScribbleSidebar, ScribbleThemeToggle, ScribbleTooltip,
} from '@/components'
import { CATEGORIES } from '../data'
import { GitHubButton } from './GitHubButton'
import { PenLicense } from './PenLicense'

function Nav({ slug, nav }: { slug?: string; nav: (h: string) => void }) {
  return (
    <ScribbleSidebar
      marker="both"
      value={slug ?? '__home'}
      onValueChange={v => nav(v === '__home' ? '#/' : `#/c/${v}`)}
      groups={[
        { items: [{ value: '__home', label: 'the sketchbook', icon: '🏠' }] },
        ...CATEGORIES.map(c => ({
          title: c.title,
          collapsible: true,
          items: c.entries.map(e => ({ value: e.slug, label: e.title, icon: <span className="text-xs">{e.icon}</span> })),
        })),
      ]}
      className="w-full"
    />
  )
}

export function Shell({ slug, nav, children }: { slug?: string; nav: (h: string) => void; children: React.ReactNode }) {
  const [menu, setMenu] = React.useState(false)
  React.useEffect(() => { setMenu(false) }, [slug])

  return (
    <div className="min-h-screen">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b-[1.5px] border-ink" style={{ background: 'color-mix(in srgb, var(--sui-paper) 90%, transparent)', backdropFilter: 'blur(7px)' }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 lg:px-6">
          <div className="flex items-center gap-3">
            <button aria-label="menu" onClick={() => setMenu(true)} className="cursor-pointer bg-transparent p-1 font-hand text-2xl lg:hidden" style={{ border: 'none', color: 'var(--sui-ink)' }}>≡</button>
            <a href="#/" className="flex items-baseline gap-1.5 no-underline">
              <span className="font-display text-lg font-extrabold text-ink">Scribble</span>
              <span className="font-display text-lg font-extrabold text-brand">UI</span>
              <span className="ml-1 hidden font-hand text-base text-pencil sm:inline">v0.2 — fresh ink</span>
            </a>
          </div>
          <nav className="flex items-center gap-2">
            <a href="https://iamartyaa.github.io" target="_blank" rel="noreferrer" className="hidden font-hand text-lg text-ink-soft no-underline hover:text-ink sm:inline">by amartya ✎</a>
            <GitHubButton />
            <ScribbleTooltip content="scribble out the sun">
              <span><ScribbleThemeToggle /></span>
            </ScribbleTooltip>
          </nav>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* desktop sidebar */}
        <aside className="sticky top-[49px] hidden h-[calc(100vh-49px)] w-64 shrink-0 overflow-y-auto border-r border-rule px-3 pb-20 pt-5 lg:block">
          <Nav slug={slug} nav={nav} />
          <div className="mt-8 px-2">
            <Handwritten hand="script" size={19} seed="sb-note" color="var(--sui-pencil)" trigger="visible">psst — press p</Handwritten>
            <p className="mt-4 font-label text-[9.5px] leading-4 text-pencil">
              MIT · <a className="text-pencil" href="llms.txt">llms.txt</a><br />Hershey fonts, public domain
            </p>
          </div>
        </aside>

        {/* mobile drawer */}
        <ScribbleDrawer open={menu} onOpenChange={setMenu} side="left" title="the sketchbook">
          <div className="max-h-[80vh] overflow-y-auto"><Nav slug={slug} nav={nav} /></div>
        </ScribbleDrawer>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <PenLicense />
    </div>
  )
}
