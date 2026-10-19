import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { Agent, AgentStatus } from 'ai-genesis-shared'
import { Apple, Compass, FlaskConical, Hammer, Heart, Moon, Sparkles, Utensils, type LucideIcon } from 'lucide-react'
import { useRef } from 'react'
import * as THREE from 'three'

const ICONS: Record<AgentStatus, LucideIcon> = {
  HUNGRY: Utensils,
  EATING: Apple,
  SOCIALIZING: Heart,
  BUILDING: Hammer,
  EXPLORING: Compass,
  REPRODUCING: Sparkles,
  RESEARCHING: FlaskConical,
  RESTING: Moon,
}

const SKINS = ['#f0d2b4', '#e0b08a', '#c48658', '#8d5524', '#f3ddc8']

function hash(value: string): number {
  let h = 0
  for (let index = 0; index < value.length; index += 1) h = (h * 33 + value.charCodeAt(index)) >>> 0
  return h
}

function Figure({ agent }: { agent: Agent }) {
  const male = agent.gender === 'male'
  const skin = SKINS[hash(agent.id) % SKINS.length] ?? SKINS[0]
  const cloth = `hsl(${hash(agent.name) % 360}, 38%, ${male ? 36 : 44}%)`
  return (
    <group>
      <mesh position={[-0.1, 0.16, 0]} castShadow>
        <boxGeometry args={[0.09, 0.32, 0.09]} />
        <meshStandardMaterial color={skin} roughness={0.7} />
      </mesh>
      <mesh position={[0.1, 0.16, 0]} castShadow>
        <boxGeometry args={[0.09, 0.32, 0.09]} />
        <meshStandardMaterial color={skin} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.46, 0]} castShadow>
        <boxGeometry args={[male ? 0.42 : 0.34, 0.42, 0.22]} />
        <meshStandardMaterial color={cloth} roughness={0.75} />
      </mesh>
      <mesh position={[-0.24, 0.46, 0]} castShadow>
        <boxGeometry args={[0.08, 0.28, 0.08]} />
        <meshStandardMaterial color={skin} roughness={0.7} />
      </mesh>
      <mesh position={[0.24, 0.46, 0]} castShadow>
        <boxGeometry args={[0.08, 0.28, 0.08]} />
        <meshStandardMaterial color={skin} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.15, 12, 10]} />
        <meshStandardMaterial color={skin} roughness={0.62} />
      </mesh>
    </group>
  )
}

function AgentBody({
  agent,
  selected,
  speed,
  onSelect,
}: {
  agent: Agent
  selected: boolean
  speed: number
  onSelect: (id: string) => void
}) {
  const group = useRef<THREE.Group>(null)
  const displayed = useRef(new THREE.Vector3(agent.position.x, agent.position.y, agent.position.z))
  const goal = useRef(new THREE.Vector3())
  const Icon = ICONS[agent.status]
  const stature = agent.age < 18 ? 0.5 + (agent.age / 18) * 0.28 : agent.gender === 'male' ? 1 : 0.94

  useFrame((state, delta) => {
    const mesh = group.current
    if (!mesh) return
    goal.current.set(agent.position.x, agent.position.y, agent.position.z)
    displayed.current.lerp(goal.current, 1 - Math.exp(-delta * (3.4 + speed * 1.5)))
    const dx = displayed.current.x - mesh.position.x
    const dz = displayed.current.z - mesh.position.z
    if (dx * dx + dz * dz > 0.00003) mesh.rotation.y = Math.atan2(dx, dz)
    mesh.position.copy(displayed.current)
    if (agent.status !== 'RESTING' && agent.status !== 'EATING') {
      mesh.position.y += Math.sin(state.clock.elapsedTime * 6.5 + agent.position.x) * 0.03
    }
  })

  return (
    <group
      ref={group}
      position={[agent.position.x, agent.position.y, agent.position.z]}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(agent.id)
      }}
      onPointerOver={(event) => {
        event.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
      }}
    >
      <group scale={stature}>
        <Figure agent={agent} />
      </group>
      {selected ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
          <ringGeometry args={[0.42, 0.52, 28]} />
          <meshBasicMaterial color="#e3b15a" />
        </mesh>
      ) : null}
      <Html position={[0, stature * 1.15 + 0.28, 0]} center distanceFactor={16} zIndexRange={[8, 0]} style={{ pointerEvents: 'none' }}>
        <div className="rounded-full border border-white/20 bg-black/55 p-1 text-emerald-100">
          <Icon size={13} />
        </div>
      </Html>
    </group>
  )
}

export default function Agents({
  agents,
  selectedId,
  speed,
  onSelect,
}: {
  agents: Agent[]
  selectedId: string | null
  speed: number
  onSelect: (id: string) => void
}) {
  return (
    <group>
      {agents.map((agent) => (
        <AgentBody key={agent.id} agent={agent} selected={agent.id === selectedId} speed={speed} onSelect={onSelect} />
      ))}
    </group>
  )
}
