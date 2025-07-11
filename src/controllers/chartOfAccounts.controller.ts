import type { Request, Response, NextFunction } from "express"
import { BaseController } from "./base.controller"
import { ChartOfAccountsService } from "../services/chartOfAccounts.service"
import { AccountType } from "../types/ipsas.types"

export class ChartOfAccountsController extends BaseController {
  private chartOfAccountsService: ChartOfAccountsService

  constructor() {
    super()
    this.chartOfAccountsService = new ChartOfAccountsService()
  }

  getAccounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { entityId, fundId } = req.params
      const paginationOptions = this.getPaginationOptions(req)

      const result = await this.chartOfAccountsService.paginate(paginationOptions, {
        where: { entityId, fundId, isActive: true },
        include: ["entity", "fund", "parent"],
        order: [["accountCode", "ASC"]],
      })

      this.sendSuccess(res, result)
    } catch (error) {
      this.handleError(error, res, next)
    }
  }

  getAccountById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params

      const account = await this.chartOfAccountsService.findById(id, {
        include: ["entity", "fund", "parent", "children"],
      })

      if (!account) {
        this.sendNotFound(res, "Account")
        return
      }

      this.sendSuccess(res, account)
    } catch (error) {
      this.handleError(error, res, next)
    }
  }

  createAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const accountData = req.body
      const account = await this.chartOfAccountsService.createAccount(accountData)

      this.sendSuccess(res, account, "Account created successfully")
    } catch (error) {
      this.handleError(error, res, next)
    }
  }

  updateAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const updateData = req.body

      const account = await this.chartOfAccountsService.updateAccount(id, updateData)

      this.sendSuccess(res, account, "Account updated successfully")
    } catch (error) {
      this.handleError(error, res, next)
    }
  }

  deleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params

      const account = await this.chartOfAccountsService.deactivateAccount(id)

      this.sendSuccess(res, account, "Account deactivated successfully")
    } catch (error) {
      this.handleError(error, res, next)
    }
  }

  getAccountHierarchy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { entityId, fundId } = req.params

      const hierarchy = await this.chartOfAccountsService.getAccountHierarchy(entityId, fundId)

      this.sendSuccess(res, hierarchy)
    } catch (error) {
      this.handleError(error, res, next)
    }
  }

  getAccountsByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { entityId, fundId, accountType } = req.params

      if (!Object.values(AccountType).includes(accountType as AccountType)) {
        this.sendValidationError(res, ["Invalid account type"])
        return
      }

      const accounts = await this.chartOfAccountsService.getAccountsByType(entityId, fundId, accountType as AccountType)

      this.sendSuccess(res, accounts)
    } catch (error) {
      this.handleError(error, res, next)
    }
  }

  searchAccounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { entityId, fundId } = req.params
      const { q: searchTerm } = req.query

      if (!searchTerm || typeof searchTerm !== "string") {
        this.sendValidationError(res, ["Search term is required"])
        return
      }

      const accounts = await this.chartOfAccountsService.searchAccounts(entityId, fundId, searchTerm)

      this.sendSuccess(res, accounts)
    } catch (error) {
      this.handleError(error, res, next)
    }
  }
}
