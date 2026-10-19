import type { Building, BuildingType, Flora, ResourceNode } from 'ai-genesis-shared'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

function Trees({ trees }: { trees: Flora[] }) {
  return (
    <group>
      {trees.map((tree) => (
        <group key={tree.id} position={[tree.position.x, tree.position.y, tree.position.z]} scale={tree.scale}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 0.7, 6]} />
            <meshStandardMaterial color="#6b4a32" roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.05, 0]} castShadow>
            <coneGeometry args={[0.55, 1.15, 7]} />
            <meshStandardMaterial color="#1f6b45" roughness={0.85} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Grass({ grass, worldId }: { grass: Flora[]; worldId: string }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const key = `${worldId}:${grass.length}`
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const geometry = useMemo(() => new THREE.ConeGeometry(0.08, 0.28, 4), [])
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#7ea86a', roughness: 1 }), [])

  useLayoutEffect(() => {
    const instances = mesh.current
    if (!instances) return
    grass.forEach((tuft, index) => {
      dummy.position.set(tuft.position.x, tuft.position.y, tuft.position.z)
      dummy.scale.set(tuft.scale, tuft.scale * 1.4, tuft.scale)
      dummy.rotation.y = tuft.scale * 12
      dummy.updateMatrix()
      instances.setMatrixAt(index, dummy.matrix)
    })
    instances.instanceMatrix.needsUpdate = true
  }, [grass, dummy, key])

  if (grass.length === 0) return null
  return <instancedMesh ref={mesh} args={[geometry, material, grass.length]} />
}

function Food({ node }: { node: ResourceNode }) {
  const scale = 0.25 + Math.min(node.amount, node.capacity) / node.capacity * 0.35
  return (
    <mesh position={[node.position.x, node.position.y + scale, node.position.z]} castShadow scale={scale}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#c4553a" emissive="#5a2014" emissiveIntensity={0.25} flatShading />
    </mesh>
  )
}

function Stone({ node }: { node: ResourceNode }) {
  return (
    <mesh position={[node.position.x, node.position.y + 0.28, node.position.z]} castShadow scale={0.45}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#8d9188" roughness={0.92} flatShading />
    </mesh>
  )
}

function Research({ node }: { node: ResourceNode }) {
  const glow = node.amount > 1 ? 0.8 : 0.15
  return (
    <group position={[node.position.x, node.position.y, node.position.z]}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.28, 1.4, 5]} />
        <meshStandardMaterial color="#d7c7a1" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <octahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial color="#e3b15a" emissive="#e3b15a" emissiveIntensity={glow} />
      </mesh>
    </group>
  )
}

function Structure({ building }: { building: Building }) {
  const position: [number, number, number] = [building.position.x, building.position.y, building.position.z]
  return (
    <group position={position}>
      <BuildingShape type={building.type} />
    </group>
  )
}

function BuildingShape({ type }: { type: BuildingType }) {
  if (type === 'hut') {
    return (
      <group>
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.5, 0.7, 7]} />
          <meshStandardMaterial color="#a9744f" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.95, 0]} castShadow>
          <coneGeometry args={[0.62, 0.55, 7]} />
          <meshStandardMaterial color="#6e4630" flatShading />
        </mesh>
      </group>
    )
  }
  if (type === 'farm') {
    return (
      <group>
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[1.8, 1.8]} />
          <meshStandardMaterial color="#c4a15a" />
        </mesh>
        <mesh position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[0.7, 0.45, 0.45]} />
          <meshStandardMaterial color="#8c5a34" />
        </mesh>
      </group>
    )
  }
  if (type === 'workshop') {
    return (
      <group>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[1.1, 0.9, 0.8]} />
          <meshStandardMaterial color="#5d646c" metalness={0.35} roughness={0.55} />
        </mesh>
        <mesh position={[0.35, 1.15, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.6, 6]} />
          <meshStandardMaterial color="#3e444a" />
        </mesh>
      </group>
    )
  }
  return (
    <group>
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.9, 1.4, 0.9]} />
        <meshStandardMaterial color="#24362f" metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <torusGeometry args={[0.38, 0.05, 8, 18]} />
        <meshStandardMaterial color="#7dcea0" emissive="#7dcea0" emissiveIntensity={0.7} />
      </mesh>
    </group>
  )
}

export default function Props({
  worldId,
  flora,
  resources,
  buildings,
}: {
  worldId: string
  flora: Flora[]
  resources: ResourceNode[]
  buildings: Building[]
}) {
  const trees = flora.filter((item) => item.kind === 'tree')
  const grass = flora.filter((item) => item.kind === 'grass')
  return (
    <group>
      <Trees trees={trees} />
      <Grass grass={grass} worldId={worldId} />
      {resources.map((node) => {
        if (node.kind === 'food') return <Food key={node.id} node={node} />
        if (node.kind === 'stone') return <Stone key={node.id} node={node} />
        return <Research key={node.id} node={node} />
      })}
      {buildings.map((building) => (
        <Structure key={building.id} building={building} />
      ))}
    </group>
  )
}
