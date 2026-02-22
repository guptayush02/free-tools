const express = require('express');
const leaderboardController = require('../controllers/leaderboardController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', leaderboardController.getLeaderboard);

// Protected routes
router.get('/user/rank', authMiddleware, leaderboardController.getUserRank);

module.exports = router;
