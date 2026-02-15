import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import type { ApiResponse } from '../types/index'
import { AppError, asyncHandler } from '../utils/error'
import { io } from '../index'

// ==================== Phase 4: 聚合Agent状态流API（批量查询）====================

interface AgentStatusBatchQuery {
  agentIds?: string[]
  organizationId?: string
  includeTasks?: boolean
  includeMetrics?: boolean
}

export const getAgentStatusBatch = asyncHandler(async (req: Request, res: Response) => {
  const { agentIds, organizationId, includeTasks = true, includeMetrics = true } = req.body as AgentStatusBatchQuery

  if (!agentIds && !organizationId) {
    throw new AppError('agentIds or organizationId required', 400)
  }

  const where: any = {}
  if (agentIds && agentIds.length > 0) {
    where.id = { in: agentIds }
  }
  if (organizationId) {
    where.organizationId = organizationId
  }

  const agents = await prisma.agent.findMany({
    where,
    include: {
      role: { select: { id: true, name: true } },
      supervisor: { select: { id: true, name: true, avatar: true } },
      subordinates: { select: { id: true, status: true } },
      ...(includeTasks && {
        assignedTasks: {
          where: { status: { in: ['pending', 'in_progress', 'assigned'] } },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
            collaborationMode: true
          },
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }),
      collaborations: {
        where: { status: 'active' },
        include: {
          task: {
            select: { id: true, title: true, assigneeId: true }
          }
        },
        take: 3
      }
    }
  })

  // 获取最新活动记录
  const agentIds_list = agents.map((a: any) => a.id)
  const recentActivities = await prisma.agentActivity.findMany({
    where: { agentId: { in: agentIds_list } },
    orderBy: { createdAt: 'desc' },
    take: agentIds_list.length * 3
  })

  const activitiesByAgent: Record<string, any[]> = {}
  recentActivities.forEach((activity: any) => {
    if (!activitiesByAgent[activity.agentId]) {
      activitiesByAgent[activity.agentId] = []
    }
    activitiesByAgent[activity.agentId].push({
      type: activity.type,
      timestamp: activity.createdAt,
      data: activity.data ? JSON.parse(activity.data) : null
    })
  })

  // 计算指标数据
  const agentStatuses = await Promise.all(
    agents.map(async (agent: any) => {
      const position = agent.position ? JSON.parse(agent.position) : getDefaultPosition(agent.role?.name)
      const capabilities = agent.capabilities ? JSON.parse(agent.capabilities) : []
      const skillProfile = agent.skillProfile ? JSON.parse(agent.skillProfile) : null
      const performanceStats = agent.performanceStats ? JSON.parse(agent.performanceStats) : null

      // 计算实时指标
      let metrics = null
      if (includeMetrics) {
        const completedTasksCount = await prisma.task.count({
          where: { assigneeId: agent.id, status: 'completed' }
        })
        const inProgressTasksCount = await prisma.task.count({
          where: { assigneeId: agent.id, status: 'in_progress' }
        })
        
        metrics = {
          completedTasks: completedTasksCount,
          inProgressTasks: inProgressTasksCount,
          collaborationCount: agent.collaborations?.length || 0,
          workloadPercentage: (agent.workload / (agent.maxWorkload || 10)) * 100,
          availabilityScore: agent.availabilityScore,
          lastActiveMinutes: agent.lastSeenAt 
            ? Math.floor((Date.now() - new Date(agent.lastSeenAt).getTime()) / 60000)
            : null
        }
      }

      return {
        id: agent.id,
        name: agent.name,
        avatar: agent.avatar,
        status: agent.status,
        type: agent.type,
        position,
        lastSeenAt: agent.lastSeenAt || agent.updatedAt,
        role: agent.role,
        supervisor: agent.supervisor,
        subordinateCount: agent.subordinates?.length || 0,
        capabilities,
        skillProfile,
        performanceStats,
        currentTasks: includeTasks ? agent.assignedTasks : undefined,
        activeCollaborations: agent.collaborations?.map((c: any) => ({
          taskId: c.task.id,
          taskTitle: c.task.title,
          role: c.role
        })),
        recentActivities: activitiesByAgent[agent.id]?.slice(0, 3) || [],
        metrics
      }
    })
  )

  res.json({ 
    success: true, 
    data: {
      agents: agentStatuses,
      total: agentStatuses.length,
      timestamp: new Date().toISOString()
    }
  } as ApiResponse)
})

