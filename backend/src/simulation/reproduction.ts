import {
  clamp,
  distance2D,
  isWater,
  terrainHeight,
  type Agent,
  type Gender,
  type WorldState,
} from 'ai-genesis-shared'
import { pushEvent } from '../events.ts'
import { inheritDna } from '../genetics.ts'
import { nextId } from '../ids.ts'
import { takeName } from '../names.ts'
import { POPULATION_CAP } from '../world.ts'

export function areLinealKin(a: Agent, b: Agent): boolean {
  return a.parentIds.includes(b.id) || b.parentIds.includes(a.id)
}

function childNear(parentA: Agent, parentB: Agent): { x: number; z: number } {
  const x = (parentA.position.x + parentB.position.x) / 2 + (Math.random() - 0.5) * 1.2
  const z = (parentA.position.z + parentB.position.z) / 2 + (Math.random() - 0.5) * 1.2
  if (isWater(x, z)) return { x: parentA.position.x, z: parentA.position.z }
  return { x, z }
}

function makeChild(parentA: Agent, parentB: Agent): Agent {
  const [left, right] = Math.random() < 0.5 ? [parentA, parentB] : [parentB, parentA]
  const gender: Gender = Math.random() < 0.5 ? 'male' : 'female'
  const spot = childNear(parentA, parentB)
  return {
    id: nextId('agent'),
    name: takeName(gender),
    gender,
    age: 0,
    generation: Math.max(parentA.generation, parentB.generation) + 1,
    position: { x: spot.x, y: terrainHeight(spot.x, spot.z), z: spot.z },
    target: { ...parentA.position },
    status: 'RESTING',
    needs: { hunger: 76, energy: 72, social: 58, health: 97, longevity: 100 },
    emotions: { pleasure: 0.62, arousal: 0.04, dominance: 0.12, anxiety: 0.22, curiosity: 0.8 },
    dna: inheritDna(left.dna, right.dna),
    parentIds: [parentA.id, parentB.id],
    thought: 'Everything is bright, loud, and close.',
    reproduceCooldown: 0,
    actionCooldown: 10,
    bonds: [],
  }
}

export function reproduce(world: WorldState): void {
  const eligible = world.agents.filter(
    (agent) =>
      agent.age > 18 &&
      agent.needs.social > 70 &&
      agent.needs.health > 70 &&
      agent.needs.energy > 24 &&
      agent.reproduceCooldown <= 0,
  )
  const used = new Set<string>()

  for (const agent of eligible) {
    if (used.has(agent.id) || world.agents.length >= POPULATION_CAP) continue
    let partner: Agent | null = null
    let partnerDistance = 2.6
    for (const other of eligible) {
      if (other.id === agent.id || used.has(other.id) || other.gender === agent.gender || areLinealKin(agent, other)) continue
      const distance = distance2D(agent.position, other.position)
      if (distance < partnerDistance) {
        partner = other
        partnerDistance = distance
      }
    }
    if (!partner) continue
    const fertility = (agent.dna.fertility + partner.dna.fertility) / 2
    if (Math.random() > 0.2 + fertility * 0.45) continue

    const child = makeChild(agent, partner)
    world.agents.push(child)
    used.add(agent.id)
    used.add(partner.id)
    agent.status = 'REPRODUCING'
    partner.status = 'REPRODUCING'
    agent.reproduceCooldown = 18
    partner.reproduceCooldown = 18
    agent.needs.energy = clamp(agent.needs.energy - 12, 0, 100)
    partner.needs.energy = clamp(partner.needs.energy - 12, 0, 100)
    agent.needs.social = clamp(agent.needs.social - 8, 0, 100)
    partner.needs.social = clamp(partner.needs.social - 8, 0, 100)
    world.stats.births += 1
    pushEvent(
      world,
      'birth',
      `${child.name} is born to ${agent.name} and ${partner.name}. Generation ${child.generation}.`,
    )
  }
}
