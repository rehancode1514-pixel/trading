const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  asset: {
    type: String, // e.g., 'USDT', 'BTC', 'ETH'
    required: true,
    uppercase: true,
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  locked: { // Balance locked in open orders
    type: Number,
    default: 0,
    min: 0,
  }
}, { timestamps: true });

// Compound index to ensure one wallet per asset per user
walletSchema.index({ userId: 1, asset: 1 }, { unique: true });

module.exports = mongoose.model('Wallet', walletSchema);
