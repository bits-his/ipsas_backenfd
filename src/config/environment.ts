import { config } from "dotenv"

config()

export const environment = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number.parseInt(process.env.PORT || "3000", 10),

  // Database Configuration
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: Number.parseInt(process.env.DB_PORT || "5432", 10),
  DB_NAME: process.env.DB_NAME || "ipsas_accounting",
  DB_USER: process.env.DB_USER || "ipsas_user",
  DB_PASSWORD: process.env.DB_PASSWORD || "password",
  DB_SSL: process.env.DB_SSL === "true",

  // Security Configuration
  JWT_SECRET: process.env.JWT_SECRET || "your-super-secret-jwt-key",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "8h",
  BCRYPT_ROUNDS: Number.parseInt(process.env.BCRYPT_ROUNDS || "12", 10),

  // API Configuration
  API_PREFIX: "/api/v1",
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100, // requests per window

  // IPSAS Configuration
  DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY || "USD",
  FISCAL_YEAR_START: process.env.FISCAL_YEAR_START || "01-01",

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_FILE: process.env.LOG_FILE || "logs/ipsas-api.log",
}

export const isDevelopment = environment.NODE_ENV === "development"
export const isProduction = environment.NODE_ENV === "production"
export const isTest = environment.NODE_ENV === "test"
