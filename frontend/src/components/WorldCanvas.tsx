import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { Agent, WorldState } from 'ai-genesis-shared'
import { useRef } from 'react'
import * as THREE from 'three'
import Agents from './scene/Agents.tsx'
import Lighting from './scene/Lighting.tsx'
import Props from './scene/Props.tsx'
import Terrain from './scene/Terrain.tsx'

function Follow({ agent }: { agent: Agent | null }) {
  const controls = useThree((state) => state.controls) as { target: THREE.Vector3 } | null
  const goal = useRef(new THREE.Vector3())
  useFrame(() => {
    if (!agent || !controls) return
    goal.current.set(agent.position.x, agent.position.y + 1.1, agent.position.z)
    controls.target.lerp(goal.current, 0.12)
  })
  return null
}

export default function WorldCanvas({
  state,
  selectedId,
  onSelect,
}: {
  state: WorldState | null
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const selected = state?.agents.find((agent) => agent.id === selectedId) ?? null

  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        camera={{ position: [26, 18, 26], fov: 42 }}
        onPointerMissed={() => onSelect(null)}
      >
        <Lighting phase={state?.dayPhase ?? 0.28} />
        <Terrain />
        {state ? (
          <Props worldId={state.worldId} flora={state.flora} resources={state.resources} buildings={state.buildings} />
        ) : null}
        <Agents agents={state?.agents ?? []} selectedId={selectedId} speed={state?.speed ?? 1} onSelect={onSelect} />
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          enablePan
          maxPolarAngle={Math.PI / 2.08}
          minDistance={5}
          maxDistance={68}
          target={[0, 1, 0]}
        />
        <Follow agent={selected} />
      </Canvas>
    </div>
  )
}
