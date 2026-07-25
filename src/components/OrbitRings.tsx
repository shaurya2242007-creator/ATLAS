import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MODES } from '../atlas/modes'
import type { Mode } from '../atlas/types'

// Faint concentric arc-reactor rings orbiting the orb (inspired by the Jarvis
// build). Thin additive toruses in the orb plane, each drifting at its own rate.
const RINGS = [
  { r: 1.5, tube: 0.006, op: 0.5, spin: 0.055 },
  { r: 2.08, tube: 0.005, op: 0.34, spin: -0.04 },
  { r: 2.75, tube: 0.008, op: 0.24, spin: 0.03 },
  { r: 3.5, tube: 0.005, op: 0.15, spin: -0.022 },
]

export function OrbitRings({ mode }: { mode: Mode }) {
  const refs = useRef<THREE.Mesh[]>([])
  const color = useMemo(() => new THREE.Color(MODES[mode].colorB), [mode])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    for (let i = 0; i < refs.current.length; i++) {
      const m = refs.current[i]
      if (m) m.rotation.z += dt * (RINGS[i]?.spin ?? 0.03)
    }
  })

  // Slight tilt so the rings read as ellipses in 3D, like the reference.
  return (
    <group rotation={[0.16, 0, 0]}>
      {RINGS.map((ring, i) => (
        <mesh key={i} ref={(el) => { if (el) refs.current[i] = el }}>
          <torusGeometry args={[ring.r, ring.tube, 8, 180]} />
          <meshBasicMaterial color={color} transparent opacity={ring.op} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  )
}
