import { clamp, DNA_GENES, type DNA } from 'ai-genesis-shared'

export function jitteredDna(base: DNA, spread: number): DNA {
  const next = { ...base }
  for (const gene of DNA_GENES) {
    next[gene] = clamp(base[gene] + (Math.random() * 2 - 1) * spread, 0, 1)
  }
  return next
}

/** Single-point crossover, then a ±5% drift on every inherited gene. */
export function inheritDna(left: DNA, right: DNA): DNA {
  const point = 1 + Math.floor(Math.random() * (DNA_GENES.length - 1))
  const child = {} as DNA
  DNA_GENES.forEach((gene, index) => {
    const inherited = index < point ? left[gene] : right[gene]
    const drift = (Math.random() * 2 - 1) * 0.05
    child[gene] = clamp(inherited + drift, 0, 1)
  })
  return child
}
