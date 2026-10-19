import type { Agent, AgentStatus } from 'ai-genesis-shared'

const LINES: Record<AgentStatus, readonly string[]> = {
  HUNGRY: ['I need food before my hands start shaking.', 'The land has to be hiding something edible.'],
  EATING: ['This will hold me together a little longer.', 'Warm food. The worry steps back.'],
  SOCIALIZING: ['Another voice makes the day smaller.', 'I want to stay near them.'],
  BUILDING: ['If this stands, the next winter will be kinder.', 'Stone and patience. That is the whole craft.'],
  EXPLORING: ['The horizon keeps moving its secrets.', 'I want to know what the far ridge is hiding.'],
  REPRODUCING: ['A new life is starting between us.', 'Our traits will not come back unchanged.'],
  RESEARCHING: ['There is a pattern in this place.', 'If I watch long enough, the world gives up a rule.'],
  RESTING: ['My legs need a moment more than my pride does.', 'Stillness is also a kind of work.'],
}

function hash(value: string): number {
  let h = 0
  for (let index = 0; index < value.length; index += 1) h = (h * 33 + value.charCodeAt(index)) >>> 0
  return h
}

export function writeThought(agent: Agent, tick: number): void {
  const lines = LINES[agent.status]
  const index = (hash(agent.id) + Math.floor(tick / 6)) % lines.length
  agent.thought = lines[index] ?? lines[0] ?? ''
}
