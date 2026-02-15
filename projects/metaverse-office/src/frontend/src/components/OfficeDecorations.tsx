import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 会议桌组件
export function ConferenceTable({ position = [0, 0, 0] as [number, number, number], rotation = [0, 0, 0] as [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* 桌面 */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 0.1, 2]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} />
      </mesh>
      
      {/* 桌腿 */}
      <mesh position={[-1.8, 0.375, 0.8]} castShadow>
        <cylinderGeometry args={[0.08, 0.06, 0.75]} />
        <meshStandardMaterial color="#5D3A1A" />
      </mesh>
      <mesh position={[1.8, 0.375, 0.8]} castShadow>
        <cylinderGeometry args={[0.08, 0.06, 0.75]} />
        <meshStandardMaterial color="#5D3A1A" />
      </mesh>
      <mesh position={[-1.8, 0.375, -0.8]} castShadow>
        <cylinderGeometry args={[0.08, 0.06, 0.75]} />
        <meshStandardMaterial color="#5D3A1A" />
      </mesh>
      <mesh position={[1.8, 0.375, -0.8]} castShadow>
        <cylinderGeometry args={[0.08, 0.06, 0.75]} />
        <meshStandardMaterial color="#5D3A1A" />
      </mesh>
      
      {/* 椅子 */}
      <Chair position={[-2.5, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Chair position={[2.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
      <Chair position={[0, 0, -1.5]} rotation={[0, 0, 0]} />
    </group>
  )
}

// 椅子组件
function Chair({ position = [0, 0, 0] as [number, number, number], rotation = [0, 0, 0] as [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* 座垫 */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.6, 0.1, 0.6]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
      
      {/* 靠背 */}
      <mesh position={[0, 0.9, -0.25]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.1]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
      
      {/* 椅腿 */}
      {[[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.225, z]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.45]} />
          <meshStandardMaterial color="#7F8C8D" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

// 电脑组件
export function Computer({ position = [0, 0, 0] as [number, number, number], rotation = [0, 0, 0] as [number, number, number], isOn = true }) {
  const screenRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (!screenRef.current || !isOn) return
    // 屏幕轻微闪烁效果
    const material = screenRef.current.material as THREE.MeshStandardMaterial
    material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.05
  })
  
  return (
    <group position={position} rotation={rotation}>
      {/* 显示器底座 */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.05]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
      
      {/* 显示器支架 */}
      <mesh position={[0, 0.25, -0.05]} castShadow>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
      
      {/* 显示器屏幕 */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.8, 0.5, 0.05]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      
      {/* 显示内容 */}
      <mesh ref={screenRef} position={[0, 0.5, 0.03]}>
        <planeGeometry args={[0.72, 0.42]} />
        <meshStandardMaterial 
          color={isOn ? "#1E3A5F" : "#0A0A0A"} 
          emissive={isOn ? "#0D4F8B" : "#000000"}
          emissiveIntensity={isOn ? 0.3 : 0}
        />
      </mesh>
      
      {/* 屏幕上的代码行装饰 */}
      {isOn && [0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[-0.2 + i * 0.1, 0.5 + 0.1 - i * 0.08, 0.04]}>
          <planeGeometry args={[0.08, 0.02]} />
          <meshBasicMaterial color="#00FF00" transparent opacity={0.6 - i * 0.1} />
        </mesh>
      ))}
      
      {/* 键盘 */}
      <mesh position={[0, 0.02, 0.4]} castShadow>
        <boxGeometry args={[0.6, 0.03, 0.25]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
      
      {/* 鼠标 */}
      <mesh position={[0.45, 0.02, 0.4]} castShadow>
        <capsuleGeometry args={[0.04, 0.08]} />
        <meshStandardMaterial color="#34495E" />
      </mesh>
    </group>
  )
}

// 绿植组件
export function Plant({ position = [0, 0, 0] as [number, number, number], scale = 1 }) {
  const leavesRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (!leavesRef.current) return
    // 叶子轻微摆动
    leavesRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
    leavesRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.03
  })
  
  return (
    <group position={position} scale={scale}>
      {/* 花盆 */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.2, 0.5]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      
      {/* 土壤 */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.05]} />
        <meshStandardMaterial color="#3D2817" />
      </mesh>
      
      {/* 植物茎 */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.05, 0.6]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      
      {/* 叶子组 */}
      <group ref={leavesRef} position={[0, 1.1, 0]}>
        {/* 主叶子 */}
        <mesh position={[0, 0.2, 0]} rotation={[0.3, 0, 0]} castShadow>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#32CD32" />
        </mesh>
        
        {/* 侧叶子 */}
        {[-0.3, 0.3, -0.5, 0.5].map((x, i) => (
          <mesh 
            key={i} 
            position={[x, 0.1 - Math.abs(x) * 0.1, 0]} 
            rotation={[0, 0, x > 0 ? -0.5 : 0.5]}
            castShadow
          >
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#228B22" : "#32CD32"} />
          </mesh>
        ))}
        
        {/* 顶部叶子 */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <coneGeometry args={[0.1, 0.3, 8]} />
          <meshStandardMaterial color="#006400" />
        </mesh>
      </group>
    </group>
  )
}

