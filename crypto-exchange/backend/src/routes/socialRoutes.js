const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getLeaderboard, getAdminStats } = require('../controllers/adminController');

router.get('/leaderboard', getLeaderboard);
router.get('/admin/stats', protect, getAdminStats);

module.exports = router;
