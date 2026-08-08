const { xirr } = require("xirr");
const xlsx = require("xlsx");
const { User, Scheme, Transaction } = require("../models");

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
    let isRedemption = type.toLowerCase().includes("redemption") || type.toLowerCase().includes("switch out");
    const units = parseFloat(row["Units"]);
    const nav = parseFloat(row["NAV"]);
    const amount = parseFloat(row["Amount"]);

    if (units < 0) isRedemption = true; // some excel sheets show redemptions as negative units

    const record = {
      id: require('crypto').randomUUID(),
      date: new Date(row["Date"]),
      scheme: schemeName,
      units: Math.abs(units),
      nav,
      amount: Math.abs(amount),
      folio,
      investor_name: investorName,
      transaction_type: type,
      created_at: new Date()
    };

    if (isRedemption) {
      redemptionsData.push(record);
    } else {
      purchasesData.push(record);
    }
  }

  // Insert into DB
  if (purchasesData.length > 0) {
    await db.purchases.bulkCreate(purchasesData, { ignoreDuplicates: true });
  }
  if (redemptionsData.length > 0) {
    await db.redemptions.bulkCreate(redemptionsData, { ignoreDuplicates: true });
  }

  // Map users to investments
  if (selectedUsers && selectedUsers.length > 0) {
    const mappings = [];
    for (const userId of selectedUsers) {
      for (const investor of uniqueInvestors) {
        mappings.push({
          user_id: userId,
          asset_type: "mutual_funds",
          investor_name: investor,
          created_by: createdBy
        });
      }
    }
    if (mappings.length > 0) {
      await db.user_investment_mappings.bulkCreate(mappings, { 
        ignoreDuplicates: true 
      });
    }
  }

  return { count: purchasesData.length + redemptionsData.length };
};

const { getCache, setCache } = require("../utils/cache.util");

const calculateTransactionsXirr = async () => {
  const cacheKey = 'transactions_xirr_results';
  const cachedData = getCache(cacheKey);
  if (cachedData) return cachedData;

  const users = await User.findAll({ 
    include: [{
      model: Transaction,
      attributes: ['amount', 'date', 'type']
    }],
    attributes: ['id', 'name']
  });

  const results = [];
  for (const user of users) {
    if (!user.Transactions || user.Transactions.length === 0) {
      results.push({ investor_name: user.name, xirr: "N/A" });
      continue;
    }

    const flows = user.Transactions.map((t) => ({
      amount: ["redemption", "switch out"].includes(t.type.toLowerCase())
        ? Math.abs(t.amount)
        : -Math.abs(t.amount),
      when: new Date(t.date),
    }));

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
