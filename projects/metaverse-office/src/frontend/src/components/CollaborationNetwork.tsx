// Phase 4: 协作关系网络3D可视化组件
import { useState, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Text, Sphere, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useCollaborationNetwork } from '../hooks/useMetaverseData'

interface CollaborationNetworkProps {
  organizationId?: string
}

// 连线类型颜色
const EDGE_COLORS: Record<string, string> = {
  hierarchy: '#2196f3',      // 层级关系 - 蓝色
  collaboration: '#4caf50',  // 协作关系 - 绿色
  meeting: '#ff9800'         // 会议关系 - 橙色
}

export function CollaborationNetwork({ organizationId }: CollaborationNetworkProps) {
  const { network, isLoading } = useCollaborationNetwork(organizationId)
  const groupRef = useRef<THREE.Group>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  // 缓慢旋转
  useFrame((state) => {
    if (groupRef.current && !selectedNode) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  if (isLoading || !network) {
    return null
  }

  // 布局计算 - 圆形布局
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number; z: number }> = {}
    const radius = 12
    const nodeCount = network.nodes.length
    
    network.nodes.forEach((node, index) => {
      if (node.position) {
        positions[node.id] = node.position
      } else {
        const angle = (index / nodeCount) * Math.PI * 2
        positions[node.id] = {
          x: Math.cos(angle) * radius,
          y: Math.sin(index * 0.5) * 2,  // 稍微错开高度
          z: Math.sin(angle) * radius
        }
      }
    })
    
    return positions
  }, [network.nodes])

  return (
    <group ref={groupRef} position={[0, 15, -20]}>
      {/* 标题 */}
      <Text
        position={[0, 10, 0]}
        fontSize={1.5}
        color="#333"
        anchorX="center"
      >
        协作关系网络
      </Text>

      {/* 统计信息 */}
      <Html position={[-15, 8, 0]}>
        <div style={{
          background: 'rgba(255,255,255,0.9)',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div>总人数: {network.stats.totalAgents}</div>
          <div>连接数: {network.stats.totalConnections}</div>
          <div>平均连接: {network.stats.avgConnections.toFixed(1)}</div>
          <div>孤立节点: {network.stats.isolatedAgents}</div>
          <div>群组数: {network.stats.clusters}</div>
        </div>
      </Html>

      {/* 连线 */}
      {network.edges.map(edge => (
        <NetworkEdge
          key={edge.id}
          edge={edge}
          sourcePos={nodePositions[edge.source]}
          targetPos={nodePositions[edge.target]}
          isHighlighted={selectedNode === edge.source || selectedNode === edge.target}
        />
      ))}

      {/* 节点 */}
      {network.nodes.map(node => (
        <NetworkNode
          key={node.id}
          node={node}
          position={nodePositions[node.id]}
          isSelected={selectedNode === node.id}
          onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
        />
      ))}

      {/* 选中节点详情 */}
      {selectedNode && (
        <NodeDetailPanel
          node={network.nodes.find(n => n.id === selectedNode)!}
          edges={network.edges.filter(e => e.source === selectedNode || e.target === selectedNode)}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </group>
  )
}

// 网络节点
function NetworkNode({ 
  node, 
  position, 
  isSelected, 
  onClick 
}: { 
  node: any
  position: { x: number; y: number; z: number }
  isSelected: boolean
  onClick: () => void 
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // 根据状态设置颜色
  const getStatusColor = () => {
    switch (node.data?.status) {
      case 'working': return '#4caf50'
      case 'busy': return '#f44336'
      case 'meeting': return '#ff9800'
      case 'idle': return '#2196f3'
      default: return '#9e9e9e'
    }
  }

  const color = getStatusColor()
  const scale = isSelected ? 1.5 : hovered ? 1.3 : 1.0

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1)
      
      // 选中时添加发光效果
      if (isSelected) {
        const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.1
        meshRef.current.scale.multiplyScalar(pulse)
      }
    }
  })

  // 根据连接数调整大小
  const baseSize = 0.4 + (node.data?.activeTaskCount || 0) * 0.1

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* 节点主体 */}
      <Sphere
        ref={meshRef}
        args={[baseSize, 16, 16]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.6 : hovered ? 0.4 : 0.2}
        />
      </Sphere>

      {/* 选中时的光环 */}
      {isSelected && (
        <mesh>
          <ringGeometry args={[baseSize * 1.5, baseSize * 1.8, 32]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* 名称标签 */}
      <Text
        position={[0, baseSize + 0.5, 0]}
        fontSize={0.5}
        color="#333"
        anchorX="center"
      >
        {node.label}
      </Text>

      {/* 角色标签 */}
      {node.data?.role?.name && (
        <Text
          position={[0, baseSize + 1, 0]}
          fontSize={0.3}
          color="#666"
          anchorX="center"
        >
          {node.data.role.name}
        </Text>
      )}

      {/* 悬停详情 */}
      {(hovered || isSelected) && (
        <Html distanceFactor={10}>
          <div style={{
            background: 'rgba(0,0,0,0.85)',
            color: 'white',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            whiteSpace: 'nowrap'
          }}>
            <div><strong>{node.label}</strong></div>
            <div>状态: {node.data?.status || 'unknown'}</div>
            <div>活跃任务: {node.data?.activeTaskCount || 0}</div>
            {node.data?.role?.name && <div>角色: {node.data.role.name}</div>}
          </div>
        </Html>
      )}
    </group>
  )
}

