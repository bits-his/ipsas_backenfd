import type { Request, Response, NextFunction } from "express"
import { BaseController } from "./base.controller"
import { GeneralLedgerService } from "../services/generalLedger.service"

export class GeneralLedgerController extends BaseController {
  private glService: GeneralLedgerService

  constructor() {
    super()
    this.glService = new GeneralLedgerService()
  }

  getTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { entityId, fundId } = req.params
      const paginationOptions = this.getPaginationOptions(req)

      const where: any = { entityId }
      if (fundId && fundId !== "all") {
        where.fundId = fundId
      }

      const result = await this.glService.paginate(paginationOptions, {
        where,
        include: ["entity", "fund", "entries"],
        order: [
          ["transactionDate", "DESC"],
          ["transactionNumber", "DESC"],
        ],
      })

      this.sendSuccess(res, result)
    } catch (error) {
      this.handleError(error, res, next)
    }
  }

  getTransactionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params

      const transaction = await this.glService.findById(id, {
        include: [
          "entity",
          "fund",
          {
            association: "entries",
            include: ["account"],
          },
        ],
      })

      if (!transaction) {
        this.sendNotFound(res, "Transaction")
        return
      }

      this.sendSuccess(res, transaction)
    } catch (error) {
      this.handleError(error, res, next)
    }
  }

  createJournalEntry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const journalData = {
        ...req.body,
        createdBy: req.user?.userId,
      }

      const transaction = await this.glService.createJournalEntry(journalData)

      this.sendSuccess(res, transaction, "Journal entry created successfully")
    } catch (error) {
      this.handleError(error, res, next)
    }
  }

  approveTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const approvedBy = req.user?.userId

      if (!approvedBy) {
        this.sendError(res, "User context not found", 401)
        return
      }

      const transaction = await this.glService.approveTransaction(id, approvedBy)

      this.sendSuccess(res, transaction, "Transaction approved successfully")
    } catch (error) {
      this.handleError(error, res, next)
    }
  }

  postTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const postedBy = req.user?.userId

      if (!postedBy) {
        this.sendError(res, "User context not found", 401)
        return
      }

      const transaction = await this.glService.postTransaction(id, postedBy)

      this.sendSuccess(res, transaction, "Transaction posted successfully")
    } catch (error) {
      this.handleError(error, res, next)
    }
  }

  reverseTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const { reason } = req.body
      const reversedBy = req.user?.userId

      if (!reversedBy) {
        this.sendError(res, "User context not found", 401)
        return
      }

      if (!reason) {
        this.sendValidationError(res, ["Reversal reason is required"])
        return
      }

      const transaction = await this.glService.reverseTransaction(id, reversedBy, reason)

      this.sendSuccess(res, transaction, "Transaction reversed successfully")
    } catch (error) {
      this.handleError(error, res, next)
    }
  }
}
