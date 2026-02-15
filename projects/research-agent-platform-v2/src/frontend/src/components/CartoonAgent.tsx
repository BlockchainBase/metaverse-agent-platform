import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { AgentRole, ROLE_CONFIG } from '../data/agents'

// 走动区域限制（四合院内）
const WALK_BOUNDS = {
  minX: -18,
  maxX: 18,
  minZ: -18,
  maxZ: 18
}

interface WalkingCartoonAgentProps {
  initialPosition: [number, number, number]
  role: AgentRole
  onClick?: (role: AgentRole) => void
  isSelected?: boolean
}

// 生成名字标签纹理
function createNameTexture(name: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.fillRect(0, 0, 256, 64)
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 256, 8)
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.strokeRect(0, 0, 256, 64)
  ctx.fillStyle = '#333'
  ctx.font = 'bold 24px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(name, 128, 36)
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

// 生成表情纹理
function createEmojiTexture(emoji: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  
  // 圆形背景
  ctx.fillStyle = '#FFE4B5'
  ctx.beginPath()
  ctx.arc(64, 64, 60, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#DEB887'
  ctx.lineWidth = 4
  ctx.stroke()
  
  // Emoji
  ctx.font = '72px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, 64, 68)
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export function WalkingCartoonAgent({ 
  initialPosition, 
  role, 
  onClick, 
  isSelected 
}: WalkingCartoonAgentProps) {
  const meshRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const [currentPos, setCurrentPos] = useState(new THREE.Vector3(...initialPosition))
  const [targetPos, setTargetPos] = useState(new THREE.Vector3(...initialPosition))
  const [isWalking, setIsWalking] = useState(false)
  const walkSpeed = 0.02
  const pauseDuration = 2000 // 暂停时间(ms)
  const [pauseEndTime, setPauseEndTime] = useState(0)
  
  const config = ROLE_CONFIG[role]
  
  // 生成纹理
  const nameTexture = useMemo(() => createNameTexture(config.name, config.color), [config.name, config.color])
  const emojiTexture = useMemo(() => createEmojiTexture(config.emoji), [config.emoji])
  
  // 随机走动逻辑
  useFrame((state) => {
    if (!meshRef.current) return
    
    const now = state.clock.elapsedTime * 1000
    
    // 如果在暂停中，不移动
    if (now < pauseEndTime) {
      setIsWalking(false)
      // 呼吸动画
      meshRef.current.position.y = currentPos.y + Math.sin(state.clock.elapsedTime * 2) * 0.05
      return
    }
    
    // 检查是否到达目标
    const distance = currentPos.distanceTo(targetPos)
    
    if (distance < 0.1) {
      // 到达目标，设置新的随机目标
      setIsWalking(false)
      setPauseEndTime(now + pauseDuration + Math.random() * 2000)
      
      // 生成新的随机目标（在初始位置附近）
      const newTarget = new THREE.Vector3(
        initialPosition[0] + (Math.random() - 0.5) * 8,
        initialPosition[1],
        initialPosition[2] + (Math.random() - 0.5) * 8
      )
      
      // 限制在走动区域内
      newTarget.x = Math.max(WALK_BOUNDS.minX, Math.min(WALK_BOUNDS.maxX, newTarget.x))
      newTarget.z = Math.max(WALK_BOUNDS.minZ, Math.min(WALK_BOUNDS.maxZ, newTarget.z))
      
      setTargetPos(newTarget)
    } else {
      // 向目标移动
      setIsWalking(true)
      const direction = new THREE.Vector3().subVectors(targetPos, currentPos).normalize()
      currentPos.add(direction.multiplyScalar(walkSpeed))
      
      // 更新位置
      meshRef.current.position.x = currentPos.x
      meshRef.current.position.z = currentPos.z
      meshRef.current.position.y = currentPos.y + Math.sin(state.clock.elapsedTime * (isWalking ? 8 : 2)) * 0.08
      
      // 面向目标方向
      const angle = Math.atan2(direction.x, direction.z)
      meshRef.current.rotation.y = angle
    }
  })
  
  return (
    <group 
      ref={meshRef}
      position={initialPosition}
      onClick={() => onClick?.(role)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* 选择光环 */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[1.2, 1.5, 32]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
        </mesh>
      )}
      
      {/* 悬浮光环 */}
      {hovered && !isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[1.2, 1.5, 32]} />
          <meshBasicMaterial color={config.color} transparent opacity={0.5} />
        </mesh>
      )}
      
      {/* 身体 - 使用角色颜色 */}
      <mesh position={[0, config.height * 0.3, 0]} castShadow>
        <capsuleGeometry args={[0.5 * config.scale, config.height * 0.6, 4, 8]} />
        <meshStandardMaterial 
          color={config.color} 
          emissive={config.color}
          emissiveIntensity={hovered ? 0.3 : 0.1}
        />
      </mesh>
      
      {/* 头部 */}
      <mesh position={[0, config.height * 0.85, 0]} castShadow>
        <sphereGeometry args={[0.4 * config.scale, 32, 32]} />
        <meshStandardMaterial color="#FFE4B5" />
      </mesh>
      
      {/* Emoji面部 */}
      <mesh position={[0, config.height * 0.85, 0.35 * config.scale]}>
        <planeGeometry args={[0.5 * config.scale, 0.5 * config.scale]} />
        <meshBasicMaterial map={emojiTexture} transparent />
      </mesh>
      
      {/* 名字标签 */}
      <mesh position={[0, config.height + 0.6, 0]}>
        <planeGeometry args={[1.5, 0.375]} />
        <meshBasicMaterial map={nameTexture} transparent side={THREE.DoubleSide} />
      </mesh>
      
      {/* 状态指示器 */}
      <mesh position={[0.6 * config.scale, config.height * 0.85, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#4CAF50" />
      </mesh>
      
      {/* 手臂 - 简单圆柱体 */}
      <mesh position={[-0.6 * config.scale, config.height * 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.12 * config.scale, 0.12 * config.scale, config.height * 0.4]} />
        <meshStandardMaterial color={config.color} />
      </mesh>
      <mesh position={[0.6 * config.scale, config.height * 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.12 * config.scale, 0.12 * config.scale, config.height * 0.4]} />
        <meshStandardMaterial color={config.color} />
      </mesh>
      
      {/* 腿部 */}
      <mesh position={[-0.25 * config.scale, config.height * 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.15 * config.scale, 0.15 * config.scale, config.height * 0.3]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.25 * config.scale, config.height * 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.15 * config.scale, 0.15 * config.scale, config.height * 0.3]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  )
}