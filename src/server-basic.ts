import express from "express"
import cors from "cors"
import helmet from "helmet"
import { config } from "dotenv"

// Load environment variables
config()

const app = express()
const PORT = process.env.PORT || 3000

// Basic middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "IPSAS Accounting API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  })
})

// Basic API routes
app.get("/api/v1/status", (req, res) => {
  res.json({
    success: true,
    message: "API is working",
    features: ["Health Check", "Basic API Structure", "CORS Enabled", "Security Headers"],
    timestamp: new Date().toISOString(),
  })
})

// Mock endpoints for testing
app.get("/api/v1/entities", (req, res) => {
  res.json({
    success: true,
    message: "Entities endpoint (mock)",
    data: [
      {
        id: "1",
        entityCode: "GOV001",
        entityName: "Central Government",
        entityType: "GOVERNMENT",
      },
    ],
    timestamp: new Date().toISOString(),
  })
})

app.get("/api/v1/accounts", (req, res) => {
  res.json({
    success: true,
    message: "Accounts endpoint (mock)",
    data: [
      {
        id: "1",
        accountCode: "1000",
        accountName: "Assets",
        accountType: "ASSET",
      },
    ],
    timestamp: new Date().toISOString(),
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: ["GET /health", "GET /api/v1/status", "GET /api/v1/entities", "GET /api/v1/accounts"],
    timestamp: new Date().toISOString(),
  })
})

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Error:", err)
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
    timestamp: new Date().toISOString(),
  })
})

// Start server
const server = app.listen(PORT, () => {
  console.log(`✓ IPSAS Accounting API server running on port ${PORT}`)
  console.log(`✓ Health check: http://localhost:${PORT}/health`)
  console.log(`✓ API status: http://localhost:${PORT}/api/v1/status`)
  console.log(`✓ Mock entities: http://localhost:${PORT}/api/v1/entities`)
  console.log(`✓ Mock accounts: http://localhost:${PORT}/api/v1/accounts`)
})

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`${signal} received, shutting down gracefully`)
  server.close(() => {
    console.log("HTTP server closed")
    process.exit(0)
  })
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))
