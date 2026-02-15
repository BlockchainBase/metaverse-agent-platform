import { useState, useEffect, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Text } from '@react-three/drei'
import * as THREE from 'three'
import { AgentRole, AGENTS_DATA } from '../data/agents'
import { RealisticAgent } from './RealisticAgent'

interface MeetingRoomSceneProps {
  roomId: string
  onClose: () => void
}

// 会议室配置
const MEETING_ROOMS_CONFIG: Record<string, {
  name: string
  topic: string
  participants: AgentRole[]
  discussionPoints: string[]
  roomColor: string
  summary: string[]
}> = {
  'project-sync': {
    name: '项目同步会',
    topic: '智慧校园项目进度同步',
    participants: ['director', 'project', 'solution', 'developer'],
    discussionPoints: [
      '项目整体进度回顾',
      '阶段2方案评审',
      '阶段3研发计划',
      '风险与问题讨论',
      '下周工作安排'
    ],
    roomColor: '#4A90E2',
    summary: [
      '项目进度：整体按计划推进，完成度65%',
      '关键里程碑：方案评审已通过',
      '风险项：需关注第三方接口对接进度',
      '下一步：进入阶段3研发，预计2周完成Demo'
    ]
  },
  'tech-review': {
    name: '技术评审会',
    topic: '系统架构技术评审',
    participants: ['solution', 'developer', 'devops', 'project'],
    discussionPoints: [
      '架构设计评审',
      '技术选型讨论',
      '性能优化方案',
      '安全风险分析',
      '开发规范制定'
    ],
    roomColor: '#9B59B6',
    summary: [
      '架构设计：微服务架构方案通过评审',
      '技术栈：确定使用React+Node.js+PostgreSQL',
      '性能目标：支持1000并发，响应时间<200ms',
      '安全措施：OAuth2.0认证，数据加密传输'
    ]
  },
  'client-demo': {
    name: '客户演示会',
    topic: '产品功能演示与答疑',
    participants: ['market', 'solution', 'developer', 'director'],
    discussionPoints: [
      '产品功能演示',
      '客户反馈收集',
      '需求变更讨论',
      '合同条款确认',
      '交付计划制定'
    ],
    roomColor: '#27AE60',
    summary: [
      '客户反馈：对AI助手功能表示高度认可',
      '新增需求：希望增加数据导出功能',
      '合同进展：预计下周签署正式合同',
      '交付时间：客户希望在3月15日前上线'
    ]
  },
  'finance-review': {
    name: '财务复盘会',
    topic: '项目成本与预算分析',
    participants: ['finance', 'project', 'director', 'delivery'],
    discussionPoints: [
      '项目成本分析',
      '预算执行情况',
      '收款进度跟踪',
      '成本控制措施',
      '财务风险预警'
    ],
    roomColor: '#E67E22',
    summary: [
      '成本控制：目前支出在预算范围内',
      '收款情况：已收款60%，剩余40%按里程碑支付',
      '毛利率：预计项目毛利率为35%',
      '风险提示：需关注人力成本上涨影响'
    ]
  }
}

// 座位位置配置（围绕椭圆形会议桌）
const SEAT_POSITIONS: Record<number, [number, number, number]> = {
  0: [0, 0, -4],     // 主位（会议主持人）
  1: [-3.5, 0, -2],  // 左侧1
  2: [-4.5, 0, 1],   // 左侧2
  3: [-3.5, 0, 3.5], // 左侧3
  4: [3.5, 0, -2],   // 右侧1
  5: [4.5, 0, 1],    // 右侧2
  6: [3.5, 0, 3.5],  // 右侧3
}

