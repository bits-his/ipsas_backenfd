import Joi from "joi"
import { AccountType, FundType, EntityType } from "../types/ipsas.types"

// Common validation schemas
export const uuidSchema = Joi.string().uuid().required()
export const optionalUuidSchema = Joi.string().uuid().optional()
export const dateSchema = Joi.date().required()
export const optionalDateSchema = Joi.date().optional()
export const amountSchema = Joi.number().precision(2).min(0).required()
export const optionalAmountSchema = Joi.number().precision(2).min(0).optional()

// Entity validation schemas
export const entityValidationSchema = Joi.object({
  entityCode: Joi.string().alphanum().min(2).max(20).required(),
  entityName: Joi.string().min(3).max(255).required(),
  entityType: Joi.string()
    .valid(...Object.values(EntityType))
    .required(),
  parentEntityId: optionalUuidSchema,
  fiscalYearEnd: Joi.string()
    .pattern(/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)
    .required()
    .messages({
      "string.pattern.base": "Fiscal year end must be in MM-DD format",
    }),
  currencyCode: Joi.string().length(3).uppercase().required(),
  isActive: Joi.boolean().optional().default(true),
  description: Joi.string().max(1000).optional(),
})

// Fund validation schemas
export const fundValidationSchema = Joi.object({
  fundCode: Joi.string().alphanum().min(2).max(20).required(),
  fundName: Joi.string().min(3).max(255).required(),
  fundType: Joi.string()
    .valid(...Object.values(FundType))
    .required(),
  entityId: uuidSchema,
  description: Joi.string().max(1000).optional(),
  isActive: Joi.boolean().optional().default(true),
  budgetAuthority: optionalAmountSchema,
  carryForwardAllowed: Joi.boolean().optional().default(false),
})

// Chart of Accounts validation schemas
export const accountValidationSchema = Joi.object({
  accountCode: Joi.string().alphanum().min(3).max(20).required(),
  accountName: Joi.string().min(3).max(255).required(),
  accountType: Joi.string()
    .valid(...Object.values(AccountType))
    .required(),
  parentAccountId: optionalUuidSchema,
  fundId: uuidSchema,
  entityId: uuidSchema,
  description: Joi.string().max(1000).optional(),
  normalBalance: Joi.string().valid("DEBIT", "CREDIT").optional(),
  level: Joi.number().integer().min(1).max(10).optional().default(1),
  isDetailAccount: Joi.boolean().optional().default(true),
  budgetAccount: Joi.boolean().optional().default(false),
  requiresFundAccounting: Joi.boolean().optional().default(true),
})

// Journal Entry validation schemas
export const journalEntryLineSchema = Joi.object({
  accountId: uuidSchema,
  debitAmount: optionalAmountSchema,
  creditAmount: optionalAmountSchema,
  description: Joi.string().max(500).optional(),
  costCenter: Joi.string().max(20).optional(),
  projectCode: Joi.string().max(20).optional(),
  departmentCode: Joi.string().max(20).optional(),
})
  .custom((value, helpers) => {
    const { debitAmount = 0, creditAmount = 0 } = value

    if (debitAmount > 0 && creditAmount > 0) {
      return helpers.error("custom.bothAmounts")
    }

    if (debitAmount === 0 && creditAmount === 0) {
      return helpers.error("custom.noAmount")
    }

    return value
  })
  .messages({
    "custom.bothAmounts": "Entry cannot have both debit and credit amounts",
    "custom.noAmount": "Entry must have either debit or credit amount",
  })

export const journalEntrySchema = Joi.object({
  transactionDate: dateSchema,
  postingDate: dateSchema,
  description: Joi.string().min(5).max(1000).required(),
  referenceNumber: Joi.string().max(100).optional(),
  fundId: uuidSchema,
  entityId: uuidSchema,
  entries: Joi.array().min(2).items(journalEntryLineSchema).required(),
})
  .custom((value, helpers) => {
    const { entries } = value
    const totalDebit = entries.reduce((sum: number, entry: any) => sum + (entry.debitAmount || 0), 0)
    const totalCredit = entries.reduce((sum: number, entry: any) => sum + (entry.creditAmount || 0), 0)

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return helpers.error("custom.unbalanced")
    }

    return value
  })
  .messages({
    "custom.unbalanced": "Journal entry must be balanced (total debits must equal total credits)",
  })

