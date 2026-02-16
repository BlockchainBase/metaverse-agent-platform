import { useState, useEffect } from 'react'

interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isPC: boolean
  isLandscape: boolean
  width: number
  height: number
}

export function useDeviceDetect(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isPC: true,
    isLandscape: true,
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isLandscape = width > height
      
      // 根据屏幕宽度判断设备类型
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isPC = width >= 1024
      
      setDeviceInfo({
        isMobile,
        isTablet,
        isPC,
        isLandscape,
        width,
        height
      })
    }

    // 初始检测
    checkDevice()

    // 监听窗口大小变化
    window.addEventListener('resize', checkDevice)
    window.addEventListener('orientationchange', checkDevice)

    return () => {
      window.removeEventListener('resize', checkDevice)
      window.removeEventListener('orientationchange', checkDevice)
    }
  }, [])

  return deviceInfo
}

// 检测是否为触摸设备
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0)
      )
    }
    checkTouch()
  }, [])

  return isTouch
}
