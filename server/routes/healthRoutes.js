const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'free-tools-api',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime())
  });
});

// Dedicated lightweight endpoint for uptime pings/cron keep-alive
router.get('/ping', (req, res) => {
  res.status(200).json({
    ok: true,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
