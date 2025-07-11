import { Sequelize } from "sequelize"
import { environment } from "./environment"
import { logger } from "../utils/logger"

export const sequelize = new Sequelize({
  host: environment.DB_HOST,
  port: environment.DB_PORT,
  database: environment.DB_NAME,
  username: environment.DB_USER,
  password: environment.DB_PASSWORD,
  dialect: "postgres",
  ssl: environment.DB_SSL,
  logging: environment.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 20,
    min: 5,
    acquire: 60000,
    idle: 10000,
  },
  dialectOptions: {
    ssl: environment.DB_SSL
      ? {
          require: true,
          rejectUnauthorized: false,
        }
      : false,
  },
})

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate()
    logger.info("Database connection established successfully")

    if (environment.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true })
      logger.info("Database synchronized")
    }
  } catch (error) {
    logger.error("Unable to connect to database:", error)
    process.exit(1)
  }
}

export const closeDatabase = async (): Promise<void> => {
  try {
    await sequelize.close()
    logger.info("Database connection closed")
  } catch (error) {
    logger.error("Error closing database connection:", error)
  }
}
