import { cpSync, mkdirSync } from 'node:fs'
mkdirSync('dist/fonts', { recursive: true })
cpSync('src/fonts', 'dist/fonts', { recursive: true })
