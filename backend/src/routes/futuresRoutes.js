const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  openPosition, closePosition, 
  getPositions, getPositionHistory,
  getFundingRates, calculateLiquidation
} = require('../controllers/futuresController');

router.get('/positions', protect, getPositions);
router.get('/history', protect, getPositionHistory);
router.post('/open', protect, openPosition);
router.post('/close', protect, closePosition);
router.get('/funding-rates', getFundingRates);
router.get('/liquidation-calc', calculateLiquidation);

module.exports = router;
