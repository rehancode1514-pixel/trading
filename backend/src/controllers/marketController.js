const { getTickers, getKlines } = require('../services/binanceService');

// @desc    Get tickers for top pairs
// @route   GET /api/market/tickers
// @access  Public
const getMarketTickers = async (req, res) => {
  try {
    const symbols = req.query.symbols ? req.query.symbols.split(',') : ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT', 'ADA/USDT'];
    const tickers = await getTickers(symbols);
    res.json(tickers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching market tickers' });
  }
};

// @desc    Get historical klines
// @route   GET /api/market/klines
// @access  Public
const getMarketKlines = async (req, res) => {
  try {
    const { symbol, timeframe, limit } = req.query;
    
    if (!symbol) {
      return res.status(400).json({ message: 'Symbol is required' });
    }
    
    const klines = await getKlines(symbol, timeframe || '1h', limit ? parseInt(limit) : 100);
    res.json(klines);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching market klines' });
  }
};

module.exports = {
  getMarketTickers,
  getMarketKlines,
};
