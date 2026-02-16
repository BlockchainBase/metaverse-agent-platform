import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ManagerRole, ROLE_CONFIG } from '../data/managers'

// 配饰类型
type AccessoryType = 'glasses' | 'hat' | 'tie' | 'badge' | 'bag'

interface CharacterOutfitProps {
  role: ManagerRole
  accessories?: AccessoryType[]
}

// 角色服装颜色配置 (v3.0 - 7角色)
const OUTFIT_COLORS: Record<ManagerRole, {
  primary: string
  secondary: string
  accent: string
}> = {
  marketing: { primary: '#E91E63', secondary: '#F48FB1', accent: '#FCE4EC' }, // 粉色系
  solution: { primary: '#9C27B0', secondary: '#CE93D8', accent: '#F3E5F5' }, // 紫色系
  developer: { primary: '#2196F3', secondary: '#90CAF9', accent: '#E3F2FD' }, // 蓝色系
  devops: { primary: '#00BCD4', secondary: '#80DEEA', accent: '#E0F7FA' }, // 青色系
  project: { primary: '#FF9800', secondary: '#FFCC80', accent: '#FFF3E0' }, // 橙色系
  finance: { primary: '#4CAF50', secondary: '#A5D6A7', accent: '#E8F5E9' }, // 绿色系
  assistant: { primary: '#F44336', secondary: '#EF9A9A', accent: '#FFEBEE' } // 红色系
}

