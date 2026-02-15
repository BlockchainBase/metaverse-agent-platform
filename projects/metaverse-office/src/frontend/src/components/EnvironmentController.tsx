import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// 天气类型
export type WeatherType = 'clear' | 'rain' | 'snow'
export type TimeOfDay = 'morning' | 'noon' | 'evening' | 'night'

interface EnvironmentControllerProps {
  weather?: WeatherType
  timeOfDay?: TimeOfDay
  autoCycle?: boolean
}

// 时间段光照配置
const LIGHTING_CONFIG: Record<TimeOfDay, {
  ambient: number
  directional: number
  color: string
  fogColor: string
  skyColor: string
}> = {
  morning: {
    ambient: 0.4,
    directional: 0.8,
    color: '#FFE4B5', // 暖橙色晨光
    fogColor: '#FFF8DC',
    skyColor: '#FFE4B5'
  },
  noon: {
    ambient: 0.6,
    directional: 1.0,
    color: '#FFFFFF', // 正午白光
    fogColor: '#E0F6FF',
    skyColor: '#87CEEB'
  },
  evening: {
    ambient: 0.3,
    directional: 0.6,
    color: '#FF6347', // 夕阳红
    fogColor: '#FFDAB9',
    skyColor: '#FF7F50'
  },
  night: {
    ambient: 0.15,
    directional: 0.3,
    color: '#4169E1', // 月光蓝
    fogColor: '#191970',
    skyColor: '#000080'
  }
}

// 昼夜循环系统
export function DayNightCycle({ 
  autoCycle = true
}: EnvironmentControllerProps) {
  const { scene } = useThree()
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('noon')
  const [cycleProgress, setCycleProgress] = useState(0) // 0-1 表示一天进度
  
  // 光照引用
  const ambientRef = useRef<THREE.AmbientLight>(null)
  const directionalRef = useRef<THREE.DirectionalLight>(null)
  const pointLightsRef = useRef<THREE.Group>(null)
  
  // 当前光照配置
  const lighting = LIGHTING_CONFIG[timeOfDay]
  
  // 自动循环
  useEffect(() => {
    if (!autoCycle) return
    
    const interval = setInterval(() => {
      setCycleProgress(prev => {
        const next = (prev + 0.001) % 1 // 约16分钟一个完整昼夜循环
        
        // 根据进度确定时间段
        if (next < 0.25) setTimeOfDay('morning')
        else if (next < 0.5) setTimeOfDay('noon')
        else if (next < 0.75) setTimeOfDay('evening')
        else setTimeOfDay('night')
        
        return next
      })
    }, 100) // 每100ms更新一次
    
    return () => clearInterval(interval)
  }, [autoCycle])
  
  // 更新光照
  useFrame(() => {
    if (!ambientRef.current || !directionalRef.current) return
    
    // 平滑过渡光照强度
    ambientRef.current.intensity = THREE.MathUtils.lerp(
      ambientRef.current.intensity,
      lighting.ambient,
      0.02
    )
    
    directionalRef.current.intensity = THREE.MathUtils.lerp(
      directionalRef.current.intensity,
      lighting.directional,
      0.02
    )
    
    // 更新光照颜色
    const targetColor = new THREE.Color(lighting.color)
    directionalRef.current.color.lerp(targetColor, 0.02)
    
    // 更新雾效颜色
    const targetFogColor = new THREE.Color(lighting.fogColor)
    if (scene.fog) {
      scene.fog.color.lerp(targetFogColor, 0.02)
    }
    
    // 更新背景色
    const targetBgColor = new THREE.Color(lighting.skyColor)
    scene.background = scene.background || new THREE.Color()
    ;(scene.background as THREE.Color).lerp(targetBgColor, 0.02)
    
    // 太阳/月亮位置
    const angle = cycleProgress * Math.PI * 2 - Math.PI / 2
    directionalRef.current.position.set(
      Math.cos(angle) * 50,
      Math.sin(angle) * 50,
      20
    )
  })
  
  return (
    <>
      {/* 环境光 */}
      <ambientLight ref={ambientRef} intensity={lighting.ambient} />
      
      {/* 方向光（太阳/月亮） */}
      <directionalLight
        ref={directionalRef}
        position={[10, 20, 10]}
        intensity={lighting.directional}
        color={lighting.color}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      
      {/* 夜晚灯笼点光源 */}
      {timeOfDay === 'night' && (
        <group ref={pointLightsRef}>
          <pointLight position={[0, 5, 0]} intensity={1} color="#FFD700" distance={20} />
          <pointLight position={[-15, 5, -15]} intensity={0.8} color="#FFA500" distance={15} />
          <pointLight position={[15, 5, -15]} intensity={0.8} color="#FFA500" distance={15} />
          <pointLight position={[-15, 5, 15]} intensity={0.8} color="#FFA500" distance={15} />
          <pointLight position={[15, 5, 15]} intensity={0.8} color="#FFA500" distance={15} />
        </group>
      )}
      
      {/* 雾效 */}
      <fog attach="fog" args={[lighting.fogColor, 20, 100]} />
    </>
  )
}

