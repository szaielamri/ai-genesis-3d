import {
  clamp,
  distance2D,
  isWater,
  terrainHeight,
  type Agent,
  type ResourceKind,
  type ResourceNode,
  type WorldState,
} from 'ai-genesis-shared'
import { pushEvent } from '../events.ts'
import { findBuildSite, nextBuildingType, siteIsOpen, tryConstruct } from './building.ts'
import { areLinealKin } from './reproduction.ts'

function nearestOther(agent: Agent, agents: Agent[]): Agent | null {
  let best: Agent | null = null
  let bestDistance = Infinity
  for (const other of agents) {
    if (other.id === agent.id) continue
    const distance = distance2D(agent.position, other.position)
    if (distance < bestDistance) {
      best = other
      bestDistance = distance
    }
  }
  return best
}

function nearestResource(agent: Agent, resources: ResourceNode[], kind: ResourceKind): ResourceNode | null {
  let best: ResourceNode | null = null
  let bestDistance = Infinity
  for (const resource of resources) {
    if (resource.kind !== kind || resource.amount <= 1) continue
    const distance = distance2D(agent.position, resource.position)
    if (distance < bestDistance) {
      best = resource
      bestDistance = distance
    }
  }
  return best
}

function approachPoint(agent: Agent, other: Agent): void {
  const angle = (agent.id.charCodeAt(agent.id.length - 1) / 255) * Math.PI * 2
  agent.target = {
    x: other.position.x + Math.cos(angle) * 0.75,
    y: other.position.y,
    z: other.position.z + Math.sin(angle) * 0.75,
  }
}

function formBond(agent: Agent, other: Agent, world: WorldState): void {
  if (agent.bonds.includes(other.id)) return
  if (agent.id > other.id) return
  agent.bonds.push(other.id)
  other.bonds.push(agent.id)
  pushEvent(world, 'relationship', `${agent.name} and ${other.name} formed a bond.`)
}

function wanderTarget(agent: Agent): void {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const x = agent.position.x + (Math.random() * 2 - 1) * 8
    const z = agent.position.z + (Math.random() * 2 - 1) * 8
    if (!isWater(x, z)) {
      agent.target = { x, y: terrainHeight(x, z), z }
      return
    }
  }
}

