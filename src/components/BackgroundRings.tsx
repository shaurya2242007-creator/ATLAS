import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MODES } from '../atlas/modes'
import type { Mode } from '../atlas/types'

// Enormous, faint concentric rings centred behind the AI core — the signature
// "the model sits inside a vast structured space" backdrop. They extend past
// the frame so they read as fading toward the edges.
const RINGS = [
  { r: 3.1, op: 0.15 }, { r: 4.2, op: 0.115 }, { r: 5.5, op: 0.085 },
  { r: 7.0, op: 0.06 }, { r: 8.8, op: 0.04 }, { r: 10.8, op: 0.025 },
]

export function BackgroundRings({ mode }: { mode: Mode }) {
  const group = useRef<THREE.Group>(null)
  const color = useMemo(() => new THREE.Color(MODES[mode].colorB), [mode])

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.z += delta * 0.008
  })

  return (
    <group ref={group} position={[0, 0, -2.8]}>
      {RINGS.map((ring, i) => (
        <mesh key={i}>
          <torusGeometry args={[ring.r, 0.007, 8, 220]} />
          <meshBasicMaterial color={color} transparent opacity={ring.op} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  )
}
