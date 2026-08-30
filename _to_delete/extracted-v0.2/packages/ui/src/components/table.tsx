'use client'
import { bowedLine, ink, line, rect, type InkTimeline, type Stroke } from '@scribbleui/engine'
import * as React from 'react'
import { Ink, useSeed } from '@/lib/ink'
import { cn } from '@/lib/utils'

export interface ScribbleTableProps<Row extends Record<string, React.ReactNode>> {
  columns: { key: string; header: string; width?: string }[]
  rows: Row[]
  /** draw the outer border too */
  bordered?: boolean
  seed?: string
  className?: string
  onRowClick?: (row: Row, i: number) => void
}

/**
 * A properly ruled ledger: the header rule is ink, row and column rules are
 * pencil, all measured from the real rendered table so they always land on
 * the grid — and the hovered row gets a highlighter swipe.
 */
export function ScribbleTable<Row extends Record<string, React.ReactNode>>({
  columns, rows, bordered = true, seed: seedProp, className, onRowClick,
}: ScribbleTableProps<Row>) {
  const seed = useSeed(seedProp)
  const [hover, setHover] = React.useState(-1)
  const hostRef = React.useRef<HTMLDivElement>(null)
  const tableRef = React.useRef<HTMLTableElement>(null)
  const [geo, setGeo] = React.useState<{ w: number; h: number; rowYs: number[]; colXs: number[]; headY: number } | null>(null)

  const measure = React.useCallback(() => {
    const table = tableRef.current
    if (!table) return
    const tb = table.getBoundingClientRect()
    const headRow = table.querySelector('thead tr') as HTMLTableRowElement | null
    const bodyRows = Array.from(table.querySelectorAll('tbody tr')) as HTMLTableRowElement[]
    const cells = Array.from(headRow?.cells ?? [])
    const colXs = cells.slice(1).map(c => c.getBoundingClientRect().left - tb.left)
    const rowYs = bodyRows.slice(0, -1).map(r => r.getBoundingClientRect().bottom - tb.top)
    const headY = headRow ? headRow.getBoundingClientRect().bottom - tb.top : 24
    setGeo(g => {
      const next = { w: tb.width, h: tb.height, rowYs, colXs, headY }
      return JSON.stringify(g) === JSON.stringify(next) ? g : next
    })
  }, [])

  React.useLayoutEffect(() => {
    measure()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    if (tableRef.current && ro) ro.observe(tableRef.current)
    return () => ro?.disconnect()
  }, [measure, rows.length, columns.length])

  const gridTl: InkTimeline | null = React.useMemo(() => {
    if (!geo) return null
    const pencil: Stroke[] = []
    for (const y of geo.rowYs) pencil.push(bowedLine(2, y, geo.w - 2, y, 0.008, seed + y))
    for (const x of geo.colXs) pencil.push(line(x, 6, x, geo.h - 4))
    if (bordered) pencil.push(...rect(geo.w - 2, geo.h - 2, seed + 'b').map(s => s.map(p => ({ x: p.x + 1, y: p.y + 1 }))))
    return ink(pencil, { seed: seed + ':g', roughness: 0.55, speed: 6, width: 1, flightBase: 8 })
  }, [geo, seed, bordered])
  const headTl: InkTimeline | null = React.useMemo(
    () => geo ? ink([bowedLine(1, geo.headY, geo.w - 1, geo.headY, 0.01, seed)], { seed: seed + ':h', roughness: 0.8, speed: 4, width: 2 }) : null,
    [geo, seed],
  )

  return (
    <div ref={hostRef} className={cn('relative w-full overflow-x-auto', className)}>
      <div className="relative inline-block min-w-full align-top">
        <table ref={tableRef} className="w-full border-collapse font-body text-sm">
          <thead>
            <tr>
              {columns.map(c => (
                <th key={c.key} className="px-3.5 pb-2 pt-1.5 text-left font-label text-[11px] uppercase tracking-wide text-pencil" style={{ width: c.width }}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(h => h === i ? -1 : h)}
                onClick={() => onRowClick?.(r, i)}
                className={cn(onRowClick && 'cursor-pointer')}
              >
                {columns.map((c, ci) => (
                  <td key={c.key} className="relative px-3.5 py-2 text-ink-soft first:font-bold first:text-ink">
                    {ci === 0 && hover === i && geo && (
                      <span aria-hidden className="pointer-events-none absolute inset-y-0.5 left-0" style={{ width: geo.w, background: 'var(--sui-hl)', opacity: 0.26 }} />
                    )}
                    <span className="relative">{r[c.key]}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {gridTl && (
          <span className="pointer-events-none absolute left-0 top-0">
            <Ink overlay timeline={gridTl} color="var(--sui-pencil)" rate={3.5} style={{ opacity: 0.6 }} />
          </span>
        )}
        {headTl && (
          <span className="pointer-events-none absolute left-0 top-0">
            <Ink overlay timeline={headTl} color="var(--sui-ink)" rate={2.5} />
          </span>
        )}
      </div>
    </div>
  )
}
