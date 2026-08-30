import { bowedLine, ellipse, ink, line, rect, type InkTimeline } from '@scribbleui/engine'
import * as React from 'react'
import { Handwritten, Ink, ScribbleArrowArt, Stickman, useSeed } from '@/components'

const PORTFOLIO = 'https://iamartyaa.github.io'

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-label text-[8.5px] uppercase tracking-widest text-pencil">{k}</span>
      <span className="font-hand text-lg leading-tight text-ink">{v}</span>
    </div>
  )
}

/**
 * The pen-holder's "license to scribble" — taped to the right edge of the
 * desk, vertically centered beside the page. Hover: it leans in, grows to
 * full size, and 3D-tilts toward your pointer with a shine sweep. Clicking
 * visits the portfolio. (Obviously fictional; the stamp gives it away.)
 */
export function PenLicense() {
  const seed = useSeed('license')
  const [tilt, setTilt] = React.useState<{ rx: number; ry: number } | null>(null)
  const [hover, setHover] = React.useState(false)
  const cardRef = React.useRef<HTMLAnchorElement>(null)
  const W = 440, H = 252

  const borderTl: InkTimeline = React.useMemo(
    () => ink([
      ...rect(W - 4, H - 4, seed).map(s => s.map(p => ({ x: p.x + 2, y: p.y + 2 }))),
      ...rect(W - 12, H - 12, seed + '2').map(s => s.map(p => ({ x: p.x + 6, y: p.y + 6 }))),
      bowedLine(8, 34, W - 8, 34, 0.01, seed + 'rule'),
    ], { seed, roughness: 0.9, speed: 4, width: 1.7 }),
    [seed],
  )
  const stampTl: InkTimeline = React.useMemo(
    () => ink([
      ellipse(0, 0, 40, 22, seed + 'st'),
      ellipse(0, 0, 35, 18, seed + 'st2'),
    ], { seed: seed + ':st', roughness: 1.3, speed: 3, width: 1.6 }),
    [seed],
  )
  const barcodeTl: InkTimeline = React.useMemo(() => {
    const bars = []
    let x = 0
    for (let i = 0; i < 26; i++) {
      bars.push(line(x, 0, x, 18))
      x += 2.2 + ((i * 7919) % 5) * 1.6
    }
    return ink(bars, { seed: seed + ':bc', roughness: 0.5, speed: 8, width: 1.6, flightBase: 4 })
  }, [seed])

  const onMove = (e: React.PointerEvent) => {
    const r = cardRef.current!.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    setTilt({ rx: -py * 12, ry: px * 14 })
  }

  return (
    <aside
      className="fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-1 min-[1400px]:flex"
      aria-label="about the author"
    >
      {/* the note, aimed down at the card's top edge */}
      <div className="mb-1.5 mr-14 flex flex-col items-center gap-1">
        <span className="max-w-36 text-center font-hand text-xl leading-tight text-brand">
          the guy holding the pen
        </span>
        <ScribbleArrowArt kind="curve" length={46} arc={0.3} angle={78} seed="lic-arr-top" color="var(--sui-brand)" trigger="visible" />
      </div>

      {/* scaled rail card; grows to full size on hover */}
      <div
        style={{
          perspective: 900,
          transform: hover ? 'scale(1)' : 'scale(0.6)',
          transformOrigin: 'top right',
          transition: 'transform 260ms cubic-bezier(.3,1.4,.4,1)',
        }}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => { setHover(false); setTilt(null) }}
      >
        <a
          ref={cardRef}
          href={PORTFOLIO}
          target="_blank"
          rel="noreferrer"
          aria-label="visit Amartya's portfolio"
          onPointerMove={onMove}
          className="relative block select-none overflow-hidden bg-card no-underline shadow-[5px_7px_0_var(--sui-shadow)]"
          style={{
            width: W, height: H,
            transform: tilt ? `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` : 'rotate(-1.6deg)',
            transition: tilt ? 'transform 60ms linear' : 'transform 300ms ease',
            transformStyle: 'preserve-3d',
          }}
        >
          <span aria-hidden className="absolute -top-0.5 left-1/2 z-20 h-5 w-16 -translate-x-1/2 rotate-[-5deg]" style={{ background: 'var(--sui-hl)', opacity: 0.5 }} />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.35) 48%, transparent 58%)',
              transform: `translateX(${tilt ? tilt.ry * 14 : -170}px)`,
              transition: tilt ? 'transform 80ms linear' : 'transform 500ms ease',
              mixBlendMode: 'soft-light',
            }}
          />
          <Ink overlay timeline={borderTl} draw={false} color="var(--sui-ink)" className="absolute" />
          <div className="flex items-center justify-between px-4 pt-2">
            <span className="font-label text-[9px] uppercase tracking-[0.22em] text-brand">✦ Republic of Scribbleland ✦</span>
            <span className="font-label text-[9px] uppercase tracking-[0.18em] text-pencil">license to scribble</span>
          </div>
          <div className="flex gap-4 px-5 pt-3">
            <div className="relative flex w-24 shrink-0 flex-col items-center">
              <div className="flex h-28 w-24 items-center justify-center border-[1.5px] border-ink bg-paper-2">
                <Stickman pose="wave" size={88} seed="lic-sm" />
              </div>
              <span className="absolute -bottom-2 left-1/2 z-10 -translate-x-1/2 rotate-[-12deg] font-label text-[10px] font-bold text-danger">
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Ink overlay timeline={stampTl} draw={false} color="var(--sui-danger)" style={{ opacity: 0.8 }} />
                </span>
                APPROVED
              </span>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-x-3 gap-y-1.5 pt-1">
              <Field k="lic. no." v="SCRB-2026-∞" />
              <Field k="class" v="A+ doodler" />
              <Field k="name" v="Amartya Yadav" />
              <Field k="alias" v="@evilseyee" />
              <Field k="issued" v="aug 2026" />
              <Field k="expires" v="never" />
            </div>
          </div>
          <div className="absolute inset-x-5 bottom-3 flex items-end justify-between">
            <div className="text-accent">
              <Handwritten hand="script" size={26} seed="lic-sig" trigger="visible">Amartya</Handwritten>
              <div className="-mt-1 font-label text-[8px] uppercase tracking-widest text-pencil">signature of bearer</div>
            </div>
            <Ink timeline={barcodeTl} draw={false} color="var(--sui-ink)" style={{ opacity: 0.8 }} />
          </div>
        </a>
      </div>

      {/* below: the click nudge, pointing back up at the card's bottom edge */}
      <div className="mr-8 mt-1.5 flex items-center gap-2">
        <span className="whitespace-nowrap font-hand text-lg leading-tight text-accent">click it — portfolio inside</span>
        <ScribbleArrowArt kind="curve" length={44} arc={0.3} angle={-70} seed="lic-arr-bot" color="var(--sui-accent)" trigger="visible" />
      </div>
    </aside>
  )
}
