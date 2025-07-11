import { Router } from "express"
import { BudgetController } from "../controllers/budget.controller"
import { authenticate, authorize } from "../middleware/auth.middleware"

const router = Router()
const controller = new BudgetController()

// Apply authentication to all routes
router.use(authenticate)

/**
 * @swagger
 * /api/v1/budgets:
 *   get:
 *     summary: Get budgets
 *     tags: [Budget]
 *     responses:
 *       200:
 *         description: List of budgets
 */
router.get("/", controller.getBudgets)

router.post("/", authorize(["CREATE_BUDGET"]), controller.createBudget)

router.put("/:id", authorize(["UPDATE_BUDGET"]), controller.updateBudget)

router.delete("/:id", authorize(["DELETE_BUDGET"]), controller.deleteBudget)

export default router
