// 物理约束走动系统 - 带碰撞检测的卡通AI角色
import React, { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ManagerRole } from '../data/managers'

// 角色配置
const AGENT_CONFIG: Record<string, { name: string, color: string, icon: string, height: number, scale: number }> = {
  marketing: { name: 'AI市场专员', color: '#E91E63', icon: '🎯', height: 1.45, scale: 0.95 },
  solution: { name: 'AI方案专家', color: '#9C27B0', icon: '💡', height: 1.5, scale: 1.0 },
  developer: { name: 'AI研发专家', color: '#2196F3', icon: '💻', height: 1.5, scale: 1.0 },
  devops: { name: 'AI交付运维', color: '#00BCD4', icon: '🚀', height: 1.45, scale: 0.95 },
  project: { name: 'AI项目管家', color: '#FF9800', icon: '📊', height: 1.55, scale: 1.05 },
  finance: { name: 'AI财务专家', color: '#4CAF50', icon: '💰', height: 1.45, scale: 0.95 },
  assistant: { name: 'AI院长助理', color: '#F44336', icon: '👔', height: 1.55, scale: 1.05 },
  president: { name: 'AI院长', color: '#F44336', icon: '👔', height: 1.6, scale: 1.1 },
  vp: { name: 'AI副院长', color: '#FF9800', icon: '🎖️', height: 1.55, scale: 1.05 },
  cto: { name: 'AI总工', color: '#2196F3', icon: '🔬', height: 1.5, scale: 1.0 },
  product: { name: 'AI产品经理', color: '#9C27B0', icon: '📱', height: 1.45, scale: 0.95 },
  operations: { name: 'AI运营经理', color: '#00BCD4', icon: '⚙️', height: 1.4, scale: 0.9 }
}

// ==================== 物理约束配置 ====================

// 四合院场景边界
const COURTYARD_BOUNDS: Bounds = {
  minX: -13,
  maxX: 13,
  minZ: -13,
  maxZ: 13,
  // 建筑物碰撞区域（不能进入）
  obstacles: [
    // 北房
    { type: 'rect', minX: -6, maxX: 6, minZ: -14, maxZ: -8 },
    // 南房
    { type: 'rect', minX: -6, maxX: 6, minZ: 8, maxZ: 14 },
    // 东厢房
    { type: 'rect', minX: 8, maxX: 14, minZ: -4, maxZ: 4 },
    // 西厢房
    { type: 'rect', minX: -14, maxX: -8, minZ: -4, maxZ: 4 },
  ]
}

// 会议室场景边界
const MEETING_ROOM_BOUNDS: Bounds = {
  minX: -18,
  maxX: 18,
  minZ: -18,
  maxZ: 18,
  // 障碍物：会议桌（不能上桌子）
  obstacles: [
    // 中央会议桌（椭圆形）
    { type: 'ellipse', centerX: 0, centerZ: 0, radiusX: 8.5, radiusZ: 5.5 },
    // 大屏幕前方区域（留空）
    { type: 'rect', minX: -8, maxX: 8, minZ: -18, maxZ: -15, isClearArea: true },
  ]
}

// Agent半径（用于碰撞检测）
const AGENT_RADIUS = 0.8

// 其他Agent的避让距离
const AVOIDANCE_DISTANCE = 2.5

// 椅子位置（会议室场景）- 围绕会议桌
const CHAIR_POSITIONS: Array<{ x: number, z: number, rotation: number }> = [
  { x: 9, z: 0, rotation: -Math.PI / 2 },      // 右侧
  { x: 7.8, z: 4.5, rotation: -Math.PI / 3 },  // 右下
  { x: 4.5, z: 7.8, rotation: -Math.PI / 6 },  // 下右
  { x: 0, z: 9, rotation: 0 },                 // 下方
  { x: -4.5, z: 7.8, rotation: Math.PI / 6 },  // 下左
  { x: -7.8, z: 4.5, rotation: Math.PI / 3 },  // 左下
  { x: -9, z: 0, rotation: Math.PI / 2 },      // 左侧
  { x: -7.8, z: -4.5, rotation: Math.PI * 2 / 3 }, // 左上
  { x: -4.5, z: -7.8, rotation: Math.PI * 5 / 6 }, // 上左
  { x: 0, z: -9, rotation: Math.PI },          // 上方
  { x: 4.5, z: -7.8, rotation: -Math.PI * 5 / 6 }, // 上右
  { x: 7.8, z: -4.5, rotation: -Math.PI * 2 / 3 }, // 右上
]

