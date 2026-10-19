import type { BuildingType, Era } from './types.ts'

export const ERAS: readonly { name: Era; threshold: number; unlock: string }[] = [
  { name: 'Primitive', threshold: 0, unlock: 'huts' },
  { name: 'Agricultural', threshold: 45, unlock: 'farms' },
  { name: 'Metallurgy', threshold: 120, unlock: 'workshops' },
  { name: 'Industrial', threshold: 220, unlock: 'research hubs' },
  { name: 'Digital Era', threshold: 360, unlock: 'amplified research' },
]

export const BUILDING_CAPS: Record<BuildingType, number> = {
  hut: 5,
  farm: 4,
  workshop: 3,
  research_hub: 2,
}

export const BUILDINGS_BY_ERA: Record<Era, readonly BuildingType[]> = {
  Primitive: ['hut'],
  Agricultural: ['hut', 'farm'],
  Metallurgy: ['hut', 'farm', 'workshop'],
  Industrial: ['hut', 'farm', 'workshop', 'research_hub'],
  'Digital Era': ['hut', 'farm', 'workshop', 'research_hub'],
}

export function eraForPoints(points: number): Era {
  let era: Era = 'Primitive'
  for (const entry of ERAS) {
    if (points >= entry.threshold) era = entry.name
  }
  return era
}

export function researchProgress(points: number): {
  progress: number
  next: Era | null
  target: number
  unlock: string
} {
  const era = eraForPoints(points)
  const index = ERAS.findIndex((entry) => entry.name === era)
  const current = ERAS[index]
  const next = ERAS[index + 1]
  if (!current || !next) {
    const last = ERAS[ERAS.length - 1]
    return { progress: 1, next: null, target: last?.threshold ?? points, unlock: last?.unlock ?? '' }
  }
  const span = next.threshold - current.threshold
  const progress = span <= 0 ? 1 : Math.min(1, Math.max(0, (points - current.threshold) / span))
  return { progress, next: next.name, target: next.threshold, unlock: next.unlock }
}
