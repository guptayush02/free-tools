const Invoice = require('../models/Invoice');

const computeNextInvoiceNumber = (lastInvoiceNumber) => {
  const fallback = 'INV-1';
  if (!lastInvoiceNumber || typeof lastInvoiceNumber !== 'string') return fallback;

  const trimmed = lastInvoiceNumber.trim();
  const match = trimmed.match(/^(.*?)(\d+)$/);

  if (!match) {
    return `${trimmed}-1`;
  }

  const prefix = match[1] || '';
  const numericPart = match[2];
  const nextNumber = String(parseInt(numericPart, 10) + 1).padStart(numericPart.length, '0');

  return `${prefix}${nextNumber}`;
};

exports.createInvoice = async (req, res) => {
  try {
    const { invoiceNumber, payee, payer, bankDetails, items, date, total, currency } = req.body;
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    // companyId is optional for both payee and payer
    const invoice = new Invoice({
      invoiceNumber,
      payee,
      payer,
      bankDetails,
      items,
      date,
      total,
      currency,
      userId
    });
    await invoice.save();
    res.status(201).json({ message: 'Invoice created', invoice });
  } catch (err) {
    console.log('Error creating invoice:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { invoiceNumber, payee, payer, bankDetails, items, date, total, currency } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const invoice = await Invoice.findOneAndUpdate(
      { _id: id, userId },
      { invoiceNumber, payee, payer, bankDetails, items, date, total, currency },
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.status(200).json({ message: 'Invoice updated', invoice });
  } catch (err) {
    console.log('Error updating invoice:', err);
    res.status(400).json({ error: err.message });
  }
};

// Get all invoices for logged-in user
exports.getUserInvoices = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const invoices = await Invoice.find({ userId }).sort({ date: -1 });
    res.status(200).json({ invoices });
  } catch (err) {
    console.log('Error fetching invoices:', err);
    res.status(400).json({ error: err.message });
  }
};

// Get next invoice number for logged-in user
exports.getNextInvoiceNumber = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const latestInvoice = await Invoice.findOne({ userId })
      .sort({ _id: -1 })
      .select('invoiceNumber');

    const invoiceNumber = computeNextInvoiceNumber(latestInvoice?.invoiceNumber);
    res.status(200).json({ invoiceNumber });
  } catch (err) {
    console.log('Error fetching next invoice number:', err);
    res.status(400).json({ error: err.message });
  }
};
