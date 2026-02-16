import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ManagerRole, ROLE_CONFIG } from '../data/managers'

interface InteractionFeedbackProps {
  role: ManagerRole
  position: [number, number, number]
  type: 'wave' | 'nod' | 'jump' | 'spin'
  onComplete?: () => void
}

// 挥手动画
function WaveAnimation({ role, position, onComplete }: { role: ManagerRole, position: [number, number, number], onComplete?: () => void }) {
  const groupRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Mesh>(null)
  const [progress, setProgress] = useState(0)
  const config = ROLE_CONFIG[role]
  const s = config.scale
  
  useEffect(() => {
    const duration = 2000 // 2秒
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const p = Math.min(elapsed / duration, 1)
      setProgress(p)
      
      if (p < 1) {
        requestAnimationFrame(animate)
      } else {
        setTimeout(() => onComplete?.(), 100)
      }
    }
    
    requestAnimationFrame(animate)
  }, [onComplete])
  
  useFrame(() => {
    if (!groupRef.current || !rightArmRef.current) return
    
    // 挥手动作
    const waveAngle = Math.sin(progress * Math.PI * 4) * 0.8
    rightArmRef.current.rotation.z = -Math.PI / 3 + waveAngle
    rightArmRef.current.rotation.x = Math.sin(progress * Math.PI * 4) * 0.3
    
    // 身体轻微摆动
    groupRef.current.rotation.z = Math.sin(progress * Math.PI * 4) * 0.05
  })
  
  return (
    <group ref={groupRef} position={position}>
      {/* 身体 */}
      <mesh position={[0, config.height * 0.3 * s, 0]}>
        <capsuleGeometry args={[0.25 * s, config.height * 0.5 * s, 4, 8]} />
        <meshStandardMaterial color={config.color} />
      </mesh>
      
      {/* 头部 */}
      <mesh position={[0, config.height * 0.75 * s, 0]}>
        <sphereGeometry args={[0.35 * s, 32, 32]} />
        <meshStandardMaterial color="#FFE4C4" />
      </mesh>
      
      {/* 眼睛 */}
      <mesh position={[-0.12 * s, config.height * 0.78 * s, 0.28 * s]}>
        <sphereGeometry args={[0.06 * s]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh position={[0.12 * s, config.height * 0.78 * s, 0.28 * s]}>
        <sphereGeometry args={[0.06 * s]} />
        <meshBasicMaterial color="white" />
      </mesh>
      
      {/* 左眼 - 眨眼动画 */}
      <mesh position={[-0.12 * s, config.height * 0.78 * s, 0.32 * s]}>
        <sphereGeometry args={[0.03 * s]} />
        <meshBasicMaterial color="black" />
      </mesh>
      
      {/* 右眼 - 眨眼动画 */}
      <mesh position={[0.12 * s, config.height * 0.78 * s, 0.32 * s]}>
        <sphereGeometry args={[0.03 * s]} />
        <meshBasicMaterial color="black" />
      </mesh>
      
      {/* 微笑的嘴巴 */}
      <mesh position={[0, config.height * 0.7 * s, 0.32 * s]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.08 * s, 0.015, 8, 16, Math.PI]} />
        <meshBasicMaterial color="#FF6B6B" />
      </mesh>
      
      {/* 左臂 - 自然下垂 */}
      <mesh position={[-0.35 * s, config.height * 0.45 * s, 0]} rotation={[0, 0, Math.PI / 6]}>
        <capsuleGeometry args={[0.06 * s, 0.4 * s]} />
        <meshStandardMaterial color={config.color} />
      </mesh>
      
      {/* 右臂 - 挥手动效 */}
      <mesh 
        ref={rightArmRef} 
        position={[0.35 * s, config.height * 0.45 * s, 0]} 
        rotation={[0, 0, -Math.PI / 3]}
      >
        <capsuleGeometry args={[0.06 * s, 0.4 * s]} />
        <meshStandardMaterial color={config.color} />
      </mesh>
      
      {/* 头发 */}
      <mesh position={[0, config.height * 0.95 * s, 0]}>
        <sphereGeometry args={[0.38 * s, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={config.color} />
      </mesh>
    </group>
  )
}

// 点头动画
function NodAnimation({ role, position, onComplete }: { role: ManagerRole, position: [number, number, number], onComplete?: () => void }) {
  const headRef = useRef<THREE.Mesh>(null)
  const [progress, setProgress] = useState(0)
  const config = ROLE_CONFIG[role]
  const s = config.scale
  
  useEffect(() => {
    const duration = 1500
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const p = Math.min(elapsed / duration, 1)
      setProgress(p)
      
      if (p < 1) {
        requestAnimationFrame(animate)
      } else {
        setTimeout(() => onComplete?.(), 100)
      }
    }
    
    requestAnimationFrame(animate)
  }, [onComplete])
  
  useFrame(() => {
    if (!headRef.current) return
    
    // 点头动作
    const nodCycle = Math.sin(progress * Math.PI * 3) * 0.3
    headRef.current.rotation.x = nodCycle
  })
  
  return (
    <group position={position}>
      {/* 身体 */}
      <mesh position={[0, config.height * 0.3 * s, 0]}>
        <capsuleGeometry args={[0.25 * s, config.height * 0.5 * s, 4, 8]} />
        <meshStandardMaterial color={config.color} />
      </mesh>
      
      {/* 头部 - 可以动 */}
      <mesh ref={headRef} position={[0, config.height * 0.75 * s, 0]}>
        <sphereGeometry args={[0.35 * s, 32, 32]} />
        <meshStandardMaterial color="#FFE4C4" />
      </mesh>
      
      {/* 眼睛 */}
      <mesh position={[-0.12 * s, config.height * 0.78 * s, 0.28 * s]}>
        <sphereGeometry args={[0.06 * s]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh position={[0.12 * s, config.height * 0.78 * s, 0.28 * s]}>
        <sphereGeometry args={[0.06 * s]} />
        <meshBasicMaterial color="white" />
      </mesh>
      
      {/* 瞳孔 */}
      <mesh position={[-0.12 * s, config.height * 0.78 * s, 0.32 * s]}>
        <sphereGeometry args={[0.03 * s]} />
        <meshBasicMaterial color="black" />
      </mesh>
      <mesh position={[0.12 * s, config.height * 0.78 * s, 0.32 * s]}>
        <sphereGeometry args={[0.03 * s]} />
        <meshBasicMaterial color="black" />
      </mesh>
      
      {/* 头发 */}
      <mesh position={[0, config.height * 0.95 * s, 0]}>
        <sphereGeometry args={[0.38 * s, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={config.color} />
      </mesh>
      
      {/* 手臂 */}
      <mesh position={[-0.35 * s, config.height * 0.45 * s, 0]} rotation={[0, 0, Math.PI / 6]}>
        <capsuleGeometry args={[0.06 * s, 0.4 * s]} />
        <meshStandardMaterial color={config.color} />
      </mesh>
      <mesh position={[0.35 * s, config.height * 0.45 * s, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <capsuleGeometry args={[0.06 * s, 0.4 * s]} />
        <meshStandardMaterial color={config.color} />
      </mesh>
    </group>
  )
}

// 跳跃动画
function JumpAnimation({ role, position, onComplete }: { role: ManagerRole, position: [number, number, number], onComplete?: () => void }) {
  const groupRef = useRef<THREE.Group>(null)
  const [progress, setProgress] = useState(0)
  const config = ROLE_CONFIG[role]
  const s = config.scale
  
  useEffect(() => {
    const duration = 1200
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const p = Math.min(elapsed / duration, 1)
      setProgress(p)
      
      if (p < 1) {
        requestAnimationFrame(animate)
      } else {
        setTimeout(() => onComplete?.(), 100)
      }
    }
    
    requestAnimationFrame(animate)
  }, [onComplete])
  
  useFrame(() => {
    if (!groupRef.current) return
    
    // 跳跃抛物线
    const jumpHeight = Math.sin(progress * Math.PI) * 1.5
    groupRef.current.position.y = position[1] + jumpHeight
    
    // 旋转
    groupRef.current.rotation.y = progress * Math.PI * 2
  })
  
  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]}>
      {/* 身体 */}
      <mesh position={[0, config.height * 0.3 * s, 0]}>
        <capsuleGeometry args={[0.25 * s, config.height * 0.5 * s, 4, 8]} />
        <meshStandardMaterial color={config.color} />
      </mesh>
      
      {/* 头部 */}
      <mesh position={[0, config.height * 0.75 * s, 0]}>
        <sphereGeometry args={[0.35 * s, 32, 32]} />
        <meshStandardMaterial color="#FFE4C4" />
      </mesh>
      
      {/* 张开的嘴巴（开心） */}
      <mesh position={[0, config.height * 0.68 * s, 0.32 * s]}>
        <sphereGeometry args={[0.08 * s]} />
        <meshBasicMaterial color="#FF6B6B" />
      </mesh>
      
      {/* 手臂高举 */}
      <mesh position={[-0.35 * s, config.height * 0.6 * s, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.06 * s, 0.4 * s]} />
        <meshStandardMaterial color={config.color} />
      </mesh>
      <mesh position={[0.35 * s, config.height * 0.6 * s, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <capsuleGeometry args={[0.06 * s, 0.4 * s]} />
        <meshStandardMaterial color={config.color} />
      </mesh>
      
      {/* 头发 */}
      <mesh position={[0, config.height * 0.95 * s, 0]}>
        <sphereGeometry args={[0.38 * s, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={config.color} />
      </mesh>
    </group>
  )
}

// 旋转动画
function SpinAnimation({ role, position, onComplete }: { role: ManagerRole, position: [number, number, number], onComplete?: () => void }) {
  const groupRef = useRef<THREE.Group>(null)
  const [progress, setProgress] = useState(0)
  const config = ROLE_CONFIG[role]
  const s = config.scale
  
  useEffect(() => {
    const duration = 1500
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const p = Math.min(elapsed / duration, 1)
      setProgress(p)
      
      if (p < 1) {
        requestAnimationFrame(animate)
      } else {
        setTimeout(() => onComplete?.(), 100)
      }
    }
    
    requestAnimationFrame(animate)
  }, [onComplete])
  
  useFrame(() => {
    if (!groupRef.current) return
    
    // 旋转
    groupRef.current.rotation.y = progress * Math.PI * 4
  })
  
  return (
    <group ref={groupRef} position={position}>
      {/* 身体 */}
      <mesh position={[0, config.height * 0.3 * s, 0]}>
        <capsuleGeometry args={[0.25 * s, config.height * 0.5 * s, 4, 8]} />
        <meshStandardMaterial color={config.color} />
      </mesh>
      
      {/* 头部 */}
      <mesh position={[0, config.height * 0.75 * s, 0]}>
        <sphereGeometry args={[0.35 * s, 32, 32]} />
        <meshStandardMaterial color="#FFE4C4" />
      </mesh>
      
      {/* 头发 */}
      <mesh position={[0, config.height * 0.95 * s, 0]}>
        <sphereGeometry args={[0.38 * s, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={config.color} />
      </mesh>
      
      {/* 手臂 */}
      <mesh position={[-0.35 * s, config.height * 0.45 * s, 0]} rotation={[0, 0, Math.PI / 6]}>
        <capsuleGeometry args={[0.06 * s, 0.4 * s]} />
        <meshStandardMaterial color={config.color} />
      </mesh>
      <mesh position={[0.35 * s, config.height * 0.45 * s, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <capsuleGeometry args={[0.06 * s, 0.4 * s]} />
        <meshStandardMaterial color={config.color} />
      </mesh>
    </group>
  )
}

// 主交互反馈组件
export function InteractionFeedback({ role, position, type, onComplete }: InteractionFeedbackProps) {
  switch (type) {
    case 'wave':
      return <WaveAnimation role={role} position={position} onComplete={onComplete} />
    case 'nod':
      return <NodAnimation role={role} position={position} onComplete={onComplete} />
    case 'jump':
      return <JumpAnimation role={role} position={position} onComplete={onComplete} />
    case 'spin':
      return <SpinAnimation role={role} position={position} onComplete={onComplete} />
    default:
      return null
  }
}

export default InteractionFeedback
