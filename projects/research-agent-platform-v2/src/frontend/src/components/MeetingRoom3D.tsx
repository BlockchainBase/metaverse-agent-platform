import { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Text } from '@react-three/drei'
import * as THREE from 'three'
import { AgentRole, AGENTS_DATA } from '../data/agents'

interface MeetingRoom3DProps {
  roomId: string
  onClose: () => void
}

// 会议室配置
const ROOM_CONFIG: Record<string, {
  name: string
  topic: string
  participants: AgentRole[]
  color: string
  summary: string[]
}> = {
  'project-sync': {
    name: '项目同步会',
    topic: '智慧校园项目进度同步',
    participants: ['director', 'project', 'solution', 'developer'],
    color: '#3498DB',
    summary: [
      '✅ 项目进度：整体按计划推进，完成度65%',
      '✅ 关键里程碑：方案评审已通过',
      '⚠️ 风险项：需关注第三方接口对接进度',
      '📋 下一步：进入阶段3研发，预计2周完成Demo'
    ]
  },
  'tech-review': {
    name: '技术评审会',
    topic: '系统架构技术评审',
    participants: ['solution', 'developer', 'delivery', 'project'],
    color: '#9B59B6',
    summary: [
      '✅ 架构设计：微服务架构方案通过评审',
      '✅ 技术栈：确定使用React+Node.js+PostgreSQL',
      '🎯 性能目标：支持1000并发，响应时间<200ms',
      '🔒 安全措施：OAuth2.0认证，数据加密传输'
    ]
  },
  'client-demo': {
    name: '客户演示会',
    topic: '产品功能演示与答疑',
    participants: ['market', 'solution', 'developer', 'director'],
    color: '#27AE60',
    summary: [
      '👍 客户反馈：对AI助手功能表示高度认可',
      '📝 新增需求：希望增加数据导出功能',
      '📄 合同进展：预计下周签署正式合同',
      '📅 交付时间：客户希望在3月15日前上线'
    ]
  },
  'finance-review': {
    name: '财务复盘会',
    topic: '项目成本与预算分析',
    participants: ['finance', 'project', 'director', 'delivery'],
    color: '#E67E22',
    summary: [
      '💰 成本控制：目前支出在预算范围内',
      '💳 收款情况：已收款60%，剩余40%按里程碑支付',
      '📊 毛利率：预计项目毛利率为35%',
      '⚠️ 风险提示：需关注人力成本上涨影响'
    ]
  }
}

// 座位布局 - 椭圆形会议桌
const SEAT_POSITIONS: Record<number, { pos: [number, number, number], rot: number }> = {
  0: { pos: [0, 0, -3.5], rot: 0 },      // 主位（顶部）
  1: { pos: [-2.5, 0, -2], rot: Math.PI / 6 },   // 左上
  2: { pos: [-3.5, 0, 0.5], rot: Math.PI / 3 },  // 左中
  3: { pos: [-2.5, 0, 3], rot: Math.PI / 2 },    // 左下
  4: { pos: [2.5, 0, -2], rot: -Math.PI / 6 },   // 右上
  5: { pos: [3.5, 0, 0.5], rot: -Math.PI / 3 },  // 右中
  6: { pos: [2.5, 0, 3], rot: -Math.PI / 2 },    // 右下
}