// 获取默认位置（根据角色）
function getDefaultPosition(roleName?: string): { x: number; y: number; z: number } {
  const positions: Record<string, { x: number; y: number; z: number }> = {
    '院长': { x: -8, y: 0, z: -8 },
    '副院长': { x: 8, y: 0, z: -8 },
    '技术总监': { x: -8, y: 0, z: 8 },
    '产品总监': { x: 8, y: 0, z: 8 },
    '市场总监': { x: -5, y: 0, z: 0 },
    '财务总监': { x: 5, y: 0, z: 0 },
    '运营总监': { x: 0, y: 0, z: 5 }
  }
  return positions[roleName || ''] || { 
    x: Math.random() * 16 - 8, 
    y: 0, 
    z: Math.random() * 16 - 8 
  }
}

// ==================== Phase 4: 任务流实时推送优化（WebSocket房间）====================

interface TaskFlowRoomData {
  processInstanceId?: string
  organizationId?: string
  taskTypes?: string[]
}

// 任务流数据获取（支持WebSocket房间）
export const getTaskFlowStream = asyncHandler(async (req: Request, res: Response) => {
  const { processInstanceId, organizationId, status, limit = 100 } = req.query as any

  const where: any = {}
  if (processInstanceId) where.processInstanceId = processInstanceId
  if (organizationId) where.creator = { organizationId }
  if (status) where.status = status

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignee: { 
        select: { 
          id: true, 
          name: true, 
          avatar: true,
          status: true 
        } 
      },
      creator: { select: { id: true, name: true } },
      dependencies: { 
        include: { 
          dependsOnTask: { select: { id: true, status: true, title: true } } 
        } 
      },
      collaborators: {
        include: {
          agent: { select: { id: true, name: true, avatar: true } }
        }
      },
      processInstance: {
        select: { id: true, status: true, template: { select: { name: true } } }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit)
  })

  // 构建任务流节点和边
  const nodes: any[] = []
  const edges: any[] = []
  const nodeSet = new Set<string>()

  // 添加任务节点
  tasks.forEach((task: any) => {
    if (!nodeSet.has(task.id)) {
      nodes.push({
        id: task.id,
        type: 'task',
        data: {
          title: task.title,
          status: task.status,
          priority: task.priority,
          type: task.type,
          assignee: task.assignee,
          collaborationMode: task.collaborationMode,
          createdAt: task.createdAt,
          startedAt: task.startedAt,
          completedAt: task.completedAt,
          dueDate: task.dueDate,
          progress: calculateTaskProgress(task)
        },
        position: generateTaskPosition(task, tasks)
      })
      nodeSet.add(task.id)
    }

    // 添加Agent节点和分配边
    if (task.assigneeId && !nodeSet.has(task.assigneeId)) {
      nodes.push({
        id: task.assigneeId,
        type: 'agent',
        data: task.assignee
      })
      nodeSet.add(task.assigneeId)
    }

    if (task.assigneeId) {
      edges.push({
        id: `assign-${task.id}`,
        source: task.assigneeId,
        target: task.id,
        type: 'assignment',
        animated: task.status === 'in_progress'
      })
    }

    // 添加依赖边
    task.dependencies.forEach((dep: any) => {
      edges.push({
        id: `dep-${dep.id}`,
        source: dep.dependsOnTaskId,
        target: task.id,
        type: 'dependency',
        animated: dep.dependsOnTask.status !== 'completed',
        data: { 
          dependencyType: dep.dependencyType,
          isBlocking: dep.dependencyType === 'blocks' && dep.dependsOnTask.status !== 'completed'
        }
      })
    })

    // 添加协作边
    task.collaborators.forEach((collab: any) => {
      if (!nodeSet.has(collab.agent.id)) {
        nodes.push({
          id: collab.agent.id,
          type: 'agent',
          data: collab.agent
        })
        nodeSet.add(collab.agent.id)
      }
      edges.push({
        id: `collab-${collab.id}`,
        source: collab.agent.id,
        target: task.id,
        type: 'collaboration',
        animated: true,
        data: { role: collab.role }
      })
    })
  })

  // 统计信息
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t: any) => t.status === 'completed').length,
    inProgress: tasks.filter((t: any) => t.status === 'in_progress').length,
    pending: tasks.filter((t: any) => t.status === 'pending').length,
    delayed: tasks.filter((t: any) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length
  }

  res.json({
    success: true,
    data: {
      nodes,
      edges,
      stats,
      timestamp: new Date().toISOString()
    }
  } as ApiResponse)
})

