/** FNV-1a hash of a string to a uint32 — stable across platforms. */
export function hashSeed(seed: string | number): number {
  const s = String(seed)
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Mulberry32 — tiny, fast, deterministic. Returns () => [0,1). */
export function mulberry32(a: number): () => number {
  let state = a >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function rng(seed: string | number = 0): () => number {
  return mulberry32(hashSeed(seed))
}

/**
 * Deterministic 1D value noise in [-1, 1].
 * Smooth (cosine-interpolated) lattice noise; `x` in arbitrary units.
 */
export function makeNoise1D(seed: string | number): (x: number) => number {
  const base = hashSeed(seed)
  const lattice = (i: number): number => {
    // hash integer lattice point with the seed
    let h = (base ^ Math.imul(i | 0, 374761393)) >>> 0
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296 * 2 - 1
  }
  return (x: number) => {
    const i = Math.floor(x)
    const f = x - i
    const u = (1 - Math.cos(f * Math.PI)) / 2
    return lattice(i) * (1 - u) + lattice(i + 1) * u
  }
}