// 会议室场景组件
function MeetingRoomScene({ roomId, onClose }: MeetingRoom3DProps) {
  const room = ROOM_CONFIG[roomId] || ROOM_CONFIG['project-sync']
  const [currentSpeaker, setCurrentSpeaker] = useState<number>(0)
  const [discussionIndex, setDiscussionIndex] = useState(0)
  const [chatMessages, setChatMessages] = useState<Array<{speaker: string, text: string, time: string}>>([])
  
  const discussions = [
    '项目整体进度回顾',
    '当前阶段成果展示',
    '存在的问题与风险',
    '下一步工作计划',
    '资源协调与分工'
  ]
  
  // 自动讨论循环
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSpeaker(prev => (prev + 1) % room.participants.length)
      setDiscussionIndex(prev => (prev + 1) % discussions.length)
      
      const speaker = room.participants[(currentSpeaker + 1) % room.participants.length]
      const agent = AGENTS_DATA[speaker]
      const responses = [
        `关于${discussions[(discussionIndex + 1) % discussions.length]}，我补充一下...`,
        `从${agent.department}角度，我认为这个方案可行`,
        `同意，${discussions[(discussionIndex + 1) % discussions.length]}需要重点关注`,
        `建议我们在下周完成这个任务`,
        `这个问题我已经记录，会跟进处理`
      ]
      const text = responses[Math.floor(Math.random() * responses.length)]
      const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      
      setChatMessages(prev => [...prev.slice(-4), { speaker: agent.name, text, time }])
    }, 5000)
    
    return () => clearInterval(interval)
  }, [room, currentSpeaker, discussionIndex])

  return (
    <>
      {/* 灯光系统 */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      <pointLight position={[0, 8, 0]} intensity={0.6} distance={20} />
      
      {/* 地板 - 深色地毯 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2C3E50" roughness={0.9} />
      </mesh>
      
      {/* 地板装饰圈 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[6, 6.2, 64]} />
        <meshBasicMaterial color={room.color} opacity={0.5} transparent />
      </mesh>
      
      {/* 墙壁 - 创建封闭房间 */}
      {/* 后墙 */}
      <mesh position={[0, 5, -10]} castShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#ECF0F1" side={THREE.DoubleSide} />
      </mesh>
      
      {/* 左墙 */}
      <mesh position={[-10, 5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#ECF0F1" side={THREE.DoubleSide} />
      </mesh>
      
      {/* 右墙 */}
      <mesh position={[10, 5, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#ECF0F1" side={THREE.DoubleSide} />
      </mesh>
      
      {/* 前墙（带门洞） */}
      <mesh position={[-6, 5, 10]} rotation={[0, Math.PI, 0]} castShadow>
        <planeGeometry args={[8, 10]} />
        <meshStandardMaterial color="#ECF0F1" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[6, 5, 10]} rotation={[0, Math.PI, 0]} castShadow>
        <planeGeometry args={[8, 10]} />
        <meshStandardMaterial color="#ECF0F1" side={THREE.DoubleSide} />
      </mesh>
      
      {/* 天花板 */}
      <mesh position={[0, 10, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* 吊灯 */}
      <mesh position={[0, 9, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.3, 32]} />
        <meshStandardMaterial color="#F1C40F" emissive="#F39C12" emissiveIntensity={0.3} />
      </mesh>
      
      {/* 会议桌 - 大型椭圆桌 */}
      <group position={[0, 0, 0]}>
        {/* 桌面 */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[8, 0.15, 4]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
        
        {/* 桌腿 */}
        <mesh position={[-2.5, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.2, 0.8, 16]} />
          <meshStandardMaterial color="#4A3728" />
        </mesh>
        <mesh position={[2.5, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.2, 0.8, 16]} />
          <meshStandardMaterial color="#4A3728" />
        </mesh>
        
        {/* 桌面装饰条 */}
        <mesh position={[0, 0.88, 0]}>
          <boxGeometry args={[8.1, 0.02, 4.1]} />
          <meshStandardMaterial color={room.color} />
        </mesh>
      </group>
      
      {/* 参会人员 */}
      {room.participants.map((role, index) => {
        const seat = SEAT_POSITIONS[index] || SEAT_POSITIONS[0]
        const isSpeaking = currentSpeaker === index
        const agent = AGENTS_DATA[role]
        
        return (
          <group key={role} position={seat.pos} rotation={[0, seat.rot, 0]}>
            {/* 椅子 */}
            <Chair />
            
            {/* 人物 - 站立或坐下 */}
            <group position={[0, 0, 0.8]}>
              {/* 身体 */}
              <mesh position={[0, 0.75, 0]} castShadow>
                <capsuleGeometry args={[0.25, 0.8, 4, 8]} />
                <meshStandardMaterial color={agent.color} />
              </mesh>
              
              {/* 头部 */}
              <mesh position={[0, 1.5, 0]} castShadow>
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshStandardMaterial color="#FFDBAC" />
              </mesh>
              
              {/* 名字标签 */}
              <Html position={[0, 2, 0]} center distanceFactor={10}>
                <div style={{
                  background: 'rgba(0,0,0,0.8)',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  border: isSpeaking ? `2px solid ${room.color}` : 'none'
                }}>
                  {isSpeaking ? '🔊 ' : ''}{agent.name}
                </div>
              </Html>
              
              {/* 发言指示器 */}
              {isSpeaking && (
                <mesh position={[0, 2.5, 0]}>
                  <coneGeometry args={[0.12, 0.25, 4]} />
                  <meshBasicMaterial color="#FFD700" />
                </mesh>
              )}
            </group>
          </group>
        )
      })}
      
      {/* 后墙主看板 */}
      <group position={[0, 5.5, -9.9]}>
        <mesh>
          <planeGeometry args={[12, 5]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        
        {/* 看板边框 */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[12.2, 5.2]} />
          <meshBasicMaterial color={room.color} />
        </mesh>
        
        {/* 看板内容 - 使用Text组件 */}
        <Text
          position={[0, 1.8, 0.02]}
          fontSize={0.35}
          color={room.color}
          anchorX="center"
          font="https://fonts.gstatic.com/s/notosanssc/v26/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FnYxNbPzS5CHYo3zVmQ-Hvm7Cc_KV.woff2"
        >
          {room.name}
        </Text>
        
        <Text
          position={[0, 1.2, 0.02]}
          fontSize={0.22}
          color="#666"
          anchorX="center"
        >
          {room.topic}
        </Text>
        
        <Text
          position={[0, 0.5, 0.02]}
          fontSize={0.2}
          color="#333"
          anchorX="center"
          font="bold"
        >
          💬 当前议题: {discussions[discussionIndex]}
        </Text>
      </group>
      
      {/* 左侧总结看板 */}
      <Html position={[-9.9, 5, 0]} transform>
        <div style={{
          width: '260px',
          height: '380px',
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '12px',
          padding: '16px',
          border: `3px solid ${room.color}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            color: room.color,
            fontSize: '16px',
            borderBottom: '2px solid #eee',
            paddingBottom: '8px'
          }}>
            📝 会议总结
          </h3>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {room.summary.map((item, idx) => (
              <div key={idx} style={{
                padding: '8px 0',
                borderBottom: '1px solid #f0f0f0',
                fontSize: '13px',
                lineHeight: '1.5',
                color: '#333'
              }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </Html>
      
      {/* 右侧发言记录 */}
      <Html position={[9.9, 5, 0]} transform>
        <div style={{
          width: '260px',
          height: '380px',
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '12px',
          padding: '16px',
          border: `3px solid ${room.color}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            color: room.color,
            fontSize: '16px',
            borderBottom: '2px solid #eee',
            paddingBottom: '8px'
          }}>
            💬 发言记录
          </h3>
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {chatMessages.length === 0 ? (
              <div style={{ color: '#999', textAlign: 'center', marginTop: '40px' }}>
                会议进行中...<br/>
                等待发言
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div key={idx} style={{
                  background: '#f8f9fa',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}>
                    <span style={{ fontWeight: 'bold', color: room.color }}>
                      {msg.speaker}
                    </span>
                    <span style={{ color: '#999', fontSize: '10px' }}>
                      {msg.time}
                    </span>
                  </div>
                  <div style={{ color: '#333', lineHeight: '1.4' }}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Html>
      
      {/* 退出按钮 */}
      <Html position={[0, 3, 8]} center>
        <button
          onClick={onClose}
          style={{
            background: '#E74C3C',
            color: 'white',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(231, 76, 60, 0.4)',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(231, 76, 60, 0.5)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(231, 76, 60, 0.4)'
          }}
        >
          ❌ 退出会议室
        </button>
      </Html>
    </>
  )
}

// 椅子组件
function Chair() {
  return (
    <group>
      {/* 椅座 */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1, 0.1, 1]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
      
      {/* 椅背 */}
      <mesh position={[0, 1.2, -0.45]} castShadow>
        <boxGeometry args={[1, 1, 0.1]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
      
      {/* 椅腿 */}
      {[[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.25, z]}>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}
    </group>
  )
}

// 主组件 - 包装Canvas
export function MeetingRoom3D({ roomId, onClose }: MeetingRoom3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 6, 12], fov: 60 }}
      style={{ 
        width: '100vw', 
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100
      }}
      shadows
    >
      <color attach="background" args={['#1a1a2e']} />
      <fog attach="fog" args={['#1a1a2e', 15, 30]} />
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={18}
        target={[0, 2, 0]}
        maxPolarAngle={Math.PI / 2 - 0.1}
      />
      
      <MeetingRoomScene roomId={roomId} onClose={onClose} />
    </Canvas>
  )
}