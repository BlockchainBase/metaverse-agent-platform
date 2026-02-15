import { useRef, useMemo } from 'react'
import * as THREE from 'three'

export function Courtyard() {
  const groupRef = useRef<THREE.Group>(null)

  const materials = useMemo(() => ({
    floor: new THREE.MeshStandardMaterial({ color: '#4a4a4a', roughness: 0.8 }),
    wall: new THREE.MeshStandardMaterial({ color: '#8b4513', roughness: 0.9 }),
    roof: new THREE.MeshStandardMaterial({ color: '#2c3e50', roughness: 0.7 }),
    pillar: new THREE.MeshStandardMaterial({ color: '#5d4037', roughness: 0.8 }),
    stage1: new THREE.MeshStandardMaterial({ color: '#3b82f6', emissive: '#1e40af', emissiveIntensity: 0.2 }),
    stage2: new THREE.MeshStandardMaterial({ color: '#f59e0b', emissive: '#b45309', emissiveIntensity: 0.2 }),
    stage3: new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#991b1b', emissiveIntensity: 0.2 }),
    stage4: new THREE.MeshStandardMaterial({ color: '#10b981', emissive: '#065f46', emissiveIntensity: 0.2 })
  }), [])

  return (
    <group ref={groupRef}>
      {/* Courtyard Floor - Grid Pattern */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[60, 60, 0.2]} />
        <primitive object={materials.floor} attach="material" />
      </mesh>

      {/* Grid Lines */}
      <gridHelper args={[60, 60, '#666', '#444']} position={[0, 0.01, 0]} />

      {/* Stage 1 Area - Market (Front/Left) */}
      <StageZone position={[-15, 0.1, 10]} material={materials.stage1} label="阶段1:市场对接" color="#3b82f6" />
      
      {/* Stage 2 Area - Solution (Left) */}
      <StageZone position={[-5, 0.1, 5]} material={materials.stage2} label="阶段2:方案制定" color="#f59e0b" />
      
      {/* Stage 3 Area - Development (Right) */}
      <StageZone position={[5, 0.1, 0]} material={materials.stage3} label="阶段3:研发Demo" color="#ef4444" />
      
      {/* Stage 4 Area - Delivery (Back/Right) */}
      <StageZone position={[15, 0.1, -5]} material={materials.stage4} label="阶段4:实施交付" color="#10b981" />

      {/* Central Hall - Project Management */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 1, 0]} castShadow>
          <cylinderGeometry args={[3, 3, 2, 8]} />
          <meshStandardMaterial color="#6366f1" emissive="#4338ca" emissiveIntensity={0.3} />
        </mesh>
        {/* Roof */}
        <mesh position={[0, 3, 0]} castShadow>
          <coneGeometry args={[4, 2, 8]} />
          <primitive object={materials.roof} attach="material" />
        </mesh>
      </group>

      {/* Director Platform (Back) */}
      <group position={[0, 0, -15]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[8, 1, 8]} />
          <meshStandardMaterial color="#7c3aed" emissive="#5b21b6" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 3, 0]} castShadow>
          <sphereGeometry args={[2, 32, 32]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Decorative Pillars */}
      {[
        [-20, 0, 20], [20, 0, 20],
        [-20, 0, -20], [20, 0, -20]
      ].map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 6, 8]} />
          <primitive object={materials.pillar} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

function StageZone({ position, material, label, color }: { 
  position: [number, number, number]
  material: THREE.Material
  label: string
  color: string
}) {
  return (
    <group position={position}>
      {/* Platform */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[6, 6, 0.2, 32]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* Glow Ring */}
      <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.5, 6, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>

      {/* Label Billboard */}
      <BillboardText position={[0, 4, 0]} text={label} color={color} />
    </group>
  )
}

function BillboardText({ position, text, color }: { 
  position: [number, number, number]
  text: string
  color: string
}) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  canvas.width = 512
  canvas.height = 128
  
  context.fillStyle = 'rgba(0, 0, 0, 0.7)'
  context.fillRect(0, 0, canvas.width, canvas.height)
  
  context.font = 'bold 36px Arial'
  context.fillStyle = color
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(text, canvas.width / 2, canvas.height / 2)
  
  const texture = new THREE.CanvasTexture(canvas)
  
  return (
    <mesh position={position}>
      <planeGeometry args={[8, 2]} />
      <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
    </mesh>
  )
}