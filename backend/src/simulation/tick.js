import { createResource } from '../models/World.js'
import { applyNeeds, chooseIntent, consume } from './needs.js'
import { tryReproduce } from './reproduction.js'

const MAX_POPULATION = 64
const TARGET_RESOURCES = 22
const SEEK_SPEED = 0.24
const WANDER_SPEED = 0.11

function moveToward(agent, x, z, radius) {
  if (agent.state === 'wander') {
    agent.heading += (Math.random() - 0.5) * 0.45
  } else {
    agent.heading = Math.atan2(z - agent.z, x - agent.x)
  }

  const speed = agent.state === 'seek' ? SEEK_SPEED : WANDER_SPEED
  agent.x += Math.cos(agent.heading) * speed
  agent.z += Math.sin(agent.heading) * speed

  const distance = Math.hypot(agent.x, agent.z)
  if (distance > radius) {
    agent.x = (agent.x / distance) * radius
    agent.z = (agent.z / distance) * radius
    agent.heading += Math.PI * 0.75
  }
}

export function step(world) {
  world.tick += 1
  const births = []

  for (const agent of world.agents) {
    applyNeeds(agent)
    const intent = chooseIntent(agent, world.resources)
    agent.state = intent.kind

    if (intent.kind === 'eat') {
      consume(agent, intent.resource)
    } else {
      moveToward(agent, intent.x, intent.z, world.radius)
    }

    if (agent.energy <= 0 || agent.hunger >= 100) {
      agent.alive = false
      world.stats.deaths += 1
      continue
    }

    if (world.agents.length + births.length >= MAX_POPULATION) continue
    const child = tryReproduce(agent)
    if (child) {
      births.push(child)
      world.stats.births += 1
    }
  }

  world.agents = world.agents.filter((agent) => agent.alive).concat(births)
  world.resources = world.resources.filter((resource) => resource.amount > 1)

  if (world.tick % 12 === 0 && world.resources.length < TARGET_RESOURCES) {
    world.resources.push(createResource())
  }

  if (world.agents.length > world.stats.peakPopulation) {
    world.stats.peakPopulation = world.agents.length
  }

  return world
}
