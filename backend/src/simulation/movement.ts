import { clamp, distance2D, isWater, terrainHeight, type Agent } from 'ai-genesis-shared'

const STILL = new Set<Agent['status']>(['RESTING', 'EATING', 'REPRODUCING'])

export function moveAgent(agent: Agent): void {
  const distance = distance2D(agent.position, agent.target)
  const arrived =
    distance < 0.85 &&
    (agent.status === 'BUILDING' || agent.status === 'RESEARCHING' || agent.status === 'SOCIALIZING' || agent.status === 'HUNGRY')
  if (STILL.has(agent.status) || arrived) {
    agent.position.y = terrainHeight(agent.position.x, agent.position.z)
    return
  }

  if (distance < 0.12) {
    agent.position.y = terrainHeight(agent.position.x, agent.position.z)
    return
  }

  const speed = 0.42 + agent.dna.speed * 1.15
  const step = Math.min(speed, distance)
  const nx = agent.position.x + ((agent.target.x - agent.position.x) / distance) * step
  const nz = agent.position.z + ((agent.target.z - agent.position.z) / distance) * step
  if (isWater(nx, nz)) {
    const side = Math.random() < 0.5 ? 1 : -1
    const sx = agent.position.x + (-(agent.target.z - agent.position.z) / distance) * side
    const sz = agent.position.z + ((agent.target.x - agent.position.x) / distance) * side
    if (!isWater(sx, sz)) {
      agent.position.x = sx
      agent.position.z = sz
      agent.position.y = terrainHeight(sx, sz)
      agent.needs.energy = clamp(agent.needs.energy - 0.45, 0, 100)
    }
    return
  }

  agent.position.x = nx
  agent.position.z = nz
  agent.position.y = terrainHeight(nx, nz)
  const effort = (1.05 + agent.dna.speed * 0.75) * (1.2 - agent.dna.strength * 0.45)
  agent.needs.energy = clamp(agent.needs.energy - effort, 0, 100)
}
