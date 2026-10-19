import { AGE_PER_TICK, eraForPoints, type Agent, type WorldState } from 'ai-genesis-shared'
import { pushEvent } from '../events.ts'
import { refreshStats } from '../world.ts'
import { decide } from './decide.ts'
import { updateEmotions } from './emotions.ts'
import { moveAgent } from './movement.ts'
import { reproduce } from './reproduction.ts'
import { writeThought } from './thoughts.ts'

function regenerate(world: WorldState): void {
  for (const node of world.resources) {
    const base = node.kind === 'food' ? 1.35 : node.kind === 'research' ? 0.65 : 0.35
    const farm =
      node.kind === 'food' && world.buildings.some((building) => building.type === 'farm' && Math.hypot(building.position.x - node.position.x, building.position.z - node.position.z) < 8)
        ? 1.8
        : 1
    node.amount = Math.min(node.capacity, node.amount + base * farm)
  }
}

function reap(world: WorldState): void {
  const living: Agent[] = []
  for (const agent of world.agents) {
    if (agent.needs.health <= 0 || agent.needs.longevity <= 0) {
      world.stats.deaths += 1
      const cause = agent.needs.health <= 0 ? 'starvation and failing health' : 'old age'
      pushEvent(world, 'death', `${agent.name} died of ${cause} at age ${Math.floor(agent.age)}.`)
    } else {
      living.push(agent)
    }
  }
  world.agents = living
}

export function step(world: WorldState): WorldState {
  const previousEra = world.era
  world.tick += 1
  regenerate(world)

  for (const agent of world.agents) decide(agent, world)
  for (const agent of world.agents) moveAgent(agent)
  reap(world)
  reproduce(world)

  for (const agent of world.agents) {
    agent.age += AGE_PER_TICK
    updateEmotions(agent, world)
    writeThought(agent, world.tick)
  }

  const nextEra = eraForPoints(world.researchPoints)
  if (nextEra !== previousEra) {
    const unlock =
      nextEra === 'Agricultural'
        ? 'Farms can now be raised.'
        : nextEra === 'Metallurgy'
          ? 'Workshops can now be raised.'
          : nextEra === 'Industrial'
            ? 'Research hubs can now be raised.'
            : 'Discovery moves faster from here.'
    pushEvent(world, 'breakthrough', `Breakthrough: society enters the ${nextEra}. ${unlock}`)
  }

  refreshStats(world)
  return world
}
