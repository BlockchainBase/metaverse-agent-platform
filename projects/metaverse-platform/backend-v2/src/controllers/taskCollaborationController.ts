import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import type { ApiResponse } from '../types/index'
import { AppError, asyncHandler } from '../utils/error'
import { io } from '../index'

// ==================== Task Delegation ====================

export const delegateTask = asyncHandler(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string
  const { delegateToId, reason, delegatedById } = req.body

  if (!delegateToId) throw new AppError('delegateToId required', 400)

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { assignee: { select: { id: true, name: true } } }
  })

  if (!task) throw new AppError('Task not found', 404)
  if (task.status === 'completed' || task.status === 'cancelled') {
    throw new AppError('Cannot delegate completed or cancelled task', 400)
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      assigneeId: delegateToId,
      status: 'delegated',
      data: JSON.stringify({
        ...JSON.parse(task.data || '{}'),
        delegatedById: delegatedById || task.assigneeId,
        delegatedAt: new Date().toISOString(),
        delegationReason: reason,
        transferHistory: [
          ...(JSON.parse(task.data || '{}').transferHistory || []),
          { from: task.assigneeId, to: delegateToId, type: 'delegation', reason, timestamp: new Date().toISOString() }
        ]
      })
    },
    include: { assignee: { select: { id: true, name: true, avatar: true } } }
  })

  io.to(`task:${taskId}`).emit('task:delegated', updatedTask)
  io.to(`agent:${delegateToId}`).emit('task:assigned', updatedTask)
  res.json({ success: true, data: updatedTask, message: 'Task delegated' } as ApiResponse)
})

// ==================== Task Transfer ====================

export const transferTask = asyncHandler(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string
  const { transferToId, reason, transferredById } = req.body

  if (!transferToId) throw new AppError('transferToId required', 400)

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) throw new AppError('Task not found', 404)
  if (task.status === 'completed' || task.status === 'cancelled') {
    throw new AppError('Cannot transfer completed or cancelled task', 400)
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      assigneeId: transferToId,
      status: 'assigned',
      data: JSON.stringify({
        ...JSON.parse(task.data || '{}'),
        transferHistory: [
          ...(JSON.parse(task.data || '{}').transferHistory || []),
          { from: task.assigneeId, to: transferToId, type: 'transfer', reason, transferredBy: transferredById, timestamp: new Date().toISOString() }
        ]
      })
    },
    include: { assignee: { select: { id: true, name: true, avatar: true } } }
  })

  io.to(`task:${taskId}`).emit('task:transferred', updatedTask)
  io.to(`agent:${transferToId}`).emit('task:assigned', updatedTask)
  res.json({ success: true, data: updatedTask, message: 'Task transferred' } as ApiResponse)
})

// ==================== Task Claim ====================

export const claimTask = asyncHandler(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string
  const { agentId } = req.body

  if (!agentId) throw new AppError('agentId required', 400)

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) throw new AppError('Task not found', 404)
  if (task.status !== 'pending') throw new AppError(`Cannot claim task in ${task.status} status`, 400)

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      assigneeId: agentId,
      status: 'assigned',
      data: JSON.stringify({
        ...JSON.parse(task.data || '{}'),
        transferHistory: [
          ...(JSON.parse(task.data || '{}').transferHistory || []),
          { type: 'claim', by: agentId, timestamp: new Date().toISOString() }
        ]
      })
    },
    include: { assignee: { select: { id: true, name: true, avatar: true } } }
  })

  io.to(`task:${taskId}`).emit('task:claimed', updatedTask)
  io.to('tasks').emit('task:updated', updatedTask)
  res.json({ success: true, data: updatedTask, message: 'Task claimed' } as ApiResponse)
})

export const unclaimTask = asyncHandler(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string
  const { agentId } = req.body

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) throw new AppError('Task not found', 404)
  if (task.assigneeId !== agentId) throw new AppError('Only assignee can unclaim', 403)
  if (task.status !== 'assigned' && task.status !== 'in_progress') {
    throw new AppError(`Cannot unclaim task in ${task.status} status`, 400)
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: { assigneeId: null, status: 'pending' },
    include: { assignee: { select: { id: true, name: true, avatar: true } } }
  })

  io.to(`task:${taskId}`).emit('task:unclaimed', { taskId, agentId })
  io.to('tasks').emit('task:updated', updatedTask)
  res.json({ success: true, data: updatedTask, message: 'Task unclaimed' } as ApiResponse)
})

// ==================== Task Collaboration ====================

export const addCollaborator = asyncHandler(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string
  const { agentId, role = 'member' } = req.body

  if (!agentId) throw new AppError('agentId required', 400)

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) throw new AppError('Task not found', 404)
  if (task.status === 'completed' || task.status === 'cancelled') {
    throw new AppError('Cannot add collaborator to completed task', 400)
  }

  const collaborator = await prisma.taskCollaborator.create({
    data: { taskId, agentId, role, status: 'active' },
    include: { agent: { select: { id: true, name: true, avatar: true } } }
  })

  io.to(`task:${taskId}`).emit('task:collaborator:joined', { taskId, agentId, role })
  res.json({ success: true, data: collaborator, message: 'Collaborator added' } as ApiResponse)
})

