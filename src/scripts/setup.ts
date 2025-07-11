import fs from "fs"
import path from "path"

console.log("Setting up IPSAS Accounting API...")

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), "logs")
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
  console.log("✓ Created logs directory")
} else {
  console.log("✓ Logs directory already exists")
}


// Create other necessary directories
const dirs = ["dist", "uploads", "temp"]
dirs.forEach((dir) => {
  const dirPath = path.join(process.cwd(), dir)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    console.log(`✓ Created ${dir} directory`)
  } else {
    console.log(`✓ ${dir} directory already exists`)
  }
})

// Check if .env file exists
const envPath = path.join(process.cwd(), ".env")
if (!fs.existsSync(envPath)) {
  console.log("⚠️  .env file not found. Please create one based on .env.example")
} else {
  console.log("✓ .env file exists")
}

console.log("✓ Setup completed successfully")
