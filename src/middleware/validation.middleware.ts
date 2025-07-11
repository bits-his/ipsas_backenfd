import type { Request, Response, NextFunction } from "express"
import Joi from "joi"
import { AccountType, FundType, EntityType } from "../types/ipsas.types"

const chartOfAccountsSchema = Joi.object({
  accountCode: Joi.string().alphanum().min(3).max(20).required(),
  accountName: Joi.string().min(3).max(255).required(),
  accountType: Joi.string()
    .valid(...Object.values(AccountType))
    .required(),
  parentAccountId: Joi.string().uuid().optional(),
  fundId: Joi.string().uuid().required(),
  entityId: Joi.string().uuid().required(),
  description: Joi.string().max(1000).optional(),
  level: Joi.number().integer().min(1).max(10).optional(),
  isDetailAccount: Joi.boolean().optional(),
  budgetAccount: Joi.boolean().optional(),
  requiresFundAccounting: Joi.boolean().optional(),
})

const journalEntrySchema = Joi.object({
  transactionDate: Joi.date().required(),
  postingDate: Joi.date().required(),
  description: Joi.string().min(5).max(1000).required(),
  referenceNumber: Joi.string().max(100).optional(),
  fundId: Joi.string().uuid().required(),
  entityId: Joi.string().uuid().required(),
  entries: Joi.array()
    .min(2)
    .items(
      Joi.object({
        accountId: Joi.string().uuid().required(),
        debitAmount: Joi.number().precision(2).min(0).optional(),
        creditAmount: Joi.number().precision(2).min(0).optional(),
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
        }),
    )
    .required(),
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

const entitySchema = Joi.object({
  entityCode: Joi.string().min(2).max(20).required(),
  entityName: Joi.string().min(3).max(255).required(),
  entityType: Joi.string()
    .valid(...Object.values(EntityType))
    .required(),
  parentEntityId: Joi.string().uuid().optional(),
  fiscalYearEnd: Joi.string()
    .pattern(/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)
    .required(),
  currencyCode: Joi.string().length(3).uppercase().required(),
  isActive: Joi.boolean().optional(),
  description: Joi.string().max(1000).optional(),
})

const fundSchema = Joi.object({
  fundCode: Joi.string().min(2).max(20).required(),
  fundName: Joi.string().min(3).max(255).required(),
  fundType: Joi.string()
    .valid(...Object.values(FundType))
    .required(),
  entityId: Joi.string().uuid().required(),
  description: Joi.string().max(1000).optional(),
  isActive: Joi.boolean().optional(),
  budgetAuthority: Joi.number().precision(2).min(0).optional(),
  carryForwardAllowed: Joi.boolean().optional(),
})

export const validateChartOfAccountsSchema = (req: Request, res: Response, next: NextFunction) => {
  const { error } = chartOfAccountsSchema.validate(req.body)

  if (error) {
    const errors = error.details.map((detail) => detail.message)
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
      timestamp: new Date().toISOString(),
    })
  }

  next()
}

export const validateJournalEntrySchema = (req: Request, res: Response, next: NextFunction) => {
  const { error } = journalEntrySchema.validate(req.body)

  if (error) {
    const errors = error.details.map((detail) => detail.message)
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
      timestamp: new Date().toISOString(),
    })
  }

  next()
}

export const validateEntitySchema = (req: Request, res: Response, next: NextFunction) => {
  const { error } = entitySchema.validate(req.body)

  if (error) {
    const errors = error.details.map((detail) => detail.message)
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
      timestamp: new Date().toISOString(),
    })
  }

  next()
}

export const validateFundSchema = (req: Request, res: Response, next: NextFunction) => {
  const { error } = fundSchema.validate(req.body)

  if (error) {
    const errors = error.details.map((detail) => detail.message)
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
      timestamp: new Date().toISOString(),
    })
  }

  next()
}
