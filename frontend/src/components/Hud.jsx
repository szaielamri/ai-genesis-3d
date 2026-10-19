function average(agents, key) {
  if (!agents.length) return 0
  const total = agents.reduce((sum, agent) => sum + agent[key], 0)
  return Math.round(total / agents.length)
}

export default function Hud({ state, connected, onPause, onResume, onReset }) {
  const agents = state?.agents ?? []
  const paused = Boolean(state?.paused)
  const extinct = state && agents.length === 0

  return (
    <aside className="hud">
      <h1>AI GENESIS</h1>
      <p>Agents forage, spend energy, and pass a shifted hue to their offspring.</p>
      <div className={connected ? 'status live' : 'status'}>
        <i />
        {connected ? (paused ? 'Paused' : 'Live') : 'Server offline'}
      </div>
      <div className="stats">
        <div>
          <span>Population</span>
          <strong>{agents.length}</strong>
        </div>
        <div>
          <span>Tick</span>
          <strong>{state?.tick ?? 0}</strong>
        </div>
        <div>
          <span>Births</span>
          <strong>{state?.stats.births ?? 0}</strong>
        </div>
        <div>
          <span>Deaths</span>
          <strong>{state?.stats.deaths ?? 0}</strong>
        </div>
        <div>
          <span>Avg hunger</span>
          <strong>{average(agents, 'hunger')}</strong>
        </div>
        <div>
          <span>Avg energy</span>
          <strong>{average(agents, 'energy')}</strong>
        </div>
      </div>
      {extinct ? <p className="note">The colony collapsed. Reset to seed a new one.</p> : null}
      <div className="actions">
        {paused ? (
          <button type="button" onClick={onResume}>
            Resume
          </button>
        ) : (
          <button type="button" onClick={onPause}>
            Pause
          </button>
        )}
        <button type="button" className="ghost" onClick={onReset}>
          Reset
        </button>
      </div>
    </aside>
  )
}
