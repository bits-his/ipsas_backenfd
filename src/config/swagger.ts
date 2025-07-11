import swaggerJSDoc from "swagger-jsdoc"
import { environment } from "./environment"

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "IPSAS Accounting System API",
      version: "1.0.0",
      description: "IPSAS-Compliant Public Sector Accounting System API",
      contact: {
        name: "API Support",
        email: "support@ipsas-api.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${environment.PORT}${environment.API_PREFIX}`,
        description: "Development server",
      },
      {
        url: `https://api.ipsas-accounting.com${environment.API_PREFIX}`,
        description: "Production server",
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
      schemas: {
        Entity: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            entityCode: { type: "string" },
            entityName: { type: "string" },
            entityType: {
              type: "string",
              enum: ["GOVERNMENT", "AGENCY", "DEPARTMENT", "SUBSIDIARY"],
            },
            fiscalYearEnd: { type: "string", pattern: "^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$" },
            currencyCode: { type: "string", minLength: 3, maxLength: 3 },
            isActive: { type: "boolean" },
            description: { type: "string" },
          },
        },
        Fund: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            fundCode: { type: "string" },
            fundName: { type: "string" },
            fundType: {
              type: "string",
              enum: [
                "GENERAL",
                "SPECIAL_REVENUE",
                "CAPITAL_PROJECTS",
                "DEBT_SERVICE",
                "ENTERPRISE",
                "INTERNAL_SERVICE",
              ],
            },
            entityId: { type: "string", format: "uuid" },
            isActive: { type: "boolean" },
            budgetAuthority: { type: "number", format: "decimal" },
            carryForwardAllowed: { type: "boolean" },
          },
        },
        Account: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            accountCode: { type: "string" },
            accountName: { type: "string" },
            accountType: {
              type: "string",
              enum: ["ASSET", "LIABILITY", "NET_POSITION", "REVENUE", "EXPENSE"],
            },
            parentAccountId: { type: "string", format: "uuid" },
            fundId: { type: "string", format: "uuid" },
            entityId: { type: "string", format: "uuid" },
            isActive: { type: "boolean" },
            normalBalance: { type: "string", enum: ["DEBIT", "CREDIT"] },
            level: { type: "integer", minimum: 1, maximum: 10 },
            isDetailAccount: { type: "boolean" },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: { type: "object" },
            errors: { type: "array", items: { type: "string" } },
            timestamp: { type: "string", format: "date-time" },
          },
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

export const swaggerSpec = swaggerJSDoc(swaggerOptions)