// 眼镜配饰
function Glasses({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position}>
      {/* 左镜片 */}
      <mesh position={[-0.08 * scale, 0, 0.05 * scale]}>
        <boxGeometry args={[0.08 * scale, 0.06 * scale, 0.02 * scale]} />
        <meshStandardMaterial color="#333" transparent opacity={0.7} />
      </mesh>
      {/* 右镜片 */}
      <mesh position={[0.08 * scale, 0, 0.05 * scale]}>
        <boxGeometry args={[0.08 * scale, 0.06 * scale, 0.02 * scale]} />
        <meshStandardMaterial color="#333" transparent opacity={0.7} />
      </mesh>
      {/* 镜框 */}
      <mesh position={[0, 0, 0.05 * scale]}>
        <boxGeometry args={[0.2 * scale, 0.02 * scale, 0.01 * scale]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      {/* 镜腿 */}
      <mesh position={[-0.13 * scale, 0, 0]}>
        <boxGeometry args={[0.02 * scale, 0.02 * scale, 0.15 * scale]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh position={[0.13 * scale, 0, 0]}>
        <boxGeometry args={[0.02 * scale, 0.02 * scale, 0.15 * scale]} />
        <meshStandardMaterial color="#000" />
      </mesh>
    </group>
  )
}

// 帽子配饰
function Hat({ position, scale, color }: { position: [number, number, number]; scale: number; color: string }) {
  return (
    <group position={position}>
      {/* 帽顶 */}
      <mesh position={[0, 0.08 * scale, 0]}>
        <cylinderGeometry args={[0.25 * scale, 0.25 * scale, 0.1 * scale]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* 帽檐 */}
      <mesh position={[0, 0.02 * scale, 0]}>
        <cylinderGeometry args={[0.35 * scale, 0.35 * scale, 0.02 * scale]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* 装饰带 */}
      <mesh position={[0, 0.06 * scale, 0]}>
        <cylinderGeometry args={[0.26 * scale, 0.26 * scale, 0.03 * scale]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
    </group>
  )
}

// 领带配饰
function Tie({ position, scale, color }: { position: [number, number, number]; scale: number; color: string }) {
  return (
    <group position={position}>
      {/* 领带结 */}
      <mesh position={[0, 0.02 * scale, 0.12 * scale]}>
        <boxGeometry args={[0.05 * scale, 0.04 * scale, 0.02 * scale]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* 领带身 */}
      <mesh position={[0, -0.08 * scale, 0.11 * scale]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.04 * scale, 0.15 * scale, 0.01 * scale]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

// 徽章配饰
function Badge({ position, scale, color }: { position: [number, number, number]; scale: number; color: string }) {
  return (
    <group position={position}>
      {/* 徽章底 */}
      <mesh position={[0.15 * scale, 0, 0.26 * scale]} rotation={[0, 0.3, 0]}>
        <circleGeometry args={[0.04 * scale, 16]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      {/* 徽章图案 */}
      <mesh position={[0.15 * scale, 0, 0.27 * scale]} rotation={[0, 0.3, 0]}>
        <circleGeometry args={[0.025 * scale, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

// 公文包配饰
function Bag({ position, scale }: { position: [number, number, number]; scale: number }) {
  const bagRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (!bagRef.current) return
    // 轻微摆动
    bagRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.05
  })
  
  return (
    <group ref={bagRef} position={position}>
      {/* 包身 */}
      <mesh position={[0.25 * scale, -0.1 * scale, 0]}>
        <boxGeometry args={[0.12 * scale, 0.15 * scale, 0.05 * scale]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* 提手 */}
      <mesh position={[0.25 * scale, -0.02 * scale, 0]}>
        <torusGeometry args={[0.04 * scale, 0.005 * scale, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#5D3A1A" />
      </mesh>
    </group>
  )
}

// 完整角色服装组件
export function CharacterOutfit({ 
  role, 
  accessories = ['glasses', 'tie', 'badge']
}: CharacterOutfitProps) {
  const config = ROLE_CONFIG[role]
  const colors = OUTFIT_COLORS[role]
  const s = config.scale
  
  const height = config.height
  
  return (
    <group>
      {/* 身体服装 */}
      <mesh position={[0, height * 0.3 * s, 0]}>
        <capsuleGeometry args={[0.26 * s, height * 0.5 * s, 4, 8]} />
        <meshStandardMaterial color={colors.primary} roughness={0.5} />
      </mesh>
      
      {/* 衣领 */}
      <mesh position={[0, height * 0.55 * s, 0.12 * s]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.15 * s, 0.08 * s, 0.02 * s]} />
        <meshStandardMaterial color={colors.secondary} />
      </mesh>
      
      {/* 配饰 */}
      {accessories.includes('glasses') && (
        <Glasses position={[0, height * 0.78 * s, 0.28 * s]} scale={s} />
      )}
      
      {accessories.includes('hat') && (
        <Hat position={[0, height * 0.95 * s, 0]} scale={s} color={colors.primary} />
      )}
      
      {accessories.includes('tie') && (
        <Tie position={[0, height * 0.5 * s, 0]} scale={s} color={colors.accent} />
      )}
      
      {accessories.includes('badge') && (
        <Badge position={[0, height * 0.4 * s, 0]} scale={s} color={colors.primary} />
      )}
      
      {accessories.includes('bag') && (
        <Bag position={[0, height * 0.3 * s, 0]} scale={s} />
      )}
    </group>
  )
}

// 角色个性化配置 (v3.0 - 7角色)
export const CHARACTER_PRESETS: Record<ManagerRole, {
  accessories: AccessoryType[]
  description: string
}> = {
  marketing: {
    accessories: ['hat', 'bag'],
    description: '帽子+公文包，时尚达人'
  },
  solution: {
    accessories: ['glasses', 'bag'],
    description: '眼镜+公文包，商务范儿'
  },
  developer: {
    accessories: ['glasses', 'badge'],
    description: '眼镜+徽章，技术大牛'
  },
  devops: {
    accessories: ['badge'],
    description: '简约徽章，务实风格'
  },
  project: {
    accessories: ['tie', 'badge'],
    description: '正装+徽章，领袖风范'
  },
  finance: {
    accessories: ['glasses', 'tie', 'badge'],
    description: '全套正装，专业严谨'
  },
  assistant: {
    accessories: ['tie'],
    description: '领带，专业形象'
  }
}

export default CharacterOutfit
export type { AccessoryType }
