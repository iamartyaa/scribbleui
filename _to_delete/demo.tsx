import * as React from 'react'
import { cn } from '@/lib/utils'

export function Demo({ title, note, children, className, wide }: {
  title: string
  note?: string
  children: React.ReactNode
  className?: string
  wide?: boolean
}) {
  return (
    <section
      id={title.toLowerCase().replace(/\s+/g, '-')}
      className={cn(
        'relative rounded-lg border-[1.5px] border-ink bg-card p-6 shadow-[3px_4px_0_var(--sui-shadow)]',
        wide && 'md:col-span-2',
        className,
      )}
    >
      <header className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg font-bold">{title}</h3>
        {note && <span className="font-hand text-lg text-accent">{note}</span>}
      </header>
      <div className="relative">{children}</div>
    </section>
  )
}
