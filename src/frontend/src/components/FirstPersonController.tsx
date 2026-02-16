import { useEffect, useRef, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'

interface FirstPersonControllerProps {
  enabled: boolean
  onPositionChange?: (position: THREE.Vector3) => void
  onEnterMeetingRoom?: () => void
}

// 碰撞检测边界
const BOUNDARIES = {
  minX: -20,
  maxX: 20,
  minZ: -20,
  maxZ: 20,
}

// 障碍物列表（建筑、家具等）
const OBSTACLES = [
  { position: new THREE.Vector3(-8, 0, -8), radius: 2 }, // 院长办公室
  { position: new THREE.Vector3(8, 0, -8), radius: 2 },  // 副院长办公室
  { position: new THREE.Vector3(-8, 0, 8), radius: 2 },  // 总工办公室
  { position: new THREE.Vector3(8, 0, 8), radius: 2 },   // 产品经理办公室
  { position: new THREE.Vector3(0, 0, 0), radius: 3 },   // 中央庭院装饰
]

export function FirstPersonController({
  enabled,
  onPositionChange,
  onEnterMeetingRoom,
}: FirstPersonControllerProps) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)
  // const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  })
  
  // 玩家位置状态
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(15, 1.7, 15))
  
  // 移动速度
  const SPEED = 0.15
  const HEIGHT = 1.7 // 眼睛高度
  
  // 初始化位置
  useEffect(() => {
    if (enabled) {
      camera.position.copy(playerPosition)
      camera.rotation.set(0, -Math.PI / 4, 0) // 朝向中心
      
      // 请求指针锁定
      if (controlsRef.current) {
        controlsRef.current.lock()
      }
    }
  }, [enabled, camera])
  
  // 键盘事件监听
  useEffect(() => {
    if (!enabled) return
    
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = true
          break
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = true
          break
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = true
          break
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = true
          break
        case 'KeyE':
          // 检查是否可以进入会议室
          checkMeetingRoomEntrance()
          break
      }
    }
    
    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = false
          break
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = false
          break
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = false
          break
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = false
          break
      }
    }
    
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
    }
  }, [enabled])
  
  // 碰撞检测
  const checkCollision = (newPosition: THREE.Vector3): boolean => {
    // 检查边界
    if (
      newPosition.x < BOUNDARIES.minX ||
      newPosition.x > BOUNDARIES.maxX ||
      newPosition.z < BOUNDARIES.minZ ||
      newPosition.z > BOUNDARIES.maxZ
    ) {
      return true
    }
    
    // 检查障碍物
    for (const obstacle of OBSTACLES) {
      const distance = newPosition.distanceTo(obstacle.position)
      if (distance < obstacle.radius + 0.5) {
        return true
      }
    }
    
    return false
  }
  
  // 检查会议室入口
  const checkMeetingRoomEntrance = () => {
    const meetingRoomPos = new THREE.Vector3(0, 0, -12)
    const distance = playerPosition.distanceTo(meetingRoomPos)
    
    if (distance < 3) {
      onEnterMeetingRoom?.()
    }
  }
  
  // 每帧更新移动
  useFrame(() => {
    if (!enabled || !controlsRef.current?.isLocked) return
    
    // 计算移动方向
    direction.current.set(0, 0, 0)
    
    if (moveState.current.forward) direction.current.z -= 1
    if (moveState.current.backward) direction.current.z += 1
    if (moveState.current.left) direction.current.x -= 1
    if (moveState.current.right) direction.current.x += 1
    
    if (direction.current.length() > 0) {
      direction.current.normalize()
      
      // 应用相机旋转
      direction.current.applyEuler(camera.rotation)
      direction.current.y = 0 // 保持水平移动
      direction.current.normalize()
      
      // 计算新位置
      const newPosition = playerPosition.clone()
      newPosition.x += direction.current.x * SPEED
      newPosition.z += direction.current.z * SPEED
      newPosition.y = HEIGHT
      
      // 碰撞检测
      if (!checkCollision(newPosition)) {
        setPlayerPosition(newPosition)
        camera.position.x = newPosition.x
        camera.position.z = newPosition.z
        camera.position.y = HEIGHT
        
        onPositionChange?.(newPosition)
      }
    }
  })
  
  if (!enabled) return null
  
  return (
    <>
      <PointerLockControls ref={controlsRef} />
      
      {/* 玩家碰撞体（调试时可显示） */}
      <mesh position={[playerPosition.x, 0.5, playerPosition.z]} visible={false}>
        <capsuleGeometry args={[0.3, 1, 4, 8]} />
        <meshBasicMaterial color="red" wireframe />
      </mesh>
      
    </>
  )
}
