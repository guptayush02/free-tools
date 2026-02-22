const express = require('express');
const storyController = require('../controllers/storyController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', storyController.getAllStories);
router.get('/:storyId', storyController.getStory);

// Protected routes
router.post('/', authMiddleware, storyController.createStory);
router.post('/add-line', authMiddleware, storyController.addLineToStory);
router.get('/user/my-stories', authMiddleware, storyController.getUserStories);

module.exports = router;
