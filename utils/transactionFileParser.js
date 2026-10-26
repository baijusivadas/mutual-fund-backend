const XLSX = require('xlsx');

const normalizeHeader = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const HEADER_ALIASES = {
  transactionType: ['transactiontype', 'tansactiontype', 'transaction', 'type'],
  investorName: ['investorname', 'investor', 'unitholder', 'unitholdername', 'holdername'],
  date: ['date', 'transactiondate', 'investmentdate'],
  schemeName: ['schemename', 'scheme', 'fundname', 'mutualfundname'],
  units: ['units', 'unit', 'quantity', 'qty', 'purchasesellunits'],
  nav: ['nav', 'priceperunit', 'unitprice', 'purchasesellnav'],
  amount: ['amount', 'transactionamount', 'totalamount', 'value', 'purchasesellvalue'],
  folio: ['foliono', 'folio', 'folionumber', 'accountnumber', 'accountno'],
};

const findHeader = (rows) => {
  for (let index = 0; index < Math.min(rows.length, 50); index += 1) {
    const headers = rows[index].map(normalizeHeader);
    const columns = {};

    Object.entries(HEADER_ALIASES).forEach(([field, aliases]) => {
      columns[field] = headers.findIndex((header) => aliases.includes(header));
    });

    if (
      columns.investorName >= 0 &&
      columns.date >= 0 &&
      columns.schemeName >= 0 &&
      columns.units >= 0 &&
      columns.nav >= 0 &&
      columns.amount >= 0
    ) {
      return { index, columns };
    }
  }

  return null;
};

const parseNumber = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const text = String(value ?? '')
    .trim()
    .replace(/[₹$€£,\s]/g, '');
  if (!text) return null;

  const isNegative = text.startsWith('(') && text.endsWith(')');
  const parsed = Number(isNegative ? text.slice(1, -1) : text);
  if (!Number.isFinite(parsed)) return null;
  return isNegative ? -parsed : parsed;
};

const parseDate = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const parts = XLSX.SSF.parse_date_code(value);
    if (parts) {
      return `${parts.y}-${String(parts.m).padStart(2, '0')}-${String(parts.d).padStart(2, '0')}`;
    }
    return null;
  }

  const text = String(value ?? '').trim();
  if (!text) return null;

  const dayFirst = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dayFirst) {
    const [, day, month, year] = dayFirst;
    const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    if (
      parsed.getUTCFullYear() === Number(year) &&
      parsed.getUTCMonth() === Number(month) - 1 &&
      parsed.getUTCDate() === Number(day)
    ) {
      return parsed.toISOString().slice(0, 10);
    }
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return null;
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
};

const parseTransactionRows = (rows) => {
  const header = findHeader(rows);
  if (!header) {
    const error = new Error(
      'Could not find transaction columns. Include Investor Name, Date, Scheme Name, Units, NAV, and Amount.'
    );
    error.status = 400;
    throw error;
  }

  const transactions = [];
  let skipped = 0;

  rows.slice(header.index + 1).forEach((row) => {
    const investorName = String(row[header.columns.investorName] ?? '').trim();
    const schemeName = String(row[header.columns.schemeName] ?? '').trim();
    const date = parseDate(row[header.columns.date]);
    const units = parseNumber(row[header.columns.units]);
    const nav = parseNumber(row[header.columns.nav]);
    const amount = parseNumber(row[header.columns.amount]);

    if (!investorName && !schemeName && !date) return;
    if (
      !investorName ||
      !schemeName ||
      !date ||
      units === null ||
      nav === null ||
      amount === null
    ) {
      skipped += 1;
      return;
    }

    const typeIndex = header.columns.transactionType;
    const folioIndex = header.columns.folio;
    transactions.push({
      date,
      scheme: schemeName,
      units: Math.abs(units),
      nav,
      amount: Math.abs(amount),
      folio: folioIndex >= 0 ? String(row[folioIndex] ?? '').trim() : '',
      investor_name: investorName,
      transaction_type: typeIndex >= 0 ? String(row[typeIndex] ?? '').trim() : '',
      isRedemption:
        units < 0 ||
        /redemption|switch[\s-]*out|sell/i.test(typeIndex >= 0 ? String(row[typeIndex] ?? '') : ''),
    });
  });

  return { transactions, skipped };
};

const parseTransactionWorkbook = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const transactions = [];
  let skipped = 0;
  let foundHeader = false;

  workbook.SheetNames.forEach((sheetName) => {
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
      defval: null,
      raw: true,
    });
    if (!rows.length) return;

    try {
      const result = parseTransactionRows(rows);
      foundHeader = true;
      transactions.push(...result.transactions);
      skipped += result.skipped;
    } catch (error) {
      if (error.status !== 400) throw error;
    }
  });

  if (!foundHeader) {
    const error = new Error(
      'Could not find transaction columns. Include Investor Name, Date, Scheme Name, Units, NAV, and Amount.'
    );
    error.status = 400;
    throw error;
  }

  return { transactions, skipped };
};

module.exports = { parseTransactionRows, parseTransactionWorkbook };