// 计算任务进度
function calculateTaskProgress(task: any): number {
  if (task.status === 'completed') return 100
  if (task.status === 'pending') return 0
  if (task.status === 'in_progress' && task.startedAt && task.estimatedHours) {
    const elapsed = Date.now() - new Date(task.startedAt).getTime()
    const estimated = task.estimatedHours * 3600000
    return Math.min(95, Math.round((elapsed / estimated) * 100))
  }
  return 50
}

// 生成任务3D位置
function generateTaskPosition(task: any, allTasks: any[]): { x: number; y: number; z: number } {
  const statusLevels: Record<string, number> = {
    'completed': 0,
    'in_progress': 1,
    'pending': 2,
    'assigned': 1.5
  }
  
  const y = statusLevels[task.status] || 1
  
  // 根据创建时间分散X轴
  const index = allTasks.findIndex((t: any) => t.id === task.id)
  const x = (index % 10) * 2 - 10
  const z = Math.floor(index / 10) * 2 - 5
  
  return { x, y: y * 2, z }
}

// ==================== Phase 4: 协作关系网络计算API ====================

export const getCollaborationNetworkV2 = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId, minCollaborations = 1, timeRange = 30 } = req.query as any

  if (!organizationId) throw new AppError('organizationId required', 400)

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - parseInt(timeRange))

  // 获取组织内所有Agent
  const agents = await prisma.agent.findMany({
    where: { organizationId },
    include: {
      role: { select: { id: true, name: true } },
      assignedTasks: { 
        where: { status: { not: 'completed' } }, 
        select: { id: true }, 
        take: 5 
      }
    }
  })

  const agentMap = new Map(agents.map((a: any) => [a.id, a]))
  const nodes = agents.map((agent: any) => ({
    id: agent.id,
    type: 'agent',
    label: agent.name,
    data: { 
      name: agent.name, 
      avatar: agent.avatar, 
      status: agent.status, 
      role: agent.role, 
      activeTaskCount: agent.assignedTasks.length 
    },
    position: agent.position ? JSON.parse(agent.position) : getDefaultPosition(agent.role?.name)
  }))

  // 计算多层关系
  const edges: any[] = []
  const edgeWeights: Record<string, { count: number; types: Set<string> }> = {}

  // 1. 层级关系
  agents.forEach((agent: any) => {
    if (agent.supervisorId && agentMap.has(agent.supervisorId)) {
      const edgeId = `${agent.id}-${agent.supervisorId}`
      edgeWeights[edgeId] = { count: 1, types: new Set(['hierarchy']) }
    }
  })

  // 2. 任务协作关系（基于任务分配和协作）
  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { assigneeId: { in: agents.map((a: any) => a.id) } },
        { collaborators: { some: { agentId: { in: agents.map((a: any) => a.id) } } } }
      ],
      createdAt: { gte: startDate }
    },
    include: {
      assignee: { select: { id: true } },
      collaborators: { select: { agentId: true } }
    }
  })

  tasks.forEach((task: any) => {
    const participants: string[] = []
    if (task.assigneeId) participants.push(task.assigneeId)
    task.collaborators.forEach((c: any) => {
      if (!participants.includes(c.agentId)) participants.push(c.agentId)
    })

    // 两两之间建立协作关系
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const pair = [participants[i], participants[j]].sort()
        const edgeId = `${pair[0]}-${pair[1]}`
        
        if (!edgeWeights[edgeId]) {
          edgeWeights[edgeId] = { count: 0, types: new Set() }
        }
        edgeWeights[edgeId].count++
        edgeWeights[edgeId].types.add('collaboration')
      }
    }
  })

  // 3. 会议参与关系
  const meetings = await prisma.meeting.findMany({
    where: {
      organizationId,
      scheduledAt: { gte: startDate },
      participants: { some: { agentId: { in: agents.map((a: any) => a.id) } } }
    },
    include: {
      participants: { select: { agentId: true } }
    }
  })

  meetings.forEach((meeting: any) => {
    const participants = meeting.participants.map((p: any) => p.agentId)
    
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const pair = [participants[i], participants[j]].sort()
        const edgeId = `${pair[0]}-${pair[1]}`
        
        if (!edgeWeights[edgeId]) {
          edgeWeights[edgeId] = { count: 0, types: new Set() }
        }
        edgeWeights[edgeId].count += 0.5  // 会议权重稍低
        edgeWeights[edgeId].types.add('meeting')
      }
    }
  })

  // 构建边数据
  Object.entries(edgeWeights).forEach(([edgeId, weight]) => {
    if (weight.count >= parseInt(minCollaborations)) {
      const [source, target] = edgeId.split('-')
      edges.push({
        id: edgeId,
        source,
        target,
        weight: Math.min(weight.count / 10, 1),  // 归一化权重
        collaborationCount: weight.count,
        types: Array.from(weight.types),
        animated: weight.count > 3
      })
    }
  })

  // 计算网络统计
  const networkStats = {
    totalAgents: agents.length,
    totalConnections: edges.length,
    avgConnections: edges.length / agents.length,
    isolatedAgents: agents.filter((a: any) => 
      !edges.some((e: any) => e.source === a.id || e.target === a.id)
    ).length,
    clusters: detectClusters(nodes, edges)
  }

  res.json({
    success: true,
    data: {
      nodes,
      edges,
      stats: networkStats,
      timestamp: new Date().toISOString()
    }
  } as ApiResponse)
})

