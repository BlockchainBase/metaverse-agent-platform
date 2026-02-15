import * as THREE from 'three'

// 生成青砖墙纹理 - 鲜艳卡通风格
export function createBrickTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  
  // 底色 - 鲜艳的砖红色
  ctx.fillStyle = '#E57373'
  ctx.fillRect(0, 0, 512, 512)
  
  // 砖块
  const brickWidth = 64
  const brickHeight = 32
  
  for (let y = 0; y < 512; y += brickHeight) {
    const offset = (y / brickHeight) % 2 === 0 ? 0 : brickWidth / 2
    for (let x = -brickWidth; x < 512; x += brickWidth) {
      // 砖块颜色变化 - 粉红到红色渐变
      const r = 220 + Math.random() * 40 - 20
      const g = 100 + Math.random() * 30 - 15
      const b = 100 + Math.random() * 30 - 15
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
      ctx.fillRect(x + offset + 1, y + 1, brickWidth - 2, brickHeight - 2)
      
      // 砖块高光
      ctx.fillStyle = `rgba(255, 255, 255, 0.2)`
      ctx.fillRect(x + offset + 1, y + 1, brickWidth - 2, 3)
      
      // 阴影
      ctx.fillStyle = `rgba(0, 0, 0, 0.15)`
      ctx.fillRect(x + offset + 1, y + brickHeight - 4, brickWidth - 2, 3)
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

// 生成瓦片屋顶纹理 - 鲜艳卡通风格
export function createRoofTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  
  // 底色 - 亮橙色
  ctx.fillStyle = '#FF8A65'
  ctx.fillRect(0, 0, 512, 512)
  
  // 绘制瓦片
  const tileWidth = 48
  const tileHeight = 40
  
  for (let y = 0; y < 512; y += tileHeight) {
    const offset = (y / tileHeight) % 2 === 0 ? 0 : tileWidth / 2
    for (let x = -tileWidth; x < 512; x += tileWidth) {
      // 瓦片渐变 - 黄橙色
      const gradient = ctx.createLinearGradient(x + offset, y, x + offset, y + tileHeight)
      gradient.addColorStop(0, '#FFB74D')
      gradient.addColorStop(0.5, '#FF9800')
      gradient.addColorStop(1, '#F57C00')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x + offset + tileWidth / 2, y + tileHeight, tileWidth / 2, Math.PI, 0)
      ctx.fill()
      
      // 瓦片高光
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x + offset + tileWidth / 2, y + tileHeight, tileWidth / 2 - 3, Math.PI * 1.2, Math.PI * 1.8)
      ctx.stroke()
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

// 生成草坪纹理 - 改为蓝色水面风格
export function createGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // 底色 - 亮蓝色水面
  ctx.fillStyle = '#4FC3F7'
  ctx.fillRect(0, 0, 512, 512)

  // 添加水波纹
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    const radius = 10 + Math.random() * 30

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  // 添加波浪线条
  for (let i = 0; i < 50; i++) {
    const y = Math.random() * 512
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, y)
    for (let x = 0; x < 512; x += 20) {
      ctx.lineTo(x, y + Math.sin(x * 0.05) * 3)
    }
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(10, 10)
  return texture
}

// 生成石板地面纹理 - 改为粉红色卡通风格
export function createStoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // 底色 - 粉红色
  ctx.fillStyle = '#F8BBD9'
  ctx.fillRect(0, 0, 512, 512)

  // 石板
  const stoneSize = 64

  for (let y = 0; y < 512; y += stoneSize) {
    for (let x = 0; x < 512; x += stoneSize) {
      // 石板颜色变化 - 粉红色系
      const r = 255
      const g = 150 + Math.random() * 40 - 20
      const b = 180 + Math.random() * 40 - 20
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
      ctx.fillRect(x + 2, y + 2, stoneSize - 4, stoneSize - 4)

      // 石板高光
      ctx.fillStyle = `rgba(255, 255, 255, 0.3)`
      ctx.fillRect(x + 2, y + 2, stoneSize - 4, 4)

      // 石板阴影
      ctx.fillStyle = `rgba(200, 100, 150, 0.2)`
      ctx.fillRect(x + 2, y + stoneSize - 6, stoneSize - 4, 4)

      // 圆角装饰
      ctx.fillStyle = `rgba(255, 255, 255, 0.4)`
      ctx.beginPath()
      ctx.arc(x + 8, y + 8, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 4)
  return texture
}

// 生成木门纹理
export function createWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  
  // 底色 - 深木色
  ctx.fillStyle = '#5c3a21'
  ctx.fillRect(0, 0, 256, 512)
  
  // 木纹
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * 256
    const width = 1 + Math.random() * 3
    const opacity = 0.1 + Math.random() * 0.2
    
    ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`
    ctx.lineWidth = width
    ctx.beginPath()
    ctx.moveTo(x, 0)
    
    // 弯曲的木纹
    let currentX = x
    for (let y = 0; y < 512; y += 20) {
      currentX += (Math.random() - 0.5) * 10
      ctx.lineTo(currentX, y)
    }
    ctx.stroke()
  }
  
  // 门钉
  const rows = 4
  const cols = 3
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = 50 + col * 80
      const y = 80 + row * 100
      
      // 门钉阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.beginPath()
      ctx.arc(x + 2, y + 2, 10, 0, Math.PI * 2)
      ctx.fill()
      
      // 门钉本体
      const gradient = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, 10)
      gradient.addColorStop(0, '#FFD700')
      gradient.addColorStop(1, '#B8860B')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, 10, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

// 生成门楣招牌文字纹理
export function createSignTexture(text: string, subText: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  
  // 底色 - 深红色牌匾
  ctx.fillStyle = '#8B0000'
  ctx.fillRect(0, 0, 1024, 256)
  
  // 金色边框
  ctx.strokeStyle = '#FFD700'
  ctx.lineWidth = 8
  ctx.strokeRect(10, 10, 1004, 236)
  
  // 内边框
  ctx.strokeStyle = '#FFD700'
  ctx.lineWidth = 4
  ctx.strokeRect(20, 20, 984, 216)
  
  // 主标题文字
  ctx.fillStyle = '#FFD700'
  ctx.font = 'bold 48px "Microsoft YaHei", "SimHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 512, 110)
  
  // 副标题文字
  ctx.fillStyle = '#FFA500'
  ctx.font = '32px "Microsoft YaHei", "SimHei", sans-serif'
  ctx.fillText(subText, 512, 180)
  
  // 装饰角花
  const drawCorner = (x: number, y: number, rotate: number) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotate)
    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.arc(0, 0, 15, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  
  drawCorner(40, 40, 0)
  drawCorner(984, 40, 0)
  drawCorner(40, 216, 0)
  drawCorner(984, 216, 0)
  
  const texture = new THREE.CanvasTexture(canvas)
  return texture
}
