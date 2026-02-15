import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'

// 动态滚动信息组件
function ScrollingText({ 
  texts, 
  color, 
  speed = 50,
  position,
  width = 11
}: { 
  texts: string[]
  color: string
  speed?: number
  position: [number, number, number]
  width?: number
}) {
  const [offset, setOffset] = useState(0)
  const fullText = texts.join('  •  ')
  
  useEffect(() => {
    let animationId: number
    let lastTime = Date.now()
    
    const animate = () => {
      const now = Date.now()
      const delta = (now - lastTime) / 1000
      lastTime = now
      
      setOffset(prev => (prev + speed * delta) % (fullText.length * 12))
      animationId = requestAnimationFrame(animate)
    }
    
    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [fullText, speed])

  return (
    <Html position={position} transform>
      <div style={{
        width: `${width * 35}px`,
        height: '30px',
        background: 'rgba(0,0,0,0.8)',
        borderTop: `3px solid ${color}`,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '0 0 8px 8px'
      }}>
        <div style={{
          whiteSpace: 'nowrap',
          color: color,
          fontSize: '14px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          transform: `translateX(-${offset}px)`,
          paddingLeft: '10px'
        }}>
          {fullText}  •  {fullText}  •  {fullText}
        </div>
      </div>
    </Html>
  )
}

// 看板数据
const SCROLLING_MESSAGES = {
  project: [
    '📊 智慧校园项目进度65%',
    '✅ 方案评审已通过',
    '⚠️ 第三方接口需关注',
    '📅 预计2周完成Demo',
    '👥 研发团队全力投入中'
  ],
  employee: [
    '👤 AI市场专员正在跟进XX教育局项目',
    '📐 AI方案架构师完成技术方案设计',
    '💻 AI开发工程师开发用户管理模块',
    '🚀 AI交付专家准备项目部署',
    '📋 AI项目管家协调各方资源'
  ],
  system: [
    '💚 OpenClaw Gateway 运行正常',
    '💚 Feishu 连接稳定',
    '💚 WebSocket 数据传输正常',
    '📊 CPU使用率 45% | 内存占用 62%',
    '⚡ 系统响应时间 23ms'
  ],
  realtime: [
    '📈 今日消息数 1,284 条',
    '✅ 今日完成任务 156 个',
    '👥 当前在线用户 42 人',
    '📊 项目平均完成率 78%',
    '🎯 本月目标达成率 85%'
  ]
}

// 项目总览看板
function ProjectDashboard({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 768
    const ctx = canvas.getContext('2d')!

    // 黑色背景
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, 1024, 768)

    // 蓝色边框
    ctx.strokeStyle = '#00E5FF'
    ctx.lineWidth = 6
    ctx.strokeRect(10, 10, 1004, 748)

    // 标题
    ctx.fillStyle = '#00E5FF'
    ctx.font = 'bold 48px "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('📊 项目总览看板', 512, 70)

    // 更新时间
    ctx.fillStyle = '#666'
    ctx.font = '16px "Microsoft YaHei", sans-serif'
    ctx.fillText(`更新时间: ${new Date().toLocaleTimeString()}`, 512, 100)

    // 模拟项目数据
    const projects = [
      { name: '智慧校园系统', progress: 65, status: 'in_progress', assignee: 'AI开发团队' },
      { name: '客户演示平台', progress: 85, status: 'in_progress', assignee: 'AI方案团队' },
      { name: '数据分析中心', progress: 40, status: 'in_progress', assignee: 'AI项目团队' },
      { name: '运维监控系统', progress: 90, status: 'completed', assignee: 'AI交付团队' }
    ]

    projects.forEach((proj, i) => {
      const y = 140 + i * 140
      const x = 60

      const statusMap: Record<string, { label: string; color: string }> = {
        completed: { label: '已完成', color: '#4CAF50' },
        in_progress: { label: '进行中', color: '#2196F3' },
        not_started: { label: '未开始', color: '#9E9E9E' },
        delayed: { label: '已延期', color: '#F44336' }
      }
      const statusInfo = statusMap[proj.status]

      // 卡片背景
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(x, y, 904, 120)

      // 项目名称
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 32px "Microsoft YaHei", sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(proj.name, x + 20, y + 45)

      // 进度条背景
      ctx.fillStyle = '#333'
      ctx.fillRect(x + 20, y + 65, 600, 30)

      // 进度条
      ctx.fillStyle = statusInfo.color
      ctx.fillRect(x + 20, y + 65, 600 * (proj.progress / 100), 30)

      // 进度百分比
      ctx.fillStyle = '#ffffff'
      ctx.font = '24px "Microsoft YaHei", sans-serif'
      ctx.fillText(`${proj.progress}%`, x + 640, y + 88)

      // 状态标签
      ctx.fillStyle = statusInfo.color
      ctx.fillRect(x + 750, y + 60, 120, 40)
      ctx.fillStyle = '#000'
      ctx.font = 'bold 20px "Microsoft YaHei", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(statusInfo.label, x + 810, y + 87)

      // 负责人
      ctx.fillStyle = '#999'
      ctx.font = '16px "Microsoft YaHei", sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(`负责人: ${proj.assignee}`, x + 750, y + 115)
    })

    return new THREE.CanvasTexture(canvas)
  }, [])

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[12, 9]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
      {/* 边框 */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[12.2, 9.2]} />
        <meshBasicMaterial color="#00E5FF" />
      </mesh>
      {/* 支架 */}
      <mesh position={[0, -4.5, -0.5]}>
        <cylinderGeometry args={[0.1, 0.1, 4]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* 滚动信息 */}
      <ScrollingText 
        texts={SCROLLING_MESSAGES.project} 
        color="#00E5FF" 
        position={[0, -4.6, 0.1]}
        speed={40}
      />
    </group>
  )
}

