const Wallet = require('../models/Wallet');

// @desc    Get all user wallets
// @route   GET /api/wallet
// @access  Private
const getWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find({ userId: req.user._id });
    res.json(wallets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wallets' });
  }
};

// @desc    Deposit mock funds
// @route   POST /api/wallet/deposit
// @access  Private
const depositFunds = async (req, res) => {
  try {
    const { asset, amount } = req.body;
    
    if (!asset || amount <= 0) {
      return res.status(400).json({ message: 'Invalid asset or amount' });
    }

    const uppercaseAsset = asset.toUpperCase();

    let wallet = await Wallet.findOne({ userId: req.user._id, asset: uppercaseAsset });
    
    if (wallet) {
      wallet.balance += amount;
      await wallet.save();
    } else {
      wallet = await Wallet.create({
        userId: req.user._id,
        asset: uppercaseAsset,
        balance: amount,
      });
    }

    // Emit event to socket logic here if needed
    const { getIo } = require('../sockets/marketSocket');
    try {
      const io = getIo();
      io.to(req.user._id.toString()).emit('balance_update', { deposit: wallet });
    } catch (e) { /* io not init */ }

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: 'Error depositing funds' });
  }
};

module.exports = {
  getWallets,
  depositFunds,
};
