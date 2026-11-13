const { createControllerLogger } = require('../utils/logger');
const MarketService = require('../services/market.service');
const logger = createControllerLogger('chatController');

const BASE_SYSTEM_PROMPT = `
You are BrickWealth AI, an elite wealth intelligence and portfolio advisor assistant for the BrickWealth platform.

Your capabilities:
1. Portfolio tracking: Mutual funds, Direct stocks, Real estate, Gold (MCX / Sovereign bonds), Flats, Rental income yields, and Liabilities.
2. Financial analysis: XIRR, CAGR, absolute returns, asset allocation drift, SIP discipline, and benchmark comparisons (Nifty 50, Sensex).
3. Capital gains taxation: Indian Finance Act 2024 regulations:
   - Equity MF STCG (holding period <= 12 months): 20%
   - Equity MF LTCG (holding period > 12 months): 12.5% above ₹1.25 Lakh annual exemption limit
   - Debt funds (purchased after April 1, 2023): Taxed at individual slab rates
4. Real-time market context: You have direct access to live Indian benchmark indices and commodity rates provided in the context below. Always quote these numbers accurately when asked.

Tone and style:
- Precise, authoritative, concise, polite, and practical.
- Use clean Markdown tables and bullet points for readability.
- When asked for current Nifty / Sensex / Gold levels, cite the live data from the context.
`;

const handleChat = async (req, res) => {
  const { messages, portfolioContext } = req.body;
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

  const apiKey = process.env.LLM_API_KEY || '';
  const apiUrl = process.env.LLM_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models';
  const model = process.env.LLM_MODEL || 'gemini-2.5-flash';

  if (!apiKey || apiKey === 'your-llm-api-key') {
    return res.status(503).json({
      error: 'LLM_API_KEY is not configured yet. Please configure LLM_API_KEY in your environment.',
    });
  }

  // Enforce authenticated investor context authorization
  if (portfolioContext && portfolioContext.investorName && req.user) {
    const investorName = String(portfolioContext.investorName).trim();
    const isElevated =
      req.user.role === 'superAdmin' || req.user.role === 'advisor' || req.user.role === 'orgAdmin';

    if (!isElevated && investorName !== 'Valued Client' && investorName !== 'Client') {
      const db = require('../models');
      const isSelf = req.user.name && req.user.name.toLowerCase() === investorName.toLowerCase();
      if (!isSelf && db.user_investor_mappings) {
        const mapping = await db.user_investor_mappings.findOne({
          where: { user_id: req.user.id, investor_name: investorName },
        });
        if (!mapping) {
          logger.warn(
            `Unauthorized investor access attempt by user ${req.user.id} for investor ${investorName}`
          );
          return res.status(403).json({
            success: false,
            status: 'error',
            statusCode: 403,
            errorCode: 'FORBIDDEN_INVESTOR_CONTEXT',
            message: `You do not have permission to query portfolio data for investor '${investorName}'.`,
          });
        }
      }
    }
  }

  try {
    // 1. Fetch live market benchmarks for real-time market grounding
    const liveIndices = await MarketService.getIndices().catch(() => []);
    const marketSummaryText = liveIndices.length > 0
      ? liveIndices
          .map(
            (i) =>
              `- ${i.name} (${i.symbol}): ${i.value.toLocaleString('en-IN')} (${i.changePercent >= 0 ? '+' : ''}${i.changePercent}%) [Exchange: ${i.exchange}]`
          )
          .join('\n')
      : 'Market benchmarks temporarily unavailable.';

    // 2. Format user's specific portfolio context if provided
    let userContextText = 'No specific portfolio context provided by client.';
    if (portfolioContext && typeof portfolioContext === 'object') {
      userContextText = `
Active Investor Context:
- Investor: ${portfolioContext.investorName || 'Valued Client'}
- Current Portfolio Value: ₹${Number(portfolioContext.currentValue || 0).toLocaleString('en-IN')}
- Total Invested: ₹${Number(portfolioContext.totalInvested || 0).toLocaleString('en-IN')}
- Absolute Return: ${portfolioContext.gainPercentage || 'N/A'}
- Net Worth (Including Real Estate, Gold, Assets): ₹${Number(portfolioContext.netWorth || 0).toLocaleString('en-IN')}
- Active SIP Book: ₹${Number(portfolioContext.sipBook || 0).toLocaleString('en-IN')} / month
- Top Holdings: ${Array.isArray(portfolioContext.topHoldings) ? portfolioContext.topHoldings.map((h) => `${h.name} (₹${h.value})`).join(', ') : 'Diversified across equity and debt funds'}
`;
    }

    // 3. Assemble dynamic enriched system instruction
    const dynamicSystemInstruction = `
${BASE_SYSTEM_PROMPT}

─── LIVE MARKET BENCHMARKS (CURRENT TICKS) ───
${marketSummaryText}

─── ACTIVE CLIENT WEALTH CONTEXT ───
${userContextText}
`;

    const isGoogleDirect = apiUrl.includes('generativelanguage.googleapis.com/v1beta/models');
    let externalRes;

    if (isGoogleDirect) {
      const fullUrl = `${apiUrl}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const payload = {
        systemInstruction: { parts: [{ text: dynamicSystemInstruction }] },
        contents: safeMessages.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        generationConfig: { temperature: 0.25, maxOutputTokens: 1200 },
      };

      externalRes = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      const payload = {
        model,
        temperature: 0.25,
        messages: [{ role: 'system', content: dynamicSystemInstruction }, ...safeMessages],
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

    return res.json({ message: extractedText.trim() });
  } catch (err) {
    logger.error(`Chat error: ${err.message}`);
    return res.status(502).json({ error: `AI service error: ${err.message}` });
  }
};

module.exports = { handleChat };
