import type { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"
import { environment } from "../config/environment"

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction): void => {
  let statusCode = err.statusCode || 500
  let message = err.message || "Internal Server Error"

  // Log error
  logger.error("Error occurred:", {
    error: err.message,
    stack: err.stack,
    url: req?.url,
    method: req?.method,
    ip: req?.ip,
    userAgent: req?.get("User-Agent"),
    // userId: req?.user?.userId,
  })

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400
    message = "Validation Error"
  } else if (err.name === "UnauthorizedError") {
    statusCode = 401
    message = "Unauthorized"
  } else if (err.name === "ForbiddenError") {
    statusCode = 403
    message = "Forbidden"
  } else if (err.name === "NotFoundError") {
    statusCode = 404
    message = "Not Found"
  }

  // Don't leak error details in production
  const response: any = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  }

  if (environment.NODE_ENV === "production") {
    response.stack = err.stack
    response.details = err
  }

  res.status(statusCode).json(response)
}

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  })
}
