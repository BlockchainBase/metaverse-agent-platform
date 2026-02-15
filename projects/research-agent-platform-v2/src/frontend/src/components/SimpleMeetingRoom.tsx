import { useState, useEffect } from 'react'
import { Html } from '@react-three/drei'
import { AgentRole, AGENTS_DATA } from '../data/agents'

interface SimpleMeetingRoomProps {
  roomId: string
  onClose: () => void
}

const ROOMS: Record<string, {
  name: string
  topic: string
  participants: AgentRole[]
  color: string
}> = {
  'project-sync': {
    name: '项目同步会',
    topic: '智慧校园项目进度同步',
    participants: ['director', 'project', 'solution', 'developer'],
    color: '#4A90E2'
  },
  'tech-review': {
    name: '技术评审会',
    topic: '系统架构技术评审',
    participants: ['solution', 'developer', 'devops', 'project'],
    color: '#9B59B6'
  },
  'client-demo': {
    name: '客户演示会',
    topic: '产品功能演示与答疑',
    participants: ['market', 'solution', 'developer', 'director'],
    color: '#27AE60'
  },
  'finance-review': {
    name: '财务复盘会',
    topic: '项目成本与预算分析',
    participants: ['finance', 'project', 'director', 'delivery'],
    color: '#E67E22'
  }
}

export function SimpleMeetingRoom({ roomId, onClose }: SimpleMeetingRoomProps) {
  const room = ROOMS[roomId] || ROOMS['project-sync']
  const [currentSpeaker, setCurrentSpeaker] = useState<AgentRole | null>(null)
  
  useEffect(() => {
    const interval = setInterval(() => {
      const speaker = room.participants[Math.floor(Math.random() * room.participants.length)]
      setCurrentSpeaker(speaker)
    }, 4000)
    return () => clearInterval(interval)
  }, [room])

  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      
      {/* 地板 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#34495E" />
      </mesh>
      
      {/* 后墙 */}
      <mesh position={[0, 5, -10]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#BDC3C7" />
      </mesh>
      
      {/* 左墙 */}
      <mesh position={[-10, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#BDC3C7" />
      </mesh>
      
      {/* 右墙 */}
      <mesh position={[10, 5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#BDC3C7" />
      </mesh>
      
      {/* 前墙 */}
      <mesh position={[0, 5, 10]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#BDC3C7" />
      </mesh>
      
      {/* 会议桌 */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[6, 0.1, 3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* 参会人员 - 简化为立方体 */}
      {room.participants.map((role, index) => {
        const angle = (index / room.participants.length) * Math.PI * 2
        const radius = 4
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius
        
        return (
          <group key={role} position={[x, 0, z]}>
            {/* 身体 */}
            <mesh position={[0, 1, 0]}>
              <boxGeometry args={[0.6, 1.5, 0.4]} />
              <meshStandardMaterial color={AGENTS_DATA[role].color} />
            </mesh>
            {/* 头 */}
            <mesh position={[0, 2, 0]}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color="#FFDBAC" />
            </mesh>
            {/* 名字 */}
            <Html position={[0, 2.8, 0]} center>
              <div style={{
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                whiteSpace: 'nowrap'
              }}>
                {AGENTS_DATA[role].name}
              </div>
            </Html>
            {/* 发言指示 */}
            {currentSpeaker === role && (
              <mesh position={[0, 3.3, 0]}>
                <coneGeometry args={[0.15, 0.3, 4]} />
                <meshBasicMaterial color="#FFD700" />
              </mesh>
            )}
          </group>
        )
      })}
      
      {/* 会议信息看板 */}
      <Html position={[0, 7, -9]} center>
        <div style={{
          background: 'white',
          padding: '20px 30px',
          borderRadius: '10px',
          border: `4px solid ${room.color}`,
          textAlign: 'center',
          minWidth: '350px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{ margin: '0 0 10px 0', color: room.color }}>{room.name}</h2>
          <p style={{ margin: '0 0 15px 0', fontSize: '16px' }}>{room.topic}</p>
          {currentSpeaker && (
            <div style={{
              background: '#f0f0f0',
              padding: '10px',
              borderRadius: '5px',
              fontSize: '14px'
            }}>
              💬 {AGENTS_DATA[currentSpeaker].name} 正在发言...
            </div>
          )}
        </div>
      </Html>
      
      {/* 退出按钮 */}
      <Html position={[0, 2, 8]} center>
        <button
          onClick={onClose}
          style={{
            background: '#E74C3C',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
          }}
        >
          ❌ 退出会议室
        </button>
      </Html>
    </>
  )
}