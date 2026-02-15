import type { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { AppError } from '../utils/error.js'

/**
 * Zod验证中间件工厂
 * 用于验证请求体、查询参数和路径参数
 */
export const validate = (schemas: {
  body?: ZodSchema<any>
  query?: ZodSchema<any>
  params?: ZodSchema<any>
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body)
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query)
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params)
      }
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: messages
        })
      }
      next(error)
    }
  }
}

/**
 * 参数ID验证中间件
 * 验证路由参数中的ID是否为有效的CUID
 */
export const validateId = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName]
    
    // CUID格式验证（c开头，后跟24个字母数字字符）
    const cuidRegex = /^c[a-z0-9]{24}$/i
    
    if (!id || Array.isArray(id) || !cuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid ${paramName} format`
      })
    }
    
    next()
  }
}

/**
 * SQL注入检测中间件
 * 检测常见的SQL注入模式
 */
export const sqlInjectionGuard = (req: Request, res: Response, next: NextFunction) => {
  const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|SCRIPT|ALERT|ONERROR)\b)|(--|#|\/\*|\*\/)/i
  
  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return sqlPattern.test(value)
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue)
    }
    return false
  }
  
  if (checkValue(req.body) || checkValue(req.query) || checkValue(req.params)) {
    console.warn(`[SECURITY] Potential SQL injection attempt detected from ${req.ip} at ${req.path}`)
    return res.status(400).json({
      success: false,
      error: 'Invalid input detected'
    })
  }
  
  next()
}

/**
 * XSS防护中间件
 * 清理用户输入中的潜在XSS代码
 */
export const xssGuard = (req: Request, res: Response, next: NextFunction) => {
  const xssPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
  
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return value.replace(xssPattern, '')
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = {}
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key])
      }
      return sanitized
    }
    return value
  }
  
  req.body = sanitizeValue(req.body)
  req.query = sanitizeValue(req.query)
  
  next()
}

/**
 * 速率限制中间件（内存版，生产环境建议使用Redis）
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
    
    // 定期清理过期的请求记录
    setInterval(() => this.cleanup(), windowMs)
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    const timestamps = this.requests.get(identifier) || []
    const recentRequests = timestamps.filter(t => t > windowStart)
    
    if (recentRequests.length >= this.maxRequests) {
      return false
    }
    
    recentRequests.push(now)
    this.requests.set(identifier, recentRequests)
    return true
  }

  private cleanup() {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    for (const [key, timestamps] of this.requests.entries()) {
      const recent = timestamps.filter(t => t > windowStart)
      if (recent.length === 0) {
        this.requests.delete(key)
      } else {
        this.requests.set(key, recent)
      }
    }
  }
}

// 创建限流器实例
const apiLimiter = new RateLimiter(60000, 100) // 每分钟100请求
const strictLimiter = new RateLimiter(60000, 10) // 每分钟10请求（用于敏感操作）

export const rateLimit = (strict: boolean = false) => {
  const limiter = strict ? strictLimiter : apiLimiter
  
  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.user?.userId || req.ip || 'anonymous'
    
    if (!limiter.isAllowed(identifier)) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later'
      })
    }
    
    next()
  }
}
