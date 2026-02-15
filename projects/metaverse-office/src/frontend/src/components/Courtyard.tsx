import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { 
  createBrickTexture, 
  createRoofTileTexture, 
  createGrassTexture,
  createStoneTexture,
  createWoodTexture,
  createSignTexture
} from '../utils/textures'
import { Dashboards } from './Dashboards'

// 中式四合院场景 - 带真实贴图
export function ChineseCourtyard() {
  // 创建贴图
  const brickTexture = useMemo(() => createBrickTexture(), [])
  const roofTexture = useMemo(() => createRoofTileTexture(), [])
  const grassTexture = useMemo(() => createGrassTexture(), [])
  const stoneTexture = useMemo(() => createStoneTexture(), [])
  const woodTexture = useMemo(() => createWoodTexture(), [])
  
  // 设置贴图重复
  brickTexture.repeat.set(4, 2)
  roofTexture.repeat.set(3, 2)
  
  return (
    <group>
      {/* 庭院石板地面 */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial map={stoneTexture} roughness={0.8} />
      </mesh>
      
      {/* 四合院围墙 - 使用青砖贴图 */}
      <Wall position={[0, 2.5, -15]} size={[30, 5, 1]} texture={brickTexture} roofTexture={roofTexture} />
      <Wall position={[-10, 2.5, 15]} size={[10, 5, 1]} texture={brickTexture} roofTexture={roofTexture} />
      <Wall position={[10, 2.5, 15]} size={[10, 5, 1]} texture={brickTexture} roofTexture={roofTexture} />
      <Wall position={[-15, 2.5, 0]} size={[1, 5, 30]} texture={brickTexture} roofTexture={roofTexture} />
      <Wall position={[15, 2.5, 0]} size={[1, 5, 30]} texture={brickTexture} roofTexture={roofTexture} />
      
      {/* 大门 - 使用木门贴图 */}
      <Gate position={[0, 0, 15]} woodTexture={woodTexture} roofTexture={roofTexture} />
      
      {/* 正房（北房） */}
      <MainHouse position={[0, 0, -10]} brickTexture={brickTexture} roofTexture={roofTexture} woodTexture={woodTexture} />
      
      {/* 东西厢房 */}
      <SideHouse position={[-10, 0, 0]} rotation={[0, Math.PI / 2, 0]} brickTexture={brickTexture} roofTexture={roofTexture} woodTexture={woodTexture} />
      <SideHouse position={[10, 0, 0]} rotation={[0, -Math.PI / 2, 0]} brickTexture={brickTexture} roofTexture={roofTexture} woodTexture={woodTexture} />
      
      {/* 南房 */}
      <SouthHouse position={[0, 0, 10]} rotation={[0, Math.PI, 0]} brickTexture={brickTexture} roofTexture={roofTexture} woodTexture={woodTexture} />
      
      {/* 庭院装饰 */}
      <Decorations stoneTexture={stoneTexture} />
      
      {/* 大草坪 - 使用草坪贴图 */}
      <Lawn grassTexture={grassTexture} />
    </group>
  )
}

// 围墙 - 使用青砖贴图
function Wall({ position, size, texture, roofTexture }: { 
  position: [number, number, number], 
  size: [number, number, number],
  texture: THREE.CanvasTexture,
  roofTexture: THREE.CanvasTexture
}) {
  return (
    <group position={position}>
      {/* 墙体 - 青砖贴图 */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial map={texture} roughness={0.9} />
      </mesh>
      {/* 墙顶 - 瓦片贴图 */}
      <mesh position={[0, size[1] / 2 + 0.25, 0]} castShadow>
        <boxGeometry args={[size[0] + 0.6, 0.5, size[2] + 0.6]} />
        <meshStandardMaterial map={roofTexture} roughness={0.7} />
      </mesh>
    </group>
  )
}

// 大门
function Gate({ position, woodTexture, roofTexture }: { 
  position: [number, number, number], 
  woodTexture: THREE.CanvasTexture,
  roofTexture: THREE.CanvasTexture
}) {
  const signRef = useRef<THREE.Group>(null)
  const signTexture = useMemo(() => 
    createSignTexture('成都高新信息技术研究院', '数字员工元宇宙办公室'),
    []
  )
  
  useFrame((state) => {
    if (signRef.current) {
      signRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.02
    }
  })
  
  return (
    <group position={position}>
      {/* 门框 */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[8, 5, 1.5]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      
      {/* 门楣 - 瓦片贴图 */}
      <mesh position={[0, 5.2, 0]} castShadow>
        <boxGeometry args={[9, 0.6, 2]} />
        <meshStandardMaterial map={roofTexture} roughness={0.7} />
      </mesh>
      
      {/* 左门 - 木门贴图 */}
      <mesh position={[-1.5, 2, 0.8]}>
        <boxGeometry args={[2.5, 4, 0.2]} />
        <meshStandardMaterial map={woodTexture} roughness={0.8} />
      </mesh>
      {/* 右门 - 木门贴图 */}
      <mesh position={[1.5, 2, 0.8]}>
        <boxGeometry args={[2.5, 4, 0.2]} />
        <meshStandardMaterial map={woodTexture} roughness={0.8} />
      </mesh>
      
      {/* 招牌 - 成都高新信息技术研究院 数字员工元宇宙办公室 */}
      <group ref={signRef} position={[0, 6.8, 0.5]}>
        {/* 招牌板 */}
        <mesh castShadow>
          <boxGeometry args={[10, 2, 0.2]} />
          <meshStandardMaterial map={signTexture} roughness={0.4} />
        </mesh>
        {/* 悬挂链条 */}
        <mesh position={[-4.5, 1.2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.2]} />
          <meshStandardMaterial color="#333" metalness={0.8} />
        </mesh>
        <mesh position={[4.5, 1.2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.2]} />
          <meshStandardMaterial color="#333" metalness={0.8} />
        </mesh>
      </group>
      
      {/* 两侧灯笼 */}
      <Lantern position={[-4, 4, 1]} />
      <Lantern position={[4, 4, 1]} />
    </group>
  )
}

// 灯笼
function Lantern({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial 
          color="#FF4444" 
          emissive="#FF2222" 
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    </group>
  )
}

// 正房
function MainHouse({ position, brickTexture, roofTexture, woodTexture }: { 
  position: [number, number, number],
  brickTexture: THREE.CanvasTexture,
  roofTexture: THREE.CanvasTexture,
  woodTexture: THREE.CanvasTexture
}) {
  return (
    <group position={position}>
      {/* 主体 - 青砖墙面 */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[12, 5, 6]} />
        <meshStandardMaterial map={brickTexture} roughness={0.9} />
      </mesh>
      {/* 屋顶 - 瓦片贴图 */}
      <mesh position={[0, 5.5, 0]} castShadow>
        <coneGeometry args={[8, 3, 4]} />
        <meshStandardMaterial map={roofTexture} roughness={0.7} />
      </mesh>
      {/* 门 - 木门贴图 */}
      <mesh position={[0, 1.5, 3.05]}>
        <planeGeometry args={[2, 3]} />
        <meshStandardMaterial map={woodTexture} />
      </mesh>
      {/* 柱子 */}
      {[-5, -2.5, 0, 2.5, 5].map((x, i) => (
        <mesh key={i} position={[x, 2.5, 3.1]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 5]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// 厢房
function SideHouse({ position, rotation, brickTexture, roofTexture, woodTexture }: { 
  position: [number, number, number], 
  rotation: [number, number, number],
  brickTexture: THREE.CanvasTexture,
  roofTexture: THREE.CanvasTexture,
  woodTexture: THREE.CanvasTexture
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[8, 4, 4]} />
        <meshStandardMaterial map={brickTexture} roughness={0.9} />
      </mesh>
      <mesh position={[0, 4.2, 0]} castShadow>
        <coneGeometry args={[5.5, 2.5, 4]} />
        <meshStandardMaterial map={roofTexture} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.2, 2.05]}>
        <planeGeometry args={[1.5, 2.4]} />
        <meshStandardMaterial map={woodTexture} />
      </mesh>
    </group>
  )
}

// 南房
function SouthHouse({ position, rotation, brickTexture, roofTexture, woodTexture }: { 
  position: [number, number, number], 
  rotation: [number, number, number],
  brickTexture: THREE.CanvasTexture,
  roofTexture: THREE.CanvasTexture,
  woodTexture: THREE.CanvasTexture
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 1.8, 0]} castShadow>
        <boxGeometry args={[10, 3.6, 4]} />
        <meshStandardMaterial map={brickTexture} roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.8, 0]} castShadow>
        <coneGeometry args={[6, 2, 4]} />
        <meshStandardMaterial map={roofTexture} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1, 2.05]}>
        <planeGeometry args={[1.5, 2]} />
        <meshStandardMaterial map={woodTexture} />
      </mesh>
    </group>
  )
}

