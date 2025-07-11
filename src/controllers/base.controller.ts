import type { Request, Response, NextFunction } from "express"
import type { PaginationOptions, ApiResponse } from "../types/common.types"
import { logger } from "../utils/logger"

export abstract class BaseController {
  protected sendSuccess<T>(res: Response, data: T, message = "Success"): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    }
    res.json(response)
  }

  protected sendError(res: Response, message: string, statusCode = 400, errors?: string[]): void {
    const response: ApiResponse = {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    }
    res.status(statusCode).json(response)
  }

  protected sendNotFound(res: Response, resource = "Resource"): void {
    this.sendError(res, `${resource} not found`, 404)
  }

  protected sendValidationError(res: Response, errors: string[]): void {
    this.sendError(res, "Validation failed", 400, errors)
  }

  protected getPaginationOptions(req: Request): PaginationOptions {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Math.min(Number.parseInt(req.query.limit as string) || 10, 100)
    const sortBy = (req.query.sortBy as string) || "createdAt"
    const sortOrder = (req.query.sortOrder as string)?.toUpperCase() === "ASC" ? "ASC" : "DESC"

    return { page, limit, sortBy, sortOrder }
  }

  protected handleError(error: any, res: Response, next: NextFunction): void {
    logger.error("Controller error:", error)

    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((e: any) => e.message)
      this.sendValidationError(res, errors)
      return
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      this.sendError(res, "Resource already exists", 409)
      return
    }

    if (error.name === "SequelizeForeignKeyConstraintError") {
      this.sendError(res, "Referenced resource not found", 400)
      return
    }

    this.sendError(res, error.message || "Internal server error", 500)
  }
}