export function decide(agent: Agent, world: WorldState): void {
  if (agent.reproduceCooldown > 0) agent.reproduceCooldown -= 1
  if (agent.actionCooldown > 0) agent.actionCooldown -= 1

  agent.needs.hunger = clamp(agent.needs.hunger - 1.35, 0, 100)
  let longevityDrain = 0.2
  if (agent.age > 55) longevityDrain += (agent.age - 55) * 0.02
  if (agent.needs.health < 40) longevityDrain += 0.2
  agent.needs.longevity = clamp(agent.needs.longevity - longevityDrain, 0, 100)

  const nearest = nearestOther(agent, world.agents)
  const nearestDistance = nearest ? distance2D(agent.position, nearest.position) : Infinity
  if (nearestDistance > 8) agent.needs.social = clamp(agent.needs.social - 1.7, 0, 100)
  if (agent.needs.hunger < 20) agent.needs.health = clamp(agent.needs.health - 2.5, 0, 100)
  else if (agent.needs.hunger > 60 && agent.needs.energy > 30) agent.needs.health = clamp(agent.needs.health + 0.3, 0, 100)

  const food = nearestResource(agent, world.resources, 'food')
  const starving = agent.needs.hunger < 26 && food && agent.needs.energy > 8
  if (agent.status === 'RESTING' && !starving && agent.needs.energy < 76) {
    agent.status = 'RESTING'
    agent.needs.energy = clamp(agent.needs.energy + 8, 0, 100)
    return
  }
  if (!starving && agent.needs.energy < 18) {
    agent.status = 'RESTING'
    agent.needs.energy = clamp(agent.needs.energy + 8, 0, 100)
    return
  }

  if (agent.needs.hunger < 36 && food) {
    agent.target = { ...food.position }
    if (distance2D(agent.position, food.position) < 1.35 && food.amount > 0) {
      agent.status = 'EATING'
      const farm = world.buildings.some((building) => building.type === 'farm' && distance2D(building.position, food.position) < 8)
      const bite = Math.min(12, food.amount)
      food.amount -= bite
      agent.needs.hunger = clamp(agent.needs.hunger + bite * (farm ? 1.55 : 1.15), 0, 100)
      agent.needs.energy = clamp(agent.needs.energy + 3, 0, 100)
    } else {
      agent.status = 'HUNGRY'
    }
    return
  }

  let mate: Agent | null = null
  if (agent.reproduceCooldown <= 0 && agent.age > 18 && agent.needs.social > 70 && agent.needs.health > 70) {
    let bestDistance = 8
    for (const other of world.agents) {
      if (other.id === agent.id || other.gender === agent.gender || other.age <= 18 || areLinealKin(agent, other)) continue
      const distance = distance2D(agent.position, other.position)
      if (distance < bestDistance) {
        mate = other
        bestDistance = distance
      }
    }
  }
  if (mate) {
    approachPoint(agent, mate)
    agent.status = 'SOCIALIZING'
    if (distance2D(agent.position, mate.position) < 2.3 && agent.id < mate.id) {
      const gain = 7 * agent.dna.sociality
      agent.needs.social = clamp(agent.needs.social + gain, 0, 100)
      mate.needs.social = clamp(mate.needs.social + 5 * mate.dna.sociality, 0, 100)
      formBond(agent, mate, world)
    }
    return
  }

  if (agent.needs.social < 74 && nearest) {
    approachPoint(agent, nearest)
    if (nearestDistance < 2.4) {
      agent.status = 'SOCIALIZING'
      if (agent.id < nearest.id) {
        agent.needs.social = clamp(agent.needs.social + 8 * agent.dna.sociality, 0, 100)
        nearest.needs.social = clamp(nearest.needs.social + 5 * nearest.dna.sociality, 0, 100)
        formBond(agent, nearest, world)
      }
    } else {
      agent.status = 'SOCIALIZING'
    }
    return
  }

  const insight = nearestResource(agent, world.resources, 'research')
  const continuingResearch =
    insight !== null &&
    (agent.status === 'RESEARCHING' || agent.status === 'EXPLORING') &&
    distance2D(agent.target, insight.position) < 1.2
  const startsResearch = Math.random() < agent.dna.curiosity * 0.35
  if (agent.dna.curiosity > 0.55 && insight && agent.needs.energy > 30 && (continuingResearch || startsResearch)) {
    agent.target = { ...insight.position }
    if (distance2D(agent.position, insight.position) < 1.6) {
      agent.status = 'RESEARCHING'
      const digital = world.era === 'Digital Era' ? 1.55 : 1
      const hub = world.buildings.some((building) => building.type === 'research_hub') ? 1.35 : 1
      world.researchPoints += agent.dna.curiosity * agent.dna.learningRate * 3.8 * digital * hub
      insight.amount = Math.max(0, insight.amount - 0.75)
      agent.needs.energy = clamp(agent.needs.energy - 0.7, 0, 100)
    } else {
      agent.status = 'EXPLORING'
    }
    return
  }

  if (agent.actionCooldown <= 0 && agent.needs.energy > 38 && agent.dna.strength > 0.32 && nextBuildingType(world)) {
    const site = agent.status === 'BUILDING' && siteIsOpen(agent.target, world) ? agent.target : findBuildSite(agent, world)
    if (site) {
      agent.target = site
      agent.status = 'BUILDING'
      if (distance2D(agent.position, site) < 1.15) tryConstruct(agent, world)
      return
    }
  }

  agent.status = 'EXPLORING'
  if (distance2D(agent.position, agent.target) < 0.9 || isWater(agent.target.x, agent.target.z)) wanderTarget(agent)
}
