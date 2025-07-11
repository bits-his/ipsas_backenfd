import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import swaggerJSDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import "express-async-errors"

import { environment } from "./config/environment"
import { errorHandler, notFoundHandler } from "./middleware/error.middleware"
import { auditLogger } from "./middleware/audit.middleware"
import apiRoutes from "./routes/api.routes"

const app = express()

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? ["https://yourdomain.com"] : true,
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: environment.RATE_LIMIT_WINDOW,
  max: environment.RATE_LIMIT_MAX,
  message: {
    success: false,
    message: "Too many requests, please try again later",
    timestamp: new Date().toISOString(),
  },
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Audit logging middleware
app.use(auditLogger)

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "IPSAS Accounting API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  })
})

// API routes
app.use(environment.API_PREFIX, apiRoutes)

// Swagger documentation
if (environment.NODE_ENV === "production") {
  const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "IPSAS Accounting System API",
        version: "1.0.0",
        description: "IPSAS-Compliant Public Sector Accounting System API",
      },
      servers: [
        {
          url: `http://localhost:${environment.PORT}${environment.API_PREFIX}`,
          description: "Development server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: ["./src/routes/*.ts"], // Path to the API files
  }

  const swaggerSpec = swaggerJSDoc(swaggerOptions)
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

export default app
