"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // ─── Transactions Table Indexes ──────────────────────────────────────────
    // Index for foreign keys (joins) and common filters
    await queryInterface.addIndex("transactions", ["user_id"], {
      name: "idx_transactions_user_id",
    });
    await queryInterface.addIndex("transactions", ["scheme_id"], {
      name: "idx_transactions_scheme_id",
    });
    await queryInterface.addIndex("transactions", ["date"], {
      name: "idx_transactions_date",
    });

    // ─── Users Table Indexes ─────────────────────────────────────────────────
    // Composite index for name and folio lookup (very frequent during ingestion)
    await queryInterface.addIndex("users", ["name", "folio"], {
      name: "idx_users_name_folio",
    });

    // ─── Schemes Table Indexes ───────────────────────────────────────────────
    // Index for scheme name lookups
    await queryInterface.addIndex("schemes", ["name"], {
      name: "idx_schemes_name",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("transactions", "idx_transactions_user_id");
    await queryInterface.removeIndex("transactions", "idx_transactions_scheme_id");
    await queryInterface.removeIndex("transactions", "idx_transactions_date");
    await queryInterface.removeIndex("users", "idx_users_name_folio");
    await queryInterface.removeIndex("schemes", "idx_schemes_name");
  },
};
