import { clamp, distance2D, type Agent, type WorldState } from 'ai-genesis-shared'

function approach(current: number, target: number, rate = 0.18): number {
  return clamp(current + (target - current) * rate, 0, 1)
}

export function updateEmotions(agent: Agent, world: WorldState): void {
  const mateNearby = world.agents.some(
    (other) => other.id !== agent.id && other.gender !== agent.gender && other.age > 18 && distance2D(agent.position, other.position) < 4,
  )
  const hungry = agent.needs.hunger < 30
  const pleasureTarget =
    agent.status === 'EATING' || agent.status === 'REPRODUCING' || agent.status === 'SOCIALIZING'
      ? 0.82
      : hungry
        ? 0.18
        : 0.48
  const anxietyTarget = clamp((hungry ? 0.45 : 0) + (100 - agent.needs.health) / 180 + (agent.needs.social < 25 ? 0.3 : 0), 0, 1)
  agent.emotions.pleasure = approach(agent.emotions.pleasure, pleasureTarget)
  agent.emotions.arousal = approach(agent.emotions.arousal, mateNearby ? 0.55 + agent.dna.fertility * 0.35 : 0.12)
  agent.emotions.dominance = approach(
    agent.emotions.dominance,
    agent.dna.strength * (agent.needs.health / 100) * (agent.age > 18 ? 1 : 0.35),
  )
  agent.emotions.anxiety = approach(agent.emotions.anxiety, anxietyTarget)
  agent.emotions.curiosity = approach(
    agent.emotions.curiosity,
    agent.status === 'RESEARCHING' || agent.status === 'EXPLORING' ? Math.max(agent.dna.curiosity, 0.75) : agent.dna.curiosity * 0.85,
  )
}
