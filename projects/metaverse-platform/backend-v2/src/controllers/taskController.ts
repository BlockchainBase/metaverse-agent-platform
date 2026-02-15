import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import type { ApiResponse } from '../types/index'
import { AppError, asyncHandler } from '../utils/error'
import { io } from '../index'

const validStatusTransitions: Record<string, string[]> = {
  pending: ['assigned', 'cancelled'],
  assigned: ['in_progress', 'cancelled', 'delegated'],
  in_progress: ['completed', 'cancelled', 'delegated'],
  completed: [],
  cancelled: [],
  delegated: ['assigned', 'in_progress', 'cancelled']
}

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const { status, assigneeId, processInstanceId, priority, organizationId } = req.query as any

  const where: any = {}
  if (status) where.status = status
  if (assigneeId) where.assigneeId = assigneeId
  if (processInstanceId) where.processInstanceId = processInstanceId
  if (priority) where.priority = priority
  if (organizationId) where.creator = { organizationId }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignee: { select: { id: true, name: true, avatar: true } },
      processInstance: { select: { id: true, status: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  const tasksWithDepsCheck = await Promise.all(
    tasks.map(async (task: any) => {
      const deps = await prisma.taskDependency.findMany({
        where: { taskId: task.id },
        include: { dependsOnTask: { select: { id: true, status: true } } }
      })
      const unmet = deps.filter((d: any) => d.dependsOnTask.status !== 'completed')
      return { ...task, dependenciesMet: unmet.length === 0, unmetDependenciesCount: unmet.length }
    })
  )

  res.json({ success: true, data: tasksWithDepsCheck } as ApiResponse)
})

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignee: { select: { id: true, name: true, avatar: true } },
      processInstance: { select: { id: true, status: true } },
      collaborators: { include: { agent: { select: { id: true, name: true, avatar: true } } } },
      dependencies: { include: { dependsOnTask: { select: { id: true, title: true, status: true, priority: true } } } },
      dependents: { include: { task: { select: { id: true, title: true, status: true, priority: true } } } }
    }
  })

  if (!task) throw new AppError('Task not found', 404)

  const unmetDeps = task.dependencies.filter((d: any) => d.dependsOnTask.status !== 'completed')
  const transferHistory = JSON.parse(task.data || '{}').transferHistory || []

  res.json({
    success: true,
    data: { ...task, dependenciesMet: unmetDeps.length === 0, unmetDependencies: unmetDeps, transferHistory }
  } as ApiResponse)
})

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body

  if (!data.title) throw new AppError('Title required', 400)

  const createData: any = {
    title: data.title,
    description: data.description,
    priority: data.priority || 'medium',
    type: data.type || 'default',
    data: data.data ? JSON.stringify(data.data) : null,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    processInstanceId: data.processInstanceId,
    collaborationMode: data.collaborationMode || 'single',
    assigneeId: data.assigneeId,
    status: data.assigneeId ? 'assigned' : 'pending',
    // Phase 3: 智能任务匹配字段
    requiredSkills: data.requiredSkills ? JSON.stringify(data.requiredSkills) : null,
    estimatedHours: data.estimatedHours || null
  }

  const task = await prisma.task.create({
    data: createData,
    include: {
      assignee: { select: { id: true, name: true, avatar: true } },
      processInstance: { select: { id: true, status: true } }
    }
  })

  if (data.dependencies?.length > 0) {
    for (const depId of data.dependencies) {
      try {
        await prisma.taskDependency.create({
          data: {
            taskId: task.id,
            dependsOnTaskId: depId,
            dependencyType: 'blocks'
          }
        })
      } catch (e) {
        // Skip duplicates
      }
    }
  }

  io.emit('task:created', task)
  if (task.assigneeId) io.to(`agent:${task.assigneeId}`).emit('task:assigned', task)

  res.status(201).json({ success: true, data: task, message: 'Task created' } as ApiResponse)
})

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const data = req.body

  const existing = await prisma.task.findUnique({ where: { id } })
  if (!existing) throw new AppError('Task not found', 404)

  if (data.status && data.status !== existing.status) {
    const valid = validStatusTransitions[existing.status] || []
    if (!valid.includes(data.status)) {
      throw new AppError(`Cannot transition from ${existing.status} to ${data.status}`, 400)
    }
  }

  const updateData: any = {}
  if (data.title) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.priority) updateData.priority = data.priority
  if (data.data) updateData.data = JSON.stringify(data.data)
  if (data.dueDate) updateData.dueDate = new Date(data.dueDate)
  // Phase 3: 智能任务匹配字段
  if (data.requiredSkills) updateData.requiredSkills = JSON.stringify(data.requiredSkills)
  if (data.estimatedHours !== undefined) updateData.estimatedHours = data.estimatedHours
  if (data.status) {
    updateData.status = data.status
    if (data.status === 'in_progress' && !existing.startedAt) updateData.startedAt = new Date()
    if (data.status === 'completed') updateData.completedAt = new Date()
  }

  const task = await prisma.task.update({
    where: { id },
    data: updateData,
    include: {
      assignee: { select: { id: true, name: true, avatar: true } },
      processInstance: { select: { id: true, status: true } }
    }
  })

  io.to(`task:${id}`).emit('task:updated', task)
  io.to('tasks').emit('task:updated', task)

  if (data.status === 'completed') {
    const dependents = await prisma.taskDependency.findMany({ where: { dependsOnTaskId: id }, select: { taskId: true } })
    dependents.forEach((dep: any) => {
      io.to(`task:${dep.taskId}`).emit('task:dependency:completed', { taskId: dep.taskId, completedDependencyId: id })
    })
  }

  res.json({ success: true, data: task, message: 'Task updated' } as ApiResponse)
})

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string

  const existing = await prisma.task.findUnique({ where: { id } })
  if (!existing) throw new AppError('Task not found', 404)

  const hasDependents = await prisma.taskDependency.count({ where: { dependsOnTaskId: id } })
  if (hasDependents > 0) throw new AppError('Cannot delete task with dependents', 400)

  await prisma.task.delete({ where: { id } })
  io.emit('task:deleted', { taskId: id })
  res.json({ success: true, message: 'Task deleted' } as ApiResponse)
})

