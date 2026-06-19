'use client'

import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Points, PointMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

/* ───────────────────────────────────────────────────────────────
   SCROLL CHOREOGRAPHY (Apple-style cinematic)
   ───────────────────────────────────────────────────────────────

   A single scrollRef drives the whole film. We split the 0 → 1
   scroll range into four "acts" that map to visual beats:

     Act 1   0.00 – 0.30   Hero       — scattered duplicate shapes drift
     Act 2   0.30 – 0.55   Merge      — shapes accelerate toward a core
     Act 3   0.55 – 0.80   Reveal     — camera dollies in on the merged
                                        crystal, lights intensify
     Act 4   0.80 – 1.00   Settle     — final crystalline phone-storage
                                        idol rotates slowly

   The "merged crystal" is a faceted icosahedron with iridescent
   transmission — meant to read as the cleaned, organised, beautiful
   version of the user's phone storage.
*/

/* ───────────────────────────────────────────────────────────────
   SCATTERED DUPLICATE SHAPES
   Many copies of the same primitive (cube / sphere / octahedron),
   varying in size & color — the visual noise DeDup removes.
   ─────────────────────────────────────────────────────────────── */

type ShapeKind = 'box' | 'sphere' | 'octa' | 'tetra'

type Shape = {
  kind: ShapeKind
  initialPos: [number, number, number]
  targetPos: [number, number, number]
  scale: number
  color: string
  rotSpeed: [number, number, number]
  phase: number
}

function DuplicateSwarm({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null!)

  const shapes = useMemo<Shape[]>(() => {
    const arr: Shape[] = []
    const palette = ['#6366F1', '#A78BFA', '#38BDF8', '#818CF8', '#7DD3FC', '#EC4899']
    const kinds: ShapeKind[] = ['box', 'sphere', 'octa', 'tetra']
    const count = 22
    for (let i = 0; i < count; i++) {
      // Distribute on a sphere shell so the camera flies through them
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 4.5 + Math.random() * 3
      const ix = r * Math.sin(phi) * Math.cos(theta)
      const iy = r * Math.sin(phi) * Math.sin(theta)
      const iz = r * Math.cos(phi) - 1
      // Target: tight cluster near origin
      const angle = (i / count) * Math.PI * 2
      arr.push({
        kind: kinds[i % kinds.length],
        initialPos: [ix, iy, iz],
        targetPos: [Math.cos(angle) * 0.6, Math.sin(angle) * 0.6, 0],
        scale: 0.32 + Math.random() * 0.5,
        color: palette[i % palette.length],
        rotSpeed: [
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 0.6,
        ],
        phase: Math.random() * Math.PI * 2,
      })
    }
    return arr
  }, [])

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.getElapsedTime()
    const s = scrollRef.current

    // Act 1 → Act 2: merge factor ramps 0 → 1 between scroll 0.25 and 0.55
    const merge = smoothstep(0.25, 0.55, s)

    // Whole group slowly orbits in Act 1, locks as it merges
    group.current.rotation.y = t * 0.08 * (1 - merge) + merge * 0.2
    group.current.rotation.x = merge * -0.15

    group.current.children.forEach((child, i) => {
      const data = shapes[i]
      if (!data) return
      const mesh = child as THREE.Mesh

      // Lerp position toward target with a slight orbit flutter that fades on merge
      const lerp = merge
      const flutter = 0.18 * (1 - merge)
      mesh.position.x = THREE.MathUtils.lerp(data.initialPos[0], data.targetPos[0], lerp)
        + Math.sin(t * 0.7 + data.phase) * flutter
      mesh.position.y = THREE.MathUtils.lerp(data.initialPos[1], data.targetPos[1], lerp)
        + Math.cos(t * 0.6 + data.phase) * flutter
      mesh.position.z = THREE.MathUtils.lerp(data.initialPos[2], data.targetPos[2], lerp)

      // Rotation slows as they merge
      mesh.rotation.x = t * data.rotSpeed[0] * (1 - merge * 0.8) + data.phase
      mesh.rotation.y = t * data.rotSpeed[1] * (1 - merge * 0.8)
      mesh.rotation.z = t * data.rotSpeed[2] * (1 - merge * 0.8)

      // Scale shrinks toward end of merge, then fades out as crystal takes over
      const fadeOut = smoothstep(0.55, 0.7, s)
      const scale = data.scale * (1 - merge * 0.5) * (1 - fadeOut)
      mesh.scale.setScalar(Math.max(0.0001, scale))

      const mat = mesh.material as THREE.MeshStandardMaterial
      if (mat) {
        mat.opacity = (1 - fadeOut) * 0.92
        mat.emissiveIntensity = 0.35 + merge * 0.6
      }
    })
  })

  return (
    <group ref={group}>
      {shapes.map((sh, i) => {
        const geo = shapeGeometry(sh.kind)
        return (
          <mesh key={i} position={sh.initialPos} scale={sh.scale}>
            {geo}
            <meshStandardMaterial
              color={sh.color}
              metalness={0.45}
              roughness={0.22}
              transparent
              opacity={0.92}
              emissive={sh.color}
              emissiveIntensity={0.35}
            />
          </mesh>
        )
      })}
      <MergedCrystal />
    </group>
  )
}

