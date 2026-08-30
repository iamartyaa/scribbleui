import * as React from 'react'
import {
  ScribbleButton, ScribbleCheckbox, ScribbleInput, ScribbleRadioGroup, ScribbleSelect,
  ScribbleSlider, ScribbleSwitch, ScribbleTextarea, toast,
} from '@/components'
import type { ComponentEntry } from './types'

const button: ComponentEntry = {
  slug: 'button',
  title: 'Button',
  icon: '⬭',
  category: 'Forms',
  tagline: 'drawn, not boxed',
  description: 'One confident stroke around the label. Capsule by default, with box, scribble-filled sticker, and underline shapes. Pressing squishes the ink into the paper; releasing re-draws the outline with a fresh seed — hands never repeat a line.',
  Demo: () => (
    <div className="flex flex-wrap items-center gap-5">
      <ScribbleButton onClick={() => toast('drawn ✓')}>capsule</ScribbleButton>
      <ScribbleButton variant="primary" onClick={() => toast('traced twice')}>primary</ScribbleButton>
      <ScribbleButton shape="sticker" variant="primary" onClick={() => toast('stick!')}>sticker</ScribbleButton>
      <ScribbleButton withArrow variant="primary">onwards</ScribbleButton>
      <ScribbleButton disabled>pencilled out</ScribbleButton>
    </div>
  ),
  variants: [
    { title: 'shapes', note: 'capsule · box · sticker · underline · ghost', Demo: () => (
      <div className="flex flex-wrap items-center gap-5">
        <ScribbleButton shape="capsule">capsule</ScribbleButton>
        <ScribbleButton shape="box">box</ScribbleButton>
        <ScribbleButton shape="sticker">sticker</ScribbleButton>
        <ScribbleButton shape="underline">underline</ScribbleButton>
        <ScribbleButton shape="ghost">ghost</ScribbleButton>
      </div>
    ) },
    { title: 'hand-placed', note: 'tilt them — nothing on a desk is level', Demo: () => (
      <div className="flex flex-wrap items-center gap-5 py-2">
        <ScribbleButton tilt={-2} shape="sticker">askew</ScribbleButton>
        <ScribbleButton tilt={1.5} variant="danger">wonky</ScribbleButton>
        <ScribbleButton tilt={3} variant="primary" shape="box">leaning in</ScribbleButton>
      </div>
    ) },
  ],
  knobs: [
    { key: 'shape', label: 'shape', type: 'select', options: ['capsule', 'box', 'sticker', 'underline', 'ghost'], def: 'capsule' },
    { key: 'variant', label: 'ink', type: 'select', options: ['default', 'primary', 'danger'], def: 'primary' },
    { key: 'tilt', label: 'tilt°', type: 'range', min: -8, max: 8, def: 0 },
    { key: 'roughness', label: 'scrawl', type: 'range', min: 0, max: 24, def: 9 },
    { key: 'withArrow', label: 'arrow', type: 'toggle', def: false },
  ],
  KnobDemo: ({ k }) => (
    <div className="flex h-28 items-center justify-center">
      <ScribbleButton
        shape={k.shape as never}
        variant={k.variant as never}
        tilt={k.tilt as number}
        roughness={(k.roughness as number) / 10}
        withArrow={k.withArrow as boolean}
        seed={JSON.stringify(k)}
      >tweak me</ScribbleButton>
    </div>
  ),
  usage: `import { ScribbleButton } from '@/scribbleui/components/button'

<ScribbleButton variant="primary" withArrow>get started</ScribbleButton>
<ScribbleButton shape="sticker" tilt={-2}>hand-placed</ScribbleButton>`,
  props: [
    ['shape', `'capsule' | 'box' | 'sticker' | 'underline' | 'ghost'`, 'the drawn silhouette'],
    ['variant', `'default' | 'primary' | 'danger' | 'ghost'`, 'ink color; primary is double-traced'],
    ['tilt', 'number (deg)', 'hand placement'],
    ['roughness', 'number 0–2', 'ruler-straight → scrawled'],
    ['withArrow', 'boolean', 'CTA arrow that extends on hover'],
  ],
}

