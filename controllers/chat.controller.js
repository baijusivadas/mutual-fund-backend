const { createControllerLogger } = require('../utils/logger');
const { getLiveIndices } = require('./market.controller');
const logger = createControllerLogger('chatController');

const SYSTEM_PROMPT = `
You are BrickWealth AI, an expert wealth intelligence and portfolio advisor assistant for the BrickWealth platform.

Your expertise includes:
- Portfolio tracking across mutual funds, direct equity/stocks, real estate, gold, flats, and rental properties.
- Performance metrics: XIRR (extended internal rate of return), CAGR, absolute returns, benchmark comparisons (vs Nifty 50, Sensex).
- Live stock market indices: NIFTY 50, BSE SENSEX, NIFTY BANK.
- Capital gains calculation: Short-Term Capital Gains (STCG) and Long-Term Capital Gains (LTCG) according to Indian tax regulations.
- Transaction data uploads: Guiding users to import Excel/CSV files, automapping investors to user portfolios, and handling duplicate checks.
- Liabilities, rentals, and cash flow tracking.
- Navigation of BrickWealth features and role management (SuperAdmin vs Standard User).

Rules:
1. Be concise, professional, warm, and practical.
2. Provide clear financial context and actionable guidance.
3. If discussing tax details, mention current Indian income tax guidelines (e.g. STCG at 20%, LTCG at 12.5% above ₹1.25 lakh exemption limit) and advise consulting a certified tax advisor for official filing.
4. Keep answers readable with markdown bullet points where appropriate.
`;

/**
 * Checks if a message is asking about live stock market indices or Nifty/Sensex levels.
 */
function isMarketLevelQuery(text) {
  const q = String(text || '').toLowerCase();
  return (
    q.includes('nifty') ||
    q.includes('sensex') ||
    q.includes('banknifty') ||
    q.includes('bank nifty') ||
    (q.includes('market') && (q.includes('level') || q.includes('today') || q.includes('status') || q.includes('current'))) ||
    (q.includes('index') && (q.includes('level') || q.includes('current')))
  );
}

/**
 * Builds a markdown response with real-time market levels.
 */
function formatMarketResponse(indices) {
  const nifty = indices.find((i) => i.code === 'NIFTY') || indices[0];
  const sensex = indices.find((i) => i.code === 'SENSEX');
  const bankNifty = indices.find((i) => i.code === 'BANKNIFTY');

  let response = `📈 **Current Market Levels (NSE & BSE)**:\n\n`;

  if (nifty) {
    const sign = nifty.pointChange >= 0 ? '+' : '';
    const arrow = nifty.isPositive ? '🟢 ▲' : '🔴 ▼';
    response += `• **NIFTY 50**: **${nifty.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}** (${sign}${nifty.pointChange} pts / ${sign}${nifty.percentChange}% ${arrow})\n`;
  }

  if (sensex) {
    const sign = sensex.pointChange >= 0 ? '+' : '';
    const arrow = sensex.isPositive ? '🟢 ▲' : '🔴 ▼';
    response += `• **BSE SENSEX**: **${sensex.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}** (${sign}${sensex.pointChange} pts / ${sign}${sensex.percentChange}% ${arrow})\n`;
  }

  if (bankNifty) {
    const sign = bankNifty.pointChange >= 0 ? '+' : '';
    const arrow = bankNifty.isPositive ? '🟢 ▲' : '🔴 ▼';
    response += `• **NIFTY BANK**: **${bankNifty.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}** (${sign}${bankNifty.pointChange} pts / ${sign}${bankNifty.percentChange}% ${arrow})\n`;
  }

  const timestamp = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  response += `\n*Market Status: ${nifty?.marketStatus || 'LIVE'} | Refreshed at ${timestamp} IST | Sources: NSE & BSE India*`;
  return response;
}