function shapeGeometry(kind: ShapeKind) {
  switch (kind) {
    case 'box':
      return <boxGeometry args={[1, 1, 1]} />
    case 'sphere':
      return <sphereGeometry args={[0.6, 32, 32]} />
    case 'octa':
      return <octahedronGeometry args={[0.75, 0]} />
    case 'tetra':
      return <tetrahedronGeometry args={[0.8, 0]} />
  }
}

/* ───────────────────────────────────────────────────────────────
   MERGED CRYSTAL — the "cleaned storage" reveal
   Iridescent, slowly rotating, pulsing emissive. Scales up as
   duplicates fade out (Act 3), then settles into a calm rotation.
   ─────────────────────────────────────────────────────────────── */

function MergedCrystal() {
  const ref = useRef<THREE.Mesh>(null!)
  const inner = useRef<THREE.Mesh>(null!)

  useFrame((state, delta) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()
    const s = (state as any).__scrollRef?.current as number | undefined

    // Reveal curve: invisible until merge starts, fully revealed at Act 3
    const reveal = smoothstep(0.42, 0.7, s ?? 0)
    const settle = smoothstep(0.7, 1.0, s ?? 0)

    // Scale: grows from 0 → 1.0 during reveal, gentle breath during settle
    const breath = 1 + Math.sin(t * 1.2) * 0.04 * settle
    ref.current.scale.setScalar(reveal * breath)

    // Rotation: faster spin during reveal, calm during settle
    const rotSpeed = 0.4 + (1 - settle) * 0.8
    ref.current.rotation.y += delta * rotSpeed
    ref.current.rotation.x += delta * rotSpeed * 0.4

    const mat = ref.current.material as THREE.MeshPhysicalMaterial
    if (mat) {
      mat.opacity = reveal
      // Iridescence shimmer via emissive pulse
      mat.emissiveIntensity = 0.3 + Math.sin(t * 1.8) * 0.15 + reveal * 0.4
    }

    if (inner.current) {
      inner.current.rotation.y -= delta * 0.6
      inner.current.rotation.z += delta * 0.3
      const innerMat = inner.current.material as THREE.MeshStandardMaterial
      if (innerMat) {
        innerMat.emissiveIntensity = 0.6 + Math.sin(t * 2.4) * 0.25
      }
    }
  })

  return (
    <group>
      <mesh ref={ref} scale={0.001}>
        <icosahedronGeometry args={[1.15, 0]} />
        <meshPhysicalMaterial
          color="#A78BFA"
          metalness={0.2}
          roughness={0.05}
          transmission={0.85}
          thickness={1.2}
          ior={1.4}
          iridescence={1}
          iridescenceIOR={1.3}
          iridescenceThicknessRange={[100, 800]}
          clearcoat={1}
          clearcoatRoughness={0.05}
          emissive="#6366F1"
          emissiveIntensity={0.4}
          transparent
          opacity={0}
          envMapIntensity={1.5}
        />
      </mesh>
      {/* Inner glow core */}
      <mesh ref={inner} scale={0.55}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#38BDF8"
          emissive="#38BDF8"
          emissiveIntensity={0.9}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}

/* ───────────────────────────────────────────────────────────────
   CAMERA RIG — Apple-style cinematic camera moves
   Dollies in during reveal, orbits subtly in settle.
   ─────────────────────────────────────────────────────────────── */

