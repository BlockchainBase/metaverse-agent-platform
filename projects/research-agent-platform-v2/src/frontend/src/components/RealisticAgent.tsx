import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Billboard, Text } from '@react-three/drei'
import { AgentRole, AGENTS_DATA } from '../data/agents'

interface RealisticAgentProps {
  role: AgentRole
  position: [number, number, number]
  onClick?: () => void
  isSelected?: boolean
}

// 生成名字标签
function createNameLabel(name: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  
  // 背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.roundRect(0, 0, 256, 64, 8)
  ctx.fill()
  
  // 边框
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.roundRect(0, 0, 256, 64, 8)
  ctx.stroke()
  
  // 文字
  ctx.fillStyle = 'white'
  ctx.font = 'bold 24px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(name, 128, 32)
  
  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

// 四合院边界限制
const COURTYARD_BOUNDS = {
  minX: -13,
  maxX: 13,
  minZ: -13,
  maxZ: 13
}

// 检查位置是否在边界内
function isWithinBounds(pos: THREE.Vector3): boolean {
  return (
    pos.x >= COURTYARD_BOUNDS.minX &&
    pos.x <= COURTYARD_BOUNDS.maxX &&
    pos.z >= COURTYARD_BOUNDS.minZ &&
    pos.z <= COURTYARD_BOUNDS.maxZ
  )
}

// 获取边界内的随机位置
function getRandomPositionInBounds(centerX: number, centerZ: number, range: number): THREE.Vector3 {
  let attempts = 0
  let newPos = new THREE.Vector3()
  
  while (attempts < 10) {
    newPos.set(
      centerX + (Math.random() - 0.5) * range,
      0,
      centerZ + (Math.random() - 0.5) * range
    )
    
    if (isWithinBounds(newPos)) {
      return newPos
    }
    attempts++
  }
  
  // 如果随机失败，返回靠近中心的安全位置
  return new THREE.Vector3(centerX, 0, centerZ)
}

export function RealisticAgent({ role, position, onClick, isSelected }: RealisticAgentProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const currentPosRef = useRef(new THREE.Vector3(...position))
  const targetPosRef = useRef(new THREE.Vector3(...position))
  const [isWalking, setIsWalking] = useState(false)
  const walkSpeed = 0.02
  const homePosition = useMemo(() => new THREE.Vector3(...position), [position])
  
  const agent = AGENTS_DATA[role]
  const config = { height: 1.7, scale: 1 }
  
  // 名字标签
  const nameTexture = useMemo(() => 
    createNameLabel(agent.name, agent.color), 
    [agent.name, agent.color]
  )
  
  // 走动动画 - 带防碰撞
  useFrame((state) => {
    if (!groupRef.current) return
    
    const now = state.clock.elapsedTime
    const currentPos = currentPosRef.current
    const targetPos = targetPosRef.current
    
    // 检查是否需要移动到新位置
    const distance = currentPos.distanceTo(targetPos)
    
    if (distance < 0.1) {
      // 到达目标，停留一段时间
      setIsWalking(false)
      
      // 随机时间后移动到新的附近位置
      if (Math.random() < 0.005) {
        targetPosRef.current = getRandomPositionInBounds(homePosition.x, homePosition.z, 6)
      }
    } else {
      // 向目标移动
      setIsWalking(true)
      
      // 计算移动方向
      const direction = new THREE.Vector3().subVectors(targetPos, currentPos).normalize()
      
      // 预测下一步位置
      const nextPos = currentPos.clone().add(direction.clone().multiplyScalar(walkSpeed))
      
      // 防碰撞检测：如果下一步会超出边界，重新选择目标
      if (!isWithinBounds(nextPos)) {
        // 碰到墙了！选择一个新的安全目标
        targetPosRef.current = getRandomPositionInBounds(homePosition.x, homePosition.z, 4)
        setIsWalking(false)
        return
      }
      
      // 安全，执行移动
      currentPos.add(direction.multiplyScalar(walkSpeed))
      
      // 更新位置
      groupRef.current.position.x = currentPos.x
      groupRef.current.position.z = currentPos.z
      
      // 面向移动方向
      const angle = Math.atan2(direction.x, direction.z)
      groupRef.current.rotation.y = angle
    }
    
    // 走动或呼吸动画
    const bobAmount = isWalking ? 0.08 : 0.03
    const bobSpeed = isWalking ? 10 : 2
    groupRef.current.position.y = currentPos.y + Math.sin(now * bobSpeed) * bobAmount
  })

  return (
    <group 
      ref={groupRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* 选择光环 */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[1.2, 1.4, 32]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
        </mesh>
      )}

      {/* 悬浮光环 */}
      {hovered && !isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[1.2, 1.4, 32]} />
          <meshBasicMaterial color={agent.color} transparent opacity={0.5} />
        </mesh>
      )}

      {/* === 类真人三维卡通形象 === */}
      
      {/* 头部 */}
      <mesh position={[0, config.height * 0.85, 0]} castShadow>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color="#FFDBAC" />
      </mesh>

      {/* 头发 */}
      <mesh position={[0, config.height * 0.92, 0]} castShadow>
        <sphereGeometry args={[0.23, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
        <meshStandardMaterial color="#2C1810" />
      </mesh>

      {/* 眼睛 */}
      <mesh position={[-0.08, config.height * 0.87, 0.18]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh position={[0.08, config.height * 0.87, 0.18]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color="white" />
      </mesh>
      {/* 瞳孔 */}
      <mesh position={[-0.08, config.height * 0.87, 0.21]}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color="black" />
      </mesh>
      <mesh position={[0.08, config.height * 0.87, 0.21]}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color="black" />
      </mesh>

      {/* 身体/躯干 */}
      <mesh position={[0, config.height * 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.6, 4, 8]} />
        <meshStandardMaterial color={agent.color} />
      </mesh>

      {/* 领带/领结 */}
      <mesh position={[0, config.height * 0.65, 0.22]}>
        <boxGeometry args={[0.08, 0.15, 0.02]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {/* 左臂 */}
      <mesh position={[-0.35, config.height * 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.5, 4, 8]} />
        <meshStandardMaterial color={agent.color} />
      </mesh>
      {/* 左手 */}
      <mesh position={[-0.35, config.height * 0.25, 0]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#FFDBAC" />
      </mesh>

      {/* 右臂 */}
      <mesh position={[0.35, config.height * 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.5, 4, 8]} />
        <meshStandardMaterial color={agent.color} />
      </mesh>
      {/* 右手 */}
      <mesh position={[0.35, config.height * 0.25, 0]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#FFDBAC" />
      </mesh>

      {/* 左腿 */}
      <mesh position={[-0.12, config.height * 0.15, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
        <meshStandardMaterial color="#1F2937" />
      </mesh>

      {/* 右腿 */}
      <mesh position={[0.12, config.height * 0.15, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
        <meshStandardMaterial color="#1F2937" />
      </mesh>

      {/* 名字标签 - Billboard始终面向相机 */}
      <Billboard position={[0, config.height + 0.4, 0]}>
        <mesh>
          <planeGeometry args={[1.2, 0.3]} />
          <meshBasicMaterial map={nameTexture} transparent side={THREE.DoubleSide} />
        </mesh>
      </Billboard>

      {/* 角色图标（职业标识）- Billboard始终面向相机 */}
      <Billboard position={[0.5, config.height * 0.9, 0]}>
        <Text
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="black"
        >
          {agent.emoji}
        </Text>
      </Billboard>

      {/* 状态指示器 */}
      <mesh position={[-0.35, config.height * 0.95, 0.1]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#10B981" />
      </mesh>
    </group>
  )
}