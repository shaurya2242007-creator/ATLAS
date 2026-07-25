import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Distant depth layer — tiny drifting stars far behind the orb so the AI reads
// as existing inside an infinite space rather than on flat black.
const COUNT = 700

function dotTexture(): THREE.CanvasTexture {
  const s = 32
  const c = document.createElement('canvas'); c.width = s; c.height = s
  const ctx = c.getContext('2d')
  if (ctx) {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.4)'); g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s)
  }
  const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t
}

export function Starfield() {
  const ref = useRef<THREE.Points>(null)
  const tex = useMemo(dotTexture, [])
  const geometry = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 26
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18
      positions[i * 3 + 2] = -5 - Math.random() * 14
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [])

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.006
      const mat = ref.current.material as THREE.PointsMaterial
      mat.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 0.4) * 0.12
    }
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.05} map={tex} color="#c9d2ff" transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation opacity={0.55} />
    </points>
  )
}
