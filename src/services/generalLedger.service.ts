import { BaseService } from "./base.service"
import { GLTransaction, type GLTransactionCreationAttributes } from "../models/glTransaction.model"
import { GLEntry } from "../models/glEntry.model"
import { ChartOfAccounts } from "../models/chartOfAccounts.model"
import { TransactionStatus, type AccountType } from "../types/ipsas.types"
import { sequelize } from "../config/database"

export interface JournalEntryLineData {
  accountId: string
  debitAmount?: number
  creditAmount?: number
  description?: string
  costCenter?: string
  projectCode?: string
  departmentCode?: string
}

export interface JournalEntryData {
  transactionDate: Date
  postingDate: Date
  description: string
  referenceNumber?: string
  fundId: string
  entityId: string
  entries: JournalEntryLineData[]
  createdBy: string
}

export interface TrialBalanceEntry {
  accountId: string
  accountCode: string
  accountName: string
  accountType: AccountType
  debitBalance: number
  creditBalance: number
}

export interface TransactionSummary {
  totalTransactions: number
  totalDebit: number
  totalCredit: number
  averageTransactionAmount: number
  transactionsByStatus: Record<TransactionStatus, number>
}

export class GeneralLedgerService extends BaseService<GLTransaction, GLTransactionCreationAttributes> {
  constructor() {
    super(GLTransaction)
  }

