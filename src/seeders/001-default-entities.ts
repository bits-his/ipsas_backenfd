import type { QueryInterface } from "sequelize"
import { v4 as uuidv4 } from "uuid"

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  const entities = [
    {
      id: uuidv4(),
      entity_code: "GOV001",
      entity_name: "Central Government",
      entity_type: "GOVERNMENT",
      parent_entity_id: null,
      fiscal_year_end: "12-31",
      currency_code: "USD",
      is_active: true,
      description: "Central Government Entity",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      entity_code: "AGY001",
      entity_name: "Ministry of Finance",
      entity_type: "AGENCY",
      parent_entity_id: null, // Will be updated after central government is created
      fiscal_year_end: "12-31",
      currency_code: "USD",
      is_active: true,
      description: "Ministry of Finance - Financial oversight and management",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      entity_code: "AGY002",
      entity_name: "Ministry of Health",
      entity_type: "AGENCY",
      parent_entity_id: null,
      fiscal_year_end: "12-31",
      currency_code: "USD",
      is_active: true,
      description: "Ministry of Health - Healthcare services and oversight",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      entity_code: "AGY003",
      entity_name: "Ministry of Education",
      entity_type: "AGENCY",
      parent_entity_id: null,
      fiscal_year_end: "12-31",
      currency_code: "USD",
      is_active: true,
      description: "Ministry of Education - Educational services and oversight",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      entity_code: "DEPT001",
      entity_name: "Accounting Department",
      entity_type: "DEPARTMENT",
      parent_entity_id: null, // Will be linked to Ministry of Finance
      fiscal_year_end: "12-31",
      currency_code: "USD",
      is_active: true,
      description: "Central Accounting Department",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      entity_code: "DEPT002",
      entity_name: "Budget Department",
      entity_type: "DEPARTMENT",
      parent_entity_id: null, // Will be linked to Ministry of Finance
      fiscal_year_end: "12-31",
      currency_code: "USD",
      is_active: true,
      description: "Central Budget Planning and Management Department",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]

  await queryInterface.bulkInsert("entities", entities)

  // Update parent relationships
  const centralGov = entities[0]
  const financeMinistry = entities[1]

  // Set Central Government as parent for ministries
  await queryInterface.bulkUpdate(
    "entities",
    { parent_entity_id: centralGov.id },
    { entity_code: ["AGY001", "AGY002", "AGY003"] },
  )

  // Set Ministry of Finance as parent for finance departments
  await queryInterface.bulkUpdate(
    "entities",
    { parent_entity_id: financeMinistry.id },
    { entity_code: ["DEPT001", "DEPT002"] },
  )
}

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.bulkDelete("entities", {}, {})
}
