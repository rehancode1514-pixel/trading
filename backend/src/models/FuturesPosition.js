const mongoose = require('mongoose');

const futuresPositionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pair: { type: String, required: true, uppercase: true },
  side: { type: String, enum: ['long', 'short'], required: true },
  leverage: { type: Number, default: 1, min: 1, max: 125 },
  marginType: { type: String, enum: ['cross', 'isolated'], default: 'isolated' },
  
  // Entry data
  entryPrice: { type: Number, required: true },
  size: { type: Number, required: true },  // notional in USDT
  margin: { type: Number, required: true }, // collateral locked
  
  // TP/SL
  takeProfitPrice: { type: Number, default: null },
  stopLossPrice: { type: Number, default: null },
  
  // Live values
  markPrice: { type: Number, default: 0 },
  unrealizedPnl: { type: Number, default: 0 },
  liquidationPrice: { type: Number, default: 0 },
  
  status: { type: String, enum: ['open', 'closed', 'liquidated'], default: 'open' },
  closedAt: { type: Date },
  realizedPnl: { type: Number, default: 0 },
}, { timestamps: true });

// Compute liquidation price
futuresPositionSchema.methods.calculateLiquidationPrice = function() {
  const maintenanceMarginRate = 0.005; // 0.5%
  const { side, entryPrice, leverage, marginType } = this;
  
  if (side === 'long') {
    this.liquidationPrice = entryPrice * (1 - (1 / leverage) + maintenanceMarginRate);
  } else {
    this.liquidationPrice = entryPrice * (1 + (1 / leverage) - maintenanceMarginRate);
  }
  return this.liquidationPrice;
};

module.exports = mongoose.model('FuturesPosition', futuresPositionSchema);
