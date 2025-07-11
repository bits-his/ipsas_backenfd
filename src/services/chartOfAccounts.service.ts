import { Op, type Transaction } from "sequelize"
import { BaseService } from "./base.service"
import { ChartOfAccounts, type ChartOfAccountsCreationAttributes } from "../models/chartOfAccounts.model"
import { AccountType } from "../types/ipsas.types"

export interface AccountHierarchy {
  account: ChartOfAccounts
  children: AccountHierarchy[]
  level: number
}

export interface AccountBalance {
  accountId: string
  accountCode: string
  accountName: string
  debitBalance: number
  creditBalance: number
  netBalance: number
  lastUpdated: Date
}

export class ChartOfAccountsService extends BaseService<ChartOfAccounts, ChartOfAccountsCreationAttributes> {
  constructor() {
    super(ChartOfAccounts)
  }

  async createAccount(data: ChartOfAccountsCreationAttributes, transaction?: Transaction): Promise<ChartOfAccounts> {
    // Validate account code uniqueness within fund and entity
    await this.validateAccountCode(data.accountCode, data.fundId, data.entityId)

    // Set account level based on parent
    if (data.parentAccountId) {
      const parent = await this.findById(data.parentAccountId)
      if (!parent) {
        throw new Error("Parent account not found")
      }
      data.level = parent.level + 1
    }

    // Determine normal balance if not provided
    if (!data.normalBalance) {
      data.normalBalance = this.determineNormalBalance(data.accountType)
    }

    return await this.create(data, { transaction })
  }

  async updateAccount(
    id: string,
    data: Partial<ChartOfAccountsCreationAttributes>,
    transaction?: Transaction,
  ): Promise<ChartOfAccounts> {
    const account = await this.findById(id)
    if (!account) {
      throw new Error("Account not found")
    }

    // Validate account code if being changed
    if (data.accountCode && data.accountCode !== account.accountCode) {
      await this.validateAccountCode(data.accountCode, account.fundId, account.entityId, id)
    }

    const [, updatedAccounts] = await this.update(id, data, transaction ? { transaction } : undefined)
    return updatedAccounts[0]
  }

  async deactivateAccount(id: string, transaction?: Transaction): Promise<ChartOfAccounts> {
    const account = await this.findById(id)
    if (!account) {
      throw new Error("Account not found")
    }

    // Check if account has children
    const children = await this.findAll({
      where: { parentAccountId: id, isActive: true },
    })

    if (children.length > 0) {
      throw new Error("Cannot deactivate account with active child accounts")
    }

    // Check if account has recent transactions (this would need GL integration)
    // For now, we'll just deactivate
    const [, updatedAccounts] = await this.update(id, { isActive: false }, transaction ? { transaction } : undefined)
    return updatedAccounts[0]
  }

  async getAccountHierarchy(entityId: string, fundId: string): Promise<AccountHierarchy[]> {
    const accounts = await this.findAll({
      where: { entityId, fundId, isActive: true },
      order: [["accountCode", "ASC"]],
    })

    const rootAccounts = accounts.filter((account) => !account.parentAccountId)
    return this.buildHierarchy(rootAccounts, accounts)
  }

  async getAccountsByType(entityId: string, fundId: string, accountType: AccountType): Promise<ChartOfAccounts[]> {
    return await this.findAll({
      where: { entityId, fundId, accountType, isActive: true },
      order: [["accountCode", "ASC"]],
    })
  }

  async getDetailAccounts(entityId: string, fundId: string): Promise<ChartOfAccounts[]> {
    return await this.findAll({
      where: { entityId, fundId, isDetailAccount: true, isActive: true },
      order: [["accountCode", "ASC"]],
    })
  }

  async searchAccounts(entityId: string, fundId: string, searchTerm: string): Promise<ChartOfAccounts[]> {
    return await this.findAll({
      where: {
        entityId,
        fundId,
        isActive: true,
        [Op.or]: [
          { accountCode: { [Op.iLike]: `%${searchTerm}%` } },
          { accountName: { [Op.iLike]: `%${searchTerm}%` } },
        ],
      },
      order: [["accountCode", "ASC"]],
      limit: 50,
    })
  }

  async getAccountBalances(entityId: string, fundId: string, asOfDate?: Date): Promise<AccountBalance[]> {
    // This would integrate with GL entries to calculate balances
    // For now, returning a mock structure
    const accounts = await this.getDetailAccounts(entityId, fundId)

    return accounts.map((account) => ({
      accountId: account.id,
      accountCode: account.accountCode,
      accountName: account.accountName,
      debitBalance: 0, // Would be calculated from GL entries
      creditBalance: 0, // Would be calculated from GL entries
      netBalance: 0, // Would be calculated from GL entries
      lastUpdated: new Date(),
    }))
  }

  private async validateAccountCode(
    accountCode: string,
    fundId: string,
    entityId: string,
    excludeId?: string,
  ): Promise<void> {
    const where: any = { accountCode, fundId, entityId }
    if (excludeId) {
      where.id = { [Op.ne]: excludeId }
    }

    const existingAccount = await this.findOne({ where })
    if (existingAccount) {
      throw new Error(`Account code ${accountCode} already exists in this fund`)
    }
  }

  private determineNormalBalance(accountType: AccountType): "DEBIT" | "CREDIT" {
    switch (accountType) {
      case AccountType.ASSET:
      case AccountType.EXPENSE:
        return "DEBIT"
      case AccountType.LIABILITY:
      case AccountType.NET_POSITION:
      case AccountType.REVENUE:
        return "CREDIT"
      default:
        return "DEBIT"
    }
  }

  private buildHierarchy(rootAccounts: ChartOfAccounts[], allAccounts: ChartOfAccounts[]): AccountHierarchy[] {
    return rootAccounts.map((account) => ({
      account,
      children: this.buildHierarchy(
        allAccounts.filter((a) => a.parentAccountId === account.id),
        allAccounts,
      ),
      level: account.level,
    }))
  }

  private async hasCircularReference(account: ChartOfAccounts, visited: Set<string> = new Set()): Promise<boolean> {
    if (visited.has(account.id)) {
      return true
    }

    if (!account.parentAccountId) {
      return false
    }

    visited.add(account.id)
    const parent = await this.findById(account.parentAccountId)

    if (!parent) {
      return false
    }

    return await this.hasCircularReference(parent, visited)
  }

  private isValidAccountCode(accountCode: string): boolean {
    // Basic validation - can be enhanced based on organization standards
    return /^[A-Z0-9-]+$/.test(accountCode) && accountCode.length >= 3
  }
}