// 员工效能看板
function EmployeeDashboard({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 768
    const ctx = canvas.getContext('2d')!

    // 黑色背景
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, 1024, 768)

    // 绿色边框
    ctx.strokeStyle = '#76FF03'
    ctx.lineWidth = 6
    ctx.strokeRect(10, 10, 1004, 748)

    // 标题
    ctx.fillStyle = '#76FF03'
    ctx.font = 'bold 48px "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('👥 员工效能看板', 512, 70)

    // 更新时间
    ctx.fillStyle = '#666'
    ctx.font = '16px "Microsoft YaHei", sans-serif'
    ctx.fillText(`更新时间: ${new Date().toLocaleTimeString()}`, 512, 100)

    // 模拟员工数据
    const employees = [
      { name: 'AI市场专员', efficiency: 85, status: 'working' },
      { name: 'AI方案架构师', efficiency: 92, status: 'working' },
      { name: 'AI开发工程师', efficiency: 88, status: 'busy' },
      { name: 'AI交付专家', efficiency: 90, status: 'working' },
      { name: 'AI项目管家', efficiency: 95, status: 'meeting' },
      { name: 'AI财务助手', efficiency: 82, status: 'working' },
      { name: 'AI院长助理', efficiency: 98, status: 'working' }
    ]

    // 柱状图
    const maxEfficiency = 100
    const barWidth = 100
    const gap = 25
    const startX = 75

    employees.forEach((emp, i) => {
      const x = startX + i * (barWidth + gap)
      const barHeight = (emp.efficiency / maxEfficiency) * 350
      const y = 500 - barHeight

      const statusColors: Record<string, string> = {
        working: '#4CAF50',
        idle: '#2196F3',
        meeting: '#FF9800',
        busy: '#F44336',
        offline: '#9E9E9E'
      }
      const color = statusColors[emp.status] || '#76FF03'

      // 柱状图
      const gradient = ctx.createLinearGradient(x, y + barHeight, x, y)
      gradient.addColorStop(0, color)
      gradient.addColorStop(1, `${color}80`)
      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth, barHeight)

      // 顶部数值
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 24px "Microsoft YaHei", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`${emp.efficiency}`, x + barWidth / 2, y - 10)

      // 名字
      ctx.fillStyle = '#cccccc'
      ctx.font = '18px "Microsoft YaHei", sans-serif'
      ctx.fillText(emp.name.substring(2), x + barWidth / 2, 530)

      // 状态指示
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x + barWidth / 2, 550, 6, 0, Math.PI * 2)
      ctx.fill()
    })

    return new THREE.CanvasTexture(canvas)
  }, [])

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[12, 9]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
      {/* 边框 */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[12.2, 9.2]} />
        <meshBasicMaterial color="#76FF03" />
      </mesh>
      {/* 支架 */}
      <mesh position={[0, -4.5, -0.5]}>
        <cylinderGeometry args={[0.1, 0.1, 4]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* 滚动信息 */}
      <ScrollingText 
        texts={SCROLLING_MESSAGES.employee} 
        color="#76FF03" 
        position={[0, -4.6, 0.1]}
        speed={35}
      />
    </group>
  )
}

