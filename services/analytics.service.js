const db = require("../models");
const { Op, fn, col, literal } = require("sequelize");

class AnalyticsService {
  /**
   * Get consolidated portfolio metrics with optimized database aggregations.
   */
  static async getConsolidatedMetrics(userId, userRole) {
    const where = userRole === "superAdmin" ? {} : { created_by: userId };

    // Parallel execution — DB-level aggregations where possible
    const [
      realEstateTotal,
      flatsTotal,
      rentalTotal,
      rentalMonthlyTotal,
      liabilitiesTotal,
      bankBalanceTotal,
      rawDetails,
    ] = await Promise.all([
      db.real_estate.sum("price", { where }),
      db.flats.sum("price", { where }),
      db.rental_properties.sum("deposit", { where }),
      db.rental_properties.sum("monthly_rent", {
        where: { ...where, status: "occupied" },
      }),
      db.liabilities.sum("outstanding_amount", { where }),
      db.bank_accounts.sum("current_balance", { where }),
      this.fetchOptimizedDetails(where),
    ]);

    const counts = await this.getEntityCounts(where);

    return {
      metrics: {
        totalProperties:
          counts.realEstate + counts.flats + counts.rentalProperties,
        totalPropertyValue:
          (realEstateTotal || 0) + (flatsTotal || 0) + (rentalTotal || 0),
        totalMonthlyRevenue: rentalMonthlyTotal || 0,
        totalLiabilities: liabilitiesTotal || 0,
        totalBankBalance: bankBalanceTotal || 0,
        occupancyRate:
          counts.rentalProperties > 0
            ? (counts.occupiedRentals / counts.rentalProperties) * 100
            : 0,
        statusDistribution: await this.getStatusDistribution(where),
        revenueData: await this.calculateRevenueTrend(where),
      },
      details: rawDetails,
    };
  }

  static async fetchOptimizedDetails(where) {
    const [
      realEstate,
      flats,
      rentalProperties,
      bankAccounts,
      liabilities,
      customAssets,
      crypto,
      bonds,
      etfs,
      nps,
    ] = await Promise.all([
      db.real_estate.findAll({
        where,
        attributes: ["id", "property_name", "status", "created_at", "price", "location"],
      }),
      db.flats.findAll({
        where,
        attributes: ["id", "flat_name", "status", "created_at", "price", "location", "bedrooms", "bathrooms", "area", "floor"],
      }),
      db.rental_properties.findAll({
        where,
        attributes: ["id", "property_name", "status", "created_at", "monthly_rent", "deposit", "location", "tenant_name", "lease_start_date", "lease_end_date"],
      }),
      db.bank_accounts.findAll({
        where,
        attributes: ["id", "bank_name", "account_number", "current_balance", "account_type"],
      }),
      db.liabilities.findAll({
        where,
        attributes: ["id", "liability_name", "lender", "outstanding_amount", "interest_rate", "end_date"],
      }),
      db.custom_assets.findAll({
        where,
        attributes: ["id", "asset_name", "current_value", "asset_type"],
      }),
      db.crypto_investments.findAll({
        where,
        attributes: ["id", "item_name", "symbol", "quantity", "average_price", "current_price"],
      }),
      db.bonds.findAll({
        where,
        attributes: ["id", "bond_name", "face_value", "quantity", "coupon_rate"],
      }),
      db.etfs.findAll({
        where,
        attributes: ["id", "etf_name", "symbol", "quantity", "purchase_price", "current_nav"],
      }),
      db.nps_investments.findAll({
        where,
        attributes: ["id", "pran", "amount_invested", "current_value"],
      }),
    ]);

    return {
      realEstate,
      flats,
      rentalProperties,
      bankAccounts,
      liabilities,
      customAssets,
      crypto,
      bonds,
      etfs,
      nps,
    };
  }

  static async getEntityCounts(where) {
    const [realEstate, flats, rentalProperties, occupiedRentals] =
      await Promise.all([
        db.real_estate.count({ where }),
        db.flats.count({ where }),
        db.rental_properties.count({ where }),
        db.rental_properties.count({ where: { ...where, status: "occupied" } }),
      ]);
    return { realEstate, flats, rentalProperties, occupiedRentals };
  }

  /**
   * Returns property status distribution for the pie chart:
   * [{ name: "occupied", value: 5 }, { name: "vacant", value: 3 }, ...]
   */
  static async getStatusDistribution(where) {
    try {
      const rentalRows = await db.rental_properties.findAll({
        where,
        attributes: ["status", [fn("COUNT", col("id")), "count"]],
        group: ["status"],
        raw: true,
      });

      const realEstateRows = await db.real_estate.findAll({
        where,
        attributes: ["status", [fn("COUNT", col("id")), "count"]],
        group: ["status"],
        raw: true,
      });

      // Merge counts across property types
      const merged = {};
      [...rentalRows, ...realEstateRows].forEach((row) => {
        const key = row.status || "unknown";
        merged[key] = (merged[key] || 0) + parseInt(row.count || 0);
      });

      return Object.entries(merged).map(([name, value]) => ({ name, value }));
    } catch {
      return [];
    }
  }

  /**
   * Returns monthly rental revenue for the past 6 months:
   * [{ month: "Jan", revenue: 120000 }, ...]
   */
  static async calculateRevenueTrend(where) {
    try {
      const occupiedWhere = { ...where, status: "occupied" };
      const properties = await db.rental_properties.findAll({
        where: occupiedWhere,
        attributes: ["monthly_rent", "lease_start_date"],
        raw: true,
      });

      // Build last 6 months labels
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push({
          label: d.toLocaleString("default", { month: "short" }),
          year: d.getFullYear(),
          month: d.getMonth(),
        });
      }

      return months.map(({ label, year, month }) => {
        const revenue = properties
          .filter((p) => {
            if (!p.lease_start_date) return true; // ongoing
            const start = new Date(p.lease_start_date);
            return (
              start.getFullYear() < year ||
              (start.getFullYear() === year && start.getMonth() <= month)
            );
          })
          .reduce((sum, p) => sum + Number(p.monthly_rent || 0), 0);

        return { month: label, revenue };
      });
    } catch {
      return [];
    }
  }
}

module.exports = AnalyticsService;
