console.log("Starting debug server...")

try {
  console.log("Loading express...")
  const express = require("express")

  console.log("Creating app...")
  const app = express()
  const PORT = 3000

  console.log("Setting up middleware...")
  app.use(express.json())

  console.log("Setting up routes...")
  app.get("/", (req: any, res: any) => {
    res.json({
      message: "Debug server is working!",
      timestamp: new Date().toISOString(),
    })
  })

  app.get("/health", (req: any, res: any) => {
    res.json({
      status: "OK",
      message: "Server is running",
      timestamp: new Date().toISOString(),
    })
  })

  console.log("Starting server...")
  app.listen(PORT, () => {
    console.log(`✓ Debug server running on http://localhost:${PORT}`)
    console.log(`✓ Test: http://localhost:${PORT}/health`)
  })
} catch (error) {
  console.error("Error starting server:", error)
  process.exit(1)
}
