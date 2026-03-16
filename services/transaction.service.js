const { xirr } = require("xirr");
const xlsx = require("xlsx");
const { User, Scheme, Transaction } = require("../models");

const processTransactionFile = async (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  // ─── Pre-build caches to avoid N+1 DB calls inside the loop ─────────────────
  // Process all unique users and schemes upfront in batch
  const uniqueUsers = new Map();
  const uniqueSchemes = new Map();

  for (const row of data) {
    const investorName = row["Investor Name"]?.trim();
    const schemeName = row["Scheme Name"]?.trim();
    const folio = row["Folio No"]?.trim();
    if (investorName && folio) uniqueUsers.set(`${investorName}|${folio}`, { name: investorName, folio });
    if (schemeName) uniqueSchemes.set(schemeName, { name: schemeName });
  }

  // Bulk findOrCreate for users (sequential but only unique entries)
  const userCache = new Map();
  for (const [key, userData] of uniqueUsers) {
    const [user] = await User.findOrCreate({
      where: { name: userData.name, folio: userData.folio },
      defaults: userData,
    });
    userCache.set(key, user);
  }

  // Bulk findOrCreate for schemes (sequential but only unique entries)
  const schemeCache = new Map();
  for (const [name, schemeData] of uniqueSchemes) {
    const [scheme] = await Scheme.findOrCreate({
      where: { name },
      defaults: schemeData,
    });
    schemeCache.set(name, scheme);
  }

  // ─── Build transactions using cache — zero extra DB calls ────────────────────
  const transactions = [];
  for (const row of data) {
    const investorName = row["Investor Name"]?.trim();
    const schemeName = row["Scheme Name"]?.trim();
    const folio = row["Folio No"]?.trim();

    const user = userCache.get(`${investorName}|${folio}`);
    const scheme = schemeCache.get(schemeName);
    if (!user || !scheme) continue;

    let type = row["Transaction Type"];
    if (type?.toLowerCase().includes("switch out")) {
      type = "Redemption";
    }

    transactions.push({
      date: new Date(row["Date"]),
      type,
      units: parseFloat(row["Units"]),
      nav: parseFloat(row["NAV"]),
      amount: parseFloat(row["Amount"]),
      user_id: user.id,
      scheme_id: scheme.id,
    });
  }

  await Transaction.bulkCreate(transactions);
  return { count: transactions.length, transactions };
};

const calculateTransactionsXirr = async () => {
  const users = await User.findAll({ include: Transaction });

  const results = [];
  for (const user of users) {
    // Fixed: renamed inner variable to avoid parameter shadowing
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

  return results;
};

module.exports = {
  calculateTransactionsXirr,
  processTransactionFile,
};
