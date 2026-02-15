import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// 季节/天气类型
export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter' | 'heavy_rain' | 'heavy_snow' | 'strong_wind' | 'scorching_sun' | 'pleasant'

interface SeasonControllerProps {
  season?: SeasonType
}

// 四季及极端天气环境配置
const SEASON_CONFIG: Record<SeasonType, {
  name: string
  skyColor: string
  fogColor: string
  ambientLight: number
  directionalLight: number
  lightColor: string
  groundColor: string
  treeColor: string
  particleType: 'none' | 'petal' | 'rain' | 'leaf' | 'snow' | 'heavy_rain' | 'heavy_snow' | 'wind' | 'sun_ray'
  particleColor: string
  temperature: string
  description: string
}> = {
  spring: {
    name: '春',
    skyColor: '#000000',      // 黑色天空（星空背景）
    fogColor: '#000000',      // 黑色雾（不遮挡星空）
    ambientLight: 0.5,
    directionalLight: 0.9,
    lightColor: '#FFF8DC',    // 暖白光
    groundColor: '#7CB342',   // 嫩绿色草地
    treeColor: '#FFB6C1',     // 粉色樱花
    particleType: 'petal',    // 樱花飘落
    particleColor: '#FFB6C1',
    temperature: '15-25°C',
    description: '春暖花开，万物复苏'
  },
  summer: {
    name: '夏',
    skyColor: '#000000',      // 黑色天空（星空背景）
    fogColor: '#000000',      // 黑色雾
    ambientLight: 0.7,
    directionalLight: 1.0,
    lightColor: '#FFFACD',    // 阳光黄
    groundColor: '#558B2F',   // 深绿色草地
    treeColor: '#2E7D32',     // 深绿树叶
    particleType: 'rain',     // 夏日阵雨
    particleColor: '#64B5F6',
    temperature: '28-38°C',
    description: '夏日炎炎，生机勃勃'
  },
  autumn: {
    name: '秋',
    skyColor: '#000000',      // 黑色天空（星空背景）
    fogColor: '#000000',      // 黑色雾
    ambientLight: 0.45,
    directionalLight: 0.8,
    lightColor: '#FFD54F',    // 金黄光
    groundColor: '#8D6E63',   // 褐色落叶地
    treeColor: '#E64A19',     // 红叶
    particleType: 'leaf',     // 落叶飘零
    particleColor: '#D84315',
    temperature: '12-22°C',
    description: '秋风送爽，硕果累累'
  },
  winter: {
    name: '冬',
    skyColor: '#000000',      // 黑色天空（星空背景）
    fogColor: '#000000',      // 黑色雾
    ambientLight: 0.35,
    directionalLight: 0.6,
    lightColor: '#E3F2FD',    // 冷白光
    groundColor: '#FAFAFA',   // 白色雪地
    treeColor: '#546E7A',     // 深灰树木
    particleType: 'snow',     // 雪花飘落
    particleColor: '#FFFFFF',
    temperature: '-5-8°C',
    description: '冬日雪景，银装素裹'
  },
  // 极端天气
  heavy_rain: {
    name: '暴雨',
    skyColor: '#1a1a2e',      // 深灰蓝色天空
    fogColor: '#2d3748',      // 深灰雾
    ambientLight: 0.2,
    directionalLight: 0.3,
    lightColor: '#4a5568',    // 灰白光
    groundColor: '#2d3748',   // 深灰地面
    treeColor: '#1a202c',     // 深墨绿
    particleType: 'heavy_rain', // 暴雨粒子
    particleColor: '#a0aec0',
    temperature: '18-22°C',
    description: '暴雨倾盆，电闪雷鸣'
  },
  heavy_snow: {
    name: '暴雪',
    skyColor: '#e2e8f0',      // 灰白色天空
    fogColor: '#cbd5e0',      // 灰白雾
    ambientLight: 0.5,
    directionalLight: 0.4,
    lightColor: '#f7fafc',    // 冷白光
    groundColor: '#ffffff',   // 雪白地面
    treeColor: '#718096',     // 灰树木
    particleType: 'heavy_snow', // 暴雪粒子
    particleColor: '#ffffff',
    temperature: '-15--5°C',
    description: '暴风雪肆虐，天寒地冻'
  },
  strong_wind: {
    name: '大风',
    skyColor: '#2d3748',      // 深灰天空
    fogColor: '#4a5568',      // 灰雾
    ambientLight: 0.4,
    directionalLight: 0.6,
    lightColor: '#e2e8f0',    // 灰白光
    groundColor: '#4a5568',   // 灰地面
    treeColor: '#2f855a',     // 深绿树木
    particleType: 'wind',     // 风沙/落叶粒子
    particleColor: '#a0aec0',
    temperature: '15-20°C',
    description: '狂风呼啸，飞沙走石'
  },
  scorching_sun: {
    name: '烈日',
    skyColor: '#87ceeb',      // 亮蓝色天空
    fogColor: '#ffd700',      // 金黄色雾（热浪）
    ambientLight: 0.9,
    directionalLight: 1.2,    // 超强阳光
    lightColor: '#fff5e6',    // 炽白金光
    groundColor: '#d4a574',   // 黄褐地面（干热）
    treeColor: '#228b22',     // 翠绿树木
    particleType: 'sun_ray',  // 热浪/光线粒子
    particleColor: '#ffd700',
    temperature: '38-45°C',
    description: '烈日炎炎，酷热难耐'
  },
  pleasant: {
    name: '风和日丽',
    skyColor: '#87ceeb',      // 天蓝色天空
    fogColor: '#e6f3ff',      // 淡蓝雾
    ambientLight: 0.7,
    directionalLight: 0.9,
    lightColor: '#fff8dc',    // 暖白光
    groundColor: '#7cb342',   // 嫩绿草地
    treeColor: '#4caf50',     // 翠绿树木
    particleType: 'none',     // 无粒子（清爽）
    particleColor: '#ffffff',
    temperature: '20-26°C',
    description: '风和日丽，天朗气清'
  }
}

