import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Stars } from '@react-three/drei'
import { MetaverseScene } from './scenes/MetaverseScene'
import { UIOverlay } from './components/UIOverlay'
import { useMetaverseStore } from './stores/metaverse'
import './App.css'

function App() {
  const { initSocket } = useMetaverseStore()

  useEffect(() => {
    initSocket()
  }, [])

  return (
    <div className="metaverse-container">
      <Canvas
        camera={{ position: [0, 20, 40], fov: 60 }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <Sky sunPosition={[100, 20, 100]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          maxPolarAngle={Math.PI / 2 - 0.1}
          minDistance={10}
          maxDistance={100}
        />
        <MetaverseScene />
      </Canvas>
      <UIOverlay />
    </div>
  )
}

export default App