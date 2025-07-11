import { AccountType, FundType, TransactionStatus } from "../types/ipsas.types"

// Date helper functions
export const getCurrentFiscalYear = (fiscalYearEnd = "12-31"): number => {
  const today = new Date()
  const currentYear = today.getFullYear()
  const [month, day] = fiscalYearEnd.split("-").map(Number)
  const fiscalYearEndDate = new Date(currentYear, month - 1, day)

  return today <= fiscalYearEndDate ? currentYear : currentYear + 1
}

export const getFiscalPeriod = (date: Date, fiscalYearEnd = "12-31"): { fiscalYear: number; period: number } => {
  const [endMonth, endDay] = fiscalYearEnd.split("-").map(Number)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  let fiscalYear: number
  let period: number

  if (endMonth === 12 && endDay === 31) {
    // Calendar year
    fiscalYear = year
    period = month
  } else {
    // Non-calendar fiscal year
    const fiscalYearEndDate = new Date(year, endMonth - 1, endDay)
    if (date <= fiscalYearEndDate) {
      fiscalYear = year
      period = month <= endMonth ? month + (12 - endMonth) : month - endMonth
    } else {
      fiscalYear = year + 1
      period = month - endMonth
    }
  }

  return { fiscalYear, period: Math.max(1, Math.min(12, period)) }
}

export const formatDate = (date: Date, format = "YYYY-MM-DD"): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  switch (format) {
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`
    default:
      return `${year}-${month}-${day}`
  }
}

export const parseDate = (dateString: string): Date => {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateString}`)
  }
  return date
}

// Number formatting helpers
export const formatCurrency = (amount: number, currencyCode = "USD", locale = "en-US"): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatNumber = (number: number, decimals = 2): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number)
}

export const roundToTwoDecimals = (amount: number): number => {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

// String helpers
export const generateTransactionNumber = (prefix = "GL", fiscalYear?: number, period?: number): string => {
  const year = fiscalYear ? fiscalYear.toString().slice(-2) : new Date().getFullYear().toString().slice(-2)
  const per = period ? period.toString().padStart(2, "0") : (new Date().getMonth() + 1).toString().padStart(2, "0")
  const random = Math.random().toString(36).substr(2, 6).toUpperCase()
  const timestamp = Date.now().toString().slice(-4)
  return `${prefix}${year}${per}${random}${timestamp}`
}

export const generateAccountCode = (accountType: AccountType, sequence: number): string => {
  const prefixes = {
    [AccountType.ASSET]: "1",
    [AccountType.LIABILITY]: "2",
    [AccountType.NET_POSITION]: "3",
    [AccountType.REVENUE]: "4",
    [AccountType.EXPENSE]: "5",
  }

  const prefix = prefixes[accountType] || "9"
  return `${prefix}${sequence.toString().padStart(3, "0")}`
}

export const sanitizeString = (str: string): string => {
  return str
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s-]/gi, "")
}

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Validation helpers
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-$$$$]{10,}$/
  return phoneRegex.test(phone)
}

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Account helpers
export const getAccountTypeDescription = (accountType: AccountType): string => {
  const descriptions = {
    [AccountType.ASSET]: "Assets - Resources owned by the entity",
    [AccountType.LIABILITY]: "Liabilities - Obligations owed by the entity",
    [AccountType.NET_POSITION]: "Net Position - Residual interest in assets",
    [AccountType.REVENUE]: "Revenue - Inflows of economic benefits",
    [AccountType.EXPENSE]: "Expenses - Outflows of economic benefits",
  }
  return descriptions[accountType] || "Unknown account type"
}

export const getFundTypeDescription = (fundType: FundType): string => {
  const descriptions = {
    [FundType.GENERAL]: "General Fund - Primary operating fund",
    [FundType.SPECIAL_REVENUE]: "Special Revenue Fund - Specific revenue sources",
    [FundType.CAPITAL_PROJECTS]: "Capital Projects Fund - Major capital acquisitions",
    [FundType.DEBT_SERVICE]: "Debt Service Fund - Debt principal and interest payments",
    [FundType.ENTERPRISE]: "Enterprise Fund - Business-type activities",
    [FundType.INTERNAL_SERVICE]: "Internal Service Fund - Services to other departments",
  }
  return descriptions[fundType] || "Unknown fund type"
}

export const getTransactionStatusDescription = (status: TransactionStatus): string => {
  const descriptions = {
    [TransactionStatus.DRAFT]: "Draft - Transaction is being prepared",
    [TransactionStatus.PENDING]: "Pending - Transaction awaiting approval",
    [TransactionStatus.APPROVED]: "Approved - Transaction has been approved",
    [TransactionStatus.POSTED]: "Posted - Transaction has been posted to ledger",
    [TransactionStatus.REVERSED]: "Reversed - Transaction has been reversed",
  }
  return descriptions[status] || "Unknown status"
}

// Calculation helpers
export const calculatePercentage = (part: number, whole: number): number => {
  if (whole === 0) return 0
  return roundToTwoDecimals((part / whole) * 100)
}

export const calculateVariance = (actual: number, budget: number): { amount: number; percentage: number } => {
  const amount = roundToTwoDecimals(actual - budget)
  const percentage = budget === 0 ? 0 : calculatePercentage(amount, budget)
  return { amount, percentage }
}

export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return calculatePercentage(current - previous, previous)
}

// Array helpers\
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {\
  return array.reduce((groups, item) => {\
    const group = String(item[key])
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups\
  }, {} as Record<string, T[]>)
}

export const sortBy = <T>(array: T[], key: keyof T, order: "asc" | "desc" = "asc"): T[] => {\
  return [...array].sort((a, b) => {\
    const aVal = a[key]
    const bVal = b[key]
\
    if (aVal < bVal) return order === "asc" ? -1 : 1
    if (aVal > bVal) return order === "asc" ? 1 : -1
    return 0
  })
}

export const unique = <T>(array: T[]): T[] => {\
  return [...new Set(array)]
}

// Object helpers\
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]\
): Omit<T, K> => {\
  const result = { ...obj }
  keys.forEach(key => delete result[key])
  return result
}
\
export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]\
): Pick<T, K> => {\
  const result = {} as Pick<T, K>
  keys.forEach(key => {\
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

// Error helpers\
export const createError = (message: string, statusCode = 400, code?: string): Error & { statusCode?: number; code?: string } => {\
  const error = new Error(message) as Error & { statusCode?: number; code?: string }
  error.statusCode = statusCode
  error.code = code
  return error
}

export const isOperationalError = (error: any): boolean => {\
  return error.isOperational === true
}

// Async helpers
export const delay = (ms: number): Promise<void> => {\
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> => {\
  let lastError: Error
\
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {\
    try {\
      return await fn()
    } catch (error) {
      lastError = error as Error\
      if (attempt === maxAttempts) break
      await delay(delayMs * attempt)
    }
  }

  throw lastError!
}\
