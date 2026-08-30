import * as React from 'react'
import { ScratchNumber, ScribbleButton } from '@/components'

const REPO = 'iamartyaa/scribbleui'

/** Star button with a live count (scratch-rewritten when it changes). */
export function GitHubButton({ big }: { big?: boolean }) {
  const [stars, setStars] = React.useState<number | null>(null)
  React.useEffect(() => {
    fetch(`https://api.github.com/repos/${REPO}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && typeof d.stargazers_count === 'number') setStars(d.stargazers_count) })
      .catch(() => {})
  }, [])
  return (
    <a href={`https://github.com/${REPO}`} target="_blank" rel="noreferrer" className="no-underline">
      <ScribbleButton shape={big ? 'box' : 'ghost'} variant={big ? 'default' : 'ghost'} className={big ? '' : '!px-2 !py-1'}>
        <span aria-hidden>★</span> star
        {stars !== null && <ScratchNumber value={stars} size={16} seed="gh-stars" />}
      </ScribbleButton>
    </a>
  )
}
