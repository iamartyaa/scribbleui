export * from './hand-format.js'
export * from './layout.js'
export * from './writer.js'
import printFont from './fonts/print.hand.json'
import scriptFont from './fonts/script.hand.json'
import boldFont from './fonts/bold.hand.json'
import type { HandFont } from './hand-format.js'

/** Built-in hands (Hershey-derived, public domain). */
export const hands: Record<'print' | 'script' | 'bold', HandFont> = {
  print: printFont as unknown as HandFont,
  script: scriptFont as unknown as HandFont,
  bold: boldFont as unknown as HandFont,
}
