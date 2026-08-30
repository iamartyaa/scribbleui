/**
 * Build .hand fonts from public-domain Hershey vector fonts (via hersheytext).
 * .hand v1: centerline strokes per glyph, baseline at y=0, capHeight = 100 units.
 */
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const data = require('hersheytext/hersheytext.json')
const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, '..', 'src', 'fonts')
mkdirSync(outDir, { recursive: true })

/** Parse Hershey SVG-ish path data: M/L with implicit repeats. */
function parseStrokes(d) {
  const strokes = []
  let cur = null
  const tokens = d.match(/[ML]|-?\d+(\.\d+)?,-?\d+(\.\d+)?/g) || []
  let mode = 'M'
  for (const tok of tokens) {
    if (tok === 'M' || tok === 'L') { mode = tok; continue }
    const [x, y] = tok.split(',').map(Number)
    if (mode === 'M') { cur = [[x, y]]; strokes.push(cur); mode = 'L' }
    else if (cur) cur.push([x, y])
  }
  return strokes.filter(s => s.length >= 1)
}

function buildFont(key, outName, label) {
  const src = data[key]
  const glyphs = {}
  // hersheytext chars are indexed from ASCII 33
  const entries = src.chars.map((c, i) => [String.fromCharCode(33 + i), c])

  // establish baseline & cap height from capital letters
  let baseline = 0, capTop = Infinity
  for (const [ch, c] of entries) {
    if (ch >= 'A' && ch <= 'Z' && c && c.d) {
      for (const s of parseStrokes(c.d)) for (const [, y] of s) {
        baseline = Math.max(baseline, y)
        capTop = Math.min(capTop, y)
      }
    }
  }
  const capH = baseline - capTop
  const k = 100 / capH // normalize: capHeight = 100, baseline y=0, up = negative

  let spaceAdv = 0
  const out = {}
  for (const [ch, c] of entries) {
    if (!c || typeof c.d !== 'string') continue
    const strokes = parseStrokes(c.d).map(s =>
      s.map(([x, y]) => [round((x) * k), round((y - baseline) * k)])
    )
    // advance: use 'o' (Hershey right offset) * 2 heuristic? hersheytext 'o' is left offset;
    // compute advance from geometry with padding instead.
    let minX = Infinity, maxX = -Infinity
    for (const s of strokes) for (const [x] of s) { minX = Math.min(minX, x); maxX = Math.max(maxX, x) }
    if (!isFinite(minX)) { minX = 0; maxX = 40 }
    // shift so glyph starts near x=0 with small left bearing
    const shift = -minX + 6
    const shifted = strokes.map(s => s.map(([x, y]) => [round(x + shift), y]))
    const adv = round(maxX - minX + 14)
    out[ch] = { adv, strokes: shifted }
    if (ch === 'n') spaceAdv = adv
  }
  const font = {
    format: 'hand', version: 1, name: label, source: `Hershey ${key} (public domain)`,
    unitsPerCap: 100, baseline: 0, xHeight: xHeightOf(out), lineHeight: 210,
    spaceAdv: round((spaceAdv || 60) * 0.9),
    glyphs: out,
  }
  writeFileSync(join(outDir, `${outName}.hand.json`), JSON.stringify(font))
  console.log(`built ${outName}: ${Object.keys(out).length} glyphs, capH src ${capH}`)
}

function xHeightOf(glyphs) {
  const g = glyphs['x']
  if (!g) return 66
  let top = 0
  for (const s of g.strokes) for (const [, y] of s) top = Math.min(top, y)
  return Math.abs(round(top))
}
const round = n => Math.round(n * 10) / 10

buildFont('futural', 'print', 'Scribble Print')
buildFont('scripts', 'script', 'Scribble Script')
buildFont('futuram', 'bold', 'Scribble Bold')
