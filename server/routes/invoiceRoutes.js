
const express = require('express');
const router = express.Router();
const { createInvoice, getUserInvoices } = require('../controllers/invoiceController');
const authMiddleware = require('../middleware/auth');

// Require authentication for invoice creation
router.post('/', authMiddleware, createInvoice);

// Get all invoices for logged-in user
router.get('/my', authMiddleware, getUserInvoices);

module.exports = router;