// Budget validation schemas
export const budgetValidationSchema = Joi.object({
  budgetCode: Joi.string().alphanum().min(3).max(50).required(),
  budgetName: Joi.string().min(3).max(255).required(),
  fiscalYear: Joi.number().integer().min(2000).max(2100).required(),
  startDate: dateSchema,
  endDate: dateSchema,
  entityId: uuidSchema,
  fundId: uuidSchema,
  totalBudgetAmount: amountSchema,
  description: Joi.string().max(1000).optional(),
})

// Revenue validation schemas
export const revenueValidationSchema = Joi.object({
  revenueCode: Joi.string().alphanum().min(3).max(50).required(),
  revenueName: Joi.string().min(3).max(255).required(),
  revenueType: Joi.string()
    .valid(
      "TAX",
      "NON_TAX",
      "INTERGOVERNMENTAL",
      "CHARGES_FOR_SERVICES",
      "FINES_AND_FORFEITURES",
      "INVESTMENT_INCOME",
      "OTHER",
    )
    .required(),
  entityId: uuidSchema,
  fundId: uuidSchema,
  accountId: uuidSchema,
  recognitionBasis: Joi.string().valid("CASH", "ACCRUAL", "MODIFIED_ACCRUAL").required(),
  fiscalYear: Joi.number().integer().min(2000).max(2100).required(),
  budgetedAmount: amountSchema,
  description: Joi.string().max(1000).optional(),
})

// Pagination validation schema
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  sortBy: Joi.string().optional().default("createdAt"),
  sortOrder: Joi.string().valid("ASC", "DESC").optional().default("DESC"),
})

// Search validation schema
export const searchSchema = Joi.object({
  q: Joi.string().min(1).max(100).required(),
  entityId: uuidSchema,
  fundId: optionalUuidSchema,
  accountType: Joi.string()
    .valid(...Object.values(AccountType))
    .optional(),
  isActive: Joi.boolean().optional(),
})

// Date range validation schema
export const dateRangeSchema = Joi.object({
  startDate: dateSchema,
  endDate: dateSchema,
})
  .custom((value, helpers) => {
    const { startDate, endDate } = value
    if (startDate >= endDate) {
      return helpers.error("custom.invalidDateRange")
    }
    return value
  })
  .messages({
    "custom.invalidDateRange": "Start date must be before end date",
  })

// Validation helper functions
export const validateEntity = (data: any) => entityValidationSchema.validate(data)
export const validateFund = (data: any) => fundValidationSchema.validate(data)
export const validateAccount = (data: any) => accountValidationSchema.validate(data)
export const validateJournalEntry = (data: any) => journalEntrySchema.validate(data)
export const validateBudget = (data: any) => budgetValidationSchema.validate(data)
export const validateRevenue = (data: any) => revenueValidationSchema.validate(data)
export const validatePagination = (data: any) => paginationSchema.validate(data)
export const validateSearch = (data: any) => searchSchema.validate(data)
export const validateDateRange = (data: any) => dateRangeSchema.validate(data)

// Custom validation functions
export const isValidFiscalYear = (year: number): boolean => {
  const currentYear = new Date().getFullYear()
  return year >= 2000 && year <= currentYear + 5
}

export const isValidAccountCode = (code: string, accountType: AccountType): boolean => {
  // Basic account code validation based on type
  const patterns = {
    [AccountType.ASSET]: /^1\d{3,}$/,
    [AccountType.LIABILITY]: /^2\d{3,}$/,
    [AccountType.NET_POSITION]: /^3\d{3,}$/,
    [AccountType.REVENUE]: /^4\d{3,}$/,
    [AccountType.EXPENSE]: /^[56]\d{3,}$/,
  }

  return patterns[accountType]?.test(code) || /^[A-Z0-9-]{3,20}$/.test(code)
}

export const isValidCurrencyCode = (code: string): boolean => {
  const validCurrencies = [
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "AUD",
    "CAD",
    "CHF",
    "CNY",
    "SEK",
    "NZD",
    "MXN",
    "SGD",
    "HKD",
    "NOK",
    "ZAR",
    "TRY",
    "BRL",
    "INR",
    "KRW",
    "RUB",
  ]
  return validCurrencies.includes(code.toUpperCase())
}

export const isValidFiscalYearEnd = (fiscalYearEnd: string): boolean => {
  const pattern = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
  if (!pattern.test(fiscalYearEnd)) return false

  const [month, day] = fiscalYearEnd.split("-").map(Number)
  const date = new Date(2024, month - 1, day) // Use leap year for validation
  return date.getMonth() === month - 1 && date.getDate() === day
}