// 简单的聚类检测
function detectClusters(nodes: any[], edges: any[]): number {
  const visited = new Set<string>()
  let clusters = 0

  const dfs = (nodeId: string) => {
    visited.add(nodeId)
    edges.forEach((edge: any) => {
      if (edge.source === nodeId && !visited.has(edge.target)) {
        dfs(edge.target)
      }
      if (edge.target === nodeId && !visited.has(edge.source)) {
        dfs(edge.source)
      }
    })
  }

  nodes.forEach((node: any) => {
    if (!visited.has(node.id)) {
      dfs(node.id)
      clusters++
    }
  })

  return clusters
}

// ==================== Phase 4: 3D场景配置数据API ====================

export const get3DSceneConfig = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId, sceneType = 'office' } = req.query as any

  // 默认场景配置
  const defaultConfig = {
    office: {
      name: 'AI研究院办公室',
      type: 'office',
      environment: {
        skybox: 'day',
        lighting: 'natural',
        weather: 'clear'
      },
      rooms: [
        {
          id: 'main-hall',
          name: '主办公区',
          type: 'workspace',
          bounds: { x: -20, z: -20, width: 40, depth: 40 },
          features: ['desks', 'meeting_area', 'relax_zone']
        },
        {
          id: 'meeting-room',
          name: '会议室',
          type: 'meeting',
          bounds: { x: 15, z: -15, width: 10, depth: 10 },
          features: ['conference_table', 'screen', 'whiteboard']
        },
        {
          id: 'management-hub',
          name: '管理中枢',
          type: 'command',
          bounds: { x: -15, z: 15, width: 12, depth: 12 },
          features: ['planning_desk', 'process_board', 'approval_station']
        }
      ],
      spawnPoints: [
        { id: 'entrance', position: { x: 0, y: 0, z: 20 }, rotation: 0 },
        { id: 'hall-center', position: { x: 0, y: 0, z: 0 }, rotation: 0 }
      ],
      decorations: [
        { type: 'plant', position: { x: -18, y: 0, z: -18 } },
        { type: 'plant', position: { x: 18, y: 0, z: -18 } },
        { type: 'plant', position: { x: -18, y: 0, z: 18 } },
        { type: 'plant', position: { x: 18, y: 0, z: 18 } }
      ]
    },
    courtyard: {
      name: '中式四合院',
      type: 'courtyard',
      environment: {
        skybox: 'dynamic',
        lighting: 'cycle',
        weather: 'variable'
      },
      rooms: [
        {
          id: 'courtyard-center',
          name: '庭院',
          type: 'open',
          bounds: { x: -15, z: -15, width: 30, depth: 30 },
          features: ['garden', 'fountain', 'paths']
        }
      ],
      spawnPoints: [
        { id: 'main-gate', position: { x: 0, y: 0, z: 25 }, rotation: 180 }
      ],
      decorations: [
        { type: 'tree', position: { x: -10, y: 0, z: -10 } },
        { type: 'tree', position: { x: 10, y: 0, z: -10 } },
        { type: 'tree', position: { x: -10, y: 0, z: 10 } },
        { type: 'tree', position: { x: 10, y: 0, z: 10 } }
      ]
    }
  }

  // 获取组织特定配置（如果有）
  let customConfig = null
  if (organizationId) {
    // 这里可以从数据库读取组织特定的场景配置
    // 目前使用默认配置
  }

  // 获取Agent位置配置
  let agentPositions: any[] = []
  if (organizationId) {
    const agents = await prisma.agent.findMany({
      where: { organizationId },
      select: { id: true, name: true, position: true, role: { select: { name: true } } }
    })
    
    agentPositions = agents.map((agent: any) => ({
      agentId: agent.id,
      name: agent.name,
      position: agent.position ? JSON.parse(agent.position) : getDefaultPosition(agent.role?.name),
      role: agent.role?.name
    }))
  }

  const config = customConfig || defaultConfig[sceneType as keyof typeof defaultConfig] || defaultConfig.office

  res.json({
    success: true,
    data: {
      ...config,
      agentPositions,
      availableSceneTypes: Object.keys(defaultConfig),
      timestamp: new Date().toISOString()
    }
  } as ApiResponse)
})

