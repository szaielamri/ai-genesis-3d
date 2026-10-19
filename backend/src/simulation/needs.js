const HUNGER_GAIN = 0.28
const ENERGY_DECAY = 0.055
const SEEK_HUNGER = 42
const EAT_RADIUS = 0.8

export function applyNeeds(agent) {
  agent.age += 1
  agent.hunger = Math.min(100, agent.hunger + HUNGER_GAIN)
  agent.energy = Math.max(0, agent.energy - ENERGY_DECAY)
}

export function chooseIntent(agent, resources) {
  if (agent.hunger < SEEK_HUNGER || resources.length === 0) {
    return {
      kind: 'wander',
      x: agent.x + Math.cos(agent.heading) * 3,
      z: agent.z + Math.sin(agent.heading) * 3,
    }
  }

  let best = null
  let bestScore = Infinity
  for (const resource of resources) {
    const dist = Math.hypot(resource.x - agent.x, resource.z - agent.z)
    const score = dist + Math.random() * 1.4
    if (score < bestScore) {
      bestScore = score
      best = { resource, dist }
    }
  }

  if (!best) {
    return { kind: 'wander', x: agent.x, z: agent.z }
  }

  if (best.dist <= EAT_RADIUS) {
    return { kind: 'eat', resource: best.resource }
  }

  return { kind: 'seek', x: best.resource.x, z: best.resource.z }
}

export function consume(agent, resource) {
  const bite = Math.min(6, resource.amount)
  resource.amount -= bite
  agent.hunger = Math.max(0, agent.hunger - bite * 1.15)
  agent.energy = Math.min(100, agent.energy + bite * 0.85)
}