// 雨滴粒子系统
function RainParticles({ count = 1000 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  
  const [positions, velocities] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count)
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60 // x
      positions[i * 3 + 1] = Math.random() * 40 + 10 // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60 // z
      velocities[i] = Math.random() * 0.5 + 0.5
    }
    
    return [positions, velocities]
  }, [count])
  
  useFrame(() => {
    if (!pointsRef.current) return
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
    
    for (let i = 0; i < count; i++) {
      // 雨滴下落
      positions[i * 3 + 1] -= velocities[i]
      
      // 重置雨滴位置
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = 40
        positions[i * 3] = (Math.random() - 0.5) * 60
        positions[i * 3 + 2] = (Math.random() - 0.5) * 60
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#A0C4FF"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

// 雪花粒子系统
function SnowParticles({ count = 500 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  
  const [positions, velocities] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 2) // x和y速度
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60
      positions[i * 3 + 1] = Math.random() * 40 + 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60
      velocities[i * 2] = (Math.random() - 0.5) * 0.1 // x漂移
      velocities[i * 2 + 1] = Math.random() * 0.1 + 0.05 // y下落
    }
    
    return [positions, velocities]
  }, [count])
  
  useFrame((state) => {
    if (!pointsRef.current) return
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
    const time = state.clock.elapsedTime
    
    for (let i = 0; i < count; i++) {
      // 雪花飘动（带摇摆）
      positions[i * 3] += velocities[i * 2] + Math.sin(time + i) * 0.02
      positions[i * 3 + 1] -= velocities[i * 2 + 1]
      
      // 重置雪花位置
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = 40
        positions[i * 3] = (Math.random() - 0.5) * 60
        positions[i * 3 + 2] = (Math.random() - 0.5) * 60
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        color="#FFFFFF"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

// 天气控制器
export function WeatherController({ weather = 'clear' }: { weather?: WeatherType }) {
  return (
    <>
      {weather === 'rain' && <RainParticles count={1500} />}
      {weather === 'snow' && <SnowParticles count={800} />}
    </>
  )
}

// 云朵组件
export function Clouds({ count = 5 }: { count?: number }) {
  const groupRef = useRef<THREE.Group>(null)
  
  const clouds = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 80,
        25 + Math.random() * 10,
        (Math.random() - 0.5) * 80
      ] as [number, number, number],
      scale: 0.5 + Math.random() * 1,
      speed: 0.01 + Math.random() * 0.02
    }))
  }, [count])
  
  useFrame(() => {
    if (!groupRef.current) return
    
    groupRef.current.children.forEach((cloud, index) => {
      cloud.position.x += clouds[index].speed
      if (cloud.position.x > 40) {
        cloud.position.x = -40
      }
    })
  })
  
  return (
    <group ref={groupRef}>
      {clouds.map((cloud, i) => (
        <Cloud key={i} position={cloud.position} scale={cloud.scale} />
      ))}
    </group>
  )
}

// 单个云朵
function Cloud({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale}>
      {/* 云朵由多个球体组成 */}
      <mesh>
        <sphereGeometry args={[2, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.8} />
      </mesh>
      <mesh position={[-1.5, 0.3, 0]}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.7} />
      </mesh>
      <mesh position={[1.5, 0.2, 0]}>
        <sphereGeometry args={[1.8, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.5, 0.5]}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

// 环境控制器（整合所有效果）
export function EnvironmentController(props: EnvironmentControllerProps) {
  return (
    <>
      <DayNightCycle {...props} />
      <WeatherController weather={props.weather} />
      {props.weather === 'clear' && <Clouds count={5} />}
    </>
  )
}

export default EnvironmentController
