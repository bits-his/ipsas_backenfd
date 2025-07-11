import { config } from "dotenv"

// Load environment variables first
config()

console.log("Loading dependencies...")

import express from "express"
import cors from "cors"
import helmet from "helmet"

console.log("Creating app...")
const app = express()
const PORT = process.env.PORT || 3000

console.log("Setting up middleware...")
// Basic middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

console.log("Setting up routes...")
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
    timestamp: new Date().toISOString(),
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  })
})

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Error:", err)
  res.status(500).json({
    success: false,
    message: "Internal server error",
    timestamp: new Date().toISOString(),
  })
})

console.log("Starting server...")
const server = app.listen(PORT, () => {
  console.log(`✓ IPSAS Accounting API server running on port ${PORT}`)
  console.log(`✓ Health check: http://localhost:${PORT}/health`)
  console.log(`✓ API status: http://localhost:${PORT}/api/v1/status`)
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

// Handle errors
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason)
})

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error)
  process.exit(1)
})
