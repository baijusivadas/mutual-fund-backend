'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Create `organizations` table
    await queryInterface.createTable('organizations', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      tier: {
        type: Sequelize.STRING(50),
        defaultValue: 'starter',
      },
      status: {
        type: Sequelize.STRING(50),
        defaultValue: 'active',
      },
      contact_email: {
        type: Sequelize.STRING,
      },
      contact_phone: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.TEXT,
      },
      max_users: {
        type: Sequelize.INTEGER,
        defaultValue: 50,
      },
      settings: {
        type: Sequelize.TEXT,
        defaultValue: '{}',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });

    // 2. Create `organization_members` table
    await queryInterface.createTable('organization_members', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      organization_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'organizations',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'auth_users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      role: {
        type: Sequelize.STRING(50),
        defaultValue: 'client',
      },
      status: {
        type: Sequelize.STRING(50),
        defaultValue: 'active',
      },
      joined_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });

    await queryInterface.addIndex('organization_members', ['organization_id', 'user_id'], {
      unique: true,
      name: 'idx_org_members_org_user',
    });

    // Helper to safely add column if not exists
    const addColumnIfNotExists = async (table, column, definition) => {
      const tableDesc = await queryInterface.describeTable(table).catch(() => null);
      if (tableDesc && !tableDesc[column]) {
        await queryInterface.addColumn(table, column, definition);
      }
    };

    // 3. Add `tenant_id` to key entity tables
    await addColumnIfNotExists('auth_users', 'tenant_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    await addColumnIfNotExists('investors', 'tenant_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    await addColumnIfNotExists('purchases', 'tenant_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    await addColumnIfNotExists('redemptions', 'tenant_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    // 4. Enhance `audit_logs` table
    await addColumnIfNotExists('audit_logs', 'tenant_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
    await addColumnIfNotExists('audit_logs', 'entity_type', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await addColumnIfNotExists('audit_logs', 'entity_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await addColumnIfNotExists('audit_logs', 'ip_address', {
      type: Sequelize.STRING(45),
      allowNull: true,
    });
    await addColumnIfNotExists('audit_logs', 'user_agent', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await addColumnIfNotExists('audit_logs', 'status', {
      type: Sequelize.STRING(50),
      defaultValue: 'success',
    });

    // 5. Seed default primary organization
    const defaultOrgId = '00000000-0000-4000-8000-000000000001';
    await queryInterface.bulkInsert('organizations', [
      {
        id: defaultOrgId,
        name: 'BrickWealth Primary',
        slug: 'brickwealth',
        code: 'BW001',
        tier: 'enterprise',
        status: 'active',
        contact_email: 'admin@brickwealth.test',
        settings: JSON.stringify({
          baseCurrency: 'INR',
          complianceStrict: true,
          auditEnabled: true,
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 6. Backfill existing records with default tenant_id
    await queryInterface.sequelize.query(
      `UPDATE auth_users SET tenant_id = '${defaultOrgId}' WHERE tenant_id IS NULL;`
    );
    await queryInterface.sequelize.query(
      `UPDATE investors SET tenant_id = '${defaultOrgId}' WHERE tenant_id IS NULL;`
    );
    await queryInterface.sequelize.query(
      `UPDATE purchases SET tenant_id = '${defaultOrgId}' WHERE tenant_id IS NULL;`
    );
    await queryInterface.sequelize.query(
      `UPDATE redemptions SET tenant_id = '${defaultOrgId}' WHERE tenant_id IS NULL;`
    );
    await queryInterface.sequelize.query(
      `UPDATE audit_logs SET tenant_id = '${defaultOrgId}' WHERE tenant_id IS NULL;`
    );

    // Map existing users to organization_members
    await queryInterface.sequelize.query(`
      INSERT INTO organization_members (id, organization_id, user_id, role, status, joined_at)
      SELECT gen_random_uuid(), '${defaultOrgId}', u.id, 'owner', 'active', now()
      FROM auth_users u
      ON CONFLICT DO NOTHING;
    `);

    // 7. Add performance indexes for tenant isolation queries
    const addIndexSafe = async (table, fields, name) => {
      try {
        await queryInterface.addIndex(table, fields, { name });
      } catch {
        // index might already exist
      }
    };

    await addIndexSafe('auth_users', ['tenant_id'], 'idx_auth_users_tenant_id');
    await addIndexSafe('investors', ['tenant_id'], 'idx_investors_tenant_id');
    await addIndexSafe('purchases', ['tenant_id'], 'idx_purchases_tenant_id');
    await addIndexSafe('redemptions', ['tenant_id'], 'idx_redemptions_tenant_id');
    await addIndexSafe('audit_logs', ['tenant_id'], 'idx_audit_logs_tenant_id');
  },

  async down(queryInterface) {
    await queryInterface.dropTable('organization_members');
    await queryInterface.dropTable('organizations');
  },
};