// 四季控制器
export function SeasonController({ season = 'spring' }: SeasonControllerProps) {
  const { scene } = useThree()
  const config = SEASON_CONFIG[season]
  
  // 光照引用
  const ambientRef = useRef<THREE.AmbientLight>(null)
  const directionalRef = useRef<THREE.DirectionalLight>(null)
  
  // 平滑过渡
  useFrame(() => {
    if (!ambientRef.current || !directionalRef.current) return
    
    // 过渡光照
    ambientRef.current.intensity = THREE.MathUtils.lerp(
      ambientRef.current.intensity,
      config.ambientLight,
      0.02
    )
    
    directionalRef.current.intensity = THREE.MathUtils.lerp(
      directionalRef.current.intensity,
      config.directionalLight,
      0.02
    )
    
    // 过渡颜色
    const targetColor = new THREE.Color(config.lightColor)
    directionalRef.current.color.lerp(targetColor, 0.02)
    
    // 过渡背景色
    const targetBgColor = new THREE.Color(config.skyColor)
    scene.background = scene.background || new THREE.Color()
    ;(scene.background as THREE.Color).lerp(targetBgColor, 0.02)
    
    // 禁用雾效以显示星空背景
    scene.fog = null
  })
  
  return (
    <>
      {/* 环境光 */}
      <ambientLight ref={ambientRef} intensity={config.ambientLight} />
      
      {/* 方向光（太阳） */}
      <directionalLight
        ref={directionalRef}
        position={[10, 20, 10]}
        intensity={config.directionalLight}
        color={config.lightColor}
        castShadow
      />
      
      {/* 雾效已禁用以显示星空背景 */}
      
      {/* 季节粒子效果 */}
      {config.particleType === 'petal' && <PetalParticles />}
      {config.particleType === 'rain' && <RainParticles />}
      {config.particleType === 'leaf' && <LeafParticles />}
      {config.particleType === 'snow' && <SnowParticles />}
      {config.particleType === 'heavy_rain' && <HeavyRainParticles />}
      {config.particleType === 'heavy_snow' && <HeavySnowParticles />}
      {config.particleType === 'wind' && <WindParticles />}
      {config.particleType === 'sun_ray' && <SunRayParticles />}
    </>
  )
}

