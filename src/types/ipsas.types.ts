export enum AccountType {
  ASSET = "ASSET",
  LIABILITY = "LIABILITY",
  NET_POSITION = "NET_POSITION",
  REVENUE = "REVENUE",
  EXPENSE = "EXPENSE",
}

export enum FundType {
  GENERAL = "GENERAL",
  SPECIAL_REVENUE = "SPECIAL_REVENUE",
  CAPITAL_PROJECTS = "CAPITAL_PROJECTS",
  DEBT_SERVICE = "DEBT_SERVICE",
  ENTERPRISE = "ENTERPRISE",
  INTERNAL_SERVICE = "INTERNAL_SERVICE",
}

export enum EntityType {
  GOVERNMENT = "GOVERNMENT",
  AGENCY = "AGENCY",
  DEPARTMENT = "DEPARTMENT",
  SUBSIDIARY = "SUBSIDIARY",
}

export enum TransactionStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  POSTED = "POSTED",
  REVERSED = "REVERSED",
}

export enum BudgetStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
}

export enum RevenueRecognitionBasis {
  CASH = "CASH",
  ACCRUAL = "ACCRUAL",
  MODIFIED_ACCRUAL = "MODIFIED_ACCRUAL",
}

// IPSAS-specific interfaces
export interface IPSASFinancialStatement {
  entityId: string
  fundId: string
  fiscalYear: number
  period: number
  statementType: "POSITION" | "PERFORMANCE" | "CASH_FLOW"
  preparationDate: Date
  approvedBy?: string
}

export interface BudgetVarianceAnalysis {
  budgetLineId: string
  originalAmount: number
  revisedAmount: number
  actualAmount: number
  variance: number
  variancePercentage: number
  explanation?: string
}

export interface AccrualEntry {
  id: string
  transactionId: string
  accrualDate: Date
  reversalDate?: Date
  amount: number
  description: string
  basis: RevenueRecognitionBasis
}
