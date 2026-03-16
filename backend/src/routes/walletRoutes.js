const express = require('express');
const { getWallets, depositFunds } = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getWallets);
router.post('/deposit', protect, depositFunds);

module.exports = router;
