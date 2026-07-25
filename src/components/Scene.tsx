import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Orb } from './Orb'
import { Satellites } from './Satellites'
import { OrbitRings } from './OrbitRings'
import { CometStream } from './CometStream'
import { Starfield } from './Starfield'
import { NebulaGlow } from './NebulaGlow'
import { ScanRings } from './ScanRings'
import { BackgroundRings } from './BackgroundRings'
import type { Mode, OrbState } from '../atlas/types'

interface SceneProps { mode: Mode; orbState: OrbState; level?: { current: number }; satelliteCount?: number }

export function Scene({ mode, orbState, level, satelliteCount }: SceneProps) {
  return (
    <Canvas className="scene-canvas" camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
      {/* depth layers, back to front */}
      <Starfield />
      <BackgroundRings mode={mode} />
      <NebulaGlow mode={mode} />
      <CometStream mode={mode} />
      <OrbitRings mode={mode} />
      <ScanRings mode={mode} />
      <Orb mode={mode} orbState={orbState} level={level} />
      <Satellites count={satelliteCount ?? 0} />
      {/* cinematic bloom — the AI illuminates its own space */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} intensity={1.35} mipmapBlur radius={0.85} />
      </EffectComposer>
    </Canvas>
  )
}