const input: ComponentEntry = {
  slug: 'input',
  title: 'Input',
  icon: '﹏',
  category: 'Forms',
  tagline: 'you type, the pen writes',
  description: 'No box — a ruled writing line, because that\'s what you write on. Every character you type is drawn back as ink right where the caret is. Errors get the teacher\'s red scribble; success earns a small tick.',
  Demo: () => {
    const [v, setV] = React.useState('hello')
    return (
      <div className="flex flex-wrap gap-10">
        <ScribbleInput label="say something" value={v} onChange={e => setV(e.target.value)} placeholder="type here…" />
        <ScribbleInput label="email" defaultValue="not-an-email" error="not an email yet!" />
      </div>
    )
  },
  variants: [
    { title: 'plain text mode', note: 'handwrite={false} for boring days', Demo: () => (
      <ScribbleInput label="plain" handwrite={false} placeholder="regular text, drawn line" />
    ) },
    { title: 'validated', Demo: () => {
      const [v, setV] = React.useState('amartya@')
      const ok = /@.+\./.test(v)
      return <ScribbleInput label="email" value={v} onChange={e => setV(e.target.value)} error={ok ? undefined : 'keep going…'} success={ok} />
    } },
  ],
  usage: `import { ScribbleInput } from '@/scribbleui/components/input'

<ScribbleInput
  label="email"
  error={valid ? undefined : 'not an email yet!'}
  success={valid}
/>`,
  props: [
    ['handwrite', 'boolean', 'draw typed characters as ink (default true)'],
    ['error', 'string', 'red teacher-scribble + handwritten note'],
    ['success', 'boolean', 'tick at the line\'s end'],
    ['label', 'string', 'field label'],
  ],
}

const textarea: ComponentEntry = {
  slug: 'textarea',
  title: 'Textarea',
  icon: '≡',
  category: 'Forms',
  tagline: 'a page that rules itself',
  description: 'Ruled notebook lines that appear only when the current one is FULL — and disappear when you delete. Typed text is drawn as handwriting on the rules, caret and ink in agreement.',
  Demo: () => (
    <ScribbleTextarea label="field notes" placeholder="fill a line and a new rule appears…" containerClassName="w-full max-w-md" />
  ),
  usage: `import { ScribbleTextarea } from '@/scribbleui/components/textarea'

<ScribbleTextarea label="notes" rows={3} />`,
  props: [
    ['rows', 'number', 'minimum ruled lines'],
    ['handwrite', 'boolean', 'draw typed text as ink (default true)'],
  ],
}

const checkbox: ComponentEntry = {
  slug: 'checkbox',
  title: 'Checkbox',
  icon: '✓',
  category: 'Forms',
  tagline: 'the tick is a flick',
  description: 'The tick escapes the box on purpose — satisfaction has momentum. Unchecking doesn\'t reverse the flick; it takes a rubber eraser to it. Undecided is a thoughtful dash.',
  Demo: () => (
    <div className="flex flex-col gap-3">
      <ScribbleCheckbox defaultChecked label="flick — check me off" />
      <ScribbleCheckbox label="then erase me" />
      <ScribbleCheckbox indeterminate label="still thinking" />
    </div>
  ),
  wild: {
    title: 'the satisfying part of a todo app',
    Demo: () => {
      const [done, setDone] = React.useState([true, false, false])
      const items = ['ship the engine', 'draw 37 components', 'go viral, tastefully']
      return (
        <div className="flex flex-col gap-2.5">
          {items.map((t, i) => (
            <ScribbleCheckbox
              key={t}
              checked={done[i]}
              onCheckedChange={v => setDone(d => d.map((x, j) => j === i ? v : x))}
              label={<span className={done[i] ? 'text-pencil line-through' : ''}>{t}</span>}
            />
          ))}
        </div>
      )
    },
  },
  usage: `import { ScribbleCheckbox } from '@/scribbleui/components/checkbox'

<ScribbleCheckbox
  checked={done}
  onCheckedChange={setDone}
  label="ship it"
/>`,
  props: [
    ['checked / defaultChecked', 'boolean', 'controlled / uncontrolled'],
    ['indeterminate', 'boolean', 'the thoughtful dash'],
    ['onCheckedChange', '(checked) => void', 'change handler'],
  ],
}

