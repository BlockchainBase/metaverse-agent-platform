import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useMetaverseStore } from '../stores/metaverse'

export function ProjectPipelines() {
  const { projects, selectProject, selectedProject } = useMetaverseStore()

  return (
    <group>
      {/* Pipeline Connections */}
      <PipelineConnections />
      
      {/* Project Spheres */}
      {projects.map((project) => (
        <ProjectSphere
          key={project.id}
          project={project}
          isSelected={selectedProject?.id === project.id}
          onClick={() => selectProject(project)}
        />
      ))}
    </group>
  )
}

interface ProjectSphereProps {
  project: {
    id: string
    name: string
    code: string
    stage: string
    stageStatus: string
    status: string
    priority: string
    customerName: string
    manager: { name: string }
    position: { x: number; y: number; z: number }
    color: string
    progress: number
  }
  isSelected: boolean
  onClick: () => void
}

function ProjectSphere({ project, isSelected, onClick }: ProjectSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating
      meshRef.current.position.y = project.position.y + Math.sin(state.clock.elapsedTime * 1.5 + project.id.charCodeAt(0)) * 0.15
      
      // Rotation
      meshRef.current.rotation.y += 0.005
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  const isWarning = project.priority === 'HIGH' && project.stageStatus !== 'COMPLETED'
  const isCompleted = project.status === 'COMPLETED'

  return (
    <group position={[project.position.x, project.position.y, project.position.z]}>
      {/* Warning Effect for High Priority */}
      {isWarning && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.5, 2.7, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.5 + Math.sin(Date.now() * 0.005) * 0.3} />
        </mesh>
      )}

      {/* Selection Ring */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.2, 2.4, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Main Sphere */}
      <mesh
        ref={meshRef}
        position={[0, 1.5, 0]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.15 : 1}
      >
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial 
          color={project.color}
          emissive={project.color}
          emissiveIntensity={hovered ? 0.4 : 0.2}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Progress Ring */}
      <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.7, 1.8, 32, 1, 0, (project.progress / 100) * Math.PI * 2]} />
        <meshBasicMaterial color="white" transparent opacity={0.8} />
      </mesh>

      {/* Project Code */}
      <Text
        position={[0, 3.2, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="black"
      >
        {project.code}
      </Text>

      {/* Project Name */}
      <Text
        position={[0, -1, 0]}
        fontSize={0.35}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={6}
        outlineWidth={0.03}
        outlineColor="black"
      >
        {project.name}
      </Text>

      {/* Progress Percentage */}
      <Html position={[0, 1.5, 1.6]} center transform>
        <div style={{
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 'bold',
          fontFamily: 'Arial'
        }}>
          {project.progress}%
        </div>
      </Html>

      {/* Status Indicator */}
      <mesh position={[1.2, 2.5, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={getStatusColor(project.stageStatus)} />
      </mesh>
    </group>
  )
}

function PipelineConnections() {
  // Define pipeline flow paths between stages
  const paths = [
    { from: [-15, 2, 10], to: [-5, 2, 5], color: '#3b82f6' },   // Stage 1 -> Stage 2
    { from: [-5, 2, 5], to: [5, 2, 0], color: '#f59e0b' },      // Stage 2 -> Stage 3
    { from: [5, 2, 0], to: [15, 2, -5], color: '#ef4444' },     // Stage 3 -> Stage 4
  ]

  return (
    <group>
      {paths.map((path, index) => (
        <PipelineLine key={index} {...path} />
      ))}
    </group>
  )
}

function PipelineLine({ from, to, color }: { from: number[]; to: number[]; color: string }) {
  const points = []
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...from),
    new THREE.Vector3((from[0] + to[0]) / 2, from[1] + 2, (from[2] + to[2]) / 2),
    new THREE.Vector3(...to)
  )
  
  const curvePoints = curve.getPoints(50)
  const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints)
  
  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.4} linewidth={2} />
    </line>
  )
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETED': return '#10b981'
    case 'IN_PROGRESS': return '#3b82f6'
    case 'BLOCKED': return '#ef4444'
    default: return '#6b7280'
  }
}