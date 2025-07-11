import { type QueryInterface, DataTypes } from "sequelize"

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.createTable("entities", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    entity_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    entity_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    entity_type: {
      type: DataTypes.ENUM("GOVERNMENT", "AGENCY", "DEPARTMENT", "SUBSIDIARY"),
      allowNull: false,
    },
    parent_entity_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "entities",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    fiscal_year_end: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    currency_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  })

  // Add indexes
  await queryInterface.addIndex("entities", ["entity_code"], {
    unique: true,
    name: "entities_entity_code_unique",
  })

  await queryInterface.addIndex("entities", ["entity_type"], {
    name: "entities_entity_type_idx",
  })

  await queryInterface.addIndex("entities", ["parent_entity_id"], {
    name: "entities_parent_entity_id_idx",
  })

  await queryInterface.addIndex("entities", ["is_active"], {
    name: "entities_is_active_idx",
  })

  await queryInterface.addIndex("entities", ["created_at"], {
    name: "entities_created_at_idx",
  })

  await queryInterface.addIndex("entities", ["updated_at"], {
    name: "entities_updated_at_idx",
  })
}

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable("entities")
}
