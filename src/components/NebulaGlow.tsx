import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MODES } from '../atlas/modes'
import type { Mode } from '../atlas/types'

// Big soft volumetric haze behind the orb — the "the AI illuminates its own
// space" glow. Breathes slowly and takes the active mode's colour.
function softTexture(): THREE.CanvasTexture {
  const s = 256
  const c = document.createElement('canvas'); c.width = s; c.height = s
  const ctx = c.getContext('2d')
  if (ctx) {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    g.addColorStop(0, 'rgba(255,255,255,0.8)'); g.addColorStop(0.3, 'rgba(255,255,255,0.28)')
    g.addColorStop(0.6, 'rgba(255,255,255,0.08)'); g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s)
  }
  const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t
}

export function NebulaGlow({ mode }: { mode: Mode }) {
  const ref = useRef<THREE.Sprite>(null)
  const tex = useMemo(softTexture, [])
  const color = useMemo(() => new THREE.Color(MODES[mode].colorB), [mode])

  useFrame((state) => {
    if (ref.current) {
      const s = 13 + Math.sin(state.clock.elapsedTime * 0.35) * 1.1
      ref.current.scale.set(s, s, 1)
      const mat = ref.current.material as THREE.SpriteMaterial
      mat.color.lerp(color, 0.05)
    }
  })

  return (
    <sprite ref={ref} position={[0, 0, -2.4]} scale={[13, 13, 1]}>
      <spriteMaterial map={tex} color={color} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.16} />
    </sprite>
  )
}