// 系统状态看板
function SystemDashboard({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 768
    const ctx = canvas.getContext('2d')!

    // 黑色背景
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, 1024, 768)

    // 紫色边框
    ctx.strokeStyle = '#E040FB'
    ctx.lineWidth = 6
    ctx.strokeRect(10, 10, 1004, 748)

    // 标题
    ctx.fillStyle = '#E040FB'
    ctx.font = 'bold 48px "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('⚙️ 系统状态监控', 512, 70)

    // 更新时间
    ctx.fillStyle = '#666'
    ctx.font = '16px "Microsoft YaHei", sans-serif'
    ctx.fillText(`更新时间: ${new Date().toLocaleTimeString()}`, 512, 100)

    // 仪表盘
    const drawGauge = (x: number, y: number, value: number, label: string, color: string) => {
      const radius = 80

      // 外圆背景
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 15
      ctx.stroke()

      // 进度弧
      ctx.beginPath()
      ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * value / 100))
      ctx.strokeStyle = color
      ctx.lineWidth = 15
      ctx.stroke()

      // 中心数值
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 36px "Microsoft YaHei", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${value}%`, x, y)

      // 标签
      ctx.fillStyle = '#cccccc'
      ctx.font = '20px "Microsoft YaHei", sans-serif'
      ctx.fillText(label, x, y + radius + 30)
    }

    // 仪表盘
    drawGauge(200, 250, 45, 'CPU使用率', '#00E5FF')
    drawGauge(512, 250, 62, '内存占用', '#76FF03')
    drawGauge(824, 250, 78, '存储空间', '#FF9800')
    drawGauge(356, 500, 99, '网络状态', '#E040FB')
    drawGauge(668, 500, 95, '服务响应', '#4CAF50')

    // 底部状态列表
    const statuses = [
      { name: 'OpenClaw Gateway', status: '在线', color: '#4CAF50' },
      { name: 'Feishu 连接', status: '在线', color: '#4CAF50' },
      { name: '邮件服务', status: '在线', color: '#4CAF50' },
      { name: 'WebSocket', status: '正常', color: '#4CAF50' },
      { name: '数据同步', status: '正常', color: '#4CAF50' }
    ]

    ctx.textAlign = 'left'
    statuses.forEach((item, i) => {
      const y = 680 + i * 25
      ctx.fillStyle = '#666'
      ctx.font = '18px "Microsoft YaHei", sans-serif'
      ctx.fillText(item.name, 60, y)

      ctx.fillStyle = item.color
      ctx.fillRect(300, y - 15, 15, 15)

      ctx.fillStyle = '#ffffff'
      ctx.fillText(item.status, 330, y)
    })

    return new THREE.CanvasTexture(canvas)
  }, [])

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[12, 9]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
      {/* 边框 */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[12.2, 9.2]} />
        <meshBasicMaterial color="#E040FB" />
      </mesh>
      {/* 支架 */}
      <mesh position={[0, -4.5, -0.5]}>
        <cylinderGeometry args={[0.1, 0.1, 4]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* 滚动信息 */}
      <ScrollingText 
        texts={SCROLLING_MESSAGES.system} 
        color="#E040FB" 
        position={[0, -4.6, 0.1]}
        speed={45}
      />
    </group>
  )
}

// 实时数据看板
function RealtimeDashboard({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 768
    const ctx = canvas.getContext('2d')!

    // 黑色背景
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, 1024, 768)

    // 橙色边框
    ctx.strokeStyle = '#FF9800'
    ctx.lineWidth = 6
    ctx.strokeRect(10, 10, 1004, 748)

    // 标题
    ctx.fillStyle = '#FF9800'
    ctx.font = 'bold 48px "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('📈 实时数据监控', 512, 70)

    // 更新时间
    ctx.fillStyle = '#666'
    ctx.font = '16px "Microsoft YaHei", sans-serif'
    ctx.fillText(`更新时间: ${new Date().toLocaleTimeString()}`, 512, 100)

    // 关键指标卡片
    const metrics = [
      { label: '今日消息', value: '1,284', change: '+12%', color: '#00E5FF' },
      { label: '任务完成', value: '156', change: '+8%', color: '#76FF03' },
      { label: '系统响应', value: '23ms', change: '-5%', color: '#E040FB' },
      { label: '活跃用户', value: '42', change: '+15%', color: '#FF9800' }
    ]

    metrics.forEach((metric, i) => {
      const x = 60 + i * 240
      const y = 120

      // 卡片背景
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(x, y, 220, 150)

      // 数值
      ctx.fillStyle = metric.color
      ctx.font = 'bold 48px "Microsoft YaHei", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(metric.value, x + 110, y + 65)

      // 标签
      ctx.fillStyle = '#cccccc'
      ctx.font = '20px "Microsoft YaHei", sans-serif'
      ctx.fillText(metric.label, x + 110, y + 100)

      // 变化率
      const isPositive = metric.change.startsWith('+')
      ctx.fillStyle = isPositive ? '#4CAF50' : '#f44336'
      ctx.font = 'bold 18px "Microsoft YaHei", sans-serif'
      ctx.fillText(metric.change, x + 110, y + 130)
    })

    // 折线图
    ctx.strokeStyle = '#00E5FF'
    ctx.lineWidth = 3
    ctx.beginPath()
    const dataPoints = [60, 75, 65, 80, 90, 85, 95, 88, 92, 98, 95, 100]
    const chartStartX = 80
    const chartStartY = 650
    const chartWidth = 864
    const chartHeight = 300

    dataPoints.forEach((val, i) => {
      const x = chartStartX + (i / (dataPoints.length - 1)) * chartWidth
      const y = chartStartY - (val / 100) * chartHeight
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // 填充区域
    ctx.lineTo(chartStartX + chartWidth, chartStartY)
    ctx.lineTo(chartStartX, chartStartY)
    ctx.closePath()
    ctx.fillStyle = 'rgba(0, 229, 255, 0.2)'
    ctx.fill()

    // 坐标轴
    ctx.strokeStyle = '#666'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(chartStartX, chartStartY)
    ctx.lineTo(chartStartX + chartWidth, chartStartY)
    ctx.moveTo(chartStartX, chartStartY)
    ctx.lineTo(chartStartX, chartStartY - chartHeight)
    ctx.stroke()

    // X轴标签
    ctx.fillStyle = '#999'
    ctx.font = '16px "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'center'
    for (let i = 0; i < 12; i++) {
      const x = chartStartX + (i / 11) * chartWidth
      ctx.fillText(`${i + 1}月`, x, chartStartY + 25)
    }

    // 图表标题
    ctx.fillStyle = '#FF9800'
    ctx.font = 'bold 24px "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('📊 年度项目完成趋势', chartStartX, chartStartY - chartHeight - 20)

    return new THREE.CanvasTexture(canvas)
  }, [])

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[12, 9]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
      {/* 边框 */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[12.2, 9.2]} />
        <meshBasicMaterial color="#FF9800" />
      </mesh>
      {/* 支架 */}
      <mesh position={[0, -4.5, -0.5]}>
        <cylinderGeometry args={[0.1, 0.1, 4]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* 滚动信息 */}
      <ScrollingText 
        texts={SCROLLING_MESSAGES.realtime} 
        color="#FF9800" 
        position={[0, -4.6, 0.1]}
        speed={40}
      />
    </group>
  )
}

// 主看板组件
export function Dashboards() {
  const group1Ref = useRef<THREE.Group>(null)
  const group2Ref = useRef<THREE.Group>(null)
  const group3Ref = useRef<THREE.Group>(null)
  const group4Ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // 轻微的浮动动画
    if (group1Ref.current) {
      group1Ref.current.position.y = 8 + Math.sin(time * 0.5) * 0.2
    }
    if (group2Ref.current) {
      group2Ref.current.position.y = 8 + Math.sin(time * 0.5 + 1) * 0.2
    }
    if (group3Ref.current) {
      group3Ref.current.position.y = 8 + Math.sin(time * 0.5 + 2) * 0.2
    }
    if (group4Ref.current) {
      group4Ref.current.position.y = 8 + Math.sin(time * 0.5 + 3) * 0.2
    }
  })

  return (
    <group>
      {/* 项目总览看板 - 左侧 */}
      <group ref={group1Ref}>
        <ProjectDashboard position={[-35, 8, -10]} rotation={[0, Math.PI / 6, 0]} />
      </group>

      {/* 员工效能看板 - 右侧 */}
      <group ref={group2Ref}>
        <EmployeeDashboard position={[35, 8, -10]} rotation={[0, -Math.PI / 6, 0]} />
      </group>

      {/* 系统状态看板 - 后方左侧 */}
      <group ref={group3Ref}>
        <SystemDashboard position={[-25, 8, -25]} rotation={[0, Math.PI / 4, 0]} />
      </group>

      {/* 实时数据看板 - 后方右侧 */}
      <group ref={group4Ref}>
        <RealtimeDashboard position={[25, 8, -25]} rotation={[0, -Math.PI / 4, 0]} />
      </group>
    </group>
  )
}

export default Dashboards
