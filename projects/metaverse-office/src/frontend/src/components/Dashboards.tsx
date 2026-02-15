import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { metaverseDataService, AgentState } from '../services/metaverseData'
import { Project, SystemMetrics } from '../models/types'

interface DashboardsProps {
  useRealData?: boolean
}

// 生成项目总览看板纹理
function createProjectDashboardTexture(projects: Project[]): THREE.CanvasTexture {
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

  // 显示更新时间
  ctx.fillStyle = '#666'
  ctx.font = '16px "Microsoft YaHei", sans-serif'
  ctx.fillText(`更新时间: ${new Date().toLocaleTimeString()}`, 512, 100)

  // 项目进度卡片
  const displayProjects = projects.slice(0, 4)
  if (displayProjects.length === 0) {
    ctx.fillStyle = '#666'
    ctx.font = '24px "Microsoft YaHei", sans-serif'
    ctx.fillText('暂无项目数据', 512, 400)
  } else {
    displayProjects.forEach((proj, i) => {
      const y = 140 + i * 140
      const x = 60

      const statusMap: Record<string, { label: string; color: string }> = {
        completed: { label: '已完成', color: '#4CAF50' },
        in_progress: { label: '进行中', color: '#2196F3' },
        not_started: { label: '未开始', color: '#9E9E9E' },
        delayed: { label: '已延期', color: '#F44336' }
      }
      const statusInfo = statusMap[proj.status] || { label: '未知', color: '#9E9E9E' }

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
  }

  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

// 生成员工效能看板纹理
function createEmployeeDashboardTexture(agents: AgentState[]): THREE.CanvasTexture {
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

  // 员工数据
  const displayAgents = agents.slice(0, 7)
  
  if (displayAgents.length === 0) {
    ctx.fillStyle = '#666'
    ctx.font = '24px "Microsoft YaHei", sans-serif'
    ctx.fillText('暂无员工数据', 512, 400)
  } else {
    // 绘制柱状图
    const maxEfficiency = 100
    const barWidth = 100
    const gap = 30
    const startX = 80

    displayAgents.forEach((agent, i) => {
      const x = startX + i * (barWidth + gap)
      const barHeight = ((agent.efficiency || 80) / maxEfficiency) * 350
      const y = 500 - barHeight

      // 根据状态选择颜色
      const statusColors: Record<string, string> = {
        working: '#4CAF50',
        idle: '#2196F3',
        meeting: '#FF9800',
        busy: '#F44336',
        offline: '#9E9E9E'
      }
      const color = statusColors[agent.status] || '#76FF03'

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
      ctx.fillText(`${agent.efficiency}`, x + barWidth / 2, y - 10)

      // 名字
      ctx.fillStyle = '#cccccc'
      ctx.font = '18px "Microsoft YaHei", sans-serif'
      ctx.fillText(agent.name, x + barWidth / 2, 530)

      // 状态指示
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x + barWidth / 2, 550, 6, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  // 图例
  ctx.fillStyle = '#76FF03'
  ctx.font = '20px "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('📈 效率指数 | 🟢工作中 🟡会议中 🔴忙碌', 60, 720)

  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

// 生成系统状态看板纹理
function createSystemDashboardTexture(metrics: SystemMetrics, systemStatus: any): THREE.CanvasTexture {
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

  // 绘制圆形仪表盘
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
  drawGauge(200, 250, metrics.cpuUsage, 'CPU使用率', '#00E5FF')
  drawGauge(512, 250, metrics.memoryUsage, '内存占用', '#76FF03')
  drawGauge(824, 250, metrics.diskUsage, '存储空间', '#FF9800')
  drawGauge(356, 500, metrics.networkStatus, '网络状态', '#E040FB')
  drawGauge(668, 500, metrics.responseTime > 100 ? 50 : 95, '服务响应', '#4CAF50')

  // 底部状态列表
  const statuses = [
    { name: 'OpenClaw Gateway', status: systemStatus?.gateway === 'online' ? '在线' : '离线', color: systemStatus?.gateway === 'online' ? '#4CAF50' : '#F44336' },
    { name: 'Feishu 连接', status: systemStatus?.feishu === 'online' ? '在线' : '离线', color: systemStatus?.feishu === 'online' ? '#4CAF50' : '#F44336' },
    { name: '邮件服务', status: systemStatus?.email === 'online' ? '在线' : '离线', color: systemStatus?.email === 'online' ? '#4CAF50' : '#F44336' },
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

  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

// 生成实时数据看板纹理
function createRealtimeDashboardTexture(stats: any): THREE.CanvasTexture {
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
  const metrics = stats?.today ? [
    { label: '今日消息', value: stats.today.messages?.toLocaleString() || '0', change: '+12%', color: '#00E5FF' },
    { label: '任务完成', value: stats.today.tasksCompleted?.toString() || '0', change: '+8%', color: '#76FF03' },
    { label: '系统响应', value: `${stats.today.responseTime || 0}ms`, change: '-5%', color: '#E040FB' },
    { label: '活跃用户', value: stats.today.activeUsers?.toString() || '0', change: '+15%', color: '#FF9800' }
  ] : [
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

  // 折线图（模拟数据）
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

  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

// 大数据看板组件
export function Dashboards({ useRealData = false }: DashboardsProps) {
  const dashboard1Ref = useRef<THREE.Group>(null)
  const dashboard2Ref = useRef<THREE.Group>(null)
  const dashboard3Ref = useRef<THREE.Group>(null)
  const dashboard4Ref = useRef<THREE.Group>(null)

  // 数据状态
  const [projects, setProjects] = useState<Project[]>([])
  const [agents, setAgents] = useState<AgentState[]>([])
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 98,
    memoryUsage: 87,
    diskUsage: 95,
    networkStatus: 99,
    activeConnections: 42,
    responseTime: 23
  })
  const [systemStatus, setSystemStatus] = useState<any>({})
  const [stats, setStats] = useState<any>({})

  // 创建纹理
  const projectTexture = useMemo(() => createProjectDashboardTexture(projects), [projects])
  const employeeTexture = useMemo(() => createEmployeeDashboardTexture(agents), [agents])
  const systemTexture = useMemo(() => createSystemDashboardTexture(metrics, systemStatus), [metrics, systemStatus])
  const realtimeTexture = useMemo(() => createRealtimeDashboardTexture(stats), [stats])

  // 连接数据服务
  useEffect(() => {
    if (!useRealData) return

    // 连接WebSocket
    metaverseDataService.connect()

    // 监听数据更新
    const handleDataUpdate = (data: any) => {
      if (data.activeProjects) setProjects(data.activeProjects)
      if (data.agentStates) setAgents(data.agentStates)
      if (data.systemMetrics) setMetrics(data.systemMetrics)
      if (data.statistics) setStats(data.statistics)
    }

    metaverseDataService.onEvent('data_update', handleDataUpdate)

    // 初始加载
    metaverseDataService.getInitialState().then(state => {
      if (state) {
        setProjects(state.projects || [])
        setAgents(state.agents || [])
        setMetrics(state.metrics || {})
        setSystemStatus(state.systemStatus || {})
      }
    })

    return () => {
      // 移除事件监听
      metaverseDataService.disconnect()
    }
  }, [useRealData])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // 轻微的浮动动画
    if (dashboard1Ref.current) {
      dashboard1Ref.current.position.y = 8 + Math.sin(time * 0.5) * 0.2
    }
    if (dashboard2Ref.current) {
      dashboard2Ref.current.position.y = 8 + Math.sin(time * 0.5 + 1) * 0.2
    }
    if (dashboard3Ref.current) {
      dashboard3Ref.current.position.y = 8 + Math.sin(time * 0.5 + 2) * 0.2
    }
    if (dashboard4Ref.current) {
      dashboard4Ref.current.position.y = 8 + Math.sin(time * 0.5 + 3) * 0.2
    }
  })

  return (
    <group>
      {/* 项目总览看板 - 左侧 */}
      <group ref={dashboard1Ref} position={[-35, 8, -10]} rotation={[0, Math.PI / 6, 0]}>
        <mesh>
          <planeGeometry args={[12, 9]} />
          <meshBasicMaterial map={projectTexture} side={THREE.DoubleSide} />
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
      </group>

      {/* 员工效能看板 - 右侧 */}
      <group ref={dashboard2Ref} position={[35, 8, -10]} rotation={[0, -Math.PI / 6, 0]}>
        <mesh>
          <planeGeometry args={[12, 9]} />
          <meshBasicMaterial map={employeeTexture} side={THREE.DoubleSide} />
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
      </group>

      {/* 系统状态看板 - 后方左侧 */}
      <group ref={dashboard3Ref} position={[-25, 8, -25]} rotation={[0, Math.PI / 4, 0]}>
        <mesh>
          <planeGeometry args={[12, 9]} />
          <meshBasicMaterial map={systemTexture} side={THREE.DoubleSide} />
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
      </group>

      {/* 实时数据看板 - 后方右侧 */}
      <group ref={dashboard4Ref} position={[25, 8, -25]} rotation={[0, -Math.PI / 4, 0]}>
        <mesh>
          <planeGeometry args={[12, 9]} />
          <meshBasicMaterial map={realtimeTexture} side={THREE.DoubleSide} />
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
      </group>
    </group>
  )
}

export default Dashboards
