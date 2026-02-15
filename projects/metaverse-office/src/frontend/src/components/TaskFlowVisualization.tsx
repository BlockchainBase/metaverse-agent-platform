// Phase 4: 任务流3D管道可视化组件
import { useEffect, useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Text, Box, Sphere, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useTaskFlow, usePipelineAnimation } from '../hooks/useMetaverseData'

interface TaskFlowVisualizationProps {
  organizationId?: string
  processInstanceId?: string
}

// 任务状态颜色映射
const STATUS_COLORS: Record<string, string> = {
  completed: '#4caf50',
  in_progress: '#ff9800',
  pending: '#9e9e9e',
  assigned: '#2196f3',
  delayed: '#f44336'
}

// 优先级大小映射
const PRIORITY_SCALE: Record<string, number> = {
  urgent: 1.5,
  high: 1.2,
  medium: 1.0,
  low: 0.8
}

export function TaskFlowVisualization({ organizationId, processInstanceId }: TaskFlowVisualizationProps) {
  const { taskFlow, isLoading } = useTaskFlow(organizationId, processInstanceId)
  const { events } = usePipelineAnimation(organizationId)
  const [animatedTasks, setAnimatedTasks] = useState<Set<string>>(new Set())
  const groupRef = useRef<THREE.Group>(null)

  // 处理管道事件
  useEffect(() => {
    if (events.length > 0) {
      const latestEvent = events[0]
      if (latestEvent.taskId) {
        setAnimatedTasks(prev => new Set([...prev, latestEvent.taskId]))
        setTimeout(() => {
          setAnimatedTasks(prev => {
            const next = new Set(prev)
            next.delete(latestEvent.taskId)
            return next
          })
        }, 2000)
      }
    }
  }, [events])

  // 旋转动画
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
    }
  })

  if (isLoading || !taskFlow) {
    return null
  }

  return (
    <group ref={groupRef} position={[0, 10, 0]}>
      {/* 标题 */}
      <Text
        position={[0, 8, 0]}
        fontSize={1.5}
        color="#333"
        anchorX="center"
        anchorY="middle"
      >
        任务流可视化
      </Text>

      {/* 统计信息 */}
      <Html position={[-15, 6, 0]}>
        <div style={{
          background: 'rgba(255,255,255,0.9)',
          padding: '10px 15px',
          borderRadius: '8px',
          fontSize: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div>总任务: {taskFlow.stats.total}</div>
          <div style={{ color: '#4caf50' }}>已完成: {taskFlow.stats.completed}</div>
          <div style={{ color: '#ff9800' }}>进行中: {taskFlow.stats.inProgress}</div>
          <div style={{ color: '#9e9e9e' }}>待处理: {taskFlow.stats.pending}</div>
        </div>
      </Html>

      {/* 任务节点 */}
      {taskFlow.nodes.filter(n => n.type === 'task').map((node, index) => (
        <TaskNode
          key={node.id}
          node={node}
          isAnimated={animatedTasks.has(node.id)}
          index={index}
        />
      ))}

      {/* 依赖连线 */}
      {taskFlow.edges.filter(e => e.type === 'dependency').map(edge => (
        <TaskEdge key={edge.id} edge={edge} nodes={taskFlow.nodes} />
      ))}

      {/* 分配连线 */}
      {taskFlow.edges.filter(e => e.type === 'assignment').map(edge => (
        <AssignmentEdge key={edge.id} edge={edge} nodes={taskFlow.nodes} />
      ))}

      {/* 协作连线 */}
      {taskFlow.edges.filter(e => e.type === 'collaboration').map(edge => (
        <CollaborationEdge key={edge.id} edge={edge} nodes={taskFlow.nodes} />
      ))}
    </group>
  )
}

// 任务节点组件
function TaskNode({ node, isAnimated, index }: { node: any; isAnimated: boolean; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const color = STATUS_COLORS[node.data.status] || '#9e9e9e'
  const scale = PRIORITY_SCALE[node.data.priority] || 1.0
  const position = node.position || { x: (index % 10) * 3 - 15, y: Math.floor(index / 10) * 2, z: 0 }

  useFrame((state) => {
    if (meshRef.current) {
      if (isAnimated) {
        meshRef.current.scale.setScalar(scale * (1 + Math.sin(state.clock.elapsedTime * 10) * 0.2))
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1)
      }
      
      // 进行中的任务添加脉冲效果
      if (node.data.status === 'in_progress') {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
        meshRef.current.scale.multiplyScalar(pulse)
      }
    }
  })

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* 任务主体 */}
      <Box
        ref={meshRef}
        args={[1.5, 0.8, 1.5]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
        />
      </Box>

      {/* 进度指示器 */}
      {node.data.progress !== undefined && (
        <group position={[0, -0.6, 0]}>
          <Box args={[1.4, 0.1, 0.1]}>
            <meshStandardMaterial color="#e0e0e0" />
          </Box>
          <Box 
            args={[1.4 * (node.data.progress / 100), 0.1, 0.1]}
            position={[-0.7 + 0.7 * (node.data.progress / 100), 0, 0.06]}
          >
            <meshStandardMaterial color="#4caf50" />
          </Box>
        </group>
      )}

      {/* 标签 */}
      <Text
        position={[0, 1, 0]}
        fontSize={0.4}
        color="#333"
        anchorX="center"
        maxWidth={4}
      >
        {node.data.title.slice(0, 15)}
      </Text>

      {/* 悬停详情 */}
      {hovered && (
        <Html distanceFactor={10}>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '12px',
            whiteSpace: 'nowrap'
          }}>
            <div><strong>{node.data.title}</strong></div>
            <div>状态: {node.data.status}</div>
            <div>优先级: {node.data.priority}</div>
            {node.data.progress !== undefined && (
              <div>进度: {node.data.progress}%</div>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}

// 任务依赖连线
function TaskEdge({ edge, nodes }: { edge: any; nodes: any[] }) {
  const sourceNode = nodes.find(n => n.id === edge.source)
  const targetNode = nodes.find(n => n.id === edge.target)

  if (!sourceNode?.position || !targetNode?.position) return null

  const points = [
    new THREE.Vector3(sourceNode.position.x, sourceNode.position.y, sourceNode.position.z),
    new THREE.Vector3(targetNode.position.x, targetNode.position.y, targetNode.position.z)
  ]

  const color = edge.data?.isBlocking ? '#f44336' : '#9e9e9e'

  return (
    <Line
      points={points}
      color={color}
      lineWidth={edge.animated ? 3 : 1}
      dashed={!edge.animated}
      dashScale={10}
    />
  )
}

// 分配连线
function AssignmentEdge({ edge, nodes }: { edge: any; nodes: any[] }) {
  const sourceNode = nodes.find(n => n.id === edge.source)
  const targetNode = nodes.find(n => n.id === edge.target)

  if (!sourceNode?.position || !targetNode?.position) return null

  const start = new THREE.Vector3(sourceNode.position.x, sourceNode.position.y, sourceNode.position.z)
  const end = new THREE.Vector3(targetNode.position.x, targetNode.position.y, targetNode.position.z)
  
  // 添加曲线效果
  const mid = start.clone().add(end).multiplyScalar(0.5)
  mid.y += 2

  const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
  const points = curve.getPoints(20)

  return (
    <Line
      points={points}
      color="#2196f3"
      lineWidth={2}
    />
  )
}

// 协作连线
function CollaborationEdge({ edge, nodes }: { edge: any; nodes: any[] }) {
  const sourceNode = nodes.find(n => n.id === edge.source)
  const targetNode = nodes.find(n => n.id === edge.target)

  if (!sourceNode?.position || !targetNode?.position) return null

  const points = [
    new THREE.Vector3(sourceNode.position.x, sourceNode.position.y, sourceNode.position.z),
    new THREE.Vector3(targetNode.position.x, targetNode.position.y, targetNode.position.z)
  ]

  return (
    <group>
      <Line
        points={points}
        color="#9c27b0"
        lineWidth={1}
        transparent
        opacity={0.6}
      />
      {/* 协作标记 */}
      <Sphere
        position={[
          (sourceNode.position.x + targetNode.position.x) / 2,
          (sourceNode.position.y + targetNode.position.y) / 2,
          (sourceNode.position.z + targetNode.position.z) / 2
        ]}
        args={[0.2]}
      >
        <meshStandardMaterial color="#9c27b0" emissive="#9c27b0" emissiveIntensity={0.5} />
      </Sphere>
    </group>
  )
}

export default TaskFlowVisualization
