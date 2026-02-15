import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from '../utils/error.js'

// JWT配置
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// 用户Payload接口
export interface JwtPayload {
  userId: string
  email: string
  organizationId?: string
  role?: string
  iat?: number
  exp?: number
}

// 扩展Express Request类型
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

/**
 * JWT认证中间件
 * 验证请求头中的Authorization Token
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader) {
      throw new AppError('Authorization header missing', 401)
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AppError('Invalid authorization format. Use: Bearer <token>', 401)
    }

    const token = parts[1]
    
    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    req.user = decoded
    
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      })
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      })
    }
    next(error)
  }
}

/**
 * 可选认证中间件
 * 验证token但不阻止请求（用于公开但支持登录的接口）
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    
    if (authHeader) {
      const parts = authHeader.split(' ')
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const token = parts[1]
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
        req.user = decoded
      }
    }
    
    next()
  } catch {
    // 忽略验证错误，继续作为未认证用户
    next()
  }
}

/**
 * 组织权限检查中间件
 * 确保用户只能访问自己组织的资源
 */
export const requireOrganization = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    })
  }
  
  // 从请求参数或body中获取组织ID
  const requestedOrgId = req.params.organizationId || req.body.organizationId || req.query.organizationId
  
  if (requestedOrgId && req.user.organizationId && requestedOrgId !== req.user.organizationId) {
    return res.status(403).json({
      success: false,
      error: 'Access denied to this organization'
    })
  }
  
  next()
}

/**
 * 角色权限检查中间件
 * 检查用户是否具有所需角色
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }
    
    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      })
    }
    
    next()
  }
}

/**
 * 生成JWT Token
 */
export const generateToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
  })
}

/**
 * 验证JWT Token
 */
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}