  async createJournalEntry(data: JournalEntryData): Promise<GLTransaction> {
    return await sequelize.transaction(async (t) => {
      // Validate entries
      await this.validateJournalEntries(data.entries)

      // Calculate totals
      const totalDebit = data.entries.reduce((sum, entry) => sum + (entry.debitAmount || 0), 0)
      const totalCredit = data.entries.reduce((sum, entry) => sum + (entry.creditAmount || 0), 0)

      // Ensure transaction is balanced
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error("Journal entry is not balanced")
      }

      // Determine fiscal year and period
      const fiscalYear = data.transactionDate.getFullYear()
      const period = data.transactionDate.getMonth() + 1

      // Create transaction
      const transactionData: GLTransactionCreationAttributes = {
        transactionDate: data.transactionDate,
        postingDate: data.postingDate,
        description: data.description,
        referenceNumber: data.referenceNumber,
        sourceModule: "MANUAL",
        fundId: data.fundId,
        entityId: data.entityId,
        fiscalYear,
        period,
        status: TransactionStatus.DRAFT,
        createdBy: data.createdBy,
      }

      const transaction = await this.create(transactionData, { transaction: t })

      // Create entries
      const entries = await Promise.all(
        data.entries.map((entryData, index) =>
          GLEntry.create(
            {
              transactionId: transaction.id,
              accountId: entryData.accountId,
              debitAmount: entryData.debitAmount || 0,
              creditAmount: entryData.creditAmount || 0,
              description: entryData.description,
              lineNumber: index + 1,
              costCenter: entryData.costCenter,
              projectCode: entryData.projectCode,
              departmentCode: entryData.departmentCode,
            },
            { transaction: t },
          ),
        ),
      )

      // Load transaction with entries for return
      const completeTransaction = await GLTransaction.findByPk(transaction.id, {
        include: ["entries", "entity", "fund"],
        transaction: t,
      })

      return completeTransaction!
    })
  }

  async approveTransaction(id: string, approvedBy: string): Promise<GLTransaction> {
    return await sequelize.transaction(async (t) => {
      const transaction = await this.findById(id, { transaction: t })
      if (!transaction) {
        throw new Error("Transaction not found")
      }

      if (transaction.status !== TransactionStatus.DRAFT) {
        throw new Error("Only draft transactions can be approved")
      }

      if (!transaction.isBalanced()) {
        throw new Error("Cannot approve unbalanced transaction")
      }

      const [, updatedTransactions] = await this.update(
        id,
        {
          status: TransactionStatus.APPROVED,
          approvedBy,
        },
        { transaction: t },
      )

      return updatedTransactions[0]
    })
  }

  async postTransaction(id: string, postedBy: string): Promise<GLTransaction> {
    return await sequelize.transaction(async (t) => {
      const transaction = await this.findById(id, {
        include: ["entries", "entries.account"],
        transaction: t,
      })

      if (!transaction) {
        throw new Error("Transaction not found")
      }

      if (!transaction.canBePosted()) {
        throw new Error("Transaction cannot be posted")
      }

      // Validate all accounts exist and are active
      for (const entry of transaction.entries || []) {
        if (!entry.account?.isActive) {
          throw new Error(`Account ${entry.account?.accountCode} is not active`)
        }
      }

      const [, updatedTransactions] = await this.update(
        id,
        {
          status: TransactionStatus.POSTED,
          postedBy,
          postedAt: new Date(),
        },
        { transaction: t },
      )

      // Here you would typically update account balances
      // This would be implemented based on your balance tracking strategy

      return updatedTransactions[0]
    })
  }

  async reverseTransaction(id: string, reversedBy: string, reason: string): Promise<GLTransaction> {
    return await sequelize.transaction(async (t) => {
      const originalTransaction = await this.findById(id, {
        include: ["entries"],
        transaction: t,
      })

      if (!originalTransaction) {
        throw new Error("Transaction not found")
      }

      if (originalTransaction.status !== TransactionStatus.POSTED) {
        throw new Error("Only posted transactions can be reversed")
      }

      // Create reversal entries data
      const reversalEntriesData: JournalEntryLineData[] =
        originalTransaction.entries?.map((entry) => ({
          accountId: entry.accountId,
          debitAmount: entry.creditAmount, // Swap debit and credit
          creditAmount: entry.debitAmount,
          description: `Reversal: ${entry.description}`,
          costCenter: entry.costCenter,
          projectCode: entry.projectCode,
          departmentCode: entry.departmentCode,
        })) || []

      const reversalTransaction = await this.createJournalEntry({
        transactionDate: new Date(),
        postingDate: new Date(),
        description: `Reversal of ${originalTransaction.transactionNumber}: ${reason}`,
        referenceNumber: originalTransaction.transactionNumber,
        fundId: originalTransaction.fundId,
        entityId: originalTransaction.entityId,
        entries: reversalEntriesData,
        createdBy: reversedBy,
      })

      // Auto-approve and post the reversal
      await this.approveTransaction(reversalTransaction.id, reversedBy)
      await this.postTransaction(reversalTransaction.id, reversedBy)

      // Mark original transaction as reversed
      const [, updatedTransactions] = await this.update(
        id,
        {
          status: TransactionStatus.REVERSED,
          reversedBy,
          reversedAt: new Date(),
          reversalReason: reason,
        },
        { transaction: t },
      )

      return updatedTransactions[0]
    })
  }

  private async validateJournalEntries(entries: JournalEntryLineData[]): Promise<void> {
    if (!entries || entries.length === 0) {
      throw new Error("At least one journal entry is required")
    }

    if (entries.length < 2) {
      throw new Error("At least two journal entries are required")
    }

    // Validate each entry
    for (const entry of entries) {
      // Check that entry has either debit or credit, but not both
      if ((entry.debitAmount || 0) > 0 && (entry.creditAmount || 0) > 0) {
        throw new Error("Entry cannot have both debit and credit amounts")
      }

      if ((entry.debitAmount || 0) === 0 && (entry.creditAmount || 0) === 0) {
        throw new Error("Entry must have either debit or credit amount")
      }

      // Validate account exists and is active
      const account = await ChartOfAccounts.findByPk(entry.accountId)
      if (!account) {
        throw new Error(`Account not found: ${entry.accountId}`)
      }

      if (!account.isActive) {
        throw new Error(`Account is not active: ${account.accountCode}`)
      }

      if (!account.isDetailAccount) {
        throw new Error(`Cannot post to summary account: ${account.accountCode}`)
      }
    }

    // Check for duplicate accounts in the same transaction
    const accountIds = entries.map((e) => e.accountId)
    const uniqueAccountIds = new Set(accountIds)
    if (accountIds.length !== uniqueAccountIds.size) {
      throw new Error("Duplicate accounts found in transaction entries")
    }
  }
}
