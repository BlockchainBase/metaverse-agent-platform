import { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Text, Box, Plane } from '@react-three/drei'
import * as THREE from 'three'
import { ManagerRole, MANAGERS_DATA } from '../data/managers'
import { WalkingCartoonAgent } from './CartoonAgent'

interface VirtualMeetingRoomProps {
  isOpen: boolean
  onClose: () => void
  participants: ManagerRole[]
}

// 会议室座位位置（椭圆形会议桌）
const SEAT_POSITIONS: Record<number, [number, number, number]> = {
  0: [0, 0, -4],    // 主位（院长）
  1: [-3, 0, -2],   // 左侧1
  2: [-4, 0, 1],    // 左侧2
  3: [-3, 0, 3],    // 左侧3
  4: [3, 0, -2],    // 右侧1
  5: [4, 0, 1],     // 右侧2
  6: [3, 0, 3],     // 右侧3
}

// 旁听位置
const OBSERVER_POSITIONS: [number, number, number][] = [
  [0, 0, 6],
  [-2, 0, 7],
  [2, 0, 7],
]

export function VirtualMeetingRoom({ isOpen, onClose, participants }: VirtualMeetingRoomProps) {
  const [currentSpeaker, setCurrentSpeaker] = useState<ManagerRole | null>(null)
  const [meetingTopic, setMeetingTopic] = useState('周例会 - 本周工作汇报')
  const [discussionPoints] = useState<string[]>([
    '上周工作总结',
    '本周工作计划',
    '项目进度同步',
    '问题与风险',
  ])
  const [currentPointIndex, setCurrentPointIndex] = useState(0)
  const [isAutoDiscussing, setIsAutoDiscussing] = useState(false)
  
  // 自动讨论逻辑
  useEffect(() => {
    if (!isOpen || !isAutoDiscussing) return
    
    const interval = setInterval(() => {
      // 随机选择发言者
      const randomParticipant = participants[Math.floor(Math.random() * participants.length)]
      setCurrentSpeaker(randomParticipant)
      
      // 3秒后清除发言状态
      setTimeout(() => {
        setCurrentSpeaker(null)
      }, 3000)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isOpen, isAutoDiscussing, participants])
  
  if (!isOpen) return null
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#000',
      zIndex: 1000,
    }}>
      {/* 3D场景 */}
      <Canvas camera={{ position: [0, 8, 12], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#fff8e7" />
        
        {/* 会议室空间 */}
        <MeetingRoomSpace />
        
        {/* 会议桌 */}
        <ConferenceTable />
        
        {/* 投影屏幕 */}
        <PresentationScreen topic={meetingTopic} currentPoint={discussionPoints[currentPointIndex]} />
        
        {/* AI参与者 */}
        {participants.map((role, index) => (
          <MeetingParticipant
            key={role}
            role={role}
            position={SEAT_POSITIONS[index]}
            isSpeaking={currentSpeaker === role}
          />
        ))}
        
        {/* 旁听座位 */}
        {OBSERVER_POSITIONS.map((pos, index) => (
          <ObserverSeat key={index} position={pos} />
        ))}
        
        {/* 相机控制 */}
        <OrbitControls
          minDistance={5}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2 - 0.1}
          target={[0, 0, 0]}
        />
      </Canvas>
      
      {/* UI控制面板 */}
      <MeetingControls
        topic={meetingTopic}
        discussionPoints={discussionPoints}
        currentPointIndex={currentPointIndex}
        isAutoDiscussing={isAutoDiscussing}
        onTopicChange={setMeetingTopic}
        onPointChange={setCurrentPointIndex}
        onAutoDiscussToggle={() => setIsAutoDiscussing(!isAutoDiscussing)}
        onClose={onClose}
      />
      
      {/* 当前发言人提示 */}
      {currentSpeaker && (
        <SpeakingIndicator role={currentSpeaker} />
      )}
    </div>
  )
}

