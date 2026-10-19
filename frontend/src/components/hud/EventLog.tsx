import type { EventKind, SimEvent } from 'ai-genesis-shared'
import { panel } from './panel.ts'

const COLORS: Record<EventKind, string> = {
  birth: 'bg-emerald-300',
  death: 'bg-rose-400',
  breakthrough: 'bg-amber-300',
  relationship: 'bg-sky-300',
  building: 'bg-orange-200',
  era: 'bg-[#d7e7c8]',
}

export default function EventLog({ events }: { events: SimEvent[] }) {
  return (
    <aside className={`absolute bottom-3 left-3 z-10 w-[min(22rem,calc(100%-1.5rem))] px-3 py-3 ${panel}`}>
      <h2 className="text-[11px] uppercase tracking-[0.18em] text-[#d7e7c8]">Live chronicle</h2>
      <ol className="scroll-thin mt-2 flex max-h-52 flex-col gap-2 overflow-y-auto pr-1">
        {events.length === 0 ? <li className="text-sm text-[#93aa96]">Waiting for the first season.</li> : null}
        {events.map((event) => (
          <li key={event.id} className="flex gap-2 text-sm leading-snug text-[#e7efe8]">
            <i className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${COLORS[event.kind]}`} />
            <span>
              <span className="mr-2 font-mono text-[10px] text-[#93aa96]">Y{Math.floor(event.year)}</span>
              {event.message}
            </span>
          </li>
        ))}
      </ol>
    </aside>
  )
}
