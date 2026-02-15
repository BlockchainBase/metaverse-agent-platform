import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import type { ApiResponse } from '../types/index'
import { AppError, asyncHandler } from '../utils/error'

export const getAgentRealtimeStatus = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.query as any

  if (!organizationId) throw new AppError('organizationId required', 400)

  const agents = await prisma.agent.findMany({
    where: { organizationId },
    include: {
      role: { select: { id: true, name: true } },
      supervisor: { select: { id: true, name: true } },
      subordinates: { select: { id: true, name: true, status: true } }
    }
  })

  const agentStatuses = agents.map((agent: any) => {
    const position = agent.position ? JSON.parse(agent.position) : { x: 0, y: 0, z: 0 }
    const capabilities = agent.capabilities ? JSON.parse(agent.capabilities) : []

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
      subordinateCount: agent.subordinates.length,
      capabilities
    }
  })

  res.json({ success: true, data: agentStatuses } as ApiResponse)
})

export const updateAgentPosition = asyncHandler(async (req: Request, res: Response) => {
  const agentId = req.params.agentId as string
  const { x, y, z } = req.body

  if (x === undefined || y === undefined || z === undefined) {
    throw new AppError('x, y, z required', 400)
  }

  const agent = await prisma.agent.update({
    where: { id: agentId },
    data: { position: JSON.stringify({ x, y, z }), lastSeenAt: new Date() }
  })

  res.json({ success: true, data: { id: agent.id, position: { x, y, z } } } as ApiResponse)
})

export const getTaskFlowData = asyncHandler(async (req: Request, res: Response) => {
  const { processInstanceId, organizationId } = req.query as any

  const where: any = {}
  if (processInstanceId) where.processInstanceId = processInstanceId
  if (organizationId) where.creator = { organizationId }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignee: { select: { id: true, name: true } },
      dependencies: { include: { dependsOnTask: { select: { id: true, status: true } } } }
    },
    orderBy: { createdAt: 'asc' }
  })

  const nodes: any[] = tasks.map((task: any) => ({
    id: task.id,
    type: 'task',
    data: {
      title: task.title,
      status: task.status,
      priority: task.priority,
      type: task.type,
      assignee: task.assignee,
      collaborationMode: task.collaborationMode,
      createdAt: task.createdAt
    }
  }))

  const edges: any[] = []

  tasks.forEach((task: any) => {
    task.dependencies.forEach((dep: any) => {
      edges.push({
        id: `dep-${dep.id}`,
        source: dep.dependsOnTaskId,
        target: task.id,
        type: 'dependency',
        data: { dependencyType: dep.dependencyType, isBlocking: dep.dependencyType === 'blocks' && dep.dependsOnTask.status !== 'completed' }
      })
    })

    if (task.assigneeId) {
      if (!nodes.some((n: any) => n.id === task.assigneeId)) {
        nodes.push({ id: task.assigneeId, type: 'agent', data: task.assignee })
      }
      edges.push({ id: `assign-${task.id}`, source: task.assigneeId, target: task.id, type: 'assignment' })
    }
  })

  res.json({ success: true, data: { nodes, edges } } as ApiResponse)
})

export const getTaskTimeline = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId, startDate, endDate } = req.query as any

  const where: any = {}
  if (organizationId) where.creator = { organizationId }
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = new Date(startDate)
    if (endDate) where.createdAt.lte = new Date(endDate)
  }

  const tasks = await prisma.task.findMany({
    where,
    include: { assignee: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' }
  })

  const timeline = tasks.map((task: any) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    createdAt: task.createdAt,
    startedAt: task.startedAt,
    completedAt: task.completedAt,
    dueDate: task.dueDate,
    duration: task.startedAt && task.completedAt
      ? Math.round((task.completedAt.getTime() - task.startedAt.getTime()) / 60000)
      : null,
    assignee: task.assignee
  }))

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t: any) => t.status === 'completed').length,
    inProgress: tasks.filter((t: any) => t.status === 'in_progress').length,
    pending: tasks.filter((t: any) => t.status === 'pending').length
  }

  res.json({ success: true, data: { timeline, stats } } as ApiResponse)
})