// 会议室空间
function MeetingRoomSpace() {
  return (
    <group>
      {/* 地板 */}
      <Plane
        args={[20, 20]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#2c3e50" />
      </Plane>
      
      {/* 墙壁 */}
      <Plane args={[20, 8]} position={[0, 4, -10]} receiveShadow>
        <meshStandardMaterial color="#34495e" />
      </Plane>
      <Plane args={[20, 8]} rotation={[0, Math.PI / 2, 0]} position={[-10, 4, 0]} receiveShadow>
        <meshStandardMaterial color="#34495e" />
      </Plane>
      <Plane args={[20, 8]} rotation={[0, -Math.PI / 2, 0]} position={[10, 4, 0]} receiveShadow>
        <meshStandardMaterial color="#34495e" />
      </Plane>
      
      {/* 天花板 */}
      <Plane args={[20, 20]} rotation={[Math.PI / 2, 0, 0]} position={[0, 8, 0]}>
        <meshStandardMaterial color="#ecf0f1" />
      </Plane>
      
      {/* 地毯 */}
      <Plane
        args={[16, 12]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#8e44ad" />
      </Plane>
    </group>
  )
}

// 会议桌
function ConferenceTable() {
  return (
    <group>
      {/* 桌面 */}
      <Box args={[10, 0.1, 6]} position={[0, 1, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#5d4037" />
      </Box>
      
      {/* 桌腿 */}
      <Box args={[0.3, 1, 0.3]} position={[-4, 0.5, -2]} castShadow>
        <meshStandardMaterial color="#3e2723" />
      </Box>
      <Box args={[0.3, 1, 0.3]} position={[4, 0.5, -2]} castShadow>
        <meshStandardMaterial color="#3e2723" />
      </Box>
      <Box args={[0.3, 1, 0.3]} position={[-4, 0.5, 2]} castShadow>
        <meshStandardMaterial color="#3e2723" />
      </Box>
      <Box args={[0.3, 1, 0.3]} position={[4, 0.5, 2]} castShadow>
        <meshStandardMaterial color="#3e2723" />
      </Box>
    </group>
  )
}

// 投影屏幕
function PresentationScreen({ topic, currentPoint }: { topic: string; currentPoint: string }) {
  return (
    <group position={[0, 3, -9.5]}>
      {/* 屏幕框架 */}
      <Box args={[8, 4.5, 0.1]} castShadow>
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
      
      {/* 屏幕内容 */}
      <Html
        position={[0, 0, 0.06]}
        transform
        style={{
          width: '800px',
          height: '450px',
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          padding: '40px',
          boxSizing: 'border-box',
        }}
      >
        <h2 style={{ margin: '0 0 20px 0', fontSize: '36px' }}>{topic}</h2>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '20px 40px',
          borderRadius: '10px',
          fontSize: '28px',
        }}>
          当前议题：{currentPoint}
        </div>
      </Html>
    </group>
  )
}

// 会议参与者
function MeetingParticipant({
  role,
  position,
  isSpeaking,
}: {
  role: ManagerRole
  position: [number, number, number]
  isSpeaking: boolean
}) {
  const manager = MANAGERS_DATA[role]
  const meshRef = useRef<THREE.Group>(null)
  
  // 发言时的动画
  useFrame((state) => {
    if (meshRef.current && isSpeaking) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 5) * 0.05
    } else if (meshRef.current) {
      meshRef.current.position.y = position[1]
    }
  })
  
  return (
    <group ref={meshRef} position={position}>
      {/* 使用现有的卡通角色组件 */}
      <WalkingCartoonAgent
        agentId={`meeting-${role}`}
        role={role}
        initialPosition={[0, 0, 0]}
        isSelected={isSpeaking}
        onClick={() => {}}
      />
      
      {/* 名牌 */}
      <group position={[0, 2.5, 0]}>
        <Plane args={[1.2, 0.4]} rotation={[0, 0, 0]}>
          <meshBasicMaterial color="white" />
        </Plane>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.15}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {manager.name}
        </Text>
      </group>
      
      {/* 发言指示器 */}
      {isSpeaking && (
        <group position={[0, 3.5, 0]}>
          <mesh>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color="#27ae60" />
          </mesh>
          <Text
            position={[0, 0.4, 0]}
            fontSize={0.2}
            color="#27ae60"
            anchorX="center"
          >
            发言中...
          </Text>
        </group>
      )}
    </group>
  )
}