// 庭院装饰
function Decorations({ stoneTexture }: { stoneTexture: THREE.CanvasTexture }) {
  return (
    <group>
      {/* 石桌石凳 - 使用石板贴图 */}
      <group position={[-6, 0, -5]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[1, 1, 0.1, 16]} />
          <meshStandardMaterial map={stoneTexture} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.6]} />
          <meshStandardMaterial map={stoneTexture} roughness={0.9} />
        </mesh>
        {[-1.5, 1.5].map((x, i) => (
          <mesh key={i} position={[x, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.5]} />
            <meshStandardMaterial map={stoneTexture} roughness={0.9} />
          </mesh>
        ))}
      </group>
      
      {/* 树 */}
      <Tree position={[-12, 0, -12]} />
      <Tree position={[12, 0, -12]} />
      <Tree position={[-12, 0, 12]} scale={0.8} />
      <Tree position={[12, 0, 12]} scale={0.8} />
    </group>
  )
}

// 树
function Tree({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.35, 3]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      <mesh position={[0, 4, 0]} castShadow>
        <sphereGeometry args={[2, 16, 16]} />
        <meshStandardMaterial color="#228B22" roughness={0.8} />
      </mesh>
    </group>
  )
}

// 大草坪 - 使用草坪贴图
function Lawn({ grassTexture }: { grassTexture: THREE.CanvasTexture }) {
  return (
    <group>
      {/* 草坪地面 */}
      <mesh position={[0, -0.05, 35]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 40]} />
        <meshStandardMaterial map={grassTexture} roughness={1} />
      </mesh>
      
      {/* 草坪边界小路 */}
      <mesh position={[0, 0, 18]}>
        <boxGeometry args={[50, 0.05, 1]} />
        <meshStandardMaterial color="#D2B48C" roughness={0.9} />
      </mesh>
      
      {/* 远处的山 */}
      <mesh position={[0, 8, 60]}>
        <coneGeometry args={[40, 15, 4]} />
        <meshStandardMaterial color="#6B8E6B" transparent opacity={0.6} />
      </mesh>
      
      {/* 大数据看板 */}
      <Dashboards />
      
      {/* v3.0: 四房标识牌 */}
      <RoomSigns />
    </group>
  )
}

