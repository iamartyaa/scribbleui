# ✏️ Scribble UI

**Hand-drawn React components where every stroke carries meaning.**

Not a font. Not a wobble filter. A pen that understands what it's drawing:
the circle around a radio option *is* the selection, the scratch-out *is* the
number change, the eraser *is* the uncheck.

> **38 components · zero-dep ink engine · seeded (SSR-safe) imperfection ·
> copy-paste like shadcn · a11y + reduced-motion first · MIT**

## Why it doesn't look like the other sketchy libraries

Every existing hand-drawn library wobbles the *shape* and stops. Scribble UI
simulates the *hand*:

1. **Strokes mean something.** If a stroke could be deleted without losing
   information, it gets deleted in review.
2. **Pen physics, not path tricks.** Velocity follows a two-thirds-power-law
   flavor — the nib slows through curves and flies on straights, lifts and
   travels between strokes, and ink width falls out of speed. Constant-speed
   `stroke-dashoffset` is banned.
3. **Seeded imperfection.** No two buttons on a page are identical, but the
   same seed always draws the same ink — SSR, hydration, and screenshot tests
   agree. `seed` is a first-class prop everywhere.
4. **One signature move per component.** The checkbox flicks. The tabs
   underline pen-lifts and flies. The skeleton is a pencil draft that gets
   inked over. 150–400ms, then quiet.

And the credibility rules: real text stays in the DOM (selectable, indexable,
screen-readable — ink is `aria-hidden` decoration), and `prefers-reduced-motion`
renders final drawn states instantly.

## Install

```bash
# scribbleui CLI
npx scribbleui add button toast checkbox

# or the shadcn CLI, straight from the registry
npx shadcn@latest add https://scribbleui.com/r/button.json
```

Component source lands in your repo (you own it); the only runtime dependency
is the ~4 kB zero-dep engine. Then add the ink tokens:

```bash
npx scribbleui init   # writes scribbleui-tokens.css
```

```tsx
import { ScribbleButton } from '@/scribbleui/components/button'

<ScribbleButton variant="primary" withArrow>get started</ScribbleButton>
```

## What's in the box

| | |
|---|---|
| **Ink & Text** | Handwritten (headings, paragraphs, weights — scroll-scrubbable, streamable), Annotate (marks on live DOM), Arrows (5 kinds + live connector), ScratchNumber, MarginNote |
| **Forms** | Button, Input, Textarea, Checkbox, Radio, Switch, Slider, Select |
| **Navigation** | Tabs, Sidebar, Breadcrumb, Dock |
| **Overlays** | Tooltip, Popover, Modal, Drawer, ContextMenu |
| **Feedback** | Toast, Badge, Loader, Progress, Skeleton |
| **Surfaces** | Card, Accordion, Table, Separator, Avatar, Kbd, Marquee |
| **Delight** | ThemeToggle (scribble out the sun, draw the moon and stars), EmptyState, Stickman (the resident) |

## The engine

`@scribbleui/engine` is headless and dependency-free: seeded PRNG + smooth
noise, `roughen()` (the hand), a velocity/timing model (the rhythm), variable
width (the ink), and players for SVG dash reveal and canvas. It turns clean
geometry into a deterministic, timed `InkTimeline`; renderers just play it.

`@scribbleui/text` adds `.hand` — an open centerline stroke-font format where
stroke order and direction are the data. Built-in hands are derived from the
public-domain Hershey collection; capture-your-own-handwriting is on the
roadmap.

## Monorepo

```
packages/engine   the ink engine (npm: @scribbleui/engine)
packages/text     .hand fonts + layout + streaming writer (npm: @scribbleui/text)
packages/ui       component source (distributed via registry, not npm)
packages/cli      npx scribbleui (npm: scribbleui)
apps/docs         docs + live demos + the registry (/r/*.json) + llms.txt
```

```bash
npm install
npm test          # engine determinism + text layout tests
npm run dev       # docs at localhost:5173
npm run registry  # rebuild /r from packages/ui
npm run build     # everything
```

## License

MIT. Built-in fonts derived from the Hershey fonts (public domain, courtesy
of the U.S. National Bureau of Standards, via the hersheytext data).

---

penned by [Amartya](https://iamartyaa.github.io) · [x.com/evilseyee](https://x.com/evilseyee)
