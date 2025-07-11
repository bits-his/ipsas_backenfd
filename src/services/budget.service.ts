import { BaseService } from "./base.service"
import { Budget, type BudgetCreationAttributes } from "../models/budget.model"

export class BudgetService extends BaseService<Budget, BudgetCreationAttributes> {
  constructor() {
    super(Budget)
  }

  // TODO: Implement budget-specific service methods
  async createBudget(data: BudgetCreationAttributes): Promise<Budget> {
    return await this.create(data)
  }

  async getBudgetsByFiscalYear(entityId: string, fiscalYear: number): Promise<Budget[]> {
    return await this.findAll({
      where: { entityId, fiscalYear },
      include: ["entity", "fund", "budgetLines"],
      order: [["budgetCode", "ASC"]],
    })
  }
}
