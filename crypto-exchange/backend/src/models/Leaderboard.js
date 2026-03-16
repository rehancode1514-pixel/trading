const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  pnl: { type: Number, default: 0 },
  pnlPercent: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  totalTrades: { type: Number, default: 0 },
  followers: { type: Number, default: 0 },
  rank: { type: Number },
  badge: { type: String, enum: ['🥇', '🥈', '🥉', 'Elite', 'Pro', ''], default: '' },
  period: { type: String, enum: ['daily', 'weekly', 'monthly', 'all-time'], default: 'weekly' },
}, { timestamps: true });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
