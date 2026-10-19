import { randomUUID } from 'node:crypto'
import {
  AGE_PER_TICK,
  DAY_TICKS,
  eraForPoints,
  isWater,
  researchProgress,
  terrainHeight,
  type Agent,
  type DNA,
  type Emotions,
  type Flora,
  type Gender,
  type Needs,
  type ResourceKind,
  type ResourceNode,
  type SocietalStats,
  type WorldState,
} from 'ai-genesis-shared'
import { jitteredDna } from './genetics.ts'
import { nextId, observeId, resetIds } from './ids.ts'
import { reserveName, resetNames, takeName } from './names.ts'

export const POPULATION_CAP = 40

const FOUNDER_DNA: DNA = {
  speed: 0.58,
  strength: 0.62,
  curiosity: 0.72,
  fertility: 0.66,
  learningRate: 0.64,
  sociality: 0.74,
}

function landPoint(attempts = 40): { x: number; y: number; z: number } {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const x = (Math.random() * 2 - 1) * 20
    const z = (Math.random() * 2 - 1) * 20
    if (!isWater(x, z)) return { x, y: terrainHeight(x, z), z }
  }
  return { x: -2, y: terrainHeight(-2, 2), z: 2 }
}

function scatter(kind: ResourceKind, count: number, capacity: number, placed: ResourceNode[]): ResourceNode[] {
  const nodes: ResourceNode[] = []
  let guard = 0
  while (nodes.length < count && guard < 400) {
    guard += 1
    const point = landPoint()
    const crowded = [...placed, ...nodes].some((node) => Math.hypot(node.position.x - point.x, node.position.z - point.z) < 3.2)
    if (crowded) continue
    nodes.push({
      id: nextId(kind),
      kind,
      position: point,
      amount: capacity * 0.85,
      capacity,
    })
  }
  return nodes
}

function scatterFlora(): Flora[] {
  const flora: Flora[] = []
  let trees = 0
  let grass = 0
  let guard = 0
  while ((trees < 28 || grass < 56) && guard < 800) {
    guard += 1
    const point = landPoint(8)
    if (isWater(point.x, point.z)) continue
    const kind = trees < 28 && (grass >= 56 || Math.random() < 0.34) ? 'tree' : 'grass'
    if (kind === 'tree') trees += 1
    else grass += 1
    flora.push({
      id: nextId(kind),
      kind,
      position: point,
      scale: kind === 'tree' ? 0.75 + Math.random() * 0.7 : 0.45 + Math.random() * 0.7,
    })
  }
  return flora
}

function founder(
  gender: Gender,
  age: number,
  position: { x: number; z: number },
  needs: Needs,
  emotions: Emotions,
): Agent {
  const point = isWater(position.x, position.z) ? landPoint() : { ...position, y: terrainHeight(position.x, position.z) }
  return {
    id: nextId('agent'),
    name: takeName(gender),
    gender,
    age,
    generation: 1,
    position: { x: point.x, y: terrainHeight(point.x, point.z), z: point.z },
    target: landPoint(),
    status: 'EXPLORING',
    needs,
    emotions,
    dna: jitteredDna(FOUNDER_DNA, 0.06),
    parentIds: [],
    thought: 'Someone else is breathing in this new world.',
    reproduceCooldown: 0,
    actionCooldown: 0,
    bonds: [],
  }
}

export function refreshStats(world: WorldState): void {
  const progress = researchProgress(world.researchPoints)
  const generation = world.agents.reduce((max, agent) => Math.max(max, agent.generation), 1)
  world.era = eraForPoints(world.researchPoints)
  world.dayPhase = ((world.tick + 23) % DAY_TICKS) / DAY_TICKS
  world.year = 24 + world.tick * AGE_PER_TICK
  const stats: SocietalStats = {
    population: world.agents.length,
    births: world.stats.births,
    deaths: world.stats.deaths,
    generation,
    techLevel: world.era,
    researchPoints: world.researchPoints,
    researchProgress: progress.progress,
    nextEra: progress.next,
    researchTarget: progress.target,
  }
  world.stats = stats
}

export function createWorld(): WorldState {
  resetIds()
  resetNames()
  const food = scatter('food', 8, 52, [])
  const stone = scatter('stone', 5, 40, food)
  const research = scatter('research', 4, 28, [...food, ...stone])
  const resources = [...food, ...stone, ...research]
  const flora = scatterFlora()
  const adam = founder(
    'male',
    24,
    { x: -2.2, z: 1.4 },
    { hunger: 78, energy: 82, social: 42, health: 90, longevity: 92 },
    { pleasure: 0.52, arousal: 0.22, dominance: 0.48, anxiety: 0.18, curiosity: 0.7 },
  )
  const eve = founder(
    'female',
    22,
    { x: 2.4, z: -0.6 },
    { hunger: 80, energy: 84, social: 46, health: 92, longevity: 94 },
    { pleasure: 0.58, arousal: 0.24, dominance: 0.36, anxiety: 0.14, curiosity: 0.74 },
  )
  adam.target = { ...eve.position }
  eve.target = { ...adam.position }

  const world: WorldState = {
    worldId: randomUUID(),
    tick: 0,
    year: 1,
    dayPhase: 0,
    paused: false,
    speed: 1,
    era: 'Primitive',
    researchPoints: 0,
    agents: [adam, eve],
    buildings: [],
    resources,
    flora,
    stats: {
      population: 2,
      births: 0,
      deaths: 0,
      generation: 1,
      techLevel: 'Primitive',
      researchPoints: 0,
      researchProgress: 0,
      nextEra: 'Agricultural',
      researchTarget: 45,
    },
    events: [],
  }
  refreshStats(world)
  world.events.unshift({
    id: nextId('event'),
    tick: world.tick,
    year: world.year,
    kind: 'era',
    message: 'Adam and Eve open their eyes. The world is still primitive.',
  })
  return world
}

export function rememberWorld(world: WorldState): void {
  resetIds()
  resetNames()
  const ids = [
    ...world.agents.map((agent) => agent.id),
    ...world.buildings.map((building) => building.id),
    ...world.resources.map((resource) => resource.id),
    ...world.flora.map((item) => item.id),
    ...world.events.map((event) => event.id),
  ]
  for (const id of ids) observeId(id)
  for (const agent of world.agents) reserveName(agent.name)
}

export function isSimSpeed(value: unknown): value is WorldState['speed'] {
  return value === 1 || value === 2 || value === 5
}
