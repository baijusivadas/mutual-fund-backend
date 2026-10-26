const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const XLSX = require('xlsx');
const db = require('../models');
const { processTransactionFile } = require('../services/transaction.service');
const { parseTransactionRows } = require('../utils/transactionFileParser');

test('parses combined transaction headers regardless of spacing and case', () => {
  const result = parseTransactionRows([
    ['Combined transactions'],
    ['TransactionType', 'InvestorName', 'Date', 'SchemeName', 'Units', 'NAV', 'Amount', 'FolioNo'],
    ['Purchase', 'Demo Investor', '2024-01-15', 'Demo Fund', 12.5, 80, 1000, 'F-1'],
    ['Redemption', 'Demo Investor', '2024-02-15', 'Demo Fund', -2.5, 90, 225, 'F-1'],
  ]);

  assert.equal(result.transactions.length, 2);
  assert.equal(result.transactions[0].date, '2024-01-15');
  assert.equal(result.transactions[0].isRedemption, false);
  assert.equal(result.transactions[1].isRedemption, true);
  assert.equal(result.transactions[1].units, 2.5);
  assert.equal(result.skipped, 0);
});

test('parses Excel serial dates and Indian-formatted amounts', () => {
  const result = parseTransactionRows([
    ['Investor Name', 'Date', 'Scheme Name', 'Units', 'NAV', 'Amount'],
    ['Demo Investor', 45292, 'Demo Fund', '12.5', '₹80.00', '1,000.00'],
  ]);

  assert.equal(result.transactions[0].date, '2024-01-01');
  assert.equal(result.transactions[0].amount, 1000);
  assert.equal(result.transactions[0].folio, '');
});

test('reports invalid data rows and rejects workbooks without transaction columns', () => {
  const result = parseTransactionRows([
    ['Investor', 'Transaction Date', 'Fund Name', 'Quantity', 'Unit Price', 'Transaction Amount'],
    ['Demo Investor', 'not a date', 'Demo Fund', 10, 10, 100],
    ['Demo Investor', '2024-01-01', 'Demo Fund', 10, 10, 100],
  ]);

  assert.equal(result.transactions.length, 1);
  assert.equal(result.skipped, 1);
  assert.throws(() => parseTransactionRows([['Summary'], ['Total', 100]]), {
    status: 400,
    message: /Could not find transaction columns/,
  });
});

test('imports an uploaded workbook into purchase, redemption, and user mapping records', async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'brickwealth-upload-'));
  const filePath = path.join(directory, 'combined_transactions.xlsx');
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([
    [
      'Tansactiontype',
      'Investorname',
      'Investmentdate',
      'Schemename',
      'Purchase/sell_units',
      'Purchase/sell_nav',
      'Purchase/sell_value',
      'Folionumber',
    ],
    ['Purchase', 'Demo Investor', 45292, 'Demo Fund', 12.5, 80, 1000, 'F-1'],
    ['Switchout', 'Demo Investor', '2024-02-15', 'Demo Fund', 2.5, 90, 225, 'F-1'],
  ]);
  worksheet.C2.z = 'dd/mm/yyyy';
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet([
      ['Sum of purchase/sell_value', 'Column Labels'],
      ['Row Labels', 'Demo Investor', 'Grand Total'],
    ]),
    'Sheet2'
  );
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, filePath);
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  const originalPurchases = db.purchases.bulkCreate;
  const originalRedemptions = db.redemptions.bulkCreate;
  const originalMappings = db.user_investment_mappings.bulkCreate;
  let purchases;
  let redemptions;
  let mappings;
  db.purchases.bulkCreate = async (records) => {
    purchases = records;
  };
  db.redemptions.bulkCreate = async (records) => {
    redemptions = records;
  };
  db.user_investment_mappings.bulkCreate = async (records) => {
    mappings = records;
  };

  try {
    const result = await processTransactionFile(filePath, ['user-1'], 'admin-1');
    assert.equal(result.count, 2);
    assert.equal(result.purchases, 1);
    assert.equal(result.redemptions, 1);
    assert.equal(result.mappedUsers, 1);
    assert.equal(purchases[0].date, '2024-01-01');
    assert.equal(redemptions[0].transaction_type, 'Switchout');
    assert.deepEqual(mappings[0], {
      user_id: 'user-1',
      asset_type: 'mutual_funds',
      investor_name: 'Demo Investor',
      created_by: 'admin-1',
    });
  } finally {
    db.purchases.bulkCreate = originalPurchases;
    db.redemptions.bulkCreate = originalRedemptions;
    db.user_investment_mappings.bulkCreate = originalMappings;
  }
});
