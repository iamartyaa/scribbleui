import * as React from 'react'
import { ScribbleButton } from '@/components'
import { copy } from './copy'

/** A code scrap with a drawn frame and a copy button. */
export function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="relative border-[1.5px] border-ink bg-[color-mix(in_srgb,var(--sui-ink)_4%,var(--sui-card))]">
      <div className="flex items-center justify-between border-b border-rule px-3 py-1">
        <span className="font-label text-[10px] uppercase tracking-widest text-pencil">{label ?? 'tsx'}</span>
        <ScribbleButton shape="ghost" className="!px-2 !py-0.5 text-xs" onClick={() => copy(code, 'code copied')}>copy</ScribbleButton>
      </div>
      <pre className="m-0 overflow-x-auto p-4 font-label text-[12.5px] leading-6 text-ink"><code>{code}</code></pre>
    </div>
  )
}
