const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

module.exports = router;
