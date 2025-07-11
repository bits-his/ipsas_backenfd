import type { QueryInterface } from "sequelize"
import { v4 as uuidv4 } from "uuid"

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  // First, get the entity and fund IDs
  const entities = (await queryInterface.sequelize.query(
    "SELECT id, entity_code FROM entities WHERE entity_code = 'GOV001'",
    { type: queryInterface.sequelize.QueryTypes.SELECT },
  )) as any[]

  if (entities.length === 0) {
    throw new Error("Central Government entity not found. Please run entity seeders first.")
  }

  const entityId = entities[0].id

  // Create a general fund first
  const generalFundId = uuidv4()
  await queryInterface.bulkInsert("funds", [
    {
      id: generalFundId,
      fund_code: "GF001",
      fund_name: "General Fund",
      fund_type: "GENERAL",
      entity_id: entityId,
      description: "Primary operating fund for general government activities",
      is_active: true,
      budget_authority: 10000000.0,
      carry_forward_allowed: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ])

  // Standard Chart of Accounts based on IPSAS
  const accounts = [
    // ASSETS (1000-1999)
    {
      id: uuidv4(),
      account_code: "1000",
      account_name: "ASSETS",
      account_type: "ASSET",
      parent_account_id: null,
      fund_id: generalFundId,
      entity_id: entityId,
      is_active: true,
      description: "Total Assets",
      normal_balance: "DEBIT",
      level: 1,
      is_detail_account: false,
      budget_account: false,
      requires_fund_accounting: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      account_code: "1100",
      account_name: "Current Assets",
      account_type: "ASSET",
      parent_account_id: null, // Will be set to Assets parent
      fund_id: generalFundId,
      entity_id: entityId,
      is_active: true,
      description: "Current Assets - Assets expected to be converted to cash within one year",
      normal_balance: "DEBIT",
      level: 2,
      is_detail_account: false,
      budget_account: false,
      requires_fund_accounting: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      account_code: "1110",
      account_name: "Cash and Cash Equivalents",
      account_type: "ASSET",
      parent_account_id: null, // Will be set to Current Assets
      fund_id: generalFundId,
      entity_id: entityId,
      is_active: true,
      description: "Cash on hand and in banks, short-term investments",
      normal_balance: "DEBIT",
      level: 3,
      is_detail_account: true,
      budget_account: false,
      requires_fund_accounting: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      account_code: "1120",
      account_name: "Accounts Receivable",
      account_type: "ASSET",
      parent_account_id: null, // Will be set to Current Assets
      fund_id: generalFundId,
      entity_id: entityId,
      is_active: true,
      description: "Amounts owed to the entity by external parties",
      normal_balance: "DEBIT",
      level: 3,
      is_detail_account: true,
      budget_account: false,
      requires_fund_accounting: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      account_code: "1130",
      account_name: "Tax Receivables",
      account_type: "ASSET",
      parent_account_id: null, // Will be set to Current Assets
      fund_id: generalFundId,
      entity_id: entityId,
      is_active: true,
      description: "Taxes assessed but not yet collected",
      normal_balance: "DEBIT",
      level: 3,
      is_detail_account: true,
      budget_account: false,
      requires_fund_accounting: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      account_code: "1200",
      account_name: "Non-Current Assets",
      account_type: "ASSET",
      parent_account_id: null, // Will be set to Assets parent
      fund_id: generalFundId,
      entity_id: entityId,
      is_active: true,
      description: "Non-Current Assets - Long-term assets",
      normal_balance: "DEBIT",
      level: 2,
      is_detail_account: false,
      budget_account: false,
      requires_fund_accounting: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      account_code: "1210",
      account_name: "Property, Plant and Equipment",
      account_type: "ASSET",
      parent_account_id: null, // Will be set to Non-Current Assets
      fund_id: generalFundId,
      entity_id: entityId,
      is_active: true,
      description: "Land, buildings, equipment, and other fixed assets",
      normal_balance: "DEBIT",
      level: 3,
      is_detail_account: true,
      budget_account: false,
      requires_fund_accounting: true,
      created_at: new Date(),
      updated_at: new Date(),
    },

    // LIABILITIES (2000-2999)
    {
      id: uuidv4(),
      account_code: "2000",
      account_name: "LIABILITIES",
      account_type: "LIABILITY",
      parent_account_id: null,
      fund_id: generalFundId,
      entity_id: entityId,
      is_active: true,
      description: "Total Liabilities",
      normal_balance: "CREDIT",
      level: 1,
      is_detail_account: false,
      budget_account: false,
      requires_fund_accounting: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      account_code: "2100",
      account_name: "Current Liabilities",
      account_type: "LIABILITY",
      parent_account_id: null, // Will be set to Liabilities parent
      fund_id: generalFundId,
      entity_id: entityId,
      is_active: true,
      description: "Current Liabilities - Obligations due within one year",
      normal_balance: "CREDIT",
      level: 2,
      is_detail_account: false,
      budget_account: false,
      requires_fund_accounting: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      account_code: "2110",
      account_name: "Accounts Payable",
      account_type: "LIABILITY",
      parent_account_id: null, // Will be set to Current Liabilities
      fund_id: generalFundId,
      entity_id: entityId,
      is_active: true,
      description: "Amounts owed to suppliers and vendors",
      normal_balance: "CREDIT",
      level: 3,
      is_detail_account: true,
      budget_account: false,
      requires_fund_accounting: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      account_code: "2120",
      account_name: "Accrued Liabilities",
      account_type: "LIABILITY",
      parent_account_id: null, // Will be set to Current Liabilities
      fund_id: generalFundId,
      entity_id: entityId,
      is_active: true,
      description: "Expenses incurred but not yet paid",
      normal_balance: "CREDIT",
      level: 3,
      is_detail_account: true,
      budget_account: false,
      requires_fund_accounting: true,
      created_at: new Date(),
      updated_at: new Date(),
    },

    // NET POSITION (3000-3999)
    {
      id: uuidv4(),
      account_code: "3000",
      account_name: "NET POSITION",
      account_type: "NET_POSITION",
      parent_account_id: null,
      fund_id: generalFundId,
      entity_id: entityId,
      is_active: true,
      description: "Total Net Position",
      normal_balance: "CREDIT",
      level: 1,
      is_detail_account: false,
      budget_account: false,
      requires_fund_accounting: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      account_code: "3100",
      account_name: "Net Investment in Capital Assets",
      account_type: "NET_POSITION",
      parent_account_id: null, // Will be set to Net Position parent
      fund_id: generalFundId,
      entity_id: entityId,
      is_active: true,
      description: "Investment in capital assets, net of related debt",
      normal_balance: "CREDIT",
      level: 2,
      is_detail_account: true,
      budget_account: false,
      requires_fund_accounting: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      account_code: "3200",
      account_name: "Restricted Net Position",
      account_type: "NET_POSITION",
      parent_account_id: null, // Will be set to Net Position parent
      fund_id: generalFundId,
      entity_id: entityId,
      is_active: true,
      description: "Net position with external restrictions",
      normal_balance: "CREDIT",
      level: 2,
      is_detail_account: true,
      budget_account: false,
      requires_fund_accounting: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      account_code: "3300",
      account_name: "Unrestricted Net Position",
      account_type: "NET_POSITION",
      parent_account_id: null, // Will be set to Net Position parent
      fund_id: generalFundId,
      entity_id: entityId,
      is_active: true,
      description: "Net position available for general use",
      normal_balance: "CREDIT",
      level: 2,
      is_detail_account: true,
      budget_account: false,
      requires_fund_accounting: true,
      created_at: new Date(),
      updated_at: new Date(),
    },

    // REVENUE (4000-4999)
    {
      id: uuidv4(),
      account_code: "4000",
      account_name: "REVENUE",
      account_type: "REVENUE",
      parent_account_id: null,
      fund_id: generalFundId,
      entity_id: entityId,
      is_active: true,
      description: "Total Revenue",
      normal_balance: "CREDIT",
      level: 1,
      is_detail_account: false,
      budget_account: true,
      requires_fund_accounting: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      account_code: "4100",
      account_name: "Tax Revenue",
      account_type: "REVENUE",
      parent_account_id: null, // Will be set to Revenue parent
      fund_id: generalFundId,
      entity_id: entityId,
      is_active: true,
      description: "Revenue from taxation",
      normal_balance: "CREDIT",
      level: 2,
      is_detail_account: true,
      budget_account: true,
      requires_fund_accounting: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      account_code: "4200",
      account_name: "Non-Tax Revenue",
      account_type: "REVENUE",
      parent_account_id: null, // Will be set to Revenue parent
      fund_id: generalFundId,
      entity_id: entityId,
      is_active: true,
      description: "Revenue from non-tax sources",
      normal_balance: "CREDIT",
      level: 2,
      is_detail_account: true,
      budget_account: true,
      requires_fund_accounting: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      account_code: "4300",
      account_name: "Intergovernmental Revenue",
      account_type: "REVENUE",
      parent_account_id: null, // Will be set to Revenue parent
      fund_id: generalFundId,
      entity_id: entityId,
      is_active: true,
      description: "Revenue from other government entities",
      normal_balance: "CREDIT",
      level: 2,
      is_detail_account: true,
      budget_account: true,
      requires_fund_accounting: true,
      created_at: new Date(),
      updated_at: new Date(),
    },

    // EXPENSES (5000-5999)
    {
      id: uuidv4(),
      account_code: "5000",
      account_name: "EXPENSES",
      account_type: "EXPENSE",
      parent_account_id: null,
      fund_id: generalFundId,
      entity_id: entityId,
      is_active: true,
      description: "Total Expenses",
      normal_balance: "DEBIT",
      level: 1,
      is_detail_account: false,
      budget_account: true,
      requires_fund_accounting: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      account_code: "5100",
      account_name: "Personnel Services",
      account_type: "EXPENSE",
      parent_account_id: null, // Will be set to Expenses parent
      fund_id: generalFundId,
      entity_id: entityId,
      is_active: true,
      description: "Salaries, wages, and employee benefits",
      normal_balance: "DEBIT",
      level: 2,
      is_detail_account: true,
      budget_account: true,
      requires_fund_accounting: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      account_code: "5200",
      account_name: "Operating Expenses",
      account_type: "EXPENSE",
      parent_account_id: null, // Will be set to Expenses parent
      fund_id: generalFundId,
      entity_id: entityId,
      is_active: true,
      description: "Day-to-day operational expenses",
      normal_balance: "DEBIT",
      level: 2,
      is_detail_account: true,
      budget_account: true,
      requires_fund_accounting: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      account_code: "5300",
      account_name: "Capital Outlay",
      account_type: "EXPENSE",
      parent_account_id: null, // Will be set to Expenses parent
      fund_id: generalFundId,
      entity_id: entityId,
      is_active: true,
      description: "Expenditures for capital assets",
      normal_balance: "DEBIT",
      level: 2,
      is_detail_account: true,
      budget_account: true,
      requires_fund_accounting: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]

  await queryInterface.bulkInsert("chart_of_accounts", accounts)

  // Update parent relationships
  const insertedAccounts = (await queryInterface.sequelize.query(
    "SELECT id, account_code FROM chart_of_accounts ORDER BY account_code",
    { type: queryInterface.sequelize.QueryTypes.SELECT },
  )) as any[]

  const accountMap = new Map(insertedAccounts.map((acc) => [acc.account_code, acc.id]))

  // Set parent relationships
  const parentUpdates = [
    { child: "1100", parent: "1000" }, // Current Assets -> Assets
    { child: "1110", parent: "1100" }, // Cash -> Current Assets
    { child: "1120", parent: "1100" }, // Accounts Receivable -> Current Assets
    { child: "1130", parent: "1100" }, // Tax Receivables -> Current Assets
    { child: "1200", parent: "1000" }, // Non-Current Assets -> Assets
    { child: "1210", parent: "1200" }, // PPE -> Non-Current Assets
    { child: "2100", parent: "2000" }, // Current Liabilities -> Liabilities
    { child: "2110", parent: "2100" }, // Accounts Payable -> Current Liabilities
    { child: "2120", parent: "2100" }, // Accrued Liabilities -> Current Liabilities
    { child: "3100", parent: "3000" }, // Net Investment -> Net Position
    { child: "3200", parent: "3000" }, // Restricted -> Net Position
    { child: "3300", parent: "3000" }, // Unrestricted -> Net Position
    { child: "4100", parent: "4000" }, // Tax Revenue -> Revenue
    { child: "4200", parent: "4000" }, // Non-Tax Revenue -> Revenue
    { child: "4300", parent: "4000" }, // Intergovernmental -> Revenue
    { child: "5100", parent: "5000" }, // Personnel -> Expenses
    { child: "5200", parent: "5000" }, // Operating -> Expenses
    { child: "5300", parent: "5000" }, // Capital Outlay -> Expenses
  ]

  for (const update of parentUpdates) {
    const childId = accountMap.get(update.child)
    const parentId = accountMap.get(update.parent)

    if (childId && parentId) {
      await queryInterface.bulkUpdate("chart_of_accounts", { parent_account_id: parentId }, { id: childId })
    }
  }
}

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.bulkDelete("chart_of_accounts", {}, {})
  await queryInterface.bulkDelete("funds", {}, {})
}
