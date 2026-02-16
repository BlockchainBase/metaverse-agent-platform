// v3.0 协作契约可视化组件
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text, Html } from '@react-three/drei'
import { CollaborationContract, NegotiationRound } from '../services/metaverseData'

interface ContractVisualizationProps {
  contracts: CollaborationContract[]
  agentPositions: Map<string, [number, number, number]>
}

// 契约状态颜色
const CONTRACT_STATUS_COLORS = {
  negotiating: '#FF9800',  // 协商中 - 橙色
  consensus: '#4CAF50',    // 已共识 - 绿色
  executing: '#2196F3',    // 执行中 - 蓝色
  completed: '#9E9E9E',    // 已完成 - 灰色
  intervention: '#F44336'  // 需人类介入 - 红色
}

export function ContractVisualization({ 
  contracts, 
  agentPositions 
}: ContractVisualizationProps) {
  const groupRef = useRef<THREE.Group>(null)

  // 旋转动画
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.02
    }
  })

  // 过滤活跃的契约
  const activeContracts = useMemo(() => {
    return contracts.filter(c => 
      !c.execution?.completedAt && // 未完成的
      c.negotiation.length > 0     // 有协商记录的
    )
  }, [contracts])

  if (activeContracts.length === 0) {
    return null
  }

  return (
    <group ref={groupRef}>
      {/* 标题 */}
      <Text
        position={[0, 12, 0]}
        fontSize={1}
        color="#333"
        anchorX="center"
        anchorY="middle"
      >
        活跃协作契约
      </Text>

      {/* 契约卡片 - 分布在庭院中央 */}
      {activeContracts.map((contract, index) => (
        <ContractCard
          key={contract.contractId}
          contract={contract}
          index={index}
          total={activeContracts.length}
          agentPositions={agentPositions}
        />
      ))}
    </group>
  )
}

// 单个契约卡片
function ContractCard({ 
  contract, 
  index, 
  total,
  agentPositions 
}: { 
  contract: CollaborationContract
  index: number
  total: number
  agentPositions: Map<string, [number, number, number]>
}) {
  const cardRef = useRef<THREE.Group>(null)
  
  // 计算位置 - 分布在庭院中央上方
  const angle = (index / Math.max(total, 1)) * Math.PI * 2
  const radius = 8
  const position: [number, number, number] = [
    Math.cos(angle) * radius,
    6 + index * 0.5,  // 高度错开
    Math.sin(angle) * radius
  ]

  // 获取契约状态
  const status = getContractStatus(contract)
  const color = CONTRACT_STATUS_COLORS[status]

  // 脉冲动画
  useFrame((state) => {
    if (cardRef.current) {
      const pulse = status === 'negotiating' 
        ? 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05
        : 1
      cardRef.current.scale.setScalar(pulse)
    }
  })

  return (
    <group ref={cardRef} position={position}>
      {/* 契约卡片背景 */}
      <mesh castShadow>
        <boxGeometry args={[3, 2, 0.2]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.9}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* 契约标题 */}
      <Text
        position={[0, 0.5, 0.15]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.5}
      >
        {contract.context.description.slice(0, 20)}
      </Text>

      {/* 协商轮数 */}
      <Text
        position={[0, 0, 0.15]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {contract.negotiation.length} 轮协商
      </Text>

      {/* 参与Agent数量 */}
      <Text
        position={[0, -0.5, 0.15]}
        fontSize={0.18}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {getUniqueAgents(contract.negotiation).length} 位Agent参与
      </Text>

      {/* 连线到参与的Agent */}
      {getUniqueAgents(contract.negotiation).map(agentId => {
        const agentPos = agentPositions.get(agentId)
        if (!agentPos) return null
        
        return (
          <ContractAgentLine
            key={agentId}
            from={position}
            to={agentPos}
            color={color}
          />
        )
      })}

      {/* 点击提示 */}
      <Html distanceFactor={10}>
        <div style={{
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          pointerEvents: 'none',
          whiteSpace: 'nowrap'
        }}>
          点击查看详情
        </div>
      </Html>
    </group>
  )
}

// 契约到Agent的连线
function ContractAgentLine({ 
  from, 
  to, 
  color 
}: { 
  from: [number, number, number]
  to: [number, number, number]
  color: string
}) {
  const points = useMemo(() => {
    const start = new THREE.Vector3(...from)
    const end = new THREE.Vector3(...to)
    
    // 添加曲线效果
    const mid = start.clone().add(end).multiplyScalar(0.5)
    mid.y += 2
    
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
    return curve.getPoints(20)
  }, [from, to])

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
      <lineBasicMaterial color={color} transparent opacity={0.5} />
    </line>
  )
}

// 获取契约状态
function getContractStatus(contract: CollaborationContract): keyof typeof CONTRACT_STATUS_COLORS {
  if (contract.humanIntervention?.required && !contract.humanIntervention.resolvedAt) {
    return 'intervention'
  }
  if (contract.execution?.completedAt) {
    return 'completed'
  }
  if (contract.execution?.status === 'inProgress') {
    return 'executing'
  }
  if (contract.consensus?.reached) {
    return 'consensus'
  }
  return 'negotiating'
}

// 获取参与协商的唯一Agent列表
function getUniqueAgents(negotiation: NegotiationRound[]): string[] {
  return Array.from(new Set(negotiation.map(r => r.agentId)))
}

export default ContractVisualization
