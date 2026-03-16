const FuturesPosition = require('../models/FuturesPosition');
const Wallet = require('../models/Wallet');

// Open a new futures position
exports.openPosition = async (req, res) => {
  try {
    const { pair, side, leverage, marginType, size, takeProfitPrice, stopLossPrice, entryPrice } = req.body;
    const userId = req.user.id;

    if (!['long', 'short'].includes(side)) return res.status(400).json({ message: 'Invalid side' });
    if (leverage < 1 || leverage > 125) return res.status(400).json({ message: 'Leverage must be 1x-125x' });

    const margin = parseFloat(size) / parseFloat(leverage);

    // Check wallet balance (using flat Wallet model)
    const wallet = await Wallet.findOne({ userId, asset: 'USDT' });
    if (!wallet || wallet.balance < margin) {
      return res.status(400).json({ message: 'Insufficient USDT margin balance' });
    }

    // Lock margin from available balance
    wallet.balance -= margin;
    wallet.locked = (wallet.locked || 0) + margin;
    await wallet.save();

    // Calculate liquidation price
    const maintenanceMarginRate = 0.005;
    let liquidationPrice;
    if (side === 'long') {
      liquidationPrice = entryPrice * (1 - (1 / leverage) + maintenanceMarginRate);
    } else {
      liquidationPrice = entryPrice * (1 + (1 / leverage) - maintenanceMarginRate);
    }

    const position = new FuturesPosition({
      userId, pair, side, leverage, marginType,
      entryPrice, size, margin,
      takeProfitPrice: takeProfitPrice || null,
      stopLossPrice: stopLossPrice || null,
      liquidationPrice,
      markPrice: entryPrice,
    });

    await position.save();
    res.status(201).json({ message: 'Position opened', position });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Close a futures position
exports.closePosition = async (req, res) => {
  try {
    const { positionId, closePrice } = req.body;
    const userId = req.user.id;

    const position = await FuturesPosition.findOne({ _id: positionId, userId, status: 'open' });
    if (!position) return res.status(404).json({ message: 'Position not found' });

    // Calculate PnL
    const priceDiff = closePrice - position.entryPrice;
    const pnlRaw = (position.side === 'long' ? priceDiff : -priceDiff) / position.entryPrice * position.size;

    position.realizedPnl = pnlRaw;
    position.status = 'closed';
    position.closedAt = new Date();
    await position.save();

    // Return margin + PnL to wallet (using flat Wallet model)
    const wallet = await Wallet.findOne({ userId, asset: 'USDT' });
    if (wallet) {
      wallet.balance += Math.max(0, returnAmount);
      wallet.locked = Math.max(0, (wallet.locked || 0) - position.margin);
      await wallet.save();
    }

    res.json({ message: 'Position closed', realizedPnl: pnlRaw, position });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all open positions
exports.getPositions = async (req, res) => {
  try {
    const positions = await FuturesPosition.find({ userId: req.user.id, status: 'open' }).sort({ createdAt: -1 });
    res.json(positions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get closed positions (history)
exports.getPositionHistory = async (req, res) => {
  try {
    const positions = await FuturesPosition.find({ userId: req.user.id, status: { $in: ['closed', 'liquidated'] } }).sort({ closedAt: -1 }).limit(50);
    res.json(positions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get funding rate info (mocked near real Binance values)
exports.getFundingRates = async (req, res) => {
  const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'DOGE/USDT'];
  const rates = pairs.map(p => ({
    pair: p,
    rate: (Math.random() * 0.002 - 0.001).toFixed(4),
    nextFunding: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
  }));
  res.json(rates);
};

// Liquidation calculator helper
exports.calculateLiquidation = async (req, res) => {
  const { entryPrice, leverage, side } = req.query;
  const lev = parseFloat(leverage) || 10;
  const entry = parseFloat(entryPrice) || 30000;
  const mmr = 0.005;
  let liqPrice;
  if (side === 'long') {
    liqPrice = entry * (1 - (1 / lev) + mmr);
  } else {
    liqPrice = entry * (1 + (1 / lev) - mmr);
  }
  res.json({ liquidationPrice: liqPrice.toFixed(2), entryPrice: entry, leverage: lev, side });
};
