const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const gamesController = require('../controllers/gamesController')

// Record a game score (requires auth)
router.post('/score', auth, gamesController.recordScore)

module.exports = router
