// v3.0 协商对话气泡组件
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text, Html } from '@react-three/drei'
import { NegotiationRound } from '../services/metaverseData'

interface NegotiationBubblesProps {
  negotiation: NegotiationRound[]
  agentPositions: Map<string, [number, number, number]>
}

// 立场颜色
const STANCE_COLORS = {
  support: '#4CAF50',    // 支持 - 绿色
  challenge: '#F44336',  // 质疑 - 红色
  amend: '#FF9800',      // 补充 - 橙色
  question: '#2196F3',   // 提问 - 蓝色
  accept: '#4CAF50',     // 接受 - 绿色
  reject: '#9E9E9E'      // 拒绝 - 灰色
}

const STANCE_ICONS = {
  support: '✓',
  challenge: '✗',
  amend: '±',
  question: '?',
  accept: '✓',
  reject: '✗'
}

export function NegotiationBubbles({ 
  negotiation, 
  agentPositions 
}: NegotiationBubblesProps) {
  // 只显示最近的3轮协商
  const recentRounds = useMemo(() => {
    return negotiation.slice(-3)
  }, [negotiation])

  if (recentRounds.length === 0) {
    return null
  }

  return (
    <group>
      {recentRounds.map((round, index) => (
        <DialogueBubble
          key={`${round.agentId}-${round.round}`}
          round={round}
          index={index}
          total={recentRounds.length}
          agentPositions={agentPositions}
        />
      ))}
    </group>
  )
}

// 单个对话气泡
function DialogueBubble({ 
  round, 
  index, 
  total,
  agentPositions 
}: { 
  round: NegotiationRound
  index: number
  total: number
  agentPositions: Map<string, [number, number, number]>
}) {
  const bubbleRef = useRef<THREE.Group>(null)
  
  // 获取Agent位置
  const agentPos = agentPositions.get(round.agentId)
  if (!agentPos) return null

  // 计算气泡位置 - 在Agent上方
  const offset = index * 1.5
  const position: [number, number, number] = [
    agentPos[0],
    agentPos[1] + 3 + offset,
    agentPos[2]
  ]

  const color = STANCE_COLORS[round.stance]
  const icon = STANCE_ICONS[round.stance]

  // 浮动动画
  useFrame((state) => {
    if (bubbleRef.current) {
      // 最新气泡浮动更明显
      const floatIntensity = index === total - 1 ? 0.1 : 0.05
      bubbleRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * floatIntensity
    }
  })

  return (
    <group ref={bubbleRef} position={position}>
      {/* 气泡背景 */}
      <mesh castShadow>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.9}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* 立场图标 */}
      <Text
        position={[0, 0, 0.5]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {icon}
      </Text>

      {/* 轮次标记 */}
      <Text
        position={[0.4, 0.4, 0.3]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        #{round.round}
      </Text>

      {/* 连线到Agent */}
      <BubbleToAgentLine 
        from={position} 
        to={agentPos} 
        color={color}
      />

      {/* 详细内容提示 */}
      <Html distanceFactor={8}>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          color: '#333',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          maxWidth: '200px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          pointerEvents: 'none'
        }}>
          <div style={{ fontWeight: 'bold', color }}>
            {round.agentId.slice(0, 8)}... 
            <span style={{ textTransform: 'capitalize' }}>{round.stance}</span>
          </div>
          <div style={{ marginTop: '4px', color: '#666' }}>
            {round.content.slice(0, 50)}...
          </div>
          {round.confidence && (
            <div style={{ marginTop: '4px', fontSize: '10px', color: '#999' }}>
              置信度: {(round.confidence * 100).toFixed(0)}%
            </div>
          )}
        </div>
      </Html>
    </group>
  )
}

// 气泡到Agent的连线
function BubbleToAgentLine({ 
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
    return [start, end]
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
      <lineBasicMaterial color={color} transparent opacity={0.3} />
    </line>
  )
}

// 协商历史时间轴
export function NegotiationTimeline({ 
  negotiation,
  onSelectRound 
}: { 
  negotiation: NegotiationRound[]
  onSelectRound?: (round: NegotiationRound) => void
}) {
  return (
    <Html center position={[0, 15, 0]}>
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        padding: '16px',
        borderRadius: '12px',
        minWidth: '300px',
        maxHeight: '400px',
        overflow: 'auto',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>协商历史</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {negotiation.map((round, index) => (
            <div 
              key={index}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: index === negotiation.length - 1 ? '#E3F2FD' : '#f5f5f5',
                borderLeft: `4px solid ${STANCE_COLORS[round.stance]}`,
                cursor: onSelectRound ? 'pointer' : 'default'
              }}
              onClick={() => onSelectRound?.(round)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '12px' }}>
                  第{round.round}轮
                </span>
                <span style={{ 
                  fontSize: '11px', 
                  color: STANCE_COLORS[round.stance],
                  textTransform: 'capitalize'
                }}>
                  {STANCE_ICONS[round.stance]} {round.stance}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {round.agentId.slice(0, 8)}...: {round.content.slice(0, 30)}...
              </div>
              <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
                {new Date(round.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Html>
  )
}

export default NegotiationBubbles