// 检测距离椅子的距离阈值
const CHAIR_DETECTION_RADIUS = 1.5

// ==================== 接口定义 ====================

interface WalkingCartoonAgentProps {
  agentId: string
  initialPosition: [number, number, number]
  role: ManagerRole
  status?: 'working' | 'idle' | 'meeting' | 'busy' | 'offline'
  onClick?: (agentId: string) => void
  isSelected?: boolean
  faceCenter?: boolean
  sceneType?: 'courtyard' | 'office'
  otherAgents?: Array<{ id: string, position: [number, number, number] }>
  chairIndex?: number // 分配的椅子编号（用于会议室场景）
}

const STATUS_COLORS: Record<string, number> = {
  working: 0x4CAF50,
  idle: 0xFFC107,
  meeting: 0x2196F3,
  busy: 0xFF9800,
  offline: 0x9E9E9E
}

// ==================== 碰撞检测工具函数 ====================

// 障碍物类型定义
interface RectObstacle {
  type?: 'rect'
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  isClearArea?: boolean
}

interface EllipseObstacle {
  type: 'ellipse'
  centerX: number
  centerZ: number
  radiusX: number
  radiusZ: number
}

type Obstacle = RectObstacle | EllipseObstacle

interface Bounds {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  obstacles: Obstacle[]
}

// 检查点是否在边界内
function isInBounds(x: number, z: number, bounds: Bounds): boolean {
  if (x < bounds.minX || x > bounds.maxX || z < bounds.minZ || z > bounds.maxZ) {
    return false
  }
  return true
}

// 检查点是否与障碍物碰撞
function checkObstacleCollision(x: number, z: number, obstacles: Obstacle[]): boolean {
  for (const obs of obstacles) {
    if (obs.type === 'ellipse') {
      // 椭圆碰撞检测
      const dx = x - obs.centerX
      const dz = z - obs.centerZ
      const normalizedDist = (dx * dx) / (obs.radiusX * obs.radiusX) + (dz * dz) / (obs.radiusZ * obs.radiusZ)
      if (normalizedDist <= 1) {
        return true // 在椭圆内部（碰撞）
      }
    } else {
      // 矩形碰撞检测
      if (x >= obs.minX && x <= obs.maxX && z >= obs.minZ && z <= obs.maxZ && !obs.isClearArea) {
        return true
      }
    }
  }
  return false
}

