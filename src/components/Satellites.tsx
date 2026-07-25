import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COLORS = ['#a78bfa', '#ff6ec7', '#c86bff', '#8b5cf6']

function makeGlow(): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
    g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.35, 'rgba(255,255,255,0.35)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size)
  }
  const t = new THREE.CanvasTexture(canvas); t.needsUpdate = true; return t
}

export function Satellites({ count }: { count: number }) {
  const tex = useMemo(makeGlow, [])
  const groupRef = useRef<THREE.Group>(null)
  const n = Math.max(0, Math.min(4, count))
  useFrame((_, delta) => { if (groupRef.current) groupRef.current.rotation.y += delta * 0.18 })
  return (
    <group ref={groupRef}>
      {[0, 1, 2, 3].map((i) => {
        if (i >= n) return null
        const angle = (i / 4) * Math.PI * 2
        const radius = 2.35
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const y = Math.sin(i * 1.7) * 0.55
        return (
          <sprite key={i} position={[x, y, z]} scale={[0.5, 0.5, 1]}>
            <spriteMaterial map={tex} color={COLORS[i % COLORS.length]} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.75} />
          </sprite>
        )
      })}
    </group>
  )
}
