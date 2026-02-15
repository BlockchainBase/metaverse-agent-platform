import type { Request, Response, NextFunction } from 'express'

/**
 * 请求日志中间件
 * 记录所有HTTP请求的详细信息
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  const requestId = Math.random().toString(36).substring(2, 15)
  
  // 将requestId附加到请求对象，便于追踪
  ;(req as any).requestId = requestId
  
  // 记录请求开始
  console.log(`[${new Date().toISOString()}] [${requestId}] → ${req.method} ${req.path} - Started`)
  
  // 响应完成时记录
  res.on('finish', () => {
    const duration = Date.now() - start
    const status = res.statusCode
    const statusEmoji = status < 400 ? '✅' : status < 500 ? '⚠️' : '❌'
    
    console.log(
      `[${new Date().toISOString()}] [${requestId}] ${statusEmoji} ${req.method} ${req.path} - ${status} (${duration}ms)`
    )
  })
  
  next()
}

/**
 * 错误日志中间件
 * 记录详细的错误信息
 */
export const errorLogger = (err: any, req: Request, res: Response, next: NextFunction) => {
  const requestId = (req as any).requestId || 'unknown'
  
  console.error(`[${new Date().toISOString()}] [${requestId}] ❌ Error occurred:`)
  console.error(`  Message: ${err.message}`)
  console.error(`  Stack: ${err.stack}`)
  console.error(`  Path: ${req.method} ${req.path}`)
  console.error(`  Body:`, req.body)
  console.error(`  Query:`, req.query)
  console.error(`  User:`, req.user?.userId || 'anonymous')
  
  next(err)
}

/**
 * 慢请求警告中间件
 * 记录响应时间超过阈值的请求
 */
export const slowRequestWarning = (thresholdMs: number = 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now()
    
    res.on('finish', () => {
      const duration = Date.now() - start
      if (duration > thresholdMs) {
        console.warn(
          `[SLOW REQUEST] ${req.method} ${req.path} took ${duration}ms (threshold: ${thresholdMs}ms)`
        )
      }
    })
    
    next()
  }
}
