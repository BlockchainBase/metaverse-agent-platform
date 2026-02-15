import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Text } from '@react-three/drei'
import * as THREE from 'three'
import { AGENTS_DATA, AgentRole } from '../data/agents'

interface BrainstormingSpaceProps {
  isActive?: boolean
}

// 讨论主题
const DISCUSSION_TOPICS = [
  {
    id: 'tech-architecture',
    title: '技术架构优化',
    description: '探讨微服务架构的最佳实践',
    initiator: 'solution' as AgentRole,
    participants: ['solution', 'developer', 'delivery', 'project'] as AgentRole[]
  },
  {
    id: 'client-requirements',
    title: '客户需求分析',
    description: '分析XX教育局智慧校园项目的核心需求',
    initiator: 'market' as AgentRole,
    participants: ['market', 'solution', 'director', 'project'] as AgentRole[]
  },
  {
    id: 'resource-allocation',
    title: '资源协调分配',
    description: 'Q2项目资源规划和人员调配',
    initiator: 'project' as AgentRole,
    participants: ['project', 'director', 'finance', 'developer'] as AgentRole[]
  },
  {
    id: 'innovation-ideas',
    title: '创新点子分享',
    description: 'AI助手功能优化和新特性 brainstorming',
    initiator: 'developer' as AgentRole,
    participants: ['developer', 'solution', 'market', 'director'] as AgentRole[]
  }
]

// 预设对话内容
const BRAINSTORMING_MESSAGES: Record<string, string[]> = {
  'tech-architecture': [
    '方案架构师: 我觉得可以采用微服务架构，这样扩展性更好',
    '开发工程师: 同意，但是需要考虑服务间的通信成本',
    '交付专家: 从运维角度，容器化部署会更方便',
    '项目管家: 那我们的交付周期需要调整吗？',
    '方案架构师: 建议先做一个POC验证一下技术可行性',
    '开发工程师: 我可以这周出一个原型demo',
    '交付专家: 需要我提前准备部署环境吗？',
    '项目管家: 好的，那我们下周评审这个方案'
  ],
  'client-requirements': [
    '市场专员: 客户特别强调需要AI智能分析功能',
    '方案架构师: 这个需求技术上完全可以实现',
    '院长助理: 从战略角度，这个项目对我们很重要',
    '项目管家: 那我们需要增加研发资源投入',
    '市场专员: 客户预算充足，关键是交付质量',
    '方案架构师: 我建议分阶段交付，降低风险',
    '院长助理: 可以，先交付核心功能，再迭代优化',
    '项目管家: 我会调整项目计划，确保按时交付'
  ],
  'resource-allocation': [
    '项目管家: Q2我们有5个并行项目，资源比较紧张',
    '院长助理: 优先级怎么排？',
    '财务助手: 从收益角度，智慧校园项目ROI最高',
    '开发工程师: 我们团队人手确实不够，需要招人吗？',
    '项目管家: 可以先从其他项目调配一些资源',
    '院长助理: 同意，先把核心人员集中在重点项目',
    '财务助手: 我会做好成本核算，确保预算不超',
    '开发工程师: 那我们需要制定详细的排期计划'
  ],
  'innovation-ideas': [
    '开发工程师: 我觉得可以加一个智能预测功能',
    '方案架构师: 这个想法很好，可以用机器学习实现',
    '市场专员: 客户肯定会喜欢这个功能，很有卖点',
    '院长助理: 创新是好的，但要评估技术可行性',
    '开发工程师: 我研究了一下，有开源方案可以参考',
    '方案架构师: 那我们可以在下个版本中尝试',
    '市场专员: 我可以先去跟客户吹吹风，看看反馈',
    '院长助理: 不错，保持这种创新思维'
  ]
}

// 思维火花粒子
function ThoughtSparks({ position, color }: { position: [number, number, number], color: string }) {
  const pointsRef = useRef<THREE.Points>(null)
  
  const positions = useMemo(() => {
    const pos = new Float32Array(50 * 3)
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 2 + Math.random() * 3
      const height = Math.random() * 4
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = height
      pos[i * 3 + 2] = Math.sin(angle) * radius
    }
    return pos
  }, [])
  
  useFrame((state) => {
    if (!pointsRef.current) return
    const time = state.clock.elapsedTime
    pointsRef.current.rotation.y = time * 0.1
    
    // 粒子上下浮动
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < 50; i++) {
      pos[i * 3 + 1] += Math.sin(time * 2 + i) * 0.01
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })
  
  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={50} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.15} color={color} transparent opacity={0.8} sizeAttenuation />
    </points>
  )
}

