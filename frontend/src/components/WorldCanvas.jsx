import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

function AgentMesh({ agent }) {
  const ref = useRef(null)
  const position = useRef(new THREE.Vector3(agent.x, 0.35, agent.z))
  const color = new THREE.Color(`hsl(${agent.hue}, 72%, 62%)`)

  useFrame((_, delta) => {
    const mesh = ref.current
    if (!mesh) return
    position.current.x += (agent.x - position.current.x) * Math.min(1, delta * 8)
    position.current.z += (agent.z - position.current.z) * Math.min(1, delta * 8)
    position.current.y = 0.38 + Math.sin(agent.age * 0.18) * 0.06
    mesh.position.copy(position.current)
    mesh.rotation.y = agent.heading
  })

  const scale = 0.28 + (agent.energy / 100) * 0.16

  return (
    <mesh ref={ref} scale={scale} castShadow>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} roughness={0.35} />
    </mesh>
  )
}

function ResourceMesh({ resource }) {
  const height = 0.15 + Math.min(resource.amount, 50) / 90
  return (
    <mesh position={[resource.x, height, resource.z]}>
      <octahedronGeometry args={[height, 0]} />
      <meshStandardMaterial color="#e3b15a" emissive="#8a5a12" emissiveIntensity={0.35} roughness={0.4} />
    </mesh>
  )
}

function Arena({ radius }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[radius + 0.4, 80]} />
        <meshStandardMaterial color="#102018" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[radius - 0.08, radius + 0.08, 80]} />
        <meshBasicMaterial color="#7dcea0" transparent opacity={0.45} />
      </mesh>
      <gridHelper args={[radius * 2, 16, '#1e3a2c', '#163024']} position={[0, 0.02, 0]} />
    </group>
  )
}

export default function WorldCanvas({ state }) {
  const agents = state?.agents ?? []
  const resources = state?.resources ?? []
  const radius = state?.radius ?? 16

  return (
    <div className="canvas-wrap">
      <Canvas camera={{ position: [18, 14, 18], fov: 42 }} shadows>
        <color attach="background" args={['#07110d']} />
        <fog attach="fog" args={['#07110d', 22, 48]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[8, 14, 6]} intensity={1.4} castShadow />
        <pointLight position={[0, 6, 0]} color="#7dcea0" intensity={8} distance={28} />
        <Arena radius={radius} />
        {resources.map((resource) => (
          <ResourceMesh key={resource.id} resource={resource} />
        ))}
        {agents.map((agent) => (
          <AgentMesh key={agent.id} agent={agent} />
        ))}
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.15} minDistance={8} maxDistance={36} />
      </Canvas>
    </div>
  )
}
