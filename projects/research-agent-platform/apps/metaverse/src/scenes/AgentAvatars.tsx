import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useMetaverseStore } from '../stores/metaverse'

export function AgentAvatars() {
  const { agents, selectAgent, selectedAgent } = useMetaverseStore()

  return (
    <group>
      {agents.map((agent) => (
        <AgentAvatar
          key={agent.id}
          agent={agent}
          isSelected={selectedAgent?.id === agent.id}
          onClick={() => selectAgent(agent)}
        />
      ))}
    </group>
  )
}

interface AgentAvatarProps {
  agent: {
    id: string
    name: string
    role: string
    avatar: string
    position: { x: number; y: number; z: number }
  }
  isSelected: boolean
  onClick: () => void
}

function AgentAvatar({ agent, isSelected, onClick }: AgentAvatarProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = agent.position.y + Math.sin(state.clock.elapsedTime * 2) * 0.2 + 1
      // Rotation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  const emojis: Record<string, string> = {
    'MARKET': '🤝',
    'SOLUTION': '📐',
    'PROJECT': '📋',
    'DEVELOPER': '💻',
    'DELIVERY': '🚀',
    'FINANCE': '💰',
    'DIRECTOR': '👑',
    'DEVOPS': '🔧'
  }

  const colors: Record<string, string> = {
    'MARKET': '#3b82f6',
    'SOLUTION': '#f59e0b',
    'PROJECT': '#8b5cf6',
    'DEVELOPER': '#10b981',
    'DELIVERY': '#06b6d4',
    'FINANCE': '#f97316',
    'DIRECTOR': '#ef4444',
    'DEVOPS': '#6366f1'
  }

  return (
    <group position={[agent.position.x, agent.position.y, agent.position.z]}>
      {/* Selection Ring */}
      {isSelected && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2, 2.2, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Avatar Body */}
      <mesh
        ref={meshRef}
        position={[0, 1, 0]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <capsuleGeometry args={[0.8, 1.5, 4, 8]} />
        <meshStandardMaterial 
          color={colors[agent.role] || '#666'} 
          emissive={colors[agent.role] || '#666'}
          emissiveIntensity={hovered ? 0.3 : 0.1}
        />
      </mesh>

      {/* Emoji Face */}
      <Html position={[0, 1.8, 0.9]} center transform>
        <div style={{
          fontSize: '32px',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          cursor: 'pointer',
          userSelect: 'none'
        }}>
          {emojis[agent.role] || '🤖'}
        </div>
      </Html>

      {/* Name Label */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="black"
      >
        {agent.name}
      </Text>

      {/* Role Badge */}
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.3}
        color={colors[agent.role] || '#999'}
        anchorX="center"
        anchorY="middle"
      >
        {agent.role}
      </Text>

      {/* Connection Lines to other agents */}
      {agent.role === 'PROJECT' && (
        <ConnectionLines center={agent.position} />
      )}
    </group>
  )
}

function ConnectionLines({ center }: { center: { x: number; y: number; z: number } }) {
  const agents = useMetaverseStore(state => state.agents)
  
  return (
    <group>
      {agents.filter(a => a.role !== 'PROJECT').map((agent) => (
        <Line
          key={agent.id}
          start={[center.x, center.y + 1, center.z]}
          end={[agent.position.x, agent.position.y + 1, agent.position.z]}
          color="rgba(139, 92, 246, 0.3)"
        />
      ))}
    </group>
  )
}

function Line({ start, end, color }: { start: number[]; end: number[]; color: string }) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)]
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  
  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.3} />
    </line>
  )
}