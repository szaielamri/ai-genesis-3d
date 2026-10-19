import { useEffect, useState } from 'react'
import Controls from './components/hud/Controls.tsx'
import EventLog from './components/hud/EventLog.tsx'
import Inspector from './components/hud/Inspector.tsx'
import TopBar from './components/hud/TopBar.tsx'
import WorldCanvas from './components/WorldCanvas.tsx'
import { useSimulation } from './hooks/useSimulation.ts'

export default function App() {
  const { state, connected, pause, resume, reset, setSpeed } = useSimulation()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = state?.agents.find((agent) => agent.id === selectedId) ?? null

  useEffect(() => {
    if (selectedId && state && !state.agents.some((agent) => agent.id === selectedId)) {
      setSelectedId(null)
    }
  }, [selectedId, state])

  return (
    <main className="relative h-full w-full overflow-hidden bg-[#07110e] text-[#e7efe8]">
      <WorldCanvas state={state} selectedId={selected?.id ?? null} onSelect={setSelectedId} />
      <TopBar state={state} connected={connected} />
      <EventLog events={state?.events ?? []} />
      <Controls
        paused={Boolean(state?.paused)}
        speed={state?.speed ?? 1}
        connected={connected}
        onPause={pause}
        onResume={resume}
        onSpeed={setSpeed}
        onReset={reset}
      />
      {selected && state ? (
        <Inspector agent={selected} world={state} onClose={() => setSelectedId(null)} onSelect={setSelectedId} />
      ) : null}
    </main>
  )
}
