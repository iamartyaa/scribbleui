import { toast } from '@/components/toast'

export async function copy(text: string, what = 'copied'): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
    toast(`${what} ✓`)
  } catch {
    toast.error('clipboard said no — select it by hand?')
  }
}
