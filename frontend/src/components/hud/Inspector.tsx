import { DNA_GENES, type Agent, type WorldState } from 'ai-genesis-shared'
import { X } from 'lucide-react'
import { panel } from './panel.ts'

function Meter({ label, value, max, warn }: { label: string; value: number; max: number; warn?: boolean }) {
  const width = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] uppercase tracking-[0.14em] text-[#b7cbb8]">
        <span>{label}</span>
        <span className="font-mono">{max === 1 ? value.toFixed(2) : Math.round(value)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${warn ? 'bg-rose-400' : 'bg-[#8fceb0]'}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}

export default function Inspector({
  agent,
  world,
  onClose,
  onSelect,
}: {
  agent: Agent
  world: WorldState
  onClose: () => void
  onSelect: (id: string) => void
}) {
  const parents = agent.parentIds
    .map((id) => world.agents.find((person) => person.id === id))
    .filter((person): person is Agent => Boolean(person))
  const children = world.agents.filter((person) => person.parentIds.includes(agent.id))
  const bonds = agent.bonds
    .map((id) => world.agents.find((person) => person.id === id))
    .filter((person): person is Agent => Boolean(person))

  return (
    <aside className={`scroll-thin absolute bottom-24 right-3 top-24 z-10 w-[min(22rem,calc(100%-1.5rem))] overflow-y-auto px-4 py-4 ${panel}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#93aa96]">{agent.status.toLowerCase()}</p>
          <h2 className="font-serif text-2xl text-[#f4f7f1]">{agent.name}</h2>
          <p className="mt-1 text-xs text-[#b7cbb8]">
            {agent.gender} · age {Math.floor(agent.age)} · generation {agent.generation}
          </p>
        </div>
        <button type="button" onClick={onClose} className="rounded-full p-1 text-[#d7e7c8]" aria-label="Close inspector">
          <X size={16} />
        </button>
      </div>

      <blockquote className="mt-4 border-l-2 border-[#e3b15a] pl-3 text-sm italic text-[#e7efe8]">“{agent.thought}”</blockquote>

      <section className="mt-5 space-y-2">
        <h3 className="text-[10px] uppercase tracking-[0.16em] text-[#d7e7c8]">Needs</h3>
        <Meter label="Hunger" value={agent.needs.hunger} max={100} warn={agent.needs.hunger < 20} />
        <Meter label="Energy" value={agent.needs.energy} max={100} warn={agent.needs.energy < 20} />
        <Meter label="Social" value={agent.needs.social} max={100} />
        <Meter label="Health" value={agent.needs.health} max={100} warn={agent.needs.health < 30} />
        <Meter label="Longevity" value={agent.needs.longevity} max={100} warn={agent.needs.longevity < 20} />
      </section>

      <section className="mt-5 space-y-2">
        <h3 className="text-[10px] uppercase tracking-[0.16em] text-[#d7e7c8]">Emotions</h3>
        <Meter label="Pleasure" value={agent.emotions.pleasure} max={1} />
        <Meter label="Arousal" value={agent.emotions.arousal} max={1} />
        <Meter label="Dominance" value={agent.emotions.dominance} max={1} />
        <Meter label="Anxiety" value={agent.emotions.anxiety} max={1} warn={agent.emotions.anxiety > 0.7} />
        <Meter label="Curiosity" value={agent.emotions.curiosity} max={1} />
      </section>

      <section className="mt-5 space-y-2">
        <h3 className="text-[10px] uppercase tracking-[0.16em] text-[#d7e7c8]">DNA</h3>
        {DNA_GENES.map((gene) => (
          <Meter key={gene} label={gene} value={agent.dna[gene]} max={1} />
        ))}
      </section>

      <section className="mt-5">
        <h3 className="text-[10px] uppercase tracking-[0.16em] text-[#d7e7c8]">Lineage</h3>
        <div className="mt-3 flex flex-col items-center gap-2 text-sm">
          <div className="flex flex-wrap justify-center gap-2">
            {parents.length === 0 ? <span className="rounded-full bg-white/5 px-3 py-1 text-[#b7cbb8]">Founder</span> : null}
            {parents.map((parent) => (
              <button key={parent.id} type="button" onClick={() => onSelect(parent.id)} className="rounded-full bg-white/10 px-3 py-1">
                {parent.name}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-white/25" />
          <div className="rounded-full border border-[#e3b15a]/60 px-3 py-1">{agent.name}</div>
          <div className="h-4 w-px bg-white/25" />
          <div className="flex flex-wrap justify-center gap-2">
            {children.length === 0 ? <span className="text-xs text-[#93aa96]">No children yet</span> : null}
            {children.map((child) => (
              <button key={child.id} type="button" onClick={() => onSelect(child.id)} className="rounded-full bg-white/10 px-3 py-1">
                {child.name}
              </button>
            ))}
          </div>
        </div>
        {bonds.length > 0 ? (
          <p className="mt-3 text-xs text-[#b7cbb8]">Bonds: {bonds.map((bond) => bond.name).join(', ')}</p>
        ) : null}
      </section>
    </aside>
  )
}
