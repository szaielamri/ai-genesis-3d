let nextId = 1

export function resetAgentIds() {
  nextId = 1
}

export function createAgent(partial = {}) {
  return {
    id: partial.id ?? `a${nextId++}`,
    x: partial.x ?? 0,
    z: partial.z ?? 0,
    heading: partial.heading ?? Math.random() * Math.PI * 2,
    energy: partial.energy ?? 62,
    hunger: partial.hunger ?? 18,
    age: partial.age ?? 0,
    generation: partial.generation ?? 1,
    hue: partial.hue ?? Math.floor(Math.random() * 360),
    alive: true,
    state: 'wander',
  }
}
