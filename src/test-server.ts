import express from "express"

const app = express()
const PORT = 3000

app.use(express.json())

app.get("/", (req, res) => {
  res.json({
    message: "IPSAS Accounting API Test Server",
    status: "running",
    timestamp: new Date().toISOString(),
  })
})

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`)
})