export const updateTaskStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const { status } = req.body

  if (!status) throw new AppError('Status required', 400)

  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) throw new AppError('Task not found', 404)

  const valid = validStatusTransitions[task.status] || []
  if (!valid.includes(status)) throw new AppError(`Cannot transition from ${task.status} to ${status}`, 400)

  if (status === 'in_progress' && task.status === 'assigned') {
    const unmet = await prisma.taskDependency.findMany({
      where: { taskId: id, dependsOnTask: { status: { not: 'completed' } } }
    })
    if (unmet.length > 0) throw new AppError('Cannot start: dependencies not met', 400)
  }

  const updateData: any = { status }
  if (status === 'in_progress' && !task.startedAt) updateData.startedAt = new Date()
  if (status === 'completed') updateData.completedAt = new Date()

  const updated = await prisma.task.update({
    where: { id },
    data: updateData,
    include: { assignee: { select: { id: true, name: true, avatar: true } } }
  })

  io.to(`task:${id}`).emit('task:status:changed', updated)
  io.to('tasks').emit('task:updated', updated)

  if (status === 'completed') {
    io.to(`agent:${task.assigneeId}`).emit('task:completed', updated)
    const dependents = await prisma.taskDependency.findMany({ where: { dependsOnTaskId: id }, select: { taskId: true } })
    dependents.forEach((dep: any) => {
      io.to(`task:${dep.taskId}`).emit('task:dependency:completed', { taskId: dep.taskId, completedDependencyId: id })
    })
  }

  res.json({ success: true, data: updated, message: 'Status updated' } as ApiResponse)
})

export const assignTask = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const { assigneeId } = req.body

  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) throw new AppError('Task not found', 404)
  if (task.status === 'completed' || task.status === 'cancelled') {
    throw new AppError('Cannot assign completed or cancelled task', 400)
  }

  const updated = await prisma.task.update({
    where: { id },
    data: { assigneeId, status: assigneeId ? 'assigned' : 'pending' },
    include: { assignee: { select: { id: true, name: true, avatar: true } } }
  })

  io.to(`task:${id}`).emit('task:assigned', updated)
  if (assigneeId) io.to(`agent:${assigneeId}`).emit('task:assigned', updated)

  res.json({ success: true, data: updated, message: assigneeId ? 'Task assigned' : 'Task unassigned' } as ApiResponse)
})

export const batchUpdateTasks = asyncHandler(async (req: Request, res: Response) => {
  const { taskIds, updates } = req.body

  if (!Array.isArray(taskIds) || taskIds.length === 0) throw new AppError('taskIds array required', 400)

  const updateData: any = {}
  if (updates.status) updateData.status = updates.status
  if (updates.priority) updateData.priority = updates.priority
  if (updates.assigneeId !== undefined) updateData.assigneeId = updates.assigneeId
  if (updates.dueDate) updateData.dueDate = new Date(updates.dueDate)

  const result = await prisma.task.updateMany({ where: { id: { in: taskIds } }, data: updateData })
  io.emit('tasks:batch:updated', { taskIds, updates })

  res.json({ success: true, data: { updatedCount: result.count }, message: `${result.count} tasks updated` } as ApiResponse)
})

export const getTaskStats = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId, assigneeId } = req.query as any

  const where: any = {}
  if (organizationId) where.creator = { organizationId }
  if (assigneeId) where.assigneeId = assigneeId

  const [total, byStatus, byPriority, overdue] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.groupBy({ by: ['status'], where, _count: { status: true } }),
    prisma.task.groupBy({ by: ['priority'], where, _count: { priority: true } }),
    prisma.task.count({
      where: { ...where, status: { notIn: ['completed', 'cancelled'] }, dueDate: { lt: new Date() } }
    })
  ])

  res.json({
    success: true,
    data: {
      total,
      byStatus: byStatus.reduce((acc: any, s: any) => ({ ...acc, [s.status]: s._count.status }), {}),
      byPriority: byPriority.reduce((acc: any, p: any) => ({ ...acc, [p.priority]: p._count.priority }), {}),
      overdue
    }
  } as ApiResponse)
})
