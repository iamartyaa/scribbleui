/**
 * Build a shadcn-compatible registry from packages/ui/src.
 * Output: apps/docs/public/r/registry.json + one item JSON per component.
 * Consumers: `npx shadcn@latest add https://scribbleui.com/r/<name>.json`
 * or `npx scribbleui add <name>`.
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const SRC = join(ROOT, 'packages/ui/src')
const OUT = join(ROOT, 'apps/docs/public/r')
const HOME = process.env.REGISTRY_HOME ?? 'https://scribbleui.com'
mkdirSync(OUT, { recursive: true })

const read = p => readFileSync(join(SRC, p), 'utf8')

const NEEDS_TEXT = new Set(['handwritten', 'scratch-number'])
const NEEDS_MOTION = new Set(['popover', 'modal', 'drawer', 'context-menu', 'toast', 'accordion', 'sidebar'])

const DESCRIPTIONS = {
  'arrow-art': 'Standalone hand-drawn arrows: straight, curve, loop, zigzag, double — angle, arc and head as knobs.',
  'stickman': 'A pencil-drawn stickman with five poses; wave, run and draw keep moving like a flipbook.',
  'handwritten': 'Text that writes itself with real pen physics; the DOM text stays selectable.',
  'annotate': 'Underline, circle, strike, highlight, box, bracket — marks measured from live DOM rects.',
  'scribble-arrow': 'A hand-drawn arrow connecting two DOM nodes that re-routes when they move.',
  'scratch-number': 'Numbers corrected the human way: scratch out the old, write the new.',
  'margin-note': 'Marginalia pinned to its anchor by a drawn leader line.',
  'button': 'Four strokes with overshot corners; pressing squishes the ink, releasing re-draws.',
  'input': 'A ruled writing line instead of a box; errors get the teacher\'s red scribble.',
  'textarea': 'A page that rules itself as you fill it.',
  'checkbox': 'The tick is a flick that escapes the box; unchecking takes the eraser to it.',
  'radio': 'The pen circles the chosen option, exam-paper style.',
  'switch': 'A wet-ink knob that smears along the track; ON earns an underline.',
  'slider': 'A pencil ruler you ink over — the drawn width follows your decision.',
  'select': 'Options on a dropped paper scrap; the pick gets circled.',
  'tabs': 'The active underline erases, flies, and re-draws — it never slides.',
  'sidebar': 'A jotted list with a margin arrow saying you-are-here.',
  'breadcrumb': 'Your path as a dashed treasure-map route.',
  'dock': 'Sticker icons on a drawn shelf; hover circles one and peels it up.',
  'tooltip': 'A whispered jot with a drawn leader line; erases tail-first on leave.',
  'popover': 'A sticky note slapped on with tape at a seeded angle.',
  'modal': 'A fresh sheet over your work; the page behind turns to pencil.',
  'drawer': 'A folded flap of the page, unfolding along a dashed crease.',
  'context-menu': 'Options jotted at the cursor; a drawn arrow points at your intent.',
  'toast': 'Notes slid across the desk, stacking messily on purpose.',
  'badge': 'Urgency measured in scribble loops around the count.',
  'loader': 'The bored pen doodles while you wait; resolution becomes a ✓ or ✗.',
  'progress': 'Ink advancing toward a waiting checkbox; at 100% the tick flicks.',
  'skeleton': 'Loading as pencil roughs; content is inked over and the pencil erases.',
  'card': 'A scrap pinned to the board with a drawn, hatched shadow.',
  'accordion': 'A hand-drawn bracket spans exactly the revealed content.',
  'table': 'A ledger: ink header rule, pencil row rules, highlighter row hover.',
  'separator': 'A scribe\'s flourish between thoughts.',
  'avatar': 'A double-drawn locket frame; fallback initials are handwritten.',
  'kbd': 'A sketched keycap that really depresses when its shortcut fires.',
  'marquee': 'Content on a paper tape pulled by hand — speed wobbles, hover drags.',
  'theme-toggle': 'The sun is scribbled out and the moon drawn fresh.',
  'empty-state': 'A doodle, a handwritten note, and an arrow at the one fixing action.',
  'blockquote': 'A quote copied into a commonplace book.',
}

const libFiles = ['lib/ink.tsx', 'lib/ink-extra.ts', 'lib/utils.ts'].map(p => ({
  path: `scribbleui/${p}`,
  type: 'registry:lib',
  content: read(p),
}))

const inkItem = {
  $schema: 'https://ui.shadcn.com/schema/registry-item.json',
  name: 'ink',
  type: 'registry:lib',
  title: 'Ink primitives',
  description: 'The Scribble UI React primitives: InkProvider, the <Ink> renderer, and seed/motion hooks.',
  dependencies: ['@scribbleui/engine'],
  files: libFiles,
}
writeFileSync(join(OUT, 'ink.json'), JSON.stringify(inkItem, null, 2))

const items = [{ name: 'ink', type: 'registry:lib', title: inkItem.title, description: inkItem.description }]
const comps = readdirSync(join(SRC, 'components')).filter(f => f.endsWith('.tsx'))
for (const file of comps) {
  const name = file.replace(/\.tsx$/, '')
  const deps = ['@scribbleui/engine']
  if (NEEDS_TEXT.has(name)) deps.push('@scribbleui/text')
  if (NEEDS_MOTION.has(name)) deps.push('motion')
  const item = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name,
    type: 'registry:ui',
    title: name.replace(/-/g, ' '),
    description: DESCRIPTIONS[name] ?? '',
    dependencies: deps,
    registryDependencies: [`${HOME}/r/ink.json`],
    files: [{
      path: `scribbleui/components/${file}`,
      type: 'registry:ui',
      // rewrite the docs-repo alias to a relative import so the copied
      // source works in any project without alias configuration
      content: read(`components/${file}`).replaceAll("'@/lib/", "'../lib/"),
    }],
  }
  writeFileSync(join(OUT, `${name}.json`), JSON.stringify(item, null, 2))
  items.push({ name, type: 'registry:ui', title: item.title, description: item.description })
}

writeFileSync(join(OUT, 'registry.json'), JSON.stringify({
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'scribbleui',
  homepage: HOME,
  items,
}, null, 2))

console.log(`registry: ${items.length} items -> apps/docs/public/r/`)
