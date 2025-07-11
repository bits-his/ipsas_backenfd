import type { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"

export const auditLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now()

  // Log request
  logger.info("API Request", {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: req?.user?.userId,
    entityId: req?.user?.entityId,
    timestamp: new Date().toISOString(),
  })

  // Override res.json to log response
  const originalJson = res.json
  res.json = function (body: any) {
    const duration = Date.now() - startTime

    logger.info("API Response", {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req?.user?.userId,
      entityId: req?.user?.entityId,
      success: body?.success,
      timestamp: new Date().toISOString(),
    })

    return originalJson.call(this, body)
  }

  next()
}
