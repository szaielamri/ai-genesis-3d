import Hud from './components/Hud.jsx'
import WorldCanvas from './components/WorldCanvas.jsx'
import { useSimulation } from './hooks/useSimulation.js'

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001'

export default function App() {
  const { state, connected, pause, resume, reset } = useSimulation(SERVER_URL)

  return (
    <main className="app">
      <WorldCanvas state={state} />
      <Hud state={state} connected={connected} onPause={pause} onResume={resume} onReset={reset} />
    </main>
  )
}