// 计算避让力
function calculateAvoidanceForce(
  myPos: THREE.Vector3,
  otherPos: THREE.Vector3,
  avoidanceDistance: number
): THREE.Vector3 {
  const diff = new THREE.Vector3().subVectors(myPos, otherPos)
  const dist = diff.length()
  
  if (dist < avoidanceDistance && dist > 0.1) {
    // 距离越近，避让力越大
    const force = (avoidanceDistance - dist) / avoidanceDistance
    diff.normalize().multiplyScalar(force * 3)
    return diff
  }
  return new THREE.Vector3(0, 0, 0)
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

// ==================== 主组件 ====================

function WalkingCartoonAgentComponent({ 
  agentId, 
  initialPosition, 
  role, 
  status = 'idle',
  onClick, 
  isSelected,
  faceCenter = false,
  sceneType = 'courtyard',
  otherAgents = [],
  chairIndex
}: WalkingCartoonAgentProps) {
  const groupRef = useRef<THREE.Group>(null)
  const leftLegRef = useRef<THREE.Mesh>(null)
  const rightLegRef = useRef<THREE.Mesh>(null)
  const leftArmRef = useRef<THREE.Mesh>(null)
  const rightArmRef = useRef<THREE.Mesh>(null)
  const statusLightRef = useRef<THREE.Mesh>(null)
  const bodyRef = useRef<THREE.Mesh>(null) // 身体引用（用于坐下动画）
  
  const config = AGENT_CONFIG[role]
  const [hovered, setHovered] = useState(false)
  
  // 物理位置和状态
  const positionRef = useRef(new THREE.Vector3(...initialPosition))
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0))
  const targetRef = useRef(new THREE.Vector3(...initialPosition))
  const rotationRef = useRef(0)
  const stateRef = useRef<'idle' | 'walking' | 'sitting'>('idle')
  const stateTimerRef = useRef(0)
  const stuckTimerRef = useRef(0)
  
  // 坐下相关状态
  const isSittingRef = useRef(false)
  const sitProgressRef = useRef(0) // 坐下动画进度 0-1
  const assignedChairRef = useRef(chairIndex !== undefined ? CHAIR_POSITIONS[chairIndex % CHAIR_POSITIONS.length] : null)
  
  // 获取当前场景的边界
  const bounds: Bounds = sceneType === 'office' ? MEETING_ROOM_BOUNDS : COURTYARD_BOUNDS
  
  // 创建名字纹理
  const nameTexture = useMemo(() => createNameTexture(config.name, config.color), [config.name, config.color])
  
  // 创建角色图标纹理 - 使用useMemo避免SSR问题
  const iconTexture = useMemo(() => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    ctx.font = '48px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(config.icon, 32, 32)
    return new THREE.CanvasTexture(canvas)
  }, [config.icon])
  
  // 获取移动速度
  const getMovementSpeed = () => {
    switch (status) {
      case 'working': return 1.2
      case 'busy': return 0.8
      case 'meeting': return 0
      case 'offline': return 0
      default: return 2.0
    }
  }
  
  // 生成随机目标点（考虑物理约束）
  const generateRandomTarget = () => {
    let attempts = 0
    let newTarget: THREE.Vector3 | null = null
    
    while (attempts < 20) {
      // 在当前位置周围生成候选点
      const angle = Math.random() * Math.PI * 2
      const distance = 3 + Math.random() * 5
      const candidateX = positionRef.current.x + Math.cos(angle) * distance
      const candidateZ = positionRef.current.z + Math.sin(angle) * distance
      
      // 检查边界
      if (!isInBounds(candidateX, candidateZ, bounds)) {
        attempts++
        continue
      }
      
      // 检查障碍物碰撞
      if (checkObstacleCollision(candidateX, candidateZ, bounds.obstacles)) {
        attempts++
        continue
      }
      
      // 检查与其他Agent的距离
      let tooClose = false
      for (const other of otherAgents) {
        if (other.id !== agentId) {
          const dx = candidateX - other.position[0]
          const dz = candidateZ - other.position[2]
          const dist = Math.sqrt(dx * dx + dz * dz)
          if (dist < AVOIDANCE_DISTANCE) {
            tooClose = true
            break
          }
        }
      }
      
      if (!tooClose) {
        newTarget = new THREE.Vector3(candidateX, 0, candidateZ)
        break
      }
      
      attempts++
    }
    
    // 如果找不到有效目标，在当前位置附近小范围移动
    if (!newTarget) {
      const safeX = Math.max(bounds.minX + 2, Math.min(bounds.maxX - 2, positionRef.current.x + (Math.random() - 0.5) * 2))
      const safeZ = Math.max(bounds.minZ + 2, Math.min(bounds.maxZ - 2, positionRef.current.z + (Math.random() - 0.5) * 2))
      newTarget = new THREE.Vector3(safeX, 0, safeZ)
    }
    
    return newTarget
  }
  
  // 动画循环
  useFrame((state, delta) => {
    if (!groupRef.current) return
    
    const speed = getMovementSpeed()
    
    // 会议中或离线时不移动
    if (speed === 0) {
      // 重置动画
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0
      
      // 面向中心
      if (faceCenter) {
        const targetRotation = Math.atan2(initialPosition[0], initialPosition[2]) + Math.PI
        groupRef.current.rotation.y = targetRotation
      }
      return
    }
    
    // 状态机更新
    stateTimerRef.current += delta
    
    // 每3-8秒切换一次状态
    if (stateTimerRef.current > 3 + Math.random() * 5) {
      stateTimerRef.current = 0
      if (stateRef.current === 'idle') {
        stateRef.current = 'walking'
        targetRef.current = generateRandomTarget()
      } else {
        stateRef.current = 'idle'
      }
    }
    
    // 走路状态
    if (stateRef.current === 'walking') {
      // 计算到目标的方向
      const direction = new THREE.Vector3().subVectors(targetRef.current, positionRef.current)
      const distance = direction.length()
      
      // 到达目标
      if (distance < 0.5) {
        stateRef.current = 'idle'
        stateTimerRef.current = 0
      } else {
        direction.normalize()
        
        // 计算避让力（避免与其他Agent碰撞）
        let avoidanceForce = new THREE.Vector3(0, 0, 0)
        for (const other of otherAgents) {
          if (other.id !== agentId) {
            const otherPos = new THREE.Vector3(...other.position)
            const force = calculateAvoidanceForce(positionRef.current, otherPos, AVOIDANCE_DISTANCE)
            avoidanceForce.add(force)
          }
        }
        
        // 综合方向 = 目标方向 + 避让力
        const finalDirection = direction.clone().add(avoidanceForce).normalize()
        
        // 计算新位置
        const moveDistance = speed * delta
        const newX = positionRef.current.x + finalDirection.x * moveDistance
        const newZ = positionRef.current.z + finalDirection.z * moveDistance
        
        // 碰撞检测 - 边界
        let canMove = isInBounds(newX, newZ, bounds)
        
        // 碰撞检测 - 障碍物
        if (canMove) {
          canMove = !checkObstacleCollision(newX, newZ, bounds.obstacles)
        }
        
        // 碰撞检测 - 其他Agent
        if (canMove) {
          for (const other of otherAgents) {
            if (other.id !== agentId) {
              const dx = newX - other.position[0]
              const dz = newZ - other.position[2]
              const dist = Math.sqrt(dx * dx + dz * dz)
              if (dist < AGENT_RADIUS * 2) {
                canMove = false
                break
              }
            }
          }
        }
        
        if (canMove) {
          // 可以移动
          positionRef.current.x = newX
          positionRef.current.z = newZ
          stuckTimerRef.current = 0
          
          // 更新朝向
          const targetRotation = Math.atan2(finalDirection.x, finalDirection.z)
          let diff = targetRotation - rotationRef.current
          while (diff > Math.PI) diff -= Math.PI * 2
          while (diff < -Math.PI) diff += Math.PI * 2
          rotationRef.current += diff * delta * 5
        } else {
          // 被卡住，尝试找新目标
          stuckTimerRef.current += delta
          if (stuckTimerRef.current > 1) {
            targetRef.current = generateRandomTarget()
            stuckTimerRef.current = 0
          }
        }
        
        // 走路动画
        const walkCycle = Math.sin(state.clock.elapsedTime * 8) * 0.5
        if (leftLegRef.current) leftLegRef.current.rotation.x = walkCycle
        if (rightLegRef.current) rightLegRef.current.rotation.x = -walkCycle
        if (leftArmRef.current) leftArmRef.current.rotation.x = -walkCycle * 0.6
        if (rightArmRef.current) rightArmRef.current.rotation.x = walkCycle * 0.6
      }
    } else if (stateRef.current === 'idle') {
      // 待机状态 - 检查是否在椅子附近
      let nearChair = false
      let chairRotation = 0
      
      if (sceneType === 'office' && assignedChairRef.current) {
        const chair = assignedChairRef.current
        const dx = positionRef.current.x - chair.x
        const dz = positionRef.current.z - chair.z
        const distToChair = Math.sqrt(dx * dx + dz * dz)
        
        if (distToChair < CHAIR_DETECTION_RADIUS) {
          nearChair = true
          chairRotation = chair.rotation
        }
      }
      
      if (nearChair && !isSittingRef.current) {
        // 开始坐下
        isSittingRef.current = true
        sitProgressRef.current = 0
        // 转向椅子
        rotationRef.current = chairRotation
      }
      
      if (isSittingRef.current) {
        // 坐下动画
        sitProgressRef.current = Math.min(1, sitProgressRef.current + delta * 2)
        const sitHeight = Math.sin(sitProgressRef.current * Math.PI / 2) * 0.6 // 降低0.6米
        
        // 调整身体位置（坐下）
        if (bodyRef.current) {
          bodyRef.current.position.y = config.height * 0.4 - sitHeight
        }
        
        // 调整腿部姿势（弯曲）
        if (leftLegRef.current) {
          leftLegRef.current.rotation.x = -sitProgressRef.current * Math.PI / 2
          leftLegRef.current.position.y = config.height * 0.15 + sitHeight * 0.5
        }
        if (rightLegRef.current) {
          rightLegRef.current.rotation.x = -sitProgressRef.current * Math.PI / 2
          rightLegRef.current.position.y = config.height * 0.15 + sitHeight * 0.5
        }
        
        // 手臂自然放在腿上
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = -sitProgressRef.current * Math.PI / 6
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -sitProgressRef.current * Math.PI / 6
        }
      } else {
        // 普通待机 - 重置动画
        if (leftLegRef.current) {
          leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, delta * 5)
          leftLegRef.current.position.y = config.height * 0.15
        }
        if (rightLegRef.current) {
          rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, delta * 5)
          rightLegRef.current.position.y = config.height * 0.15
        }
        if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, delta * 5)
        if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, delta * 5)
        
        // 恢复身体高度
        if (bodyRef.current) {
          bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, config.height * 0.4, delta * 5)
        }
      }
    }
    
    // 如果离开椅子范围，站起来
    if (isSittingRef.current && assignedChairRef.current) {
      const chair = assignedChairRef.current
      const dx = positionRef.current.x - chair.x
      const dz = positionRef.current.z - chair.z
      const distToChair = Math.sqrt(dx * dx + dz * dz)
      
      if (distToChair > CHAIR_DETECTION_RADIUS * 1.5) {
        isSittingRef.current = false
        sitProgressRef.current = 0
      }
    }
    
    // 更新位置
    groupRef.current.position.copy(positionRef.current)
    groupRef.current.rotation.y = rotationRef.current
    
    // 选中效果
    if (isSelected) {
      groupRef.current.rotation.y += delta * 2
    }
  })
  
  const s = config.scale
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.idle
  
  return (
    <group
      ref={groupRef}
      position={initialPosition}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(agentId)
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* 选中光环 */}
      {isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.5, 32]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
        </mesh>
      )}
      
      {/* 悬停效果 */}
      {hovered && !isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.1, 1.3, 32]} />
          <meshBasicMaterial color={config.color} transparent opacity={0.5} />
        </mesh>
      )}
      
      {/* 角色模型 */}
      <group scale={[s, s, s]}>
        {/* 身体 */}
        <mesh ref={bodyRef} position={[0, config.height * 0.4, 0]} castShadow>
          <boxGeometry args={[0.6, config.height * 0.5, 0.4]} />
          <meshStandardMaterial color={config.color} />
        </mesh>
        
        {/* 头部 */}
        <mesh position={[0, config.height * 0.85, 0]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color={config.color} />
        </mesh>
        
        {/* 脸部 */}
        <mesh position={[0, config.height * 0.85, 0.26]}>
          <planeGeometry args={[0.35, 0.35]} />
          <meshBasicMaterial color="#FFF8E7" />
        </mesh>
        
        {/* 眼睛 */}
        <mesh position={[-0.1, config.height * 0.9, 0.45]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#333" />
        </mesh>
        <mesh position={[0.1, config.height * 0.9, 0.45]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#333" />
        </mesh>
        
        {/* 角色图标 */}
        {iconTexture && (
          <mesh position={[0, config.height * 1.15, 0]}>
            <planeGeometry args={[0.5, 0.5]} />
            <meshBasicMaterial map={iconTexture} transparent />
          </mesh>
        )}
        
        {/* 左手臂 */}
        <mesh ref={leftArmRef} position={[-0.4 * s, config.height * 0.5, 0]}>
          <boxGeometry args={[0.15, 0.6, 0.15]} />
          <meshStandardMaterial color={config.color} />
        </mesh>
        
        {/* 右手臂 */}
        <mesh ref={rightArmRef} position={[0.4 * s, config.height * 0.5, 0]}>
          <boxGeometry args={[0.15, 0.6, 0.15]} />
          <meshStandardMaterial color={config.color} />
        </mesh>
        
        {/* 左腿 */}
        <mesh ref={leftLegRef} position={[-0.15, config.height * 0.15, 0]}>
          <boxGeometry args={[0.2, config.height * 0.3, 0.2]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        
        {/* 右腿 */}
        <mesh ref={rightLegRef} position={[0.15, config.height * 0.15, 0]}>
          <boxGeometry args={[0.2, config.height * 0.3, 0.2]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </group>
      
      {/* 名字标签 */}
      <mesh position={[0, config.height + 0.8, 0]}>
        <planeGeometry args={[2, 0.5]} />
        <meshBasicMaterial map={nameTexture} transparent alphaTest={0.1} />
      </mesh>
      
      {/* 状态指示灯 */}
      <mesh ref={statusLightRef} position={[0, config.height + 0.3, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color={statusColor} 
          emissive={statusColor}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  )
}

export const WalkingCartoonAgent = React.memo(WalkingCartoonAgentComponent)
