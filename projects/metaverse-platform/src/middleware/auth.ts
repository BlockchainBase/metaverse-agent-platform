import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils';
import { ITokenPayload } from '@/types';
import { createErrorResponse } from '@/utils';

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      agent?: ITokenPayload;
    }
  }
}

// JWT 认证中间件
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json(
        createErrorResponse('UNAUTHORIZED', 'Missing or invalid authorization header')
      );
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    if (decoded.type !== 'access') {
      res.status(401).json(
        createErrorResponse('UNAUTHORIZED', 'Invalid token type')
      );
      return;
    }

    req.agent = decoded;
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        res.status(401).json(
          createErrorResponse('TOKEN_EXPIRED', 'Token has expired')
        );
        return;
      }
    }
    res.status(401).json(
      createErrorResponse('UNAUTHORIZED', 'Invalid token')
    );
  }
};

// 可选认证中间件
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyAccessToken(token);
      if (decoded.type === 'access') {
        req.agent = decoded;
      }
    }
    
    next();
  } catch {
    // 忽略错误，继续执行
    next();
  }
};

// mTLS 认证中间件
export const authenticateMTLS = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // 从请求头或 TLS 连接中获取证书信息
    const certFingerprint = req.headers['x-client-cert-fingerprint'] as string;
    const certSubject = req.headers['x-client-cert-subject'] as string;

    if (!certFingerprint) {
      res.status(401).json(
        createErrorResponse('MTLS_REQUIRED', 'Client certificate required')
      );
      return;
    }

    // 将证书信息附加到请求对象
    (req as any).clientCert = {
      fingerprint: certFingerprint,
      subject: certSubject,
    };

    next();
  } catch (error) {
    res.status(401).json(
      createErrorResponse('MTLS_ERROR', 'Client certificate validation failed')
    );
  }
};

// 双重认证中间件（JWT + mTLS）
export const authenticateDual = [
  authenticateMTLS,
  authenticate,
];