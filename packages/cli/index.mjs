#!/usr/bin/env node
/**
 * scribbleui — copy hand-drawn components into your project.
 *
 *   npx scribbleui add button toast
 *   npx scribbleui add button --dir src/components/scribbleui
 *   npx scribbleui list
 *   npx scribbleui init
 *
 * Components are source you own (shadcn model). The only runtime dependency
 * is @scribbleui/engine (plus @scribbleui/text or motion where noted).
 * Also works with the shadcn CLI directly:
 *   npx shadcn@latest add https://scribbleui.com/r/button.json
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

const REGISTRY = process.env.SCRIBBLEUI_REGISTRY ?? 'https://scribbleui.com/r'
const args = process.argv.slice(2)
const cmd = args[0]

const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : fallback
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)
  return res.json()
}

async function add(names) {
  const dir = flag('dir', 'src')
  const seen = new Set()
  const queue = [...names]
  const deps = new Set()
  while (queue.length) {
    const name = queue.shift()
    if (seen.has(name)) continue
    seen.add(name)
    const item = await fetchJson(`${REGISTRY}/${name}.json`)
    for (const f of item.files ?? []) {
      const dest = join(process.cwd(), dir, f.path)
      mkdirSync(dirname(dest), { recursive: true })
      if (existsSync(dest) && !args.includes('--overwrite')) {
        console.log(`  skip (exists)  ${dest}  — pass --overwrite to replace`)
        continue
      }
      writeFileSync(dest, f.content)
      console.log(`  wrote  ${dest}`)
    }
    for (const d of item.dependencies ?? []) deps.add(d)
    for (const rd of item.registryDependencies ?? []) {
      const depName = rd.split('/').pop().replace(/\.json$/, '')
      queue.push(depName)
    }
  }
  if (deps.size) {
    console.log(`\nnow install the runtime deps:\n  npm install ${[...deps].join(' ')}`)
  }
  console.log(`\nink is in. imports look like:  import { ScribbleButton } from '@/scribbleui/components/button'`)
}

async function list() {
  const reg = await fetchJson(`${REGISTRY}/registry.json`)
  for (const it of reg.items) console.log(`  ${it.name.padEnd(16)} ${it.description ?? ''}`)
}

function init() {
  const css = `/* Scribble UI ink tokens — add to your global stylesheet */
:root {
  --sui-paper: #FBF8F1; --sui-paper-2: #F4EFE3; --sui-card: #FFFEFA;
  --sui-ink: #221E18; --sui-ink-soft: #4C463C; --sui-pencil: #948C7D;
  --sui-rule: #E3DCCB; --sui-accent: #2B55C8; --sui-accent-soft: #DFE7FA;
  --sui-danger: #CE4A33; --sui-hl: #FFDE59; --sui-shadow: rgba(60,50,30,.12);
  --sui-hand-font: "Caveat", cursive;
}
[data-theme="dark"] {
  --sui-paper: #16130D; --sui-paper-2: #1D1912; --sui-card: #1E1A13;
  --sui-ink: #EDE7D8; --sui-ink-soft: #BFB7A4; --sui-pencil: #847C6C;
  --sui-rule: #2E2920; --sui-accent: #8AA6F2; --sui-accent-soft: #22304F;
  --sui-danger: #E5745D; --sui-hl: #B89F2A; --sui-shadow: rgba(0,0,0,.45);
}`
  const dest = join(process.cwd(), 'scribbleui-tokens.css')
  writeFileSync(dest, css)
  console.log(`wrote ${dest}\nimport it in your global CSS, then:  npx scribbleui add button`)
}

if (cmd === 'add' && args[1]) add(args.slice(1).filter(a => !a.startsWith('--') && a !== flag('dir')))
else if (cmd === 'list') list()
else if (cmd === 'init') init()
else console.log(`scribbleui — hand-drawn components, copy-paste style

  npx scribbleui init            write the ink token stylesheet
  npx scribbleui add <name...>   copy component source into ./src (--dir to change, --overwrite to replace)
  npx scribbleui list            list everything in the registry
`)
