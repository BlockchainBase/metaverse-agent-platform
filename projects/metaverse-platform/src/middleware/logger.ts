import { Request, Response, NextFunction } from 'express';
import { config } from '@/config';

// 请求日志中间件
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const statusCode = res.statusCode;
    const userAgent = req.get('user-agent') || 'unknown';
    const agentId = (req as any).agent?.agentId || 'anonymous';

    // 根据状态码选择日志级别
    let level = 'INFO';
    if (statusCode >= 500) {
      level = 'ERROR';
    } else if (statusCode >= 400) {
      level = 'WARN';
    }

    const logEntry = {
      timestamp,
      level,
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      agentId,
      userAgent: userAgent.substring(0, 100),
      ip: req.ip,
    };

    if (config.nodeEnv === 'development') {
      console.log(JSON.stringify(logEntry, null, 2));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  });

  next();
};