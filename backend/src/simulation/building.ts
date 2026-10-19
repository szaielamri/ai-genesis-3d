import {
  BUILDING_CAPS,
  BUILDINGS_BY_ERA,
  distance2D,
  inBounds,
  isWater,
  terrainHeight,
  type Agent,
  type BuildingType,
  type Vec3,
  type WorldState,
} from 'ai-genesis-shared'
import { pushEvent } from '../events.ts'
import { nextId } from '../ids.ts'

const LABELS: Record<BuildingType, string> = {
  hut: 'hut',
  farm: 'farm',
  workshop: 'workshop',
  research_hub: 'research hub',
}

function hash(value: string): number {
  let h = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    h ^= value.charCodeAt(index)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function nextBuildingType(world: WorldState): BuildingType | null {
  const unlocked = BUILDINGS_BY_ERA[world.era]
  for (let index = unlocked.length - 1; index >= 0; index -= 1) {
    const type = unlocked[index]
    if (!type) continue
    const count = world.buildings.filter((building) => building.type === type).length
    if (count >= BUILDING_CAPS[type]) continue
    if (type === 'workshop' && !world.resources.some((node) => node.kind === 'stone' && node.amount >= 12)) continue
    if (type === 'research_hub' && !world.buildings.some((building) => building.type === 'workshop')) continue
    return type
  }
  return null
}

export function findBuildSite(agent: Agent, world: WorldState): Vec3 | null {
  const type = nextBuildingType(world)
  if (!type) return null
  const stone = world.resources.find((node) => node.kind === 'stone' && node.amount >= 12)
  const anchor = type === 'workshop' && stone ? stone.position : agent.position
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const angle = (hash(`${agent.id}:${attempt}`) / 4294967295) * Math.PI * 2
    const radius = 3.2 + (attempt % 6) * 0.85
    const x = anchor.x + Math.cos(angle) * radius
    const z = anchor.z + Math.sin(angle) * radius
    if (!inBounds(x, z) || isWater(x, z)) continue
    const point = { x, y: terrainHeight(x, z), z }
    const crowded = world.buildings.some((building) => distance2D(building.position, point) < 3.5)
    if (!crowded) return point
  }
  return null
}

export function siteIsOpen(target: Vec3, world: WorldState): boolean {
  if (isWater(target.x, target.z) || !inBounds(target.x, target.z)) return false
  return !world.buildings.some((building) => distance2D(building.position, target) < 2.4)
}

export function tryConstruct(agent: Agent, world: WorldState): boolean {
  const type = nextBuildingType(world)
  if (!type) return false
  if (world.buildings.some((building) => distance2D(building.position, agent.position) < 3.2)) return false

  if (type === 'workshop') {
    const stone = world.resources
      .filter((node) => node.kind === 'stone' && node.amount >= 12 && distance2D(node.position, agent.position) < 16)
      .sort((a, b) => distance2D(a.position, agent.position) - distance2D(b.position, agent.position))[0]
    if (!stone) return false
    stone.amount -= 12
  }

  world.buildings.push({
    id: nextId('building'),
    type,
    era: world.era,
    position: { ...agent.position, y: terrainHeight(agent.position.x, agent.position.z) },
    constructedTick: world.tick,
    builderName: agent.name,
  })
  agent.needs.energy = Math.max(0, agent.needs.energy - 14)
  agent.actionCooldown = 16
  pushEvent(world, 'building', `${agent.name} raised a ${LABELS[type]}.`)
  return true
}
