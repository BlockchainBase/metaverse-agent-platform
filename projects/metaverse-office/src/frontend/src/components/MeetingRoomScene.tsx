// 现代化会议室场景 - 仿照参考图片风格
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function MeetingRoomScene() {
  // 创建地板纹理
  const floorTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    
    // 木质地板效果
    ctx.fillStyle = '#8B6914'
    ctx.fillRect(0, 0, 512, 512)
    
    // 添加木纹
    for (let i = 0; i < 512; i += 64) {
      ctx.strokeStyle = '#6B4D0F'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, 512)
      ctx.stroke()
    }
    
    // 添加噪点
    for (let i = 0; i < 1000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#7A5A10' : '#9B7B1E'
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2)
    }
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(4, 4)
    return texture
  }, [])

  // 墙壁纹理
  const wallTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    
    // 浅灰色墙壁
    ctx.fillStyle = '#E8E8E8'
    ctx.fillRect(0, 0, 256, 256)
    
    // 添加细微纹理
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#D8D8D8' : '#F0F0F0'
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1)
    }
    
    return new THREE.CanvasTexture(canvas)
  }, [])

  // 屏幕内容纹理
  const screenTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 576
    const ctx = canvas.getContext('2d')!
    
    // 深色背景
    const gradient = ctx.createLinearGradient(0, 0, 1024, 576)
    gradient.addColorStop(0, '#1a1a2e')
    gradient.addColorStop(1, '#16213e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1024, 576)
    
    // 标题
    ctx.fillStyle = '#00E5FF'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('AI Agent 协作平台', 512, 80)
    
    // 统计信息
    ctx.fillStyle = '#ffffff'
    ctx.font = '32px Arial'
    ctx.fillText('实时数据监控', 512, 150)
    
    // 数据卡片
    const cards = [
      { label: '活跃Agent', value: '11', color: '#4CAF50' },
      { label: '进行中任务', value: '134', color: '#FF9800' },
      { label: '协作次数', value: '204', color: '#2196F3' },
      { label: '系统效率', value: '95%', color: '#9C27B0' }
    ]
    
    cards.forEach((card, i) => {
      const x = 150 + i * 220
      const y = 250
      
      // 卡片背景
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      ctx.fillRect(x - 80, y - 40, 160, 120)
      
      // 数值
      ctx.fillStyle = card.color
      ctx.font = 'bold 48px Arial'
      ctx.fillText(card.value, x, y + 20)
      
      // 标签
      ctx.fillStyle = '#aaaaaa'
      ctx.font = '20px Arial'
      ctx.fillText(card.label, x, y + 55)
    })
    
    // 底部提示
    ctx.fillStyle = '#888888'
    ctx.font = '18px Arial'
    ctx.fillText('成都高新信息技术研究院 · 数字员工元宇宙办公室', 512, 520)
    
    return new THREE.CanvasTexture(canvas)
  }, [])

  return (
    <group>
      {/* 地板 */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial map={floorTexture} roughness={0.6} />
      </mesh>
      
      {/* 墙壁 - 后墙 */}
      <mesh position={[0, 5, -20]} receiveShadow>
        <boxGeometry args={[40, 10, 1]} />
        <meshStandardMaterial map={wallTexture} roughness={0.9} />
      </mesh>
      
      {/* 墙壁 - 左墙 */}
      <mesh position={[-20, 5, 0]} receiveShadow>
        <boxGeometry args={[1, 10, 40]} />
        <meshStandardMaterial map={wallTexture} roughness={0.9} />
      </mesh>
      
      {/* 墙壁 - 右墙 */}
      <mesh position={[20, 5, 0]} receiveShadow>
        <boxGeometry args={[1, 10, 40]} />
        <meshStandardMaterial map={wallTexture} roughness={0.9} />
      </mesh>
      
      {/* 天花板 */}
      <mesh position={[0, 10, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.8} />
      </mesh>
      
      {/* 大型会议桌 - 椭圆形 */}
      <ConferenceTable position={[0, 0, 0]} />
      
      {/* 大屏幕显示器 */}
      <BigScreen position={[0, 4, -19]} texture={screenTexture} />
      
      {/* 灯光 */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} castShadow />
      <pointLight position={[0, 8, 0]} intensity={0.5} color="#FFE4B5" />
      
      {/* 天花板灯 */}
      <CeilingLights />
      
      {/* 装饰植物 */}
      <Plant position={[-18, 0, -18]} />
      <Plant position={[18, 0, -18]} />
      <Plant position={[-18, 0, 18]} />
      <Plant position={[18, 0, 18]} />
    </group>
  )
}

// 大型会议桌
function ConferenceTable({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 桌面 - 椭圆形 */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[8, 8, 0.15, 64]} />
        <meshStandardMaterial color="#5D4037" roughness={0.3} />
      </mesh>
      
      {/* 桌面边缘装饰 */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[8.1, 8.1, 0.05, 64]} />
        <meshStandardMaterial color="#3E2723" roughness={0.4} />
      </mesh>
      
      {/* 桌腿 - 中央支柱 */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[2, 2.5, 1.2, 32]} />
        <meshStandardMaterial color="#4E342E" roughness={0.4} />
      </mesh>
      
      {/* 桌腿底座 */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[3, 3.5, 0.2, 32]} />
        <meshStandardMaterial color="#3E2723" roughness={0.4} />
      </mesh>
      
      {/* 椅子位置标记 - 用于参考 */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const x = Math.cos(angle) * 9
        const z = Math.sin(angle) * 9
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
            {/* 椅子 */}
            <OfficeChair />
          </group>
        )
      })}
    </group>
  )
}

