import { Router } from "express"
import { ChartOfAccountsController } from "../controllers/chartOfAccounts.controller"
import { validateChartOfAccountsSchema } from "../middleware/validation.middleware"
import { authenticate, authorize } from "../middleware/auth.middleware"

const router = Router()
const controller = new ChartOfAccountsController()

// Apply authentication to all routes
router.use(authenticate)

/**
 * @swagger
 * /api/v1/entities/{entityId}/funds/{fundId}/accounts:
 *   get:
 *     summary: Get chart of accounts
 *     tags: [Chart of Accounts]
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
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of accounts
 */
router.get("/entities/:entityId/funds/:fundId/accounts", controller.getAccounts)

/**
 * @swagger
 * /api/v1/accounts/{id}:
 *   get:
 *     summary: Get account by ID
 *     tags: [Chart of Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Account details
 *       404:
 *         description: Account not found
 */
router.get("/accounts/:id", controller.getAccountById)

/**
 * @swagger
 * /api/v1/accounts:
 *   post:
 *     summary: Create new account
 *     tags: [Chart of Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Account'
 *     responses:
 *       200:
 *         description: Account created successfully
 */
router.post("/accounts", authorize(["CREATE_ACCOUNT"]), validateChartOfAccountsSchema, controller.createAccount)

router.put("/accounts/:id", authorize(["UPDATE_ACCOUNT"]), validateChartOfAccountsSchema, controller.updateAccount)

router.delete("/accounts/:id", authorize(["DELETE_ACCOUNT"]), controller.deleteAccount)

// Specialized routes
router.get("/entities/:entityId/funds/:fundId/accounts/hierarchy", controller.getAccountHierarchy)
router.get("/entities/:entityId/funds/:fundId/accounts/type/:accountType", controller.getAccountsByType)
router.get("/entities/:entityId/funds/:fundId/accounts/search", controller.searchAccounts)

export default router
