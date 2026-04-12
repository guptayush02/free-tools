
const express = require('express');
const router = express.Router();
const { createInvoice, updateInvoice, getUserInvoices, getNextInvoiceNumber, sendInvoiceEmail } = require('../controllers/invoiceController');
const authMiddleware = require('../middleware/auth');

// Require authentication for invoice creation
router.post('/', authMiddleware, createInvoice);

// Update an existing invoice for logged-in user
router.put('/:id', authMiddleware, updateInvoice);

// Send invoice as email
router.post('/:id/send-email', authMiddleware, sendInvoiceEmail);

// Get all invoices for logged-in user
router.get('/my', authMiddleware, getUserInvoices);

// Get next invoice number for logged-in user
router.get('/next-number', authMiddleware, getNextInvoiceNumber);

module.exports = router;
