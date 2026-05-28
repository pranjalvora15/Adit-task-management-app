import { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction): void {
  const statusCode = err.statusCode ?? 500
  const message = err.message || 'Internal Server Error'

  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error ${statusCode}]`, err.stack)
  }

  res.status(statusCode).json({ message })
}
