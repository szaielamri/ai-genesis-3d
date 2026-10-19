import { terrainHeight, WORLD_HALF } from 'ai-genesis-shared'
import { useMemo } from 'react'
import * as THREE from 'three'

export default function Terrain() {
  const geometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(WORLD_HALF * 2, WORLD_HALF * 2, 72, 72)
    geom.rotateX(-Math.PI / 2)
    const positions = geom.attributes.position
    if (!positions) return geom
    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index)
      const z = positions.getZ(index)
      positions.setY(index, terrainHeight(x, z))
    }
    geom.computeVertexNormals()
    return geom
  }, [])

  return (
    <group>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial color="#3d6a48" roughness={0.96} metalness={0} flatShading />
      </mesh>
      <mesh geometry={geometry}>
        <meshBasicMaterial color="#c5d7c4" wireframe transparent opacity={0.07} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.16, 0]}>
        <planeGeometry args={[WORLD_HALF * 2.35, WORLD_HALF * 2.35]} />
        <meshStandardMaterial color="#176874" transparent opacity={0.72} roughness={0.08} metalness={0.2} />
      </mesh>
    </group>
  )
}
