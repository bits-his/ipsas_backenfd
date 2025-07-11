import { Router } from "express"
import { GeneralLedgerController } from "../controllers/generalLedger.controller"
import { validateJournalEntrySchema } from "../middleware/validation.middleware"
import { authenticate, authorize } from "../middleware/auth.middleware"

const router = Router()
const controller = new GeneralLedgerController()

// Apply authentication to all routes
router.use(authenticate)

/**
 * @swagger
 * /api/v1/entities/{entityId}/funds/{fundId}/transactions:
 *   get:
 *     summary: Get GL transactions
 *     tags: [General Ledger]
 *     parameters:
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: fundId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get("/entities/:entityId/funds/:fundId/transactions", controller.getTransactions)

router.get("/transactions/:id", controller.getTransactionById)

router.post(
  "/journal-entries",
  authorize(["CREATE_JOURNAL_ENTRY"]),
  validateJournalEntrySchema,
  controller.createJournalEntry,
)

router.put("/transactions/:id/approve", authorize(["APPROVE_TRANSACTION"]), controller.approveTransaction)

router.put("/transactions/:id/post", authorize(["POST_TRANSACTION"]), controller.postTransaction)

router.put("/transactions/:id/reverse", authorize(["REVERSE_TRANSACTION"]), controller.reverseTransaction)

export default router