// 更新场景配置
export const update3DSceneConfig = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId, sceneType, config } = req.body

  if (!organizationId || !sceneType) {
    throw new AppError('organizationId and sceneType required', 400)
  }

  // 这里可以将配置保存到数据库
  // 目前返回成功响应

  res.json({
    success: true,
    data: {
      organizationId,
      sceneType,
      updated: true,
      timestamp: new Date().toISOString()
    }
  } as ApiResponse)
})

// ==================== Phase 4: 管理中枢数据API ====================

export const getManagementHubData = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.query as any

  if (!organizationId) throw new AppError('organizationId required', 400)

  // 获取业务规划数据
  const businesses = await prisma.business.findMany({
    where: { organizationId },
    include: {
      processTemplates: {
        select: { id: true, name: true, status: true, version: true }
      }
    }
  })

  // 获取流程实例统计
  const processStats = await prisma.processInstance.groupBy({
    by: ['status'],
    where: {
      template: { business: { organizationId } }
    },
    _count: { status: true }
  })

  // 获取待审批任务
  const pendingApprovals = await prisma.task.findMany({
    where: {
      status: 'pending',
      type: 'approval',
      creator: { organizationId }
    },
    include: {
      assignee: { select: { id: true, name: true, avatar: true } },
      creator: { select: { id: true, name: true } }
    },
    take: 10,
    orderBy: { createdAt: 'desc' }
  })

  // 获取系统指标
  const taskStats = await prisma.task.groupBy({
    by: ['status'],
    where: { creator: { organizationId } },
    _count: { status: true }
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayTasks = await prisma.task.count({
    where: {
      creator: { organizationId },
      createdAt: { gte: today }
    }
  })

  const completedToday = await prisma.task.count({
    where: {
      creator: { organizationId },
      completedAt: { gte: today }
    }
  })

  res.json({
    success: true,
    data: {
      businessPlanning: {
        totalBusinesses: businesses.length,
        businesses: businesses.map((b: any) => ({
          id: b.id,
          name: b.name,
          status: b.status,
          processTemplateCount: b.processTemplates.length,
          processTemplates: b.processTemplates
        }))
      },
      processDesign: {
        stats: processStats.reduce((acc: any, curr: any) => {
          acc[curr.status] = curr._count.status
          return acc
        }, {})
      },
      approvalStation: {
        pendingCount: pendingApprovals.length,
        pendingApprovals: pendingApprovals.map((task: any) => ({
          id: task.id,
          title: task.title,
          requester: task.creator,
          assignee: task.assignee,
          createdAt: task.createdAt,
          priority: task.priority
        }))
      },
      systemMetrics: {
        taskStats: taskStats.reduce((acc: any, curr: any) => {
          acc[curr.status] = curr._count.status
          return acc
        }, {}),
        todayTasks,
        completedToday,
        efficiency: todayTasks > 0 ? Math.round((completedToday / todayTasks) * 100) : 0
      },
      timestamp: new Date().toISOString()
    }
  } as ApiResponse)
})

