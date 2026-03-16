const express = require('express');
const { getMarketTickers, getMarketKlines } = require('../controllers/marketController');

const router = express.Router();

router.get('/tickers', getMarketTickers);
router.get('/klines', getMarketKlines);

module.exports = router;
