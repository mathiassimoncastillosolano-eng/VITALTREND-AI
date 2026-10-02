/** PRNG determinista (mulberry32) para datos simulados reproducibles. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Ruido aproximadamente gaussiano en [-1, 1]. */
export function noise(rng: () => number): number {
  return (rng() + rng() + rng() - 1.5) / 1.5
}
