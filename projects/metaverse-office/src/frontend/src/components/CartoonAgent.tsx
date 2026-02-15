import React, { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ManagerRole } from '../data/managers'

// 角色配置
const AGENT_CONFIG = {
  president: { name: 'AI院长', color: '#DC143C', icon: '👔', height: 1.6, scale: 1.1 },
  vp: { name: 'AI副院长', color: '#FF8C00', icon: '🎖️', height: 1.55, scale: 1.05 },
  cto: { name: 'AI总工', color: '#4169E1', icon: '🔬', height: 1.5, scale: 1.0 },
  product: { name: 'AI产品经理', color: '#9932CC', icon: '📱', height: 1.45, scale: 0.95 },
  marketing: { name: 'AI市场经理', color: '#FF1493', icon: '📢', height: 1.45, scale: 0.95 },
  finance: { name: 'AI财务经理', color: '#228B22', icon: '💰', height: 1.4, scale: 0.9 },
  operations: { name: 'AI运营经理', color: '#008B8B', icon: '⚙️', height: 1.4, scale: 0.9 }
}

// 走动区域限制（四合院内）
const WALK_BOUNDS = {
  minX: -12,
  maxX: 12,
  minZ: -12,
  maxZ: 12
}

// Phase 4: 增强的Agent组件，支持后端数据
interface WalkingCartoonAgentProps {
  agentId: string
  initialPosition: [number, number, number]
  role: ManagerRole
  status?: 'working' | 'idle' | 'meeting' | 'busy' | 'offline'
  onClick?: (agentId: string) => void
  isSelected?: boolean
}

