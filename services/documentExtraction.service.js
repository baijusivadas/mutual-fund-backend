const FinancialService = require('./financial.service');
const { createControllerLogger } = require('../utils/logger');
const logger = createControllerLogger('documentExtractionService');

class DocumentExtractionService {
  /**
   * Extract and structure financial transaction and portfolio data from text / CAS records.
   * Supports rule-based structural parsing with fallback to LLM for unstructured PDFs/scans.
   * @param {Object} input
   * @param {string} input.rawText - Raw statement text
   * @param {string} [input.documentType='CAS'] - 'CAS' | 'CONTRACT_NOTE' | 'BANK_STATEMENT'
   */
  static async extractDocument({ rawText, documentType = 'CAS' }) {
    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      throw new Error('Statement text or document payload is required.');
    }

    const cleanText = rawText.trim();
    
    // 1. Rule-based metadata extraction (PAN, Investor Name, Date Range)
    const panMatch = cleanText.match(/\b([A-Z]{5}[0-9]{4}[A-Z])\b/);
    const investorPan = panMatch ? panMatch[1] : null;

    const emailMatch = cleanText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/);
    const investorEmail = emailMatch ? emailMatch[0] : null;

    // Folio matching: e.g. "Folio No: 123456/78" or "Folio: 987654321"
    const folioMatches = cleanText.match(/(?:Folio(?:\s*No)?[:\s]+)([0-9A-Z\/\-]+)/gi) || [];
    const folios = Array.from(new Set(folioMatches.map((m) => m.replace(/Folio(?:\s*No)?[:\s]+/i, '').trim())));

    // 2. Transaction extraction with pattern scanning
    const transactions = [];
    const lines = cleanText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    // Common scheme keywords: Fund, Growth, Direct, Regular, Dividend, ETF, Cap
    const schemeRegex = /(?:Fund|Growth|Plan|Direct|Regular|Cap|Equity|Debt|Hybrid|Index|ETF|Treasury|Liquid)/i;
    // Date formats: DD-MMM-YYYY or DD/MM/YYYY or YYYY-MM-DD
    const dateRegex = /\b(\d{1,2}[-\/\.](?:[A-Za-z]{3}|\d{1,2})[-\/\.]\d{2,4})\b/;
    // Currency amounts: ₹1,500.00 or 1500.00
    const amountRegex = /(?:₹|\bINR\b)?\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,4})?)/g;

    let currentScheme = 'Consolidated Mutual Fund Scheme';
    let currentFolio = folios[0] || 'DEFAULT_FOLIO';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Track scheme headings
      if (schemeRegex.test(line) && line.length > 8 && line.length < 120 && !dateRegex.test(line)) {
        currentScheme = line.replace(/^[*\-#\s]+/, '').trim();
      }

      // Check for transaction rows containing a date and amount
      const dateMatch = line.match(dateRegex);
      if (dateMatch) {
        const lineWithoutDate = line.replace(dateMatch[0], '');
        const numbers = Array.from(lineWithoutDate.matchAll(amountRegex))
          .map((m) => parseFloat(m[1].replace(/,/g, '')))
          .filter((n) => !isNaN(n) && n > 0);

        if (numbers.length >= 1) {
          const isRedemption = /(?:Redemption|Sell|Switch\s*Out|Debit|Payout)/i.test(line);
          const isSip = /(?:SIP|Systematic|Auto\s*Debit)/i.test(line);

          const txnType = isRedemption ? 'Redemption' : isSip ? 'SIP Purchase' : 'Purchase';
          const amount = numbers[0];
          const units = numbers[1] || (numbers.length >= 3 ? numbers[2] : null);
          const nav = numbers.length >= 3 ? numbers[1] : null;

          transactions.push({
            date: dateMatch[1],
            schemeName: currentScheme,
            folio: currentFolio,
            transactionType: txnType,
            amount,
            units: units || FinancialService.round(amount / 50, 3), // default proxy if NAV not present
            nav: nav || FinancialService.round(amount / (units || 1), 4),
            rawLine: line,
          });
        }
      }
    }

    // 3. Fallback to Gemini LLM for complex unstructured statements if rule-based yield is sparse
    if (transactions.length === 0 && process.env.LLM_API_KEY) {
      try {
        const llmResult = await this._extractWithLLM(cleanText);
        if (llmResult && Array.isArray(llmResult.transactions) && llmResult.transactions.length > 0) {
          return {
            documentType,
            method: 'AI_VISION_LLM',
            investor: {
              pan: llmResult.pan || investorPan,
              name: llmResult.investorName || 'Unknown Investor',
              email: llmResult.email || investorEmail,
              folios: llmResult.folios || folios,
            },
            totalTransactions: llmResult.transactions.length,
            totalInvestment: llmResult.transactions
              .filter((t) => !t.transactionType?.toLowerCase().includes('redemption'))
              .reduce((acc, t) => acc + (Number(t.amount) || 0), 0),
            transactions: llmResult.transactions,
            extractedAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        logger.warn(`LLM statement extraction fallback failed: ${err.message}`);
      }
    }

    // Calculate totals
    const totalPurchases = transactions
      .filter((t) => !t.transactionType.includes('Redemption'))
      .reduce((acc, t) => acc + t.amount, 0);

    const totalRedemptions = transactions
      .filter((t) => t.transactionType.includes('Redemption'))
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      documentType,
      method: 'STRUCTURAL_PARSER',
      investor: {
        pan: investorPan,
        name: 'Extracted Client',
        email: investorEmail,
        folios,
      },
      summary: {
        totalTransactions: transactions.length,
        totalPurchases: FinancialService.round(totalPurchases, 2),
        totalRedemptions: FinancialService.round(totalRedemptions, 2),
        netInvested: FinancialService.round(totalPurchases - totalRedemptions, 2),
      },
      transactions: transactions.slice(0, 100), // safety ceiling
      extractedAt: new Date().toISOString(),
    };
  }

  /**
   * Internal helper using Gemini / OpenAI completion to extract structured JSON.
   */
  static async _extractWithLLM(textSnippet) {
    const apiKey = process.env.LLM_API_KEY;
    const apiUrl = process.env.LLM_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models';
    const model = process.env.LLM_MODEL || 'gemini-2.5-flash';

    const prompt = `
Extract mutual fund statement transactions into pure JSON format:
{
  "investorName": "...",
  "pan": "...",
  "folios": ["..."],
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "schemeName": "...",
      "transactionType": "Purchase | Redemption | SIP Purchase",
      "amount": 1000.0,
      "units": 25.5,
      "nav": 40.2
    }
  ]
}

Statement snippet:
${textSnippet.slice(0, 3500)}
`;

    const isGoogleDirect = apiUrl.includes('generativelanguage.googleapis.com/v1beta/models');
    let res;

    if (isGoogleDirect) {
      const fullUrl = `${apiUrl}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      res = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
        }),
      });
    } else {
      res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          temperature: 0.1,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
    }

    if (!res.ok) return null;
    const data = await res.json();
    let text = '';
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      text = data.candidates[0].content.parts[0].text;
    } else if (data?.choices?.[0]?.message?.content) {
      text = data.choices[0].message.content;
    }

    return JSON.parse(text);
  }
}

module.exports = DocumentExtractionService;