export const removeCollaborator = asyncHandler(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string
  const collaboratorId = req.params.collaboratorId as string

  const collaborator = await prisma.taskCollaborator.findFirst({
    where: { id: collaboratorId, taskId }
  })
  if (!collaborator) throw new AppError('Collaborator not found', 404)

  const updated = await prisma.taskCollaborator.update({
    where: { id: collaboratorId },
    data: { status: 'left', leftAt: new Date() },
    include: { agent: { select: { id: true, name: true, avatar: true } } }
  })

  io.to(`task:${taskId}`).emit('task:collaborator:left', { taskId, agentId: collaborator.agentId })
  res.json({ success: true, data: updated, message: 'Collaborator removed' } as ApiResponse)
})

export const updateCollaboratorRole = asyncHandler(async (req: Request, res: Response) => {
  const collaboratorId = req.params.collaboratorId as string
  const { role } = req.body

  if (!role || !['member', 'leader', 'reviewer'].includes(role)) {
    throw new AppError('Valid role required', 400)
  }

  const updated = await prisma.taskCollaborator.update({
    where: { id: collaboratorId },
    data: { role },
    include: { agent: { select: { id: true, name: true, avatar: true } } }
  })

  res.json({ success: true, data: updated, message: 'Role updated' } as ApiResponse)
})

// ==================== Task Dependencies ====================

export const addDependency = asyncHandler(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string
  const { dependsOnTaskId, dependencyType = 'blocks' } = req.body

  if (!dependsOnTaskId) throw new AppError('dependsOnTaskId required', 400)
  if (taskId === dependsOnTaskId) throw new AppError('Task cannot depend on itself', 400)

  const hasCircular = await checkCircularDependency(taskId, dependsOnTaskId)
  if (hasCircular) throw new AppError('Circular dependency detected', 400)

  const dependency = await prisma.taskDependency.create({
    data: { taskId, dependsOnTaskId, dependencyType },
    include: { dependsOnTask: { select: { id: true, title: true, status: true } } }
  })

  res.status(201).json({ success: true, data: dependency, message: 'Dependency added' } as ApiResponse)
})

export const removeDependency = asyncHandler(async (req: Request, res: Response) => {
  const dependencyId = req.params.dependencyId as string

  const dependency = await prisma.taskDependency.findUnique({ where: { id: dependencyId } })
  if (!dependency) throw new AppError('Dependency not found', 404)

  await prisma.taskDependency.delete({ where: { id: dependencyId } })
  res.json({ success: true, message: 'Dependency removed' } as ApiResponse)
})

export const getTaskDependencies = asyncHandler(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      dependencies: { include: { dependsOnTask: { select: { id: true, title: true, status: true, priority: true } } } },
      dependents: { include: { task: { select: { id: true, title: true, status: true, priority: true } } } }
    }
  })

  if (!task) throw new AppError('Task not found', 404)

  const allDepsCompleted = task.dependencies.every((d: any) => d.dependsOnTask.status === 'completed')

  res.json({
    success: true,
    data: { dependencies: task.dependencies, dependents: task.dependents, canStart: allDepsCompleted }
  } as ApiResponse)
})

async function checkCircularDependency(taskId: string, dependsOnId: string): Promise<boolean> {
  const visited = new Set<string>()
  const stack = [dependsOnId]

  while (stack.length > 0) {
    const current = stack.pop()!
    if (current === taskId) return true
    if (visited.has(current)) continue
    visited.add(current)

    const deps = await prisma.taskDependency.findMany({
      where: { taskId: current },
      select: { dependsOnTaskId: true }
    })
    deps.forEach(dep => stack.push(dep.dependsOnTaskId))
  }
  return false
}

// ==================== Available Tasks ====================

export const getAvailableTasks = asyncHandler(async (req: Request, res: Response) => {
  const { organizationId } = req.query as any

  const tasks = await prisma.task.findMany({
    where: {
      status: 'pending',
      assigneeId: null,
      ...(organizationId && { creator: { organizationId } })
    },
    include: {
      creator: { select: { id: true, name: true, avatar: true } },
      dependencies: { include: { dependsOnTask: { select: { id: true, title: true, status: true } } } }
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }]
  })

  const availableTasks = tasks.filter((task: any) =>
    task.dependencies.every((d: any) => d.dependsOnTask.status === 'completed')
  )

  res.json({ success: true, data: availableTasks } as ApiResponse)
})

// ==================== Task Chain ====================

export const getTaskChain = asyncHandler(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      dependencies: { include: { dependsOnTask: { include: { assignee: { select: { id: true, name: true } } } } } },
      dependents: { include: { task: { include: { assignee: { select: { id: true, name: true } } } } } },
      assignee: { select: { id: true, name: true, avatar: true } }
    }
  })

  if (!task) throw new AppError('Task not found', 404)

  const chain = {
    current: task,
    prerequisites: task.dependencies.map((d: any) => d.dependsOnTask),
    next: task.dependents.map((d: any) => d.task)
  }

  res.json({ success: true, data: chain } as ApiResponse)
})
