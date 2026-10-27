const { xirr } = require('xirr');
const crypto = require('crypto');
const db = require('../models');
const { getCache, setCache } = require('../utils/cache.util');
const { parseTransactionWorkbook } = require('../utils/transactionFileParser');

/**
 * Generate a unique normalized signature for a transaction record.
 */
const generateTransactionSignature = (t) => {
  const normDate = String(t.date || '').slice(0, 10);
  const normScheme = String(t.scheme || '').trim().toLowerCase();
  const normInvestor = String(t.investor_name || '').trim().toLowerCase();
  const normFolio = String(t.folio || '').trim().toLowerCase();
  const normUnits = Number(t.units || 0).toFixed(4);
  const normAmount = Number(t.amount || 0).toFixed(4);
  const normType = String(t.transaction_type || '').trim().toLowerCase();
  return `${normInvestor}|${normFolio}|${normScheme}|${normDate}|${normUnits}|${normAmount}|${normType}`;
};

/**
 * Generate a deterministic UUID from transaction signature to prevent duplicates.
 */
const generateDeterministicId = (signature) => {
  const hash = crypto.createHash('sha256').update(signature).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
};

/**
 * Process an uploaded Excel/CSV transaction file and persist records to DB.
 * Handles deduplication: if the same file is uploaded multiple times, existing values are skipped.
 * @param {string} filePath - Path to the uploaded file on disk
 * @param {string[]} selectedUsers - Optional list of user IDs to map investors to
 * @param {string|null} createdBy - ID of the admin who triggered the upload
 */
const processTransactionFile = async (filePath, selectedUsers = [], createdBy = null) => {
  const { transactions: parsedTransactions, skipped } = parseTransactionWorkbook(filePath);

  if (parsedTransactions.length === 0) {
    const error = new Error(
      `No valid transaction rows found. ${skipped} row(s) were skipped; check the required columns and values.`
    );
    error.status = 400;
    throw error;
  }

  const uniqueInvestors = new Set(parsedTransactions.map((t) => t.investor_name).filter(Boolean));

  // Fetch existing records for these investors to prevent duplicate inserts when the same file is uploaded again
  const [existingPurchases, existingRedemptions] = await Promise.all([
    uniqueInvestors.size > 0
      ? db.purchases.findAll({
          where: { investor_name: Array.from(uniqueInvestors) },
          attributes: ['id', 'investor_name', 'folio', 'scheme', 'date', 'units', 'amount', 'transaction_type'],
        })
      : [],
    uniqueInvestors.size > 0
      ? db.redemptions.findAll({
          where: { investor_name: Array.from(uniqueInvestors) },
          attributes: ['id', 'investor_name', 'folio', 'scheme', 'date', 'units', 'amount', 'transaction_type'],
        })
      : [],
  ]);

  const existingSignatures = new Set([
    ...existingPurchases.map(generateTransactionSignature),
    ...existingRedemptions.map(generateTransactionSignature),
  ]);

  const purchasesData = [];
  const redemptionsData = [];
  let duplicateCount = 0;
  const currentBatchSignatures = new Set();

  for (const transaction of parsedTransactions) {
    const signature = generateTransactionSignature(transaction);

    // Skip if already in database OR duplicate within the same uploaded file
    if (existingSignatures.has(signature) || currentBatchSignatures.has(signature)) {
      duplicateCount += 1;
      continue;
    }

    currentBatchSignatures.add(signature);
    const deterministicId = generateDeterministicId(signature);

    const record = {
      id: deterministicId,
      date: transaction.date,
      scheme: transaction.scheme,
      units: transaction.units,
      nav: transaction.nav,
      amount: transaction.amount,
      folio: transaction.folio,
      investor_name: transaction.investor_name,
      transaction_type: transaction.transaction_type,
      created_at: new Date(),
    };

    if (transaction.isRedemption) {
      redemptionsData.push(record);
    } else {
      purchasesData.push(record);
    }
  }

  // ── Persist new records to DB ──────────────────────────────────────────────
  if (purchasesData.length > 0) {
    await db.purchases.bulkCreate(purchasesData, { ignoreDuplicates: true });
  }
  if (redemptionsData.length > 0) {
    await db.redemptions.bulkCreate(redemptionsData, { ignoreDuplicates: true });
  }

  // ── Map investors to selected users (or default to uploader) ──────────────
  const targetUsers =
    selectedUsers && selectedUsers.length > 0
      ? selectedUsers
      : createdBy
      ? [createdBy]
      : [];

  if (targetUsers.length > 0) {
    const mappings = [];
    for (const userId of targetUsers) {
      for (const investor of uniqueInvestors) {
        mappings.push({
          user_id: userId,
          asset_type: 'mutual_funds',
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
  const { delCache } = require('../utils/cache.util');
  delCache('transactions_xirr_results');

  return {
    count: purchasesData.length + redemptionsData.length,
    purchases: purchasesData.length,
    redemptions: redemptionsData.length,
    skipped,
    duplicatesSkipped: duplicateCount,
    mappedUsers: selectedUsers.length,
    transactions: [...purchasesData, ...redemptionsData],
    alreadyUploaded: duplicateCount > 0 && purchasesData.length === 0 && redemptionsData.length === 0,
  };
};

/**
 * Calculate XIRR for all users. Results are cached for 5 minutes.
 */
const calculateTransactionsXirr = async () => {
  const cacheKey = 'transactions_xirr_results';
  const cachedData = getCache(cacheKey);
  if (cachedData) return cachedData;

  const users = await db.User.findAll({
    attributes: ['id', 'name'],
  });

  const results = [];

  for (const user of users) {
    // Fetch all purchases and redemptions for this user via investor mapping
    const mappings = await db.user_investment_mappings.findAll({
      where: { user_id: user.id, asset_type: 'mutual_funds' },
    });

    const investorNames = mappings.map((m) => m.investor_name).filter(Boolean);

    if (investorNames.length === 0) {
      results.push({ investor_name: user.name, xirr: 'N/A' });
      continue;
    }

    const [purchases, redemptions] = await Promise.all([
      db.purchases.findAll({ where: { investor_name: investorNames } }),
      db.redemptions.findAll({ where: { investor_name: investorNames } }),
    ]);

    if (purchases.length === 0 && redemptions.length === 0) {
      results.push({ investor_name: user.name, xirr: 'N/A' });
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
      results.push({ investor_name: user.name, xirr: 'N/A' });
    }
  }

  setCache(cacheKey, results, 300); // Cache for 5 minutes
  return results;
};

module.exports = {
  calculateTransactionsXirr,
  processTransactionFile,
};
