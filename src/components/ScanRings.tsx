import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MODES } from '../atlas/modes'
import type { Mode } from '../atlas/types'

// Energy pulses — rings that expand out of the core and fade, on a staggered
// loop, so the AI reads as actively "scanning" / emitting.
const N = 3
const BASE_R = 1.15
const GROW = 2.6
const SPEED = 0.32

export function ScanRings({ mode }: { mode: Mode }) {
  const refs = useRef<THREE.Mesh[]>([])
  const color = useMemo(() => new THREE.Color(MODES[mode].colorB), [mode])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < N; i++) {
      const m = refs.current[i]
      if (!m) continue
      const phase = ((t * SPEED) + i / N) % 1
      const scale = (BASE_R + phase * GROW) / BASE_R
      m.scale.setScalar(scale)
      const mat = m.material as THREE.MeshBasicMaterial
      mat.opacity = (1 - phase) * 0.3
    }
  })

  return (
    <group rotation={[0.16, 0, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(el) => { if (el) refs.current[i] = el }}>
          <torusGeometry args={[BASE_R, 0.01, 8, 140]} />
          <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  )
}
