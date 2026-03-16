const Order = require('../models/Order');
const Trade = require('../models/Trade');
const Wallet = require('../models/Wallet');
const { getTickers } = require('./binanceService');
const mongoose = require('mongoose');

// This worker runs periodically to check open limit/stop-limit orders
// against current market prices and executes them if conditions are met.

const runTradeWorker = async () => {
  try {
    // Get all open limit and stop-limit orders
    const openOrders = await Order.find({ status: 'open', type: { $in: ['limit', 'stop-limit'] } });
    
    if (openOrders.length === 0) return;

    // Get unique pairs from open orders
    const pairs = [...new Set(openOrders.map(o => o.pair))];
    const tickers = await getTickers(pairs);

    for (const order of openOrders) {
      const currentPrice = tickers[order.pair]?.last;
      
      if (!currentPrice) continue;

      let shouldExecute = false;
      let executionPrice = currentPrice;

      if (order.type === 'limit') {
        if (order.side === 'buy' && currentPrice <= order.price) {
          shouldExecute = true;
          executionPrice = order.price; // execute at requested limit price or better
        } else if (order.side === 'sell' && currentPrice >= order.price) {
          shouldExecute = true;
          executionPrice = order.price;
        }
      } else if (order.type === 'stop-limit') {
        // Simplified stop-limit: if stop price hit, convert to limit order (we abstract this to just execute if limit hit too)
        if (order.side === 'buy' && currentPrice >= order.stopPrice) {
          // In real exchange, it becomes a limit order but we simplify for mock trading.
          if (currentPrice <= order.price) {
             shouldExecute = true;
             executionPrice = order.price;
          }
        } else if (order.side === 'sell' && currentPrice <= order.stopPrice) {
          if (currentPrice >= order.price) {
            shouldExecute = true;
            executionPrice = order.price;
          }
        }
      }

      if (shouldExecute) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
          await executeTradeInternal(order, executionPrice, session);
          await session.commitTransaction();
        } catch (err) {
          console.error(`Error executing limit order ${order._id}:`, err);
          await session.abortTransaction();
        } finally {
          session.endSession();
        }
      }
    }
  } catch (error) {
    console.error('Trade worker error:', error);
  }
};

const executeTradeInternal = async (order, executionPrice, session) => {
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
    fee: 0,
  });
  await trade.save({ session });

  // Update order
  order.filled += tradeAmount;
  order.status = 'closed';
  await order.save({ session });

  // Update Wallets
  let baseWallet = await Wallet.findOne({ userId: order.userId, asset: baseAsset }).session(session);
  if (!baseWallet) baseWallet = new Wallet({ userId: order.userId, asset: baseAsset });
  
  let quoteWallet = await Wallet.findOne({ userId: order.userId, asset: quoteAsset }).session(session);
  if (!quoteWallet) quoteWallet = new Wallet({ userId: order.userId, asset: quoteAsset });

  if (order.side === 'buy') {
    const originalLock = order.price * tradeAmount; // Limit price * amount
    quoteWallet.locked -= originalLock;
    quoteWallet.balance -= originalLock; // Since we locked the quote amount
    
    // If execution was cheaper, refund the difference (simplified)
    const refund = originalLock - totalValue;
    if (refund > 0) quoteWallet.balance += refund;

    baseWallet.balance += tradeAmount;
  } else {
    baseWallet.locked -= tradeAmount;
    baseWallet.balance -= tradeAmount;
    quoteWallet.balance += totalValue;
  }

  await baseWallet.save({ session });
  await quoteWallet.save({ session });

  const { getIo } = require('../sockets/marketSocket');
  try {
    const io = getIo();
    io.to(order.userId.toString()).emit('trade_executed', trade);
    io.to(order.userId.toString()).emit('balance_update', { base: baseWallet, quote: quoteWallet });
  } catch (e) { /* io not init */ }
};

const startTradeWorker = () => {
  // Run every 5 seconds
  setInterval(runTradeWorker, 5000);
  console.log('Mock Trade Engine Worker started');
};

module.exports = { startTradeWorker };
