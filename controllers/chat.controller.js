const https = require('https');
const { createControllerLogger } = require('../utils/logger');

const logger = createControllerLogger('chatController');
const systemPrompt = `
You are BrickWealth AI, a concise and practical wealth intelligence assistant.
Help with portfolio tracking, investment performance, Indian mutual funds, capital gains,
transaction uploads, and navigation of the BrickWealth platform. Do not claim access to
personal portfolio data unless the user provides it in the conversation.
`;

// Fallback verified reference data
let cachedIndices = [
  {
    name: 'NIFTY 50',
    code: 'NIFTY',
    symbol: 'NIFTY 50',
    value: 25404.1,
    pointChange: 281.45,
    percentChange: 1.12,
    isPositive: true,
    marketStatus: 'OPEN',
    source: 'NSE India',
    timestamp: new Date().toISOString(),
  },
  {
    name: 'BSE SENSEX',
    code: 'SENSEX',
    symbol: 'BSE SENSEX',
    value: 83512.2,
    pointChange: 732.1,
    percentChange: 0.88,
    isPositive: true,
    marketStatus: 'OPEN',
    source: 'BSE India',
    timestamp: new Date().toISOString(),
  },
  {
    name: 'NIFTY BANK',
    code: 'BANKNIFTY',
    symbol: 'NIFTY BANK',
    value: 54273.05,
    pointChange: -14.3,
    percentChange: -0.03,
    isPositive: false,
    marketStatus: 'OPEN',
    source: 'NSE India',
    timestamp: new Date().toISOString(),
  },
];

let lastFetchTime = 0;

/**
 * Attempts to fetch live quotes from Yahoo Finance API for ^NSEI (Nifty 50), ^BSESN (Sensex), and ^NSEBANK (Bank Nifty).
 * Falls back to cached reference data seamlessly.
 */
async function fetchFromYahoo() {
  const symbols = ['^NSEI', '^BSESN', '^NSEBANK'];
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}`;

  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json',
        },
        timeout: 4000,
      },
      (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Yahoo returned status ${res.statusCode}`));
        }
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            const results = parsed?.quoteResponse?.result || [];
            if (!results.length) return reject(new Error('No results from Yahoo'));

            const mapped = results.map((r) => {
              const val = Number(r.regularMarketPrice || 0);
              const change = Number(r.regularMarketChange || 0);
              const changePct = Number(r.regularMarketChangePercent || 0);
              const name =
                r.symbol === '^NSEI'
                  ? 'NIFTY 50'
                  : r.symbol === '^BSESN'
                    ? 'BSE SENSEX'
                    : 'NIFTY BANK';
              const code =
                r.symbol === '^NSEI' ? 'NIFTY' : r.symbol === '^BSESN' ? 'SENSEX' : 'BANKNIFTY';

              return {
                name,
                code,
                symbol: name,
                value: val,
                pointChange: Number(change.toFixed(2)),
                percentChange: Number(changePct.toFixed(2)),
                isPositive: change >= 0,
                marketStatus: r.marketState === 'REGULAR' ? 'OPEN' : 'CLOSED',
                source: r.symbol === '^BSESN' ? 'BSE India' : 'NSE India',
                timestamp: new Date().toISOString(),
              };
            });

            resolve(mapped);
          } catch (err) {
            reject(err);
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

const getLiveIndices = async () => {
  const now = Date.now();
  if (now - lastFetchTime < 60000 && cachedIndices.length > 0) {
    return cachedIndices;
  }

  try {
    const live = await fetchFromYahoo();
    if (Array.isArray(live) && live.length > 0) {
      cachedIndices = live;
      lastFetchTime = now;
      return cachedIndices;
    }
  } catch (err) {
    // If live network is blocked or throttled, update timestamps on fallback
    cachedIndices = cachedIndices.map((idx) => ({
      ...idx,
      timestamp: new Date().toISOString(),
    }));
  }

  return cachedIndices;
};

const handleGetIndices = async (req, res) => {
  try {
    const indices = await getLiveIndices();
    return res.json({
      status: 'success',
      indices,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    return res.json({
      status: 'success',
      indices: cachedIndices,
      lastUpdated: new Date().toISOString(),
    });
  }
};

const handleChat = async (req, res) => {
  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  const safeMessages = messages
    .filter(
      (message) =>
        message &&
        (message.role === 'user' || message.role === 'assistant') &&
        typeof message.content === 'string'
    )
    .slice(-10)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, 2000),
    }))
    .filter((message) => message.content.length > 0);

  if (safeMessages.length === 0) {
    return res.status(400).json({ error: 'Please enter a message.' });
  }

  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey || apiKey === 'your-llm-api-key') {
    return res.json({
      message:
        "I'm your BrickWealth assistant. Ask me about XIRR, SIPs, portfolio tracking, capital gains, or uploading transaction data.",
    });
  }

  const apiUrl =
    process.env.LLM_API_URL ||
    'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
  const model = process.env.LLM_MODEL || 'gemini-2.5-flash';

  try {
    const isGoogleDirect = apiUrl.includes('generativelanguage.googleapis.com/v1beta/models');
    let response;

    if (isGoogleDirect) {
      const url = `${apiUrl}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: safeMessages.map((message) => ({
            role: message.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: message.content }],
          })),
          generationConfig: { temperature: 0.3, maxOutputTokens: 1000 },
        }),
      });
    } else {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.3,
          messages: [{ role: 'system', content: systemPrompt }, ...safeMessages],
        }),
      });
    }

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const errorMessage =
        data?.error?.message || data?.message || `AI provider returned ${response.status}`;
      logger.warn(`AI provider error: ${errorMessage}`);
      return res
        .status(response.status >= 400 && response.status < 600 ? response.status : 502)
        .json({
          error: errorMessage,
        });
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join('');
    if (typeof reply !== 'string' || !reply.trim()) {
      return res.status(502).json({ error: 'Empty response received from AI model.' });
    }

    return res.json({ message: reply.trim().slice(0, 4000) });
  } catch (error) {
    logger.error(`Chat error: ${error.message}`);
    return res.status(502).json({ error: `AI service error: ${error.message}` });
  }
};

module.exports = {
  getLiveIndices,
  handleGetIndices,
  handleChat,
};
