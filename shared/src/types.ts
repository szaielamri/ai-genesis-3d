export type AgentStatus =
  | 'HUNGRY'
  | 'EATING'
  | 'SOCIALIZING'
  | 'BUILDING'
  | 'EXPLORING'
  | 'REPRODUCING'
  | 'RESEARCHING'
  | 'RESTING'

export type Gender = 'male' | 'female'

export type Era = 'Primitive' | 'Agricultural' | 'Metallurgy' | 'Industrial' | 'Digital Era'

export type BuildingType = 'hut' | 'farm' | 'workshop' | 'research_hub'

export type ResourceKind = 'food' | 'stone' | 'research'

export type FloraKind = 'tree' | 'grass'

export type EventKind = 'birth' | 'death' | 'breakthrough' | 'relationship' | 'building' | 'era'

export type SimSpeed = 1 | 2 | 5

export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface DNA {
  speed: number
  strength: number
  curiosity: number
  fertility: number
  learningRate: number
  sociality: number
}

export interface Needs {
  hunger: number
  energy: number
  social: number
  health: number
  longevity: number
}

export interface Emotions {
  pleasure: number
  arousal: number
  dominance: number
  anxiety: number
  curiosity: number
}

export interface Agent {
  id: string
  name: string
  gender: Gender
  age: number
  generation: number
  position: Vec3
  target: Vec3
  status: AgentStatus
  needs: Needs
  emotions: Emotions
  dna: DNA
  parentIds: string[]
  thought: string
  reproduceCooldown: number
  actionCooldown: number
  bonds: string[]
}

export interface Building {
  id: string
  type: BuildingType
  era: Era
  position: Vec3
  constructedTick: number
  builderName: string
}

export interface ResourceNode {
  id: string
  kind: ResourceKind
  position: Vec3
  amount: number
  capacity: number
}

export interface Flora {
  id: string
  kind: FloraKind
  position: Vec3
  scale: number
}

export interface SimEvent {
  id: string
  tick: number
  year: number
  kind: EventKind
  message: string
}

export interface SocietalStats {
  population: number
  births: number
  deaths: number
  generation: number
  techLevel: Era
  researchPoints: number
  researchProgress: number
  nextEra: Era | null
  researchTarget: number
}

export interface WorldState {
  worldId: string
  tick: number
  year: number
  dayPhase: number
  paused: boolean
  speed: SimSpeed
  era: Era
  researchPoints: number
  agents: Agent[]
  buildings: Building[]
  resources: ResourceNode[]
  flora: Flora[]
  stats: SocietalStats
  events: SimEvent[]
}
