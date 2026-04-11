const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const authMiddleware = require('../middleware/auth');

// Search payee or payer in Invoice collection
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q, type } = req.query; // type: 'payee' or 'payer'
    const userId = req.userId;
    let results = [];
    if (type && ['payee', 'payer'].includes(type)) {
      results = await Invoice.aggregate([
        { $match: { userId, [`${type}.name`]: { $regex: q, $options: 'i' } } },
        { $group: {
          _id: `$${type}.name`,
          name: { $first: `$${type}.name` },
          address: { $first: `$${type}.address` },
          email: { $first: `$${type}.email` },
          companyId: { $first: `$${type}.companyId` },
          bankDetails: { $first: '$bankDetails' }
        }},
        { $limit: 10 }
      ]);
    } else {
      // Always search both payee and payer if type is not provided
      const payeeResults = await Invoice.aggregate([
        { $match: { userId, 'payee.name': { $regex: q, $options: 'i' } } },
        { $group: {
          _id: '$payee.name',
          name: { $first: '$payee.name' },
          address: { $first: '$payee.address' },
          email: { $first: '$payee.email' },
          companyId: { $first: '$payee.companyId' },
          bankDetails: { $first: '$bankDetails' }
        }},
        { $limit: 10 }
      ]);
      const payerResults = await Invoice.aggregate([
        { $match: { userId, 'payer.name': { $regex: q, $options: 'i' } } },
        { $group: {
          _id: '$payer.name',
          name: { $first: '$payer.name' },
          address: { $first: '$payer.address' },
          email: { $first: '$payer.email' },
          companyId: { $first: '$payer.companyId' }
        }},
        { $limit: 10 }
      ]);
      // Merge and deduplicate
      const allResults = [...payeeResults, ...payerResults];
      const seen = new Set();
      results = allResults.filter(r => {
        if (seen.has(r.name)) return false;
        seen.add(r.name);
        return true;
      }).slice(0, 10);
    }
    res.json({ companies: results });
  } catch (err) {
    console.log("Error searching companies:", err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