// 状态颜色配置（Three.js十六进制数字格式）
const STATUS_COLORS: Record<string, number> = {
  working: 0x4CAF50,
  idle: 0xFFC107,
  meeting: 0x2196F3,
  busy: 0xFF9800,
  offline: 0x9E9E9E
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

// 走动动画的卡通AI角色 - Phase 4: 支持动态状态
// 使用React.memo优化，避免不必要的重渲染
function WalkingCartoonAgentComponent({ 
  agentId, 
  initialPosition, 
  role, 
  status = 'idle',
  onClick, 
  isSelected 
}: WalkingCartoonAgentProps) {
  const groupRef = useRef<THREE.Group>(null)
  const leftLegRef = useRef<THREE.Mesh>(null)
  const rightLegRef = useRef<THREE.Mesh>(null)
  const leftArmRef = useRef<THREE.Mesh>(null)
  const rightArmRef = useRef<THREE.Mesh>(null)
  const statusLightRef = useRef<THREE.Mesh>(null)
  
  const config = AGENT_CONFIG[role]
  const [hovered, setHovered] = useState(false)
  
  // 位置和状态
  const positionRef = useRef(new THREE.Vector3(...initialPosition))
  const targetRef = useRef(new THREE.Vector3(...initialPosition))
  const rotationRef = useRef(0)
  const stateRef = useRef<'idle' | 'walking'>('idle')
  const stateTimerRef = useRef(0)
  
  // 创建名字纹理
  const nameTexture = useMemo(() => createNameTexture(config.name, config.color), [config.name, config.color])
  
  // 根据状态调整行为
  const getMovementSpeed = () => {
    switch (status) {
      case 'working': return 0.5  // 工作中移动较慢
      case 'busy': return 0.3     // 忙碌时移动很慢
      case 'meeting': return 0    // 会议中不动
      case 'offline': return 0    // 离线不动
      default: return 1.5         // 待机正常速度
    }
  }
  
  // 生成随机目标点
  const generateTarget = () => {
    const x = WALK_BOUNDS.minX + Math.random() * (WALK_BOUNDS.maxX - WALK_BOUNDS.minX)
    const z = WALK_BOUNDS.minZ + Math.random() * (WALK_BOUNDS.maxZ - WALK_BOUNDS.minZ)
    return new THREE.Vector3(x, 0, z)
  }
  
  // 动画
  useFrame((state, delta) => {
    if (!groupRef.current) return
    
    const time = state.clock.elapsedTime
    const speed = getMovementSpeed()
    
    // Phase 4: 状态灯脉冲动画
    if (statusLightRef.current) {
      const pulseIntensity = status === 'working' || status === 'busy' 
        ? 0.5 + Math.sin(time * 3) * 0.3  // 快速脉冲
        : status === 'meeting'
        ? 0.5 + Math.sin(time) * 0.2       // 慢速脉冲
        : 0.3                               // 静态
      const material = statusLightRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = pulseIntensity
    }
    
    // 状态机 - 根据后端状态调整行为
    stateTimerRef.current -= delta
    
    if (stateTimerRef.current <= 0 && speed > 0) {
      // 随机切换状态
      const isWalking = Math.random() > 0.4 // 60%概率走动
      stateRef.current = isWalking ? 'walking' : 'idle'
      stateTimerRef.current = 2 + Math.random() * 4 // 2-6秒
      
      if (isWalking) {
        targetRef.current = generateTarget()
      }
    }
    
    // 走动逻辑 - 使用动态速度
    if (stateRef.current === 'walking' && speed > 0) {
      const direction = new THREE.Vector3().subVectors(targetRef.current, positionRef.current)
      const distance = direction.length()
      
      if (distance > 0.3) {
        direction.normalize()
        positionRef.current.add(direction.multiplyScalar(speed * delta))
        
        // 计算朝向
        const targetRotation = Math.atan2(direction.x, direction.z)
        // 平滑转向
        let diff = targetRotation - rotationRef.current
        while (diff > Math.PI) diff -= Math.PI * 2
        while (diff < -Math.PI) diff += Math.PI * 2
        rotationRef.current += diff * delta * 3
        
        // 腿部摆动动画
        const walkCycle = Math.sin(time * 8) * 0.4
        if (leftLegRef.current) leftLegRef.current.rotation.x = walkCycle
        if (rightLegRef.current) rightLegRef.current.rotation.x = -walkCycle
        
        // 手臂摆动
        if (leftArmRef.current) leftArmRef.current.rotation.x = -walkCycle * 0.6
        if (rightArmRef.current) rightArmRef.current.rotation.x = walkCycle * 0.6
        
        // 身体轻微上下移动
        const bounce = Math.abs(Math.sin(time * 8)) * 0.05
        groupRef.current.position.y = positionRef.current.y + bounce
      } else {
        // 到达目标，切换到idle
        stateRef.current = 'idle'
        stateTimerRef.current = 1 + Math.random() * 2
      }
    } else {
      // Idle状态
      // 腿部复位
      if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, delta * 5)
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, delta * 5)
      if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, delta * 5)
      if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, delta * 5)
      
      // 呼吸动画
      const breath = Math.sin(time * 2) * 0.02
      groupRef.current.position.y = positionRef.current.y + breath
    }
    
    // 应用位置和旋转
    groupRef.current.position.x = positionRef.current.x
    groupRef.current.position.z = positionRef.current.z
    groupRef.current.rotation.y = rotationRef.current
    
    // 选中时额外旋转展示
    if (isSelected) {
      groupRef.current.rotation.y += delta * 2
    }
  })
  
  // 点击检测 - Phase 4: 使用agentId
  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    onClick?.(agentId)
  }
  
  // 悬停效果
  const handlePointerOver = () => {
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }
  
  const handlePointerOut = () => {
    setHovered(false)
    document.body.style.cursor = 'auto'
  }
  
  const s = config.scale * (hovered ? 1.1 : 1)
  
  return (
    <group 
      ref={groupRef} 
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* 点击检测区域 */}
      <mesh visible={false}>
        <boxGeometry args={[1 * s, 2 * s, 1 * s]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* 选中光环 */}
      {isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6 * s, 0.8 * s, 32]} />
          <meshBasicMaterial color={config.color} transparent opacity={0.6} />
        </mesh>
      )}
      
      {/* 阴影 */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35 * s, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>
      
      {/* 身体 */}
      <mesh position={[0, config.height * 0.3 * s, 0]} castShadow>
        <capsuleGeometry args={[0.25 * s, config.height * 0.5 * s, 4, 8]} />
        <meshStandardMaterial color={config.color} roughness={0.5} />
      </mesh>
      
      {/* 头部 */}
      <mesh position={[0, config.height * 0.75 * s, 0]} castShadow>
        <sphereGeometry args={[0.35 * s, 32, 32]} />
        <meshStandardMaterial color="#FFE4C4" roughness={0.6} />
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
      
      {/* 眉毛 */}
      <mesh position={[-0.12 * s, config.height * 0.85 * s, 0.3 * s]}>
        <boxGeometry args={[0.08 * s, 0.02 * s, 0.01]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      <mesh position={[0.12 * s, config.height * 0.85 * s, 0.3 * s]}>
        <boxGeometry args={[0.08 * s, 0.02 * s, 0.01]} />
        <meshBasicMaterial color={config.color} />
      </mesh>
      
      {/* 嘴巴 */}
      <mesh position={[0, config.height * 0.7 * s, 0.32 * s]}>
        <torusGeometry args={[0.05 * s, 0.01, 8, 16, Math.PI]} />
        <meshBasicMaterial color="#FF6B6B" />
      </mesh>
      
      {/* 腮红 */}
      <mesh position={[-0.2 * s, config.height * 0.72 * s, 0.25 * s]}>
        <circleGeometry args={[0.06 * s]} />
        <meshBasicMaterial color="#FFB6C1" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0.2 * s, config.height * 0.72 * s, 0.25 * s]}>
        <circleGeometry args={[0.06 * s]} />
        <meshBasicMaterial color="#FFB6C1" transparent opacity={0.6} />
      </mesh>
      
      {/* 头发 */}
      <mesh position={[0, config.height * 0.95 * s, 0]}>
        <sphereGeometry args={[0.38 * s, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={config.color} />
      </mesh>
      
      {/* 左臂 */}
      <mesh ref={leftArmRef} position={[-0.35 * s, config.height * 0.45 * s, 0]} rotation={[0, 0, Math.PI / 6]}>
        <capsuleGeometry args={[0.06 * s, 0.4 * s]} />
        <meshStandardMaterial color={config.color} />
      </mesh>
      
      {/* 右臂 */}
      <mesh ref={rightArmRef} position={[0.35 * s, config.height * 0.45 * s, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <capsuleGeometry args={[0.06 * s, 0.4 * s]} />
        <meshStandardMaterial color={config.color} />
      </mesh>
      
      {/* 左腿 */}
      <mesh ref={leftLegRef} position={[-0.1 * s, config.height * 0.15 * s, 0]}>
        <capsuleGeometry args={[0.07 * s, 0.3 * s]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
      
      {/* 右腿 */}
      <mesh ref={rightLegRef} position={[0.1 * s, config.height * 0.15 * s, 0]}>
        <capsuleGeometry args={[0.07 * s, 0.3 * s]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
      
      {/* 名字标签 */}
      <mesh position={[0, config.height * s + 0.5, 0]}>
        <planeGeometry args={[1.5, 0.375]} />
        <meshBasicMaterial map={nameTexture} transparent side={THREE.DoubleSide} />
      </mesh>
      
      {/* Phase 4: 状态指示灯 */}
      <mesh 
        ref={statusLightRef}
        position={[0.5 * s, config.height * s + 0.5, 0.1]} 
      >
        <sphereGeometry args={[0.12 * s, 16, 16]} />
        <meshStandardMaterial 
          color={STATUS_COLORS[status] || STATUS_COLORS.idle}
          emissive={STATUS_COLORS[status] || STATUS_COLORS.idle}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* 状态光环 */}
      <mesh 
        position={[0.5 * s, config.height * s + 0.5, 0.1]}
        rotation={[0, 0, 0]}
      >
        <ringGeometry args={[0.15 * s, 0.18 * s, 16]} />
        <meshBasicMaterial 
          color={STATUS_COLORS[status] || STATUS_COLORS.idle}
          transparent 
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// 使用React.memo包装组件，避免不必要的重渲染
export const WalkingCartoonAgent = React.memo(WalkingCartoonAgentComponent, (prevProps, nextProps) => {
  // 自定义比较函数，只在关键属性变化时重新渲染
  return (
    prevProps.agentId === nextProps.agentId &&
    prevProps.role === nextProps.role &&
    prevProps.status === nextProps.status &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.initialPosition[0] === nextProps.initialPosition[0] &&
    prevProps.initialPosition[1] === nextProps.initialPosition[1] &&
    prevProps.initialPosition[2] === nextProps.initialPosition[2]
  )
})