export const getCollaborationNetwork = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.query as any

  if (!organizationId) throw new AppError('organizationId required', 400)

  const agents = await prisma.agent.findMany({
    where: { organizationId },
    include: {
      role: { select: { id: true, name: true } },
      assignedTasks: { where: { status: { not: 'completed' } }, select: { id: true }, take: 5 }
    }
  })

  const nodes = agents.map((agent: any) => ({
    id: agent.id,
    type: 'agent',
    label: agent.name,
    data: { name: agent.name, avatar: agent.avatar, status: agent.status, role: agent.role, activeTaskCount: agent.assignedTasks.length }
  }))

  const edges: any[] = []
  const edgeSet = new Set<string>()

  // 层级关系
  agents.forEach((agent: any) => {
    if (agent.supervisorId) {
      const edgeId = `${agent.id}-${agent.supervisorId}-reports_to`
      if (!edgeSet.has(edgeId)) {
        edges.push({ id: edgeId, source: agent.id, target: agent.supervisorId, type: 'reports_to', weight: 1 })
        edgeSet.add(edgeId)
      }
    }
  })

  // 任务协作关系
  const collaborations = await prisma.taskCollaborator.findMany({
    where: { agentId: { in: agents.map((a: any) => a.id) }, status: 'active' },
    include: { task: { include: { assignee: { select: { id: true } } } } }
  })

  const collabCounts: Record<string, number> = {}
  collaborations.forEach((collab: any) => {
    if (collab.task.assigneeId && collab.task.assigneeId !== collab.agentId) {
      const pair = [collab.agentId, collab.task.assigneeId].sort().join('-')
      collabCounts[pair] = (collabCounts[pair] || 0) + 1
    }
  })

  Object.entries(collabCounts).forEach(([pair, count]) => {
    const [source, target] = pair.split('-')
    const edgeId = `${source}-${target}-collaborates_with`
    if (!edgeSet.has(edgeId)) {
      edges.push({ id: edgeId, source, target, type: 'collaborates_with', weight: Math.min(count / 5, 1) })
      edgeSet.add(edgeId)
    }
  })

  res.json({ success: true, data: { nodes, edges } } as ApiResponse)
})

export const getOrganization3DData = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.params.organizationId as string

  const organization = await prisma.organization.findUnique({ where: { id: organizationId } })
  if (!organization) throw new AppError('Organization not found', 404)

  const agents = await prisma.agent.findMany({
    where: { organizationId },
    include: {
      role: { select: { id: true, name: true } },
      assignedTasks: { where: { status: { in: ['in_progress', 'assigned'] } }, select: { id: true, title: true, status: true }, take: 1 }
    }
  })

  const activeMeetings = await prisma.meeting.findMany({
    where: { organizationId, status: { in: ['scheduled', 'ongoing'] } },
    include: { participants: { select: { agentId: true } } }
  })

  const data = {
    agents: agents.map((agent: any) => ({
      id: agent.id,
      name: agent.name,
      avatar: agent.avatar,
      status: agent.status,
      type: agent.type,
      position: agent.position ? JSON.parse(agent.position) : { x: 0, y: 0, z: 0 },
      currentTask: agent.assignedTasks[0],
      lastSeenAt: agent.lastSeenAt || agent.updatedAt
    })),
    meetings: activeMeetings.map((meeting: any) => ({
      id: meeting.id,
      title: meeting.title,
      status: meeting.status,
      roomPosition: meeting.roomPosition ? JSON.parse(meeting.roomPosition) : undefined,
      participants: meeting.participants.map((p: any) => p.agentId)
    }))
  }

  res.json({ success: true, data } as ApiResponse)
})

export const getActivityStream = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId, limit = 50, after } = req.query as any

  const where: any = {}
  if (organizationId) where.agent = { organizationId }
  if (after) where.createdAt = { gt: new Date(after as string) }

  const activities = await prisma.agentActivity.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit as string)
  })

  res.json({ success: true, data: activities.map((a: any) => ({ ...a, data: a.data ? JSON.parse(a.data) : null })) } as ApiResponse)
})

export const recordActivity = asyncHandler(async (req: Request, res: Response) => {
  const { agentId, type, data } = req.body

  if (!agentId || !type) throw new AppError('agentId and type required', 400)

  const activity = await prisma.agentActivity.create({
    data: { agentId, type, data: data ? JSON.stringify(data) : null }
  })

  res.status(201).json({ success: true, data: { ...activity, data: data ? JSON.parse(activity.data!) : null } } as ApiResponse)
})

export const getAgentActivityHeatmap = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId, days = 7 } = req.query as any

  if (!organizationId) throw new AppError('organizationId required', 400)

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - parseInt(days))

  // Get agents in organization first
  const agents = await prisma.agent.findMany({
    where: { organizationId },
    select: { id: true }
  })
  const agentIds = agents.map((a: any) => a.id)

  const activities = await prisma.agentActivity.findMany({
    where: {
      agentId: { in: agentIds },
      createdAt: { gte: startDate }
    }
  })

  const heatmapData: Record<string, Record<number, number>> = {}

  activities.forEach((activity: any) => {
    const hour = new Date(activity.createdAt).getHours()
    if (!heatmapData[activity.agentId]) heatmapData[activity.agentId] = {}
    heatmapData[activity.agentId][hour] = (heatmapData[activity.agentId][hour] || 0) + 1
  })

  res.json({ success: true, data: Object.entries(heatmapData).map(([agentId, hours]) => ({ agentId, hourly: hours })) } as ApiResponse)
})
