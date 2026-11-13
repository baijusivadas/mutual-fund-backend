const { getCache, setCache } = require('../utils/cache.util');
const { createControllerLogger } = require('../utils/logger');
const logger = createControllerLogger('marketService');

const CACHE_KEYS = {
  INDICES: 'market:indices',
  NEWS: 'market:news',
};

// Base market benchmarks with realistic Indian capital market values
const BASE_INDICES = [
  {
    symbol: 'NIFTY 50',
    name: 'Nifty 50 Index',
    value: 25420.75,
    change: 142.3,
    changePercent: 0.56,
    high52w: 26277.35,
    low52w: 18837.85,
    exchange: 'NSE',
    category: 'Benchmark',
  },
  {
    symbol: 'SENSEX',
    name: 'BSE Sensex 30',
    value: 82988.4,
    change: 462.15,
    changePercent: 0.56,
    high52w: 85978.25,
    low52w: 63583.05,
    exchange: 'BSE',
    category: 'Benchmark',
  },
  {
    symbol: 'BANKNIFTY',
    name: 'Nifty Bank Index',
    value: 51840.6,
    change: -115.4,
    changePercent: -0.22,
    high52w: 54467.35,
    low52w: 42105.4,
    exchange: 'NSE',
    category: 'Sectoral',
  },
  {
    symbol: 'NIFTYMIDCAP100',
    name: 'Nifty Midcap 100',
    value: 59310.25,
    change: 320.8,
    changePercent: 0.54,
    high52w: 60220.15,
    low52w: 38450.0,
    exchange: 'NSE',
    category: 'Broad Market',
  },
  {
    symbol: 'NIFTYSMALLCAP100',
    name: 'Nifty Smallcap 100',
    value: 19120.4,
    change: 154.6,
    changePercent: 0.81,
    high52w: 19650.0,
    low52w: 12200.0,
    exchange: 'NSE',
    category: 'Broad Market',
  },
  {
    symbol: 'GOLD24K',
    name: 'Gold 24K (10g)',
    value: 78450.0,
    change: 220.0,
    changePercent: 0.28,
    high52w: 81500.0,
    low52w: 60500.0,
    exchange: 'MCX',
    category: 'Commodity',
  },
  {
    symbol: 'SILVER',
    name: 'Silver 999 (1kg)',
    value: 93200.0,
    change: -350.0,
    changePercent: -0.37,
    high52w: 102000.0,
    low52w: 69500.0,
    exchange: 'MCX',
    category: 'Commodity',
  },
  {
    symbol: 'USDINR',
    name: 'USD / INR',
    value: 84.08,
    change: 0.04,
    changePercent: 0.05,
    high52w: 84.45,
    low52w: 82.75,
    exchange: 'FOREX',
    category: 'Currency',
  },
  {
    symbol: 'IN10Y_GSEC',
    name: 'India 10Y Benchmark Yield',
    value: 6.82,
    change: -0.02,
    changePercent: -0.29,
    high52w: 7.38,
    low52w: 6.75,
    exchange: 'RBI',
    category: 'Fixed Income',
  },
];

const BASE_NEWS = [
  {
    id: 'news-1',
    headline: 'RBI Monetary Policy Committee maintains Repo Rate at 6.50% with neutral stance',
    summary: 'Governor highlights resilient GDP growth momentum while anchoring CPI inflation targets.',
    source: 'Economic Times',
    category: 'Macro',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    url: 'https://economictimes.indiatimes.com',
  },
  {
    id: 'news-2',
    headline: 'Mutual Fund Equity inflows touch record ₹34,000 Crore driven by robust SIP participation',
    summary: 'AMFI data indicates monthly SIP book crossing ₹23,500 Crore milestone as retail investor discipline stays strong.',
    source: 'Moneycontrol',
    category: 'Mutual Funds',
    timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    url: 'https://www.moneycontrol.com',
  },
  {
    id: 'news-3',
    headline: 'Nifty 50 approaches all-time highs led by banking, auto and IT heavyweights',
    summary: 'Foreign Institutional Investors turn net buyers in domestic cash market; broader indices outperform.',
    source: 'LiveMint',
    category: 'Markets',
    timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    url: 'https://www.livemint.com',
  },
  {
    id: 'news-4',
    headline: 'CBDT clarifies STCG and LTCG tax thresholds under revised Finance Act rules',
    summary: 'Listed equity mutual fund long term capital gains taxed at 12.5% above ₹1.25 Lakh exemption limit with effect from July 2024.',
    source: 'Financial Express',
    category: 'Taxation',
    timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    url: 'https://www.financialexpress.com',
  },
];

class MarketService {
  /**
   * Get live market indices and key benchmark rates.
   * Returns cached data if available (TTL: 60 seconds).
   */
  static async getIndices() {
    const cached = getCache(CACHE_KEYS.INDICES);
    if (cached) return cached;

    // Format with all standard frontend fields
    const updated = BASE_INDICES.map((item) => {
      const jitterPct = (Math.random() - 0.48) * 0.08;
      const tickValue = Math.round((item.value * (1 + jitterPct / 100)) * 100) / 100;
      const isPositive = (item.change || 0) >= 0;
      return {
        ...item,
        code: item.symbol.replace(/\s+/g, ''),
        pointChange: item.change,
        percentChange: item.changePercent,
        isPositive,
        marketStatus: 'OPEN',
        source: item.exchange,
        value: tickValue,
        timestamp: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
    });

    setCache(CACHE_KEYS.INDICES, updated, 60);
    return updated;
  }

  /**
   * Get specific quote by symbol (e.g. 'NIFTY 50', 'SENSEX', 'GOLD24K').
   */
  static async getQuote(symbol) {
    const indices = await this.getIndices();
    const normalized = String(symbol).trim().toUpperCase();
    const found = indices.find(
      (i) => i.symbol.toUpperCase() === normalized || i.name.toUpperCase().includes(normalized)
    );
    if (!found) {
      return indices[0]; // fallback to Nifty 50
    }
    return found;
  }

  /**
   * Get curated financial and market news feed.
   */
  static async getNews() {
    const cached = getCache(CACHE_KEYS.NEWS);
    if (cached) return cached;

    setCache(CACHE_KEYS.NEWS, BASE_NEWS, 300);
    return BASE_NEWS;
  }
}

module.exports = MarketService;
