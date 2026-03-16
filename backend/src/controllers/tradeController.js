const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const Trade = require('../models/Trade');
const { getTickers } = require('../services/binanceService');
const mongoose = require('mongoose');

// @desc    Place a new order
// @route   POST /api/trade/order
// @access  Private
const placeOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { pair, side, type, amount, price, stopPrice } = req.body;
    const userId = req.user._id;

    // Validate inputs
    if (!pair || !side || !type || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid order parameters' });
    }

    const [baseAsset, quoteAsset] = pair.split('/');

    // Check balances
    const quoteWallet = await Wallet.findOne({ userId, asset: quoteAsset }).session(session);
    const baseWallet = await Wallet.findOne({ userId, asset: baseAsset }).session(session);

    let requiredBalance = 0;
    let walletToLock;

    if (side === 'buy') {
      // For market buys we need to fetch current price or use an estimate (simplified here)
      const executionPrice = type === 'market' ? await getCurrentPrice(pair) : price;
      if (!executionPrice) throw new Error('Cannot determine price for market order');
      requiredBalance = executionPrice * amount;
      walletToLock = quoteWallet;

      if (!walletToLock || walletToLock.balance - walletToLock.locked < requiredBalance) {
        throw new Error('Insufficient quote asset balance');
      }

      walletToLock.locked += requiredBalance;
      await walletToLock.save({ session });
    } else {
      // Sell
      requiredBalance = amount;
      walletToLock = baseWallet;

      if (!walletToLock || walletToLock.balance - walletToLock.locked < requiredBalance) {
        throw new Error('Insufficient base asset balance');
      }

      walletToLock.locked += requiredBalance;
      await walletToLock.save({ session });
    }

    // Create order
    const order = new Order({
      userId,
      pair,
      side,
      type,
      amount,
      price: type === 'market' ? undefined : price,
      stopPrice: type === 'stop-limit' ? stopPrice : undefined,
      status: 'open',
    });

    await order.save({ session });

    // If market order, instantly execute it
    if (type === 'market') {
      await executeTrade(order, await getCurrentPrice(pair), session);
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(order);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get open orders
// @route   GET /api/trade/orders
// @access  Private
const getOpenOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id, status: 'open' }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching open orders' });
  }
};

// @desc    Get order history
// @route   GET /api/trade/history
// @access  Private
const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id, status: { $ne: 'open' } }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order history' });
  }
};

// @desc    Cancel order
// @route   DELETE /api/trade/order/:id
// @access  Private
const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id, status: 'open' }).session(session);

    if (!order) {
      throw new Error('Order not found or already closed');
    }

    order.status = 'canceled';
    await order.save({ session });

    // Unlock balance
    const [baseAsset, quoteAsset] = order.pair.split('/');
    if (order.side === 'buy') {
      const lockAmount = order.price * (order.amount - order.filled);
      await Wallet.updateOne({ userId: order.userId, asset: quoteAsset }, { $inc: { locked: -lockAmount } }).session(session);
    } else {
      const lockAmount = order.amount - order.filled;
      await Wallet.updateOne({ userId: order.userId, asset: baseAsset }, { $inc: { locked: -lockAmount } }).session(session);
    }

    await session.commitTransaction();
    session.endSession();
    res.json({ message: 'Order canceled successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// --- Helper Functions ---

const getCurrentPrice = async (pair) => {
  try {
    const tickers = await getTickers([pair]);
    const price = tickers[pair]?.last;
    if (!price) {
      // Fallback to individual fetch if multiple fetch failed
      const ticker = await require('../services/binanceService').exchange.fetchTicker(pair);
      return ticker.last;
    }
    return price;
  } catch (error) {
    console.error('Error getting current price:', error);
    return null;
  }
};

const executeTrade = async (order, executionPrice, session) => {
  const [baseAsset, quoteAsset] = order.pair.split('/');
  const tradeAmount = order.amount - order.filled;
  const totalValue = tradeAmount * executionPrice;

  // Create Trade Record
  const trade = new Trade({
    orderId: order._id,
    userId: order.userId,
    pair: order.pair,
    side: order.side,
    price: executionPrice,
    amount: tradeAmount,
    fee: 0, // Simplified fee structure
  });
  await trade.save({ session });

  // Update order
  order.filled += tradeAmount;
  order.status = 'closed';
  await order.save({ session });

  // Get/Create Wallets
  let baseWallet = await Wallet.findOne({ userId: order.userId, asset: baseAsset }).session(session);
  if (!baseWallet) {
    baseWallet = new Wallet({ userId: order.userId, asset: baseAsset });
    await baseWallet.save({ session });
  }
  let quoteWallet = await Wallet.findOne({ userId: order.userId, asset: quoteAsset }).session(session);
  if (!quoteWallet) {
    quoteWallet = new Wallet({ userId: order.userId, asset: quoteAsset });
    await quoteWallet.save({ session });
  }

  // Update Wallets
  if (order.side === 'buy') {
    // Unlock quote and deduct
    const originalLock = (order.price || executionPrice) * tradeAmount;
    quoteWallet.locked -= originalLock;
    quoteWallet.balance -= totalValue;
    // Add base
    baseWallet.balance += tradeAmount;
  } else {
    // Unlock base and deduct
    baseWallet.locked -= tradeAmount;
    baseWallet.balance -= tradeAmount;
    // Add quote
    quoteWallet.balance += totalValue;
  }

  await baseWallet.save({ session });
  await quoteWallet.save({ session });

  // Emit event to socket logic here if needed
  const { getIo } = require('../sockets/marketSocket');
  try {
    const io = getIo();
    io.to(order.userId.toString()).emit('trade_executed', trade);
    io.to(order.userId.toString()).emit('balance_update', { base: baseWallet, quote: quoteWallet });
  } catch (e) { /* io not init */ }
};

module.exports = {
  placeOrder,
  getOpenOrders,
  getOrderHistory,
  cancelOrder,
};
