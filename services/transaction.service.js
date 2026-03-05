const { xirr } = require("xirr");
const xlsx = require("xlsx");
const { User, Scheme, Transaction } = require("../models");

const processTransactionFile = async (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  const transactions = [];

  for (const row of data) {
    const investorName = row["Investor Name"]?.trim();
    const schemeName = row["Scheme Name"]?.trim();
    const folio = row["Folio No"]?.trim();

    // 1. Ensure unique user
    const [user] = await User.findOrCreate({
      where: { name: investorName, folio },
      defaults: { name: investorName, folio },
    });

    // 2. Ensure unique scheme
    const [scheme] = await Scheme.findOrCreate({
      where: { name: schemeName },
      defaults: { name: schemeName },
    });

    // 3. Handle Switch Out like Redemption
    let type = row["Transaction Type"];
    if (type?.toLowerCase().includes("switch out")) {
      type = "Redemption";
    }

    // 4. Insert transaction
    const transaction = {
      date: new Date(row["Date"]),
      type,
      units: parseFloat(row["Units"]),
      nav: parseFloat(row["NAV"]),
      amount: parseFloat(row["Amount"]),
      user_id: user.id,
      scheme_id: scheme.id,
    };

    transactions.push(transaction);
  }

  await Transaction.bulkCreate(transactions);
  return { count: transactions.length, transactions };
};

const calculateTransactionsXirr = async (cashFlows) => {
  // XIRR calculation logic goes here
  const users = await User.findAll({ include: Transaction });

  const results = [];
  for (const user of users) {
    const cashFlows = user.Transactions.map((t) => ({
      amount: ["redemption", "switch out"].includes(t.type.toLowerCase())
        ? Math.abs(t.amount)
        : -Math.abs(t.amount),
      when: new Date(t.date),
    }));

    try {
      const rate = xirr(cashFlows) * 100;
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
