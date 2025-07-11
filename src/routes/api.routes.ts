import { Router } from "express"
import chartOfAccountsRoutes from "./chartOfAccounts.routes"
import generalLedgerRoutes from "./generalLedger.routes"
import budgetRoutes from "./budget.routes"

const router = Router()

// Mount route modules
router.use("/accounts", chartOfAccountsRoutes)
router.use("/gl", generalLedgerRoutes)
router.use("/budgets", budgetRoutes)

export default router