// 网络连线
function NetworkEdge({ 
  edge, 
  sourcePos, 
  targetPos, 
  isHighlighted 
}: { 
  edge: any
  sourcePos?: { x: number; y: number; z: number }
  targetPos?: { x: number; y: number; z: number }
  isHighlighted: boolean 
}) {
  if (!sourcePos || !targetPos) return null

  const points = [
    new THREE.Vector3(sourcePos.x, sourcePos.y, sourcePos.z),
    new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z)
  ]

  // 根据连线类型确定颜色
  const type = edge.types?.[0] || 'collaboration'
  const color = EDGE_COLORS[type] || '#9e9e9e'
  
  // 根据权重调整线宽
  const lineWidth = isHighlighted ? 3 : 1 + (edge.weight || 0) * 2

  return (
    <group>
      <Line
        points={points}
        color={color}
        lineWidth={lineWidth}
        transparent
        opacity={isHighlighted ? 1 : 0.6}
      />
      
      {/* 动画粒子（高亮时） */}
      {isHighlighted && edge.animated && (
        <AnimatedParticle points={points} color={color} />
      )}
    </group>
  )
}

// 动画粒子
function AnimatedParticle({ points, color }: { points: THREE.Vector3[]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const progress = useRef(0)

  useFrame((_, delta) => {
    if (meshRef.current) {
      progress.current += delta * 0.5
      if (progress.current > 1) progress.current = 0
      
      const position = new THREE.Vector3().lerpVectors(
        points[0],
        points[points.length - 1],
        progress.current
      )
      meshRef.current.position.copy(position)
    }
  })

  return (
    <Sphere ref={meshRef} args={[0.15]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
    </Sphere>
  )
}

// 节点详情面板
function NodeDetailPanel({ 
  node, 
  edges, 
  onClose 
}: { 
  node: any
  edges: any[]
  onClose: () => void 
}) {
  const collaborators = edges.map(e => 
    e.source === node.id ? e.target : e.source
  )

  return (
    <Html position={[8, 0, 0]} distanceFactor={8}>
      <div style={{
        background: 'white',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        minWidth: '200px',
        fontSize: '13px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <strong style={{ fontSize: '15px' }}>{node.label}</strong>
          <button 
            onClick={onClose}
            style={{ 
              border: 'none', 
              background: 'none', 
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{ marginBottom: '8px' }}>
          <span style={{ color: '#666' }}>状态: </span>
          <span style={{ 
            padding: '2px 8px', 
            borderRadius: '10px',
            background: node.data?.status === 'working' ? '#e8f5e9' :
                       node.data?.status === 'busy' ? '#ffebee' :
                       node.data?.status === 'meeting' ? '#fff3e0' : '#f5f5f5',
            color: node.data?.status === 'working' ? '#2e7d32' :
                   node.data?.status === 'busy' ? '#c62828' :
                   node.data?.status === 'meeting' ? '#ef6c00' : '#616161'
          }}>
            {node.data?.status || 'unknown'}
          </span>
        </div>
        
        {node.data?.role?.name && (
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: '#666' }}>角色: </span>
            {node.data.role.name}
          </div>
        )}
        
        <div style={{ marginBottom: '8px' }}>
          <span style={{ color: '#666' }}>活跃任务: </span>
          {node.data?.activeTaskCount || 0}
        </div>
        
        <div style={{ marginBottom: '8px' }}>
          <span style={{ color: '#666' }}>连接数: </span>
          {edges.length}
        </div>
        
        {collaborators.length > 0 && (
          <div>
            <div style={{ color: '#666', marginBottom: '4px' }}>协作者:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {collaborators.map((id, idx) => (
                <span 
                  key={idx}
                  style={{
                    padding: '2px 8px',
                    background: '#e3f2fd',
                    borderRadius: '10px',
                    fontSize: '11px'
                  }}
                >
                  {id.slice(0, 8)}...
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Html>
  )
}

export default CollaborationNetwork