// ==================== Phase 4: WebSocket房间管理 ====================

// 加入3D场景房间
export const join3DSceneRoom = (socket: any, roomData: { organizationId: string; sceneType?: string }) => {
  const roomId = `3d:scene:${roomData.organizationId}`
  socket.join(roomId)
  socket.join(`org:${roomData.organizationId}`)
  
  console.log(`Socket ${socket.id} joined 3D scene room: ${roomId}`)
  
  socket.emit('room:joined', {
    room: roomId,
    type: '3d_scene',
    timestamp: new Date().toISOString()
  })
}

// 离开3D场景房间
export const leave3DSceneRoom = (socket: any, roomData: { organizationId: string }) => {
  const roomId = `3d:scene:${roomData.organizationId}`
  socket.leave(roomId)
  
  console.log(`Socket ${socket.id} left 3D scene room: ${roomId}`)
  
  socket.emit('room:left', {
    room: roomId,
    timestamp: new Date().toISOString()
  })
}

// 广播Agent状态更新到3D场景
export const broadcastAgentStatusTo3D = (organizationId: string, agentData: any) => {
  const roomId = `3d:scene:${organizationId}`
  io.to(roomId).emit('3d:agent:status', {
    ...agentData,
    timestamp: new Date().toISOString()
  })
}

// 广播任务流更新到3D场景
export const broadcastTaskFlowTo3D = (organizationId: string, taskData: any) => {
  const roomId = `3d:scene:${organizationId}`
  io.to(roomId).emit('3d:task:flow', {
    ...taskData,
    timestamp: new Date().toISOString()
  })
}

// 广播协作网络更新
export const broadcastCollaborationNetworkTo3D = (organizationId: string, networkData: any) => {
  const roomId = `3d:scene:${organizationId}`
  io.to(roomId).emit('3d:network:collaboration', {
    ...networkData,
    timestamp: new Date().toISOString()
  })
}