// 大型盆栽
export function LargePlant({ position = [0, 0, 0] as [number, number, number], rotation = [0, 0, 0] as [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* 大花盆 */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.35, 1]} />
        <meshStandardMaterial color="#D2691E" roughness={0.7} />
      </mesh>
      
      {/* 装饰纹理 */}
      <mesh position={[0, 0.5, 0.35]}>
        <torusGeometry args={[0.35, 0.02, 8, 32]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* 土壤 */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.1]} />
        <meshStandardMaterial color="#3D2817" />
      </mesh>
      
      {/* 树干 */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 1.6]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      
      {/* 树冠 */}
      <mesh position={[0, 2.8, 0]} castShadow>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#228B22" roughness={0.8} />
      </mesh>
      
      {/* 额外的小枝叶 */}
      {[[0.6, 2.5, 0.6], [-0.5, 2.7, 0.5], [0.4, 3, -0.5], [-0.6, 2.4, -0.4]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#32CD32" : "#228B22"} />
        </mesh>
      ))}
    </group>
  )
}

// 办公桌组件
export function OfficeDesk({ position = [0, 0, 0] as [number, number, number], rotation = [0, 0, 0] as [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* 桌面 */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.08, 0.8]} />
        <meshStandardMaterial color="#F5DEB3" roughness={0.5} />
      </mesh>
      
      {/* 桌腿 */}
      <mesh position={[-0.65, 0.375, 0.3]} castShadow>
        <boxGeometry args={[0.08, 0.75, 0.08]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.65, 0.375, 0.3]} castShadow>
        <boxGeometry args={[0.08, 0.75, 0.08]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[-0.65, 0.375, -0.3]} castShadow>
        <boxGeometry args={[0.08, 0.75, 0.08]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.65, 0.375, -0.3]} castShadow>
        <boxGeometry args={[0.08, 0.75, 0.08]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* 抽屉 */}
      <mesh position={[0.55, 0.5, 0]} castShadow>
        <boxGeometry args={[0.25, 0.3, 0.6]} />
        <meshStandardMaterial color="#DEB887" />
      </mesh>
      
      {/* 抽屉把手 */}
      <mesh position={[0.68, 0.5, 0]}>
        <sphereGeometry args={[0.03]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

// 文件柜组件
export function FilingCabinet({ position = [0, 0, 0] as [number, number, number], rotation = [0, 0, 0] as [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* 柜体 */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.5, 1.5, 0.4]} />
        <meshStandardMaterial color="#708090" metalness={0.3} roughness={0.5} />
      </mesh>
      
      {/* 抽屉分隔线 */}
      {[0.25, 0, -0.25].map((y, i) => (
        <mesh key={i} position={[0, 0.95 + y * 0.5, 0.21]}>
          <boxGeometry args={[0.45, 0.02, 0.02]} />
          <meshStandardMaterial color="#2C3E50" />
        </mesh>
      ))}
      
      {/* 抽屉把手 */}
      {[1.1, 0.85, 0.6].map((y, i) => (
        <mesh key={i} position={[0, y, 0.22]}>
          <boxGeometry args={[0.15, 0.03, 0.02]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.8} />
        </mesh>
      ))}
      
      {/* 标签 */}
      {['合同', '报表', '档案'].map((_, i) => (
        <mesh key={i} position={[0.15, 1.1 - i * 0.25, 0.21]}>
          <planeGeometry args={[0.1, 0.06]} />
          <meshBasicMaterial color="#FFFACD" />
        </mesh>
      ))}
    </group>
  )
}