// 旁听座位
function ObserverSeat({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 椅子 */}
      <Box args={[1, 0.1, 1]} position={[0, 0.5, 0]} castShadow>
        <meshStandardMaterial color="#7f8c8d" />
      </Box>
      <Box args={[0.1, 1, 0.1]} position={[-0.4, 0.5, -0.4]} castShadow>
        <meshStandardMaterial color="#7f8c8d" />
      </Box>
      <Box args={[0.1, 1, 0.1]} position={[0.4, 0.5, -0.4]} castShadow>
        <meshStandardMaterial color="#7f8c8d" />
      </Box>
      <Box args={[0.1, 1, 0.1]} position={[-0.4, 0.5, 0.4]} castShadow>
        <meshStandardMaterial color="#7f8c8d" />
      </Box>
      <Box args={[0.1, 1, 0.1]} position={[0.4, 0.5, 0.4]} castShadow>
        <meshStandardMaterial color="#7f8c8d" />
      </Box>
      {/* 靠背 */}
      <Box args={[1, 1, 0.1]} position={[0, 1, -0.45]} castShadow>
        <meshStandardMaterial color="#7f8c8d" />
      </Box>
    </group>
  )
}

// 会议控制面板
function MeetingControls({
  topic,
  discussionPoints,
  currentPointIndex,
  isAutoDiscussing,
  onTopicChange,
  onPointChange,
  onAutoDiscussToggle,
  onClose,
}: {
  topic: string
  discussionPoints: string[]
  currentPointIndex: number
  isAutoDiscussing: boolean
  onTopicChange: (topic: string) => void
  onPointChange: (index: number) => void
  onAutoDiscussToggle: () => void
  onClose: () => void
}) {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      minWidth: '300px',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h3 style={{ margin: '0 0 15px 0' }}>🎯 会议室控制</h3>
      
      {/* 会议主题 */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>
          会议主题
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '5px',
            border: '1px solid #555',
            background: '#333',
            color: 'white',
          }}
        />
      </div>
      
      {/* 讨论要点 */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>
          讨论要点
        </label>
        {discussionPoints.map((point, index) => (
          <div
            key={index}
            onClick={() => onPointChange(index)}
            style={{
              padding: '8px 12px',
              marginBottom: '5px',
              borderRadius: '5px',
              cursor: 'pointer',
              background: index === currentPointIndex ? '#3498db' : '#333',
              transition: 'background 0.2s',
            }}
          >
            {index + 1}. {point}
          </div>
        ))}
      </div>
      
      {/* 控制按钮 */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onAutoDiscussToggle}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '5px',
            border: 'none',
            background: isAutoDiscussing ? '#e74c3c' : '#27ae60',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          {isAutoDiscussing ? '⏹ 停止讨论' : '▶ 开始讨论'}
        </button>
        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            borderRadius: '5px',
            border: 'none',
            background: '#7f8c8d',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          退出
        </button>
      </div>
      
      <div style={{ marginTop: '15px', fontSize: '12px', color: '#aaa' }}>
        💡 提示：点击议题切换，AI角色会自动发言讨论
      </div>
    </div>
  )
}

// 发言人指示器
function SpeakingIndicator({ role }: { role: ManagerRole }) {
  const manager = MANAGERS_DATA[role]
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '15px 30px',
      borderRadius: '30px',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      fontFamily: 'system-ui, sans-serif',
      animation: 'slideUp 0.3s ease',
    }}>
      <span style={{ fontSize: '24px' }}>{manager.icon}</span>
      <div>
        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{manager.name}</div>
        <div style={{ fontSize: '14px', color: '#aaa' }}>正在发言...</div>
      </div>
      <div style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: '#27ae60',
        animation: 'pulse 1s infinite',
      }} />
    </div>
  )
}
