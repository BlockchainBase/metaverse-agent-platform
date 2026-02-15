import { Request, Response, NextFunction } from 'express';
import { config } from '@/config';
import { createErrorResponse } from '@/utils';

// 自定义错误类
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 处理中间件
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json(
    createErrorResponse('NOT_FOUND', `Route ${req.method} ${req.path} not found`)
  );
};

// 全局错误处理中间件
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 处理已知的应用错误
  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      createErrorResponse(err.code, err.message, err.details)
    );
    return;
  }

  // 处理 Prisma 错误
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    
    // 唯一约束违反
    if (prismaError.code === 'P2002') {
      const field = prismaError.meta?.target?.[0] || 'field';
      res.status(409).json(
        createErrorResponse('DUPLICATE_ENTRY', `${field} already exists`)
      );
      return;
    }
    
    // 记录未找到
    if (prismaError.code === 'P2025') {
      res.status(404).json(
        createErrorResponse('NOT_FOUND', 'Resource not found')
      );
      return;
    }

    // 外键约束违反
    if (prismaError.code === 'P2003') {
      res.status(400).json(
        createErrorResponse('FOREIGN_KEY_VIOLATION', 'Referenced resource does not exist')
      );
      return;
    }
  }

  // 处理验证错误
  if (err.name === 'ValidationError') {
    res.status(400).json(
      createErrorResponse('VALIDATION_ERROR', err.message)
    );
    return;
  }

  // 处理 JWT 错误
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json(
      createErrorResponse('INVALID_TOKEN', 'Invalid token')
    );
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json(
      createErrorResponse('TOKEN_EXPIRED', 'Token has expired')
    );
    return;
  }

  // 开发环境显示详细错误
  if (config.nodeEnv === 'development') {
    console.error('Error:', err);
    res.status(500).json(
      createErrorResponse('INTERNAL_ERROR', err.message, {
        stack: err.stack,
        name: err.name,
      })
    );
    return;
  }

  // 生产环境隐藏详细错误
  console.error('Error:', err.message);
  res.status(500).json(
    createErrorResponse('INTERNAL_ERROR', 'Internal server error')
  );
};

// 异步处理包装器
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};