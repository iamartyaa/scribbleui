# Contributing to Scribble UI

## The bar

Every component must pass four questions in review:

1. **Does every stroke mean something?** If a stroke could be deleted without
   losing information, delete it.
2. **Does it move like a hand?** All timing must come from the engine's
   velocity model — no linear dash tricks, no CSS keyframe cheats for ink.
3. **Is it seeded?** Same seed, same pixels. New interactions may re-seed.
4. **Is it accessible?** Real semantics under the ink; ink layers are
   aria-hidden; `prefers-reduced-motion` gets final drawn states instantly.

## Working on it

```bash
npm install
npm test        # engine + text tests must stay green
npm run dev     # docs playground
```

Component sources live in `packages/ui/src/components`, one file each, and
are distributed as source through the registry (`npm run registry` rebuilds
`apps/docs/public/r`). Add a demo to `apps/docs/src/App.tsx` with every new
component — the demo is part of the component.

## New hands (.hand fonts)

`.hand` is an open format: centerline strokes per glyph, baseline y=0,
capHeight=100, stroke order = drawing order. Only public-domain or original
letterforms are accepted. See `packages/text/scripts/build-hand-fonts.mjs`
for the Hershey conversion as a reference.
