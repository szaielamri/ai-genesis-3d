import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export default function Lighting({ phase }: { phase: number }) {
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const sun = useRef<THREE.DirectionalLight>(null)
  const moon = useRef<THREE.DirectionalLight>(null)
  const { scene } = useThree()
  const color = useMemo(() => new THREE.Color(), [])
  const day = useMemo(() => new THREE.Color('#d5e4d6'), [])
  const night = useMemo(() => new THREE.Color('#071018'), [])

  useFrame(() => {
    const elevation = Math.sin(phaseRef.current * Math.PI * 2)
    const azimuth = Math.cos(phaseRef.current * Math.PI * 2)
    if (sun.current) {
      sun.current.position.set(azimuth * 32, Math.max(elevation, -0.2) * 24 + 8, 14)
      sun.current.intensity = Math.max(0.04, elevation) * 2.5
    }
    if (moon.current) {
      moon.current.position.set(-azimuth * 26, Math.max(-elevation, 0) * 18 + 6, -12)
      moon.current.intensity = Math.max(0, -elevation) * 0.7
    }
    const blend = THREE.MathUtils.clamp((elevation + 0.2) / 1.2, 0, 1)
    color.copy(night).lerp(day, blend)
    scene.background = color
    if (scene.fog instanceof THREE.Fog) scene.fog.color.copy(color)
    else scene.fog = new THREE.Fog(color.clone(), 32, 84)
  })

  return (
    <>
      <ambientLight intensity={0.32} />
      <hemisphereLight args={['#d9efe4', '#1d3328', 0.35]} />
      <directionalLight
        ref={sun}
        color="#ffe2b8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={90}
        shadow-camera-left={-32}
        shadow-camera-right={32}
        shadow-camera-top={32}
        shadow-camera-bottom={-32}
      />
      <directionalLight ref={moon} color="#9eb6d6" />
    </>
  )
}
