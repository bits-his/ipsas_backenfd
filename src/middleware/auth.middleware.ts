import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { environment } from "../config/environment"
import type { UserContext } from "../types/common.types"

// Extend Request interface to include user context
declare global {
  namespace Express {
    interface Request {
      user?: UserContext
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
        timestamp: new Date().toISOString(),
      })
      return
    }

    const token = authHeader.substring(7)

    const decoded = jwt.verify(token, environment.JWT_SECRET) as any

    req.user = {
      userId: decoded.userId,
      entityId: decoded.entityId,
      fundIds: decoded.fundIds || [],
      roles: decoded.roles || [],
      permissions: decoded.permissions || [],
    }

    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      timestamp: new Date().toISOString(),
    })
  }
}

export const authorize = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
        timestamp: new Date().toISOString(),
      })
      return
    }

    const userPermissions = req.user.permissions
    const hasPermission = requiredPermissions.every((permission) => userPermissions.includes(permission))

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        required: requiredPermissions,
        timestamp: new Date().toISOString(),
      })
      return
    }

    next()
  }
}
