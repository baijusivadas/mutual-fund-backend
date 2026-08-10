const { xirr } = require("xirr");
const xlsx = require("xlsx");
const crypto = require("crypto");
const db = require("../models");
const { getCache, setCache } = require("../utils/cache.util");

/**
 * Process an uploaded Excel/CSV transaction file and persist records to DB.
 * @param {string} filePath - Path to the uploaded file on disk
 * @param {string[]} selectedUsers - Optional list of user IDs to map investors to
 * @param {string|null} createdBy - ID of the admin who triggered the upload
 */
const processTransactionFile = async (filePath, selectedUsers = [], createdBy = null) => {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  const purchasesData = [];
  const redemptionsData = [];
  const uniqueInvestors = new Set();

  for (const row of data) {
    const investorName = row["Investor Name"]?.trim();
    const schemeName = row["Scheme Name"]?.trim();
    const folio = row["Folio No"]?.trim();

    if (!investorName || !schemeName || !folio) continue;
    uniqueInvestors.add(investorName);

    let type = row["Transaction Type"] || "";
    let isRedemption =
      type.toLowerCase().includes("redemption") ||
      type.toLowerCase().includes("switch out");
    const units = parseFloat(row["Units"]);
    const nav = parseFloat(row["NAV"]);
    const amount = parseFloat(row["Amount"]);

    // Some Excel sheets represent redemptions as negative units
    if (units < 0) isRedemption = true;

    const record = {
      id: crypto.randomUUID(),
      date: new Date(row["Date"]),
      scheme: schemeName,
      units: Math.abs(units),
      nav,
      amount: Math.abs(amount),
      folio,
      investor_name: investorName,
      transaction_type: type,
      created_at: new Date(),
    };

    if (isRedemption) {
      redemptionsData.push(record);
    } else {
      purchasesData.push(record);
    }
  }

  // ── Persist to DB ──────────────────────────────────────────────────────────
  if (purchasesData.length > 0) {
    await db.purchases.bulkCreate(purchasesData, { ignoreDuplicates: true });
  }
  if (redemptionsData.length > 0) {
    await db.redemptions.bulkCreate(redemptionsData, { ignoreDuplicates: true });
  }

  // ── Map investors to selected users ───────────────────────────────────────
  if (selectedUsers && selectedUsers.length > 0) {
    const mappings = [];
    for (const userId of selectedUsers) {
      for (const investor of uniqueInvestors) {
        mappings.push({
          user_id: userId,
          asset_type: "mutual_funds",
          investor_name: investor,
          created_by: createdBy,
        });
      }
    }
    if (mappings.length > 0) {
      await db.user_investment_mappings.bulkCreate(mappings, {
        ignoreDuplicates: true,
      });
    }
  }

  // Invalidate XIRR cache so next fetch reflects new data
  const { delCache } = require("../utils/cache.util");
  delCache("transactions_xirr_results");

  return {
    count: purchasesData.length + redemptionsData.length,
    transactions: [...purchasesData, ...redemptionsData],
  };
};

/**
 * Calculate XIRR for all users. Results are cached for 5 minutes.
 */
const calculateTransactionsXirr = async () => {
  const cacheKey = "transactions_xirr_results";
  const cachedData = getCache(cacheKey);
  if (cachedData) return cachedData;

  const users = await db.User.findAll({
    attributes: ["id", "name"],
  });

  const results = [];

  for (const user of users) {
    // Fetch all purchases and redemptions for this user via investor mapping
    const mappings = await db.user_investment_mappings.findAll({
      where: { user_id: user.id, asset_type: "mutual_funds" },
    });

    const investorNames = mappings
      .map((m) => m.investor_name)
      .filter(Boolean);

    if (investorNames.length === 0) {
      results.push({ investor_name: user.name, xirr: "N/A" });
      continue;
    }

    const [purchases, redemptions] = await Promise.all([
      db.purchases.findAll({ where: { investor_name: investorNames } }),
      db.redemptions.findAll({ where: { investor_name: investorNames } }),
    ]);

    if (purchases.length === 0 && redemptions.length === 0) {
      results.push({ investor_name: user.name, xirr: "N/A" });
      continue;
    }

    const flows = [
      ...purchases.map((p) => ({
        amount: -Math.abs(Number(p.amount)), // cash out (investment)
        when: new Date(p.date),
      })),
      ...redemptions.map((r) => ({
        amount: Math.abs(Number(r.amount)), // cash in (return)
        when: new Date(r.date),
      })),
    ];

    try {
      const rate = xirr(flows) * 100;
      results.push({ investor_name: user.name, xirr: `${rate.toFixed(2)}%` });
    } catch {
      results.push({ investor_name: user.name, xirr: "N/A" });
    }
  }

  setCache(cacheKey, results, 300); // Cache for 5 minutes
  return results;
};

module.exports = {
  calculateTransactionsXirr,
  processTransactionFile,
};
