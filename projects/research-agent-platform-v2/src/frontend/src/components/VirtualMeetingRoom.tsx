import { useState, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Text } from '@react-three/drei'
import * as THREE from 'three'
import { AgentRole, AGENTS_DATA } from '../data/agents'
import { RealisticAgent } from './RealisticAgent'

interface VirtualMeetingRoomProps {
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
    roomColor: '#4A90E2'
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
    roomColor: '#9B59B6'
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
    roomColor: '#27AE60'
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
    roomColor: '#E67E22'
  }
}

// 会议室座位位置（椭圆形会议桌）
const SEAT_POSITIONS: Record<number, [number, number, number]> = {
  0: [0, 0, -4],    // 主位
  1: [-3, 0, -2],   // 左侧1
  2: [-4, 0, 1],    // 左侧2
  3: [-3, 0, 3],    // 左侧3
  4: [3, 0, -2],    // 右侧1
  5: [4, 0, 1],     // 右侧2
  6: [3, 0, 3],     // 右侧3
}

export function VirtualMeetingRoom({ roomId, onClose }: VirtualMeetingRoomProps) {
  const [currentSpeaker, setCurrentSpeaker] = useState<AgentRole | null>(null)
  const [currentPointIndex, setCurrentPointIndex] = useState(0)
  
  const roomConfig = MEETING_ROOMS_CONFIG[roomId] || MEETING_ROOMS_CONFIG['project-sync']
  const { name, topic, participants, discussionPoints, roomColor } = roomConfig
  
  // 自动讨论逻辑
  useEffect(() => {
    const interval = setInterval(() => {
      // 随机选择发言者
      const randomParticipant = participants[Math.floor(Math.random() * participants.length)]
      setCurrentSpeaker(randomParticipant)
      
      // 切换到下一个议题点
      setCurrentPointIndex(prev => (prev + 1) % discussionPoints.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [participants, discussionPoints])

  return (
    <group>
      {/* 会议室地板 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2D3748" />
      </mesh>
      
      {/* 会议室墙壁 */}
      <mesh position={[0, 5, -10]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#1A202C" />
      </mesh>
      
      {/* 会议桌 */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[8, 0.1, 4]} />
        <meshStandardMaterial color="#4A5568" />
      </mesh>
      
      {/* 参会Agent */}
      {participants.map((role, index) => (
        <group key={role}>
          <RealisticAgent
            role={role}
            position={SEAT_POSITIONS[index] || [0, 0, 0]}
          />
          
          {/* 发言指示器 */}
          {currentSpeaker === role && (
            <mesh position={[SEAT_POSITIONS[index][0], 2.5, SEAT_POSITIONS[index][2]]}>
              <coneGeometry args={[0.3, 0.6, 4]} />
              <meshBasicMaterial color="#FFD700" />
            </mesh>
          )}
        </group>
      ))}
      
      {/* 会议室名称和主题 */}
      <Html position={[0, 8, -8]} center>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '16px 32px',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: 'bold',
          border: `2px solid ${roomColor}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>{name}</div>
          <div>{topic}</div>
        </div>
      </Html>
      
      {/* 当前议题 */}
      <Html position={[0, 6, -8]} center>
        <div style={{
          background: roomColor,
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px'
        }}>
          当前议题: {discussionPoints[currentPointIndex]}
        </div>
      </Html>
      
      {/* 关闭按钮 */}
      <Html position={[8, 8, 0]}>
        <button
          onClick={onClose}
          style={{
            background: '#EF4444',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          关闭会议室
        </button>
      </Html>
      
      {/* 发言人对话框 */}
      {currentSpeaker && (
        <Html 
          position={[
            SEAT_POSITIONS[participants.indexOf(currentSpeaker)]?.[0] || 0,
            3,
            SEAT_POSITIONS[participants.indexOf(currentSpeaker)]?.[2] || 0
          ]}
        >
          <div style={{
            background: 'white',
            color: 'black',
            padding: '12px 16px',
            borderRadius: '12px',
            maxWidth: '200px',
            fontSize: '14px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <strong>{AGENTS_DATA[currentSpeaker].name}:</strong>
            <p style={{ margin: '8px 0 0 0' }}>
              关于{discussionPoints[currentPointIndex]}，我认为...
            </p>
          </div>
        </Html>
      )}
    </group>
  )
}