// 办公椅
function OfficeChair() {
  return (
    <group>
      {/* 座椅 */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.2, 0.2, 1.2]} />
        <meshStandardMaterial color="#424242" roughness={0.6} />
      </mesh>
      
      {/* 靠背 */}
      <mesh position={[0, 1.2, -0.5]} castShadow>
        <boxGeometry args={[1.2, 1.5, 0.15]} />
        <meshStandardMaterial color="#424242" roughness={0.6} />
      </mesh>
      
      {/* 靠背垫 */}
      <mesh position={[0, 1.2, -0.42]}>
        <boxGeometry args={[1, 1, 0.1]} />
        <meshStandardMaterial color="#616161" roughness={0.7} />
      </mesh>
      
      {/* 扶手 */}
      <mesh position={[-0.65, 0.9, 0]} castShadow>
        <boxGeometry args={[0.1, 0.8, 0.1]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.65, 0.9, 0]} castShadow>
        <boxGeometry args={[0.1, 0.8, 0.1]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* 扶手垫 */}
      <mesh position={[-0.65, 1.3, 0]}>
        <boxGeometry args={[0.15, 0.08, 0.6]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.65, 1.3, 0]}>
        <boxGeometry args={[0.15, 0.08, 0.6]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* 支柱 */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.5, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.5} roughness={0.4} />
      </mesh>
      
      {/* 底座 */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
        <meshStandardMaterial color="#333333" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

// 大屏幕显示器
function BigScreen({ position, texture }: { position: [number, number, number], texture: THREE.CanvasTexture }) {
  const screenRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (screenRef.current) {
      // 屏幕轻微发光效果
      const material = screenRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })
  
  return (
    <group position={position}>
      {/* 屏幕边框 */}
      <mesh castShadow>
        <boxGeometry args={[16, 9, 0.3]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
      
      {/* 屏幕显示区域 */}
      <mesh position={[0, 0, 0.16]} ref={screenRef}>
        <planeGeometry args={[15.2, 8.2]} />
        <meshStandardMaterial 
          map={texture} 
          emissive="#ffffff"
          emissiveIntensity={0.3}
          emissiveMap={texture}
        />
      </mesh>
      
      {/* 支架 */}
      <mesh position={[0, -5, 0]} castShadow>
        <boxGeometry args={[1, 1, 0.5]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* 底座 */}
      <mesh position={[0, -5.5, 0.3]} castShadow>
        <boxGeometry args={[3, 0.2, 2]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  )
}

// 天花板灯光
function CeilingLights() {
  const lights = [
    { position: [-10, 9.5, -10] as [number, number, number] },
    { position: [10, 9.5, -10] as [number, number, number] },
    { position: [-10, 9.5, 10] as [number, number, number] },
    { position: [10, 9.5, 10] as [number, number, number] },
    { position: [0, 9.5, 0] as [number, number, number] }
  ]
  
  return (
    <>
      {lights.map((light, i) => (
        <group key={i} position={light.position}>
          {/* 灯罩 */}
          <mesh>
            <boxGeometry args={[4, 0.3, 4]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FFF8E1" emissiveIntensity={0.2} />
          </mesh>
          {/* 点光源 */}
          <pointLight position={[0, -1, 0]} intensity={0.4} color="#FFF8E1" distance={15} />
        </group>
      ))}
    </>
  )
}

// 装饰植物
function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 花盆 */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.6, 1.2, 16]} />
        <meshStandardMaterial color="#8D6E63" roughness={0.8} />
      </mesh>
      
      {/* 土壤 */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.1, 16]} />
        <meshStandardMaterial color="#3E2723" />
      </mesh>
      
      {/* 植物茎 */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 1.8, 8]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>
      
      {/* 叶子 */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const y = 2.5 + Math.random() * 1
        const r = 0.8 + Math.random() * 0.5
        return (
          <mesh 
            key={i} 
            position={[Math.cos(angle) * r, y, Math.sin(angle) * r]}
            rotation={[0.5, angle, 0.3]}
            castShadow
          >
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#66BB6A' : '#4CAF50'} />
          </mesh>
        )
      })}
    </group>
  )
}
