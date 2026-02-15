import { Prisma, TaskStatus, TaskType, AgentStatus } from '@prisma/client';
import { prisma } from '@/config/prisma';
import {
  ITask,
  ITaskCreate,
  ITaskUpdate,
  IPaginationParams,
  ITaskFilter,
} from '@/types';
import { generateTaskId, AppError } from '@/utils';
import { EventEmitter } from 'events';

// 任务调度器事件
export class TaskSchedulerEvents extends EventEmitter {
  constructor() {
    super();
  }
}

export const taskEvents = new TaskSchedulerEvents();

export class TaskService {
  private processingInterval: NodeJS.Timeout | null = null;

  // 创建任务
  async createTask(data: ITaskCreate): Promise<ITask> {
    const task = await prisma.task.create({
      data: {
        taskId: data.taskId || generateTaskId(),
        name: data.name,
        description: data.description,
        type: data.type as TaskType,
        priority: data.priority || 5,
        agentId: data.agentId,
        scheduledAt: data.scheduledAt,
        status: data.scheduledAt ? 'SCHEDULED' : 'PENDING',
        payload: data.payload || {},
        maxRetries: data.maxRetries || 3,
        retryCount: 0,
        metadata: data.metadata || {},
      },
    });

    taskEvents.emit('task:created', task);
    
    // 如果是即时任务，触发处理
    if (!data.scheduledAt) {
      this.processPendingTasks().catch(console.error);
    }

    return task as ITask;
  }

  // 获取任务列表
  async getTasks(
    filter: ITaskFilter = {},
    pagination: IPaginationParams = { page: 1, limit: 10 }
  ): Promise<{ tasks: ITask[]; total: number }> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {};

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.type) {
      where.type = filter.type;
    }

    if (filter.agentId) {
      where.agentId = filter.agentId;
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' },
        ],
        include: {
          agent: {
            select: {
              agentId: true,
              name: true,
            },
          },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return { tasks: tasks as ITask[], total };
  }

  // 根据 ID 获取任务
  async getTaskById(id: string): Promise<ITask | null> {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        agent: {
          select: {
            agentId: true,
            name: true,
          },
        },
      },
    });
    return task as ITask | null;
  }

  // 根据 taskId 获取任务
  async getTaskByTaskId(taskId: string): Promise<ITask | null> {
    const task = await prisma.task.findUnique({
      where: { taskId },
      include: {
        agent: {
          select: {
            agentId: true,
            name: true,
          },
        },
      },
    });
    return task as ITask | null;
  }

  // 更新任务
  async updateTask(id: string, data: ITaskUpdate): Promise<ITask> {
    try {
      const updateData: Prisma.TaskUpdateInput = {
        ...data,
        payload: data.payload ? { ...data.payload } : undefined,
        result: data.result ? { ...data.result } : undefined,
      };

      // 如果状态变为 RUNNING，记录开始时间
      if (data.status === 'RUNNING') {
        updateData.startedAt = new Date();
      }

      // 如果状态变为 COMPLETED 或 FAILED，记录完成时间
      if (data.status === 'COMPLETED' || data.status === 'FAILED') {
        updateData.completedAt = new Date();
      }

      const task = await prisma.task.update({
        where: { id },
        data: updateData,
      });

      taskEvents.emit('task:updated', task);

      // 如果任务失败且需要重试
      if (data.status === 'FAILED' && task.retryCount < task.maxRetries) {
        await this.scheduleRetry(task.id);
      }

      return task as ITask;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
        }
      }
      throw error;
    }
  }

  // 删除任务
  async deleteTask(id: string): Promise<void> {
    try {
      await prisma.task.delete({
        where: { id },
      });
      taskEvents.emit('task:deleted', { id });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
        }
      }
      throw error;
    }
  }

  // 分配任务给 Agent
  async assignTask(taskId: string, agentId: string): Promise<ITask> {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        agentId,
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    taskEvents.emit('task:assigned', { task, agentId });
    return task as ITask;
  }

  // 处理待处理任务
  async processPendingTasks(): Promise<void> {
    // 获取可用的在线 Agents
    const availableAgents = await prisma.agent.findMany({
      where: {
        status: 'ONLINE' as AgentStatus,
      },
      select: {
        id: true,
      },
    });

    if (availableAgents.length === 0) {
      console.log('No available agents to process tasks');
      return;
    }

    const agentIds = availableAgents.map(a => a.id);

    // 获取待处理或已到调度时间的任务
    const pendingTasks = await prisma.task.findMany({
      where: {
        OR: [
          { status: 'PENDING' },
          {
            status: 'SCHEDULED',
            scheduledAt: { lte: new Date() },
          },
        ],
        agentId: null,
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
      take: agentIds.length * 2, // 获取足够多的任务
    });

    for (const task of pendingTasks) {
      // 简单的轮询分配
      const agentId = agentIds[Math.floor(Math.random() * agentIds.length)];
      
      try {
        await this.assignTask(task.id, agentId);
        console.log(`Task ${task.taskId} assigned to agent ${agentId}`);
      } catch (error) {
        console.error(`Failed to assign task ${task.taskId}:`, error);
      }
    }
  }

  // 调度重试
  private async scheduleRetry(taskId: string): Promise<void> {
    // 延迟重试（指数退避）
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return;

    const delayMs = Math.pow(2, task.retryCount) * 1000; // 2^n 秒延迟
    
    setTimeout(async () => {
      try {
        await prisma.task.update({
          where: { id: taskId },
          data: {
            status: 'PENDING',
            retryCount: { increment: 1 },
          },
        });
        await this.processPendingTasks();
      } catch (error) {
        console.error(`Failed to retry task ${taskId}:`, error);
      }
    }, delayMs);
  }

  // 启动调度器
  startScheduler(intervalMs: number = 5000): void {
    if (this.processingInterval) {
      console.log('Task scheduler already running');
      return;
    }

    console.log(`Starting task scheduler with ${intervalMs}ms interval`);
    
    this.processingInterval = setInterval(() => {
      this.processPendingTasks().catch(error => {
        console.error('Error processing pending tasks:', error);
      });
    }, intervalMs);

    // 立即执行一次
    this.processPendingTasks().catch(console.error);
  }

  // 停止调度器
  stopScheduler(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('Task scheduler stopped');
    }
  }

  // 获取任务统计
  async getTaskStats(): Promise<{
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
  }> {
    const stats = await prisma.task.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const result = {
      total: 0,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
    };

    for (const stat of stats) {
      const count = stat._count.status;
      result.total += count;
      
      switch (stat.status) {
        case 'PENDING':
        case 'SCHEDULED':
          result.pending += count;
          break;
        case 'RUNNING':
        case 'RETRYING':
          result.running += count;
          break;
        case 'COMPLETED':
          result.completed += count;
          break;
        case 'FAILED':
        case 'CANCELLED':
          result.failed += count;
          break;
      }
    }

    return result;
  }
}

export const taskService = new TaskService();