import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { vertexShader, fragmentShader } from './shaders'
import { MODES, STATE_TINT } from '../atlas/modes'
import type { Mode, OrbState } from '../atlas/types'

const COUNT = 9000
const BOOT_MS = 2200
const TARGET_INTENSITY: Record<OrbState, number> = { idle: 0.14, listening: 0.34, thinking: 0.85, speaking: 0.55 }

function makeSphere(count: number) {
  const positions = new Float32Array(count * 3)
  const randoms = new Float32Array(count)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2
    const radius = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    positions[i * 3] = Math.cos(theta) * radius
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = Math.sin(theta) * radius
    randoms[i] = Math.random()
  }
  return { positions, randoms }
}

interface OrbProps { mode: Mode; orbState: OrbState; level?: { current: number } }

export function Orb({ mode, orbState, level }: OrbProps) {
  const groupRef = useRef<THREE.Group>(null)
  const haloRef = useRef<THREE.Sprite>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const bootStart = useRef<number>(performance.now())

  const { geometry, uniforms } = useMemo(() => {
    const { positions, randoms } = makeSphere(COUNT)
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geom.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))
    const start = MODES.quick
    const u = {
      uTime: { value: 0 }, uIntensity: { value: TARGET_INTENSITY.idle },
      uLevel: { value: 0 }, uBoot: { value: 0 },
      uColorA: { value: new THREE.Color(start.colorA) }, uColorB: { value: new THREE.Color(start.colorB) },
      uSize: { value: 0.11 }, uPointer: { value: new THREE.Vector2(0, 0) },
    }
    return { geometry: geom, uniforms: u }
  }, [])

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms, vertexShader, fragmentShader, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }), [uniforms])

  const haloTexture = useMemo(() => {
    const size = 256
    const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
      g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(0.18, 'rgba(255,255,255,0.35)')
      g.addColorStop(0.45, 'rgba(255,255,255,0.08)'); g.addColorStop(1, 'rgba(255,255,255,0.0)')
      ctx.fillStyle = g; ctx.fillRect(0, 0, size, size)
    }
    const tex = new THREE.CanvasTexture(canvas); tex.needsUpdate = true; return tex
  }, [])

  const scratchA = useMemo(() => new THREE.Color(), [])
  const scratchB = useMemo(() => new THREE.Color(), [])
  const tintCol = useMemo(() => new THREE.Color(), [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    uniforms.uTime.value += dt
    const boot = Math.min(1, (performance.now() - bootStart.current) / BOOT_MS)
    uniforms.uBoot.value = boot

    const cfg = MODES[mode]
    scratchA.set(cfg.colorA); scratchB.set(cfg.colorB)
    const tintHex = STATE_TINT[orbState]
    if (tintHex) { tintCol.set(tintHex); scratchA.lerp(tintCol, 0.28); scratchB.lerp(tintCol, 0.42) }
    const cl = Math.min(1, dt * 3)
    uniforms.uColorA.value.lerp(scratchA, cl); uniforms.uColorB.value.lerp(scratchB, cl)

    const lvl = orbState === 'speaking' && level ? Math.max(0, Math.min(1, level.current)) : 0
    uniforms.uLevel.value += (lvl - uniforms.uLevel.value) * Math.min(1, dt * 8)

    let target = TARGET_INTENSITY[orbState]
    if (orbState === 'speaking') {
      const pulse = level ? lvl * 0.5 : (Math.sin(uniforms.uTime.value * 6) * 0.5 + 0.5) * 0.25
      target = 0.4 + pulse
    }
    uniforms.uIntensity.value += (target - uniforms.uIntensity.value) * Math.min(1, dt * 3)

    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.05
      groupRef.current.rotation.x = Math.sin(uniforms.uTime.value * 0.1) * 0.08
      const breathe = 1 + Math.sin(uniforms.uTime.value * 0.6) * 0.02 + uniforms.uIntensity.value * 0.03
      groupRef.current.scale.setScalar(breathe)
    }
    uniforms.uPointer.value.set(state.pointer.x, state.pointer.y)

    if (haloRef.current) {
      const mat = haloRef.current.material as THREE.SpriteMaterial
      mat.color.copy(uniforms.uColorB.value)
      mat.opacity = (0.28 + uniforms.uIntensity.value * 0.5) * boot
      const hs = 4.2 + uniforms.uIntensity.value * 1.4 + uniforms.uLevel.value * 0.8
      haloRef.current.scale.set(hs, hs, 1)
    }
    if (coreRef.current) {
      const cmat = coreRef.current.material as THREE.MeshBasicMaterial
      cmat.color.copy(uniforms.uColorA.value)
      cmat.opacity = (0.32 + uniforms.uIntensity.value * 0.4) * boot
      coreRef.current.scale.setScalar(0.5 + uniforms.uLevel.value * 0.15)
    }
  })

  return (
    <group>
      <sprite ref={haloRef} scale={[4.2, 4.2, 1]}>
        <spriteMaterial map={haloTexture} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0} />
      </sprite>
      <group scale={[1, 1, 0.85]}>
        <group ref={groupRef}>
          <mesh ref={coreRef} scale={0.5}>
            <sphereGeometry args={[1, 48, 48]} />
            <meshBasicMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0} />
          </mesh>
          <points geometry={geometry} material={material} />
          {/* bright white-violet pinpoint core — bloom turns this into the hot center */}
          <sprite scale={[0.72, 0.72, 1]}>
            <spriteMaterial map={haloTexture} color="#ffffff" transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.85} />
          </sprite>
        </group>
      </group>
    </group>
  )
}
