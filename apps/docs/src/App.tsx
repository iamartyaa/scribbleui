import * as React from 'react'
import { InkProvider, ScribbleToaster } from '@/components'
import { ComponentPage } from './site/ComponentPage'
import { Home } from './site/Home'
import { PenMode } from './site/PenMode'
import { Shell } from './site/Shell'
import { ShipRunner } from './site/eggs'
import { useRoute } from './site/route'

export function App() {
  const { page, slug, nav } = useRoute()
  return (
    <InkProvider seed="scribble-docs">
      <ScribbleToaster />
      <PenMode />
      <ShipRunner />
      <Shell slug={page === 'component' ? slug : undefined} nav={nav}>
        {page === 'component' && slug ? <ComponentPage slug={slug} /> : <Home nav={nav} />}
      </Shell>
    </InkProvider>
  )
}
