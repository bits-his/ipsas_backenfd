import type { QueryInterface } from "sequelize"
import { v4 as uuidv4 } from "uuid"

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  // Get existing entities and funds
  const entities = (await queryInterface.sequelize.query(
    "SELECT id, entity_code FROM entities WHERE entity_code IN ('GOV001', 'AGY001')",
    { type: queryInterface.sequelize.QueryTypes.SELECT },
  )) as any[]

  const funds = (await queryInterface.sequelize.query("SELECT id, fund_code FROM funds WHERE fund_code = 'GF001'", {
    type: queryInterface.sequelize.QueryTypes.SELECT,
  })) as any[]

  if (entities.length === 0 || funds.length === 0) {
    throw new Error("Required entities and funds not found. Please run previous seeders first.")
  }

  const centralGovId = entities.find((e) => e.entity_code === "GOV001")?.id
  const financeMinistryId = entities.find((e) => e.entity_code === "AGY001")?.id
  const generalFundId = funds[0].id

  // Get some accounts for sample transactions
  const accounts = (await queryInterface.sequelize.query(
    "SELECT id, account_code FROM chart_of_accounts WHERE account_code IN ('1110', '4100', '5100', '2110')",
    { type: queryInterface.sequelize.QueryTypes.SELECT },
  )) as any[]

  const accountMap = new Map(accounts.map((acc) => [acc.account_code, acc.id]))

  // Create sample budget
  const budgetId = uuidv4()
  await queryInterface.bulkInsert("budgets", [
    {
      id: budgetId,
      budget_code: "BUD2024001",
      budget_name: "FY 2024 General Fund Budget",
      fiscal_year: 2024,
      start_date: new Date("2024-01-01"),
      end_date: new Date("2024-12-31"),
      entity_id: centralGovId,
      fund_id: generalFundId,
      status: "APPROVED",
      total_budget_amount: 5000000.0,
      approved_by: uuidv4(), // Mock user ID
      approved_at: new Date(),
      description: "Annual budget for general government operations",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ])

  // Create sample budget lines
  const budgetLines = [
    {
      id: uuidv4(),
      budget_id: budgetId,
      account_id: accountMap.get("4100"), // Tax Revenue
      line_number: 1,
      description: "Property Tax Revenue",
      original_amount: 2000000.0,
      revised_amount: 2000000.0,
      actual_amount: 1800000.0,
      encumbered_amount: 0.0,
      available_amount: 200000.0,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      budget_id: budgetId,
      account_id: accountMap.get("5100"), // Personnel Services
      line_number: 2,
      description: "Salaries and Benefits",
      original_amount: 1500000.0,
      revised_amount: 1600000.0,
      actual_amount: 1400000.0,
      encumbered_amount: 100000.0,
      available_amount: 100000.0,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]

  await queryInterface.bulkInsert("budget_lines", budgetLines)

  // Create sample revenue records
  const revenues = [
    {
      id: uuidv4(),
      revenue_code: "REV2024001",
      revenue_name: "Property Tax",
      revenue_type: "TAX",
      entity_id: centralGovId,
      fund_id: generalFundId,
      account_id: accountMap.get("4100"),
      recognition_basis: "ACCRUAL",
      fiscal_year: 2024,
      budgeted_amount: 2000000.0,
      actual_amount: 1800000.0,
      collected_amount: 1600000.0,
      outstanding_amount: 200000.0,
      description: "Annual property tax collection",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      revenue_code: "REV2024002",
      revenue_name: "Business License Fees",
      revenue_type: "NON_TAX",
      entity_id: centralGovId,
      fund_id: generalFundId,
      account_id: accountMap.get("4200"),
      recognition_basis: "CASH",
      fiscal_year: 2024,
      budgeted_amount: 500000.0,
      actual_amount: 450000.0,
      collected_amount: 450000.0,
      outstanding_amount: 0.0,
      description: "Business licensing and permit fees",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]

  await queryInterface.bulkInsert("revenues", revenues)

  // Create sample GL transactions
  const transaction1Id = uuidv4()
  const transaction2Id = uuidv4()

  const transactions = [
    {
      id: transaction1Id,
      transaction_number: "GL202400001",
      transaction_date: new Date("2024-01-15"),
      posting_date: new Date("2024-01-15"),
      description: "Property tax collection - January 2024",
      reference_number: "TAX-2024-001",
      source_module: "REVENUE",
      source_document_id: null,
      fund_id: generalFundId,
      entity_id: centralGovId,
      fiscal_year: 2024,
      period: 1,
      status: "POSTED",
      total_debit: 150000.0,
      total_credit: 150000.0,
      created_by: uuidv4(), // Mock user ID
      approved_by: uuidv4(), // Mock user ID
      posted_by: uuidv4(), // Mock user ID
      posted_at: new Date("2024-01-15"),
      reversed_by: null,
      reversed_at: null,
      reversal_reason: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: transaction2Id,
      transaction_number: "GL202400002",
      transaction_date: new Date("2024-01-31"),
      posting_date: new Date("2024-01-31"),
      description: "Payroll expenses - January 2024",
      reference_number: "PAY-2024-001",
      source_module: "EXPENDITURE",
      source_document_id: null,
      fund_id: generalFundId,
      entity_id: centralGovId,
      fiscal_year: 2024,
      period: 1,
      status: "POSTED",
      total_debit: 120000.0,
      total_credit: 120000.0,
      created_by: uuidv4(), // Mock user ID
      approved_by: uuidv4(), // Mock user ID
      posted_by: uuidv4(), // Mock user ID
      posted_at: new Date("2024-01-31"),
      reversed_by: null,
      reversed_at: null,
      reversal_reason: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]

  await queryInterface.bulkInsert("gl_transactions", transactions)

  // Create sample GL entries
  const entries = [
    // Transaction 1 entries (Tax collection)
    {
      id: uuidv4(),
      transaction_id: transaction1Id,
      account_id: accountMap.get("1110"), // Cash
      debit_amount: 150000.0,
      credit_amount: 0.0,
      description: "Cash received from property tax",
      line_number: 1,
      cost_center: "CC001",
      project_code: null,
      department_code: "DEPT001",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      transaction_id: transaction1Id,
      account_id: accountMap.get("4100"), // Tax Revenue
      debit_amount: 0.0,
      credit_amount: 150000.0,
      description: "Property tax revenue recognized",
      line_number: 2,
      cost_center: "CC001",
      project_code: null,
      department_code: "DEPT001",
      created_at: new Date(),
      updated_at: new Date(),
    },
    // Transaction 2 entries (Payroll)
    {
      id: uuidv4(),
      transaction_id: transaction2Id,
      account_id: accountMap.get("5100"), // Personnel Services
      debit_amount: 120000.0,
      credit_amount: 0.0,
      description: "Payroll expenses for January",
      line_number: 1,
      cost_center: "CC002",
      project_code: null,
      department_code: "DEPT001",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      transaction_id: transaction2Id,
      account_id: accountMap.get("2110"), // Accounts Payable
      debit_amount: 0.0,
      credit_amount: 120000.0,
      description: "Payroll liability",
      line_number: 2,
      cost_center: "CC002",
      project_code: null,
      department_code: "DEPT001",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]

  await queryInterface.bulkInsert("gl_entries", entries)
}

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.bulkDelete("gl_entries", {}, {})
  await queryInterface.bulkDelete("gl_transactions", {}, {})
  await queryInterface.bulkDelete("revenues", {}, {})
  await queryInterface.bulkDelete("budget_lines", {}, {})
  await queryInterface.bulkDelete("budgets", {}, {})
}
