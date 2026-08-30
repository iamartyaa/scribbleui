/** Tiny class joiner — no dependency needed. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

let counter = 0
export function nextAutoSeed(): string {
  return `sui-${++counter}`
}
