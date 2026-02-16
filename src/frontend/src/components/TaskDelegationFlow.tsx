// v3.0 任务委托飞行动画组件
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'

interface TaskDelegationFlowProps {
  fromAgentId: string
  toAgentId: string
  taskTitle: string
  fromPosition: [number, number, number]
  toPosition: [number, number, number]
  status: 'flying' | 'delivered' | 'accepted' | 'rejected'
  onComplete?: () => void
}

// 任务状态颜色
const STATUS_COLORS = {
  flying: '#FF9800',     // 飞行中 - 橙色
  delivered: '#2196F3',  // 已送达 - 蓝色
  accepted: '#4CAF50',   // 已接受 - 绿色
  rejected: '#F44336'    // 已拒绝 - 红色
}

export function TaskDelegationFlow({
  fromAgentId,
  toAgentId,
  taskTitle,
  fromPosition,
  toPosition,
  status,
  onComplete
}: TaskDelegationFlowProps) {
  const cardRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const progressRef = useRef(0)

  // 贝塞尔曲线路径
  const curve = useMemo(() => {
    const start = new THREE.Vector3(...fromPosition)
    const end = new THREE.Vector3(...toPosition)
    const mid = start.clone().add(end).multiplyScalar(0.5)
    mid.y += 5 // 弧线高度
    
    return new THREE.QuadraticBezierCurve3(start, mid, end)
  }, [fromPosition, toPosition])

  // 粒子轨迹
  const particlePositions = useMemo(() => {
    const points = curve.getPoints(50)
    const positions = new Float32Array(points.length * 3)
    points.forEach((p, i) => {
      positions[i * 3] = p.x
      positions[i * 3 + 1] = p.y
      positions[i * 3 + 2] = p.z
    })
    return positions
  }, [curve])

  // 飞行动画
  useFrame((state, delta) => {
    if (status !== 'flying' || !cardRef.current) return

    // 更新进度
    progressRef.current += delta * 0.5 // 2秒飞完
    
    if (progressRef.current >= 1) {
      progressRef.current = 1
      onComplete?.()
    }

    // 获取当前位置
    const point = curve.getPoint(progressRef.current)
    cardRef.current.position.copy(point)

    // 旋转效果
    cardRef.current.rotation.y = progressRef.current * Math.PI * 2
    cardRef.current.rotation.z = Math.sin(progressRef.current * Math.PI) * 0.2

    // 粒子效果
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < positions.length; i += 3) {
        // 粒子跟随任务卡片
        const particleProgress = Math.max(0, progressRef.current - i / positions.length * 0.2)
        if (particleProgress > 0 && particleProgress <= 1) {
          const p = curve.getPoint(particleProgress)
          positions[i] = p.x + (Math.random() - 0.5) * 0.5
          positions[i + 1] = p.y + (Math.random() - 0.5) * 0.5
          positions[i + 2] = p.z + (Math.random() - 0.5) * 0.5
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  const color = STATUS_COLORS[status]

  // 如果是已送达/已接受/已拒绝，固定在目标位置
  const finalPosition = status === 'flying' 
    ? curve.getPoint(0) 
    : new THREE.Vector3(...toPosition)

  return (
    <group>
      {/* 飞行路径线 */}
      <FlyingPath curve={curve} color={color} status={status} />

      {/* 任务卡片 */}
      <group 
        ref={cardRef} 
        position={finalPosition}
        scale={status === 'accepted' ? [1.2, 1.2, 1.2] : [1, 1, 1]}
      >
        {/* 卡片背景 */}
        <mesh castShadow>
          <boxGeometry args={[1.5, 1, 0.1]} />
          <meshStandardMaterial 
            color={color} 
            transparent 
            opacity={0.9}
            emissive={color}
            emissiveIntensity={status === 'flying' ? 0.5 : 0.2}
          />
        </mesh>

        {/* 任务标题 */}
        <Text
          position={[0, 0.2, 0.06]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.3}
        >
          {taskTitle.slice(0, 15)}
        </Text>

        {/* 状态文字 */}
        <Text
          position={[0, -0.2, 0.06]}
          fontSize={0.12}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {status === 'flying' ? '📤 委托中...' : 
           status === 'delivered' ? '📨 已送达' :
           status === 'accepted' ? '✅ 已接受' : '❌ 已拒绝'}
        </Text>

        {/* 接受时的特效 */}
        {status === 'accepted' && <AcceptEffect />}
        {status === 'rejected' && <RejectEffect />}
      </group>

      {/* 粒子拖尾 */}
      {status === 'flying' && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particlePositions.length / 3}
              array={particlePositions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial 
            color={color} 
            size={0.1} 
            transparent 
            opacity={0.6}
          />
        </points>
      )}

      {/* 委托方标识 */}
      <AgentLabel position={fromPosition} agentId={fromAgentId} type="from" />
      
      {/* 受托方标识 */}
      <AgentLabel position={toPosition} agentId={toAgentId} type="to" />
    </group>
  )
}

// 飞行路径线
function FlyingPath({ 
  curve, 
  color,
  status 
}: { 
  curve: THREE.QuadraticBezierCurve3
  color: string
  status: string
}) {
  const points = useMemo(() => curve.getPoints(50), [curve])

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial 
        color={color} 
        transparent 
        opacity={status === 'flying' ? 0.5 : 0.2}
        linewidth={2}
      />
    </line>
  )
}

// Agent标签
function AgentLabel({ 
  position, 
  agentId, 
  type 
}: { 
  position: [number, number, number]
  agentId: string
  type: 'from' | 'to'
}) {
  return (
    <group position={[position[0], position[1] + 2, position[2]]}>
      {/* 标签背景 */}
      <mesh>
        <planeGeometry args={[1.2, 0.4]} />
        <meshBasicMaterial 
          color={type === 'from' ? '#FF9800' : '#4CAF50'} 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* Agent ID */}
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {type === 'from' ? '📤 ' : '📥 '}{agentId.slice(0, 8)}...
      </Text>
    </group>
  )
}

// 接受特效
function AcceptEffect() {
  const ringRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (ringRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.2
      ringRef.current.scale.setScalar(scale)
      ringRef.current.rotation.z += 0.02
    }
  })

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1, 1.3, 32]} />
      <meshBasicMaterial color="#4CAF50" transparent opacity={0.5} side={THREE.DoubleSide} />
    </mesh>
  )
}

// 拒绝特效
function RejectEffect() {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.05
    }
  })

  return (
    <group ref={groupRef}>
      {[0, 1, 2, 3].map(i => (
        <mesh key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshBasicMaterial color="#F44336" />
        </mesh>
      ))}
    </group>
  )
}

// 多个任务委托流的管理组件
interface TaskDelegationManagerProps {
  delegations: Array<{
    id: string
    fromAgentId: string
    toAgentId: string
    taskTitle: string
    fromPosition: [number, number, number]
    toPosition: [number, number, number]
    status: 'flying' | 'delivered' | 'accepted' | 'rejected'
  }>
  agentPositions: Map<string, [number, number, number]>
}

export function TaskDelegationManager({ 
  delegations, 
  agentPositions 
}: TaskDelegationManagerProps) {
  return (
    <group>
      {delegations.map(delegation => (
        <TaskDelegationFlow
          key={delegation.id}
          fromAgentId={delegation.fromAgentId}
          toAgentId={delegation.toAgentId}
          taskTitle={delegation.taskTitle}
          fromPosition={delegation.fromPosition}
          toPosition={delegation.toPosition}
          status={delegation.status}
        />
      ))}
    </group>
  )
}

export default TaskDelegationFlow
