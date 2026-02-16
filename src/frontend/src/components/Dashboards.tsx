import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { metaverseDataService, AgentState } from '../services/metaverseData'
import { Project, SystemMetrics } from '../models/types'

interface DashboardsProps {
  useRealData?: boolean
  organizationId?: string
}

// 管理中枢数据结构
interface ManagementHubData {
  kpi: {
    totalAgents: number
    activeAgents: number
    totalTasks: number
    completedTasks: number
    completionRate: number
    avgEfficiency: number
    systemUptime: number
    collaborationScore: number
  }
  employeePerformance: Array<{
    id: string
    name: string
    role: string
    completed: number
    efficiency: number
    quality: number
    speed: number
    collaboration: number
    overall: number
  }>
  projects: Array<{
    id: number
    name: string
    status: string
    progress: number
    manager: string
    members: number
    tasks: number
    completedTasks: number
    deadline: string
    priority: string
  }>
  taskExecution: {
    avgCompletionTime: number
    onTimeRate: number
    qualityScore: number
    reworkRate: number
    satisfaction: number
    byType: Array<{
      type: string
      count: number
      avgTime: number
      quality: number
      satisfaction: number
    }>
  }
  alerts: Array<{
    type: string
    message: string
    agent: string
    time: string
  }>
  pendingDecisions: Array<{
    id: number
    title: string
    type: string
    urgency: string
    requestor: string
    options: string[]
    deadline: string
  }>
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
      ctx.fillText(`${typeof agent.efficiency === 'number' ? agent.efficiency.toFixed(1) : agent.efficiency}`, x + barWidth / 2, y - 10)

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

// 管理中枢KPI看板纹理
function createManagementKPITexture(data: ManagementHubData): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 768
  const ctx = canvas.getContext('2d')!

  // 黑色背景
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, 1024, 768)

  // 青色边框
  ctx.strokeStyle = '#00E5FF'
  ctx.lineWidth = 6
  ctx.strokeRect(10, 10, 1004, 748)

  // 标题
  ctx.fillStyle = '#00E5FF'
  ctx.font = 'bold 48px "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('📊 管理中枢 - KPI总览', 512, 70)

  // 更新时间
  ctx.fillStyle = '#666'
  ctx.font = '16px "Microsoft YaHei", sans-serif'
  ctx.fillText(`更新时间: ${new Date().toLocaleTimeString()}`, 512, 100)

  const kpi = data.kpi || {
    totalAgents: 11,
    activeAgents: 11,
    totalTasks: 94,
    completedTasks: 94,
    completionRate: 100,
    avgEfficiency: 87.5,
    systemUptime: 99.9,
    collaborationScore: 85
  }

  // KPI卡片数据
  const kpis = [
    { label: 'Agent总数', value: (kpi as any).totalAgents || 11, color: '#00E5FF', icon: '👥' },
    { label: '活跃Agent', value: (kpi as any).activeAgents || 11, color: '#76FF03', icon: '✅' },
    { label: '总任务数', value: (kpi as any).totalTasks || 94, color: '#FF9800', icon: '📋' },
    { label: '已完成', value: (kpi as any).completedTasks || 94, color: '#4CAF50', icon: '✓' },
    { label: '完成率', value: `${(kpi as any).completionRate || 100}%`, color: '#E040FB', icon: '📈' },
    { label: '平均效率', value: `${(kpi as any).avgEfficiency || 87.5}%`, color: '#2196F3', icon: '⚡' }
  ]

  // 绘制KPI卡片（2行3列）
  kpis.forEach((kpi, i) => {
    const row = Math.floor(i / 3)
    const col = i % 3
    const x = 60 + col * 310
    const y = 140 + row * 180

    // 卡片背景
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(x, y, 280, 150)

    // 图标
    ctx.fillStyle = kpi.color
    ctx.font = '36px "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(kpi.icon, x + 20, y + 50)

    // 数值
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px "Microsoft YaHei", sans-serif'
    ctx.fillText(String(kpi.value), x + 20, y + 100)

    // 标签
    ctx.fillStyle = kpi.color
    ctx.font = '20px "Microsoft YaHei", sans-serif'
    ctx.fillText(kpi.label, x + 20, y + 135)
  })

  // 待处理决策
  const decisions = data.pendingDecisions || []
  if (decisions.length > 0) {
    ctx.fillStyle = '#F44336'
    ctx.font = 'bold 20px "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`⚠️ 待处理决策: ${decisions.length}项`, 60, 520)

    decisions.slice(0, 2).forEach((decision, i) => {
      const y = 550 + i * 40
      ctx.fillStyle = '#FF9800'
      ctx.font = '16px "Microsoft YaHei", sans-serif'
      ctx.fillText(`• ${decision.title} (${decision.urgency === 'high' ? '高' : '中'}优先级)`, 80, y)
    })
  }

  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

