const { createControllerLogger } = require('../utils/logger');
const logger = createControllerLogger('chatController');

const SYSTEM_PROMPT = `
You are BrickWealth AI, an expert wealth intelligence and portfolio advisor assistant for the BrickWealth platform.

Your expertise includes:
- Portfolio tracking across mutual funds, direct equity/stocks, real estate, gold, flats, and rental properties.
- Performance metrics: XIRR (extended internal rate of return), CAGR, absolute returns, benchmark comparisons (vs Nifty 50, Sensex).
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

  const apiKey = process.env.LLM_API_KEY || '';
  const apiUrl = process.env.LLM_API_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
  const model = process.env.LLM_MODEL || 'gemini-2.5-flash';

  if (!apiKey || apiKey === 'your-llm-api-key') {
    return res.status(503).json({
      error: 'LLM_API_KEY is not configured yet. Please configure LLM_API_KEY in your environment.',
    });
  }

  try {
    const isGoogleDirect = apiUrl.includes('generativelanguage.googleapis.com/v1beta/models');
    let externalRes;

    if (isGoogleDirect) {
      const fullUrl = `${apiUrl}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const payload = {
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
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
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...safeMessages],
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
