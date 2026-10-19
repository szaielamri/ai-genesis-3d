import { phaseLabel, type WorldState } from 'ai-genesis-shared'
import { panel } from './panel.ts'

export default function TopBar({ state, connected }: { state: WorldState | null; connected: boolean }) {
  const year = state ? Math.floor(state.year) : 0
  const progress = Math.round((state?.stats.researchProgress ?? 0) * 100)
  const next = state?.stats.nextEra

  return (
    <header className={`pointer-events-none absolute left-3 right-3 top-3 z-10 max-w-[calc(100%-1.5rem)] px-4 py-3 ${panel}`}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <p className="font-serif text-lg tracking-[0.22em] text-[#f3f6ef]">AI GENESIS</p>
          <p className="mt-1 text-xs text-[#b7cbb8]">
            {connected ? `${state ? phaseLabel(state.dayPhase) : 'Linking'} · Year ${year}` : 'Server offline'}
          </p>
        </div>
        <dl className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
          <div>
            <dt className="uppercase tracking-[0.14em] text-[#93aa96]">Population</dt>
            <dd className="font-mono text-base text-[#f4f7f1]">{state?.stats.population ?? 0}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.14em] text-[#93aa96]">Generation</dt>
            <dd className="font-mono text-base text-[#f4f7f1]">{state?.stats.generation ?? 0}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.14em] text-[#93aa96]">Births</dt>
            <dd className="font-mono text-base text-[#f4f7f1]">{state?.stats.births ?? 0}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.14em] text-[#93aa96]">Tech</dt>
            <dd className="font-mono text-base text-[#e3b15a]">{state?.era ?? '—'}</dd>
          </div>
        </dl>
      </div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[10px] uppercase tracking-[0.16em] text-[#b7cbb8]">
          <span>Research {Math.round(state?.researchPoints ?? 0)}</span>
          <span>{next ? `${next} at ${state?.stats.researchTarget ?? 0}` : 'Digital era reached'}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[#e3b15a]" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </header>
  )
}