// 知识节点（漂浮的想法）
function KnowledgeNode({ 
  text, 
  position, 
  color, 
  delay = 0 
}: { 
  text: string
  position: [number, number, number]
  color: string
  delay?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.elapsedTime
    meshRef.current.position.y = position[1] + Math.sin(time * 0.5 + delay) * 0.3
    meshRef.current.rotation.y = Math.sin(time * 0.3 + delay) * 0.1
  })
  
  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.9} />
      </mesh>
      <Html center distanceFactor={10}>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: color,
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: 'bold',
          border: `1px solid ${color}`,
          maxWidth: '120px',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          {text}
        </div>
      </Html>
    </group>
  )
}

// 对话气泡
function ChatBubble({ 
  message, 
  position, 
  agentRole,
  isActive 
}: { 
  message: string
  position: [number, number, number]
  agentRole: AgentRole
  isActive: boolean
}) {
  const agent = AGENTS_DATA[agentRole]
  
  if (!isActive) return null
  
  return (
    <Html position={position} center distanceFactor={8}>
      <div style={{
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '12px',
        maxWidth: '200px',
        fontSize: '12px',
        lineHeight: '1.5',
        borderLeft: `3px solid ${agent.color}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        animation: 'fadeIn 0.3s ease'
      }}>
        <div style={{ 
          fontWeight: 'bold', 
          color: agent.color,
          marginBottom: '4px',
          fontSize: '11px'
        }}>
          {agent.name}
        </div>
        <div>{message.split(': ')[1] || message}</div>
      </div>
    </Html>
  )
}

// 连接线（表示交流连接）
function ConnectionLines({ 
  participants, 
  centerPosition 
}: { 
  participants: AgentRole[]
  centerPosition: [number, number, number]
}) {
  const lines = useMemo(() => {
    const result: Array<{ start: [number, number, number], end: [number, number, number], color: string }> = []
    const radius = 5
    
    participants.forEach((role, i) => {
      const angle = (i / participants.length) * Math.PI * 2
      const x = centerPosition[0] + Math.cos(angle) * radius
      const z = centerPosition[2] + Math.sin(angle) * radius
      const y = centerPosition[1] + 1
      
      result.push({
        start: centerPosition,
        end: [x, y, z],
        color: AGENTS_DATA[role].color
      })
    })
    
    return result
  }, [participants, centerPosition])
  
  return (
    <>
      {lines.map((line, i) => (
        <mesh key={i} position={[
          (line.start[0] + line.end[0]) / 2,
          (line.start[1] + line.end[1]) / 2,
          (line.start[2] + line.end[2]) / 2
        ]}>
          <cylinderGeometry args={[0.02, 0.02, Math.sqrt(
            Math.pow(line.end[0] - line.start[0], 2) +
            Math.pow(line.end[1] - line.start[1], 2) +
            Math.pow(line.end[2] - line.start[2], 2)
          ), 8]} />
          <meshBasicMaterial color={line.color} transparent opacity={0.6} />
        </mesh>
      ))}
    </>
  )
}

// 主要组件
export function BrainstormingSpace({ isActive = true }: BrainstormingSpaceProps) {
  const [currentTopic, setCurrentTopic] = useState(0)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [showKnowledge, setShowKnowledge] = useState(false)
  
  const topic = DISCUSSION_TOPICS[currentTopic]
  const messages = BRAINSTORMING_MESSAGES[topic.id] || []
  
  // 自动切换讨论主题
  useEffect(() => {
    if (!isActive) return
    
    const topicInterval = setInterval(() => {
      setCurrentTopic(prev => (prev + 1) % DISCUSSION_TOPICS.length)
      setCurrentMessageIndex(0)
    }, 30000) // 30秒切换一个主题
    
    return () => clearInterval(topicInterval)
  }, [isActive])
  
  // 自动显示对话
  useEffect(() => {
    if (!isActive || messages.length === 0) return
    
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => {
        if (prev >= messages.length - 1) return 0
        return prev + 1
      })
    }, 4000) // 4秒显示一条消息
    
    return () => clearInterval(messageInterval)
  }, [isActive, messages])
  
  // 显示知识节点
  useEffect(() => {
    if (!isActive) return
    
    const knowledgeInterval = setInterval(() => {
      setShowKnowledge(true)
      setTimeout(() => setShowKnowledge(false), 5000)
    }, 8000)
    
    return () => clearInterval(knowledgeInterval)
  }, [isActive])
  
  if (!isActive) return null
  
  return (
    <group position={[0, 12, -35]}>
      {/* 悬浮底座光环 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <ringGeometry args={[4, 8, 64]} />
        <meshBasicMaterial color="#9C27B0" transparent opacity={0.3} />
      </mesh>
      
      {/* 中央全息投影台 */}
      <group position={[0, -1, 0]}>
        {/* 底座 */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[2, 2.5, 0.5, 32]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* 发光核心 */}
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial 
            color="#9C27B0" 
            emissive="#9C27B0" 
            emissiveIntensity={0.5}
            transparent 
            opacity={0.8}
          />
        </mesh>
        
        {/* 主题显示 */}
        <Html position={[0, 1.5, 0]} center>
          <div style={{
            background: 'rgba(156, 39, 176, 0.9)',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            textAlign: 'center',
            minWidth: '250px',
            boxShadow: '0 4px 20px rgba(156, 39, 176, 0.5)'
          }}>
            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>
              💡 当前讨论主题
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {topic.title}
            </div>
            <div style={{ fontSize: '11px', marginTop: '6px', opacity: 0.9 }}>
              {topic.description}
            </div>
            <div style={{ 
              fontSize: '10px', 
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(255,255,255,0.3)'
            }}>
              参与者: {topic.participants.map(r => AGENTS_DATA[r].name).join('、')}
            </div>
          </div>
        </Html>
        
        {/* 思维火花 */}
        <ThoughtSparks position={[0, 1, 0]} color="#E040FB" />
      </group>
      
      {/* 连接线 */}
      <ConnectionLines participants={topic.participants} centerPosition={[0, 1, 0]} />
      
      {/* Agent位置标记 */}
      {topic.participants.map((role, i) => {
        const angle = (i / topic.participants.length) * Math.PI * 2
        const radius = 5
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const agent = AGENTS_DATA[role]
        
        return (
          <group key={role} position={[x, 0, z]}>
            {/* 位置标记 */}
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 1, 16]} />
              <meshStandardMaterial color={agent.color} emissive={agent.color} emissiveIntensity={0.3} />
            </mesh>
            
            {/* Agent头像 */}
            <Html position={[0, 1.5, 0]} center>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: agent.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                border: '3px solid white',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}>
                {agent.emoji}
              </div>
            </Html>
            
            {/* 名字标签 */}
            <Text
              position={[0, 1.8, 0]}
              fontSize={0.4}
              color="white"
              anchorX="center"
            >
              {agent.name}
            </Text>
          </group>
        )
      })}
      
      {/* 对话气泡 */}
      {messages.slice(0, currentMessageIndex + 1).map((msg, i) => {
        const agentName = msg.split(':')[0]
        const agentRole = Object.keys(AGENTS_DATA).find(
          key => AGENTS_DATA[key as AgentRole].name === agentName
        ) as AgentRole
        
        if (!agentRole || !topic.participants.includes(agentRole)) return null
        
        const agentIndex = topic.participants.indexOf(agentRole)
        const angle = (agentIndex / topic.participants.length) * Math.PI * 2
        const radius = 5
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        // 只显示最新的3条消息
        if (i < currentMessageIndex - 2) return null
        
        return (
          <ChatBubble
            key={i}
            message={msg}
            position={[x, 1.5 + (i - currentMessageIndex) * 0.5, z]}
            agentRole={agentRole}
            isActive={i === currentMessageIndex}
          />
        )
      })}
      
      {/* 漂浮的知识节点 */}
      {showKnowledge && [
        { text: '微服务架构', color: '#00E5FF', pos: [-3, 2, -2] as [number, number, number] },
        { text: 'AI预测模型', color: '#76FF03', pos: [3, 3, -1] as [number, number, number] },
        { text: '客户需求', color: '#FF9800', pos: [-2, 1.5, 2] as [number, number, number] },
        { text: '资源优化', color: '#E040FB', pos: [2, 2.5, 1] as [number, number, number] }
      ].map((node, i) => (
        <KnowledgeNode
          key={i}
          text={node.text}
          position={node.pos}
          color={node.color}
          delay={i}
        />
      ))}
      
      {/* 空间标识 */}
      <Html position={[0, 4, 6]} center>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '20px',
          fontSize: '16px',
          fontWeight: 'bold',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.5)',
          border: '2px solid rgba(255,255,255,0.3)'
        }}>
          🧠 AI思维碰撞中心
        </div>
      </Html>
    </group>
  )
}
