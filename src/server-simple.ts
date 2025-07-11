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
  })
})

// Basic API endpoint
app.get("/api/v1/status", (req, res) => {
  res.json({
    success: true,
    message: "API is working",
    environment: process.env.NODE_ENV || "development",
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

// Start server
app.listen(PORT, () => {
  console.log(`✓ IPSAS Accounting API server running on port ${PORT}`)
  console.log(`✓ Health check: http://localhost:${PORT}/health`)
  console.log(`✓ API status: http://localhost:${PORT}/api/v1/status`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully")
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully")
  process.exit(0)
})
