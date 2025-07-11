export interface CreateAccountRequest {
  accountCode: string
  accountName: string
  accountType: string
  parentAccountId?: string
  fundId: string
  entityId: string
  description?: string
  isDetailAccount?: boolean
  budgetAccount?: boolean
}

export interface UpdateAccountRequest {
  accountName?: string
  description?: string
  isActive?: boolean
  parentAccountId?: string
}

export interface CreateJournalEntryRequest {
  transactionDate: string
  postingDate: string
  description: string
  referenceNumber?: string
  fundId: string
  entityId: string
  entries: CreateJournalEntryLineRequest[]
}

export interface CreateJournalEntryLineRequest {
  accountId: string
  debitAmount?: number
  creditAmount?: number
  description?: string
  costCenter?: string
  projectCode?: string
  departmentCode?: string
}

export interface SearchAccountsRequest {
  entityId: string
  fundId: string
  searchTerm: string
  accountType?: string
  isActive?: boolean
}

export interface GetTransactionsRequest {
  entityId: string
  fundId?: string
  startDate?: string
  endDate?: string
  status?: string
  page?: number
  limit?: number
}

export interface ApproveTransactionRequest {
  transactionId: string
  approvalComments?: string
}

export interface ReverseTransactionRequest {
  transactionId: string
  reason: string
  reversalDate?: string
}
