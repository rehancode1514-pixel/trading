const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pair: {
    type: String, // e.g., 'BTC/USDT'
    required: true,
    uppercase: true,
  },
  type: {
    type: String,
    enum: ['market', 'limit', 'stop-limit'],
    required: true,
  },
  side: {
    type: String,
    enum: ['buy', 'sell'],
    required: true,
  },
  price: {
    type: Number, // Optional for market orders
  },
  stopPrice: {
    type: Number, // For stop-limit orders
  },
  amount: {
    type: Number, // Quantity of the base asset
    required: true,
  },
  filled: {
    type: Number, // Amount of the order already filled
    default: 0,
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'canceled'],
    default: 'open',
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
