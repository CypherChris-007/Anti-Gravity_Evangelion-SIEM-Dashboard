'use client'

import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import { Globe2, Crosshair, ShieldAlert, Radio } from 'lucide-react'
import { useSiemStore } from '@/lib/store/useSiemStore'
import { AttackEvent } from '@/types/cyber'

// Convert Lat/Lng to 3D Sphere coordinates
function geoPoint(lat: number, lon: number, radius = 2.03): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180
  const theta = ((lon + 180) * Math.PI) / 180
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

function getArcColor(severity: string): string {
  switch (severity) {
    case 'CRITICAL':
    case 'HIGH':
      return '#ff3d32' // Red
    case 'MEDIUM':
      return '#ff6b24' // Orange
    case 'LOW':
    default:
      return '#48a9ff' // Blue
  }
}

function AttackArc({
  attack,
  isActive,
}: {
  attack: AttackEvent
  isActive: boolean
}) {
  const projectileRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  const origin = useMemo(
    () => geoPoint(attack.startLat, attack.startLng, 2.02),
    [attack.startLat, attack.startLng]
  )
  const target = useMemo(
    () => geoPoint(attack.endLat, attack.endLng, 2.02),
    [attack.endLat, attack.endLng]
  )

  const { points, color } = useMemo(() => {
    // Elevate middle point proportional to distance
    const distance = origin.distanceTo(target)
    const midElevation = 2.0 + Math.max(0.4, distance * 0.35)
    const midPoint = origin.clone().add(target).normalize().multiplyScalar(midElevation)

    const curve = new THREE.QuadraticBezierCurve3(origin, midPoint, target)
    return {
      points: curve.getPoints(36),
      color: getArcColor(attack.severity),
    }
  }, [origin, target, attack.severity])

  useFrame(({ clock }) => {
    if (projectileRef.current) {
      const elapsed = clock.getElapsedTime()
      // Faster projectile for critical
      const speed = attack.severity === 'CRITICAL' ? 2.4 : 3.2
      const progress = (elapsed % speed) / speed
      const index = Math.min(
        points.length - 1,
        Math.floor(progress * (points.length - 1))
      )
      projectileRef.current.position.copy(points[index])
    }

    if (ringRef.current) {
      const t = clock.getElapsedTime() * 3
      const scale = 1 + (t % 1) * 0.8
      ringRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <>
      {/* Flight arc line */}
      <line>
        <bufferGeometry
          attach="geometry"
          onUpdate={(geometry) => geometry.setFromPoints(points)}
        />
        <lineBasicMaterial
          color={color}
          transparent
          opacity={isActive ? 0.95 : 0.35}
          linewidth={1}
        />
      </line>

      {/* Moving kinetic projectile */}
      <mesh ref={projectileRef}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Origin launch beacon */}
      <mesh position={origin}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color={color} opacity={0.6} transparent />
      </mesh>

      {/* Target impact ripple */}
      <mesh ref={ringRef} position={target}>
        <ringGeometry args={[0.05, 0.08, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isActive ? 0.85 : 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  )
}

function EarthWireframe() {
  return (
    <>
      {/* Inner tactical dark core */}
      <Sphere args={[1.98, 48, 48]}>
        <meshStandardMaterial
          color="#061219"
          roughness={0.9}
          emissive="#02090e"
          emissiveIntensity={0.6}
        />
      </Sphere>

      {/* Outer cyan tactical telemetry wireframe */}
      <Sphere args={[2.01, 48, 48]}>
        <meshStandardMaterial
          color="#164e63"
          roughness={0.7}
          metalness={0.3}
          wireframe
          emissive="#083344"
          emissiveIntensity={0.4}
        />
      </Sphere>

      {/* Atmospheric perimeter glow */}
      <Sphere args={[2.08, 32, 32]}>
        <meshBasicMaterial
          color="#0284c7"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
        />
      </Sphere>
    </>
  )
}

export function EarthSection() {
  const attacks = useSiemStore((state) => state.attacks)
  const lastTenLedger = useSiemStore((state) => state.lastTenLedger)
  const currentActiveArc = useSiemStore((state) => state.currentActiveArc)
  const setSelectedAttack = useSiemStore((state) => state.setSelectedAttack)
  const resolveIncident = useSiemStore((state) => state.resolveIncident)
  const setToast = useSiemStore((state) => state.setToast)

  const [activeLedgerIndex, setActiveLedgerIndex] = useState(0)

  // Visible arcs (limit to latest 6 for high 60 FPS performance)
  const visibleArcs = useMemo(() => {
    return attacks.slice(0, 6)
  }, [attacks])

  const focusedAttack = visibleArcs[activeLedgerIndex % Math.max(1, visibleArcs.length)] || currentActiveArc

  return (
    <div className="relative h-full flex flex-col justify-between">
      {/* Top Banner Tag */}
      <div className="panel-corner">LIVE</div>

      {/* 3D Earth Globe Canvas */}
      <div
        className="globe-wrap relative !m-0 !h-[380px] w-full"
        aria-label="Interactive 3D Earth threat map. Drag to rotate."
      >
        <Canvas
          camera={{ position: [0, 0.4, 5.8], fov: 40 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <ambientLight intensity={1.5} />
          <pointLight position={[5, 4, 6]} intensity={3.5} color="#bde8ff" />
          <pointLight position={[-5, -3, -4]} intensity={1.2} color="#ff8c38" />

          <EarthWireframe />

          {visibleArcs.map((atk) => (
            <AttackArc
              key={atk.id}
              attack={atk}
              isActive={focusedAttack?.id === atk.id}
            />
          ))}

          <OrbitControls
            enablePan={false}
            minDistance={4.2}
            maxDistance={7.5}
            rotateSpeed={0.7}
            autoRotate
            autoRotateSpeed={0.4}
          />
        </Canvas>

        {/* Live Attack Telemetry Pill */}
        {focusedAttack && (
          <div className="map-label label-a !top-3 !left-3 z-10 bg-[#07090d]/85 p-1.5 border-l-2 border-[var(--red)] backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[var(--red)] rounded-full animate-ping" />
              <span className="text-[9px] font-bold text-white tracking-widest">
                [ACTIVE] {focusedAttack.originCountry} → {focusedAttack.targetCountry}
              </span>
              <b className="text-[var(--red)] text-[8px] bg-[var(--red)]/15 px-1 py-0.2">
                {focusedAttack.threatType}
              </b>
            </div>
            <div className="text-[8px] text-[#71808a] mt-0.5 truncate max-w-[220px]">
              VECTOR: {focusedAttack.threatVector}
            </div>
          </div>
        )}

        {/* Globe bottom caption */}
        <div className="globe-caption !bottom-2 !left-3 z-10 bg-[#07090d]/80 px-2 py-1 border border-[#202a31] text-[8px]">
          <Globe2 className="w-3 h-3 text-[#48a9ff]" />
          THREAT SURFACE // LIVE TELEMETRY
          <b className="text-[var(--orange)] ml-1">
            ARCS: {visibleArcs.length} ACTIVE // 60 FPS
          </b>
        </div>
      </div>

      {/* SECTION 1 SPEC: Last 10 Origin-Destination Pairs Ledger */}
      <div className="border-t border-[#202a31] bg-[#070c10] p-2.5 font-mono">
        <div className="flex items-center justify-between text-[8px] text-[#71808a] mb-1.5 px-1">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-[var(--orange)] animate-pulse" />
            <span className="font-bold text-[var(--orange)]">
              ORIGIN-DESTINATION TELEMETRY LEDGER
            </span>
            <span>[LAST 10 INCIDENTS]</span>
          </div>
          <span className="text-[8px] text-[#52616b]">CLICK ROW TO INSPECT / RESOLVE</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 max-h-[96px] overflow-y-auto pr-0.5">
          {lastTenLedger.map((atk, idx) => {
            const isSelected = focusedAttack?.id === atk.id
            const isCritical = atk.severity === 'CRITICAL' || atk.severity === 'HIGH'
            return (
              <button
                key={atk.id}
                onClick={() => {
                  setActiveLedgerIndex(idx)
                  setSelectedAttack(atk)
                }}
                className={`p-1 text-left border transition-all text-[8px] flex flex-col justify-between ${
                  isSelected
                    ? 'border-[var(--orange)] bg-[var(--orange)]/15 text-white'
                    : 'border-[#1b252d] bg-[#0b0f14] text-[#81919a] hover:border-[#34414b]'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className={isCritical ? 'text-[var(--red)]' : 'text-[var(--orange)]'}>
                    {atk.originCountry} → {atk.targetCountry}
                  </span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      atk.status === 'RESOLVED'
                        ? 'bg-[var(--green)]'
                        : isCritical
                        ? 'bg-[var(--red)]'
                        : 'bg-[var(--orange)]'
                    }`}
                  />
                </div>
                <div className="truncate text-[7px] text-[#71808a] mt-0.5">
                  {atk.threatType}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