function CinematicCamera({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const { camera, pointer } = useThree()
  const targetPos = useRef(new THREE.Vector3(0, 0, 9))
  const targetLook = useRef(new THREE.Vector3(0, 0, 0))

  useFrame((state, delta) => {
    const s = scrollRef.current

    // Act 1: z=9, slight overhead
    // Act 2: dolly to z=6.5, look at center
    // Act 3: dolly to z=4.5, eye-level
    // Act 4: settle at z=5.2, gentle orbit
    const act1to2 = smoothstep(0.0, 0.55, s)
    const act2to3 = smoothstep(0.55, 0.8, s)
    const act3to4 = smoothstep(0.8, 1.0, s)

    const z =
      9 -
      act1to2 * 2.5 - // 9 → 6.5
      act2to3 * 1.8 - // 6.5 → 4.7
      act3to4 * -0.5  // 4.7 → 5.2 (slight pull-back to settle)

    const y = 0.6 - act1to2 * 0.6 - act2to3 * 0.3

    // Subtle orbit during settle
    const settleOrbit = act3to4
    const orbitAngle = state.clock.getElapsedTime() * 0.15 * settleOrbit
    const ox = Math.sin(orbitAngle) * 0.6 * settleOrbit
    const oy = Math.cos(orbitAngle) * 0.4 * settleOrbit

    // Pointer parallax — subtle
    const px = pointer.x * 0.4
    const py = pointer.y * 0.25

    targetPos.current.set(ox + px, y + oy + py, z)
    camera.position.lerp(targetPos.current, Math.min(1, delta * 3))

    targetLook.current.set(0, 0, 0)
    // Smooth look-at by lerping a temporary quaternion
    const m = new THREE.Matrix4().lookAt(camera.position, targetLook.current, new THREE.Vector3(0, 1, 0))
    const q = new THREE.Quaternion().setFromRotationMatrix(m)
    camera.quaternion.slerp(q, Math.min(1, delta * 4))
  })

  return null
}

/* ───────────────────────────────────────────────────────────────
   STARFIELD — distant particles for cosmic depth
   ─────────────────────────────────────────────────────────────── */

function Starfield() {
  const positions = useMemo(() => {
    const count = 1400
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 22 + Math.random() * 24
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [])

  const ref = useRef<THREE.Points>(null!)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.012
    ref.current.rotation.x = state.clock.getElapsedTime() * 0.006
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#A78BFA"
        size={0.045}
        sizeAttenuation
        depthWrite={false}
        opacity={0.55}
      />
    </Points>
  )
}

/* ───────────────────────────────────────────────────────────────
   LIGHTS — Apple-style: clean key light + colored rim lights
   ─────────────────────────────────────────────────────────────── */

function CinematicLights({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const keyRef = useRef<THREE.DirectionalLight>(null!)
  const rim1Ref = useRef<THREE.PointLight>(null!)
  const rim2Ref = useRef<THREE.PointLight>(null!)

  useFrame(() => {
    const s = scrollRef.current
    // Intensify during reveal for the "money shot"
    const reveal = smoothstep(0.55, 0.85, s)
    if (keyRef.current) keyRef.current.intensity = 1.2 + reveal * 0.8
    if (rim1Ref.current) rim1Ref.current.intensity = 2.0 + reveal * 2.5
    if (rim2Ref.current) rim2Ref.current.intensity = 2.0 + reveal * 2.5
  })

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        ref={keyRef}
        position={[5, 6, 6]}
        intensity={1.2}
        color="#F8FAFF"
      />
      <pointLight ref={rim1Ref} position={[-6, 2, -2]} intensity={2.0} color="#6366F1" />
      <pointLight ref={rim2Ref} position={[6, -2, 2]} intensity={2.0} color="#38BDF8" />
      <pointLight position={[0, 0, 8]} intensity={0.6} color="#A78BFA" />
    </>
  )
}

/* ───────────────────────────────────────────────────────────────
   UTIL
   ─────────────────────────────────────────────────────────────── */

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/* ───────────────────────────────────────────────────────────────
   SCROLL STATE PROVIDER — passes scrollRef into useFrame closures
   via state, so child components can read it without prop-drilling
   ─────────────────────────────────────────────────────────────── */

function ScrollStateBridge({
  scrollRef,
  children,
}: {
  scrollRef: React.MutableRefObject<number>
  children: React.ReactNode
}) {
  useFrame((state) => {
    ;(state as any).__scrollRef = scrollRef
  })
  return <>{children}</>
}

/* ───────────────────────────────────────────────────────────────
   MAIN SCENE
   ─────────────────────────────────────────────────────────────── */

type SceneProps = {
  scrollRef: React.MutableRefObject<number>
}

export default function DedupScene({ scrollRef }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.6, 9], fov: 45, near: 0.1, far: 100 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      {/* Transparent background — GeminiAurora shows through */}
      <fog attach="fog" args={['#05070F', 14, 38]} />

      <Suspense fallback={null}>
        <ScrollStateBridge scrollRef={scrollRef}>
          <CinematicLights scrollRef={scrollRef} />
          <CinematicCamera scrollRef={scrollRef} />

          {/* Hero float wrapper — gently bobs the swarm before scroll */}
          <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.4} floatingRange={[-0.08, 0.08]}>
            <DuplicateSwarm scrollRef={scrollRef} />
          </Float>

          <Starfield />
          <Environment preset="night" />
        </ScrollStateBridge>
      </Suspense>
    </Canvas>
  )
}