// 员工绩效看板纹理
function createEmployeePerformanceTexture(data: ManagementHubData): THREE.CanvasTexture {
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
  ctx.fillText('🏆 员工绩效排名', 512, 70)

  // 更新时间
  ctx.fillStyle = '#666'
  ctx.font = '16px "Microsoft YaHei", sans-serif'
  ctx.fillText(`更新时间: ${new Date().toLocaleTimeString()}`, 512, 100)

  const employees = (data.employeePerformance || []).sort((a, b) => b.overall - a.overall)

  // 表头
  ctx.fillStyle = '#76FF03'
  ctx.font = 'bold 20px "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('排名', 40, 140)
  ctx.fillText('姓名', 100, 140)
  ctx.fillText('角色', 220, 140)
  ctx.fillText('完成', 360, 140)
  ctx.fillText('效率', 440, 140)
  ctx.fillText('质量', 520, 140)
  ctx.fillText('协作', 600, 140)
  ctx.fillText('综合', 680, 140)

  // 绘制员工数据
  employees.slice(0, 8).forEach((emp, i) => {
    const y = 180 + i * 65
    const isTop3 = i < 3

    // 背景
    ctx.fillStyle = isTop3 ? 'rgba(118, 255, 3, 0.1)' : 'rgba(255,255,255,0.05)'
    ctx.fillRect(30, y - 30, 964, 55)

    // 排名
    ctx.fillStyle = isTop3 ? '#FFD700' : '#76FF03'
    ctx.font = `bold ${isTop3 ? 28 : 24}px "Microsoft YaHei", sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(`${i + 1}`, 60, y)

    // 姓名
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 20px "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(emp.name, 100, y)

    // 角色
    ctx.fillStyle = '#999'
    ctx.font = '16px "Microsoft YaHei", sans-serif'
    ctx.fillText(emp.role, 220, y)

    // 各项指标
    const metrics = [
      { value: emp.completed, color: '#00E5FF' },
      { value: emp.efficiency.toFixed(1), color: '#76FF03' },
      { value: emp.quality, color: '#FF9800' },
      { value: emp.collaboration, color: '#E040FB' },
      { value: emp.overall.toFixed(1), color: '#4CAF50' }
    ]

    metrics.forEach((metric, j) => {
      const x = 380 + j * 80
      ctx.fillStyle = metric.color
      ctx.font = 'bold 18px "Microsoft YaHei", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(String(metric.value), x, y)
    })
  })

  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

// 项目进度看板纹理
function createProjectProgressTexture(data: ManagementHubData): THREE.CanvasTexture {
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
  ctx.fillText('📁 项目进度监控', 512, 70)

  // 更新时间
  ctx.fillStyle = '#666'
  ctx.font = '16px "Microsoft YaHei", sans-serif'
  ctx.fillText(`更新时间: ${new Date().toLocaleTimeString()}`, 512, 100)

  const projects = data.projects || []

  // 绘制项目卡片
  projects.forEach((proj, i) => {
    const y = 140 + i * 110

    // 卡片背景
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(40, y, 944, 95)

    // 状态颜色
    const statusColors: Record<string, string> = {
      completed: '#4CAF50',
      in_progress: '#2196F3',
      pending: '#9E9E9E',
      delayed: '#F44336'
    }
    const statusColor = statusColors[proj.status] || '#9E9E9E'

    // 优先级标记
    const priorityColors: Record<string, string> = {
      urgent: '#F44336',
      high: '#FF9800',
      medium: '#2196F3',
      low: '#9E9E9E'
    }
    ctx.fillStyle = priorityColors[proj.priority] || '#9E9E9E'
    ctx.fillRect(40, y, 6, 95)

    // 项目名称
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 24px "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(proj.name, 60, y + 35)

    // 负责人
    ctx.fillStyle = '#999'
    ctx.font = '16px "Microsoft YaHei", sans-serif'
    ctx.fillText(`负责人: ${proj.manager} | 成员: ${proj.members}人`, 60, y + 60)

    // 进度条背景
    ctx.fillStyle = '#333'
    ctx.fillRect(60, y + 70, 400, 12)

    // 进度条
    ctx.fillStyle = statusColor
    ctx.fillRect(60, y + 70, 400 * (proj.progress / 100), 12)

    // 进度百分比
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 18px "Microsoft YaHei", sans-serif'
    ctx.fillText(`${proj.progress}%`, 470, y + 81)

    // 任务数
    ctx.fillStyle = '#E040FB'
    ctx.font = '16px "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(`${proj.completedTasks}/${proj.tasks} 任务`, 960, y + 45)

    // 截止日期
    ctx.fillStyle = '#999'
    ctx.font = '14px "Microsoft YaHei", sans-serif'
    ctx.fillText(`截止: ${proj.deadline}`, 960, y + 70)
  })

  // 任务执行统计
  const taskExec = data.taskExecution
  if (taskExec) {
    ctx.fillStyle = '#E040FB'
    ctx.font = 'bold 18px "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`📈 任务执行统计: 平均完成时间 ${taskExec.avgCompletionTime}分钟 | 准时率 ${taskExec.onTimeRate}% | 质量评分 ${taskExec.qualityScore}`, 40, 720)
  }

  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

// 告警与系统状态看板纹理
function createAlertsSystemTexture(data: ManagementHubData, systemStatus: any): THREE.CanvasTexture {
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
  ctx.fillText('⚠️ 告警与系统状态', 512, 70)

  // 更新时间
  ctx.fillStyle = '#666'
  ctx.font = '16px "Microsoft YaHei", sans-serif'
  ctx.fillText(`更新时间: ${new Date().toLocaleTimeString()}`, 512, 100)

  // 左侧：告警列表
  ctx.fillStyle = '#FF9800'
  ctx.font = 'bold 24px "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('🚨 最新告警', 40, 140)

  const alerts = data.alerts || []
  alerts.slice(0, 5).forEach((alert, i) => {
    const y = 180 + i * 70

    // 告警类型颜色
    const typeColors: Record<string, string> = {
      error: '#F44336',
      warning: '#FF9800',
      info: '#2196F3',
      success: '#4CAF50'
    }
    const color = typeColors[alert.type] || '#999'

    // 告警背景
    ctx.fillStyle = 'rgba(255, 152, 0, 0.1)'
    ctx.fillRect(40, y - 25, 450, 60)

    // 类型标记
    ctx.fillStyle = color
    ctx.fillRect(40, y - 25, 6, 60)

    // 消息
    ctx.fillStyle = '#ffffff'
    ctx.font = '16px "Microsoft YaHei", sans-serif'
    ctx.fillText(alert.message, 55, y)

    // Agent和时间
    ctx.fillStyle = '#999'
    ctx.font = '14px "Microsoft YaHei", sans-serif'
    ctx.fillText(`${alert.agent} · ${alert.time}`, 55, y + 22)
  })

  // 右侧：系统状态仪表盘
  ctx.fillStyle = '#FF9800'
  ctx.font = 'bold 24px "Microsoft YaHei", sans-serif'
  ctx.fillText('⚙️ 系统状态', 520, 140)

  // 绘制仪表盘
  const drawGauge = (x: number, y: number, value: number, label: string, color: string) => {
    const radius = 60

    // 外圆背景
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 12
    ctx.stroke()

    // 进度弧
    ctx.beginPath()
    ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * value / 100))
    ctx.strokeStyle = color
    ctx.lineWidth = 12
    ctx.stroke()

    // 中心数值
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 28px "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${value}%`, x, y)

    // 标签
    ctx.fillStyle = '#cccccc'
    ctx.font = '16px "Microsoft YaHei", sans-serif'
    ctx.fillText(label, x, y + radius + 25)
  }

  // 仪表盘位置
  drawGauge(600, 220, systemStatus?.cpuUsage || 45, 'CPU', '#00E5FF')
  drawGauge(780, 220, systemStatus?.memoryUsage || 62, '内存', '#76FF03')
  drawGauge(690, 380, systemStatus?.gateway === 'online' ? 100 : 0, '网关', '#4CAF50')

  // 服务状态列表
  ctx.fillStyle = '#FF9800'
  ctx.font = 'bold 18px "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('📡 服务状态', 520, 480)

  const services = [
    { name: 'OpenClaw Gateway', status: systemStatus?.gateway === 'online' ? '在线' : '离线', color: systemStatus?.gateway === 'online' ? '#4CAF50' : '#F44336' },
    { name: 'Feishu 连接', status: systemStatus?.feishu === 'online' ? '在线' : '离线', color: systemStatus?.feishu === 'online' ? '#4CAF50' : '#F44336' },
    { name: '邮件服务', status: systemStatus?.email === 'online' ? '在线' : '离线', color: systemStatus?.email === 'online' ? '#4CAF50' : '#F44336' },
    { name: 'WebSocket', status: '正常', color: '#4CAF50' }
  ]

  services.forEach((service, i) => {
    const y = 520 + i * 35
    ctx.fillStyle = '#666'
    ctx.font = '16px "Microsoft YaHei", sans-serif'
    ctx.fillText(service.name, 540, y)

    ctx.fillStyle = service.color
    ctx.beginPath()
    ctx.arc(750, y - 6, 8, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.font = '14px "Microsoft YaHei", sans-serif'
    ctx.fillText(service.status, 770, y)
  })

  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

// 大数据看板组件
export function Dashboards({ useRealData = false, organizationId = 'org-001' }: DashboardsProps) {
  const dashboard1Ref = useRef<THREE.Group>(null)
  const dashboard2Ref = useRef<THREE.Group>(null)
  const dashboard3Ref = useRef<THREE.Group>(null)
  const dashboard4Ref = useRef<THREE.Group>(null)

  // 管理中枢数据状态
  const [managementData, setManagementData] = useState<ManagementHubData>({
    kpi: {
      totalAgents: 11,
      activeAgents: 11,
      totalTasks: 94,
      completedTasks: 94,
      completionRate: 100,
      avgEfficiency: 87.5,
      systemUptime: 99.9,
      collaborationScore: 85
    },
    employeePerformance: [
      { id: 'M2', name: '周展', role: '市场经理', completed: 22, efficiency: 95.2, quality: 92, speed: 88, collaboration: 85, overall: 90.1 },
      { id: 'O1', name: '陈运', role: '运维工程师', completed: 21, efficiency: 93.8, quality: 94, speed: 90, collaboration: 88, overall: 91.5 },
      { id: 'D1', name: '张码', role: '开发工程师', completed: 20, efficiency: 91.5, quality: 89, speed: 92, collaboration: 82, overall: 88.6 },
      { id: 'F1', name: '赵财', role: '财务经理', completed: 16, efficiency: 88.3, quality: 93, speed: 85, collaboration: 80, overall: 86.6 },
      { id: 'S1', name: '王谋', role: '方案架构师', completed: 15, efficiency: 89.7, quality: 91, speed: 87, collaboration: 90, overall: 89.4 }
    ],
    projects: [
      { id: 1, name: '智慧校园系统', status: 'completed', progress: 100, manager: '刘管', members: 5, tasks: 24, completedTasks: 24, deadline: '2026-02-15', priority: 'high' },
      { id: 2, name: 'AI教学平台', status: 'in_progress', progress: 75, manager: '王谋', members: 4, tasks: 18, completedTasks: 14, deadline: '2026-02-28', priority: 'high' },
      { id: 3, name: '数据中台建设', status: 'in_progress', progress: 60, manager: '周展', members: 6, tasks: 32, completedTasks: 20, deadline: '2026-03-15', priority: 'medium' }
    ],
    taskExecution: {
      avgCompletionTime: 32.5,
      onTimeRate: 94.7,
      qualityScore: 89.2,
      reworkRate: 5.3,
      satisfaction: 92.1,
      byType: [
        { type: '客户咨询', count: 22, avgTime: 34.2, quality: 91, satisfaction: 93 },
        { type: '开发任务', count: 28, avgTime: 35.8, quality: 87, satisfaction: 89 }
      ]
    },
    alerts: [
      { type: 'warning', message: '项目"安全加固"进度滞后15%', agent: '陈运', time: '2小时前' },
      { type: 'info', message: '智慧校园系统提前2天交付', agent: '刘管', time: '1天前' }
    ],
    pendingDecisions: [
      { id: 1, title: '项目预算超支风险处理', type: '预算审批', urgency: 'high', requestor: '孙助', options: ['保守策略', '激进策略', '平衡策略'], deadline: '2026-02-16' }
    ]
  })
  const [systemStatus, setSystemStatus] = useState<any>({ gateway: 'online', feishu: 'online', email: 'online' })

  // 创建纹理 - 使用管理中枢数据
  const kpiTexture = useMemo(() => createManagementKPITexture(managementData), [managementData])
  const performanceTexture = useMemo(() => createEmployeePerformanceTexture(managementData), [managementData])
  const projectProgressTexture = useMemo(() => createProjectProgressTexture(managementData), [managementData])
  const alertsSystemTexture = useMemo(() => createAlertsSystemTexture(managementData, systemStatus), [managementData, systemStatus])

  // 连接数据服务 - 获取管理中枢真实数据
  useEffect(() => {
    // 连接WebSocket
    metaverseDataService.connect(organizationId)

    // 获取管理中枢数据
    const fetchManagementData = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_BASE || ''
        
        // 并行获取Agent数据和任务数据
        const [agentsRes, tasksRes] = await Promise.all([
          fetch(`${apiBase}/api/metaverse/3d/agents/status/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ organizationId })
          }),
          fetch(`${apiBase}/api/metaverse/3d/tasks/flow/stream?organizationId=${organizationId}`)
        ])

        const [agentsData, tasksData] = await Promise.all([agentsRes.json(), tasksRes.json()])

        if (agentsData.success && agentsData.data?.agents) {
          const agents = agentsData.data.agents
          
          // 转换员工绩效数据
          const employeePerformance = agents.map((a: any) => ({
            id: a.id,
            name: a.name,
            role: a.role === 'marketing' ? '市场经理' : 
                  a.role === 'solution' ? '方案架构师' :
                  a.role === 'developer' ? '开发工程师' :
                  a.role === 'devops' ? '运维工程师' :
                  a.role === 'project' ? '项目经理' :
                  a.role === 'finance' ? '财务经理' : '助理',
            completed: a.stats?.tasksCompleted || 0,
            efficiency: Math.round((a.capabilities?.customer_acquisition || a.capabilities?.deployment || a.capabilities?.frontend || 80) * 0.95),
            quality: Math.round((a.personality?.thoroughness || 85) * 0.95),
            speed: Math.round((a.personality?.speed || 80) * 0.95),
            collaboration: Math.round((a.personality?.collaboration || 80) * 0.95),
            overall: Math.round(((a.stats?.tasksCompleted || 0) * 4 + 400) / 10)
          }))

          // 计算KPI
          const completedTasks = agents.reduce((sum: number, a: any) => sum + (a.stats?.tasksCompleted || 0), 0)
          
          // 获取任务数据
          const taskNodes = tasksData.success && tasksData.data?.nodes ? tasksData.data.nodes : []
          const totalTasks = taskNodes.length
          
          setManagementData(prev => ({
            ...prev,
            kpi: {
              ...prev.kpi,
              totalAgents: agents.length,
              activeAgents: agents.filter((a: any) => a.status === 'idle' || a.status === 'working').length,
              totalTasks: totalTasks || completedTasks,
              completedTasks: completedTasks
            },
            employeePerformance
          }))
        }
      } catch (e) {
        console.error('获取管理中枢数据失败:', e)
      }
    }

    // 初始加载
    fetchManagementData()

    // 监听Agent状态更新
    const handleAgentUpdate = (data: any) => {
      console.log('📊 收到Agent状态更新:', data)
      fetchManagementData()
    }

    // 监听任务流更新
    const handleTaskUpdate = (data: any) => {
      console.log('📊 收到任务更新:', data)
      if (data && (data.type === 'task:assigned' || data.type === 'task:completed')) {
        fetchManagementData()
      }
    }

    metaverseDataService.on('agent:status:update', handleAgentUpdate)
    metaverseDataService.on('task:flow:update', handleTaskUpdate)

    // 备用：每30秒轮询一次
    const interval = setInterval(fetchManagementData, 30000)

    return () => {
      metaverseDataService.off('agent:status:update', handleAgentUpdate)
      metaverseDataService.off('task:flow:update', handleTaskUpdate)
      clearInterval(interval)
    }
  }, [organizationId])

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
      {/* 屏幕1: KPI总览看板 - 左侧 */}
      <group ref={dashboard1Ref} position={[-35, 8, -10]} rotation={[0, Math.PI / 6, 0]}>
        <mesh>
          <planeGeometry args={[12, 9]} />
          <meshBasicMaterial map={kpiTexture} side={THREE.DoubleSide} />
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
        {/* 标签 */}
        <mesh position={[0, -5.5, 0]}>
          <boxGeometry args={[4, 0.5, 0.1]} />
          <meshBasicMaterial color="#00E5FF" />
        </mesh>
      </group>

      {/* 屏幕2: 员工绩效看板 - 右侧 */}
      <group ref={dashboard2Ref} position={[35, 8, -10]} rotation={[0, -Math.PI / 6, 0]}>
        <mesh>
          <planeGeometry args={[12, 9]} />
          <meshBasicMaterial map={performanceTexture} side={THREE.DoubleSide} />
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
        {/* 标签 */}
        <mesh position={[0, -5.5, 0]}>
          <boxGeometry args={[4, 0.5, 0.1]} />
          <meshBasicMaterial color="#76FF03" />
        </mesh>
      </group>

      {/* 屏幕3: 项目进度看板 - 后方左侧 */}
      <group ref={dashboard3Ref} position={[-25, 8, -25]} rotation={[0, Math.PI / 4, 0]}>
        <mesh>
          <planeGeometry args={[12, 9]} />
          <meshBasicMaterial map={projectProgressTexture} side={THREE.DoubleSide} />
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
        {/* 标签 */}
        <mesh position={[0, -5.5, 0]}>
          <boxGeometry args={[4, 0.5, 0.1]} />
          <meshBasicMaterial color="#E040FB" />
        </mesh>
      </group>

      {/* 屏幕4: 告警与系统状态看板 - 后方右侧 */}
      <group ref={dashboard4Ref} position={[25, 8, -25]} rotation={[0, -Math.PI / 4, 0]}>
        <mesh>
          <planeGeometry args={[12, 9]} />
          <meshBasicMaterial map={alertsSystemTexture} side={THREE.DoubleSide} />
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
        {/* 标签 */}
        <mesh position={[0, -5.5, 0]}>
          <boxGeometry args={[4, 0.5, 0.1]} />
          <meshBasicMaterial color="#FF9800" />
        </mesh>
      </group>
    </group>
  )
}

export default Dashboards
