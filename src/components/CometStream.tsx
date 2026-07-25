import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MODES } from '../atlas/modes'
import type { Mode } from '../atlas/types'

// A comet-tail of particles streaming in from the left and converging into a
// bright node on the orb's edge (the signature look from the reference).
const COUNT = 1500
const X_START = -5.6   // far off-screen left
const X_END = -0.95    // converges at the orb's left edge

interface P { t: number; sy: number; sz: number; speed: number }

export function CometStream({ mode }: { mode: Mode }) {
  const color = useMemo(() => new THREE.Color(MODES[mode].colorA), [mode])

  const { geometry, data } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const data: P[] = new Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      data[i] = { t: Math.random(), sy: (Math.random() - 0.5) * 2, sz: (Math.random() - 0.5) * 2, speed: 0.16 + Math.random() * 0.28 }
    }
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return { geometry: geom, data }
  }, [])

  const tex = useMemo(() => {
    const s = 64
    const c = document.createElement('canvas'); c.width = s; c.height = s
    const ctx = c.getContext('2d')
    if (ctx) {
      const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g; ctx.fillRect(0, 0, s, s)
    }
    const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t
  }, [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const pos = geometry.getAttribute('position') as THREE.BufferAttribute
    const arr = pos.array as Float32Array
    for (let i = 0; i < COUNT; i++) {
      const d = data[i]
      d.t += dt * d.speed
      if (d.t > 1) { d.t -= 1; d.sy = (Math.random() - 0.5) * 2; d.sz = (Math.random() - 0.5) * 2 }
      const t = d.t
      const conv = 1 - t                       // spread narrows as particles approach the orb
      const spread = 0.12 + conv * 1.25
      arr[i * 3] = X_START + t * (X_END - X_START)
      arr[i * 3 + 1] = d.sy * spread
      arr[i * 3 + 2] = d.sz * spread
    }
    pos.needsUpdate = true
  })

  return (
    <group>
      <points geometry={geometry}>
        <pointsMaterial size={0.056} map={tex} color={color} transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation opacity={0.72} />
      </points>
      {/* soft convergence node where the trail meets the orb */}
      <sprite position={[X_END, 0, 0]} scale={[0.95, 0.95, 1]}>
        <spriteMaterial map={tex} color={color} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.8} />
      </sprite>
    </group>
  )
}
