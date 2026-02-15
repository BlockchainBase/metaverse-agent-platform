import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// 最简单的测试场景
function SimpleScene() {
  return (
    <>
      {/* 灯光 */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      
      {/* 一个简单的立方体 */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#4A90E2" />
      </mesh>
      
      {/* 地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#2C3E50" />
      </mesh>
    </>
  )
}

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a2e' }}>
      <h1 style={{ 
        position: 'absolute', 
        top: 20, 
        left: 20, 
        color: 'white',
        zIndex: 100 
      }}>
        测试页面 - 简化版
      </h1>
      <Canvas
        camera={{ position: [5, 5, 5], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <OrbitControls />
        <SimpleScene />
      </Canvas>
    </div>
  )
}

export default App
