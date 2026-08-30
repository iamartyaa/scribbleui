'use client'
import { bowedLine, ink, type InkTimeline } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export interface CrumbItem { label: string; href?: string }

export interface ScribbleBreadcrumbProps {
  items: CrumbItem[]
  seed?: string
  className?: string
}

/**
 * Your path is a treasure-map route: dashed segments between stops, and the
 * page you're standing on gets the heaviest ink.
 */
export function ScribbleBreadcrumb({ items, seed: seedProp, className }: ScribbleBreadcrumbProps) {
  const seed = useSeed(seedProp)
  const dashTl: InkTimeline = React.useMemo(() => {
    // one wavy dash-run used between every pair of stops
    const run = bowedLine(0, 6, 34, 4, 0.12, seed)
    const dashes = []
    for (let i = 0; i < run.length - 1; i += 3) dashes.push([run[i], run[i + 1]])
    return ink(dashes, { seed, roughness: 0.8, speed: 2.4, width: 1.6, flightBase: 20 })
  }, [seed])

  return (
    <nav aria-label="breadcrumb" className={cn('inline-block', className)}>
      <ol className="flex flex-wrap items-center gap-1.5 p-0" style={{ listStyle: 'none', margin: 0 }}>
        {items.map((it, i) => {
          const last = i === items.length - 1
          return (
            <li key={i} className="flex items-center gap-1.5">
              <span className="flex items-center gap-1">
                <span
                  className="inline-block size-2 rounded-full"
                  style={{ background: last ? 'var(--sui-accent)' : 'var(--sui-pencil)', transform: `scale(${last ? 1.25 : 1})` }}
                />
                {it.href && !last ? (
                  <a href={it.href} className="font-hand text-lg text-ink-soft no-underline hover:text-ink">{it.label}</a>
                ) : (
                  <span aria-current={last ? 'page' : undefined} className={cn('font-hand text-lg', last ? 'font-bold text-accent' : 'text-ink-soft')}>{it.label}</span>
                )}
              </span>
              {!last && <Ink timeline={dashTl} color="var(--sui-pencil)" className="mx-0.5 shrink-0" rate={2.5} />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
