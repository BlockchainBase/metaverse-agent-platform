export class AppError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    this.name = 'AppError'
  }
}

export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
