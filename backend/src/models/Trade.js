const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pair: {
    type: String,
    required: true,
    uppercase: true,
  },
  side: {
    type: String,
    enum: ['buy', 'sell'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  fee: {
    type: Number,
    default: 0,
  },
  feeAsset: {
    type: String, // E.g., USDT or BNB
  }
}, { timestamps: true });

module.exports = mongoose.model('Trade', tradeSchema);