// 白板组件
export function Whiteboard({ position = [0, 0, 0] as [number, number, number], rotation = [0, 0, 0] as [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* 板面 */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[3, 1.8, 0.05]} />
        <meshStandardMaterial color="#F8F8FF" />
      </mesh>
      
      {/* 边框 */}
      <mesh position={[0, 1.5, -0.03]}>
        <boxGeometry args={[3.1, 1.9, 0.03]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.5} />
      </mesh>
      
      {/* 支架 */}
      <mesh position={[-1.4, 0.75, -0.1]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.5]} />
        <meshStandardMaterial color="#808080" />
      </mesh>
      <mesh position={[1.4, 0.75, -0.1]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.5]} />
        <meshStandardMaterial color="#808080" />
      </mesh>
      
      {/* 底座 */}
      <mesh position={[-1.4, 0.05, -0.1]} castShadow>
        <boxGeometry args={[0.3, 0.1, 0.4]} />
        <meshStandardMaterial color="#808080" />
      </mesh>
      <mesh position={[1.4, 0.05, -0.1]} castShadow>
        <boxGeometry args={[0.3, 0.1, 0.4]} />
        <meshStandardMaterial color="#808080" />
      </mesh>
      
      {/* 白板上的涂鸦装饰 */}
      {[[-0.8, 2], [0, 1.8], [0.7, 2.1]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.03]}>
          <planeGeometry args={[0.3, 0.2]} />
          <meshBasicMaterial color={["#FF6B6B", "#4ECDC4", "#95E1D3"][i]} transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

// 场景装饰总组件
export function OfficeDecorations() {
  return (
    <group>
      {/* 中央会议区 */}
      <ConferenceTable position={[0, 0, -5]} />
      
      {/* 办公区电脑 */}
      <Computer position={[-8, 0.8, 5]} rotation={[0, Math.PI / 4, 0]} />
      <Computer position={[8, 0.8, 5]} rotation={[0, -Math.PI / 4, 0]} />
      <Computer position={[-5, 0.8, 8]} rotation={[0, Math.PI / 6, 0]} />
      <Computer position={[5, 0.8, 8]} rotation={[0, -Math.PI / 6, 0]} />
      
      {/* 办公桌 */}
      <OfficeDesk position={[-8, 0, 5]} rotation={[0, Math.PI / 4, 0]} />
      <OfficeDesk position={[8, 0, 5]} rotation={[0, -Math.PI / 4, 0]} />
      <OfficeDesk position={[-5, 0, 8]} rotation={[0, Math.PI / 6, 0]} />
      <OfficeDesk position={[5, 0, 8]} rotation={[0, -Math.PI / 6, 0]} />
      
      {/* 绿植装饰 */}
      <Plant position={[-12, 0, -12]} scale={1.2} />
      <Plant position={[12, 0, -12]} scale={1.2} />
      <Plant position={[-12, 0, 12]} scale={1.2} />
      <Plant position={[12, 0, 12]} scale={1.2} />
      <Plant position={[0, 0, -12]} scale={1.5} />
      
      {/* 大型盆栽 */}
      <LargePlant position={[-15, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <LargePlant position={[15, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
      
      {/* 文件柜 */}
      <FilingCabinet position={[-10, 0, -8]} rotation={[0, Math.PI / 3, 0]} />
      <FilingCabinet position={[10, 0, -8]} rotation={[0, -Math.PI / 3, 0]} />
      
      {/* 白板 */}
      <Whiteboard position={[0, 0, -15]} rotation={[0, 0, 0]} />
    </group>
  )
}

export default OfficeDecorations
