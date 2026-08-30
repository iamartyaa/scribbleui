import * as React from 'react'

/** #/  ·  #/c/button  ·  #/install */
export function useRoute(): { page: 'home' | 'component' | 'install'; slug?: string; nav: (h: string) => void } {
  const [hash, setHash] = React.useState(() => window.location.hash)
  React.useEffect(() => {
    const on = () => { setHash(window.location.hash); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const nav = (h: string) => { window.location.hash = h }
  const parts = hash.replace(/^#\/?/, '').split('/')
  if (parts[0] === 'c' && parts[1]) return { page: 'component', slug: parts[1], nav }
  if (parts[0] === 'install') return { page: 'install', nav }
  return { page: 'home', nav }
}
