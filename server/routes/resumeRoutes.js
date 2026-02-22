const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');

router.post('/upload', resumeController.uploadResume);
router.get('/:resumeId', resumeController.getResumeScore);
router.post('/:resumeId/optimize', resumeController.optimizeResume);

module.exports = router;
