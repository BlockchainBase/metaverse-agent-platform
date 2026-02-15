import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 宇宙星空背景场景
export function SpaceScene() {
  const starsRef = useRef<THREE.Points>(null)
  const nebulaRef = useRef<THREE.Mesh>(null)
  
  // 创建星空粒子
  const starPositions = useMemo(() => {
    const positions = new Float32Array(3000 * 3)
    for (let i = 0; i < 3000; i++) {
      const radius = 50 + Math.random() * 100
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
    }
    return positions
  }, [])
  
  // 创建星云纹理
  const nebulaTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    
    // 创建径向渐变
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
    gradient.addColorStop(0, 'rgba(138, 43, 226, 0.4)')
    gradient.addColorStop(0.3, 'rgba(75, 0, 130, 0.2)')
    gradient.addColorStop(0.6, 'rgba(25, 25, 112, 0.1)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)
    
    // 添加星星点缀
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      const size = Math.random() * 2
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`
      ctx.fill()
    }
    
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }, [])
  
  // 动画
  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.02
    }
    if (nebulaRef.current) {
      nebulaRef.current.rotation.z = state.clock.elapsedTime * 0.01
    }
  })
  
  return (
    <group>
      {/* 星空粒子 */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={3000}
            array={starPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.5}
          color="#ffffff"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
      
      {/* 星云背景 - 紫色 */}
      <mesh ref={nebulaRef} position={[-30, 20, -80]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial
          map={nebulaTexture}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* 星云背景 - 蓝色 */}
      <mesh position={[40, -10, -60]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[80, 80]} />
        <meshBasicMaterial
          color="#1E90FF"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* 星云背景 - 粉色 */}
      <mesh position={[20, 30, -70]} rotation={[0, 0, -Math.PI / 6]}>
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial
          color="#FF69B4"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* 远处的星系 */}
      <mesh position={[-50, 40, -100]}>
        <sphereGeometry args={[15, 32, 32]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* 地面平台 - 科技感 */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[40, 64]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* 地面网格线 */}
      <gridHelper args={[80, 40, '#4A5568', '#2D3748']} position={[0, -1.9, 0]} />
      
      {/* 发光圆环装饰 */}
      <mesh position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[35, 36, 64]} />
        <meshBasicMaterial color="#00E5FF" transparent opacity={0.3} />
      </mesh>
      
      {/* 内圈发光 */}
      <mesh position={[0, -1.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[25, 26, 64]} />
        <meshBasicMaterial color="#E040FB" transparent opacity={0.4} />
      </mesh>
    </group>
  )
}
