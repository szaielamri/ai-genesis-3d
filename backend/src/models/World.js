import { createAgent, resetAgentIds } from './Agent.js'

export const WORLD_RADIUS = 16

export function createResource(partial = {}) {
  const angle = Math.random() * Math.PI * 2
  const radius = Math.sqrt(Math.random()) * (WORLD_RADIUS - 1.5)
  return {
    id: partial.id ?? `r${Math.random().toString(36).slice(2, 9)}`,
    x: partial.x ?? Math.cos(angle) * radius,
    z: partial.z ?? Math.sin(angle) * radius,
    amount: partial.amount ?? 36 + Math.random() * 16,
  }
}

export function createWorld() {
  resetAgentIds()
  const agents = Array.from({ length: 14 }, () => {
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * 7
    return createAgent({
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
    })
  })

  return {
    tick: 0,
    radius: WORLD_RADIUS,
    paused: false,
    agents,
    resources: Array.from({ length: 26 }, () => createResource()),
    stats: {
      births: 0,
      deaths: 0,
      peakPopulation: agents.length,
    },
  }
}
