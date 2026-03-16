const express = require('express');
const { placeOrder, getOpenOrders, getOrderHistory, cancelOrder } = require('../controllers/tradeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/order', protect, placeOrder);
router.get('/orders', protect, getOpenOrders);
router.get('/history', protect, getOrderHistory);
router.delete('/order/:id', protect, cancelOrder);

module.exports = router;