const handleChat = async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  const safeMessages = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-10)
    .map((m) => ({ role: m.role, content: String(m.content).trim().slice(0, 2000) }))
    .filter((m) => m.content.length > 0);

  if (safeMessages.length === 0) {
    return res.status(400).json({ error: 'Please enter a message.' });
  }

  const latestUserMessage = [...safeMessages].reverse().find((m) => m.role === 'user')?.content || '';

  // 1. Check for real-time market level query (e.g. "give me the current nifty level's")
  if (isMarketLevelQuery(latestUserMessage)) {
    try {
      const indices = await getLiveIndices();
      const marketText = formatMarketResponse(indices);
      return res.json({ message: marketText });
    } catch (err) {
      logger.warn(`Failed to fetch live indices for chat: ${err.message}`);
    }
  }

  const apiKey = process.env.LLM_API_KEY || '';
  const apiUrl = process.env.LLM_API_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
  const model = process.env.LLM_MODEL || 'gemini-2.5-flash';

  // If external LLM key is not configured, deliver domain response gracefully
  if (!apiKey || apiKey === 'your-llm-api-key') {
    const q = latestUserMessage.toLowerCase();
    let reply = '';

    if (q.includes('portfolio') && (q.includes('value') || q.includes('total'))) {
      reply = 'Your total portfolio value is calculated from all your mutual fund holdings, real estate, gold, and other investments. Navigate to the **Dashboard** to see your consolidated net worth with real-time valuations.';
    } else if (q.includes('xirr')) {
      reply = '**XIRR (Extended Internal Rate of Return)** measures your actual annualized returns considering the exact timing and amount of each cash flow. Unlike simple returns, XIRR accounts for SIP installments at different dates, giving a more accurate picture of your investment performance.';
    } else if (q.includes('sip') && q.includes('lump')) {
      reply = '**SIP (Systematic Investment Plan)** invests a fixed amount monthly — great for averaging costs and building discipline. **Lumpsum** invests a large amount at once — better when markets are low. For long-term wealth creation, SIP is generally recommended for retail investors.';
    } else if (q.includes('upload') || (q.includes('transaction') && q.includes('data'))) {
      reply = 'To upload transactions:\n1. Go to **Admin → Data Upload**\n2. Download the sample Excel/CSV template\n3. Fill in investor name, scheme, units, NAV, date\n4. Upload the file\n\nThe system will auto-map investors and reflect data in 2–3 seconds.';
    } else if (q.includes('capital gain')) {
      reply = '**Capital Gains** are profits from selling mutual fund units:\n- **Short Term** (held < 1 year): Taxed at 20%\n- **Long Term** (held ≥ 1 year): Taxed at 12.5% above ₹1.25 lakh exemption\n\nView your detailed capital gains breakdown in the **Capital Gains** page.';
    } else {
      reply = "I'm your BrickWealth AI assistant. You can ask me:\n- \"Give me the current Nifty level's\"\n- \"What is my total portfolio value?\"\n- \"Explain XIRR vs absolute return\"\n- \"How to upload transaction data?\"\n- \"Explain SIP vs Lumpsum\"\n\nHow can I help you today? 🤖";
    }

    return res.json({ message: reply });
  }

  try {
    const isGoogleDirect = apiUrl.includes('generativelanguage.googleapis.com/v1beta/models');
    let externalRes;

    // Inject live market context if available
    let dynamicPrompt = SYSTEM_PROMPT;
    try {
      const indices = await getLiveIndices();
      dynamicPrompt += `\n\nCurrent Real-Time Market Indices Context:\n${indices.map((i) => `- ${i.name}: ${i.value} (${i.pointChange >= 0 ? '+' : ''}${i.pointChange} / ${i.percentChange}%)`).join('\n')}\n`;
    } catch (_) {}

    if (isGoogleDirect) {
      const fullUrl = `${apiUrl}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const payload = {
        systemInstruction: { parts: [{ text: dynamicPrompt }] },
        contents: safeMessages.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        generationConfig: { temperature: 0.3, maxOutputTokens: 1000 },
      };

      externalRes = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      const payload = {
        model,
        temperature: 0.3,
        messages: [{ role: 'system', content: dynamicPrompt }, ...safeMessages],
      };

      externalRes = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });
    }

    const data = await externalRes.json().catch(() => null);

    if (!externalRes.ok) {
      const errorMsg = data?.error?.message || data?.message || `AI provider returned ${externalRes.status}`;
      logger.warn(`AI provider error: ${errorMsg}`);
      return res.status(externalRes.status >= 400 && externalRes.status < 600 ? externalRes.status : 502).json({
        error: errorMsg,
      });
    }

    let extractedText = '';
    if (data?.choices && Array.isArray(data.choices) && data.choices[0]?.message?.content) {
      extractedText = data.choices[0].message.content;
    } else if (data?.candidates && Array.isArray(data.candidates) && data.candidates[0]?.content?.parts?.[0]?.text) {
      extractedText = data.candidates[0].content.parts.map((p) => p.text).join('');
    }

    if (!extractedText) {
      return res.status(502).json({ error: 'Empty response received from AI model.' });
    }

    return res.json({ message: extractedText.trim().slice(0, 4000) });
  } catch (err) {
    logger.error(`Chat error: ${err.message}`);
    return res.status(502).json({ error: `AI service error: ${err.message}` });
  }
};

module.exports = { handleChat };
