import { Request, Response, NextFunction } from 'express';
import { createErrorResponse, isValidAgentId } from '@/utils';

// 验证 Agent 创建请求
export const validateAgentCreate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { agentId, name, password } = req.body;
  const errors: string[] = [];

  if (!agentId) {
    errors.push('agentId is required');
  } else if (!isValidAgentId(agentId)) {
    errors.push('agentId must be 3-50 characters, alphanumeric with underscores and hyphens only');
  }

  if (!name || name.trim().length < 1) {
    errors.push('name is required and cannot be empty');
  }

  if (password && password.length < 8) {
    errors.push('password must be at least 8 characters');
  }

  if (errors.length > 0) {
    res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'Validation failed', errors)
    );
    return;
  }

  next();
};

// 验证登录请求
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { agentId, password } = req.body;
  const errors: string[] = [];

  if (!agentId) {
    errors.push('agentId is required');
  }

  if (!password) {
    errors.push('password is required');
  }

  if (errors.length > 0) {
    res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'Validation failed', errors)
    );
    return;
  }

  next();
};

// 验证任务创建请求
export const validateTaskCreate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, type, priority } = req.body;
  const errors: string[] = [];
  const validTypes = ['CHAT', 'ACTION', 'NAVIGATION', 'CUSTOM', 'SYSTEM'];

  if (!name || name.trim().length < 1) {
    errors.push('name is required and cannot be empty');
  }

  if (!type) {
    errors.push('type is required');
  } else if (!validTypes.includes(type)) {
    errors.push(`type must be one of: ${validTypes.join(', ')}`);
  }

  if (priority !== undefined && (priority < 1 || priority > 10)) {
    errors.push('priority must be between 1 and 10');
  }

  if (errors.length > 0) {
    res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'Validation failed', errors)
    );
    return;
  }

  next();
};

// 验证任务更新请求
export const validateTaskUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { status, priority } = req.body;
  const errors: string[] = [];
  const validStatuses = ['PENDING', 'SCHEDULED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'RETRYING'];

  if (status && !validStatuses.includes(status)) {
    errors.push(`status must be one of: ${validStatuses.join(', ')}`);
  }

  if (priority !== undefined && (priority < 1 || priority > 10)) {
    errors.push('priority must be between 1 and 10');
  }

  if (errors.length > 0) {
    res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'Validation failed', errors)
    );
    return;
  }

  next();
};

// 验证分页参数
export const validatePagination = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  if (page < 1) {
    res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'page must be at least 1')
    );
    return;
  }

  if (limit < 1 || limit > 100) {
    res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'limit must be between 1 and 100')
    );
    return;
  }

  // 将验证后的值附加到请求对象
  (req as any).pagination = { page, limit };
  next();
};

// 验证心跳数据
export const validateHeartbeat = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { status, position } = req.body;
  const errors: string[] = [];
  const validStatuses = ['ONLINE', 'OFFLINE', 'BUSY', 'AWAY', 'ERROR'];

  if (!status) {
    errors.push('status is required');
  } else if (!validStatuses.includes(status)) {
    errors.push(`status must be one of: ${validStatuses.join(', ')}`);
  }

  if (position) {
    if (typeof position.x !== 'number' ||
        typeof position.y !== 'number' ||
        typeof position.z !== 'number') {
      errors.push('position must have x, y, z number coordinates');
    }
  }

  if (errors.length > 0) {
    res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', 'Validation failed', errors)
    );
    return;
  }

  next();
};