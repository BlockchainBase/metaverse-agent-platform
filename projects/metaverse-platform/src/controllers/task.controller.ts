import { Request, Response } from 'express';
import { TaskStatus, TaskType } from '@prisma/client';
import { taskService } from '@/services';
import { 
  createSuccessResponse, 
  asyncHandler,
  AppError,
} from '@/middleware';
import { ITaskCreate, ITaskUpdate, ITaskFilter } from '@/types';

export class TaskController {
  // 创建任务
  create = asyncHandler(async (req: Request, res: Response) => {
    const data: ITaskCreate = req.body;
    const task = await taskService.createTask(data);
    res.status(201).json(createSuccessResponse(task));
  });

  // 获取任务列表
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as TaskStatus;
    const type = req.query.type as TaskType;
    const agentId = req.query.agentId as string;

    const filter: ITaskFilter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (agentId) filter.agentId = agentId;

    const { tasks, total } = await taskService.getTasks(filter, { page, limit });

    res.json(
      createSuccessResponse(tasks, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      })
    );
  });

  // 获取单个任务
  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const task = await taskService.getTaskById(id);

    if (!task) {
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    }

    res.json(createSuccessResponse(task));
  });

  // 根据 taskId 获取任务
  getByTaskId = asyncHandler(async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const task = await taskService.getTaskByTaskId(taskId);

    if (!task) {
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    }

    res.json(createSuccessResponse(task));
  });

  // 更新任务
  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data: ITaskUpdate = req.body;
    const task = await taskService.updateTask(id, data);
    res.json(createSuccessResponse(task));
  });

  // 删除任务
  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await taskService.deleteTask(id);
    res.status(204).send();
  });

  // 分配任务给自己
  claim = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const agentId = req.agent?.id;

    if (!agentId) {
      throw new AppError('Not authenticated', 401, 'UNAUTHENTICATED');
    }

    const task = await taskService.getTaskById(id);
    
    if (!task) {
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    }

    if (task.status !== 'PENDING' && task.status !== 'SCHEDULED') {
      throw new AppError('Task is not available for claiming', 400, 'TASK_NOT_AVAILABLE');
    }

    const updatedTask = await taskService.assignTask(id, agentId);
    res.json(createSuccessResponse(updatedTask));
  });

  // 完成任务
  complete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { result } = req.body;
    const agentId = req.agent?.id;

    const task = await taskService.getTaskById(id);
    
    if (!task) {
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    }

    // 验证任务是否属于当前 Agent
    if (task.agentId !== agentId) {
      throw new AppError('Not authorized to complete this task', 403, 'NOT_AUTHORIZED');
    }

    const updatedTask = await taskService.updateTask(id, {
      status: 'COMPLETED',
      result,
    });

    res.json(createSuccessResponse(updatedTask));
  });

  // 失败任务
  fail = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { error } = req.body;
    const agentId = req.agent?.id;

    const task = await taskService.getTaskById(id);
    
    if (!task) {
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    }

    if (task.agentId !== agentId) {
      throw new AppError('Not authorized to update this task', 403, 'NOT_AUTHORIZED');
    }

    const updatedTask = await taskService.updateTask(id, {
      status: 'FAILED',
      error,
    });

    res.json(createSuccessResponse(updatedTask));
  });

  // 获取任务统计
  getStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await taskService.getTaskStats();
    res.json(createSuccessResponse(stats));
  });

  // 获取我的任务
  getMyTasks = asyncHandler(async (req: Request, res: Response) => {
    const agentId = req.agent?.id;
    
    if (!agentId) {
      throw new AppError('Not authenticated', 401, 'UNAUTHENTICATED');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as TaskStatus;

    const filter: ITaskFilter = { agentId };
    if (status) filter.status = status;

    const { tasks, total } = await taskService.getTasks(filter, { page, limit });

    res.json(
      createSuccessResponse(tasks, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      })
    );
  });
}

export const taskController = new TaskController();