export function MeetingRoomScene({ roomId, onClose }: MeetingRoomSceneProps) {
  const [currentSpeaker, setCurrentSpeaker] = useState<AgentRole | null>(null)
  const [currentPointIndex, setCurrentPointIndex] = useState(0)
  const [chatHistory, setChatHistory] = useState<Array<{speaker: string, text: string, time: string}>>([])
  
  const roomConfig = MEETING_ROOMS_CONFIG[roomId] || MEETING_ROOMS_CONFIG['project-sync']
  const { name, topic, participants, discussionPoints, roomColor, summary } = roomConfig
  
  // 发言记录
  const addChatMessage = (speaker: AgentRole, text: string) => {
    const agent = AGENTS_DATA[speaker]
    const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    setChatHistory(prev => [...prev.slice(-9), { speaker: agent.name, text, time }])
  }
  
  // 自动讨论逻辑
  useEffect(() => {
    const interval = setInterval(() => {
      const randomParticipant = participants[Math.floor(Math.random() * participants.length)]
      setCurrentSpeaker(randomParticipant)
      
      const newPointIndex = (currentPointIndex + 1) % discussionPoints.length
      setCurrentPointIndex(newPointIndex)
      
      // 添加发言记录
      const agent = AGENTS_DATA[randomParticipant]
      const responses = [
        `关于${discussionPoints[newPointIndex]}，我的看法是...`,
        `我认为${discussionPoints[newPointIndex]}需要重点关注`,
        `从${agent.department}的角度，${discussionPoints[newPointIndex]}...`,
        `补充一点，${discussionPoints[newPointIndex]}...`,
        `同意，${discussionPoints[newPointIndex]}很关键`
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      addChatMessage(randomParticipant, randomResponse)
      
    }, 6000)
    
    return () => clearInterval(interval)
  }, [participants, discussionPoints, currentPointIndex])

  return (
    <group>
      {/* === 会议室灯光系统 === */}
      <ambientLight intensity={1} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
      
      {/* === 会议室三维场景 === */}
      
      {/* 地板 - 深色地毯 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2C3E50" roughness={0.9} />
      </mesh>
      
      {/* 墙壁 - 浅色 */}
      <mesh position={[0, 5, -10]}>
        <planeGeometry args={[20, 10]} />
        <meshBasicMaterial color="#ECF0F1" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-10, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshBasicMaterial color="#ECF0F1" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[10, 5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshBasicMaterial color="#ECF0F1" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 5, 10]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshBasicMaterial color="#ECF0F1" side={THREE.DoubleSide} />
      </mesh>
      
      {/* 会议桌 */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[8, 0.1, 4]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* 参会人员 - 简化显示 */}
      {participants.map((role, index) => {
        const pos = SEAT_POSITIONS[index] || [0, 0, 0]
        return (
          <group key={role} position={pos}>
            {/* 简单的人物表示 */}
            <mesh position={[0, 1, 0]}>
              <capsuleGeometry args={[0.3, 1.2, 4, 8]} />
              <meshStandardMaterial color={AGENTS_DATA[role].color} />
            </mesh>
            {/* 名字标签 */}
            <Text position={[0, 2.2, 0]} fontSize={0.3} color="#333" anchorX="center">
              {AGENTS_DATA[role].name}
            </Text>
            {/* 发言指示器 */}
            {currentSpeaker === role && (
              <mesh position={[0, 2.8, 0]}>
                <coneGeometry args={[0.2, 0.4, 4]} />
                <meshBasicMaterial color="#FFD700" />
              </mesh>
            )}
          </group>
        )
      })}
      
      {/* 会议看板 */}
      <Html position={[0, 4, -8]} center>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          border: `3px solid ${roomColor}`,
          minWidth: '300px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: roomColor }}>{name}</h3>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{topic}</p>
          <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
            💬 当前议题: {discussionPoints[currentPointIndex]}
          </div>
        </div>
      </Html>
      
      {/* 关闭按钮 */}
      <Html position={[8, 8, 8]}>
        <button
          onClick={onClose}
          style={{
            background: '#EF4444',
            color: 'white',
            border: 'none',
            padding: '14px 28px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          ❌ 退出会议室
        </button>
      </Html>
      
      {/* 发言人对话框 */}
      {currentSpeaker && (
        <Html position={[0, 6, 0]} center>
          <div style={{
            background: 'white',
            padding: '15px 20px',
            borderRadius: '10px',
            border: `2px solid ${roomColor}`,
            maxWidth: '300px'
          }}>
            <strong style={{ color: roomColor }}>
              {AGENTS_DATA[currentSpeaker].name}:
            </strong>
            <p style={{ margin: '5px 0 0 0' }}>
              {chatHistory[chatHistory.length - 1]?.text || '正在发言...'}
            </p>
          </div>
        </Html>
      )}
    </group>
  )
}