const radio: ComponentEntry = {
  slug: 'radio',
  title: 'Radio',
  icon: '◯',
  category: 'Forms',
  tagline: 'circle your answer',
  description: 'No dot-in-ring. The pen circles the chosen option\'s label — the exam-paper gesture — and the previous circle fades like erased pencil while the new one draws.',
  Demo: () => (
    <ScribbleRadioGroup aria-label="pen of choice" defaultValue="fountain" options={[
      { value: 'ballpoint', label: 'ballpoint — dependable' },
      { value: 'fountain', label: 'fountain pen — dramatic' },
      { value: 'pencil', label: 'pencil 2B — commitment issues' },
    ]} />
  ),
  usage: `import { ScribbleRadioGroup } from '@/scribbleui/components/radio'

<ScribbleRadioGroup
  defaultValue="fountain"
  options={[
    { value: 'ballpoint', label: 'ballpoint' },
    { value: 'fountain', label: 'fountain pen' },
  ]}
/>`,
  props: [
    ['options', '{ value, label, disabled? }[]', 'the answers'],
    ['value / defaultValue', 'string', 'controlled / uncontrolled'],
  ],
}

const switchEntry: ComponentEntry = {
  slug: 'switch',
  title: 'Switch',
  icon: '◐',
  category: 'Forms',
  tagline: 'wet ink on a capsule track',
  description: 'The knob is wet ink — dragging leaves a smear that dries in ~400ms — and ON pours a line of ink into the track behind it. State you can read from across the room.',
  Demo: () => (
    <div className="flex flex-wrap gap-10">
      <ScribbleSwitch defaultChecked label="night shift" />
      <ScribbleSwitch label="autosave" />
      <ScribbleSwitch defaultChecked variant="plain" label="plain track" size="sm" />
    </div>
  ),
  usage: `import { ScribbleSwitch } from '@/scribbleui/components/switch'

<ScribbleSwitch checked={dark} onCheckedChange={setDark} label="night shift" />`,
  props: [
    ['variant', `'ink' | 'plain'`, "'ink' pours ink behind the knob when ON"],
    ['size', `'sm' | 'md'`, 'track size'],
  ],
}

const slider: ComponentEntry = {
  slug: 'slider',
  title: 'Slider',
  icon: '⊸',
  category: 'Forms',
  tagline: 'pencil ruler, inked decision',
  description: 'The track is a pencil ruler with hand-struck ticks; your setting is ink drawn over it — decision over draft. The thumb is a drawn nib, and while you drag, the value rides along on a little paper scrap.',
  Demo: () => (
    <div className="flex flex-col gap-8 pt-2">
      <ScribbleSlider defaultValue={62} tickEvery={10} showValue format={v => v + '%'} className="w-72" label="ink level" />
      <ScribbleSlider defaultValue={30} min={0} max={60} tickEvery={5} tickLabels format={v => v + 'm'} className="w-72" label="focus timer" />
    </div>
  ),
  usage: `import { ScribbleSlider } from '@/scribbleui/components/slider'

<ScribbleSlider defaultValue={62} tickEvery={10} showValue format={v => v + '%'} />`,
  props: [
    ['tickEvery', 'number', 'ruler ticks every n units (every 5th is major)'],
    ['tickLabels', 'boolean', 'label the major ticks'],
    ['showValue', 'boolean', 'always show the value scrap'],
    ['format', '(v) => string', 'value formatting'],
  ],
}

const select: ComponentEntry = {
  slug: 'select',
  title: 'Select',
  icon: '▾',
  category: 'Forms',
  tagline: 'options on a dropped scrap',
  description: 'The menu is a paper scrap that drops in at a seeded angle. Picking circles the option — the circle lands exactly around the row — and multi-select keeps every circle with a tick in the margin.',
  Demo: () => (
    <div className="flex h-52 flex-wrap gap-10">
      <ScribbleSelect aria-label="fruit" defaultValue="mango" options={[
        { value: 'mango', label: 'mango' },
        { value: 'lychee', label: 'lychee' },
        { value: 'guava', label: 'guava' },
      ]} />
      <ScribbleSelect aria-label="toppings" multiple placeholder="toppings…" options={[
        { value: 'chili', label: 'chili flakes' },
        { value: 'chaat', label: 'chaat masala' },
        { value: 'lime', label: 'lime' },
      ]} />
    </div>
  ),
  usage: `import { ScribbleSelect } from '@/scribbleui/components/select'

<ScribbleSelect defaultValue="mango" options={fruits} />
<ScribbleSelect multiple onValuesChange={setToppings} options={toppings} />`,
  props: [
    ['multiple', 'boolean', 'multi-select: circles persist, ticks in the margin'],
    ['options', '{ value, label, disabled? }[]', 'the scrap\'s contents'],
    ['onValueChange / onValuesChange', 'fn', 'single / multi handlers'],
  ],
}

export const forms: ComponentEntry[] = [button, input, textarea, checkbox, radio, switchEntry, slider, select]
