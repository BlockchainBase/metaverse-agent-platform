import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ChatBubbleProps {
  text: string
  position: [number, number, number]
  duration?: number
  onComplete?: () => void
}

// 生成对话气泡纹理
function createBubbleTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 200
  const ctx = canvas.getContext('2d')!
  
  // 气泡背景
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.beginPath()
  ctx.roundRect(20, 20, 472, 140, 20)
  ctx.fill()
  
  // 气泡边框
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 3
  ctx.stroke()
  
  // 小三角
  ctx.beginPath()
  ctx.moveTo(256, 160)
  ctx.lineTo(236, 190)
  ctx.lineTo(276, 190)
  ctx.closePath()
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.fill()
  ctx.stroke()
  
  // 文字
  ctx.fillStyle = '#333'
  ctx.font = 'bold 28px "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // 自动换行
  const words = text.split('')
  const lineHeight = 36
  const maxWidth = 440
  let line = ''
  let lines: string[] = []
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i]
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && line !== '') {
      lines.push(line)
      line = words[i]
    } else {
      line = testLine
    }
  }
  lines.push(line)
  
  // 绘制文字（垂直居中）
  const startY = 90 - (lines.length - 1) * lineHeight / 2
  lines.forEach((lineText, i) => {
    ctx.fillText(lineText, 256, startY + i * lineHeight)
  })
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

// 对话气泡组件
export function ChatBubble({ text, position, duration = 3000, onComplete }: ChatBubbleProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [opacity, setOpacity] = useState(0)
  const texture = createBubbleTexture(text)
  
  useEffect(() => {
    // 淡入
    const fadeIn = setTimeout(() => setOpacity(1), 50)
    // 淡出
    const fadeOut = setTimeout(() => setOpacity(0), duration - 300)
    // 完成回调
    const complete = setTimeout(() => onComplete?.(), duration)
    
    return () => {
      clearTimeout(fadeIn)
      clearTimeout(fadeOut)
      clearTimeout(complete)
    }
  }, [duration, onComplete])
  
  useFrame((state) => {
    if (!groupRef.current) return
    
    // 悬浮动画
    const time = state.clock.elapsedTime
    groupRef.current.position.y = position[1] + Math.sin(time * 2) * 0.1
    
    // 始终面向相机
    groupRef.current.lookAt(state.camera.position)
  })
  
  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <planeGeometry args={[2.5, 1]} />
        <meshBasicMaterial 
          map={texture} 
          transparent 
          opacity={opacity}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// AI角色对话系统
interface AgentChatSystemProps {
  agentPositions: Map<string, [number, number, number]>
}

// 预设对话内容
const CHAT_MESSAGES = [
  '早上好！今天有什么工作安排？',
  '这个项目进度不错，继续保持！',
  '下午3点有个会议，别忘了参加。',
  '数据分析报告已经完成，请查收。',
  '新的一周，加油干！',
  '这个方案我觉得可以再优化一下。',
  '客户反馈很好，干得漂亮！',
  '需要我协助处理什么吗？',
  '今天的天气不错，适合开会讨论。',
  '系统运行正常，一切顺利。'
]

export function AgentChatSystem({ agentPositions }: AgentChatSystemProps) {
  const [bubbles, setBubbles] = useState<Array<{
    id: string
    agentId: string
    text: string
    position: [number, number, number]
  }>>([])
  
  useEffect(() => {
    // 定时生成随机对话
    const interval = setInterval(() => {
      const agents = Array.from(agentPositions.keys())
      if (agents.length === 0) return
      
      // 随机选择一个角色
      const randomAgent = agents[Math.floor(Math.random() * agents.length)]
      const position = agentPositions.get(randomAgent)
      if (!position) return
      
      // 随机选择对话内容
      const randomMessage = CHAT_MESSAGES[Math.floor(Math.random() * CHAT_MESSAGES.length)]
      
      const newBubble = {
        id: `${randomAgent}-${Date.now()}`,
        agentId: randomAgent,
        text: randomMessage,
        position: [position[0], position[1] + 2.5, position[2]] as [number, number, number]
      }
      
      setBubbles(prev => [...prev.slice(-4), newBubble]) // 最多显示5个气泡
    }, 4000) // 每4秒可能产生一个对话
    
    return () => clearInterval(interval)
  }, [agentPositions])
  
  const handleBubbleComplete = (id: string) => {
    setBubbles(prev => prev.filter(b => b.id !== id))
  }
  
  return (
    <>
      {bubbles.map(bubble => (
        <ChatBubble
          key={bubble.id}
          text={bubble.text}
          position={bubble.position}
          duration={4000}
          onComplete={() => handleBubbleComplete(bubble.id)}
        />
      ))}
    </>
  )
}

export default ChatBubble