// 樱花花瓣粒子
function PetalParticles({ count = 300 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60
      pos[i * 3 + 1] = Math.random() * 30 + 5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60
    }
    return pos
  }, [count])
  
  useFrame((state) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
    const time = state.clock.elapsedTime
    
    for (let i = 0; i < count; i++) {
      // 花瓣飘落带摇摆
      pos[i * 3] += Math.sin(time * 0.5 + i) * 0.02 // x摇摆
      pos[i * 3 + 1] -= 0.03 // y下落
      pos[i * 3 + 2] += Math.cos(time * 0.3 + i) * 0.02 // z摇摆
      
      // 重置
      if (pos[i * 3 + 1] < 0) {
        pos[i * 3 + 1] = 30
        pos[i * 3] = (Math.random() - 0.5) * 60
        pos[i * 3 + 2] = (Math.random() - 0.5) * 60
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#FFB6C1" transparent opacity={0.8} sizeAttenuation />
    </points>
  )
}

// 雨滴粒子
function RainParticles({ count = 800 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60
      pos[i * 3 + 1] = Math.random() * 40 + 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60
    }
    return pos
  }, [count])
  
  useFrame(() => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
    
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= 0.4 // 快速下落
      if (pos[i * 3 + 1] < 0) {
        pos[i * 3 + 1] = 40
        pos[i * 3] = (Math.random() - 0.5) * 60
        pos[i * 3 + 2] = (Math.random() - 0.5) * 60
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#64B5F6" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

// 落叶粒子
function LeafParticles({ count = 200 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60
      pos[i * 3 + 1] = Math.random() * 30 + 5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60
    }
    return pos
  }, [count])
  
  useFrame((state) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
    const time = state.clock.elapsedTime
    
    for (let i = 0; i < count; i++) {
      // 落叶飘动
      pos[i * 3] += Math.sin(time * 0.8 + i) * 0.03
      pos[i * 3 + 1] -= 0.05
      pos[i * 3 + 2] += Math.cos(time * 0.5 + i) * 0.02
      
      if (pos[i * 3 + 1] < 0) {
        pos[i * 3 + 1] = 30
        pos[i * 3] = (Math.random() - 0.5) * 60
        pos[i * 3 + 2] = (Math.random() - 0.5) * 60
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.2} color="#D84315" transparent opacity={0.8} sizeAttenuation />
    </points>
  )
}

// 雪花粒子
function SnowParticles({ count = 500 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60
      pos[i * 3 + 1] = Math.random() * 40 + 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60
    }
    return pos
  }, [count])
  
  useFrame((state) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
    const time = state.clock.elapsedTime
    
    for (let i = 0; i < count; i++) {
      // 雪花飘落带摇摆
      pos[i * 3] += Math.sin(time + i) * 0.01
      pos[i * 3 + 1] -= 0.06
      pos[i * 3 + 2] += Math.cos(time * 0.8 + i) * 0.01
      
      if (pos[i * 3 + 1] < 0) {
        pos[i * 3 + 1] = 40
        pos[i * 3] = (Math.random() - 0.5) * 60
        pos[i * 3 + 2] = (Math.random() - 0.5) * 60
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#FFFFFF" transparent opacity={0.9} sizeAttenuation />
    </points>
  )
}

// 暴雨粒子
function HeavyRainParticles({ count = 2000 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80
      pos[i * 3 + 1] = Math.random() * 50 + 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80
    }
    return pos
  }, [count])
  
  useFrame(() => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
    
    for (let i = 0; i < count; i++) {
      // 暴雨快速下落，带斜向
      pos[i * 3] -= 0.1
      pos[i * 3 + 1] -= 0.8
      pos[i * 3 + 2] -= 0.05
      
      if (pos[i * 3 + 1] < 0) {
        pos[i * 3 + 1] = 50
        pos[i * 3] = (Math.random() - 0.5) * 80
        pos[i * 3 + 2] = (Math.random() - 0.5) * 80
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#718096" transparent opacity={0.7} sizeAttenuation />
    </points>
  )
}

// 暴雪粒子
function HeavySnowParticles({ count = 1500 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80
      pos[i * 3 + 1] = Math.random() * 50 + 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80
    }
    return pos
  }, [count])
  
  useFrame((state) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
    const time = state.clock.elapsedTime
    
    for (let i = 0; i < count; i++) {
      // 暴雪：快速飘落，被风吹得剧烈摇摆
      pos[i * 3] += Math.sin(time * 2 + i) * 0.08 + 0.1
      pos[i * 3 + 1] -= 0.15
      pos[i * 3 + 2] += Math.cos(time * 1.5 + i) * 0.06
      
      if (pos[i * 3 + 1] < 0) {
        pos[i * 3 + 1] = 50
        pos[i * 3] = (Math.random() - 0.5) * 80
        pos[i * 3 + 2] = (Math.random() - 0.5) * 80
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.2} color="#FFFFFF" transparent opacity={0.95} sizeAttenuation />
    </points>
  )
}

// 风沙/大风粒子
function WindParticles({ count = 600 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100
      pos[i * 3 + 1] = Math.random() * 30 + 2
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60
    }
    return pos
  }, [count])
  
  useFrame((state) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
    const time = state.clock.elapsedTime
    
    for (let i = 0; i < count; i++) {
      // 风沙快速水平移动
      pos[i * 3] += 0.5 + Math.sin(time + i * 0.1) * 0.2
      pos[i * 3 + 1] += Math.sin(time * 3 + i) * 0.02
      
      // 循环
      if (pos[i * 3] > 50) {
        pos[i * 3] = -50
        pos[i * 3 + 1] = Math.random() * 30 + 2
        pos[i * 3 + 2] = (Math.random() - 0.5) * 60
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.12} color="#a0aec0" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

// 烈日阳光粒子（热浪/光尘效果）
function SunRayParticles({ count = 300 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60
      pos[i * 3 + 1] = Math.random() * 20 + 5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60
    }
    return pos
  }, [count])
  
  useFrame((state) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
    const time = state.clock.elapsedTime
    
    for (let i = 0; i < count; i++) {
      // 热浪上升效果
      pos[i * 3 + 1] += 0.02 + Math.sin(time + i) * 0.01
      pos[i * 3] += Math.sin(time * 0.5 + i) * 0.005
      
      if (pos[i * 3 + 1] > 25) {
        pos[i * 3 + 1] = 5
        pos[i * 3] = (Math.random() - 0.5) * 60
        pos[i * 3 + 2] = (Math.random() - 0.5) * 60
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.25} color="#ffd700" transparent opacity={0.4} sizeAttenuation />
    </points>
  )
}

// 主环境控制器
export function EnvironmentController({ season = 'spring' }: { season?: SeasonType }) {
  return <SeasonController season={season} />
}

export default EnvironmentController
