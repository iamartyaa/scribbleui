import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  base: process.env.BASE ?? '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom', 'motion'],
    alias: {
      '@': fileURLToPath(new URL('../../packages/ui/src', import.meta.url)),
      '@scribbleui/engine': fileURLToPath(new URL('../../packages/engine/src/index.ts', import.meta.url)),
      '@scribbleui/text': fileURLToPath(new URL('../../packages/text/src/index.ts', import.meta.url)),
    },
  },
})
