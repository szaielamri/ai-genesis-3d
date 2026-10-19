import type { SimSpeed } from 'ai-genesis-shared'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { panel } from './panel.ts'

const SPEEDS: SimSpeed[] = [1, 2, 5]

export default function Controls({
  paused,
  speed,
  connected,
  onPause,
  onResume,
  onSpeed,
  onReset,
}: {
  paused: boolean
  speed: SimSpeed
  connected: boolean
  onPause: () => void
  onResume: () => void
  onSpeed: (speed: SimSpeed) => void
  onReset: () => void
}) {
  return (
    <div className={`absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 px-2 py-2 ${panel}`}>
      <button
        type="button"
        disabled={!connected}
        onClick={paused ? onResume : onPause}
        className="inline-flex items-center gap-2 rounded-full bg-[#d7e7c8] px-3 py-2 text-xs font-semibold text-[#102117] disabled:opacity-40"
        aria-label={paused ? 'Resume simulation' : 'Pause simulation'}
      >
        {paused ? <Play size={14} /> : <Pause size={14} />}
        {paused ? 'Play' : 'Pause'}
      </button>
      {SPEEDS.map((value) => (
        <button
          key={value}
          type="button"
          disabled={!connected}
          onClick={() => onSpeed(value)}
          className={`rounded-full px-3 py-2 font-mono text-xs disabled:opacity-40 ${
            speed === value ? 'bg-white/15 text-[#f4f7f1]' : 'text-[#b7cbb8]'
          }`}
        >
          {value}x
        </button>
      ))}
      <button
        type="button"
        disabled={!connected}
        onClick={onReset}
        className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs text-[#d7e7c8] disabled:opacity-40"
        aria-label="Reset simulation"
      >
        <RotateCcw size={14} />
        Reset
      </button>
    </div>
  )
}
