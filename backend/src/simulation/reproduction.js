import { createAgent } from '../models/Agent.js'

const MIN_AGE = 70
const MIN_ENERGY = 68
const MAX_HUNGER = 36
const ENERGY_COST = 26

export function tryReproduce(agent) {
  if (agent.age < MIN_AGE || agent.energy < MIN_ENERGY || agent.hunger > MAX_HUNGER) {
    return null
  }
  if (Math.random() > 0.012) return null

  agent.energy -= ENERGY_COST
  agent.state = 'reproduce'

  const angle = Math.random() * Math.PI * 2
  return createAgent({
    x: agent.x + Math.cos(angle) * 0.9,
    z: agent.z + Math.sin(angle) * 0.9,
    heading: angle,
    energy: 52,
    hunger: 12,
    generation: agent.generation + 1,
    hue: (agent.hue + (Math.random() * 40 - 20) + 360) % 360,
  })
}
