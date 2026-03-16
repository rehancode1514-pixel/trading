const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');

// Get leaderboard with period filter
exports.getLeaderboard = async (req, res) => {
  try {
    const { period = 'weekly', limit = 20 } = req.query;
    const entries = await Leaderboard.find({ period })
      .sort({ pnl: -1 })
      .limit(parseInt(limit));
    
    // Add rank
    const ranked = entries.map((e, i) => ({
      ...e.toObject(),
      rank: i + 1,
      badge: i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i < 10 ? 'Elite' : 'Pro',
    }));
    
    res.json(ranked);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: get system stats
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ kycStatus: 'verified' });
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10).select('-password');
    
    res.json({
      totalUsers,
      verifiedUsers,
      pendingKYC: await User.countDocuments({ kycStatus: 'pending' }),
      recentUsers,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Seed mock leaderboard data if empty
exports.seedLeaderboard = async () => {
  const count = await Leaderboard.countDocuments();
  if (count > 0) return;
  
  const mockTraders = [
    { username: 'CryptoWhale', pnl: 48920.5, pnlPercent: 489.2, winRate: 73, totalTrades: 412, followers: 2840, period: 'weekly' },
    { username: 'BitMaster99', pnl: 32100.0, pnlPercent: 321.0, winRate: 68, totalTrades: 287, followers: 1920, period: 'weekly' },
    { username: 'AlphaTrader', pnl: 24750.3, pnlPercent: 247.5, winRate: 71, totalTrades: 198, followers: 1450, period: 'weekly' },
    { username: 'SatoshiMoon', pnl: 19200.8, pnlPercent: 192.0, winRate: 65, totalTrades: 334, followers: 980, period: 'weekly' },
    { username: 'DeFiKing', pnl: 15600.2, pnlPercent: 156.0, winRate: 62, totalTrades: 256, followers: 750, period: 'weekly' },
    { username: 'ETHBull', pnl: 12400.0, pnlPercent: 124.0, winRate: 60, totalTrades: 178, followers: 620, period: 'weekly' },
    { username: 'SolanaRider', pnl: 9800.5, pnlPercent: 98.0, winRate: 58, totalTrades: 143, followers: 490, period: 'weekly' },
    { username: 'AltcoinGuru', pnl: 7200.0, pnlPercent: 72.0, winRate: 55, totalTrades: 220, followers: 380, period: 'weekly' },
    { username: 'ScalpKing', pnl: 5400.3, pnlPercent: 54.0, winRate: 71, totalTrades: 890, followers: 290, period: 'weekly' },
    { username: 'LeverageGod', pnl: 4100.0, pnlPercent: 41.0, winRate: 53, totalTrades: 167, followers: 210, period: 'weekly' },
  ];
  
  const fakeUserId = new (require('mongoose').Types.ObjectId)();
  await Leaderboard.insertMany(
    mockTraders.map(t => ({ ...t, userId: fakeUserId }))
  );
  console.log('Leaderboard seeded with mock data');
};
