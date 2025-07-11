export interface TrialBalanceEntry {
  accountId: string
  accountCode: string
  accountName: string
  accountType: string
  debitBalance: number
  creditBalance: number
  netBalance: number
}

export interface FinancialStatement {
  entityId: string
  fundId: string
  statementType: "BALANCE_SHEET" | "INCOME_STATEMENT" | "CASH_FLOW"
  fiscalYear: number
  period: number
  lineItems: FinancialStatementLineItem[]
  totalAssets?: number
  totalLiabilities?: number
  netPosition?: number
  totalRevenues?: number
  totalExpenses?: number
  netIncome?: number
}

export interface FinancialStatementLineItem {
  accountId: string
  accountCode: string
  accountName: string
  amount: number
  parentLineId?: string
  level: number
  isSubtotal: boolean
}

export interface JournalEntry {
  transactionId: string
  transactionNumber: string
  transactionDate: Date
  description: string
  entries: JournalEntryLine[]
  totalDebit: number
  totalCredit: number
  status: string
}

export interface JournalEntryLine {
  accountId: string
  accountCode: string
  accountName: string
  debitAmount: number
  creditAmount: number
  description?: string
}

export interface AccountBalance {
  accountId: string
  accountCode: string
  accountName: string
  beginningBalance: number
  debitTotal: number
  creditTotal: number
  endingBalance: number
  asOfDate: Date
}