// ============================================
// v3.0 新增：房间标识牌组件
// ============================================

// 生成房间标识牌贴图
function createRoomSignTexture(text: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  
  // 背景
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 512, 128)
  
  // 边框
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 8
  ctx.strokeRect(4, 4, 504, 120)
  
  // 文字
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 48px "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 256, 64)
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

// 房间标识牌组件
function RoomSign({ 
  position, 
  text, 
  color,
  rotation = [0, 0, 0]
}: { 
  position: [number, number, number]
  text: string
  color: string
  rotation?: [number, number, number]
}) {
  const signTexture = useMemo(() => createRoomSignTexture(text, color), [text, color])
  const groupRef = useRef<THREE.Group>(null)
  
  // 轻微浮动动画
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1
    }
  })
  
  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* 标牌 */}
      <mesh castShadow>
        <boxGeometry args={[4, 1, 0.2]} />
        <meshStandardMaterial map={signTexture} />
      </mesh>
      
      {/* 支架 */}
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.6]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      
      {/* 底座 */}
      <mesh position={[0, -1.6, 0]}>
        <boxGeometry args={[0.5, 0.1, 0.5]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    </group>
  )
}

// v3.0: 四合院四房标识
export function RoomSigns() {
  return (
    <group>
      {/* 南房 - 市场部 */}
      <RoomSign 
        position={[0, 4, 15]} 
        text="🏢 市场部" 
        color="#E91E63"
        rotation={[0, Math.PI, 0]}  // 面向北
      />
      
      {/* 东厢房 - 方案部 */}
      <RoomSign 
        position={[14, 4, 0]} 
        text="💡 方案部" 
        color="#9C27B0"
        rotation={[0, -Math.PI / 2, 0]}  // 面向西
      />
      
      {/* 西厢房 - 交付部 */}
      <RoomSign 
        position={[-14, 4, 0]} 
        text="🚀 交付部" 
        color="#2196F3"
        rotation={[0, Math.PI / 2, 0]}  // 面向东
      />
      
      {/* 北房 - 管理中心 */}
      <RoomSign 
        position={[0, 4, -13]} 
        text="👔 管理中心" 
        color="#F44336"
        rotation={[0, 0, 0]}  // 面向南
      />
    </group>
  )
}

